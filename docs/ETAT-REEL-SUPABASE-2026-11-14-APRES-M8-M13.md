# Zack — complément d'audit Supabase après migrations m8 à m13

Date : 14 novembre 2026
Branche de référence du dépôt : `preparation/phase-1-frontend-plan`
Projet Supabase : `hwuwqalazmrmdxseawnm`
Méthode : inspection GitHub et requêtes SQL en lecture seule.
Statut : aucun changement de base, aucune migration, aucun déploiement, aucune modification de `main`.

## 1. Correction de l'état historique

Les audits précédents qui indiquaient 24 tables, 21 migrations et l'absence de messagerie, commandes et abonnements décrivent l'état antérieur aux migrations m8 à m13. Ils ne décrivent plus l'état observé le 14 novembre après leur application.

État actuel observé :
- 38 tables dans le schéma `public` ;
- RLS activée sur les 38 tables ;
- 27 migrations enregistrées, jusqu'à `20261114124326_m13_subscriptions_payments` ;
- aucune Edge Function déployée ;
- PostgreSQL 17.11, projet actif et sain.

Tables ajoutées/confirmées depuis l'ancien inventaire : `geo_units`, `business_follows`, `business_subscriptions`, `business_delivery_zones`, `couriers`, `conversations`, `messages`, `orders`, `order_items`, `payment_events`, `payment_recipients`, `payments`, ainsi que les autres tables de notifications et de gestion déjà intégrées au total de 38.

## 2. Abonnements et paiements : état réel

Tables présentes :
- `subscription_plans`
- `business_subscriptions`
- `payment_recipients`
- `payments`
- `payment_events`

Comptages lus au moment de l'audit :
- forfaits : 1 ;
- abonnements : 0 ;
- paiements : 0 ;
- comptes destinataires : 0.

Le seul forfait présent est `gratuit`, à 0 HTG. Les forfaits payants Pro (750 HTG/mois) et Ultra (1 000 HTG/mois), décidés dans la spécification produit, ne sont pas encore configurés dans la base. Aucun compte MonCash destinataire n'est enregistré. Il ne faut donc pas afficher un parcours de paiement comme disponible en production.

### Écarts entre le schéma et la spécification produit

1. `request_subscription_payment` accepte actuellement `moncash` et `natcash`, alors que la décision produit au lancement réserve le paiement d'abonnement à MonCash et reporte NatCash. Corriger ce point dans une migration/function reviewée avant activation.
2. `business_subscriptions` conserve le forfait, le statut et les dates, mais ne contient pas encore les informations d'origine et d'attribution nécessaires aux accès offerts, notamment l'administrateur auteur, le motif, la révocation et la distinction payé/offert.
3. `payments` conserve le montant et la référence fournis, mais aucun instantané des coordonnées du compte destinataire n'a été observé. Le changement futur de destinataire doit préserver le numéro et le libellé qui étaient affichés lors de la demande.
4. Le modèle actuel ne conserve pas encore un instantané complet des conditions du forfait (nom/code, avantages, quotas, prix et périodicité) au moment de l'achat.
5. Le flux de demande ne démontre pas encore l'unicité/idempotence d'une référence de transaction MonCash. À définir et tester avant de recevoir des paiements réels.
6. La fonction `admin_review_payment` n'autorise actuellement que `is_main_admin()`. Le rôle et la permission de revue des paiements doivent être définis explicitement avant de déléguer cette opération.
7. La fonction d'administration des rôles `admin_add_admin` n'accepte actuellement que les permissions `businesses`, `content`, `settings`, `categories`, `reports`. Il manque une permission dédiée à la gestion des abonnements/offres si cette délégation est souhaitée.
8. Les règles de l'offre administrative illimitée et la coexistence d'une offre avec un abonnement payé ne sont pas représentées par les colonnes actuelles.

La fonction `admin_review_payment` verrouille le paiement en cours de revue, vérifie que son statut est `needs_review`, active l'abonnement associé en cas d'approbation, clôture l'ancien abonnement actif et journalise la décision. Cette base est utile, mais ne suffit pas à couvrir les exigences de snapshots, d'offres administratives et de permissions déléguées.

## 3. Messagerie : modèle présent, interfaces absentes

Les tables `conversations` et `messages` existent. Les policies actuelles reposent sur le client de la conversation ou sur la permission `messages` de l'entreprise. L'envoi vérifie l'identité de l'expéditeur et son droit d'accès à la conversation.

À faire avant ouverture :
- construire les routes et interfaces React de liste, lecture et réponse ;
- vérifier le comportement des messages lus/non lus ;
- tester un client, un owner/admin, un manager, un editor sans permission et un editor avec permission ;
- tester l'accès direct à une conversation d'une autre entreprise ;
- prévoir anti-spam et limites de fréquence ;
- décider si le temps réel Supabase est nécessaire au premier lancement ou si le rafraîchissement contrôlé suffit.

Aucune Edge Function n'est actuellement déployée ; les fonctions serveur externes, tâches planifiées et notifications externes ne sont donc pas disponibles.

## 4. Commandes multi-vendeurs et livraison : modèle partiel

Les tables `orders`, `order_items`, `business_delivery_zones` et `couriers` existent. Le schéma permet déjà d'enregistrer une commande par entreprise, un total, un mode de paiement direct au vendeur, un statut et des lignes avec nom/prix/quantité figés.

