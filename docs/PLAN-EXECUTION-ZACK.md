# Zack — plan d'exécution et règles de travail

Dernière mise à jour : 15 novembre 2026  
Branche de travail : `hardening/phase-1-stabilisation`  
Dépôt : `kingscar509-png/Zack-jeremie`

## 1. Décision de travail

GitHub est le code source que nous pouvons inspecter et modifier directement. Le dépôt contient une application historique dans `legacy/index.html`, un frontend React/TanStack Start amorcé et des documents de référence.

La branche `main` reste intacte. La branche `hardening/phase-1-stabilisation` est la branche de travail actuelle. Elle a divergé de `main` (comparaison du 15 novembre : 308 commits en avance et 1 en retard) ; aucune fusion automatique ne doit être tentée. Refaire une comparaison et résoudre explicitement l'historique avant toute intégration.

## 2. Décisions produit non négociables

- Zack est une plateforme nationale pour toute Haïti, pas une plateforme limitée à Jérémie.
- Le lancement public sera progressif.
- Première ouverture : Entreprise, Consommateur et Livreur, uniquement après validation réelle de chaque parcours.
- Phases ultérieures : Fournisseurs et Marché B2B. Ces modules restent prévus ; aucune fonctionnalité ne doit être supprimée pour les reporter.
- **Aucune modification du frontend dans le cadre de cette réorganisation.** Ne pas toucher aux routes, composants, styles, textes, navigation ou apparence sans une nouvelle autorisation explicite.
- Interface française, mobile-first et responsive ; identité visuelle existante préservée.
- Espaces public, professionnel et administration conservés.
- Commandes possibles sans paiement en ligne au lancement, après validation complète du parcours.
- MonCash sert d'abord aux abonnements Zack, après correction et validation du flux officiel.
- Paiement en ligne des commandes seulement après validation juridique et technique.
- NatCash reporté ; ne pas accepter de nouvelles demandes NatCash au lancement.
- Aucun PIN, OTP, secret marchand ou clé Supabase privilégiée ne doit être stocké dans le navigateur.

## 3. Périmètre de première ouverture

### Entreprise
- Création et gestion d'une entreprise.
- Informations, coordonnées, horaires et médias.
- Produits, services et catégories.
- Publications, promotions et événements par les rôles autorisés, sans approbation centrale préalable.
- Avis et réponses selon les permissions confirmées.
- Réception et traitement des commandes uniquement après validation de bout en bout.

### Consommateur
- Découverte nationale, recherche et fiches d'entreprises vérifiées.
- Inscription, connexion, récupération de compte et profil.
- Favoris, avis, notifications.
- Messagerie privée et commandes uniquement lorsque leurs parcours sont complets et testés.
- Pas de paiement de commande en ligne au premier lancement.

### Livreur
- Parcours authentifié distinct du simple espace professionnel.
- Accès limité aux missions explicitement affectées.
- Lecture des seules informations nécessaires à la livraison.
- Transitions de statut limitées aux étapes autorisées.
- Révocation immédiate des accès après désactivation ou retrait d'affectation.

## 4. Phases ultérieures conservées

### Fournisseurs
Espace fournisseur, catalogue, relations d'approvisionnement et outils associés.

### Marché B2B
Découverte entre entreprises, achats en gros, négociation et transactions professionnelles.

Ces modules ne sont pas ouverts dans la première version. Leurs tables, relations et fonctions existantes doivent être conservées. Aucun accès ne doit être activé par défaut avant une recette dédiée.

## 5. État technique GitHub

- Socle présent : React, TypeScript, TanStack Start/Router, Vite, Tailwind, Supabase JS et `@supabase/ssr`.
- Routes existantes : accueil, recherche, fiche entreprise, authentification, profil, notifications, espace professionnel initial et abonnements.
- Le frontend React ne comporte pas encore de parcours complet pour les commandes, la messagerie, l'administration ou le livreur.
- La maquette HTML est une référence visuelle, pas une preuve de fonctionnement connecté.
- Les contrôles CI précédents ont réussi sur des commits antérieurs ; un nouveau contrôle doit être vérifié après les commits documentaires du 15 novembre.
- Ne pas conclure à la disponibilité des modules en se fondant uniquement sur la présence de routes, de tables ou de RPC.

## 6. État Supabase observé le 15 novembre 2026

Audit effectué en lecture seule sur le projet `hwuwqalazmrmdxseawnm` :

- Projet actif, PostgreSQL 17.11.
- 38 tables dans `public`, RLS activée sur les 38.
- 28 migrations enregistrées dans l'historique distant.
- Aucune Edge Function déployée.
- Tables de profils, entreprises, membres, catalogue, commandes, lignes, livreurs, zones, conversations/messages, abonnements et paiements présentes.
- Aucun ensemble de tables dédié aux fournisseurs ou au marché B2B n'a été confirmé dans l'inventaire.
- Aucun dossier de migrations Supabase versionné n'a été confirmé dans le dépôt.

### Écarts prioritaires identifiés

