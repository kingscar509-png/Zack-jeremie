# Zack — Proposition de modèle de données pour les modules manquants

Date : 12 novembre 2026  
Statut : proposition de conception uniquement — SQL non exécuté.

## Principes de conception

- Réutiliser les tables existantes de Zack ; ne pas recréer profils, entreprises, produits ou notifications.
- Toutes les nouvelles tables dans `public` auront RLS activé dès leur création.
- Les règles d'accès seront limitées aux participants d'une conversation, au client et aux membres autorisés de l'entreprise, ou au propriétaire de l'abonnement.
- Les changements de statut sensibles (commande, abonnement, paiement) ne seront pas librement modifiables par le navigateur.
- Ne pas utiliser `service_role` dans le frontend.
- Pas de PIN, OTP ou mot de passe MonCash stocké.

## A. Messagerie — à intégrer au lancement si l'écran reste activé

### Tables proposées

**`conversations`**
- `id uuid primary key`
- `business_id uuid references businesses(id)`
- `created_by uuid references auth.users(id)`
- `subject text` (facultatif)
- `last_message_at timestamptz`
- `created_at timestamptz`

**`conversation_participants`**
- `conversation_id uuid references conversations(id)`
- `user_id uuid references auth.users(id)`
- `last_read_at timestamptz`
- `archived_at timestamptz` (facultatif)
- clé primaire composée `(conversation_id, user_id)`

**`messages`**
- `id uuid primary key`
- `conversation_id uuid references conversations(id)`
- `sender_id uuid references auth.users(id)`
- `body text`
- `attachment_path text` (facultatif ; fichier dans Storage privé)
- `created_at timestamptz`
- `edited_at timestamptz` (facultatif)
- `deleted_at timestamptz` (suppression logique, facultatif)

### Accès envisagés

- Un utilisateur ne peut lire une conversation que s'il est participant.
- Il ne peut envoyer un message que dans une conversation à laquelle il participe et avec son propre `sender_id`.
- Les utilisateurs ne peuvent pas s'ajouter eux-mêmes à une conversation existante.
- L'ouverture d'une conversation avec une entreprise doit passer par une opération contrôlée qui ajoute le demandeur et un destinataire autorisé de l'entreprise.
- Les pièces jointes ne seront pas publiques par défaut.
- Realtime ne sera activé qu'après validation des politiques d'accès.

## B. Panier et commandes

### Panier

**Proposition :** conserver le panier localement sur l'appareil au premier lancement, sans table dédiée. Cela évite de stocker des paniers abandonnés et permet de lancer le catalogue sans migration supplémentaire. Une synchronisation entre appareils pourra être ajoutée plus tard.

### Commandes

Le prototype montre un formulaire de commande avec nom, téléphone, mode et adresse. Aucune table de commande n'existe actuellement.

**`orders`**
- `id uuid primary key`
- `order_number text unique`
- `business_id uuid references businesses(id)`
- `customer_id uuid references auth.users(id)` (nullable si commande invitée autorisée)
- `customer_name text`
- `customer_phone text`
- `fulfillment_method text` (ex. pickup, delivery)
- `delivery_address text` (nullable)
- `customer_note text` (nullable)
- `status text` (ex. submitted, accepted, preparing, ready, completed, cancelled)
- `currency text`
- `subtotal numeric`
- `created_at timestamptz`
- `updated_at timestamptz`

**`order_items`**
- `id uuid primary key`
- `order_id uuid references orders(id)`
- `product_id uuid references products(id)` (nullable pour conserver la trace si un produit est supprimé ultérieurement)
- `product_name text` (copie historique du nom)
- `quantity integer`
- `unit_price numeric`
- `currency text`
- `line_total numeric`

Les prix et totaux devront être recalculés côté serveur à partir des produits disponibles, jamais acceptés aveuglément depuis le navigateur. Une commande ne constitue pas une preuve de paiement. Selon la décision produit actuelle, aucun paiement de commande en ligne ne sera activé au lancement.

### Accès envisagés

- Le client voit ses commandes.
- Les membres autorisés voient les commandes de leur entreprise.
- Le client ne peut pas modifier lui-même le statut, le prix ou le total après soumission.
- Les changements d'état sont limités aux membres d'entreprise habilités et journalisés.

## C. Abonnements professionnels et MonCash

Le prototype propose notamment Pro Mensuel (1 500 HTG) et National Entreprise (15 000 HTG/an). Ces montants sont ceux affichés dans la maquette et devront être confirmés avant configuration réelle.

### Tables proposées

**`subscription_plans`**
- `id uuid primary key`
- `code text unique`
- `name text`
- `description text`
- `amount numeric`
- `currency text default 'HTG'`
- `billing_interval text` (month, year)
- `is_active boolean`
- `features jsonb`
- `created_at timestamptz`

**`business_subscriptions`**
- `id uuid primary key`
- `business_id uuid references businesses(id)`
- `plan_id uuid references subscription_plans(id)`
- `status text` (pending, active, past_due, expired, cancelled)
- `starts_at timestamptz` (nullable avant validation)
- `ends_at timestamptz` (nullable avant activation)
- `created_at timestamptz`
- `updated_at timestamptz`

