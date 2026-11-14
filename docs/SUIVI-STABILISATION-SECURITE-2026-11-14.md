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


## 15. Nuance vérifiée — bootstrap main_admin

L'index Auth `users_email_partial_key` rend l'e-mail unique sur sa valeur stockée, mais il n'est pas insensible à la casse. La fonction de bootstrap compare l'e-mail en minuscules. Le scénario de double attribution n'est pas démontré pour le parcours Auth normal, et la clé primaire `admin_roles.user_id` protège les appels concurrents du même compte. L'unicité globale de `role = 'main_admin'` n'est toutefois pas garantie par la table. Le rapport a été nuancé : ajouter une contrainte unique partielle reste une défense en profondeur ; ne pas présenter le risque de course comme une vulnérabilité exploitée ou prouvée.


## 16. Confirmation CI et complément RLS paiements — 14 novembre 2026

- [x] Vérifié que le workflow `Zack frontend checks` du commit `7a487e924c6d83697324d9318353bcec79f650c9` (run `43624550790`) est terminé avec la conclusion `success`.
- [x] Complété l'audit des policies : forfaits actifs lisibles publiquement ; abonnements et paiements lisibles par le gestionnaire de l'entreprise concernée et `main_admin` ; événements lisibles uniquement par `main_admin` ; destinataires gérés directement uniquement par `main_admin`.
- [x] Confirmé qu'un index unique partiel `business_subscriptions_one_active` impose déjà au plus un abonnement actif par entreprise.
- [x] Confirmé qu'aucune policy d'écriture directe n'a été observée sur les tables d'abonnements/paiements ; le parcours repose sur les RPC dédiées.
- [ ] Ajouter les snapshots et l'unicité du destinataire actif dans une migration additive testée, sans l'appliquer à la base active avant validation et autorisation.
- [ ] Exécuter les tests RLS avec de vrais comptes et sessions, y compris accès interentreprises et révocation.

Le succès CI ci-dessus concerne le HEAD vérifié à cet instant. Les mises à jour documentaires ajoutées ensuite doivent encore passer leur propre run CI. PR #2 reste draft et non fusionnée ; `main` et la base Supabase de production restent inchangées.


## 17. Relecture approfondie des RPC MonCash et conception du parcours — 14 novembre 2026

- [x] Relu la définition réelle de `request_subscription_payment` en lecture seule : gestionnaire requis, plan actif payant, référence 4–60 caractères, création abonnement/paiement/événement dans la même transaction.
- [x] Confirmé que la fonction accepte encore MonCash et NatCash et ne vérifie pas la présence d'un destinataire actif.
- [x] Confirmé que le montant est copié, mais pas le code/nom du plan, sa durée ou le destinataire.
- [x] Confirmé que plusieurs demandes en attente peuvent être créées pour une même entreprise ; l'index existant limite les abonnements actifs, pas les demandes en attente.
- [x] Relu `admin_review_payment` : verrouille le paiement, exige `main_admin`, refuse le rejeu d'une décision déjà traitée, mais utilise la durée courante du plan et fait commencer la période à `now()`.
- [x] Documenté les risques à tester : renouvellement et temps restant, approbations concurrentes, cohérence abonnement/paiement/entreprise, notification et résultat financier.
- [x] Documenté le parcours cible de l'espace entreprise et de l'administration principale, sans prétendre que ces écrans existent déjà.
- [x] Mis à jour la description de PR #2 avec ces constats et les étapes restantes.
- [ ] Concevoir les snapshots, règles d'idempotence, transitions de statut et politique de renouvellement avant d'écrire une migration.
- [ ] Obtenir un résultat CI vérifiable sur le commit documentaire `1743d3d`.
- [ ] Aucun SQL d'écriture, migration ou changement de production effectué.

Le document de référence est `docs/ABONNEMENTS-MONCASH-ZACK.md`. La conception est documentaire uniquement ; aucun paiement réel ne doit être accepté à ce stade.


## 18. Modèle de snapshots et renouvellement — 14 novembre 2026

