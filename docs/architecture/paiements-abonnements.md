# Paiements et abonnements Zack

Dernière mise à jour : 15 novembre 2026

## Décision produit

- Les commandes ne sont pas encaissées par Zack. Le client et le vendeur conviennent du paiement directement entre eux, hors plateforme.
- Les abonnements des entreprises sont payés directement au propriétaire de Zack, au choix par MonCash ou NatCash.
- Le paiement d'un abonnement est vérifié manuellement par l'administrateur principal. Une référence saisie par l'entreprise ne constitue jamais une preuve automatique de réception.
- Aucun PIN, OTP ou mot de passe mobile money ne doit être demandé ni stocké par Zack.

## Parcours prévu pour un abonnement

1. L'entreprise sélectionne un forfait payant.
2. Zack affiche le numéro actif du fournisseur choisi (MonCash ou NatCash), le bénéficiaire et le montant en HTG.
3. L'entreprise effectue le transfert depuis son propre service mobile money.
4. Elle soumet la référence de transaction dans Zack.
5. L'administrateur vérifie le mouvement sur son compte MonCash/NatCash.
6. L'administrateur approuve ou refuse la demande.
7. En cas d'approbation, Zack active le forfait et calcule sa date d'expiration.

## Backend Supabase

Le projet Supabase contient déjà les tables et fonctions de base :

- `payment_recipients` : numéros de réception configurés par fournisseur.
- `subscription_plans` : forfaits et tarifs en HTG.
- `business_subscriptions` : statut et période de validité des abonnements.
- `payments` et `payment_events` : demandes de paiement et journal d'événements.
- `get_payment_recipients()` : expose uniquement les numéros actifs aux utilisateurs connectés.
- `request_subscription_payment(...)` : crée une demande de paiement pour un forfait payant.
- `admin_review_payment(...)` : permet à l'administrateur principal de confirmer ou refuser une demande.

Les fournisseurs acceptés sont `moncash` et `natcash`. La migration Supabase `20261115135049_manual_subscription_payments_hardening` ajoute :
- une unicité des références par fournisseur, sans réutilisation après un refus ;
- une seule demande de paiement ouverte par entreprise ;
- un seul numéro de réception actif par fournisseur ;
- des contrôles supplémentaires et un verrouillage par entreprise lors de la validation administrative.

## Configuration encore nécessaire

- Ajouter le numéro de réception MonCash et son libellé.
- Ajouter le numéro de réception NatCash et son libellé.
- Créer/configurer les forfaits payants et leurs tarifs/durées.
- Connecter l'interface entreprise et l'interface administrateur aux RPC Supabase.
- Tester le parcours avec des données de test avant toute activation publique.

## État du frontend GitHub

Le dépôt contient actuellement les fichiers HTML `index.html` et `index1.html`. Le parcours d'abonnement présent dans `index1.html` est encore un aperçu local : il n'appelle pas Supabase et ne doit pas être présenté comme un paiement opérationnel tant que la connexion Auth/RPC n'a pas été intégrée et testée.
