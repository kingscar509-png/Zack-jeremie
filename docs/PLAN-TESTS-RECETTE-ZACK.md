# Zack — plan de tests et critères de recette

Date : 12 novembre 2026
Branche : `preparation/phase-1-frontend-plan`
Statut : scénarios à exécuter après installation des dépendances et configuration locale ; aucun test navigateur ni build n'a été exécuté depuis GitHub.

## 1. Préparation

- Utiliser Node.js compatible avec le socle TanStack Start et installer les dépendances depuis `package.json`.
- Copier `.env.example` vers `.env.local`.
- Renseigner uniquement l'URL Supabase et la clé publishable.
- Ne jamais copier une clé `service_role`, un secret marchand, un PIN ou un OTP dans le frontend.
- Configurer dans Supabase Auth les URLs de redirection locales et de production avant les tests de récupération de mot de passe.
- Utiliser des comptes de test distincts pour visiteur, client, membre entreprise et administrateur.
- Ne pas utiliser de données personnelles réelles pour les tests.

## 2. Tests du socle technique

| ID | Scénario | Résultat attendu |
|---|---|---|
| TEC-01 | Installer les dépendances | Installation sans conflit de dépendances. |
| TEC-02 | Démarrer le serveur de développement | Le serveur TanStack Start démarre et affiche l'accueil. |
| TEC-03 | Compiler la production | `vite build` et `tsc --noEmit` réussissent. |
| TEC-04 | Variables Supabase absentes | Les pages publiques affichent un état indisponible sans exposer de secret ni planter. |
| TEC-05 | Vérifier les bundles client | Aucun secret serveur ni clé privilégiée n'est présent. |
| TEC-06 | Ouvrir directement une route profonde | La route est rendue correctement après rechargement. |

## 3. Tests de l'espace public actuellement amorcé

| ID | Scénario | Résultat attendu |
|---|---|---|
| PUB-01 | Ouvrir l'accueil sans connexion | L'accueil s'affiche sans demander de compte. |
| PUB-02 | Charger les catégories | Seules les catégories actives sont affichées. |
| PUB-03 | Charger les entreprises | Seules les entreprises avec statut `verified` sont visibles. |
| PUB-04 | Base vide | Un état vide explicite apparaît ; aucune statistique fictive n'est affichée. |
| PUB-05 | Supabase indisponible | Un message d'indisponibilité apparaît, sans stack trace. |
| PUB-06 | Rechercher un terme | La recherche serveur interroge le champ `search_document` des entreprises vérifiées. |
| PUB-07 | Ouvrir une fiche entreprise | Une entreprise vérifiée est affichée par son slug. |
| PUB-08 | Ouvrir une fiche en attente ou rejetée | La fiche n'est pas exposée publiquement. |
| PUB-09 | Coordonnées absentes | Les coordonnées absentes ne créent pas de faux boutons de contact. |
| PUB-10 | Liens externes | Les liens externes utilisent `rel="noreferrer"` lorsqu'ils ouvrent un nouvel onglet. |

## 4. Authentification et profil

| ID | Scénario | Résultat attendu |
|---|---|---|
| AUTH-01 | Créer un compte valide | Supabase Auth reçoit l'inscription ; le message tient compte de la confirmation e-mail. |
| AUTH-02 | Mot de passe trop court | Le formulaire refuse l'envoi avant l'appel réseau. |
| AUTH-03 | Se connecter avec des identifiants valides | La session est créée et l'utilisateur arrive dans l'espace professionnel. |
| AUTH-04 | Identifiants incorrects | Message générique ; aucune information ne révèle si l'e-mail existe. |
| AUTH-05 | Demander un lien de récupération | Supabase envoie le lien si le compte existe ; message neutre côté interface. |
| AUTH-06 | Réinitialiser avec un lien valide | Le mot de passe est mis à jour. |
| AUTH-07 | Réinitialiser avec un lien expiré | Message d'erreur et possibilité de demander un nouveau lien. |
| AUTH-08 | Modifier son profil | L'utilisateur ne peut modifier que son propre profil via RLS. |
| AUTH-09 | Se déconnecter | La session est terminée et l'utilisateur revient à l'accueil. |
| AUTH-10 | Appeler une action sans session | L'action serveur refuse l'opération. |
| AUTH-11 | Créer un profil lors du premier usage professionnel | La ligne `profiles` est créée uniquement pour l'utilisateur connecté et dans le respect de RLS. |

