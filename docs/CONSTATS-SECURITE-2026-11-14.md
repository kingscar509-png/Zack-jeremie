# Zack — constats de sécurité vérifiés

Date : 14 novembre 2026  
Projet Supabase : `hwuwqalazmrmdxseawnm`  
Méthode : lecture des advisors, du catalogue PostgreSQL et des policies ; aucune écriture exécutée.

## 1. Fonctionnement voulu — publication directe par les membres d'entreprise

**Décision produit confirmée par le propriétaire du projet : les entreprises publient et gèrent directement leurs posts, promotions et événements. Aucun contrôle préalable ni approbation centrale Zack ne doit être ajouté.**

Constats vérifiés :
- Les policies INSERT et UPDATE autorisent les membres ayant les rôles `owner`, `admin` ou `editor` à gérer leurs contenus.
- `posts.is_published` et `business_events.is_published` valent `false` par défaut ; les membres autorisés peuvent publier directement en fournissant `true`.
- `promotions.is_active` vaut actuellement `true` par défaut : une nouvelle promotion peut donc être active immédiatement si le formulaire omet ce champ.
- Les policies de lecture publique filtrent les posts publiés, promotions actives et événements publiés, et exigent une entreprise vérifiée.

**Interprétation corrigée :** la publication directe par les membres autorisés est conforme à la décision produit. Ce n'est pas un défaut de sécurité et aucune migration ne doit ajouter une file d'attente, une approbation Zack ou un blocage des transitions de publication.

La sécurité à maintenir porte sur l'isolation des données et les permissions : un membre ne doit pouvoir créer, modifier ou supprimer que les contenus de son entreprise et uniquement selon son rôle. Il faut tester l'accès croisé entre deux entreprises, la révocation d'un membre et les tentatives d'accès d'un utilisateur sans appartenance. La valeur par défaut `promotions.is_active = true` est cohérente avec une activation immédiate ; elle ne doit pas être changée sans décision produit explicite.


## 2. Priorité élevée — initialisation de l'administrateur principal

La fonction `claim_main_admin()` :
- est `SECURITY DEFINER`, avec `search_path` vide ;
- exige une session authentifiée ;
- autorise le bootstrap via une adresse e-mail codée en dur et confirmée ;
- vérifie d'abord qu'aucun rôle `main_admin` n'existe, puis insère le rôle ;
- utilise `ON CONFLICT (user_id) DO NOTHING`, mais aucun index unique partiel sur le rôle `main_admin` n'a été observé dans les constats précédents.

Nuance importante après vérification des index de `auth.users` : le bootstrap est actuellement limité à une identité e-mail déterminée et l'index `users_email_partial_key` rend l'adresse stockée unique, mais il est sensible à la casse alors que la fonction compare `lower(email)`. Deux identités stockées avec des variantes de casse pourraient donc théoriquement satisfaire le même test normalisé si elles étaient créées hors du parcours Auth habituel. En parallèle, la clé primaire sur `admin_roles.user_id` empêche deux appels du même utilisateur de créer deux lignes. Le scénario de double attribution n'est donc pas démontré en exploitation normale, mais l'invariant « un seul main_admin » n'est pas garanti par la table elle-même.

Correction à préparer : imposer l'unicité du rôle principal au niveau PostgreSQL, rendre le bootstrap atomique et traiter explicitement le conflit concurrent. Vérifier aussi le processus de récupération du rôle principal avant de changer cette fonction.

## 3. Fonctions SECURITY DEFINER — avertissements à examiner, pas à supprimer en masse

L'advisor Supabase du 14 novembre signale :
- 23 fonctions `SECURITY DEFINER` exécutables par `authenticated` ;
- 1 fonction `SECURITY DEFINER` exécutable par `anon` : `business_counts(uuid)` ;
- la protection des mots de passe compromis désactivée.

Les définitions examinées pour `create_business`, `request_subscription_payment`, `admin_review_payment`, `claim_main_admin` et `is_zack_admin` utilisent un `search_path` vide. Plusieurs vérifient également l'identité ou le rôle dans le corps. L'avertissement de l'advisor n'est donc pas une preuve de vulnérabilité pour chacune.

Points particuliers :
- `business_counts(uuid)` est exécutable par `anon` et retourne des agrégats de followers/favoris pour une entreprise vérifiée. Confirmer que cette exposition publique est voulue ; sinon restreindre son exécution.
- Les helpers utilisés dans les policies RLS ne doivent pas être révoqués sans cartographie des dépendances.
- Les fonctions administratives et métiers doivent être testées contre des comptes non autorisés, pas seulement inspectées statiquement.