1. La policy de la table `couriers` s'appuie sur la permission `orders`, alors que le flux de statut prévoit aussi `deliveries`. Le modèle du livreur indépendant et l'accès à ses propres missions ne sont pas démontrés.
2. Les commandes sont principalement modifiées via des RPC `SECURITY DEFINER`. Les tests d'accès croisés et les transitions de statut restent à réaliser.
3. `request_subscription_payment` accepte encore `moncash` et `natcash`.
4. `admin_review_payment` lit le plan courant au moment de la revue et annule l'abonnement lié en cas de refus ; le contrat attendu de snapshots et de renouvellement n'est donc pas respecté par la fonction actuellement déployée.
5. `get_payment_recipients()` renvoie le numéro du compte à tout utilisateur authentifié ; vérifier et réduire l'exposition.
6. L'advisor de sécurité signale `business_counts` exécutable par `anon` en `SECURITY DEFINER`, ainsi que 23 fonctions privilégiées exécutables par `authenticated`. Plusieurs contrôlent leur appelant dans leur corps ; audit individuel obligatoire, pas de révocation globale.
7. La protection contre les mots de passe compromis est désactivée dans Auth ; évaluer son activation avant l'ouverture publique.
8. L'advisor de performance remonte des policies permissives multiples et une clé étrangère potentiellement non indexée. Ne pas fusionner ou supprimer ces policies en bloc.
9. L'historique distant des migrations doit être réconcilié avec les fichiers versionnés avant de préparer un déploiement reproductible.

La stratégie et les constats détaillés sont consignés dans [Stratégie de lancement progressif](STRATEGIE-LANCEMENT-PROGRESSIF-2026-11-15.md).

## 7. Ordre d'exécution

### Phase A — audit et sécurisation
1. Cartographier toutes les fonctions `SECURITY DEFINER`, leurs droits EXECUTE et leurs contrôles internes.
2. Vérifier RLS, vues, triggers, Storage, permissions et fonctions RPC.
3. Corriger le contrat de paiement/abonnement et les opérations sensibles après revue.
4. Concevoir le vrai modèle de livreur et les permissions `deliveries`.
5. Réconcilier les 28 migrations distantes avec le dépôt et versionner proprement les migrations futures.
6. Ajouter des tests automatisés et des tests négatifs d'autorisation.

### Phase B — validation Entreprise / Consommateur
1. Vérifier les parcours existants sans modifier le frontend.
2. Tester authentification, profil, création d'entreprise, appartenance et vérification.
3. Tester isolation interentreprises avec deux comptes distincts.
4. Tester catalogue, fiches publiques, recherche, contenus, favoris et avis.
5. Documenter les parcours absents plutôt que simuler leur fonctionnement.

### Phase C — validation Livreur
1. Définir l'identité du livreur, son rattachement et les règles d'affectation.
2. Séparer les permissions de livraison des permissions de gestion des commandes.
3. Garantir que chaque livreur ne lit que les missions qui lui sont affectées.
4. Tester affectation, retrait, prise en charge, livraison, refus et révocation.
5. N'ouvrir ce parcours qu'après tests multi-comptes dans un environnement isolé.

### Phase D — préparation des phases futures
1. Conserver les structures utiles existantes.
2. Documenter les dépendances et contrats de données.
3. Concevoir Fournisseurs et Marché B2B séparément.
4. Ne pas les activer dans la première version.

### Phase E — recette et publication
1. Tests unitaires et intégration.
2. Tests des parcours public, consommateur, entreprise et livreur.
3. Tests RLS et tentatives d'accès interdit.
4. Tests navigateur, Android, responsive, clavier, contraste et erreurs réseau.
5. Vérifier build, variables d'environnement et logs.
6. Présenter le rapport de recette et demander l'accord avant publication.

## 8. Règles de sécurité et de modification

- Toutes les modifications de code se font sur une branche de préparation ; `main` reste intacte.
- Ne jamais pousser de secrets, clés privées, PIN, OTP ou données personnelles réelles dans Git.
- Une clé publishable/anon n'est pas une clé service_role ; ne jamais mettre service_role dans le frontend.
- Masquer un bouton ne constitue pas une autorisation.
- Chaque opération sensible doit être autorisée côté serveur et par RLS.
- Ne pas inventer de colonnes, relations, fonctions ou états métier.
- Ne pas supprimer les objets Supabase existants explicitement demandés.
- Aucune migration, modification de données, policy, fonction, clé ou paramètre du projet Supabase de production sans approbation explicite de la migration exacte après revue.
- Aucune Edge Function ne doit être déployée sans autorisation distincte.
- Aucune fusion vers `main`, publication, achat ou paiement réel sans validation explicite.

## 9. Critère de fin

La première version Zack ne sera considérée prête que lorsque les parcours Entreprise, Consommateur et Livreur annoncés fonctionnent réellement, que les droits sont vérifiés côté backend, que les écrans ne montrent aucune donnée inventée, que les tests critiques passent et que le propriétaire a validé la recette.

Les modules Fournisseurs et Marché B2B restent conservés pour une phase ultérieure.

## 10. Historique de la décision du 15 novembre 2026

La stratégie de lancement progressif remplace la formulation précédente selon laquelle tous les modules disponibles devaient être ouverts en même temps. Elle ne modifie pas l'ambition fonctionnelle globale de Zack.

Le frontend est gelé pour cette réorganisation : les travaux immédiats portent sur l'audit, les tests, la sécurité, les contrats backend et la préparation de migrations versionnées. Toute modification de l'interface nécessitera une nouvelle décision explicite.
