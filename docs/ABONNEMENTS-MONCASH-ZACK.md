# Zack — spécification des abonnements et paiements MonCash

Date de mise à jour : 14 novembre 2026  
Branche de travail : `hardening/phase-1-stabilisation`  
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


## 11. Relecture détaillée des RPC existantes — 14 novembre 2026

Cette relecture porte sur les définitions SQL actuellement déployées, sans les modifier.

### `request_subscription_payment` — comportement observé

1. Vérifie que l'utilisateur est connecté et gestionnaire de l'entreprise.
2. Charge un forfait actif dont le prix est supérieur à zéro.
3. Accepte actuellement `moncash` et `natcash`.
4. Vérifie que la référence contient entre 4 et 60 caractères après trim.
5. Crée une ligne `business_subscriptions` puis une ligne `payments`, et inscrit un événement `submitted_for_review`.
6. Retourne l'identifiant du paiement.

**Écarts confirmés :**
- Ne vérifie pas l'existence d'un destinataire actif pour le fournisseur demandé.
- Ne capture que le montant du forfait ; la durée, le nom/code du plan et le destinataire ne sont pas figés dans le paiement.
- Ne limite pas les demandes en attente par entreprise ; le contrôle d'un seul abonnement actif ne bloque pas plusieurs demandes en attente.
- La référence est trimée, mais aucune normalisation métier plus poussée n'est appliquée.
- La création de l'abonnement et du paiement est dans une même transaction PostgreSQL implicite de fonction : une erreur d'insertion annule l'ensemble.

### `admin_review_payment` — comportement observé

1. Exige `main_admin`.
2. Verrouille la ligne de paiement avec `FOR UPDATE` et n'accepte que le statut `needs_review`.
3. En cas d'approbation, retrouve le plan via l'abonnement associé, expire l'abonnement actif de l'entreprise, puis active la demande et calcule sa date de fin avec la durée actuelle du plan.
4. En cas de refus, annule l'abonnement en attente et marque le paiement `failed`.
5. Ajoute un événement de paiement et une entrée au journal administratif ; tente aussi de notifier le demandeur.

**Points à renforcer avant encaissement :**
- Calculer la durée depuis le snapshot du paiement, jamais depuis le plan modifiable après la demande.
- Vérifier que l'abonnement lié au paiement, son entreprise et le forfait snapshot sont cohérents.
- Définir les règles de renouvellement : la fonction actuelle expire l'abonnement actif avant d'activer le nouveau, ce qui repart de `now()` et ne reporte pas automatiquement le temps restant.
- Gérer explicitement les erreurs de notification sans rendre ambigu le résultat financier ; le statut et l'audit doivent rester atomiques.
- Tester les approbations concurrentes pour une même entreprise et préserver la contrainte d'un seul abonnement actif.
- Ne jamais permettre de rejouer une décision déjà prise : la fonction refuse déjà un paiement qui n'est plus `needs_review`.

### `get_payment_recipients()`

Retourne les destinataires actifs aux utilisateurs authentifiés. Le retour contient fournisseur, libellé et numéro. La fonction ne retourne pas d'identifiant de destinataire ni de clé permettant au frontend de lier une demande à une version précise du compte. Pour le futur parcours, le serveur devra choisir et figer le destinataire ; le client ne doit pas pouvoir imposer un numéro de réception arbitraire.

## 12. Parcours d'interface cible — à construire

### Espace entreprise

- Afficher le forfait actuel et sa date d'expiration.
- Afficher le catalogue des forfaits actifs récupérés depuis la base.
- Après sélection d'un forfait payant, demander au serveur le moyen MonCash actif et afficher le libellé, le numéro et le montant.
- Demander la référence de transaction après le transfert externe.
- Soumettre la demande par RPC ; afficher un état « en attente de vérification » avec une référence Zack.
- Afficher l'historique des demandes et leurs décisions.
- Empêcher les doubles clics côté interface pour l'expérience utilisateur, tout en gardant l'idempotence et les contraintes côté serveur comme vraies protections.

