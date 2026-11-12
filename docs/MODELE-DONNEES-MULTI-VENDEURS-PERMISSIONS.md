# Zack — Modèle de données multi-vendeurs et permissions d'équipe

**Date :** 12 novembre 2026  
**Branche :** `preparation/phase-1-frontend-plan`  
**Statut :** conception fonctionnelle et technique — À REVOIR — NON EXÉCUTÉ  
**Portée :** Haïti entière ; panier multi-vendeurs ; messagerie et commandes avec permissions configurables.

## 1. Décisions produit confirmées

- Le panier peut contenir des produits de plusieurs entreprises.
- À la validation, Zack crée un achat global qui regroupe une commande distincte pour chaque entreprise vendeuse.
- Chaque commande vendeur est traitée indépendamment : acceptation, préparation, retrait/livraison, annulation et notifications.
- Un compte Zack est obligatoire pour passer commande.
- Le panier reste local au lancement.
- Les commandes ne sont pas payées en ligne au lancement. Le paiement se fait directement entre client et entreprise, hors plateforme.
- Les visiteurs non connectés peuvent envoyer un premier message à une entreprise via un formulaire public dédié ; ils ne peuvent pas lire les conversations privées.
- Les droits d'accès à la messagerie et aux commandes sont configurables par entreprise.
- Owner et Admin contrôlent les autorisations ; un Editor ne reçoit pas automatiquement l'accès aux messages ou aux commandes.
- MonCash reste réservé aux abonnements Zack au lancement ; NatCash est ultérieur.

## 2. Architecture de commande multi-vendeurs

### 2.1 Principe

Ne pas enregistrer tous les articles dans une seule commande avec le vendeur du premier produit. Cette erreur du prototype HTML est explicitement interdite.

Le modèle recommandé comporte deux niveaux :

1. **`checkout_batches` — achat global** : représente la validation unique du panier par le client.
2. **`orders` — commandes vendeurs** : une ligne par entreprise présente dans le panier. Chaque commande appartient à un seul vendeur et est rattachée à l'achat global.

La table `order_items` contient les lignes d'une seule commande vendeur.

Exemple : panier contenant 2 produits de l'entreprise A et 1 produit de l'entreprise B :
- un `checkout_batch` ;
- commande vendeur A avec ses deux lignes ;
- commande vendeur B avec sa ligne.

### 2.2 Champs proposés

#### `checkout_batches` (nouvelle table)
- `id` UUID, clé primaire.
- `checkout_number` référence publique unique et non devinable.
- `customer_id` UUID obligatoire vers `auth.users`.
- `status` : `submitted`, `partially_completed`, `completed`, `partially_cancelled`, `cancelled` (statut global dérivé ou maintenu par logique serveur, à décider lors du SQL final).
- `created_at`, `updated_at`.

Ne pas stocker un total global unique si plusieurs commandes utilisent des devises différentes ou des frais propres à chaque vendeur. Les montants restent d'abord au niveau des commandes vendeurs. Un récapitulatif peut afficher des sous-totaux par devise.

#### `orders` (table proposée, à adapter)
- `id` UUID.
- `checkout_batch_id` UUID obligatoire vers `checkout_batches`.
- `order_number` référence unique par commande vendeur.
- `business_id` UUID obligatoire : une seule entreprise par commande.
- `customer_id` UUID obligatoire.
- `customer_name`, `customer_phone` : instantanés des coordonnées au moment de l'achat.
- `fulfillment_method` : `pickup` ou `delivery`.
- `delivery_address` : obligatoire seulement pour `delivery`, facultatif/interdit selon règle finale pour `pickup`.
- `customer_note`.
- `status` : `submitted`, `accepted`, `preparing`, `ready`, `completed`, `cancelled` ; transitions contrôlées côté serveur.
- `currency` et `subtotal` : montants de cette commande uniquement.
- `created_at`, `updated_at`.

#### `order_items`
- `order_id` obligatoire.
- `product_id` nullable pour conserver l'historique si le produit est supprimé/archivé.
- `product_name` : instantané du nom.
- `quantity`, `unit_price`, `currency`, `line_total` : valeurs calculées et enregistrées côté serveur au moment de la commande.

