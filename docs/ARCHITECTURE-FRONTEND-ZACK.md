# Zack — architecture technique du nouveau frontend

Date : 12 novembre 2026  
Branche : `preparation/phase-1-frontend-plan`  
Statut : architecture cible à valider avant implémentation. Aucun code applicatif ni réglage Supabase n'est modifié par ce document.

## 1. Objectif

Construire Zack comme une plateforme nationale haïtienne, mobile-first, composée de trois espaces clairement séparés :

1. **Espace public** : découverte, recherche, fiches entreprises, produits, services et contenus.
2. **Espace professionnel** : gestion d'une ou plusieurs entreprises, équipe, catalogue, publications, messages et commandes lorsque ces modules seront disponibles.
3. **Espace administration** : vérification des entreprises, modération, gestion des administrateurs, statistiques et paramètres.

Le nouveau frontend doit reprendre les fonctionnalités utiles de l'ancien projet, corriger ses défauts d'organisation et respecter les capacités réelles de Supabase.

## 2. Socle technique retenu

Le projet Lovable audité utilise déjà TanStack Start, React, TypeScript, Vite, Tailwind et une bibliothèque de composants. Il est préférable de conserver ce socle plutôt que de réécrire l'application dans une autre technologie sans raison.

| Couche | Choix cible | Règle |
|---|---|---|
| Application | TanStack Start + React | Garder le framework déjà présent dans le projet Lovable. |
| Langage | TypeScript | Mode strict autant que possible ; types partagés et explicites. |
| Construction | Vite | Conserver la configuration du projet existant. |
| Styles | Tailwind CSS | Tokens Zack centralisés, pas de couleurs dispersées. |
| Composants | Bibliothèque déjà présente dans le projet | Réutiliser les composants disponibles avant d'ajouter une dépendance. |
| Navigation | TanStack Router / routes Start | Routes publiques, professionnelles et administratives avec layouts distincts. |
| Backend | Supabase | Auth, Postgres, Storage, Realtime seulement pour les besoins validés. |
| Auth SSR | `@supabase/ssr` selon compatibilité vérifiée avec la version du framework | Session par cookies, client serveur et navigateur séparés. |
| Validation | Bibliothèque de validation déjà présente, ou Zod après vérification | Valider les données à la frontière serveur et client. |
| Tests | Outils déjà installés ; compléter après inspection | Tests unitaires, composants, parcours et sécurité. |

**Important :** avant d'installer ou de mettre à jour des paquets, vérifier le `package.json`, le lockfile, les versions actuelles et la documentation officielle correspondante. Ne pas installer une seconde bibliothèque qui fait déjà le même travail.

## 3. Organisation des dossiers proposée

Arborescence cible indicative. Elle devra être adaptée aux conventions exactes de TanStack Start et aux fichiers déjà présents dans Lovable ; ne pas déplacer ou supprimer des fichiers avant inspection.

```text
src/
├── routes/
│   ├── __root.tsx
│   ├── index.tsx
│   ├── auth/
│   │   ├── connexion.tsx
│   │   ├── inscription.tsx
│   │   └── mot-de-passe-oublie.tsx
│   ├── recherche/
│   │   └── index.tsx
│   ├── entreprises/
│   │   └── $slug.tsx
│   ├── produits/
│   │   └── $id.tsx
│   ├── services/
│   │   └── $id.tsx
│   ├── pro/
│   │   ├── route.tsx
│   │   ├── index.tsx
│   │   ├── entreprises/
│   │   ├── catalogue/
│   │   ├── publications/
│   │   ├── equipe/
│   │   ├── messages/
│   │   └── commandes/
│   ├── messages/
│   │   └── index.tsx
│   ├── profil/
│   │   └── index.tsx
│   ├── notifications/
│   │   └── index.tsx
│   ├── commandes/
│   │   └── $id.tsx
│   ├── transactions/
│   │   └── index.tsx
│   └── admin/
│       ├── route.tsx
│       ├── index.tsx
│       ├── entreprises.tsx
│       ├── utilisateurs.tsx
│       ├── signalements.tsx
│       ├── statistiques.tsx
│       └── parametres.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── forms/
│   ├── feedback/
│   └── media/
│
├── features/
│   ├── auth/
│   ├── businesses/
│   ├── categories/
│   ├── search/
│   ├── products/
│   ├── services/
│   ├── posts/
│   ├── promotions/
│   ├── events/
│   ├── reviews/
│   ├── favorites/
│   ├── messaging/
│   ├── notifications/
│   ├── professional/
│   ├── orders/
│   ├── subscriptions/
│   └── admin/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── validation/
│   ├── permissions/
│   ├── formatting/
│   └── constants/
│
├── styles/
│   ├── globals.css
│   └── theme.css
│
└── types/
    ├── database.generated.ts
    ├── app.ts
    └── permissions.ts
```

Cette arborescence est une cible, pas une instruction de création massive de fichiers. Le routeur peut imposer une convention différente pour les layouts et les fichiers de routes : l'adapter à la structure réelle.

