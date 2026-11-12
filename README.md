# Zack — plateforme nationale des entreprises haïtiennes

Zack est une plateforme destinée à aider le public à découvrir les entreprises partout en Haïti, et à permettre aux professionnels de présenter et gérer leur activité.

## État du dépôt

- Le nouveau frontend est amorcé avec TanStack Start, React, TypeScript, Vite et Tailwind CSS.
- Supabase fournit l'authentification et les données existantes.
- Les types TypeScript de la base sont générés dans `src/types/database.types.ts`.
- L'ancienne application HTML/CSS/JavaScript est conservée dans `legacy/index.html` comme référence fonctionnelle.
- Les documents d'audit, d'architecture, de sécurité et de recette sont dans `docs/`.

## Démarrage local

Prérequis : Node.js récent et npm.

```bash
npm install
cp .env.example .env.local
```

Renseigner dans `.env.local` :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Utiliser uniquement la clé publishable/anon. Ne jamais placer une clé `service_role`, un secret marchand, un PIN ou un OTP dans le frontend.

Lancer le serveur :

```bash
npm run dev
```

Vérifier la production :

```bash
npm run build
npm run preview
```

## Fonctionnalités déjà amorcées

- Accueil national et catégories actives.
- Recherche serveur des entreprises vérifiées.
- Fiche publique d'entreprise vérifiée.
- Inscription, connexion et récupération du mot de passe.
- Profil personnel.
- Espace professionnel : liste des entreprises gérées et demande de création d'une entreprise.
- Thèmes clair, sombre et automatique.

Ces fonctionnalités sont écrites mais doivent encore passer par l'installation, le build, les tests navigateur et les tests de permissions avant d'être considérées comme validées.

## Fonctionnalités planifiées, non simulées

La base actuelle ne contient pas encore les tables dédiées aux conversations/messages, commandes, transactions/paiements ou abonnements Zack. Ces modules ne doivent pas afficher de données fictives. Ils seront ajoutés après conception et validation de leurs modèles de données, règles RLS et flux serveur.

## Règles de contribution

- Travailler d'abord sur `preparation/phase-1-frontend-plan`.
- Ne pas fusionner vers `main` ni publier sans validation.
- Ne pas modifier Supabase sans migration examinée et accord explicite.
- Ne pas supprimer les objets Supabase ajoutés le 12 novembre.
- Ne jamais considérer un contrôle d'interface comme une protection de sécurité.

## Documents de référence

- [État réel et plan phase 1](docs/ETAT-REEL-ET-PLAN-PHASE-1.md)
- [Matrice écrans, données et permissions](docs/MATRICE-ECRANS-SUPABASE-PERMISSIONS.md)
- [Architecture frontend](docs/ARCHITECTURE-FRONTEND-ZACK.md)
- [Plan d'exécution](docs/PLAN-EXECUTION-ZACK.md)
- [Audit Supabase en lecture seule](docs/AUDIT-SECURITE-SUPABASE-LECTURE-SEULE.md)
- [Plan de tests et recette](docs/PLAN-TESTS-RECETTE-ZACK.md)