Prévoir une contrainte ou une validation serveur qui garantit que chaque produit appartient au même `business_id` que sa commande. Une simple vérification côté navigateur est insuffisante.

### 2.3 Création atomique côté serveur

Une seule Edge Function de validation de panier doit :
1. exiger un utilisateur authentifié et récupérer son identité depuis le JWT vérifié ;
2. valider les données et dédupliquer les lignes du panier ;
3. relire chaque produit dans Supabase, vérifier qu'il existe, est disponible, appartient à une entreprise autorisée et que sa devise/prix sont cohérents ;
4. regrouper les lignes par `business_id` ;
5. calculer les prix, sous-totaux et montants à partir des données serveur, jamais des totaux fournis par le navigateur ;
6. créer le `checkout_batch`, toutes les commandes vendeurs et leurs lignes dans une transaction atomique ;
7. attribuer des numéros de référence uniques ;
8. retourner au client le récapitulatif de toutes les commandes créées.

Si une entreprise ou un produit échoue à la validation, la règle recommandée au lancement est de refuser toute la validation et d'expliquer au client les lignes à corriger, plutôt que de créer silencieusement une commande partielle.

Une clé d'idempotence côté serveur est à prévoir pour éviter les doublons si le client réessaie après une coupure réseau. La stratégie exacte (clé unique liée au client et à la tentative, durée de conservation) sera détaillée dans l'implémentation.

### 2.4 Statuts et expérience utilisateur

- Chaque vendeur ne voit et ne modifie que sa propre commande.
- Le client voit l'achat global et toutes les commandes vendeurs associées.
- Chaque entreprise peut accepter, refuser/annuler selon les règles à définir, préparer, marquer prête, puis terminée.
- Le statut global du checkout ne doit pas remplacer les statuts individuels.
- Le statut global doit être calculé à partir des commandes enfants ou mis à jour par une logique serveur fiable ; ne pas laisser le client l'écrire.
- Les notifications sont envoyées séparément au client et à chaque entreprise concernée.
- Les frais de livraison, délais et zones de livraison sont propres à chaque vendeur. Ils ne doivent pas être additionnés ou promis avant que chaque entreprise les ait confirmés.
- Une commande peut être en retrait tandis qu'une autre est en livraison.

## 3. Permissions configurables pour les équipes

### 3.1 Décision

Les options « permission » sont retenues pour la messagerie et les commandes. Le rôle `owner`, `admin` ou `editor` ne suffit pas à lui seul à déterminer tous les accès.

Le modèle doit séparer :
- l'appartenance à l'entreprise (`business_members`, déjà existante) ;
- les capacités métier explicitement accordées à chaque membre.

### 3.2 Table proposée : `business_member_permissions`

Une table de permissions par membre et entreprise est recommandée :
- `business_id` UUID ;
- `user_id` UUID ;
- `permission_key` parmi `messages_read`, `messages_reply`, `orders_read`, `orders_manage` ;
- `granted_by` UUID ;
- `created_at`, `updated_at`.
- clé unique sur (`business_id`, `user_id`, `permission_key`).

Le modèle peut évoluer vers une table de rôles personnalisés si Zack en a réellement besoin, mais cette complexité n'est pas nécessaire pour la première version.

### 3.3 Règles d'autorisation

