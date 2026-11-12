# Zack — état de la première implémentation GitHub

Date : 12 novembre 2026
Branche : `preparation/phase-1-frontend-plan`

## 1. Ce qui est maintenant dans la branche

### Socle technique
- Configuration initiale TanStack Start + React + TypeScript + Vite + Tailwind.
- Scripts de développement, build et démarrage serveur.
- Exemple d'environnement avec uniquement les variables publiques Supabase.
- Ignore des dépendances, builds et fichiers d'environnement.
- Routeur TanStack et document racine.

### Connexion Supabase
- Client navigateur avec `@supabase/ssr`.
- Client serveur avec cookies TanStack Start.
- Types TypeScript générés depuis le schéma Supabase observé le 12 novembre 2026.
- Chargement côté serveur des catégories et entreprises vérifiées.
- Recherche plein texte serveur sur le champ `search_document`.
- Lecture serveur d'une fiche entreprise publique par slug.

### Interfaces amorcées
- Accueil national.
- Recherche des entreprises.
- Fiche publique d'entreprise vérifiée.
- Inscription et connexion.
- Récupération et réinitialisation du mot de passe.
- Profil personnel.
- Espace professionnel : entreprises gérées et demande d'inscription d'une entreprise.
- Choix de thème clair, sombre ou automatique.

### Conservation
- L'ancienne application a été déplacée vers `legacy/index.html` sur cette branche pour la garder comme référence.
- La branche `main` n'a pas été modifiée.
- Les documents de conception et d'audit précédents ont été conservés.

## 2. Ce qui n'est pas encore terminé

- Aucun build ni contrôle TypeScript n'a encore été exécuté dans un environnement Node.
- Aucun test navigateur n'a été effectué.
- Le parcours de confirmation e-mail et les URL de redirection Supabase doivent être vérifiés.
- Les écrans détaillés de gestion d'entreprise (horaires, médias, catalogue, publications, promotions, événements, avis) restent à construire.
- Le tableau de bord admin et la gestion des permissions restent à construire.
- La messagerie, les commandes, les transactions et les abonnements ne sont pas implémentés : les tables correspondantes ne figurent pas dans le schéma actuellement inventorié.
- Les paiements restent différés selon les décisions produit.
- Les fonctions et politiques Supabase sensibles nécessitent des tests de sécurité par rôles.

## 3. Contrôle de qualité

Un workflow GitHub Actions a été ajouté pour installer les dépendances, compiler l'application et vérifier TypeScript sur la branche de préparation et lors d'une future pull request vers `main`.

Au moment de cette note, aucun run GitHub Actions n'est encore apparu. Le workflow ne doit donc pas être considéré comme réussi.

## 4. Règles de livraison

- La branche de préparation est le seul espace de modification.
- Ne pas fusionner vers `main` sans recette et accord.
- Ne pas publier ni modifier Supabase dans cette phase.
- Ne pas annoncer comme fonctionnel un module qui n'a pas passé ses tests.