### Administration principale

- Gérer les forfaits et leurs caractéristiques.
- Gérer les comptes MonCash : ajouter, modifier, activer ou désactiver ; un seul destinataire actif pour MonCash.
- Consulter les demandes en attente, le forfait et le montant snapshot, la référence de transaction et le destinataire qui avait été affiché.
- Approuver ou refuser avec une note ; afficher le résultat confirmé par le serveur.
- Consulter un historique non modifiable des changements de forfaits, de destinataires et des décisions de paiement.

Aucune de ces interfaces n'est déclarée existante dans la branche actuelle. Les écrans doivent être construits après la stabilisation des contrats RPC et du modèle de données, et utiliser les fonctions serveur plutôt que des écritures directes sur les tables sensibles.

## 13. Ordre de réalisation recommandé (sans déploiement)

1. Définir les colonnes snapshot et les règles d'idempotence avec compatibilité des lignes historiques.
2. Concevoir la migration additive et ses contraintes : MonCash uniquement, un seul destinataire actif, référence unique selon une règle métier explicite, snapshots immuables.
3. Réviser les RPC de demande et de revue pour consommer les snapshots et vérifier le destinataire côté serveur.
4. Ajouter des tests SQL automatisés des permissions, doubles demandes, références répétées, changement de prix/durée/numéro après demande, refus, approbation et concurrence.
5. Construire l'espace entreprise et l'administration principale sur ces contrats.
6. Tester avec des comptes distincts dans un environnement gratuit de développement.
7. Faire une revue séparée avant toute migration sur le projet Supabase actif.

Cette séquence est une proposition technique. Elle n'autorise ni migration, ni changement de production, ni activation des paiements réels.


## 14. Modèle de snapshots, demandes répétées et renouvellement — proposition technique du 14 novembre 2026

Cette section est une conception préparatoire fondée sur les colonnes réellement inspectées. Elle ne constitue pas une migration et ne modifie pas la base active.

### 14.1 Snapshots immuables

Au moment de la demande, le serveur doit relire lui-même le forfait actif et le destinataire MonCash actif. Il ne doit jamais faire confiance au prix, à la durée, au nom du compte ou au numéro transmis par le navigateur.

Champs proposés sur `payments` :
- `plan_code_snapshot` et `plan_name_snapshot` ;
- `plan_price_htg_snapshot` et `plan_duration_days_snapshot` ;
- `plan_features_snapshot` (JSONB), `plan_max_products_snapshot` et `plan_max_images_per_item_snapshot` ;
- `recipient_id_snapshot` (référence informative si conservée), `recipient_label_snapshot` et `recipient_account_snapshot`.

Les champs déjà existants `amount` et `currency` restent les montants financiers de référence ; ils doivent être égaux au prix et à la devise du snapshot au moment de la création. Le compte destinataire et les conditions tarifaires sont des instantanés historiques : ils ne doivent pas être mis à jour si le catalogue ou le compte change.

Pour que les droits d'un abonnement actif ne changent pas silencieusement lorsqu'un administrateur modifie les avantages du catalogue, conserver également sur `business_subscriptions` les snapshots des conditions accordées : code/nom, durée, fonctionnalités et quotas. Le serveur d'autorisation doit lire les droits accordés à l'abonnement, pas recalculer rétroactivement les droits à partir du catalogue courant.

### 14.2 Prévention des demandes multiples et idempotence

