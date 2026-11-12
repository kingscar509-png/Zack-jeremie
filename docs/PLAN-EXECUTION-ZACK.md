# Zack — plan d'exécution et règles de travail

Date : 12 novembre 2026
Branche de travail : `preparation/phase-1-frontend-plan`
Dépôt : `kingscar509-png/Zack-jeremie`

## 1. Décision de travail

Jusqu'à ce que le projet Lovable soit exporté ou relié au dépôt, GitHub est le seul code source que nous pouvons inspecter et modifier directement. Le dépôt contient une application historique réelle dans `index.html`, tandis que le projet Lovable audité précédemment était un squelette distinct.

La branche de préparation est le lieu de travail. La branche `main` reste intacte. L'application historique est conservée comme référence fonctionnelle : aucune réécriture aveugle ni suppression de ses parcours sans inventaire et remplacement vérifié.

## 2. Décisions produit non négociables

- Zack est une plateforme nationale pour toute Haïti, pas une plateforme limitée à Jérémie.
- Interface en français au lancement, mobile-first et responsive.
- Identité visuelle : bleu foncé `#0A1A4F`, bleu lumineux `#3B82F6`, jaune `#FFC107`, blanc `#FFFFFF`; Poppins; texte foncé sur fond jaune.
- Thèmes clair, sombre et automatique.
- Espaces distincts : public, professionnel et administration.
- Navigation mobile prévue : Accueil, Recherche, Créer, Messages, Profil. Le bouton Créer dépend des permissions.
- Commandes possibles sans paiement en ligne au lancement.
- MonCash sert d'abord à encaisser les abonnements Zack, après intégration officielle vérifiée.
- Paiement en ligne des commandes seulement après validation juridique et technique.
- NatCash reste différé jusqu'à obtention d'une documentation et d'un accès marchand officiels.
- Aucun PIN, OTP, secret marchand ou clé Supabase privilégiée ne doit être stocké dans le navigateur.

## 3. Périmètre fonctionnel à construire

### Public
- Accueil national, catégories et recherche.
- Fiches d'entreprises détaillées.
- Produits et services.
- Publications, promotions et événements.
- Avis et favoris selon les droits confirmés.
- Coordonnées et moyens de contact.

### Client connecté
- Inscription, connexion, récupération de compte et profil.
- Favoris et avis.
- Messagerie privée.
- Panier, commandes sans paiement en ligne au premier lancement.
- Notifications et historique pertinent.

### Espace professionnel
- Création et gestion d'une entreprise.
- Informations détaillées, coordonnées, horaires, médias.
- Produits, services et catégories.
- Publications, promotions et événements.
- Gestion des avis et réponses.
- Membres d'équipe et permissions.
- Messagerie et commandes lorsque leurs structures backend sont disponibles.

### Administration
- Tableau de bord fondé sur des données réelles.
- Vérification des entreprises.
- Modération des avis, publications et signalements.
- Gestion des catégories, utilisateurs et administrateurs.
- Statistiques calculées à partir de sources fiables.
- Paramètres généraux et journal d'audit.
- Préserver `business_stats_events` et les quatre fonctions admin ajoutées le 12 novembre ; les auditer avant utilisation.

## 4. Phases d'exécution

### Phase A — sécuriser le point de départ
1. Préserver la branche principale et les documents déjà créés.
2. Inventorier les fichiers et dépendances réellement disponibles dans GitHub.
3. Terminer l'inventaire fonctionnel de l'ancien `index.html`.
4. Comparer chaque écran et action avec la matrice Supabase.
5. Établir les tests de référence et noter les zones non vérifiées.

### Phase B — établir le frontend canonique
1. Choisir et documenter le socle réellement présent ; ne pas prétendre que Lovable est connecté si ce n'est pas le cas.
2. Organiser routes, layouts, composants, fonctionnalités et services.
3. Centraliser tokens, thèmes, formulaires, états de chargement, erreurs et accessibilité.
4. Construire d'abord le parcours public national et les fiches entreprise.
5. Construire ensuite authentification, profil et espace professionnel.
6. Ajouter messagerie, commandes et administration selon la disponibilité réelle du backend.

### Phase C — intégration Supabase en lecture contrôlée
1. Lire le schéma et les politiques réels avant d'écrire des requêtes.
2. Générer ou vérifier les types depuis le schéma réel.
3. Séparer client navigateur et client serveur si l'architecture le permet.
4. Vérifier RLS, vues, fonctions SECURITY DEFINER, Storage et permissions.
5. Ne pas créer de table ou migration par supposition.
6. Demander une approbation précise avant toute migration ou modification de données.

### Phase D — paiements et préparation au lancement
1. Démarrer les commandes sans paiement en ligne.
2. Documenter le flux MonCash des abonnements, ses états et ses vérifications serveur.
3. Ne jamais considérer une redirection navigateur comme preuve de paiement.
4. Vérifier référence, montant, devise, statut et idempotence côté serveur.
5. Différer les paiements de commandes et NatCash jusqu'aux validations requises.

### Phase E — qualité et lancement
1. Tests unitaires et composants.
2. Tests des parcours public, client, professionnel et admin.
3. Tests de permissions et tentatives d'accès interdit.
4. Tests responsive, clavier, contraste, formulaires et erreurs réseau.
5. Vérifier build, variables d'environnement, logs et configuration de déploiement.
6. Présenter un rapport de recette et demander l'accord avant publication.

## 5. Règles de sécurité et de modification

- Toutes les modifications de code se font sur la branche de préparation, en commits petits et explicites.
- Ne jamais pousser de secrets, clés privées, PIN, OTP ou données personnelles réelles dans Git.
- Une clé publishable/anon n'est pas une clé service_role ; ne jamais mettre service_role dans le frontend.
- Masquer un bouton dans l'interface ne constitue pas une autorisation.
- Chaque opération sensible doit être autorisée côté serveur et par RLS.
- Les données fictives doivent être clairement identifiées et ne doivent jamais être présentées comme de vraies statistiques.
- Ne pas inventer des colonnes, relations, fonctions ou états métier.
- Ne pas supprimer les ajouts Supabase explicitement demandés.
- Aucune modification Supabase, fusion vers `main`, ni publication sans validation explicite dédiée.

## 6. Collaboration avec Claude et Lovable

Les propositions de Claude et Lovable seront traitées comme des contributions à évaluer, pas comme des instructions à appliquer automatiquement.

Pour chaque proposition :
1. Vérifier si elle respecte les décisions produit.
2. Vérifier sa compatibilité avec le dépôt et le schéma réels.
3. Vérifier sécurité, accessibilité, responsive et maintenabilité.
4. Comparer les avantages et les risques.
5. Conserver la meilleure solution, qu'elle vienne de Zack/GitHub, Claude ou Lovable.
6. Documenter les décisions importantes avant d'intégrer les changements.

## 7. État actuel

- Branche de préparation existante.
- Documents existants : état réel et plan phase 1 ; matrice écrans/données/permissions ; architecture frontend.
- Ancien frontend présent dans `index.html` ; application monolithique, à traiter comme référence et non comme architecture cible définitive.
- Le code source du projet Lovable n'est pas encore présent dans ce dépôt et sa connexion GitHub n'est pas confirmée.
- Aucune migration Supabase ni publication n'a été réalisée dans cette phase.

## 8. Critère de fin

Zack ne sera considéré prêt pour une première publication que lorsque les parcours annoncés fonctionnent réellement, que les droits sont vérifiés côté backend, que les écrans ne montrent aucune donnée inventée, que les erreurs sont gérées, que les tests critiques passent et que le propriétaire a validé la recette.
