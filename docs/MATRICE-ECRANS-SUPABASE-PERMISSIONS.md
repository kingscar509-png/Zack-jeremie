# Zack — matrice des écrans, données Supabase et permissions

Date : 12 novembre 2026  
Branche : `preparation/phase-1-frontend-plan`  
Statut : document de conception — aucune migration ni modification Supabase n'est exécutée ici.

## 1. Règles de lecture et limites

Cette matrice s'appuie sur l'audit statique du frontend GitHub et sur l'inventaire Supabase communiqué. Elle ne remplace pas une introspection du schéma réel. Les noms de tables ci-dessous sont ceux déjà identifiés ; les colonnes, clés étrangères, contraintes, politiques RLS et signatures exactes des fonctions doivent être vérifiées avant tout développement connecté.

- **Existant identifié** : table, vue, bucket ou fonction signalé dans l'audit.
- **À concevoir** : écran ou flux à construire dans le nouveau frontend.
- **À confirmer** : relation ou détail technique non vérifié dans le schéma.
- Ne jamais considérer un bouton masqué dans l'interface comme une protection : chaque action doit être autorisée côté serveur et par RLS.
- Ne jamais placer une clé `service_role`, un secret de paiement, un PIN ou un OTP dans le navigateur.
- Le frontend ne doit pas inventer des statistiques, stocks, abonnements ou états que la base ne confirme pas.

## 2. Rôles et règles d'accès proposées

| Acteur | Accès attendu |
|---|---|
| Visiteur | Consulter les entreprises, produits, services et publications rendus publics. |
| Client connecté | Gérer son profil, favoris, avis, conversations, commandes et notifications qui lui appartiennent. |
| Propriétaire d'entreprise | Gérer uniquement les entreprises dont il est propriétaire ou membre autorisé. |
| Membre d'entreprise | Accéder uniquement aux fonctions permises par son rôle d'équipe et ses permissions. |
| Administrateur | Accéder aux outils d'administration selon les permissions attribuées et journalisées. |
| Système serveur | Exécuter les opérations privilégiées après validation de l'identité, des droits et des données. |

### Principes obligatoires

