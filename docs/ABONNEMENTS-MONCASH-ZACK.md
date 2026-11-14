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

Le modèle doit donc rattacher `business_subscriptions.business_id` à `businesses.id`. Le compte qui initie la demande et l'administrateur qui vérifie le paiement sont enregistrés séparément pour l'audit.

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

### `business_subscriptions` (table déjà présente)
Historique des périodes d'abonnement rattachées à une entreprise : `business_id`, `plan_id`, statut, dates de début et de fin, créateur et horodatage. Le schéma actuel ne contient pas encore d'instantané des conditions tarifaires acceptées.

### `payment_recipients` (table déjà présente)
Comptes destinataires : fournisseur, libellé, numéro de réception et état actif/inactif. Le schéma actuel ne contient pas d'auteur de modification, de date de mise à jour ni de lien d'historique entre un paiement et le compte destinataire utilisé. RLS réserve la gestion à `main_admin`.

### `payments` (table déjà présente)
Historique des demandes et vérifications : abonnement, entreprise, fournisseur, référence, montant, devise, statut, auteur de la demande, vérificateur, dates de soumission et de vérification, motif de refus. Le schéma actuel ne contient pas encore de snapshot du compte destinataire, de snapshot du forfait/prix ni de chemin de justificatif.

## 6. Règles d'intégrité et de sécurité à prévoir

- RLS activé sur toutes les nouvelles tables.
- Index sur les clés étrangères et les colonnes de recherche par entreprise, statut et date.
- Contraintes positives sur les montants et périodes valides.
- Référence de transaction protégée contre les doublons.
- À ajouter avant l'encaissement réel : snapshots du forfait, du montant, de la devise, de la périodicité et du compte destinataire conservés pour chaque demande ; le schéma actuel ne les stocke pas encore.
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

**État vérifié au 14 novembre 2026 :** le schéma contient déjà `subscription_plans`, `business_subscriptions`, `payments`, `payment_events` et `payment_recipients`. Une seule ligne de forfait existe : `gratuit` à 0 HTG, actif. Aucun destinataire de paiement, abonnement, paiement ni événement de paiement n'est enregistré. Les colonnes de snapshot prévues ne sont pas encore présentes. La fonction de demande accepte encore NatCash et MonCash, alors que le lancement est MonCash uniquement. La fonction de validation est réservée à `main_admin`. Cette spécification ne constitue pas une autorisation de déployer ou de migrer.


## 9. État technique réel vérifié le 14 novembre 2026

Cette section remplace les anciens constats indiquant que les tables de paiement n'existaient pas.

| Table | Présence | Contenu constaté |
|---|---|---|
| `subscription_plans` | Présente | 1 forfait : Gratuit, 0 HTG, actif, durée 30 jours |
| `business_subscriptions` | Présente | 0 ligne ; rattachement entreprise/forfait, statut et dates |
| `payments` | Présente | 0 ligne ; référence, fournisseur, montant, statut, demandeur et vérificateur |
| `payment_events` | Présente | 0 ligne ; journal d'événements lié aux paiements |
| `payment_recipients` | Présente | 0 ligne ; fournisseur, libellé, numéro, actif/inactif |

### Fonctions et permissions vérifiées

- `request_subscription_payment` est une fonction `SECURITY DEFINER` qui vérifie que l'appelant est gestionnaire de l'entreprise et que le forfait actif a un prix supérieur à zéro. Elle accepte encore `moncash` et `natcash`.
- `admin_review_payment` est une fonction `SECURITY DEFINER` qui exige `is_main_admin()`, verrouille la ligne de paiement avec `FOR UPDATE`, puis approuve ou refuse la demande et met à jour l'abonnement, l'événement et le journal d'audit dans la même transaction.
- `get_payment_recipients` retourne les destinataires actifs aux utilisateurs authentifiés. La gestion directe de `payment_recipients` et du catalogue des forfaits est réservée au rôle `main_admin` par RLS.
- Les fonctions utilisent un `search_path` vide. Leurs droits EXECUTE sont limités aux rôles `authenticated`, `service_role` et `postgres` (selon la fonction), sans accès `anon`.

### Écarts à résoudre avant paiement réel

1. Restreindre le fournisseur à MonCash dans la fonction et la contrainte de la table `payments`.
2. Ajouter un snapshot du compte destinataire utilisé par chaque paiement ; aujourd'hui, un changement du compte actif ne peut pas être relié de façon fiable à une demande passée.
3. Ajouter des snapshots du forfait, du prix, de la devise et de la durée acceptés au moment de la demande.
4. Confirmer les règles d'unicité et de gestion d'erreur des références dupliquées. Un index unique partiel existe déjà sur `(provider, proof_reference)` pour les paiements `needs_review` et `succeeded`, ce qui bloque déjà les doublons dans ces états.
5. Vérifier la configuration du destinataire MonCash et les instructions avant d'activer les demandes payantes.
6. Ne pas présenter Pro ou Ultra comme achetables tant que les lignes correspondantes, les snapshots et le parcours de paiement ne sont pas prêts.

