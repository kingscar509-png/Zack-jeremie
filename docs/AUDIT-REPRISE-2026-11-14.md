# Zack — audit de reprise technique

Date : 14 novembre 2026  
Branche auditée : `preparation/phase-1-frontend-plan`  
Projet Supabase : `hwuwqalazmrmdxseawnm`  
Statut : audit GitHub et Supabase effectué en lecture seule, avec corrections frontend et documentaires sur la branche de préparation uniquement.

## 1. Protection Git

- Branche de travail présente : `preparation/phase-1-frontend-plan`.
- Branche officielle : `main`.
- Aucune écriture n'a été faite sur `main`.
- Aucun merge, déploiement ou publication n'a été effectué.
- La branche de préparation et `main` ont divergé ; ne pas lancer de fusion automatique. Refaire une comparaison avant toute opération d'intégration.

## 2. Frontend : distinction entre application et prototypes

### Application React réellement amorcée

Socle présent : React, TypeScript, TanStack Start/Router, Vite, Tailwind, `@supabase/ssr` et Supabase JS.

Routes actuellement présentes :
- Accueil national ;
- recherche d'entreprises ;
- fiche publique d'entreprise vérifiée ;
- inscription, connexion, récupération et réinitialisation du mot de passe ;
- profil ;
- notifications ;
- espace professionnel initial avec liste des entreprises gérées et formulaire d'inscription.

Le nouveau frontend utilise des fonctions serveur pour certaines lectures et opérations. Il n'est pas encore une reconstruction complète de toutes les fonctions de l'ancienne application.

### Maquette `Index.html`

Le fichier racine `Index.html` est une maquette d'interface d'environ 129 Ko. Il contient des écrans de démonstration pour l'accueil, l'exploration, les produits, promotions, événements, panier, messagerie, espace professionnel, abonnements et administration, ainsi que des contrôles de langue et d'affichage.

Cette maquette ne contient aucune référence au client Supabase et ne constitue pas une application connectée au backend. Elle doit servir de référence visuelle et fonctionnelle, pas être considérée comme une fonctionnalité opérationnelle.

### Écrans encore absents du frontend React

- gestion détaillée de l'entreprise et de son catalogue ;
- tableau de bord d'administration et gestion des permissions ;
- messagerie privée ;
- panier et commandes multi-vendeurs ;
- interfaces d'abonnement et de paiement MonCash.

## 3. Vérification du build

Le workflow GitHub Actions `Zack frontend checks` a été consulté avec ses journaux.

Cause initiale identifiée : le callback `setAll` dans `src/lib/supabase/server.ts` utilisait une signature à deux arguments incompatible avec la version installée de `@supabase/ssr` (`^0.8.0`). Cette incompatibilité empêchait TypeScript d'inférer correctement les types Supabase et produisait des erreurs en cascade.

Corrections effectuées sur la branche de préparation :
- adaptation du callback de cookies à la signature de la version installée ;
- ajout de l'en-tête `Cache-Control: private, no-store` sur les réponses utilisant le client serveur ;
- transmission de `undefined` pour les arguments RPC facultatifs de création d'entreprise au lieu de `null`, conformément aux types générés.

Le workflow a ensuite réussi sur le commit `a1a35ca7998ed951e651bfa0313e31e6bba95a7a` :
- installation des dépendances : réussie ;
- build Vite de production : réussie ;
- `tsc --noEmit` : réussie.

Le HEAD documentaire `705928ee3c69c4667977f1b38b756ec6f1f42903` a également passé le workflow `Zack frontend checks` (run GitHub Actions `43591633231`) : installation, build Vite et typecheck réussis. Le dernier contrôle disponible au moment de cette vérification est donc vert.
Après l'enregistrement de cet audit, le commit courant `f7e929ecd2c2a060b8817c603095c8438145a9b3` a également passé le workflow GitHub Actions `43591719794` avec succès (installation, build Vite et typecheck).

Limites restantes :
- aucun test complet dans un navigateur n'a été effectué ;
- aucun test réel sur Android n'a été effectué ;
- aucun test d'autorisation avec des comptes de rôles distincts n'a été effectué ;
- aucun lockfile npm n'apparaît dans l'arborescence auditée ; l'installation CI utilise `npm install`, donc la résolution des dépendances n'est pas encore verrouillée.

