# Zack — audit Supabase en lecture seule

Date de vérification : 12 novembre 2026
Projet : projet Supabase Zack relié au frontend historique
Statut : constat technique uniquement — aucune donnée, table, fonction, politique ou configuration n'a été modifiée.

## 1. Périmètre vérifié

- Inventaire des tables du schéma `public`, colonnes et clés étrangères.
- Activation RLS des tables.
- Lecture des politiques RLS (`USING` et `WITH CHECK`).
- Lecture des définitions et ACL des fonctions sensibles en `SECURITY DEFINER`.
- Lecture des avertissements Security et Performance de Supabase.
- Vérification du mode de sécurité de la vue `business_rating_summary`.
- Vérification des noms de clés de `site_settings`, sans lire les valeurs.

## 2. État général observé

- 24 tables publiques inventoriées ; RLS est activé sur chacune des 24.
- La vue `business_rating_summary` est configurée avec `security_invoker=true`.
- Les clés présentes dans `site_settings` sont des paramètres d'interface : announcement, contact, hero, home_sections, logo, site_name, social, subtitle, tagline et theme. Aucune clé évidente de type secret ou token n'a été relevée dans cet inventaire de noms.
- `business_stats_events` est bien présente et reliée aux entreprises et, facultativement, aux produits.
- Les quatre fonctions d'administration demandées sont présentes : `business_stats(uuid, integer)`, `admin_add_admin(text, text[])`, `admin_list_admins()` et `admin_remove_admin(uuid)`.

Cet inventaire confirme la présence des objets, pas la sécurité complète de chaque scénario en production.

## 3. Points de sécurité à traiter

### S1 — Fonction trigger avec droit EXECUTE pour anon

Supabase signale `public.log_admin_content_action()` comme fonction `SECURITY DEFINER` exécutable par `anon`.

Ce que montre son corps :
- elle récupère `auth.uid()` ;
- si l'appelant n'est pas connecté ou n'est pas administrateur Zack, elle retourne sans écrire ;
- elle journalise certaines suppressions et modifications de statut.

Le contrôle interne limite le risque évident, mais le droit EXECUTE accordé à `anon` n'est pas nécessaire pour une fonction déclencheur. Recommandation : retirer le droit d'exécution direct à `anon` et vérifier les droits d'exécution attendus par le propriétaire et les rôles serveur, sans casser les triggers qui l'utilisent.

**Aucune correction n'a été exécutée.**

### S2 — Fonctions SECURITY DEFINER accessibles à authenticated

Supabase signale 12 fonctions accessibles au rôle `authenticated`. Les définitions lues montrent notamment :
- `admin_add_admin` et `admin_remove_admin` exigent `is_main_admin()` ;
- `admin_list_admins` exige `is_main_admin()` ;
- `admin_business_owners` exige `is_zack_admin('businesses')` ;
- `admin_set_business_status` exige une session et `is_zack_admin('businesses')`, valide le statut et journalise le changement ;
- `business_stats` exige une session et l'appartenance à l'entreprise ou le droit admin ;
- `create_business` exige une session, valide le nom et le slug, crée l'entreprise en attente et ajoute l'utilisateur comme propriétaire ;
- `is_business_manager`, `is_main_admin` et `is_zack_admin` sont des fonctions de vérification de droits.

Les fonctions utilisent `SET search_path TO ''`, ce qui est une bonne mesure contre les détournements de search_path. Les contrôles internes observés sont encourageants, mais chaque fonction doit être testée avec des comptes de rôles différents avant d'être considérée comme sûre.

Ne pas révoquer en bloc EXECUTE sur ces fonctions : certaines sont nécessaires aux politiques RLS et aux parcours d'administration.

### S3 — Incohérence de l'initialisation du premier administrateur

La fonction SQL `claim_main_admin()` ne permet la première attribution du rôle principal que pour une adresse e-mail précise, confirmée, et seulement si aucun `main_admin` n'existe déjà.

Le frontend historique contient une constante `ADMIN_EMAIL` différente de l'adresse vérifiée dans la fonction SQL. Cette divergence peut empêcher le parcours d'initialisation attendu. La constante frontend ne doit jamais être une preuve d'autorisation.

Action recommandée : choisir et confirmer l'identité de l'administrateur principal, puis aligner le parcours d'initialisation côté serveur et retirer toute logique de confiance fondée sur une adresse codée dans le navigateur. Ne pas changer le rôle principal sans confirmation explicite.

### S4 — Enregistrement public des événements statistiques

La politique `Anyone can record an event for a verified business` autorise `anon` et `authenticated` à insérer un événement statistique lorsqu'une entreprise est vérifiée.

C'est pratique pour mesurer des visites publiques, mais cela peut être abusé par des robots ou des appels répétés. Les statistiques ne doivent donc pas être considérées comme des mesures uniques ou incontestables.

Actions recommandées :
- limiter les types d'événements acceptés côté serveur ;
- valider la cohérence entre `event_type`, `product_id` et `business_id` ;
- appliquer une protection anti-abus/rate limiting adaptée ;
- dédupliquer ou agréger les événements selon une règle définie ;
- conserver `business_stats_events` comme demandé.

