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
- Le gestionnaire de session masque actuellement certaines erreurs de profil/membership en retournant un état déconnecté ; corriger sans casser le contrat des routes.
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
- [ ] Vérifier le build sur le HEAD de la branche de durcissement.
- [ ] Examiner les alertes de dépendances et mettre à jour seulement après tests.
- [x] Régénérer `src/types/database.types.ts` depuis le schéma Supabase réel (14 novembre 2026) ; le build/typecheck du commit généré reste en attente de CI.

### P0 — Sécurité et autorisations
- [ ] Examiner les policies de `posts`, `promotions` et `business_events` pour empêcher la publication non autorisée.
- [ ] Revoir `claim_main_admin` et prévenir toute double attribution concurrente du rôle principal.
- [ ] Revoir chaque RPC SECURITY DEFINER et ses ACL ; préserver les helpers réellement nécessaires à RLS.
- [ ] Tester les rôles anon, client, owner, manager, editor, administrateur et main_admin.
- [ ] Examiner les alertes de policies multiples et clés étrangères sans index, une par une.
- [ ] Vérifier SSL, restrictions réseau, MFA du compte propriétaire, confirmation e-mail et durée des OTP dans les paramètres du projet.

### P1 — Authentification et entreprises
- [ ] Clarifier la différence entre absence de session et erreur de chargement du profil/membership.
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
