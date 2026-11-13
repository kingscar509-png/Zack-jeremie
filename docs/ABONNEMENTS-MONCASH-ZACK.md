# Zack — spécification initiale des abonnements et paiements MonCash

Date : 13 novembre 2026  
Branche : `preparation/phase-1-frontend-plan`  
Statut : décisions tarifaires confirmées ; modèle de rattachement à confirmer avant migration SQL.

## 1. Tarifs initiaux confirmés

Devise : gourde haïtienne (HTG).  
Périodicité : mensuelle.

| Code | Nom | Prix initial | Période |
|---|---|---:|---|
| free | Gratuit | 0 HTG | Mensuelle |
| pro | Pro | 750 HTG | Mensuelle |
| ultra | Ultra | 1 000 HTG | Mensuelle |

Ces prix sont les valeurs initiales, pas des constantes codées dans le frontend. L'administrateur principal doit pouvoir modifier depuis l'administration :
- nom et description de la formule ;
- prix et devise ;
- période ;
- avantages/fonctionnalités inclus ;
- ordre d'affichage ;
- activation/désactivation.

Les modifications tarifaires ne doivent pas modifier rétroactivement les paiements ou abonnements déjà enregistrés : chaque achat conserve un instantané du nom de la formule, du prix, de la devise et de la période acceptés au moment de la demande.

## 2. Gestion des comptes de réception MonCash

Écran d'administration prévu : **Administration → Paiements → Comptes MonCash**.

Fonctions attendues :
- ajouter plusieurs comptes de réception ;
- modifier le libellé et le numéro ;
- activer un seul compte à la fois pour les nouveaux paiements ;
- désactiver un compte sans effacer l'historique ;
- réserver la gestion à l'administrateur principal ;
- afficher au payeur le numéro actuellement actif et les instructions de paiement.

Chaque paiement conserve une copie du libellé et du numéro de réception utilisés au moment de sa création. Changer le compte actif ne modifie donc jamais les anciens paiements.

Ne jamais enregistrer un PIN, un OTP ou un secret marchand dans les tables accessibles au frontend.

## 3. Parcours de paiement de départ

Tant qu'une intégration officielle MonCash API/webhook n'est pas documentée et configurée :
1. Le client choisit une formule payante.
2. Zack affiche le prix HTG et le compte MonCash actif.
3. Le client effectue le dépôt hors de Zack.
4. Le client saisit la référence de transaction et, si nécessaire, transmet un justificatif.
5. Le paiement passe au statut « en attente de vérification ».
6. Un administrateur habilité vérifie la transaction dans l'interface d'administration.
7. Après vérification, le serveur active ou renouvelle l'abonnement et enregistre l'échéance.
8. En cas de refus, le motif est conservé et communiqué au client.

Une capture d'écran, un formulaire envoyé ou une redirection ne constitue jamais à elle seule une preuve de paiement. L'activation doit dépendre d'une vérification autorisée.

## 4. Données à prévoir (schéma à concevoir)

- `subscription_plans` : catalogue des formules et tarifs configurables.
- `moncash_receiving_accounts` : comptes de réception, avec un seul compte actif.
- `subscriptions` : historique des abonnements et périodes de validité.
- `subscription_payments` : demandes de paiement, références, montants, statuts, vérificateur, horodatages et instantanés du tarif et du compte destinataire.

Les tables devront avoir RLS activée, des permissions minimales, des index adaptés et des contraintes contre les références de transaction dupliquées. Les opérations privilégiées devront être validées côté serveur. Les reçus et justificatifs, s'ils sont acceptés, seront conservés dans un stockage privé.

## 5. Permissions prévues

- Visiteur : consulter uniquement les formules publiées et le numéro de réception actif nécessaire au paiement.
- Client connecté : créer et consulter ses propres demandes et paiements ; aucune possibilité de confirmer soi-même un paiement ou d'activer un abonnement.
- Administrateur principal : gérer les formules, les comptes de réception et les vérifications de paiement.
- Autres administrateurs : aucun droit sur les comptes MonCash ni sur les prix par défaut, sauf décision explicite ultérieure.
- Serveur : confirmer les opérations après authentification, contrôle des droits et validation des données.

La table `site_settings` existante est lisible publiquement ; elle ne doit donc pas recevoir de secrets, de PIN, d'OTP ou de clés privées.

## 6. Points à trancher avant la migration

**Rattachement de l'abonnement :** déterminer si une formule Pro/Ultra est achetée pour chaque entreprise (chaque fiche entreprise dispose de son propre abonnement) ou pour le compte utilisateur (une formule couvre toutes les entreprises gérées par ce compte). Ce choix modifie les clés étrangères, les règles RLS et les écrans concernés.

**Intégration MonCash :** obtenir les informations officielles du compte marchand et la documentation/API disponible avant de promettre une confirmation automatique. Le premier parcours peut fonctionner en dépôt avec référence et validation manuelle.

Aucune migration de base de données ni activation de paiement n'est réalisée par ce document.