### S5 — Protection des mots de passe compromis

Le conseiller Supabase signale que la protection contre les mots de passe compromis est désactivée. Il est recommandé d'étudier son activation dans Auth, avec un test préalable du parcours d'inscription et de changement de mot de passe.

Aucun réglage Auth n'a été modifié.

## 4. Performance et avertissements à interpréter

- Une clé étrangère de `business_stats_events.product_id` ne dispose pas d'index couvrant signalé par Supabase. Évaluer l'ajout d'un index si les requêtes par produit le justifient.
- Supabase signale 17 index comme inutilisés. Ne pas les supprimer automatiquement : le projet est récent et le volume de données faible ; ces index peuvent devenir utiles après lancement.
- Supabase signale de nombreuses politiques permissives qui se chevauchent. Cela peut coûter en performance, mais le chevauchement n'est pas, à lui seul, la preuve d'un contournement RLS. Les expressions des politiques ont été lues ; les tests d'accès restent nécessaires.

## 5. Contrôles RLS observés positivement

- Les profils ont des politiques de lecture et de modification centrées sur `auth.uid()`, avec une lecture admin distincte.
- Les favoris et préférences de notification sont limités à leur utilisateur.
- Les notifications sont visibles et modifiables par leur destinataire.
- Les avis publics sont limités aux avis approuvés d'entreprises vérifiées ; les avis en attente sont accessibles à leur auteur et aux rôles prévus.
- Les insertions de catégories de produits vérifient que le produit appartient à la même entreprise et que la catégorie est active.
- Les insertions et mises à jour d'images produit vérifient la relation produit/entreprise.
- Les paramètres du site sont lisibles publiquement ; les clés actuellement inventoriées correspondent à des paramètres d'affichage et de contact.

Ces constats sont basés sur les expressions SQL observées et ne remplacent pas des tests avec de vrais rôles.

## 6. Plan de vérification avant utilisation dans le frontend

1. Tester visiteur anonyme, client connecté, membre editor, admin métier, admin contenu, admin principal et utilisateur sans droit.
2. Vérifier les appels directs RPC, pas seulement les boutons masqués dans React.
3. Vérifier qu'un membre d'une entreprise A ne peut ni lire ni modifier les ressources privées d'une entreprise B.
4. Vérifier qu'un éditeur ne peut pas gérer les rôles admin, valider une entreprise ou accéder aux réglages réservés.
5. Vérifier les tentatives de falsification de `business_id`, `product_id`, `user_id`, `status` et `role`.
6. Vérifier les politiques Storage et le bucket `zack-public-media` séparément.
7. Vérifier les triggers d'audit et les doubles écritures signalées dans l'audit historique.
8. Tester les statistiques face aux événements dupliqués et aux insertions anonymes abusives.
9. Vérifier le parcours de premier administrateur avec l'identité confirmée.
10. Générer les types TypeScript depuis le schéma après stabilisation des changements autorisés.

## 7. Décisions de sécurité pour le développement

- Ne pas exposer `service_role`, secrets marchands, PIN MonCash ou OTP.
- Ne pas considérer un e-mail, un champ React ou une route protégée côté client comme une preuve d'autorisation.
- Ne pas retirer `business_stats_events` ni les fonctions admin demandées.
- Ne pas révoquer en masse les droits EXECUTE des fonctions SECURITY DEFINER.
- Toute correction SQL doit être proposée comme migration distincte, expliquée, testable et approuvée avant exécution.
- Aucune migration ni aucun changement Auth/RLS n'a été effectué pendant cet audit.


### S6 — Journal de changement de statut entreprise en double

La lecture des triggers confirme que `businesses` possède un trigger `log_business_status` qui écrit une entrée dans `admin_audit_log` à chaque changement de statut.

La fonction RPC `admin_set_business_status` écrit elle aussi une entrée `business_status_changed` pour le même changement. Lorsque le changement passe par cette RPC, le journal peut donc recevoir deux entrées pour une seule action.

Recommandation : choisir une seule source d'audit pour ce parcours, ou ajouter un mécanisme explicite évitant le doublon. Ne pas supprimer le trigger ni modifier la RPC sans vérifier les autres chemins de changement de statut.

### S7 — Aucun trigger de création de profil observé

Aucun trigger de création automatique de ligne `profiles` n'a été trouvé dans l'inventaire des triggers publics vérifiés.

Or `business_members.user_id` référence `profiles.id`. Une inscription Auth peut donc réussir sans qu'une ligne de profil existe, ce qui risque de faire échouer la création d'entreprise qui ajoute ensuite une ligne dans `business_members`.

Le frontend amorcé vérifie maintenant la présence du profil et le crée pour l'utilisateur connecté avant d'appeler `create_business`. Cette opération reste soumise à la politique RLS de son propre profil. Il faudra aussi tester les inscriptions et confirmations e-mail sur un compte de test.
