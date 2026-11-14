# Zack — suivi d'exécution de la stabilisation et de la sécurité

Date de reprise : 14 novembre 2026  
Branche de travail : `hardening/phase-1-stabilisation`  
Branche source : `preparation/phase-1-frontend-plan`  
Branche de production protégée : `main` (aucune modification)

## Règles de changement

- Travailler exclusivement sur une branche de préparation et proposer les changements par pull request.
- Ne pas fusionner automatiquement vers `main`.
- Ne pas exécuter de migration, de SQL d'écriture, de changement Auth, de changement Storage ou de modification de configuration sur le projet Supabase actif sans revue dédiée et plan de retour arrière.
- Ne jamais ajouter de secret, clé `service_role`, secret marchand, PIN ou OTP au dépôt.
- Une étape n'est considérée terminée qu'après preuve vérifiable : commit, résultat CI, test automatisé ou test manuel documenté.

## État de départ vérifié

- Le frontend est une application React/TanStack Start ; les prototypes HTML autonomes restent des références d'interface, pas le socle de production.
- Le workflow GitHub Actions exécute Node 22, `npm install` et `npm run build`.
- Un ancien run CI a réussi sur un commit antérieur ; le HEAD de départ de la branche de préparation n'avait pas de statut CI confirmé.
- Aucun `package-lock.json` n'a été trouvé dans la branche de départ. Ne pas remplacer `npm install` par `npm ci` avant d'avoir généré, vérifié et versionné le lockfile.
- Les fichiers `src/features/auth/auth.functions.ts` et `auth.server.ts` ont le même contenu observé. Leur éventuelle fusion nécessite d'abord une recherche d'import complète et des tests.
- Le chargement du compte distingue maintenant une session absente d'une erreur d'authentification ou de lecture du profil/membership ; les routes Profil et Espace professionnel affichent un état d'indisponibilité explicite.
- Le projet Supabase observé en lecture seule contient 38 tables publiques avec RLS activée, 27 migrations et aucune Edge Function déployée.
- Les tables de messagerie, commandes et abonnements existent, mais les interfaces, politiques et parcours ne sont pas tous terminés ni testés.
- Les plans payants et destinataires MonCash ne sont pas encore configurés ; NatCash est encore accepté par une fonction RPC malgré la décision de lancement MonCash seulement.
- Les politiques de publication, le bootstrap de l'administrateur principal, les RPC SECURITY DEFINER et les alertes Advisors doivent être revus individuellement.
- La protection des mots de passe compromis est signalée désactivée ; vérifier l'éligibilité et les paramètres avant tout changement.

## Plan d'exécution

### P0 — Sécuriser la base de travail
- [x] Créer une branche de durcissement distincte de `main`.
- [x] Marquer les deux documents d'audit du 12 novembre comme historiques lorsqu'ils contredisent l'inventaire actualisé.
- [ ] Ajouter un lockfile reproductible et faire passer le workflow à `npm ci`.
- [ ] Vérifier le build sur le HEAD de la branche de durcissement (un run est en cours après les derniers changements auth/formulaires).
- [ ] Examiner les alertes de dépendances et mettre à jour seulement après tests.
- [x] Régénérer `src/types/database.types.ts` depuis le schéma Supabase réel (14 novembre 2026) ; le workflow GitHub Actions `43621569386` a réussi sur le commit de génération `5edb9a9` (installation, build et typecheck).

### P0 — Sécurité et autorisations
- [ ] Examiner les policies de `posts`, `promotions` et `business_events` pour empêcher la publication non autorisée.
- [ ] Revoir `claim_main_admin` et prévenir toute double attribution concurrente du rôle principal.
- [ ] Revoir chaque RPC SECURITY DEFINER et ses ACL ; préserver les helpers réellement nécessaires à RLS.
- [ ] Tester les rôles anon, client, owner, manager, editor, administrateur et main_admin.
- [ ] Examiner les alertes de policies multiples et clés étrangères sans index, une par une.
- [ ] Vérifier SSL, restrictions réseau, MFA du compte propriétaire, confirmation e-mail et durée des OTP dans les paramètres du projet.

