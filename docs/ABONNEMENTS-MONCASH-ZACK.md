# Zack — spécification des abonnements et paiements MonCash

Date de mise à jour : 14 novembre 2026  
Branche : `preparation/phase-1-frontend-plan`  
Statut : **décisions produit confirmées ; conception technique à finaliser ; aucune migration appliquée.**

Ce document est la référence actuelle pour les prix, la périodicité, le rattachement des abonnements et le parcours MonCash. Les anciennes propositions tarifaires sont historiques et ne doivent pas prévaloir sur cette spécification.

## 1. Tarifs confirmés

Devise : gourde haïtienne (HTG).  
Périodicité : mensuelle uniquement au lancement.

| Code | Nom | Prix mensuel |
|---|---|---:|
| free | Gratuit | 0 HTG |
| pro | Pro | 750 HTG |
| ultra | Ultra | 1 000 HTG |

Ces valeurs sont les tarifs de lancement. Elles ne doivent pas être codées en dur dans le frontend. L'administration principale doit pouvoir modifier les noms, descriptions, prix, avantages, fonctionnalités, quotas, ordre d'affichage et activation des forfaits sans nouvelle version du code.

Aucune facturation annuelle n'est retenue au lancement.

## 2. Rattachement individuel à chaque entreprise

**Décision confirmée : un abonnement appartient à une entreprise, jamais globalement au compte utilisateur.**

- Chaque entreprise possède son propre abonnement, son forfait, son statut, sa date de début, sa date d'expiration et son historique de paiements.
- Un même propriétaire peut gérer plusieurs entreprises.
- Il peut choisir un forfait différent pour chacune.
- Les permissions sont vérifiées à partir de l'appartenance et du rôle de l'utilisateur sur l'entreprise concernée.
- Les abonnements d'une entreprise ne donnent aucun droit sur les données d'une autre entreprise.

Le modèle doit donc rattacher `subscriptions.business_id` à `businesses.id`. Le compte qui initie la demande et l'administrateur qui vérifie le paiement sont enregistrés séparément pour l'audit.

## 3. Comptes de réception MonCash

Écran prévu : **Administration → Paiements → Comptes MonCash**.

L'administrateur principal pourra :
- enregistrer plusieurs comptes de réception ;
- modifier leur libellé et leur numéro ;
- choisir le compte actif pour les nouvelles demandes ;
- désactiver un ancien compte sans effacer son historique ;
- consulter les paiements qui ont utilisé chaque compte.

Un seul compte doit être actif pour les nouvelles demandes à un instant donné. Chaque paiement conserve un instantané du libellé et du numéro destinataire affichés au payeur au moment de la demande. Le changement de compte actif ne modifie jamais les anciens paiements.

Ne jamais enregistrer dans ces tables un PIN, un OTP, un mot de passe MonCash ou un secret marchand. Aucun secret de paiement ne doit être envoyé au navigateur.

## 4. Parcours manuel MonCash au lancement

Tant qu'une intégration officielle MonCash API/webhook n'est pas documentée, configurée et testée, le processus reste manuel :

1. Le propriétaire sélectionne l'entreprise concernée.
2. Il choisit le forfait de cette entreprise.
3. Zack relit le prix courant dans la base et affiche le numéro MonCash actif, le montant et les instructions.
4. Le propriétaire effectue le transfert en dehors de Zack.
5. Il soumet la référence de transaction et, si demandé, un justificatif.
6. Le paiement passe en attente de vérification.
7. Un administrateur habilité contrôle la transaction. Après acceptation, une opération serveur active ou renouvelle l'abonnement. En cas de refus, le motif est conservé et communiqué.

Une capture d'écran, une référence saisie ou un retour navigateur ne constitue pas à lui seul une preuve de paiement. Le client ne peut ni confirmer un paiement ni activer lui-même un abonnement.

Aucun paiement des commandes clients n'est prévu sur Zack au lancement. NatCash est reporté à une phase ultérieure.

## 5. Modèle de données cible à examiner avant migration

Les noms ci-dessous sont des noms de travail. Ils doivent être comparés au schéma réel juste avant toute migration afin d'éviter les doublons.