- Owner et Admin : accès de contrôle par défaut aux quatre capacités, sans devoir créer quatre lignes de permission pour eux.
- Editor : aucun accès aux conversations ou commandes par défaut ; accès uniquement si un Owner/Admin lui accorde explicitement la capacité correspondante.
- `messages_read` autorise la lecture des conversations et messages de l'entreprise.
- `messages_reply` autorise l'envoi de messages dans une conversation à laquelle l'agent a accès ; il ne donne pas automatiquement le droit de lire les autres conversations si `messages_read` n'est pas accordé.
- `orders_read` autorise la lecture des commandes de l'entreprise.
- `orders_manage` autorise les actions de gestion autorisées sur les commandes ; la lecture correspondante doit aussi être accordée explicitement ou être incluse dans la définition de `orders_manage`. Recommandation : `orders_manage` implique `orders_read` pour éviter un droit de modification sans contexte.
- Aucun membre ne peut s'accorder ses propres permissions.
- Un Editor ne peut ni accorder ni retirer des permissions.
- Seuls Owner/Admin peuvent accorder ou retirer des permissions. Le système doit vérifier que le donneur de droit est bien Owner/Admin de cette entreprise.
- Lorsqu'un membre est retiré de `business_members`, ses permissions associées doivent être supprimées ou rendues inopérantes immédiatement.

### 3.4 RLS et messagerie

Les conversations privées restent accessibles :
- au client participant ;
- aux agents de l'entreprise qui ont les permissions nécessaires ;
- aux éventuels administrateurs Zack seulement si une permission d'administration dédiée et une justification d'accès sont prévues. Aucun accès global implicite pour les admins Zack dans cette proposition.

Les demandes de premier contact invité restent séparées des conversations privées et sont reçues via Edge Function. Après conversion en compte Zack, le serveur peut créer une conversation et ajouter le client ainsi que les agents autorisés.

La création de conversation, l'ajout/retrait de participants et l'affectation d'agents doivent être des opérations contrôlées côté serveur. Il faut éviter qu'un client puisse s'ajouter à une conversation ou s'accorder une permission.

La politique d'envoi de message doit vérifier à la fois :
- l'identité de l'expéditeur ;
- son appartenance/participation ou son autorisation d'agent ;
- la capacité `messages_reply` pour un agent d'entreprise.

Une autorisation de lecture et une autorisation de réponse sont deux capacités distinctes. Les messages clients ne doivent pas être exposés à un Editor qui n'a que `messages_reply` sans une décision explicite sur le contexte qu'il doit voir.

### 3.5 RLS et commandes

- Le client connecté lit uniquement ses achats globaux, ses commandes et les lignes associées.
- Un membre entreprise lit uniquement les commandes de son entreprise et seulement si `orders_read` ou `orders_manage` lui est accordé, sauf Owner/Admin qui disposent du contrôle par défaut.
- Un membre avec `orders_read` seul ne peut pas changer les statuts.
- Un membre avec `orders_manage` peut exécuter les transitions autorisées côté serveur.
- Les transitions doivent être contrôlées : pas de passage arbitraire de `submitted` à `completed`, pas de réactivation d'une commande annulée sans règle dédiée.
- Les écritures de commandes et de lignes restent côté serveur. Le navigateur ne peut pas insérer directement des commandes ni modifier les prix.

## 4. Index et intégrité à prévoir

À étudier dans le SQL final :
- index `checkout_batches(customer_id, created_at desc)` ;
- index `orders(checkout_batch_id)` ;
- index `orders(business_id, created_at desc)` ;
- index `orders(customer_id, created_at desc)` ;
- index `order_items(order_id)` ;
- index `business_member_permissions(business_id, user_id)` ;
- index `business_member_permissions(user_id, permission_key)` ;
- contraintes FK et suppression cohérentes avec la conservation de l'historique ;
- unicité des références de checkout et de commande ;
- cohérence devise/prix par commande ;
- contrainte/validation de cohérence entre entreprise de la commande et entreprise du produit.

Ne pas stocker de totaux redondants sans stratégie de recalcul. Si des montants sont conservés comme instantanés comptables, ils deviennent immuables après création, sauf procédure d'ajustement auditée.

## 5. Notifications

Événements à prévoir :
- achat global créé ;
- nouvelle commande pour chaque entreprise ;
- commande acceptée/refusée ;
- commande en préparation ;
- commande prête ;
- commande terminée ;
- commande annulée ;
- nouveau message ;
- permission accordée/retirée à un membre.

Les notifications d'une commande doivent contenir son propre `order_id` et le lien vers le checkout global. Un vendeur ne doit jamais recevoir les détails des commandes d'un autre vendeur du même checkout.

