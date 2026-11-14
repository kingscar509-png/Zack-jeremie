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
- [x] Confirmer la publication directe par les rôles d'entreprise autorisés, sans approbation centrale ; les tests restants portent sur l'isolation entre entreprises et les limites de rôles.
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


## 10. Revue publication directe — état du 14 novembre 2026

- [x] Policies INSERT/UPDATE, defaults et triggers des tables `posts`, `promotions`, `business_events` inspectés en lecture seule.
- [x] Décision du propriétaire du projet confirmée : publication directe par les rôles autorisés des entreprises, sans approbation Zack.
- [x] Documentation corrigée : aucune file de modération, policy restrictive ou trigger bloquant la publication ne doit être ajouté.
- [ ] Tester l'isolation interentreprises, les rôles editor/owner/admin, la révocation d'un membre et la protection du statut de vérification.
- [x] Aucun changement de production effectué.

Dernier commit documentaire de clarification : `77cbac6`. Le CI de ce commit et des commits documentaires suivants reste à vérifier.


## 11. Vérification des contraintes paiements et rôles admin — 14 novembre 2026

- [x] Confirmé que `admin_roles` a une clé primaire sur `user_id`, mais aucune contrainte unique sur le rôle `main_admin`.
- [x] Confirmé que `payments.provider` autorise encore `moncash` et `natcash`.
- [x] Confirmé l'existence d'un index unique partiel `payments_proof_uq` sur `(provider, proof_reference)`, mais uniquement lorsque le statut est `needs_review` ou `succeeded`.
- [x] Confirmé l'index unique sur `(provider, provider_transaction_id)` lorsque l'identifiant de transaction existe.
- [ ] Vérifier le statut par défaut des paiements et le comportement en cas de demandes simultanées/répétées avant de définir l'idempotence.
- [ ] Préparer une migration contrôlée pour MonCash uniquement, après test de compatibilité des données existantes.
- [ ] Concevoir la protection contre deux revendications concurrentes de `main_admin`.
- [ ] Examiner le caractère public de `business_counts(uuid)` et confirmer que les compteurs followers/favorites d'entreprises vérifiées sont destinés à être publics.


## 12. Confirmation du modèle de publication et revue RLS

- [x] Décision confirmée : publication et activation directes par les membres autorisés, sans approbation Zack.
- [x] Rapport corrigé : suppression des recommandations obsolètes de modération préalable.
- [x] Policies RLS relues pour posts, promotions, événements, entreprises et memberships.
- [x] Les INSERT/UPDATE/DELETE des contenus sont conditionnés à l'existence d'une appartenance au même `business_id` avec rôle `owner`, `admin` ou `editor` ; les lectures membres se limitent à leurs entreprises.
- [x] Les clauses UPDATE `WITH CHECK` réévaluent l'appartenance au `business_id` final, ce qui empêche le transfert vers une entreprise étrangère si l'utilisateur n'y a pas de rôle approprié.
- [x] Le statut de vérification de l'entreprise reste protégé par un trigger qui interdit aux managers ordinaires de le changer.
- [ ] Tester avec de vrais comptes les rôles, révocations, accès croisés et publication directe. La revue SQL statique n'est pas un substitut aux tests RLS en session authentifiée.
- [ ] Préparer ensuite la migration MonCash uniquement et l'unicité du rôle principal administrateur, avec environnement de test gratuit.

Le défaut `promotions.is_active = true` est conservé : il correspond au comportement de publication/activation immédiate décidé pour le produit et ne doit pas être changé sans décision contraire.


## 13. Revue du schéma d'abonnement et de paiement — 14 novembre 2026

- [x] Vérifié les cinq tables déjà présentes : `subscription_plans`, `business_subscriptions`, `payments`, `payment_events`, `payment_recipients`.
- [x] Confirmé qu'un seul plan Gratuit actif existe ; Pro et Ultra ne sont pas encore configurés.
- [x] Confirmé qu'aucun destinataire MonCash, abonnement, paiement ou événement de paiement n'est encore enregistré.
- [x] Vérifié que la fonction de demande vérifie le rôle de gestionnaire de l'entreprise et le plan payant actif, mais accepte encore NatCash.
- [x] Vérifié que la fonction de revue exige `main_admin`, verrouille la ligne du paiement et effectue approbation/refus et journalisation dans une transaction.
- [x] Confirmé l'existence d'un index unique partiel empêchant la réutilisation d'une référence pour les paiements en attente de revue ou réussis.
- [x] Mis à jour `docs/ABONNEMENTS-MONCASH-ZACK.md` pour refléter le schéma réel et les écarts.
- [ ] Ajouter snapshots de plan/prix/durée et du compte destinataire avant encaissement réel.
- [ ] Limiter le fournisseur à MonCash dans la fonction et la contrainte de table.
- [ ] Créer les plans Pro/Ultra et configurer le destinataire après validation des règles et du parcours.
- [ ] Construire l'interface de paiement : aucun fichier frontend correspondant n'existe encore dans la branche.
- [ ] Tester le parcours complet avec comptes de test et faux paiements avant activation.

Aucune donnée de paiement, de compte destinataire ou de plan n'a été ajoutée. Aucune migration n'a été appliquée.


## 14. Revue finale du destinataire MonCash et snapshots

- [x] Confirmé qu'aucun destinataire n'est encore configuré et qu'aucun plan Pro/Ultra n'est actif.
- [x] Confirmé que `payment_recipients` ne garantit pas encore l'unicité d'un compte actif par fournisseur.
- [x] Confirmé qu'aucun trigger d'audit/mise à jour n'est présent sur les tables d'abonnement et paiement inspectées.
- [x] Confirmé que le montant est copié dans `payments.amount`, mais que le nom/code/durée du plan et le compte destinataire ne sont pas conservés comme snapshots.
- [x] Confirmé que la durée d'abonnement est relue depuis `subscription_plans` au moment de l'approbation ; une modification de durée après la demande pourrait donc modifier la période accordée.
- [x] Ajouté ces écarts à la spécification MonCash.
- [ ] Ajouter l'unicité du destinataire actif par fournisseur et les snapshots dans une migration testée.
- [ ] Ajouter l'audit des changements de plan et de destinataire.
- [ ] Bloquer l'encaissement réel tant que ces écarts et le parcours frontend ne sont pas résolus.