- [x] Vérifié le schéma réel des cinq tables : aucun champ snapshot de forfait ou de destinataire n'existe encore.
- [x] Confirmé que les prix et durées doivent être figés au moment de la demande et que les droits d'un abonnement actif ne doivent pas dépendre rétroactivement du catalogue modifiable.
- [x] Documenté une règle cible : une seule demande `needs_review` par entreprise, création sérialisée, référence MonCash non réutilisable et vérification du destinataire côté serveur.
- [x] Documenté la règle de renouvellement recommandée : première période à la validation ; renouvellement du même forfait en prolongeant la période active ; changement de forfait immédiat sans prorata au lancement, avec avertissement préalable.
- [x] Préservé l'index unique existant garantissant au plus un abonnement actif par entreprise.
- [ ] Vérifier les lectures frontend des statuts/dates d'abonnement et les contraintes CHECK avant de figer le schéma.
- [ ] Écrire et exécuter les tests SQL sur un environnement de développement gratuit.
- [ ] Préparer une migration additive et un rollback, puis demander une autorisation distincte avant toute action sur la base de production.
- [ ] Construire le parcours frontend entreprise et administration seulement après stabilisation du contrat RPC.

### CI et état de la PR

- [x] Run GitHub Actions `43625298753` sur le HEAD documentaire `4a71e16` : terminé avec succès ; installation, TypeScript, build de production et finalisation du job sont réussis.
- [x] Run `43625257655` sur `1743d3d` : conclusion finale `cancelled` ; il n'est pas compté comme un succès.
- [ ] Vérifier le CI des nouveaux commits documentaires de cette section.

PR #2 reste ouverte, en brouillon, non fusionnée, et conserve sa base `preparation/phase-1-frontend-plan`. La branche `main` et la base Supabase de production restent inchangées. Budget supplémentaire : 0 $.


## 19. Vérification des contraintes CHECK et contrat RPC de renouvellement — 14 novembre 2026

- [x] Vérifié les valeurs réellement autorisées par les contraintes CHECK : abonnements `pending_payment/active/expired/cancelled`, paiements `initiated/pending/needs_review/succeeded/failed/cancelled`.
- [x] Confirmé que les deux tables de fournisseur acceptent encore MonCash et NatCash.
- [x] Vérifié les contraintes de durée (1 à 366 jours), montant positif, devise HTG et unicité du code plan.
- [x] Précisé le contrat RPC : renouvellement du même forfait = paiement rattaché à l'abonnement actif existant et prolongation de sa date de fin ; première souscription/changement de forfait = nouvelle ligne pending, activée après approbation.
- [ ] Refactoriser les RPC et tester les scénarios concurrents avant migration.
- [ ] Inspecter les requêtes d'accès aux abonnements et les règles d'expiration avant de modifier leur modèle.

Le fichier `src/routes/pro.tsx` ne contient actuellement que l'inscription et la liste des entreprises ; aucun parcours de paiement ou d'abonnement n'y est encore implémenté. Aucun statut nouveau ni aucune modification de base n'a été appliqué.


## 20. Harmonisation des décisions produit et CI — 14 novembre 2026

- [x] Corrigé le plan central de lancement : grand lancement public national, modules prêts ouverts à tous et modules incomplets signalés sans simulation.
- [x] Supprimé les anciennes recommandations d'approbation centrale et de quarantaine obligatoire des publications et médias ordinaires.
- [x] Corrigé le plan de tests : les cinq tables d'abonnement/paiement sont présentes ; ce sont les interfaces, snapshots et RPC sûrs qui restent à terminer.
- [x] Harmonisé la matrice RLS : publication directe confirmée, sécurité concentrée sur les rôles, l'appartenance, les clauses UPDATE et l'isolation.
- [x] Harmonisé la matrice des écrans et le plan d'exécution avec les décisions nationales et la publication directe.
- [x] Vérifié deux runs CI sur le HEAD `88e0f31` : `43626233567` (push) et `43626239110` (pull request), tous deux terminés avec succès.
- [ ] Le prochain chantier technique est la refonte des RPC MonCash et les écrans de paiement, après tests de contrat sur environnement de développement gratuit.

Aucune modification de Supabase, aucun paiement, aucune fusion et aucun déploiement n'ont été réalisés. PR #2 reste draft et ouverte ; `main` reste intacte.


## 21. Contrat RPC MonCash et risque de refus de renouvellement — 14 novembre 2026

