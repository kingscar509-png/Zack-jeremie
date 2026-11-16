# Zack — plan de tests et critères de recette


## Avancement complémentaire — 16 novembre 2026



### Commandes, stock et annulations — 16 novembre 2026

- Le panier est maintenant agrégé par produit côté serveur : deux lignes identiques ne créent plus des lignes de commande incohérentes.
- `place_order` verrouille les lignes produits dans un ordre stable avant la validation du stock. Cela protège contre les ventes simultanées qui dépasseraient le stock disponible.
- Le vendeur peut accepter ou refuser chaque article d'une commande depuis son espace. Le refus d'un article remet son stock en réserve disponible ; un article déjà décidé ne peut pas être décidé une seconde fois.
- Le client peut annuler une commande tant que son statut est encore `pending`. L'annulation remet le stock réservé et notifie le vendeur.
- Tests transactionnels avec rollback : deux lignes du même produit (2 + 3 unités) ont créé une seule ligne de commande de 5 unités et réduit le stock de 10 à 5 ; annulation client et refus vendeur ont chacun rétabli le stock de 6 à 10 et produit les statuts `cancelled` et `rejected`.
- Tous les produits temporaires de test ont été annulés par rollback ; vérification après test : 0 produit temporaire persistant.
- Une erreur de contrainte sur le type de notification d'annulation a été détectée durant le test, corrigée en utilisant le type autorisé `order_update`, puis le test a réussi.
- Le RPC `admin_list_payment_recipients()` a été converti en `SECURITY INVOKER` : il ne contourne plus RLS. Tests transactionnels : le principal administrateur voit les deux destinataires actifs ; un utilisateur non administrateur n'en voit aucun.

### Dernière passe — 16 novembre 2026 (complément)

- Les rapports utilisateurs sont désormais lisibles par leur auteur connecté, sans élargir la lecture des rapports d'autres utilisateurs.
- Le traitement d'un rapport par l'administration est enregistré en base avec le statut `reviewed`, l'administrateur et l'horodatage.
- Le sélecteur d'état de commande a été corrigé : les options visibles correspondent aux transitions réellement autorisées par `seller_set_order_status`. Les états en attente, acceptation/refus et annulation ne sont plus présentés comme des transitions vendeur valides.
- Le panneau de commandes précise maintenant que le paiement reste directement entre le client et le vendeur, hors Zack.
- Le principal administrateur peut charger les destinataires MonCash/NatCash avec leurs identifiants et états grâce au RPC `admin_list_payment_recipients()`. Les utilisateurs non administrateurs continuent de ne voir que les numéros actifs via `get_payment_recipients()`.
- Le RPC de liste des destinataires a été testé dans une transaction avec le rôle `authenticated` et l'identité du principal administrateur : deux destinataires actifs retournés.
- Migration Supabase enregistrée : `reports_self_read_and_admin_payment_recipient_listing` (policy de lecture personnelle des rapports, RPC admin de lecture des destinataires et verrouillage définitif du bootstrap principal).
- GitHub Actions : contrôles syntaxe/structure réussis sur le commit `0cc8aaec14f4f7aa0dbaaea64e7dce7e9df628fe`.

### Actions supplémentaires raccordées ou sécurisées

- Les signalements de fiches entreprise/produits/services/promotions/événements sont maintenant enregistrés dans `public.reports`, avec l'entreprise concernée et le compte auteur lorsqu'il est connecté.
- Une policy RLS permet à chaque utilisateur connecté de consulter uniquement ses propres signalements ; les administrateurs conservent leur accès selon leur permission `reports`.
- Le traitement administratif d'un signalement met maintenant à jour son statut dans Supabase (`reviewed`) avec l'identité et l'heure de traitement.
- Le changement de disponibilité d'un produit met à jour `products.is_available` dans Supabase au lieu de changer uniquement l'affichage local.
- Les actions de modération administrative qui n'avaient pas de fonction serveur sûre ont été neutralisées : elles ne prétendent plus enregistrer une suspension, une suppression, une annonce, une réponse support ou un paramètre qui resterait seulement dans le navigateur.
- Les fonctions locales des modules Professionnel indépendant, Réseau Zack et Marché B2B sont neutralisées pour cette première version ; le Marché B2B reste « À venir ».
- La fonction de bootstrap `claim_main_admin()` n'est plus exécutable par `anon` ou `authenticated`, car le rôle principal est déjà attribué. La vérification SQL confirme que seuls `postgres` et `service_role` peuvent encore l'exécuter.
- Un RPC `admin_list_payment_recipients()` réservé à l'administrateur principal a été ajouté pour charger les identifiants et états de tous les numéros MonCash/NatCash dans l'écran d'administration. Test transactionnel avec le rôle authentifié et le principal admin : les deux destinataires actifs sont retournés.
- GitHub Actions a réussi les contrôles syntaxe/structure HTML sur le commit `1db2ce61f3b70bbdde05f9cb2408a3f31f12dad3`.

