# Zack — Proposition SQL des modules manquants (pour revue)

**Date :** 12 novembre 2026  
**Branche :** `preparation/phase-1-frontend-plan`  
**Statut :** BROUILLON OBSOLÈTE — NON EXÉCUTÉ — NE PAS APPLIQUER. Les décisions multi-vendeurs et permissions du 12 novembre 2026 invalident le modèle de commandes de ce document. Consulter impérativement `docs/MODELE-DONNEES-MULTI-VENDEURS-PERMISSIONS.md` avant toute nouvelle proposition SQL.

Ce document prépare les tables absentes identifiées dans le schéma actuel. Il ne modifie aucune table existante et ne contient aucun secret.

## 1. Constat de départ

Les tables `profiles`, `businesses`, `business_members`, `products` et `notifications` existent déjà. Les tables proposées ci-dessous sont limitées aux besoins manquants :

- premier contact d'un visiteur sans compte ;
- conversations privées et messages entre comptes Zack ;
- commandes hors paiement en ligne ;
- offres d'abonnement, abonnements et suivi des transactions MonCash.

Le panier reste local à l'appareil au lancement. NatCash et le paiement en ligne des commandes sont hors périmètre initial.

## 2. Principes de sécurité

- RLS activée sur toutes les nouvelles tables.
- Aucun accès direct `anon` à la table des demandes de contact invité.
- Création d'une demande invitée par Edge Function uniquement, avec validation et limitation anti-spam.
- Création d'une conversation et ajout de participants via une opération serveur contrôlée.
- Aucun client ne peut modifier lui-même un statut de paiement ou activer un abonnement.
- Les commandes sont créées côté serveur afin de recalculer les prix depuis `products`.
- Les tables de paiement ne stockent aucun PIN, OTP, mot de passe ou secret API MonCash.
- Les Edge Functions utiliseront les secrets côté serveur ; jamais la clé `service_role` dans le navigateur.

## 3. Brouillon SQL

> Ce SQL est un support de revue. Il doit encore être confronté aux décisions fonctionnelles finales, testé dans un environnement de développement, puis audité. Il n'a pas été envoyé à Supabase.

```sql
begin;

-- A. PREMIER CONTACT SANS COMPTE
-- Les demandes sont écrites par une Edge Function de confiance.
create table public.guest_contact_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  guest_name text not null check (char_length(trim(guest_name)) between 2 and 120),
  guest_phone text not null check (char_length(trim(guest_phone)) between 6 and 40),
  guest_email text,
  initial_message text not null check (char_length(trim(initial_message)) between 2 and 5000),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'converted', 'closed', 'spam')),
  converted_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index guest_contact_requests_business_created_idx
  on public.guest_contact_requests (business_id, created_at desc);
create index guest_contact_requests_status_idx
  on public.guest_contact_requests (status, created_at desc);

alter table public.guest_contact_requests enable row level security;
-- Aucune policy anon/authenticated : lecture/écriture par Edge Function
-- ou opérations administratives de confiance seulement.


-- B. MESSAGERIE ENTRE COMPTES ZACK
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  subject text,
  created_by uuid not null references auth.users(id) on delete restrict,
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete restrict,
  body text not null check (char_length(trim(body)) between 1 and 10000),
  attachment_path text,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create index conversation_participants_user_idx
  on public.conversation_participants (user_id, conversation_id);
create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at desc);
create index conversations_business_last_message_idx
  on public.conversations (business_id, last_message_at desc);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Lecture d'une conversation : participant uniquement.
create policy "Participants read conversations"
on public.conversations for select to authenticated
using (
  exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversations.id
      and cp.user_id = (select auth.uid())
  )
);

create policy "Users read their participant rows"
on public.conversation_participants for select to authenticated
using (user_id = (select auth.uid()));

create policy "Participants read messages"
on public.messages for select to authenticated
using (
  exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = (select auth.uid())
  )
);

-- L'envoi direct est autorisé seulement si l'expéditeur est participant.
create policy "Participants send their own messages"
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = (select auth.uid())
  )
);

-- Pas de policy INSERT pour conversations/participants :
-- création et ajout de participants par Edge Function contrôlée.
-- Pas de policy UPDATE/DELETE de messages dans ce premier brouillon.


-- C. COMMANDES (sans paiement en ligne au lancement)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  business_id uuid not null references public.businesses(id) on delete restrict,
  customer_id uuid not null references auth.users(id) on delete restrict,
  customer_name text not null check (char_length(trim(customer_name)) between 2 and 120),
  customer_phone text not null check (char_length(trim(customer_phone)) between 6 and 40),
  fulfillment_method text not null
    check (fulfillment_method in ('pickup', 'delivery')),
  delivery_address text,
  customer_note text,
  status text not null default 'submitted'
    check (status in ('submitted', 'accepted', 'preparing', 'ready', 'completed', 'cancelled')),
  currency text not null default 'HTG' check (currency in ('HTG', 'USD')),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (fulfillment_method = 'pickup')
    or (fulfillment_method = 'delivery' and delivery_address is not null
        and char_length(trim(delivery_address)) > 0)
  )
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  currency text not null check (currency in ('HTG', 'USD')),
  line_total numeric(12,2) not null check (line_total >= 0)
);

create index orders_business_created_idx
  on public.orders (business_id, created_at desc);
create index orders_customer_created_idx
  on public.orders (customer_id, created_at desc);
create index order_items_order_idx
  on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Customers read their orders"
on public.orders for select to authenticated
using (customer_id = (select auth.uid()));

create policy "Business members read their orders"
on public.orders for select to authenticated
using (public.is_business_manager(business_id));

create policy "Customers read their order items"
on public.order_items for select to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.customer_id = (select auth.uid())
  )
);

create policy "Business managers read their order items"
on public.order_items for select to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and public.is_business_manager(o.business_id)
  )
);

-- Aucune policy INSERT/UPDATE/DELETE pour le navigateur :
-- Edge Function de création avec recalcul des prix côté serveur ;
-- opération serveur dédiée pour les changements de statut.


-- D. OFFRES D'ABONNEMENT ET ABONNEMENTS
create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'HTG' check (currency in ('HTG', 'USD')),
  billing_interval text not null check (billing_interval in ('month', 'year')),
  is_active boolean not null default false,
  features jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'past_due', 'expired', 'cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index business_subscriptions_business_status_idx
  on public.business_subscriptions (business_id, status);

alter table public.subscription_plans enable row level security;
alter table public.business_subscriptions enable row level security;

create policy "Public can read active subscription plans"
on public.subscription_plans for select to anon, authenticated
using (is_active = true);

create policy "Business managers read their subscriptions"
on public.business_subscriptions for select to authenticated
using (public.is_business_manager(business_id));

-- Pas de policy d'écriture depuis le navigateur pour plans et abonnements.


-- E. TRANSACTIONS MONCASH
create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null
    references public.business_subscriptions(id) on delete restrict,
  provider text not null default 'moncash'
    check (provider in ('moncash')),
  provider_reference text unique,
  merchant_reference text not null unique,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'HTG' check (currency = 'HTG'),
  status text not null default 'initiated'
    check (status in ('initiated', 'pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  provider_payload jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_transactions_subscription_created_idx
  on public.payment_transactions (subscription_id, created_at desc);
create index payment_transactions_status_created_idx
  on public.payment_transactions (status, created_at desc);

alter table public.payment_transactions enable row level security;

create policy "Business managers read their payment transactions"
on public.payment_transactions for select to authenticated
using (
  exists (
    select 1
    from public.business_subscriptions s
    where s.id = payment_transactions.subscription_id
      and public.is_business_manager(s.business_id)
  )
);

-- Aucune policy d'écriture côté client. L'Edge Function vérifie
-- la transaction auprès de MonCash avant de marquer le paiement réussi.


-- Pas d'insertion automatique des plans ici : les offres et montants
-- de la maquette doivent être confirmés par le propriétaire du produit.

commit;
```