Écarts identifiés par rapport aux décisions produit :
- la table `checkout_batches` attendue pour représenter une validation globale multi-vendeurs n'est pas présente ; `orders.checkout_id` existe, mais aucune table de lot correspondante n'a été observée ;
- le choix retrait/livraison par article n'est pas représenté dans les colonnes de `order_items` consultées ; `orders.fulfillment` porte actuellement le mode au niveau de la commande, ce qui ne couvre pas les lignes mixtes retrait/livraison dans une commande vendeur ;
- le modèle visible ne suffit pas encore à représenter l'historique complet des transitions, délais de réponse, rappels, annulations partielles et réattributions de livraison ;
- `couriers` ne montre pas encore les champs de disponibilité déclarée et de capacité simultanée configurables confirmés dans les décisions métier ;
- les preuves de livraison configurables et leur stockage privé ne sont pas encore établis.

Ne pas connecter un panier multi-vendeurs au frontend avant d'avoir finalisé ces écarts et testé l'opération atomique de checkout. Le paiement des commandes reste hors Zack au lancement.

## 5. Permissions et sécurité : constats ciblés

### Points positifs
- RLS est activée sur les 38 tables publiques.
- Les fonctions d'administration examinées vérifient leurs permissions dans leur corps, et utilisent un `search_path` vide.
- `admin_review_payment`, `admin_add_admin`, `admin_remove_admin` et `admin_list_admins` vérifient le rôle principal.
- `admin_set_business_status` et `admin_business_owners` vérifient la permission administrative `businesses`.
- `request_subscription_payment` vérifie que l'utilisateur est owner/admin de l'entreprise demandée.
- La fonction `log_admin_content_action()` est désormais exécutable uniquement par `postgres` dans l'ACL observée ; l'ancienne alerte d'exécution directe anonyme/authentifiée n'est plus présente dans le contrôle actuel. Préserver ses triggers et ne pas réappliquer une révocation à l'aveugle.

### Points à traiter
- L'advisor sécurité signale encore une fonction `business_counts(p_business)` accessible à `anon` et `authenticated`. Elle ne retourne que des agrégats followers/favorites d'entreprises vérifiées, mais son exposition publique doit être explicitement confirmée comme voulue.
- Plusieurs fonctions `SECURITY DEFINER` restent accessibles à `authenticated`. Les avertissements doivent être examinés fonction par fonction ; ne pas révoquer les helpers RPC utilisés par RLS.
- La protection des mots de passe compromis reste signalée comme désactivée. Vérifier l'éligibilité du forfait Supabase avant de planifier son activation.
- L'advisor performance signale 47 cas de policies permissives multiples et 12 clés étrangères sans index couvrant. Les traiter individuellement après analyse ; ne pas supprimer ou fusionner les policies en masse.
- Les permissions entreprise et les permissions admin Zack doivent être comparées à la matrice produit, en particulier pour messages, commandes, livraisons, statistiques et abonnements.

## 6. Frontend : état de lancement

Le frontend React/TanStack actuellement présent reste limité aux routes initiales : accueil, recherche, fiche entreprise, authentification, notifications, profil et espace professionnel d'inscription/consultation des entreprises.

La navigation actuelle ne propose pas encore les espaces fonctionnels complets de messagerie, commandes, abonnements et administration. Le composant d'en-tête consulté ne contient pas encore la navigation mobile convenue (Accueil, Recherche, Créer, Messages, Profil).

Aucun lockfile npm n'a été trouvé lors de l'audit antérieur ; le workflow utilise `npm install`. Ajouter et versionner un lockfile, puis remplacer l'installation CI par `npm ci` après validation de la version de Node et des dépendances.

Les tests navigateur, Android, multi-rôles, accessibilité et PWA restent à exécuter. Le build/typecheck réussi précédemment ne vaut pas recette complète.

## 7. Ordre d'exécution actualisé

1. **Sécurité et permissions** : terminer la revue des RPC `SECURITY DEFINER`, vérifier les policies de modération, clarifier les permissions admin et exécuter les tests par rôle dans un environnement de test.
2. **Abonnements** : finaliser les plans et avantages, les snapshots, les comptes MonCash, l'idempotence, les offres gratuites administratives et les permissions de revue ; préparer ensuite une migration additive pour revue, sans l'appliquer à la base active.
3. **Frontend mobile** : mettre en place la navigation mobile et les layouts public/pro/client/admin, en conservant les routes existantes.
4. **Messagerie** : brancher les interfaces sur les tables et policies réelles, puis tester les accès et le rafraîchissement/temps réel.
5. **Commandes** : compléter le modèle multi-vendeurs avant de connecter le panier et le checkout.
6. **Livraison** : disponibilité/capacité des livreurs, missions, transitions, preuves et audit.
7. **PWA et médias** : aligner le stockage sur la décision photos uniquement, prévoir la quarantaine des médias non approuvés, optimiser les images et ajouter les éléments PWA.
8. **Recette** : tests automatisés, navigateur, Android, connexions lentes, sécurité, accessibilité, charge, sauvegardes, monitoring, domaine, confidentialité et ouverture progressive.

## 8. Limites de cet audit

- Toutes les observations Supabase sont des lectures ; aucune donnée n'a été insérée, modifiée ou supprimée.
- Aucun SQL DDL/DML, aucune migration, aucune policy, aucun paramètre Auth, aucun bucket et aucune Edge Function n'ont été modifiés.
- Aucun commit sur `main`, merge, déploiement ou publication n'a été effectué.
- Les comptages de lignes sont ceux du moment de la requête et peuvent évoluer.
- Les tests d'accès réels avec comptes distincts restent obligatoires avant de conclure que les permissions sont sûres.