## 4. Supabase : état observé

Projet actif, PostgreSQL 17.11.

- 24 tables dans `public`.
- RLS activé sur les 24 tables.
- 21 migrations enregistrées.
- Aucune Edge Function déployée.
- Bucket `zack-public-media` présent et public.
- Tables de profils, entreprises, membres, catalogue, avis, notifications, rôles et audit présentes.
- `business_stats_events` présent, avec clé étrangère facultative vers `products`.

Aucune table dédiée aux abonnements, paiements MonCash, conversations/messages ou commandes n'existe dans l'inventaire actuel.

## 5. Sécurité et performance

- 26 fonctions `SECURITY DEFINER` existent dans le schéma public ; l'advisor Supabase signale 11 fonctions accessibles au rôle `authenticated`. Elles doivent être examinées individuellement.
- 44 avertissements de policies permissives multiples ont été signalés par l'advisor de performance. Ne pas supprimer ou fusionner ces policies en bloc.
- L'advisor signale une clé étrangère non indexée sur `business_stats_events.product_id`.
- La protection contre les mots de passe compromis est désactivée sur l'offre actuelle.
- L'advisor de santé ne signale aucun problème.
- La fonction `log_admin_content_action()` ne donne actuellement le droit EXECUTE qu'à `postgres` dans les privilèges de routine vérifiés ; ses sept triggers existent toujours.
- Le bucket média est public, mais les policies d'écriture et de modification observées limitent les actions aux membres autorisés selon le chemin d'entreprise.

Aucune policy, fonction, table, migration, clé ou configuration Supabase n'a été modifiée pendant cet audit.

## 6. Abonnements et MonCash

La référence actuelle est `docs/ABONNEMENTS-MONCASH-ZACK.md`.

Décisions documentées :
- Gratuit : 0 HTG/mois ;
- Pro : 750 HTG/mois ;
- Ultra : 1 000 HTG/mois ;
- abonnement individuel à chaque entreprise ;
- paiement MonCash manuel et vérifié par un administrateur ;
- plusieurs comptes destinataires possibles, un seul actif pour les nouvelles demandes ;
- snapshots immuables du prix et du compte destinataire ;
- aucun paiement en ligne des commandes au lancement ;
- NatCash reporté.

Aucune migration d'abonnement ni activation de paiement n'a été effectuée. La prochaine étape backend est de finaliser le modèle, les transitions, les autorisations et les tests avant toute migration.

## 7. PWA et expérience mobile

Le CSS React contient des règles responsive, dont des points de rupture à 760 px et 480 px. Cela ne constitue pas un test sur appareil réel.

Aucun manifeste PWA, service worker ou icône PWA n'a été trouvé dans l'arborescence auditée. La préparation PWA reste à faire.

## 8. Priorités de reprise

1. Vérifier le résultat du dernier workflow GitHub Actions après les mises à jour documentaires.
2. Ajouter un lockfile npm et verrouiller l'installation CI.
3. Finaliser l'inventaire et les tests des permissions existantes, sans révocation massive.
4. Finaliser le schéma d'abonnements et MonCash au niveau de chaque entreprise.
5. Définir et tester les opérations serveur de demande, soumission, vérification, activation et expiration.
6. Développer les interfaces professionnelles et administratives manquantes.
7. Concevoir séparément les tables et fonctions de messagerie et de commandes multi-vendeurs selon les décisions existantes.
8. Réaliser les tests navigateur, Android, accessibilité, sécurité et PWA.

## 9. Actions réalisées pendant cette reprise

- Lecture du dépôt, de la branche, des derniers fichiers et des documents de conception.
- Inspection de la maquette `Index.html` et des routes React.
- Lecture des journaux du workflow ayant échoué.
- Correction du client Supabase SSR et des arguments RPC facultatifs.
- Exécution du workflow GitHub Actions jusqu'à obtention d'un build et d'un typecheck réussis sur le commit indiqué ci-dessus.
- Actualisation des documents d'abonnement et de MonCash.
- Audit Supabase en lecture seule.

Aucun déploiement, merge vers `main`, paiement, création de table ou changement de permission Supabase n'a été réalisé.