## 4. Points à résoudre avant migration

1. **RLS messages :** décider si les utilisateurs peuvent modifier/supprimer leurs messages, et si une entreprise peut avoir plusieurs agents dans une même conversation.
2. **Premier contact invité :** choisir le mécanisme anti-spam (limitation par IP/empreinte côté Edge Function, CAPTCHA ou autre). Ne jamais exposer l'API d'insertion de cette table aux visiteurs.
3. **Commandes :** décision confirmée : un compte Zack est obligatoire pour passer une commande. La colonne `customer_id` est donc obligatoire et liée à `auth.users`. Le nom et le téléphone restent enregistrés comme instantané des coordonnées utilisées au moment de la commande.
4. **Commande serveur :** définir une Edge Function qui vérifie disponibilité, devise, prix et appartenance de chaque produit à la même entreprise, puis calcule les montants.
5. **Abonnements :** confirmer les plans, les prix, les durées, les avantages et les règles de renouvellement. Aucun plan n'est inséré.
6. **MonCash :** obtenir et vérifier les spécifications d'intégration et les accès marchands officiels avant d'écrire l'Edge Function.
7. **Fichiers joints :** créer un bucket privé et ses politiques seulement si la messagerie avec pièces jointes est confirmée.
8. **RLS tests :** ajouter des tests pour visiteur anonyme, utilisateur connecté non participant, participant, membre entreprise, administrateur et serveur de confiance.

## 5. Limites connues de ce brouillon

- Les policies de lecture utilisent la fonction existante `is_business_manager(uuid)`, qui doit être testée pour chaque rôle réel avant mise en service.
- La table `guest_contact_requests` n'a volontairement aucune policy publique. L'Edge Function de réception n'est pas encore écrite.
- Les tables de conversations et participants n'ont pas de policies d'écriture client. Une fonction serveur devra créer la conversation et ses participants de façon atomique.
- Les commandes exigent un compte Zack ; elles ne disposent pas encore de fonctions serveur de création/transition.
- Les tables ont RLS activée mais l'accès via Data API et les privilèges SQL doivent être contrôlés au moment du déploiement.
- Les politiques de ce brouillon sont un premier cadre et pas une certification de sécurité. Elles devront être testées et ajustées avant lancement.

## 6. Historique

- SQL rédigé dans un document de revue sur la branche de préparation.
- Décision confirmée : compte Zack obligatoire pour toute commande ; `orders.customer_id` est non nullable.
- Aucune commande DDL exécutée.
- Aucune migration Supabase appliquée.
- Aucune donnée existante modifiée ou supprimée.


## 7. Avertissement de version — 12 novembre 2026

Après validation de l'option B (achat global et une commande par entreprise), ainsi que des permissions configurables pour la messagerie et les commandes, le SQL de la section 3 ne représente plus le modèle produit validé. En particulier, il ne contient pas `checkout_batches`, ne relie pas les commandes à un achat global et ne contient pas le modèle `business_member_permissions`.

**Ne pas exécuter ce SQL.** Il est conservé uniquement comme historique de la première proposition. La prochaine version SQL devra être reconstruite à partir du document de conception multi-vendeurs, puis revue et testée avant toute demande d'autorisation de migration.
