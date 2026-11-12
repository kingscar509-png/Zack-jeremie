# Zack — état réel et plan de préparation du frontend

Date de préparation : 12 novembre 2026

## 1. Décisions de référence

- Portée : toute Haïti, jamais limitée à Jérémie.
- Palette : bleu foncé `#0A1A4F`, bleu lumineux `#3B82F6`, jaune `#FFC107`, blanc `#FFFFFF`.
- Typographie : Poppins.
- Thèmes à prévoir : clair, sombre, automatique.
- Paiements au lancement : commandes sans paiement en ligne ; MonCash d'abord pour les abonnements Zack. NatCash seulement après réception et vérification de la documentation et des accès officiels.
- Les ajouts Supabase du 12 novembre 2026 (`business_stats_events` et les quatre fonctions d'administration) sont volontaires et doivent être préservés, puis audités avant utilisation.
- Aucune modification Supabase, aucun déploiement et aucune suppression ne font partie de cette préparation.

## 2. Constat important : deux projets différents

L'audit du projet Lovable indique que son frontend ne contient que le squelette de départ.

Le dépôt GitHub `kingscar509-png/Zack-jeremie`, branche `main`, contient toutefois deux fichiers :
- `README.md`
- `index.html` (environ 70 Ko au moment de l'inspection)

Ce `index.html` n'est pas une page vide : il contient une ancienne application Zack monolithique en HTML/CSS/JavaScript, connectée directement à Supabase avec `supabase-js`. Il comprend notamment l'accueil, les fiches d'entreprises, l'authentification, l'espace professionnel, la gestion du catalogue, des médias, des publications, promotions et événements, les avis et plusieurs écrans d'administration.

Conclusion : le projet Lovable vide et l'application historique du dépôt GitHub sont deux éléments distincts. L'application historique doit être traitée comme une référence fonctionnelle et une source de règles métier, pas comme un code à écraser aveuglément.

## 3. Éléments observés dans l'application historique

### Fonctionnalités déjà présentes dans le code historique
- Connexion et inscription par e-mail/mot de passe via Supabase Auth.
- Réinitialisation du mot de passe.
- Accueil alimenté par les paramètres du site, catégories, entreprises vérifiées, horaires, promotions, événements et publications.
- Recherche simple côté navigateur sur les entreprises déjà chargées.
- Fiche d'entreprise avec produits, services, médias, avis et moyens de contact.
- Espace professionnel fondé sur `business_members`.
- Création d'une fiche par RPC `create_business`.
- Gestion de produits, services, photos, horaires, publications, promotions, événements et avis.
- Fonctions d'administration dans le frontend : entreprises, catégories, utilisateurs, signalements, avis, paramètres et journal.

### Limites techniques observées
- Un seul fichier HTML d'environ 70 Ko : structure, présentation, logique métier et accès aux données sont fortement mélangés.
- Navigation par fragments d'URL (`location.hash`) et gestion d'événements inline.
- Rendu par chaînes HTML et `innerHTML` ; les données doivent continuer à être échappées systématiquement et les composants interactifs doivent être migrés vers un rendu déclaratif.
- Client Supabase initialisé dans le navigateur ; pas de couche serveur ni de sessions SSR avec cookies dans ce fichier.
- Chargement des entreprises vérifiées puis recherche locale : cela ne suffira pas pour une recherche nationale volumineuse.
- La page d'accueil contient encore un texte ciblant Jérémie.
- Les paramètres de thème historiques utilisent les clés `bleu_profond`, `turquoise`, `orange_dore`, etc. Il faudra prévoir une migration de présentation vers les nouveaux rôles de couleur, sans écriture en base durant la phase frontend.
- L'adresse e-mail de l'administrateur principal est codée dans le client pour déclencher une RPC `claim_main_admin`. Cette valeur ne doit jamais constituer une preuve d'autorisation : la fonction SQL et les permissions côté serveur doivent être l'autorité.
- Les opérations d'administration et de gestion sont appelées directement depuis le navigateur. Leur sûreté dépend entièrement des fonctions SQL et des politiques RLS ; il faudra les auditer avant d'exposer les nouveaux écrans.
- Le code utilise une clé publishable/anon côté navigateur. Ne jamais remplacer celle-ci par une clé `service_role` ou une clé secrète.

Ces constats proviennent d'une lecture statique du dépôt ; ils ne constituent pas une validation en exécution de chaque fonctionnalité.

## 4. Architecture frontend cible

Conserver le socle réellement choisi pour le nouveau projet Lovable : TanStack Start, React, TypeScript, Vite et Tailwind, après confirmation des versions et de la configuration présentes dans ce projet.

Architecture proposée, à ajuster au dépôt réel avant création :

```text
src/
  app/
    routes/
      __root.tsx
      index.tsx
      search.tsx
      businesses/
        $slug.tsx
      products/
        $id.tsx
      services/
        $id.tsx
      messages/
        index.tsx
        $conversationId.tsx
      account/
        index.tsx
      pro/
        index.tsx
        businesses/
        catalog/
        content/
        team/
        orders/
        subscription/
      admin/
        index.tsx
        businesses/
        users/
        categories/
        reports/
        reviews/
        payments/
        subscriptions/
        settings/
  components/
    layout/
    navigation/
    forms/
    feedback/
    business/
    product/
    messaging/
  features/
    auth/
    discovery/
    businesses/
    catalog/
    reviews/
    favorites/
    messaging/
    notifications/
    professional/
    administration/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    permissions/
    validation/
    formatting/
  styles/
    tokens.css
    themes.css
  types/
    database.ts
```

Principes :
- routes publiques indexables et rendues côté serveur lorsque pertinent ;
- sessions gérées avec `@supabase/ssr` et cookies selon les recommandations officielles à jour ;
- client navigateur et client serveur séparés ;
- validation des permissions côté serveur ET RLS en base ;
- composants réutilisables et formulaires validés ;
- aucune clé secrète dans le navigateur ;
- états de chargement, erreur, vide, succès et absence de permission pour chaque écran ;
- design mobile-first, puis adaptation tablette et ordinateur ;
- aucune donnée de démonstration présentée comme une donnée réelle.

## 5. Navigation et espaces

### Espace public
Navigation mobile : Accueil, Recherche, Créer, Messages, Profil.
- Accueil national et sélecteur géographique.
- Recherche entreprises, produits et services.
- Fiche entreprise.
- Détail produit et détail service.
- Promotions et événements.
- Messagerie.
- Favoris, entreprises suivies, avis et notifications.

### Espace professionnel
- Tableau de bord.
- Fiche de l'entreprise.
- Produits, services et galerie.
- Publications, promotions et événements.
- Horaires et avis.
- Statistiques réelles.
- Équipe et permissions.
- Commandes et abonnement, lorsque les modules backend seront prêts.

### Administration
- Tableau de bord.
- Vérification des entreprises.
- Gestion des entreprises et utilisateurs.
- Catégories et géographie.
- Modération des avis, contenus et signalements.
- Administrateurs et permissions.
- Journal d'audit.
- Paiements, remboursements et litiges.
- Forfaits et paramètres.

Le bouton « Créer » doit être piloté par les permissions réelles : publier pour un membre autorisé ; proposer l'inscription d'une entreprise pour un utilisateur qui n'en gère aucune.

## 6. Design system

Tokens de base :
- `--color-navy: #0A1A4F`
- `--color-blue: #3B82F6`
- `--color-yellow: #FFC107`
- `--color-white: #FFFFFF`

Règles :
- texte foncé sur fond jaune ;
- contraste suffisant dans les deux thèmes ;
- couleur sémantique séparée des couleurs de marque (succès, avertissement, erreur, information) ;
- composants : boutons, champs, cartes, badges de statut, onglets, dialogues, menus, tableaux, pagination, notifications et skeletons ;
- éviter les nombres de démonstration et les fausses notes/avis ;
- ne pas afficher « stock » si le modèle de données ne fournit que la disponibilité.

## 7. Intégration Supabase : règles de prudence

Pendant la construction initiale du frontend :
- lecture seule du schéma et des fonctions ;
- aucune migration ni requête d'écriture ;
- ne pas renommer ni supprimer les tables existantes ;
- ne pas modifier les politiques RLS ou les fonctions ;
- ne pas modifier le bucket public existant ;
- réutiliser les noms et relations existants après vérification du schéma réel ;
- documenter séparément chaque fonctionnalité qui nécessite un changement backend.

Avant toute future modification, établir une sauvegarde, une migration versionnée, un plan de retour arrière et des tests sur un environnement non productif.

Points de sécurité à auditer avant les écrans sensibles :
- autorisation réelle de chaque fonction RPC et fonction `SECURITY DEFINER` ;
- politiques RLS pour chaque lecture, insertion, mise à jour et suppression ;
- vues publiques et éventuel contournement RLS ;
- limites et dédoublonnage des événements statistiques ;
- validation de l'appartenance des produits à l'entreprise lors de l'enregistrement d'événements ;
- protection contre l'énumération, le spam et les abus ;
- stockage privé des documents de vérification ;
- journalisation des actions administratives.

## 8. Plan d'exécution proposé

### Phase 0 — Vérification des environnements
1. Confirmer le dépôt réellement relié à Lovable.
2. Confirmer la branche et les fichiers du projet Lovable.
3. Comparer le code historique avec les maquettes.
4. Vérifier les versions des dépendances et la configuration.
5. Créer un environnement de test distinct si nécessaire.

### Phase 1 — Fondations frontend sans changement Supabase
1. Structure de routes et layouts.
2. Tokens, thèmes et composants de base.
3. Navigation mobile et desktop.
4. Authentification et gestion de session SSR.
5. Protection des routes et affichage selon les rôles.
6. États d'erreur, chargement, vide et succès.
7. Tests responsive et tests d'authentification.

### Phase 2 — Espace public
Accueil, recherche, fiche entreprise, produits, services, avis, favoris, promotions et événements.

### Phase 3 — Espace professionnel
Fiche, catalogue, contenus, horaires, médias, avis et statistiques.

### Phase 4 — Préparation backend nationale
Corrections convenues, géographie, abonnés et favoris produits, après revue et validation des migrations.

### Phase 5 — Messagerie, commandes et abonnements
Développement par modules, avec tests de sécurité et de permissions.

### Phase 6 — Paiements et lancement
MonCash pour les abonnements Zack, tests sandbox, vérification serveur, puis déploiement après validation des conditions marchandes. NatCash et les paiements de commandes restent conditionnés aux accès et validations externes.

## 9. Critères d'acceptation de la phase 1

- Le projet démarre sans erreur et utilise les scripts réellement définis dans son `package.json`.
- Aucune clé secrète n'est présente dans le bundle navigateur.
- Connexion, déconnexion et récupération de mot de passe fonctionnent dans un onglet normal.
- Les routes privées redirigent les visiteurs non connectés.
- Un utilisateur ne peut pas accéder aux écrans d'une entreprise qu'il ne gère pas.
- Les permissions administrateur ne sont jamais déduites d'une adresse e-mail côté client.
- Les thèmes clair et sombre respectent la palette validée.
- Les écrans s'adaptent aux mobiles et ordinateurs.
- Les erreurs réseau et les listes vides sont traitées.
- Aucun chiffre, entreprise ou avis fictif n'est présenté comme réel.
- Aucune modification de schéma, donnée, politique ou bucket Supabase n'a été faite.

## 10. État de cette préparation

Ce document est une préparation d'architecture et un audit statique du dépôt GitHub. Il ne signifie pas que le frontend a été construit, que Supabase a été testé en direct, ni que l'application est prête à publier.

Aucun fichier de la branche `main` n'a été modifié. Aucun changement Supabase n'a été exécuté et aucune publication n'a été faite.