Aucune migration ni écriture de données n'a été exécutée pendant cet audit.


### Compléments d'audit — destinataire actif et snapshots (14 novembre 2026)

- `payment_recipients` ne possède actuellement qu'une clé primaire ; aucun index unique partiel ne garantit un seul destinataire actif par fournisseur. La table est vide aujourd'hui, mais cette règle doit être imposée en base avant d'ajouter un compte réel.
- Aucun trigger d'audit ou de mise à jour n'a été trouvé sur `payment_recipients`, `subscription_plans`, `business_subscriptions`, `payments` ou `payment_events`.
- La fonction `get_payment_recipients()` retourne tous les destinataires actifs à tout utilisateur authentifié. C'est cohérent avec l'affichage du moyen de réception à un payeur connecté, mais l'interface doit afficher un seul compte actif pour MonCash.
- `request_subscription_payment` capture le montant courant dans `payments.amount`, mais ne capture pas le nom/code du plan, sa durée, ses avantages ni le compte destinataire choisi.
- `admin_review_payment` calcule la date de fin à partir de la valeur actuelle de `subscription_plans.duration_days` au moment de l'approbation. Si la durée du plan change entre la demande et la validation, l'abonné pourrait recevoir une durée différente de celle qu'il avait choisie.
- Les cinq tables n'ont aucune ligne de paiement/destinataire/abonnement, et aucun plan Pro ou Ultra n'est configuré à ce jour.

Avant d'accepter de l'argent, il faut donc ajouter :
1. un index unique partiel garantissant un seul destinataire actif par fournisseur ;
2. les snapshots du code/nom du forfait, prix, devise, durée et destinataire (libellé + numéro) au moment de la demande ;
3. une validation côté serveur que le destinataire actif est bien celui utilisé ;
4. un audit des changements de compte destinataire et de plan ;
5. des tests qui modifient le prix/la durée/le destinataire après la soumission et vérifient que la demande déjà créée conserve ses conditions d'origine.

Ces points sont bloquants avant encaissement réel, pas avant de poursuivre le développement de l'interface. Aucune modification SQL n'a été appliquée.


## 10. Complément de vérification RLS et contraintes — 14 novembre 2026

- `subscription_plans` : les forfaits actifs sont lisibles par `anon` et `authenticated` ; la gestion complète est réservée à `main_admin`.
- `business_subscriptions` : lecture réservée au gestionnaire de l'entreprise concernée ou à `main_admin`. Aucune policy d'écriture directe n'a été observée ; la création et l'activation passent par les fonctions serveur.
- `payments` : lecture réservée au gestionnaire de l'entreprise concernée ou à `main_admin`. Aucune policy d'écriture directe n'a été observée ; la demande et la revue passent par les RPC dédiées.
- `payment_events` : lecture réservée à `main_admin` ; les événements sont ajoutés par les fonctions serveur.
- `payment_recipients` : gestion directe réservée à `main_admin` par RLS ; l'affichage des destinataires actifs passe par `get_payment_recipients()` pour les utilisateurs authentifiés.
- `business_subscriptions_one_active` garantit déjà au plus un abonnement actif par entreprise. Il faudra conserver ce garde-fou et tester le renouvellement lorsqu'une entreprise a une période active.
- Les index de référence de paiement protègent déjà les références répétées dans les états `needs_review` et `succeeded` ; la règle métier pour une référence après refus/annulation doit rester explicitement définie.

Ces observations décrivent les policies et index actuellement présents. Elles ne remplacent pas des tests d'accès réels avec des sessions de chaque rôle. Aucun SQL d'écriture n'a été exécuté.


### Vérification complémentaire du déclenchement de demande

La fonction `request_subscription_payment` ne vérifie pas qu'un destinataire actif existe pour le fournisseur demandé avant de créer `business_subscriptions` et `payments`. Comme la table `payment_recipients` est actuellement vide, le RPC pourrait enregistrer une demande alors qu'aucun numéro de réception n'est configuré. Avant l'ouverture du parcours payant, la fonction devra vérifier côté serveur la présence d'un destinataire MonCash actif et enregistrer ses coordonnées en snapshot dans la même transaction. L'interface seule ne doit pas porter cette garantie.