### P1 — Authentification et entreprises
- [x] Clarifier la différence entre absence de session et erreur de chargement du profil/membership.
- [ ] Rendre la création d'entreprise atomique avec la localisation, ou prévoir une reprise fiable.
- [ ] Vérifier la duplication des modules auth et leurs imports avant toute suppression.

### P1 — Abonnements et MonCash
- [ ] Aligner le RPC sur MonCash seulement pour le lancement.
- [ ] Définir les snapshots de forfait et de coordonnées de destination.
- [ ] Définir l'idempotence des références de transaction et les transitions d'état.
- [ ] Ajouter les plans Gratuit, Pro (750 HTG) et Ultra (1 000 HTG) uniquement après validation du modèle.
- [ ] Prévoir l'attribution administrative d'un forfait offert, avec audit et révocation.
- [ ] Ne pas activer l'encaissement réel avant vérification du marchand et recette complète.

### P1 — Fonctionnalités produit
- [ ] Construire les interfaces de messagerie et tester l'isolation entre entreprises.
- [ ] Finaliser le modèle de checkout multi-vendeurs avant de connecter le panier.
- [ ] Finaliser les transitions, l'historique et les preuves de livraison avant d'activer le module.
- [ ] Désactiver/étiqueter les modules non prêts plutôt que montrer des données simulées.

### P2 — Lancement national
- [ ] PWA, médias privés/publics, optimisation mobile et connexions lentes.
- [ ] Tests navigateur, Android, accessibilité, sécurité, charge, sauvegardes et restauration.
- [ ] Domaine, confidentialité, support, monitoring et procédure d'incident.
- [ ] Recette de lancement avec critères Go/No-Go documentés.

## Journal de cette reprise

- Branche créée depuis `preparation/phase-1-frontend-plan`.
- Deux documents historiques annotés pour éviter d'utiliser des constats de schéma périmés.
- Aucun changement appliqué à `main`.
- Aucun SQL d'écriture, migration, changement de paramètre Supabase, déploiement ou paiement réel exécuté.
- Les tâches non cochées restent à faire ; ce document ne constitue pas une déclaration de conformité ou de sécurité complète.


## 9. Suite des corrections frontend — gestion des erreurs réseau

- Les formulaires Profil et Inscription d'entreprise utilisent désormais `try/catch/finally` : le bouton d'envoi est libéré même si la requête échoue et un message utilisateur est affiché.
- En cas d'erreur pendant la création d'entreprise, le message demande de vérifier la liste des entreprises avant de renvoyer la demande, car le résultat serveur peut être incertain.
- Le RPC `create_business` a été relu en lecture seule : il insère l'entreprise et son propriétaire dans une seule transaction PostgreSQL, mais ne prend pas la ville en argument. Le code frontend enregistre donc la ville par une mise à jour séparée après le RPC. Ce parcours n'est pas atomique pour la ville ; une migration contrôlée serait nécessaire pour intégrer la ville au RPC. Aucun changement SQL n'a été appliqué.
- Le run CI `43622633127` est en cours pour le commit des correctifs de gestion réseau. Aucun succès n'est revendiqué avant sa conclusion.


## 10. Revue publication — état du 14 novembre 2026

- [x] Policies INSERT/UPDATE, defaults, fonctions de modération et triggers des tables `posts`, `promotions`, `business_events` inspectés en lecture seule.
- [x] Confirmé qu'aucune RPC dédiée de modération/publication ni trigger de protection de transition n'existe actuellement sur ces tables.
- [x] Confirmé que les écrans frontend de gestion de posts/promotions/événements ne sont pas présents dans l'arbre source actuel ; le parcours de soumission/approbation reste donc à définir avant migration.
- [x] Ajouté les constats et la décision de conception à préparer dans `docs/CONSTATS-SECURITE-2026-11-14.md` (section 12).
- [ ] Concevoir et tester le parcours de modération complet avant d'écrire une migration.
- [ ] Ne pas modifier la base de production : les valeurs par défaut, policies et triggers restent inchangés.

Dernier commit documentaire : `a16ef9f20fe0d2fdf256b7f95aabae08d29ef2b4`. Le CI du commit précédent `530c24c` est réussi ; le nouveau commit documentaire doit encore être vérifié séparément.