**`payment_transactions`**
- `id uuid primary key`
- `subscription_id uuid references business_subscriptions(id)`
- `provider text` (moncash au lancement)
- `provider_reference text unique` (nullable jusqu'à création)
- `merchant_reference text unique`
- `amount numeric`
- `currency text`
- `status text` (initiated, pending, succeeded, failed, cancelled, refunded)
- `provider_payload jsonb` (données strictement nécessaires, expurgées des secrets)
- `verified_at timestamptz` (nullable)
- `created_at timestamptz`
- `updated_at timestamptz`

### Flux MonCash prévu

1. L'utilisateur connecté choisit une offre pour une entreprise qu'il gère.
2. Le serveur relit le plan et le prix dans la base ; il ne fait pas confiance au montant envoyé par le navigateur.
3. Une Edge Function crée une référence marchand unique et initie le paiement via l'API officielle MonCash.
4. MonCash redirige l'utilisateur ; le retour navigateur ne suffit jamais à activer l'abonnement.
5. Le serveur vérifie la transaction auprès de MonCash, vérifie référence, montant, devise et statut, puis enregistre le résultat de façon idempotente.
6. L'abonnement devient actif seulement après vérification serveur réussie.
7. Les échecs et annulations sont conservés dans l'historique sans activer l'abonnement.

Aucun identifiant secret, PIN ou OTP ne sera stocké. Les secrets API seront conservés dans les secrets Supabase Edge Functions.

## D. Index et règles transversales à prévoir

- Index sur `conversation_participants(user_id, conversation_id)`.
- Index sur `messages(conversation_id, created_at)`.
- Index sur `orders(business_id, created_at)` et `orders(customer_id, created_at)`.
- Index sur `order_items(order_id)`.
- Index sur `business_subscriptions(business_id, status)`.
- Index sur `payment_transactions(subscription_id, created_at)`.
- Contraintes positives pour quantité, prix et montant.
- Utiliser des contraintes de statut et devise explicites.
- Ajouter des politiques RLS SELECT/INSERT/UPDATE/DELETE séparées et des tests par rôle ; éviter les politiques génériques permissives.
- Toute modification de statut de paiement doit être réservée au serveur de confiance.

## E. Ce qui ne doit pas être créé maintenant

- Pas de table de panier tant que le panier reste local à l'appareil.
- Pas de paiement de commande en ligne au lancement.
- Pas d'intégration NatCash au premier lancement.
- Pas de confirmation MonCash simulée dans la version de production.
- Pas de table ou colonne qui duplique les données déjà présentes dans `businesses`, `products`, `services`, `posts`, `promotions`, `notifications` ou `profiles`.

## F. Décisions à valider avant d'écrire la migration exécutable

1. Messagerie : autoriser les visiteurs non connectés à envoyer une première demande, ou exiger un compte ?
2. Commandes : activer les demandes de commande dès le lancement, sans paiement en ligne, ou garder le panier uniquement comme démonstration ?
3. Abonnements : confirmer les offres, montants, durées et avantages avant insertion des plans.
4. Identité : confirmer si une commande invitée doit être possible, ou réservée aux utilisateurs connectés.

Aucune requête DDL n'a été exécutée et aucune table n'a été créée par ce document.


## G. Décision validée : premier message autorisé sans compte

Décision utilisateur : **oui, un visiteur sans compte pourra envoyer un premier message à une entreprise.**

Pour éviter d'ouvrir les conversations privées à tous les visiteurs anonymes, je recommande de séparer le premier contact invité de la messagerie privée complète.

### Parcours invité recommandé pour le lancement

1. Le visiteur ouvre la fiche d'une entreprise et choisit « Contacter ».
2. Zack lui demande son nom, son numéro de téléphone et son premier message. L'adresse e-mail peut être facultative.
3. Le formulaire est envoyé à une Edge Function ; le navigateur n'écrit pas directement dans les tables privées.
4. Le serveur valide les champs, applique une limitation anti-spam, vérifie que l'entreprise peut recevoir des demandes et enregistre une demande de contact.
5. Les membres autorisés de l'entreprise consultent la demande dans leur espace professionnel et peuvent contacter le visiteur avec les coordonnées fournies.
6. Pour poursuivre une conversation dans la messagerie Zack, le visiteur devra créer un compte ou se connecter ; la demande initiale pourra alors être rattachée à son compte après une vérification appropriée.

### Table complémentaire proposée : `guest_contact_requests`

- `id uuid primary key`
- `business_id uuid references businesses(id)`
- `guest_name text`
- `guest_phone text`
- `guest_email text` (nullable)
- `initial_message text`
- `status text` (new, contacted, converted, closed, spam)
- `converted_user_id uuid references auth.users(id)` (nullable)
- `created_at timestamptz`
- `updated_at timestamptz`

**Sécurité :** aucune politique RLS ne donnera aux rôles `anon` ou `authenticated` un accès direct général à cette table. L'insertion passera par une Edge Function avec validation, limitation de fréquence et protection anti-robot. La lecture sera réservée aux membres autorisés de l'entreprise et aux administrateurs habilités. Les visiteurs ne pourront jamais lire les demandes d'autres personnes.

Cette option donne aux visiteurs une manière simple de contacter une entreprise sans compte, sans exposer les messages privés ni rendre toute la messagerie accessible publiquement. Une vraie conversation bidirectionnelle dans Zack sans compte nécessiterait un mécanisme supplémentaire de lien sécurisé ou de code à usage limité ; elle n'est pas incluse implicitement dans cette décision.

### Conséquence pour la migration

La table `guest_contact_requests` devra être ajoutée au futur SQL. Elle ne sera créée qu'après revue du SQL complet et accord explicite. Aucune modification de Supabase n'a été exécutée à la suite de cette décision.