- [x] Relu les définitions SQL exactes de `request_subscription_payment`, `admin_review_payment` et `get_payment_recipients` en lecture seule.
- [x] Confirmé que la demande crée actuellement toujours une ligne `pending_payment`, même pour un renouvellement.
- [x] Confirmé que le refus annule systématiquement la ligne `subscription_id` liée ; le futur RPC doit impérativement distinguer un abonnement actif d'une demande pending.
- [x] Documenté le contrat cible : renouvellement même plan lié à la ligne active, refus sans effet sur l'abonnement actif, première souscription/changement lié à une ligne pending.
- [x] Documenté les snapshots serveur, le verrouillage de l'entreprise, l'unicité des demandes ouvertes et la sélection serveur du destinataire MonCash.
- [ ] Implémenter et tester les RPC dans un environnement de développement gratuit, avant toute migration de production.

Aucune fonction SQL n'a été modifiée et aucune requête d'écriture n'a été exécutée.


## 22. Page de consultation des abonnements et contrat MonCash V2 — 14 novembre 2026

- [x] Ajouté `src/routes/abonnements.tsx`, route `/abonnements`, en lecture seule.
- [x] Restreint les données de la page aux entreprises dont l'utilisateur est owner/admin ; les requêtes restent soumises à RLS.
- [x] Ajouté un lien depuis l'espace professionnel vers la consultation des abonnements.
- [x] Affiché l'état réel : paiements non ouverts, catalogue Gratuit uniquement, destinataire MonCash non configuré.
- [x] Aucun formulaire d'encaissement, aucune mutation de paiement, aucune écriture Supabase.
- [x] Créé `docs/drafts/CONTRAT-TECHNIQUE-MONCASH-V2.md` avec snapshots, transitions, règles de concurrence et 24 scénarios de test.
- [x] CI run `43627085508` sur le HEAD `ac8c979` : succès complet, installation, TypeScript, build et finalisation.
- [ ] Tests navigateur et tests avec comptes réels (owner/admin/editor/non-membre).
- [ ] Implémentation des RPC V2 et tests automatisés sur base locale/gratuite.
- [ ] Interface de demande de paiement et interface de revue admin, seulement après validation des RPC.

Aucune migration, aucune écriture de production, aucun paiement, aucune branche Supabase payante, aucune fusion et aucun déploiement. `main` reste intacte.


## 23. Contrôle Supabase Advisors — 14 novembre 2026

- [x] Advisors sécurité : 1 fonction SECURITY DEFINER accessible à anon, 23 accessibles à authenticated, protection des mots de passe compromis désactivée.
- [x] Relecture de `business_counts(uuid)` : ne renvoie que les compteurs agrégés d'entreprises vérifiées ; exposition publique potentiellement voulue, aucun retrait automatique.
- [x] Advisors performance : 12 clés étrangères sans index couvrant, 28 index inutilisés signalés, 47 combinaisons de policies permissives multiples.
- [x] Advisors santé : aucun avertissement retourné.
- [x] Ajout des résultats et des décisions de traitement dans le rapport de sécurité.
- [ ] Revue individuelle des fonctions SECURITY DEFINER et activation contrôlée de la protection contre les mots de passe compromis, après validation de l'impact Auth.
- [ ] Audit des policies multiples et index avant toute optimisation.

Aucun droit, policy, index ou paramètre Auth n'a été modifié. Les avertissements Advisors ne sont pas traités comme des vulnérabilités confirmées sans analyse de leur comportement.


## 24. Validation CI du HEAD final — 14 novembre 2026

- [x] HEAD final documentaire : `1fd3e78`.
- [x] Run push `43627253001` : succès complet, installation, TypeScript, build et finalisation.
- [x] Run pull request `43627256502` : succès complet, installation, TypeScript, build et finalisation.
- [x] PR #2 toujours ouverte, draft, non fusionnée et déclarée mergeable par GitHub.
- [ ] Tests navigateur et comptes réels restent à exécuter.
- [ ] RPC MonCash V2, migration et écrans de paiement restent à implémenter sur environnement de développement gratuit.

La réussite CI ne valide pas le fonctionnement avec de vrais comptes ni les permissions RLS en situation réelle.