## 4. Responsabilités de chaque couche

### Routes
- Définissent l'URL, les paramètres, le chargement et les erreurs de page.
- Appellent les services ou fonctions serveur adaptés.
- Ne contiennent pas directement toute la logique métier.
- Ne décident jamais seules qu'un utilisateur a le droit d'effectuer une action sensible.

### Features
Chaque fonctionnalité regroupe ses composants, schémas de validation, services et types propres. Exemple : `features/businesses/` contient les éléments de fiche entreprise, sans mélanger cette logique avec les commandes ou l'administration.

### Components
- `ui/` : boutons, champs, dialogues, cartes, menus, badges.
- `layout/` : structure des espaces public, pro et admin.
- `navigation/` : navigation desktop et mobile.
- `forms/` : champs et éléments de formulaire réutilisables.
- `feedback/` : chargement, erreur, état vide, confirmation.
- `media/` : affichage et sélection de médias.

### Lib
Contient les intégrations transversales : Supabase, validation, permissions côté interface, formatage et constantes. Les règles d'autorisation faisant foi restent côté serveur et en base.

## 5. Navigation et layouts

### Navigation publique
- Accueil
- Recherche
- Catégories
- Fiche entreprise
- Connexion / inscription

Sur mobile, la barre principale doit rester simple. Proposition de navigation : **Accueil · Recherche · Créer · Messages · Profil**. Le bouton « Créer » ouvre les actions réellement autorisées selon la session et les permissions ; il ne donne aucun droit supplémentaire.

### Espace professionnel
- Vue d'ensemble
- Entreprises gérées / sélecteur d'entreprise
- Informations et horaires
- Produits et services
- Publications, promotions et événements
- Équipe et permissions
- Messages
- Commandes (lorsque disponibles)
- Paramètres du compte

Une personne qui gère plusieurs entreprises doit pouvoir choisir explicitement l'entreprise active. Toutes les requêtes et toutes les mutations doivent vérifier l'appartenance et les permissions sur le serveur.

### Administration
- Tableau de bord
- Entreprises à vérifier
- Entreprises publiées / suspendues
- Signalements et modération
- Utilisateurs et administrateurs
- Statistiques
- Paramètres du site
- Journal d'audit

L'accès à chaque rubrique dépend d'une permission admin vérifiée côté serveur, pas seulement de la visibilité d'un lien.

## 6. Intégration Supabase et sessions

### Séparation des clients
- Client navigateur : uniquement pour les opérations autorisées depuis le navigateur, avec la clé publique/publishable.
- Client serveur : construit à partir des cookies de session de la requête, pour les loaders et opérations serveur.
- Ne jamais importer le client serveur dans un composant navigateur.
- Ne jamais exposer une clé `service_role` ou une clé secrète dans le bundle frontend, les variables publiques ou les logs.

### Authentification
- Lire et valider l'utilisateur sur le serveur pour protéger les routes privées.
- Prévoir les états non connecté, session expirée, compte désactivé et accès refusé.
- Après connexion, rediriger selon les droits réellement vérifiés.
- Ne pas utiliser `user_metadata` modifiable par l'utilisateur pour prendre une décision d'autorisation.
- Les informations de rôle sensibles doivent provenir d'une source fiable côté serveur/base.
- Prévoir le renouvellement et la révocation de session selon les mécanismes Supabase documentés pour les versions installées.

### RLS et permissions
- Chaque table exposée doit avoir RLS activée.
- Une politique `authenticated` seule n'est pas suffisante : elle doit aussi limiter les lignes à la bonne personne, entreprise ou conversation.
- Pour les mises à jour, contrôler la ligne ciblée et vérifier que les nouvelles valeurs ne permettent pas de transférer la propriété.
- Examiner les vues : elles peuvent contourner RLS selon leur configuration. Utiliser une vue invoker lorsque compatible et nécessaire, ou retirer l'accès public.
- Les fonctions privilégiées doivent être auditées : corps, propriétaire, `search_path`, droits `EXECUTE`, vérification de l'utilisateur et journalisation.
- Les contrôles frontend améliorent l'expérience, mais ne remplacent jamais RLS.

## 7. Design system Zack

### Tokens
- Bleu foncé : `#0A1A4F`
- Bleu lumineux : `#3B82F6`
- Jaune : `#FFC107`
- Blanc : `#FFFFFF`
- Police : Poppins
- Thèmes : clair, sombre, automatique

### Règles d'interface
- Texte foncé sur fond jaune pour conserver un contraste lisible.
- Utiliser le bleu foncé pour les éléments structurants et le bleu lumineux pour les actions et états interactifs.
- Prévoir des états focus visibles au clavier.
- Ne pas dépendre uniquement de la couleur pour signaler une erreur ou un statut.
- Composants responsive, formulaires lisibles et cibles tactiles confortables.
- États chargement, vide, erreur, succès et accès refusé pour chaque module.
- Français comme langue initiale ; éviter les textes fictifs ou anglais hérités de l'ancienne maquette.
- Les localités doivent venir d'un référentiel national validé, pas de listes codées en dur limitées à Jérémie.