### `subscription_plans`
Catalogue des forfaits configurables : code, nom, description, montant, devise, périodicité, avantages/fonctionnalités, quotas, ordre d'affichage et statut actif.

### `subscriptions`
Historique des périodes d'abonnement rattachées à une entreprise : `business_id`, forfait, statut, dates de début et de fin, créateur, horodatages et instantané des conditions tarifaires acceptées.

### `moncash_receiving_accounts`
Comptes destinataires : libellé, numéro de réception, état actif/inactif, dates de création et de modification, auteur des changements. Accès de gestion réservé à l'administrateur principal.

### `subscription_payments`
Historique des demandes et vérifications : abonnement, entreprise, référence MonCash, montant, devise, statut, compte destinataire utilisé (instantané du libellé et du numéro), auteur de la demande, vérificateur, dates de soumission et de vérification, motif de refus et chemin du justificatif éventuel.

## 6. Règles d'intégrité et de sécurité à prévoir

- RLS activé sur toutes les nouvelles tables.
- Index sur les clés étrangères et les colonnes de recherche par entreprise, statut et date.
- Contraintes positives sur les montants et périodes valides.
- Référence de transaction protégée contre les doublons.
- Snapshots du forfait, du montant, de la devise, de la périodicité et du compte destinataire conservés pour chaque demande ; les changements ultérieurs de configuration ne réécrivent pas l'historique.
- Les propriétaires et membres autorisés ne consultent que les abonnements des entreprises sur lesquelles ils disposent des droits requis.
- La soumission d'une demande par le client ne peut pas modifier les statuts de vérification ou d'activation.
- La vérification et l'activation sont des opérations serveur contrôlées, atomiques et journalisées.
- Les justificatifs éventuels sont placés dans un bucket privé, avec des politiques d'accès limitées.
- Les comptes MonCash, leurs numéros et les fonctions administratives ne doivent pas être accessibles à un utilisateur ordinaire en écriture.
- Les modifications de forfaits, de prix, de comptes destinataires, les vérifications et les révocations doivent produire des événements d'audit.

Les fonctions `SECURITY DEFINER` ne seront utilisées que si elles sont nécessaires, avec `search_path` sécurisé, vérification explicite de l'identité et des permissions, droits EXECUTE minimaux et tests par rôle. Ne pas révoquer massivement les fonctions existantes.

## 7. Changements de forfait, renouvellement et expiration

Chaque changement doit préserver les périodes et paiements antérieurs. Une nouvelle période ou un changement de forfait doit être enregistré comme une opération distincte et vérifiable.

Les règles de prorata, de remboursement, de crédit de période restante et de délai de grâce ne sont pas activées au lancement tant qu'elles ne sont pas définies. L'expiration doit être calculée et appliquée côté serveur ; le frontend ne décide jamais qu'un abonnement est actif.

Le forfait Gratuit reste disponible à 0 HTG. Une entreprise peut rester gratuite et être présente dans l'annuaire si elle respecte les règles de publication et de vérification de Zack.

## 8. Points techniques avant la migration

1. Refaire un inventaire des tables, vues, fonctions, triggers, policies, grants et index réellement présents.
2. Vérifier qu'aucune table ou fonction d'abonnement n'a été ajoutée depuis le dernier audit.
3. Examiner les relations `businesses` et `business_members` ainsi que les helpers d'administration existants.
4. Définir les transitions de statut, les autorisations précises et les règles d'idempotence.
5. Préparer une migration additive, la relire, puis la tester dans un environnement de développement avant toute application à la base principale.
6. Tester les scénarios propriétaire multi-entreprises, plusieurs forfaits, paiement en doublon, refus, renouvellement, expiration, changement de compte MonCash et accès d'un administrateur non autorisé.

**État au 14 novembre 2026 :** les quatre tables dédiées aux abonnements et paiements ne figurent pas dans l'inventaire actuel des 24 tables publiques. Aucune migration d'abonnement, aucun compte MonCash ni aucun paiement n'a été créé ou activé. Cette spécification ne constitue pas une autorisation de déployer ou de migrer.
