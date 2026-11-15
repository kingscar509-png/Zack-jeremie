# Zack — plateforme nationale des entreprises haïtiennes

Zack est une plateforme destinée à aider le public à découvrir les entreprises partout en Haïti, et à permettre aux professionnels de présenter et gérer leur activité.

## État du dépôt

- Le nouveau frontend est amorcé avec TanStack Start, React, TypeScript, Vite et Tailwind CSS.
- Supabase fournit l'authentification et les données existantes.
- Les types TypeScript de la base sont générés dans `src/types/database.types.ts`.
- L'ancienne application HTML/CSS/JavaScript est conservée dans `legacy/index.html` comme référence fonctionnelle.
- Les documents d'audit, d'architecture, de sécurité et de recette sont dans `docs/`.

## Stratégie de lancement

Zack conserve toutes les fonctionnalités prévues, mais son lancement public national en Haïti est progressif :

- **Première ouverture** : Entreprise, Consommateur et Livreur, uniquement lorsque chaque parcours est réellement validé.
- **Phases ultérieures** : Fournisseurs et Marché B2B. Ces modules sont conservés dans la feuille de route et ne sont pas supprimés.
- **Frontend** : aucune modification du frontend dans le cadre de cette réorganisation ; son apparence, ses routes et ses composants restent intacts.

Référence : [Stratégie de lancement progressif du 15 novembre 2026](docs/STRATEGIE-LANCEMENT-PROGRESSIF-2026-11-15.md).

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

## Fonctionnalités frontend déjà amorcées

- Accueil national et catégories actives.
- Recherche serveur des entreprises vérifiées.
- Fiche publique d'entreprise vérifiée.
- Inscription, connexion et récupération du mot de passe.
- Profil personnel et centre de notifications.
- Espace professionnel : liste des entreprises gérées et demande de création d'une entreprise.
- Thèmes clair, sombre et automatique.

Ces fonctionnalités sont écrites mais doivent encore passer par l'installation, le build, les tests navigateur et les tests de permissions avant d'être considérées comme validées.

## Backend Supabase : structures présentes, interfaces à construire

Le schéma Supabase actuel comprend notamment les tables de conversations/messages, commandes/lignes, livreurs/zones de livraison, forfaits/abonnements et paiements. Leur présence en base ne signifie pas que les parcours sont disponibles dans le frontend ni que tous les besoins produit sont couverts.

Les modules de messagerie, commandes multi-vendeurs, abonnements Zack, paiements MonCash et administration doivent être vérifiés, complétés et testés avant d'être annoncés comme opérationnels. Ne jamais afficher de données fictives.

État précis et écarts relevés le 14 novembre : [complément d'audit Supabase après migrations m8 à m13](docs/ETAT-REEL-SUPABASE-2026-11-14-APRES-M8-M13.md).

## Règles de contribution

- Travailler sur `hardening/phase-1-stabilisation` pour les travaux de stabilisation en cours ; ne pas fusionner vers `main` ni publier sans validation.
- Ne pas modifier Supabase sans migration examinée et accord explicite.
- Ne pas supprimer les objets Supabase ajoutés le 12 novembre.
- Ne jamais considérer un contrôle d'interface comme une protection de sécurité.

## Documents de référence

- [Stratégie de lancement progressif](docs/STRATEGIE-LANCEMENT-PROGRESSIF-2026-11-15.md)
- [Audit de reprise du 14 novembre 2026](docs/AUDIT-REPRISE-2026-11-14.md)
- [Complément d'audit Supabase après migrations m8 à m13](docs/ETAT-REEL-SUPABASE-2026-11-14-APRES-M8-M13.md)
- [État réel et plan phase 1](docs/ETAT-REEL-ET-PLAN-PHASE-1.md)
- [Matrice écrans, données et permissions](docs/MATRICE-ECRANS-SUPABASE-PERMISSIONS.md)
- [Architecture frontend](docs/ARCHITECTURE-FRONTEND-ZACK.md)
- [Plan d'exécution](docs/PLAN-EXECUTION-ZACK.md)
- [Audit Supabase en lecture seule](docs/AUDIT-SECURITE-SUPABASE-LECTURE-SEULE.md)
- [Plan de tests et recette](docs/PLAN-TESTS-RECETTE-ZACK.md)
