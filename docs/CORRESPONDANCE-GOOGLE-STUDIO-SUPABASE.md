# Zack — Correspondance du prototype Google Studio avec Supabase

Date : 12 novembre 2026  
Source frontend : `google-studio-proposal.html.html`  
Branche : `preparation/phase-1-frontend-plan`

## Objectif

Conserver le design et les parcours du prototype Google Studio, puis remplacer progressivement ses données de démonstration par des lectures et écritures Supabase sécurisées. Ce document est un audit de préparation : il ne modifie ni le schéma Supabase ni le code de l'application.

## 1. Fonctions déjà couvertes par des tables existantes

| Parcours / données du prototype | Objets Supabase existants | État |
|---|---|---|
| Comptes, profil personnel | `auth.users`, `profiles` | Base existante ; vérifier les champs réellement utilisés |
| Entreprises, fiches, localisation, contacts | `businesses`, `business_members` | Base existante |
| Catégories | `categories` | Base existante |
| Horaires d'ouverture | `business_hours` | Base existante |
| Photos et vidéos d'entreprise | `business_media`, Storage `zack-public-media` | Base existante |
| Produits, stock et images | `products`, `product_images`, `product_categories` | Base existante |
| Services | `services` | Base existante |
| Publications | `posts` | Base existante |
| Promotions | `promotions` | Base existante |
| Événements | `business_events` | Base existante |
| Avis et réponses des entreprises | `reviews` | Base existante |
| Favoris | `business_favorites` | Base existante |
| Notifications et préférences | `notifications`, `notification_preferences`, `push_subscriptions` | Base existante |
| Signalements | `reports` | Base existante |
| Statistiques et interactions | `business_stats_events`, `business_interactions`, vue `business_rating_summary` | Base existante |
| Rôles et administration | `admin_roles`, `admin_audit_log`, fonctions RPC admin | Base existante ; sécurité à tester par rôle |
| Paramètres du site | `site_settings` | Base existante |

Toutes les tables publiques inspectées ont RLS activé. Cela ne prouve pas à lui seul que chaque politique est correcte : les accès doivent être testés avec des comptes public, utilisateur, membre d'entreprise et administrateur.

## 2. Fonctions du prototype qui nécessitent encore une conception backend

| Fonction visible dans le prototype | Constat dans le schéma inspecté | Préparation nécessaire |
|---|---|---|
| Messagerie / conversations / messages | Aucune table de conversation ou de message identifiée | Concevoir conversations, participants, messages, pièces jointes et règles d'accès |
| Panier | Aucune table de panier identifiée | Décider si le panier est temporaire côté appareil ou synchronisé au compte |
| Commandes | Aucune table de commande identifiée | Concevoir commandes, lignes, états et coordonnées de livraison/retrait |
| Abonnements professionnels | Aucune table d'abonnement identifiée | Définir plans, périodes, statut, renouvellement et historique |
| Paiements MonCash | Aucune table de transaction identifiée et aucune Edge Function déployée | Prévoir une fonction serveur et un journal de transactions ; ne jamais faire confiance à une confirmation venant du navigateur |
| Paiement NatCash | Non identifié et différé selon la décision produit | À prévoir dans une phase ultérieure, après documentation et accès officiels |

Le prototype contient une simulation MonCash et des données de démonstration. Elle ne doit pas être présentée comme un paiement réel ni être utilisée pour valider un abonnement en production.

## 3. Fonctions PostgreSQL existantes repérées

Fonctions existantes à préserver et à tester : `create_business`, `business_stats`, `is_business_manager`, `is_zack_admin`, `is_main_admin`, `admin_add_admin`, `admin_list_admins`, `admin_remove_admin`, `admin_set_business_status`, ainsi que les fonctions de notifications et d'audit.

Plusieurs fonctions utilisent `SECURITY DEFINER`. Leurs droits, contrôles d'identité et chemins de recherche doivent être vérifiés avant toute extension. Ne pas les remplacer ou les modifier à l'aveugle.

## 4. Edge Functions

L'inventaire effectué le 12 novembre 2026 ne retourne aucune Edge Function déployée dans le projet. Une fonction serveur sera nécessaire pour intégrer MonCash de manière sûre. D'autres fonctions ne seront ajoutées que si un besoin concret le justifie.

## 5. Ordre d'intégration recommandé

1. Cartographier chaque action du prototype et son niveau d'accès.
2. Relier d'abord les écrans aux tables déjà existantes : accueil, recherche, fiche entreprise, profil et espace professionnel.
3. Concevoir et faire valider les migrations pour messagerie, commandes et abonnements, sans les appliquer avant validation.
4. Implémenter les règles RLS et tests de rôles pour chaque nouvelle table.
5. Développer l'intégration MonCash côté serveur, avec référence unique, vérification officielle du paiement, montant et devise, idempotence et journalisation.
6. Remplacer progressivement les données de démonstration du prototype et tester chaque parcours.

## 6. Garde-fous

- Ne pas modifier la branche `main`.
- Ne pas supprimer le prototype ni l'ancienne application de référence.
- Ne pas appliquer de migration à la base de production sans validation explicite du SQL proposé.
- Ne jamais placer la clé `service_role`, un secret MonCash, un PIN ou un OTP dans le frontend.
- Ne pas annoncer une fonction comme opérationnelle avant les tests réels et les tests de permissions.