### Actions volontairement non activées

- Les tickets de support ne sont pas encore enregistrés dans une table dédiée ; le formulaire ne prétend donc plus envoyer un ticket.
- Les photos de profil ne sont pas encore envoyées vers un stockage dédié ; l'action ne prétend plus les sauvegarder en ligne.
- Les invitations d'équipe n'ont pas encore de parcours complet d'acceptation/notification ; elles ne sont pas annoncées comme opérationnelles.
- Les suspensions administratives d'utilisateurs, de profils pro ou de livreurs ne sont pas actives tant qu'un flux serveur d'administration n'est pas défini et testé.
- Les actions de suppression/modération de contenu qui n'ont pas de journalisation serveur adaptée restent bloquées.

### Sécurité Supabase après les corrections

- `claim_main_admin()` n'est plus accessible aux utilisateurs authentifiés.
- `business_counts(uuid)` n'est plus accessible à `anon` ni à `authenticated` ; elle reste réservée à `service_role`.
- La lecture des messages et les mises à jour de `read_at` sont limitées aux participants autorisés.
- Les alertes restantes du Security Advisor comprennent 22 fonctions `SECURITY DEFINER` accessibles aux utilisateurs authentifiés. Elles ont été examinées individuellement : les fonctions d'administration vérifient les rôles/permissions dans leur corps ; les fonctions de commande, abonnement, livreur et gestion d'entreprise vérifient l'identité et les droits métier. Ces alertes ne doivent pas être effacées par une révocation globale qui casserait les opérations.
- `business_publication_usage` reste volontairement privée, sans policy d'accès direct.
- La protection des mots de passe compromis reste à activer dans les paramètres Auth du projet.


## Mise à jour prioritaire — 16 novembre 2026

Cette mise à jour remplace les informations devenues obsolètes dans les sections ci-dessous.

- Frontend officiel de la phase 1 : `index complet.html`, branche `preparation/phase-1-frontend-plan`. Le frontend React/TanStack de `src/` n'est pas la référence active pour cette phase.
- Le schéma Supabase contient déjà les tables des conversations/messages, commandes/lignes, livreurs/zones, avis, publications, événements, établissements, forfaits, abonnements, paiements et destinataires MonCash/NatCash.
- Les contrôles CI de syntaxe JavaScript inline et de structure du frontend HTML passent sur le commit `7f8eecbc3777eb054e8e418f77fbf143239ebb9b`.
- L'authentification Supabase comprend connexion, inscription, demande de récupération et formulaire de nouveau mot de passe.
- Les actions métier principales sont raccordées à Supabase : création d'entreprise/produit/service/promotion/événement, commandes, messagerie, favoris, profil, avis vérifiés, affectation livreur, statuts de commande, demande d'abonnement et revue administrative des paiements.
- Les politiques RLS de lecture et de mise à jour des messages ont été resserrées afin que seuls le client de la conversation ou les membres autorisés de l'entreprise puissent y accéder.
- Les fonctions d'invitation d'équipe, de demande de correction et de signalement d'incident restent désactivées dans le frontend tant qu'elles ne disposent pas d'un flux serveur adapté. Les médias de certains formulaires ne sont pas encore tous envoyés vers Storage.
- Les tests transactionnels backend des quotas, établissements, publications, renouvellements et avis vérifiés ont été exécutés avec rollback.
- Aucun test navigateur réel avec sessions Supabase n'a encore été exécuté. Les tests d'inscription, confirmation e-mail, connexion, récupération, permissions multi-rôles et recette complète restent obligatoires.
- Aucune preview HTTPS n'a encore été déployée.
- Le Security Advisor signale encore la protection contre les mots de passe compromis désactivée et des fonctions `SECURITY DEFINER` à examiner individuellement. La table `business_publication_usage` sans policy directe est volontairement privée.

### Séquence restante avant la recette finale

1. Terminer le raccordement des médias/Storage et des actions de gestion encore locales.
2. Auditer individuellement les RPC `SECURITY DEFINER` restantes et les permissions.
3. Configurer les URL autorisées Supabase Auth et activer la protection contre les mots de passe compromis.
4. Préparer une preview HTTPS sans fusionner vers `main`.
5. Tester avec des comptes distincts client, entreprise, livreur et administrateur, puis vérifier les journaux et RLS.
6. Corriger les défauts observés avant de déclarer les espaces opérationnels.

Les paiements de commandes restent directs entre client et vendeur, hors Zack. Les abonnements sont réglés manuellement par MonCash ou NatCash et activés après vérification réelle. Fournisseurs et Marché B2B restent « À venir ».

---


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