## 8. Architecture des données côté frontend

- Générer les types TypeScript à partir du schéma Supabase réel après inspection, puis les versionner.
- Éviter de créer manuellement des types qui prétendent décrire des colonnes non vérifiées.
- Définir des types de vue dédiés pour les données publiques, plutôt que d'exposer directement les profils privés.
- Séparer les objets de formulaire des objets de base de données.
- Valider et normaliser les entrées côté serveur.
- Utiliser la pagination pour les listes longues.
- Ne pas télécharger tout le catalogue puis filtrer uniquement dans le navigateur.
- Les statistiques doivent provenir de sources validées, jamais de nombres codés en dur.

## 9. Paiements : frontière d'architecture

Au lancement :
- Les clients peuvent envoyer une demande de commande sans paiement en ligne.
- Zack peut encaisser ses propres abonnements via MonCash, sous réserve de l'accès marchand et de la validation de l'intégration.
- Les paiements de commandes sont reportés jusqu'à validation juridique et technique.
- NatCash reste reporté jusqu'à réception et vérification de la documentation officielle.

Architecture future du paiement :
1. Le frontend demande au serveur de démarrer une transaction.
2. Le serveur crée une référence interne et une tentative de paiement avec montant et devise attendus.
3. Le client est dirigé vers le parcours officiel du fournisseur.
4. Le serveur vérifie la notification/callback et, si nécessaire, interroge le fournisseur.
5. Le serveur compare référence, montant, devise et statut.
6. Le serveur traite l'événement de manière idempotente.
7. L'abonnement n'est activé qu'après confirmation vérifiée.

Aucun PIN ou OTP ne doit transiter par les formulaires Zack, les logs ou la base Zack. Les remboursements ne doivent pas être annoncés comme automatisés sans preuve de prise en charge officielle.

## 10. Stratégie de tests

### Tests unitaires
- Fonctions de formatage et validation.
- Règles de présentation des statuts.
- Calculs d'affichage et transformation des données.

### Tests de composants
- Formulaires et erreurs.
- Cartes entreprises, produits et services.
- Menus conditionnés par les permissions.
- États vide, chargement et erreur.

### Tests de parcours
- Inscription, connexion, déconnexion et récupération d'accès.
- Recherche et consultation publique.
- Création et mise à jour d'une fiche par un propriétaire autorisé.
- Refus d'accès d'un membre non autorisé.
- Parcours de modération admin.
- Demande de commande sans paiement.
- Abonnement MonCash en environnement de test, une fois l'intégration officiellement disponible.

### Tests de sécurité
- Changer un identifiant d'entreprise dans l'URL ou la requête.
- Lire le profil ou les notifications d'un autre utilisateur.
- Modifier une ligne en changeant son propriétaire.
- Appeler directement une fonction RPC sensible.
- Accéder à un fichier Storage privé.
- Rejouer un callback de paiement.
- Vérifier les vues et les fonctions contre les contournements RLS.

## 11. Ordre de construction du frontend

1. Inspection du projet Lovable réel : routes, dépendances, conventions, composants, scripts et lockfile.
2. Création du layout global, thème Zack, composants UI et navigation responsive.
3. Configuration sûre de l'authentification SSR et des clients Supabase.
4. Pages publiques : accueil, recherche, catégories, fiche entreprise, produit et service.
5. Profil et espace professionnel : fiche, horaires, médias, catalogue et publications.
6. Administration : vérification, modération, paramètres et statistiques.
7. Notifications et messagerie après confirmation des modèles de données.
8. Commandes et suivi après création/validation du schéma correspondant.
9. Abonnements et paiement MonCash après validation des accès officiels.
10. Tests complets, audit sécurité, performance mobile et recette avant publication.

## 12. Critères avant de commencer à coder

- [ ] Le dépôt et le dossier exacts du projet Lovable sont identifiés.
- [ ] Le `package.json`, lockfile et versions sont inspectés.
- [ ] La structure actuelle de routes est connue.
- [ ] Le schéma Supabase réel et ses relations sont disponibles.
- [ ] Les politiques RLS, vues, fonctions et triggers critiques sont audités.
- [ ] Les variables d'environnement sont identifiées par leur nom, sans partager leurs valeurs secrètes.
- [ ] Une stratégie de branche et de sauvegarde est définie.
- [ ] Les maquettes et composants de référence sont validés.
- [ ] Aucun changement de production n'est exécuté sans accord explicite.

## 13. État de ce document

Ce document définit une architecture cible. Il ne signifie pas que les dossiers, routes, composants, fonctions, tables ou tests décrits ont déjà été créés. La prochaine action sûre est d'inspecter le contenu réel du projet Lovable et le schéma Supabase, puis de transformer cette architecture en tâches d'implémentation précises.

**Aucune modification de Supabase, du dépôt principal ou du déploiement n'a été effectuée pendant la rédaction de ce document.**