## 4. Paiements d'abonnement — incohérence fonctionnelle confirmée

La fonction `request_subscription_payment` accepte encore `moncash` et `natcash`, alors que la décision de lancement documentée est MonCash seulement.

Le schéma observé n'a qu'un plan gratuit configuré et aucun destinataire de paiement. Aucun paiement réel ne doit être accepté ni affiché comme possible avant :
- retrait de NatCash du flux de lancement ;
- création des plans approuvés ;
- configuration et vérification du destinataire MonCash ;
- instantanés des conditions du plan et des coordonnées du destinataire ;
- unicité/idempotence de la référence ;
- tests de transitions, approbation, rejet et activation.

## 5. Performance — avertissements non bloquants à prioriser

L'advisor performance observé signale 12 clés étrangères sans index couvrant et 28 index inutilisés. Les index inutilisés ne doivent pas être supprimés automatiquement : les statistiques peuvent être récentes ou incomplètes et certains index servent des parcours rares. Examiner les plans de requête et la fréquence réelle avant toute suppression.

## 6. Paramètres de compte et réseau encore non vérifiés

La protection contre les mots de passe compromis est signalée désactivée. Vérifier l'éligibilité du plan avant activation. Il reste aussi à contrôler dans les paramètres du projet et de l'organisation :
- SSL enforcement ;
- restrictions réseau ;
- MFA du compte propriétaire GitHub/Supabase ;
- confirmation e-mail et expiration des OTP ;
- sauvegardes et capacité de restauration.

Ces paramètres n'ont pas été modifiés.

## 7. Références

- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase — Production security checklist](https://supabase.com/docs/guides/security/production-checklist)
- [Supabase — Database linter: SECURITY DEFINER functions](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
- [Supabase — Leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

## Limites et actions non réalisées

- Aucun SQL DDL/DML exécuté.
- Aucune policy, fonction, ACL, contrainte ou donnée modifiée.
- Aucune configuration Auth, réseau ou SSL modifiée.
- Aucune migration appliquée à la base active.
- Les corrections sont des travaux à préparer, relire et tester dans une base de développement avant proposition de fusion.


## 8. Vérification complémentaire des policies et du bootstrap

Une lecture directe de `pg_policies`, des valeurs par défaut et des définitions de fonctions confirme les points suivants :

- Les policies d'insertion des membres sur `posts`, `promotions` et `business_events` vérifient uniquement l'appartenance et le rôle (`owner`, `admin`, `editor`) ; elles ne vérifient pas la valeur de `is_published` ou `is_active`.
- Les policies d'administration du contenu sont permissives et coexistent avec les policies des membres. Les policies permissives se combinent par OR : ajouter simplement une deuxième policy permissive ne bloquerait donc pas le contournement.
- La valeur par défaut de `promotions.is_active` est bien `true`, contrairement à `posts.is_published` et `business_events.is_published`, qui valent `false` par défaut.
- `request_subscription_payment` vérifie encore explicitement `p_provider` dans `('moncash','natcash')`.
- La fonction `claim_main_admin()` vérifie l'absence d'un rôle `main_admin`, puis insère le rôle ; elle ne prend pas de verrou transactionnel dédié à ce bootstrap.
- Au moment de la vérification complémentaire, un seul enregistrement `main_admin` existe. La table a une clé primaire unique sur `user_id`, mais aucun index unique dédié à la valeur `role = 'main_admin'`.

### Actions pertinentes à préparer (pas encore appliquées)

1. Conserver la publication directe : les membres autorisés doivent pouvoir publier, activer, modifier et désactiver les contenus de leur entreprise sans validation centrale.
2. Tester l'isolation interentreprises et le contrôle de rôle sur INSERT, SELECT, UPDATE et DELETE pour les trois tables.
3. Vérifier que le champ `business_id` ne peut pas être déplacé vers une entreprise dont l'utilisateur n'est pas membre avec un rôle approprié.
4. Protéger l'unicité du rôle `main_admin` par un index unique partiel après contrôle des données existantes, et rendre le bootstrap atomique avec gestion explicite du conflit concurrent.
5. Restreindre `request_subscription_payment` à `moncash` uniquement dans une migration contrôlée, puis tester que `natcash` échoue et que `moncash` reste accepté uniquement pour un gestionnaire autorisé et un plan payant actif.
6. Tester les permissions des rôles `anon`, utilisateur connecté sans appartenance, membre avec lecture seule, editor, owner, admin d'entreprise, administrateur Zack et main_admin. Les tests de publication doivent confirmer le fonctionnement direct attendu, pas le bloquer.

Aucune correction n'a été exécutée sur la base active. La conception et les migrations doivent être validées dans un environnement local gratuit avant toute migration de production.

## 9. Contrôle complémentaire — création et gestion des entreprises

Lecture en mode SELECT des fonctions, policies et triggers le 14 novembre 2026 :

- `create_business(...)` est une fonction `SECURITY DEFINER`, avec `search_path` vide, exécutable par `authenticated`, `service_role` et `postgres` (pas par `anon`). Elle exige `auth.uid()` non nul, vérifie le nom et le format du slug, crée l'entreprise avec le statut `pending`, puis crée l'appartenance `owner` dans le même appel PostgreSQL. L'insertion entreprise + appartenance est donc atomique.
- La fonction utilise des noms de tables qualifiés (`public.businesses`, `public.business_members`) et appelle `auth.uid()` explicitement. Aucun défaut évident de `search_path` n'a été observé dans cette fonction.
- `is_business_manager(uuid)` est aussi `SECURITY DEFINER`, avec `search_path` vide ; elle vérifie l'identité via `auth.uid()` et limite la gestion aux rôles `owner` et `admin`.
- La policy UPDATE des entreprises exige `is_business_manager(id)`. Le trigger `prevent_business_status_change()` bloque un changement de statut par un rôle JWT `authenticated` si l'appelant n'est pas administrateur Zack. Le statut de vérification ne peut donc pas être modifié par un simple owner/admin via le flux UPDATE normal.
- Les policies de `profiles` permettent à un utilisateur connecté d'insérer et modifier uniquement son propre profil ; la policy UPDATE conserve `id = auth.uid()` dans USING et WITH CHECK.
- `business_members` n'expose pas de policy d'insertion ou de modification directe aux membres dans les policies consultées ; l'ajout initial du owner est réalisé dans la fonction contrôlée.

### Limites restantes du parcours d'inscription

- Le champ `city` n'est pas un paramètre de `create_business` : le frontend l'enregistre dans une deuxième requête après la création. Une erreur à cette étape peut laisser l'entreprise créée sans ville. Ce point est déjà documenté dans le suivi de stabilisation.
- Les limites de longueur et validations Zod sont appliquées dans le serveur applicatif, mais la fonction SQL ne reproduit pas toutes ces limites. Un appel RPC direct par un utilisateur authentifié pourrait envoyer des textes plus longs que ceux acceptés par le formulaire. À traiter dans une évolution SQL testée, en complément des contrôles d'isolation et de rôles.
- Aucun test d'inscription avec un vrai compte utilisateur n'a été réalisé dans cette revue ; les constats ci-dessus proviennent de l'inspection statique des définitions et policies.

Conclusion : le flux de création possède plusieurs protections utiles et aucun changement de base n'est justifié à ce stade. Conserver le point de non-atomicité du champ ville comme dette technique, puis prévoir des limites de taille côté SQL pour renforcer la validation au-delà du frontend.


## 10. Vérification approfondie — publication directe confirmée

La lecture en mode SELECT du catalogue PostgreSQL confirme :

- Les policies INSERT et UPDATE des trois tables autorisent les rôles d'entreprise `owner`, `admin` et `editor` sans imposer d'approbation centrale.
- Les policies d'administration Zack coexistent avec les policies des membres ; elles n'empêchent pas la publication directe des membres.
- Les policies de lecture publique filtrent les contenus selon leurs états de publication/activation et l'état de vérification de l'entreprise.
- Aucun trigger de modération préalable ni RPC de validation n'a été trouvé sur `posts`, `promotions` ou `business_events`.

Ces comportements sont compatibles avec la décision produit : **publication directe par les membres autorisés, sans modération préalable**. Aucun garde-fou de validation, policy restrictive, trigger de publication ou changement du défaut `promotions.is_active` ne doit être ajouté.

Travail de sécurité restant pertinent :
1. tester qu'un membre de l'entreprise A ne peut pas lire/modifier/supprimer les contenus privés de l'entreprise B ;
2. vérifier que les rôles autorisés et les rôles en lecture seule ont exactement les droits attendus ;
3. tester qu'après révocation d'un membre, ses anciennes permissions ne fonctionnent plus ;
4. vérifier que la publication directe ne permet pas de modifier le statut de vérification de l'entreprise ;
5. couvrir ces scénarios dans les tests d'intégration RLS.

**Aucune correction n'a été appliquée.** L'interface actuelle ne contient pas encore les écrans frontend de gestion des posts, promotions et événements ; ils devront respecter ce modèle de publication directe.

## 11. Vérification ciblée — bootstrap administrateur et demande de paiement

### Bootstrap du rôle principal

La définition actuelle de `claim_main_admin()` a été relue :

- Fonction `SECURITY DEFINER`, `search_path` vide, exécutable par `authenticated`, `service_role` et `postgres`.
- Refuse les appels sans `auth.uid()`.
- Si un rôle principal existe déjà, renvoie le résultat de `is_main_admin()`.
- Sinon, vérifie l'identité et l'adresse confirmée du compte autorisé au bootstrap, puis insère `main_admin`.
- L'insertion utilise `ON CONFLICT (user_id) DO NOTHING`, mais la table n'a pas de contrainte garantissant qu'un seul utilisateur peut porter `role = 'main_admin'`.

Nuance : le chemin normal de bootstrap n'autorise qu'une identité déterminée et la clé primaire sur `user_id` protège les appels concurrents du même compte. Cependant, l'adresse est comparée en minuscules alors que l'unicité Auth observée porte sur la valeur brute ; aucune contrainte ne garantit à elle seule un seul rôle `main_admin`. Il s'agit d'un durcissement de l'invariant et d'une protection contre les cas limites, pas d'une exploitation concurrente démontrée.

Correction à préparer, sans l'appliquer à chaud :
1. vérifier d'abord les données existantes et les éventuels doublons ;
2. ajouter une unicité PostgreSQL partielle sur les lignes dont `role = 'main_admin'` ;
3. sérialiser le bootstrap avec un verrou transactionnel/advisory lock stable, puis refaire le contrôle après acquisition du verrou ;
4. retourner un résultat cohérent si un autre appel a gagné la course ;
5. tester deux appels simultanés avec le compte autorisé et des comptes non autorisés.

### Demande de paiement d'abonnement

La définition actuelle de `request_subscription_payment(p_business, p_plan, p_provider, p_reference)` confirme :

- Fonction `SECURITY DEFINER`, `search_path` vide, exécutable par `authenticated`, `service_role` et `postgres`.
- Vérifie `auth.uid()` et `is_business_manager(p_business)`.
- Exige un plan actif dont le prix est strictement positif.
- Accepte actuellement les fournisseurs `moncash` et `natcash`.
- Exige une référence non vide de 4 à 60 caractères.
- Crée l'abonnement, la ligne de paiement et l'événement `submitted_for_review` dans la même transaction PostgreSQL.

Le contrôle de rôle et l'atomicité des trois insertions sont positifs. L'incohérence fonctionnelle reste le fournisseur NatCash, alors que la décision de lancement est MonCash uniquement. Une future migration devra restreindre la valeur à `moncash`, puis tester le refus de `natcash`, l'accès d'un non-gestionnaire, le plan gratuit/inactif et la répétition d'une même référence. Vérifier séparément les contraintes d'unicité/idempotence avant d'autoriser les demandes réelles.

**Aucune fonction, contrainte, donnée, ACL ou configuration n'a été modifiée.** Ces deux corrections restent à tester dans un environnement de développement avant toute migration vers la base active.


## 12. Raccordement au frontend — périmètre et décision produit

Inspection de l'arbre des fichiers : aucun écran frontend distinct de création/modification des `posts`, `promotions` ou `business_events` n'est présent dans la branche actuelle.

La décision produit est désormais explicite : les entreprises doivent pouvoir publier directement, sans approbation de l'équipe Zack. Les futurs écrans devront donc :
- permettre aux rôles autorisés de créer et publier immédiatement ;
- permettre de modifier/désactiver leurs propres contenus selon les permissions métier ;
- présenter clairement les états publié/actif ;
- ne pas introduire de statut « en attente de validation Zack ».

La sécurité doit être testée au niveau de l'appartenance à l'entreprise et des rôles, pas par un mécanisme de modération préalable.

**État : modèle produit confirmé ; aucun changement de production ni migration appliquée.**


## 13. Vérification complémentaire — idempotence des paiements et exposition des compteurs

### Paiements

Les colonnes et index ont été inspectés en lecture seule :

- `payments.status` vaut `needs_review` par défaut.
- L'index unique partiel `payments_proof_uq` couvre `(provider, proof_reference)` dès que le statut est `needs_review` ou `succeeded`.
- La fonction `request_subscription_payment` insère une nouvelle ligne de paiement dans l'état par défaut `needs_review`, après insertion de l'abonnement et de l'événement dans la même transaction.
- Par conséquent, deux demandes utilisant le même fournisseur et la même référence sont bloquées par l'index unique, y compris dès la création de la demande. L'index `payments_provider_tx_uq` protège aussi l'identifiant de transaction externe lorsqu'il est renseigné.
- La table `payments` ne contient aucune ligne au moment du contrôle. Les index et contraintes peuvent donc être examinés sans données historiques à migrer.

Conclusion : une protection d'unicité de référence existe déjà ; ne pas ajouter une seconde contrainte redondante. Il reste à vérifier le comportement applicatif lorsqu'une référence dupliquée provoque une erreur SQL, afin d'afficher un message compréhensible et de permettre à l'utilisateur de corriger sa saisie. L'acceptation de NatCash reste une incohérence : la fonction et la contrainte `payments_provider_check` autorisent encore `natcash`.

### Compteurs publics d'entreprise

`business_counts(uuid)` est une fonction SQL `STABLE SECURITY DEFINER`, avec `search_path` vide. Elle retourne seulement le nombre de followers et de favoris pour une entreprise dont le statut est `verified`. Elle est exécutable par `anon`, `authenticated`, `service_role` et `postgres`.

Cette exposition peut être cohérente avec des compteurs publics visibles sur les fiches entreprises ; elle ne retourne pas la liste des utilisateurs ni leurs identifiants. À confirmer dans la spécification d'affichage, mais aucun retrait d'accès n'est recommandé sans preuve que ces compteurs doivent être privés.

### Bootstrap administrateur

Les contraintes confirment que `admin_roles.user_id` est la clé primaire et que le champ `role` accepte `main_admin` ou `admin`. Aucune contrainte unique ne garantit un seul `main_admin`. Le risque de course concurrente identifié en section 11 reste donc à corriger dans une migration contrôlée : unicité partielle sur `role = 'main_admin'` et verrouillage transactionnel dans la fonction de bootstrap.

Aucune écriture SQL, migration ou modification de configuration n'a été exécutée.


## 14. Snapshot Supabase Advisors — 14 novembre 2026

Contrôle relancé après l'ajout de la page de consultation (aucun changement de schéma). Les Advisors sont des avertissements à examiner, pas une autorisation de modifier automatiquement la base.

### Sécurité
- 1 avertissement `anon_security_definer_function_executable` : `business_counts(uuid)`. Le code a été relu : il ne renvoie que les nombres de favoris et d'abonnés d'une entreprise vérifiée, sans identifiants ni liste d'utilisateurs. Cet accès public peut être intentionnel pour les compteurs publics ; ne pas le révoquer sans décision produit.
- 23 avertissements `authenticated_security_definer_function_executable`. Ils doivent être revus individuellement. Plusieurs fonctions d'administration contrôlent déjà `is_main_admin()` ou les permissions métier ; ne pas révoquer globalement `EXECUTE` ni supprimer `SECURITY DEFINER` sans analyser chaque contrat.
- 1 avertissement : protection contre les mots de passe compromis désactivée. Recommandation de l'activer dans Auth ; aucun paramètre de production n'a été modifié.

### Performance
- 12 clés étrangères sans index couvrant.
- 28 index signalés comme inutilisés ; leur suppression n'est pas recommandée sans historique de charge suffisant.
- 47 avertissements de policies permissives multiples. Les combinaisons « contenu public + accès membre + accès admin » peuvent être intentionnelles ; examiner les politiques par table et mesurer avant toute simplification.

### Santé
- Aucun avertissement de santé retourné lors de ce contrôle.

### Décision
Prioriser la protection des mots de passe compromis et l'audit ciblé des fonctions exposées, mais effectuer ces changements uniquement après validation et tests. Ne pas traiter les avertissements de performance comme des vulnérabilités confirmées. Aucun changement de base, de droits, de policy ou de configuration Auth n'a été appliqué.