## 5. Inscription d'une entreprise

| ID | Scénario | Résultat attendu |
|---|---|---|
| BIZ-01 | Soumettre sans être connecté | L'inscription est refusée. |
| BIZ-02 | Nom trop court ou invalide | La validation serveur refuse les données. |
| BIZ-03 | Slug déjà utilisé | Message clair ; aucune seconde entreprise n'est créée. |
| BIZ-04 | Créer une entreprise valide | La RPC `create_business` crée une entreprise en attente et le membre owner. |
| BIZ-05 | Ajouter ville et quartier | La ville est enregistrée dans `businesses.city`, le quartier dans `businesses.neighborhood`. |
| BIZ-06 | Vérifier la visibilité publique | La nouvelle fiche n'est pas visible avant validation. |
| BIZ-07 | Mettre à jour une entreprise d'un autre utilisateur | RLS refuse l'opération. |
| NOT-01 | Ouvrir ses notifications | Seules les notifications de l'utilisateur connecté sont affichées. |
| NOT-02 | Marquer une notification comme lue | Seule sa propre notification est mise à jour. |

## 6. Tests d'autorisation RLS obligatoires

- Un client ne lit ni ne modifie le profil d'un autre utilisateur.
- Un membre de l'entreprise A ne lit ni ne modifie les ressources privées de l'entreprise B.
- Un membre `editor` ne peut pas modifier les rôles d'administration.
- Un utilisateur sans permission admin ne peut pas appeler les RPC d'administration avec succès.
- Un utilisateur non connecté ne peut pas lire les avis en attente.
- Un utilisateur ne peut pas soumettre un avis au nom d'un autre utilisateur.
- Un utilisateur ne peut pas créer un produit pour une entreprise dont il n'est pas membre.
- Un utilisateur ne peut pas rattacher une image ou une catégorie produit à un produit d'une autre entreprise.
- Un visiteur ne peut lire que les entreprises vérifiées et les contenus publiés prévus par les politiques.
- Les insertions publiques d'événements statistiques sont testées contre les doublons, les types invalides et l'abus automatisé.

## 7. Responsive, accessibilité et expérience

- Vérifier 320 px, 375 px, 768 px, 1024 px et desktop large.
- Aucun débordement horizontal.
- Tous les champs ont un label associé.
- Les formulaires peuvent être utilisés au clavier.
- Les boutons indiquent l'état occupé et sont désactivés pendant l'envoi.
- Contraste suffisant, en particulier texte foncé sur jaune.
- Thèmes clair, sombre et automatique respectent les préférences système.
- Les images ont un texte alternatif approprié ou un alt vide lorsqu'elles sont décoratives.

## 8. Modules non implémentés car absents du schéma vérifié

L'inventaire actuel ne contient pas de tables dédiées aux conversations/messages, commandes/paniers, transactions/paiements ou abonnements Zack. Ces fonctionnalités ne doivent pas être simulées dans l'interface avec de fausses données.

Elles restent planifiées, mais nécessitent d'abord un modèle de données approuvé, des règles RLS, des transitions d'état et des tests serveur. Les paiements de commandes restent différés. MonCash est réservé à l'encaissement des abonnements Zack après validation de son flux marchand.

## 9. État de validation à date

- Audit statique de l'ancien frontend : effectué.
- Inventaire Supabase en lecture seule : effectué.
- Types TypeScript Supabase : générés depuis le schéma actuel et enregistrés dans le dépôt.
- Routes frontend initiales : écrites.
- Build TypeScript/Vite : non exécuté.
- Tests navigateur : non exécutés.
- Tests de sécurité avec comptes réels de test : non exécutés.
- Déploiement : non effectué.

Ne jamais marquer une étape comme réussie sans résultat de test observé.