1. Toute ressource privée doit être filtrée par son propriétaire ou par l'appartenance à l'entreprise.
2. Les membres d'une entreprise ne reçoivent pas automatiquement les droits du propriétaire.
3. Une entreprise non vérifiée ne doit pas afficher de badge « vérifiée ».
4. Les opérations sensibles (validation d'entreprise, rôles admin, paiement, remboursement, changement de propriétaire) doivent passer par une logique serveur contrôlée et journalisée.
5. Les politiques RLS sont la barrière de sécurité en base ; les contrôles React ne sont qu'une amélioration d'expérience.
6. Vérifier les risques d'accès indirect : images, fichiers Storage, relations imbriquées, vues et fonctions RPC.

## 3. Matrice des 17 interfaces

| # | Écran / route indicative | Données identifiées | Actions principales | Accès attendu | État / points à confirmer |
|---:|---|---|---|---|---|
| 1 | Connexion / inscription — `/auth` | Supabase Auth, `profiles` | Créer un compte, se connecter, réinitialiser le mot de passe, fermer la session | Public pour inscription/connexion ; données du profil pour son propriétaire | Auth et profils existants. Confirmer les champs de profil, la création automatique du profil et les redirections sécurisées. |
| 2 | Accueil — `/` | `businesses`, `categories`, `posts`, `promotions`, `business_events`, `business_rating_summary` | Parcourir catégories, entreprises et contenus publics | Public ; uniquement contenu publié/visible | Tables et vue identifiées. Définir précisément les filtres de publication et les tris ; retirer toute donnée fictive. |
| 3 | Recherche — `/recherche` | `businesses`, `categories`, `products`, `services` | Rechercher, filtrer par catégorie et localisation, ouvrir une fiche | Public sur données publiques | Tables identifiées. Géographie structurée absente ou non confirmée ; stratégie d'indexation et recherche serveur à définir. |
| 4 | Fiche entreprise — `/entreprises/:slug` | `businesses`, `business_hours`, `business_media`, `categories`, `business_rating_summary`, `reviews`, `business_favorites` | Consulter identité, coordonnées, horaires, médias, avis ; ajouter/retirer favori | Public pour fiche publiée ; client connecté pour son favori | Données principales existantes. Confirmer slug, statut de visibilité, liens catégorie et règles de lecture des avis. |
| 5 | Détail produit — `/produits/:id` | `products`, `product_images`, `product_categories`, `businesses` | Consulter produit, images et entreprise ; contacter ou ajouter au panier lorsque disponible | Public si produit publié ; actions personnelles après connexion | Catalogue existant. Vérifier la relation produit-entreprise et corriger le risque signalé de rattachement d'un produit à une autre entreprise. |
| 6 | Détail service — `/services/:id` | `services`, `businesses` | Consulter description, conditions et coordonnées de l'entreprise | Public si service publié | Tables identifiées. Confirmer les champs, la disponibilité et les règles de publication. |
| 7 | Créer une publication — `/pro/publications/nouvelle` | `posts`, `businesses`, `business_members`, `business_media` / Storage | Rédiger, joindre média, enregistrer brouillon ou publier | Propriétaire ou membre autorisé pour cette entreprise | `posts` et médias identifiés. Définir rôles autorisés, modération, limites de fichiers et statut brouillon/public. |
| 8 | Promotions et événements — `/pro/contenus` | `promotions`, `business_events`, `businesses` | Créer, modifier, désactiver promotions et événements | Propriétaire ou membre autorisé | Tables identifiées. Confirmer dates, fuseau horaire, expiration, publication et règles de visibilité. |
| 9 | Messagerie — `/messages` | Aucune table de messagerie identifiée | Lister conversations, envoyer et recevoir messages, pièces jointes, états de lecture | Participants uniquement ; équipe selon règles explicites | **À construire en base** : conversations, participants, messages, pièces jointes et éventuellement états de lecture. RLS stricte indispensable. |
| 10 | Profil personnel — `/profil` | `profiles`, `business_favorites`, `reviews`, `notifications`, `notification_preferences` | Modifier profil, gérer favoris, consulter ses avis et préférences | Utilisateur connecté, uniquement ses données | Tables identifiées. Le profil est signalé privé ; prévoir une projection publique limitée si un nom d'auteur doit être affiché sur un avis. |
| 11 | Espace professionnel — `/pro` | `businesses`, `business_members`, `business_hours`, `business_media`, `products`, `services`, `posts`, `promotions`, `business_events` | Modifier fiche, horaires, catalogue et contenus ; gérer accès équipe selon permissions | Propriétaire/membre autorisé pour l'entreprise sélectionnée | Plusieurs tables existent. Clarifier le modèle de sélection d'entreprise et les permissions par action. |
| 12 | Notifications — `/notifications` | `notifications`, `notification_preferences`, `push_subscriptions` | Lire, marquer comme lue, configurer préférences, gérer abonnement push | Utilisateur connecté, uniquement ses notifications et abonnements | Tables identifiées. Confirmer le modèle d'appartenance, les événements générateurs et la suppression des tokens push. |
| 13 | Panier / commande — `/panier`, `/commandes/nouvelle` | Aucune table de commande identifiée ; catalogue `products`, `businesses` | Préparer une demande, préciser quantité et coordonnées, envoyer une commande | Client connecté ; entreprise destinataire selon accès défini | **À construire en base** : commandes, lignes, états, adresses/contact et historique. Au lancement, commande sans paiement en ligne. |
| 14 | Paiement — `/paiement` | Aucune table de paiement/abonnement identifiée | Payer un abonnement Zack via MonCash ; consulter résultat | Utilisateur autorisé à acheter l'abonnement ; validation côté serveur | **À construire en base et serveur** : tentatives, références fournisseur, montants, devise, statuts, idempotence et journal. Ne pas activer le paiement de commandes au lancement. |
| 15 | Historique des transactions — `/transactions` | Aucune table de transaction identifiée | Consulter reçus et statuts de ses paiements | Utilisateur concerné ; admin selon permission | **À construire en base**. Ne montrer que les transactions confirmées par vérification serveur. |
| 16 | Suivi de commande — `/commandes/:id` | Aucune table de commande identifiée | Voir statut, détails et échanges liés à la commande | Client propriétaire et entreprise destinataire ; admin selon permission | **À construire en base** : transitions de statut contrôlées, horodatage et historique. Pas de faux suivi si l'entreprise n'a pas mis à jour le statut. |
| 17 | Administration — `/admin` | `admin_roles`, `admin_audit_log`, `site_settings`, `businesses`, `business_stats_events`, fonctions admin existantes | Vérifier entreprises, gérer paramètres et administrateurs, consulter statistiques et journal | Administrateur avec permission explicite par action | Tables et fonctions signalées existantes. Vérifier signatures, droits d'exécution, RLS et journalisation avant branchement. Ne jamais faire confiance à un email codé dans le frontend. |

## 4. Inventaire de données connu et usage prévu

| Table / vue / bucket | Usage frontend | Contrôle à effectuer avant intégration |
|---|---|---|
| `profiles` | Profil personnel et informations limitées d'auteur | Confirmer colonnes, visibilité publique et règles de modification. |
| `admin_roles` | Attribution des permissions d'administration | Vérifier qui peut lire/modifier, et comment le serveur confirme le rôle. |
| `business_members` | Accès des collaborateurs aux entreprises | Vérifier rôles, permissions granulaires et retrait d'accès. |
| `businesses` | Identité et fiche entreprise | Vérifier propriétaire, statut, catégorie, visibilité et géographie. |
| `business_hours` | Horaires | Vérifier jours, exceptions et fuseau horaire. |
| `business_media` | Photos et médias d'entreprise | Vérifier chemins Storage, taille, type et droits de suppression. |
| `categories` | Catégories | Relier proprement les catégories aux entreprises et produits. |
| `products` | Catalogue produits | Vérifier propriétaire entreprise, publication, prix et stock uniquement si ces champs existent. |
| `product_images` | Images produits | Vérifier l'appartenance de l'image au produit et à l'entreprise. |
| `product_categories` | Classement des produits | Vérifier intégrité des relations. |
| `services` | Catalogue services | Vérifier publication et appartenance à l'entreprise. |
| `posts` | Publications | Vérifier auteur, entreprise, statut et modération. |
| `promotions` | Promotions | Vérifier dates et conditions. |
| `business_events` | Événements d'entreprise | Vérifier dates, visibilité et expiration. |
| `reviews` | Avis clients | Vérifier auteur, modération, modification et suppression. Un bug de trigger est signalé. |
| `business_favorites` | Favoris d'entreprises | Vérifier unicité et accès limité au propriétaire du favori. |
| `reports` | Signalements | Vérifier confidentialité et accès admin. |
| `business_rating_summary` (vue) | Note moyenne et agrégats publics | Vérifier que la vue ne divulgue aucune donnée privée et reflète uniquement les avis admissibles. |
| `business_interactions` | Interactions | Vérifier consentement, déduplication et finalité. |
| `business_stats_events` | Événements statistiques | À conserver ; vérifier anti-fraude, déduplication et accès aux agrégats. |
| `notifications` | Notifications utilisateur | Vérifier destinataire et droits de lecture. |
| `notification_preferences` | Préférences de notification | Vérifier modification par le seul utilisateur concerné. |
| `push_subscriptions` | Tokens push | Vérifier confidentialité, rotation et révocation. |
| `admin_audit_log` | Journal des actions admin | À conserver ; append-only autant que possible, lecture réservée. |
| `site_settings` | Paramètres globaux | Lecture publique limitée ; écriture admin contrôlée. |
| `zack-public-media` (bucket) | Médias publics Zack | Confirmer politiques Storage, types autorisés, taille de 20 Mo signalée et chemins non devinables pour les ressources privées. |

## 5. Fonctions administratives déjà signalées

Les fonctions ci-dessous ont été mentionnées dans l'audit et doivent être conservées pendant la préparation. Leurs signatures exactes, leur propriétaire, leur mode `SECURITY DEFINER`, leur `search_path`, leurs privilèges `EXECUTE` et leur logique interne restent à inspecter avant utilisation.

- `business_stats(id, jours)`
- `admin_add_admin(email, permissions)`
- `admin_list_admins()`
- `admin_remove_admin(id)`

La présence d'une fonction ne prouve pas qu'elle est sûre. Vérifier qu'un utilisateur non autorisé ne peut pas l'appeler directement, que les permissions sont contrôlées dans la fonction, et que les actions importantes sont inscrites dans `admin_audit_log`.

## 6. Modèle de données manquant à prévoir — sans créer maintenant

Les fonctionnalités suivantes ne figurent pas dans l'inventaire communiqué. Elles nécessiteront une conception dédiée avant toute migration.

### Messagerie
- Conversations et participants.
- Messages, auteur, contenu, horodatage et état.
- Pièces jointes avec contrôle d'accès.
- Règle d'accès : un utilisateur ne lit que les conversations auxquelles il participe.

### Commandes
- Commande, client, entreprise destinataire et lignes de commande.
- Instantané du nom/prix du produit au moment de la commande, si applicable.
- Statuts et historique des changements.
- Règle d'accès : client propriétaire, entreprise destinataire et administrateur autorisé.

### Paiements et abonnements Zack
- Abonnement, offre, période, statut et historique.
- Tentative de paiement et référence MonCash.
- Montant/devise attendus, statut fournisseur, dates et identifiant d'idempotence.
- Vérification serveur de la transaction auprès du fournisseur avant de marquer comme payée.
- Les PIN et OTP restent exclusivement dans le parcours officiel MonCash ; ils ne sont jamais enregistrés dans Zack.
- Pas de paiement en ligne des commandes au lancement. NatCash uniquement après obtention de sa documentation officielle et validation technique/juridique.

### Géographie nationale
- Référentiel structuré pour départements, communes, sections/localités ou niveaux retenus après validation des sources.
- Conserver une saisie d'adresse descriptive en complément du référentiel.
- Ne pas limiter les données à Jérémie ; la plateforme vise toute Haïti.
- Valider les libellés, limites administratives et cas d'adresses non géocodées avant migration.

### Équipe et permissions
- Définir les rôles possibles par entreprise.
- Définir les actions par permission (fiche, catalogue, contenus, messages, commandes).
- Prévoir invitations, acceptation, révocation et journalisation.

## 7. Ordre de réalisation recommandé

1. **Cartographier précisément l'existant** : colonnes, clés, contraintes, index, RLS, triggers, fonctions et Storage. Exporter le schéma sans données personnelles.
2. **Corriger les bugs existants** : trigger des avis en attente, double journal de changement de statut, dates de mise à jour, statistiques et intégrité produit/entreprise. Conserver `business_stats_events` et les fonctions admin jusqu'à audit.
3. **Construire le socle frontend** : authentification SSR/cookies, clients Supabase séparés navigateur/serveur, routes publiques/pro/admin, composants et design system.
4. **Migrer les interfaces existantes** : accueil, recherche, fiche entreprise, produit/service, espace professionnel, profil et notifications.
5. **Ajouter géographie nationale et équipe** après validation du modèle.
6. **Concevoir puis développer la messagerie** avec RLS.
7. **Concevoir puis développer commandes et suivi**, sans paiement en ligne au départ.
8. **Concevoir puis intégrer abonnements Zack et MonCash** après validation du compte marchand, de la documentation, des callbacks/webhooks et du parcours de vérification.
9. **Ajouter les paiements de commandes** seulement après validation juridique et technique ; NatCash plus tard si documentation officielle disponible.

## 8. Contrôles de recette minimum

- Un visiteur ne peut lire aucune donnée privée.
- Un client ne peut modifier ni lire le profil, les favoris, avis privés, notifications ou commandes d'un autre client.
- Un membre d'entreprise ne peut pas accéder aux données d'une autre entreprise en changeant un identifiant dans l'URL ou la requête.
- Un membre ne peut exécuter que les actions accordées par son rôle.
- Un admin sans permission précise ne peut pas effectuer l'action correspondante.
- Une entreprise non vérifiée ne reçoit jamais le badge vérifiée par simple modification du navigateur.
- Une image ne peut pas être associée à un produit ou une entreprise non autorisés.
- Un paiement n'est confirmé qu'après vérification serveur de la référence, du montant, de la devise et du statut.
- La répétition d'un callback ou d'une requête de paiement ne crée pas de double débit ni de double abonnement.
- Les commandes sont clairement affichées comme « demande envoyée / en attente » et non comme payées.
- Les statistiques sont calculées à partir d'événements valides et ne sont pas modifiables par le client.
- Les interfaces sont utilisables sur mobile et ordinateur, en français, pour l'ensemble d'Haïti.

## 9. Ce qui reste nécessaire pour passer de cette matrice à un plan d'implémentation exact

- Schéma SQL réel ou export `pg_dump --schema-only` (sans données).
- Définitions des politiques RLS, fonctions et triggers.
- Configuration des buckets et politiques Storage.
- Liste des variables d'environnement **par nom uniquement**, sans aucune valeur secrète.
- Confirmation des statuts d'entreprise, publication, avis et rôles réellement utilisés.

**Aucune table, fonction, politique, donnée ou configuration Supabase n'a été modifiée lors de la rédaction de ce document.**