## 6. Cas limites à tester

1. Panier avec plusieurs produits d'une seule entreprise.
2. Panier avec produits de trois entreprises.
3. Une entreprise suspendue ou non vérifiée entre l'ajout au panier et la validation.
4. Produit supprimé, indisponible ou prix modifié depuis l'ajout au panier.
5. Produits de devises différentes dans le même checkout.
6. Une entreprise en livraison et une autre en retrait.
7. Échec d'une seule ligne : aucune commande partielle créée si la règle atomique est retenue.
8. Double clic ou nouvelle tentative réseau : aucune commande dupliquée.
9. Client qui tente de lire le checkout d'un autre client.
10. Vendeur A qui tente de lire commande/ligne de vendeur B.
11. Editor sans permission, avec lecture seule, avec gestion des commandes.
12. Editor avec `messages_read` sans `messages_reply`, puis l'inverse.
13. Permission retirée pendant qu'une session est ouverte : le prochain accès doit être refusé côté serveur/RLS.
14. Membre retiré de l'entreprise : plus aucun accès métier.
15. Owner/Admin qui accorde et retire une permission ; Editor qui tente de le faire.
16. Visiteur anonyme qui tente d'appeler directement les tables privées.
17. Conversion d'une demande de contact invité en conversation privée.

## 7. Points non décidés — à ne pas inventer

- Un vendeur peut-il refuser une commande entière, ou seulement certains articles ?
- Les frais de livraison sont-ils définis par le vendeur, négociés après commande ou calculés par zone ?
- Les commandes multi-devises sont-elles autorisées dans un même checkout ? Recommandation technique : oui, mais afficher des sous-totaux distincts par devise et aucun total converti tant qu'un taux de change fiable n'est défini.
- Un Editor ayant `messages_reply` doit-il obligatoirement avoir `messages_read` ? Recommandation : oui, l'envoi dans une conversation suppose de pouvoir lire son contexte.
- Les Owner/Admin doivent-ils voir tous les messages de l'entreprise ou seulement ceux affectés à leur équipe ? Recommandation pour le lancement : tous les messages de l'entreprise pour Owner/Admin, avec journalisation des actions sensibles.
- L'entreprise doit-elle pouvoir assigner une conversation ou une commande à un agent précis ? Recommandation : prévoir l'affectation plus tard, après les permissions de base.

## 8. Sécurité et limites

- RLS activée sur toutes les nouvelles tables exposées.
- Les policies doivent contrôler les lignes, pas seulement vérifier `TO authenticated`.
- Ne pas utiliser `user_metadata` pour autoriser un membre.
- Les permissions doivent être lues depuis des tables contrôlées et vérifiées côté serveur.
- Attention aux récursions RLS entre `business_members`, `business_member_permissions`, conversations et commandes.
- Toute fonction `SECURITY DEFINER` doit être justifiée, restreinte, sécurisée avec `search_path` maîtrisé et contrôle explicite de l'identité ; ne pas l'ajouter pour contourner les policies.
- Les Edge Functions doivent vérifier le JWT, valider toutes les entrées et ne jamais faire confiance aux totaux du navigateur.
- Aucun secret MonCash ni clé `service_role` dans le frontend.
- Les références de commandes et checkouts ne sont pas des secrets ni des autorisations : la RLS doit toujours être appliquée.
- La création de commandes, les transitions et les permissions doivent être auditées.

## 9. Ordre de réalisation recommandé

1. Finaliser les règles métier encore ouvertes.
2. Concevoir le schéma relationnel complet et les contraintes.
3. Écrire les fonctions serveur de création atomique de checkout/commandes et de transition de statut.
4. Écrire les policies RLS et tests positifs/négatifs par rôle.
5. Construire les écrans client et vendeur.
6. Ajouter les notifications.
7. Tester avec plusieurs comptes et plusieurs entreprises en environnement non productif.
8. Revue sécurité et validation explicite avant toute migration.

**Aucune table n'a été créée. Aucune migration n'a été appliquée. Aucune donnée existante n'a été modifiée.**