- Imposer en base au plus un paiement `needs_review` par entreprise. Une seconde demande pendant qu'une demande est en attente doit retourner une erreur métier claire ou retourner la demande déjà existante si elle correspond exactement à la même opération ; elle ne doit jamais créer un deuxième abonnement pending.
- Sérialiser les créations concurrentes pour une même entreprise en verrouillant la ligne entreprise (ou par un mécanisme transactionnel équivalent) avant de vérifier la demande en attente et d'insérer les lignes.
- Conserver une unicité forte de la référence de transaction MonCash non nulle. La règle recommandée est de ne pas réutiliser une référence déjà enregistrée, même après refus, afin d'éviter le rejeu d'une preuve. Vérifier les contraintes et les données historiques avant de remplacer l'index partiel actuel.
- Si un identifiant de requête client est ajouté, il doit être unique et vérifié côté serveur ; il complète les contrôles métier mais ne remplace ni le verrou entreprise ni l'unicité de référence.
- La fonction doit vérifier le destinataire MonCash actif avant toute insertion et capturer son identifiant, son libellé et son numéro dans la même transaction.
- Les statuts autorisés et transitions doivent être définis explicitement : `needs_review → succeeded` ou `needs_review → failed`. Une décision finale ne peut pas être rejouée ou inversée par le client. Toute correction administrative ultérieure doit être une opération distincte, justifiée et auditée.

### 14.3 Règle de renouvellement recommandée pour le lancement

Pour éviter de construire immédiatement une gestion complexe de prorata, de crédits et de périodes planifiées :

1. **Première souscription ou entreprise sans période active :** après approbation du paiement, début à l'heure de validation et fin = début + durée snapshot.
2. **Renouvellement du même forfait alors qu'il est encore actif :** prolonger la date de fin de la période active de la durée snapshot ; ne pas remettre la date de fin à `now() + durée`. Le paiement approuvé doit rester relié à une trace d'audit de renouvellement.
3. **Changement vers un autre forfait :** appliquer le nouveau forfait à la date d'approbation, sans prorata ni remboursement du temps restant au lancement. Avant le paiement, l'interface doit avertir clairement que la période restante ne sera pas convertie en crédit.
4. **Forfait Gratuit :** reste accessible sans paiement. Une attribution exceptionnelle ou un changement administratif doit être audité.
5. **Expiration :** l'accès payant doit dépendre de l'état et des dates calculés côté serveur ; le frontend ne peut pas prolonger un abonnement.

La règle 2 peut être implémentée en prolongeant la période active existante et en enregistrant l'opération dans `payments`/`payment_events`, sans créer une deuxième ligne active. Cela respecte l'index unique partiel `business_subscriptions_one_active`. Il faudra toutefois vérifier les requêtes frontend qui lisent l'historique des abonnements avant de figer cette approche. Si l'historique exige une ligne distincte par période, il faudra un statut `scheduled` et un mécanisme serveur fiable d'activation à échéance ; aucun tel mécanisme n'est actuellement confirmé, donc ne pas l'introduire implicitement.

### 14.4 Destinataire unique et audit

- Ajouter un index unique partiel garantissant au plus un destinataire actif par fournisseur ; pour le lancement, seul `moncash` est accepté.
- Toute modification ou désactivation d'un compte destinataire doit produire un événement d'audit sans exposer de secret.
- Le numéro destinataire affiché au payeur doit être exactement celui du snapshot du paiement.
- Ne jamais enregistrer PIN, OTP, mot de passe ou secret marchand.
- Une modification du compte actif ne doit jamais altérer un paiement déjà soumis.

### 14.5 Compatibilité et ordre de réalisation

1. Rechercher toutes les lectures frontend/backend de `business_subscriptions.status`, `starts_at`, `ends_at` et des colonnes de forfait avant de décider la stratégie de renouvellement définitive.
2. Vérifier les contraintes CHECK et triggers réels des statuts avant d'ajouter des valeurs ou colonnes.
3. Écrire les tests SQL de concurrence, répétition, référence dupliquée, modification de plan/destinataire après demande, refus, approbation et renouvellement.
4. Construire une migration additive sur une base de développement gratuite, avec données de test et procédure de rollback.
5. Relire la migration et ses résultats avant toute demande distincte d'autorisation de production.

Aucune migration, écriture SQL, activation de forfait payant ou configuration de destinataire n'a été effectuée.
