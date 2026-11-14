# Zack — constats de sécurité vérifiés

Date : 14 novembre 2026  
Projet Supabase : `hwuwqalazmrmdxseawnm`  
Méthode : lecture des advisors, du catalogue PostgreSQL et des policies ; aucune écriture exécutée.

## 1. Priorité critique — publication de contenu par les membres d'entreprise

Les tables `posts`, `promotions` et `business_events` possèdent des policies permissives qui autorisent les membres ayant les rôles `owner`, `admin` ou `editor` à insérer et mettre à jour leurs lignes.

Constats vérifiés :
- `posts.is_published` a pour valeur par défaut `false`, mais la policy d'insertion ne limite pas cette colonne ; un membre autorisé peut donc tenter d'insérer une publication avec `is_published = true`.
- `business_events.is_published` a aussi `false` par défaut, mais la policy d'insertion permet au membre d'envoyer explicitement `true`.
- **`promotions.is_active` a pour valeur par défaut `true`**. La policy d'insertion permet à un membre autorisé de créer une promotion déjà active.
- Les policies UPDATE ne séparent pas les champs éditoriaux des champs de publication/activation. Un éditeur autorisé à modifier le contenu peut également demander de modifier l'état de publication.
- Les policies de lecture publique exposent précisément les lignes publiées/actives appartenant à une entreprise vérifiée.

Conséquence : la modération centrale peut être contournée par un membre d'entreprise autorisé à gérer ses contenus. Il s'agit d'un risque de publication non approuvée, pas d'une preuve que des contenus malveillants ont déjà été publiés.

### Correction à préparer

Préparer une migration additive qui :
1. interdit aux membres ordinaires de créer des lignes déjà publiées/actives ;
2. interdit aux membres ordinaires de faire passer une ligne brouillon à publiée/active ;
3. conserve les droits de création et de modification des brouillons pour les rôles autorisés ;
4. réserve les changements de publication à une permission centrale explicite, idéalement via RPC serveur contrôlée ;
5. ajoute des tests RLS positifs et négatifs pour `anon`, membre `editor`, `owner` et administrateur de contenu.

Une policy restrictive peut compléter les policies permissives existantes, mais son expression doit être testée avec le modèle réel de permissions et les flux frontend. Ne pas appliquer cette correction avant d'avoir confirmé les RPC de modération et le comportement des formulaires. Le défaut `is_active = true` des promotions doit être traité en même temps pour éviter de casser l'inscription des brouillons.

## 2. Priorité élevée — initialisation de l'administrateur principal

La fonction `claim_main_admin()` :
- est `SECURITY DEFINER`, avec `search_path` vide ;
- exige une session authentifiée ;
- autorise le bootstrap via une adresse e-mail codée en dur et confirmée ;
- vérifie d'abord qu'aucun rôle `main_admin` n'existe, puis insère le rôle ;
- utilise `ON CONFLICT (user_id) DO NOTHING`, mais aucun index unique partiel sur le rôle `main_admin` n'a été observé dans les constats précédents.

Risque : deux appels concurrents au premier démarrage peuvent tous deux passer la vérification « aucun main_admin » avant l'insertion. La contrainte sur `user_id` ne garantit pas l'unicité du rôle principal entre plusieurs utilisateurs.

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
