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
- `fulfillment_method` : résumé de la méthode ou des méthodes utilisées dans cette commande (`pickup`, `delivery` ou `mixed`), à calculer côté serveur à partir des lignes.
- `delivery_address` : adresse unique commune à toutes les lignes livrées de cette commande vendeur. Une commande vendeur ne peut pas contenir plusieurs adresses de livraison.
- `delivery_fee` : frais de livraison facturés une seule fois pour la commande vendeur lorsqu'au moins une ligne acceptée doit être livrée ; zéro si aucune ligne livrée ne reste à traiter. Montant calculé côté serveur et enregistré comme instantané.
- `delivery_fee_currency` : devise des frais, cohérente avec la devise de la commande.
- `customer_note`.
- `status` : `submitted`, `accepted`, `preparing`, `ready`, `completed`, `cancelled` ; transitions contrôlées côté serveur.
- `currency` et `subtotal` : montants de cette commande uniquement.
- `created_at`, `updated_at`.

#### `order_items`
- `order_id` obligatoire.
- `product_id` nullable pour conserver l'historique si le produit est supprimé/archivé.
- `product_name` : instantané du nom.
- `quantity`, `unit_price`, `currency`, `line_total` : valeurs calculées et enregistrées côté serveur au moment de la commande.
- `status` : `pending`, `accepted` ou `rejected` pour suivre la décision du vendeur sur chaque article.
- `rejection_reason` : motif obligatoire lorsqu'un article est refusé ; nul pour les articles acceptés ou en attente.
- `fulfillment_method` : méthode choisie pour cette ligne (`pickup` ou `delivery`), qui doit être permise par la configuration du produit et de l'entreprise.

La décision article par article est autorisée : une même commande vendeur peut contenir des lignes acceptées et refusées. Le statut global de la commande doit refléter ces décisions sans effacer l'historique des lignes.

Prévoir une contrainte ou une validation serveur qui garantit que chaque produit appartient au même `business_id` que sa commande. Une simple vérification côté navigateur est insuffisante.

### 2.3 Création atomique côté serveur

Une seule Edge Function de validation de panier doit :
1. exiger un utilisateur authentifié et récupérer son identité depuis le JWT vérifié ;
2. valider les données et dédupliquer les lignes du panier ;
3. relire chaque produit dans Supabase, vérifier qu'il existe, est disponible, appartient à une entreprise autorisée et que sa devise/prix sont cohérents ;
4. regrouper les lignes par `business_id` ;
5. calculer les prix, sous-totaux et montants à partir des données serveur, jamais des totaux fournis par le navigateur ;
6. calculer les frais de livraison une seule fois par commande vendeur, selon la zone et le tarif configurés par l'entreprise, uniquement si au moins une ligne acceptée doit être livrée ;
7. créer le `checkout_batch`, toutes les commandes vendeurs et leurs lignes dans une transaction atomique ;
8. attribuer des numéros de référence uniques ;
9. retourner au client le récapitulatif de toutes les commandes créées.

Si une entreprise ou un produit échoue à la validation, la règle recommandée au lancement est de refuser toute la validation et d'expliquer au client les lignes à corriger, plutôt que de créer silencieusement une commande partielle.

Une clé d'idempotence côté serveur est à prévoir pour éviter les doublons si le client réessaie après une coupure réseau. La stratégie exacte (clé unique liée au client et à la tentative, durée de conservation) sera détaillée dans l'implémentation.

### 2.4 Statuts et expérience utilisateur

- Chaque vendeur ne voit et ne modifie que sa propre commande.
- Le client voit l'achat global et toutes les commandes vendeurs associées.
- Le vendeur examine chaque ligne de sa commande et peut l'accepter ou la refuser indépendamment des autres lignes.
- Un article refusé doit comporter un motif visible par le client. Les articles acceptés poursuivent leur traitement.
- La commande vendeur peut donc être partiellement acceptée. Son statut global doit distinguer au minimum une commande en attente de décision, acceptée intégralement, partiellement acceptée, refusée intégralement, en préparation, prête, terminée ou annulée.
- Le sous-total dû au vendeur est recalculé côté serveur à partir des seules lignes acceptées. Les lignes refusées ne sont pas facturées au client.
- Les frais de livraison sont facturés une seule fois pour toute la commande vendeur, et non pour chaque produit livré. Les lignes en retrait ne génèrent aucun frais de livraison.
- En cas de refus partiel, le frais unique est conservé si au moins une ligne acceptée reste à livrer ; il devient nul si aucune ligne livrée ne reste à traiter. Toute modification est recalculée côté serveur et communiquée au client.
- Le statut global du checkout ne doit pas remplacer les statuts individuels.
- Le statut global doit être calculé à partir des commandes enfants ou mis à jour par une logique serveur fiable ; ne pas laisser le client l'écrire.
- Les notifications sont envoyées séparément au client et à chaque entreprise concernée.
- Chaque entreprise définit à l'avance ses propres tarifs de livraison, avec la possibilité de différencier les prix selon les zones desservies.
- Les tarifs et conditions applicables sont affichés au client avant la validation de la commande.
- Dans un checkout multi-vendeurs, les frais de livraison sont calculés séparément pour chaque commande vendeur ; Zack ne fusionne pas les tarifs de plusieurs entreprises.
- Le tarif applicable est enregistré comme instantané sur la commande au moment de sa validation, afin de conserver l'historique même si le vendeur modifie ses tarifs plus tard.
- Si l'adresse du client ne correspond à aucune zone desservie, le client ne peut pas sélectionner la livraison pour cette commande ; une option de retrait peut être proposée si le vendeur l'offre.
- Une commande d'une entreprise peut contenir des lignes en retrait et des lignes en livraison : les frais ne concernent que les lignes livrées, avec un seul frais pour la commande.

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
7. Produits d'une même entreprise avec des modes de retrait/livraison différents.
8. Une ligne refusée par le vendeur : les autres lignes acceptées restent dans la même commande vendeur et leur montant est recalculé.
9. Plusieurs lignes livrées dans une même commande : un seul frais de livraison est facturé.
10. Commande mixte retrait/livraison : aucune livraison facturée pour les lignes en retrait.
11. Refus de toutes les lignes livrées : le frais de livraison devient nul si aucune livraison ne reste.
12. Double clic ou nouvelle tentative réseau : aucune commande dupliquée.
13. Client qui tente de lire le checkout d'un autre client.
14. Vendeur A qui tente de lire commande/ligne de vendeur B.
15. Editor sans permission, avec lecture seule, avec gestion des commandes.
16. Editor avec `messages_read` sans `messages_reply`, puis l'inverse.
17. Permission retirée pendant qu'une session est ouverte : le prochain accès doit être refusé côté serveur/RLS.
18. Membre retiré de l'entreprise : plus aucun accès métier.
19. Owner/Admin qui accorde et retire une permission ; Editor qui tente de le faire.
20. Visiteur anonyme qui tente d'appeler directement les tables privées.
21. Conversion d'une demande de contact invité en conversation privée.

## 7. Points non décidés — à ne pas inventer

- Une commande vendeur utilise une seule adresse de livraison pour toutes ses lignes livrées. Si le client veut envoyer des articles à des adresses différentes, il devra créer des commandes/achats séparés ; cette règle devra être clairement expliquée dans l'interface.
- Les commandes multi-devises sont-elles autorisées dans un même checkout ? Recommandation technique : oui, mais afficher des sous-totaux distincts par devise et aucun total converti tant qu'un taux de change fiable n'est pas défini.
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

## 10. Décision confirmée — réponse aux messages

Le 12 novembre 2026, la règle suivante a été validée :

- `messages_reply` implique automatiquement `messages_read`.
- Un membre autorisé à répondre doit pouvoir lire le contexte de la conversation dans laquelle il répond.
- Il n'est donc pas nécessaire d'accorder séparément `messages_read` lorsqu'un membre reçoit `messages_reply`.
- Retirer `messages_reply` retire ce droit implicite de lecture, sauf si `messages_read` est accordé séparément.
- Cette implication doit être appliquée de manière cohérente dans les fonctions d'autorisation serveur et les policies RLS, et couverte par des tests.

Cette règle ne donne accès qu'aux conversations de l'entreprise pour laquelle le membre possède la permission correspondante ; elle ne donne aucun accès aux conversations d'autres entreprises.

## 11. Décision confirmée — refus partiel des articles d'une commande

Le 12 novembre 2026, l'option B a été retenue : le vendeur peut accepter ou refuser chaque article individuellement, plutôt que de devoir accepter ou refuser toute la commande vendeur.

- Chaque ligne de commande possède sa propre décision : en attente, acceptée ou refusée.
- Le vendeur doit fournir un motif lorsqu'il refuse une ligne ; ce motif est transmis au client.
- Les autres lignes acceptées continuent leur traitement sans être annulées par le refus d'un article.
- Le montant de la commande est recalculé côté serveur en excluant les lignes refusées. Le navigateur ne décide jamais du montant final.
- Le statut global de la commande vendeur doit représenter correctement une acceptation partielle ou un refus intégral, tout en conservant les statuts détaillés des lignes.
- Les notifications au client doivent préciser les articles acceptés et refusés, avec le motif de chaque refus.
- Les transitions de statut, les recalculs et les notifications sont contrôlés côté serveur et journalisés.
- Cette règle s'applique à chaque commande vendeur séparément dans un checkout multi-vendeurs ; le résultat d'une entreprise ne modifie pas les commandes des autres entreprises.

Les détails du calcul des frais de livraison après refus partiel suivent la règle confirmée à la section 16. Aucune migration ni modification Supabase n'a été exécutée.

## 12. Décision confirmée — tarifs de livraison définis par chaque entreprise

Le 12 novembre 2026, l'option A a été retenue : chaque entreprise fixe ses frais de livraison à l'avance.

- Chaque entreprise peut configurer ses zones desservies et le tarif correspondant à chaque zone.
- Les tarifs et conditions applicables doivent être visibles avant la validation de la commande.
- Les frais sont calculés indépendamment pour chaque commande vendeur dans un panier multi-vendeurs.
- Le tarif applicable est conservé comme instantané dans la commande afin de préserver l'historique.
- Si aucune zone ne couvre l'adresse du client, la livraison n'est pas proposée pour cette entreprise ; le retrait peut rester disponible si le vendeur l'a activé.
- La structure détaillée des zones (communes, sections communales, quartiers ou zones personnalisées) sera définie avant la conception du SQL final.

Aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.

## 13. Décision confirmée — zones de livraison par commune et localité

Le 12 novembre 2026, l'option C a été retenue : les entreprises peuvent définir leurs zones de livraison à deux niveaux.

- Le vendeur sélectionne d'abord une commune.
- Il peut ensuite préciser les quartiers, localités ou secteurs effectivement desservis dans cette commune.
- Il peut définir un tarif pour toute la commune ou des tarifs distincts pour les localités sélectionnées.
- Les zones et tarifs sont configurés entreprise par entreprise ; ils ne sont pas partagés automatiquement entre vendeurs.
- L'interface doit permettre une configuration simple pour une entreprise qui dessert toute une commune, sans l'obliger à saisir chaque quartier.
- Le modèle doit rester extensible aux communes et subdivisions administratives de toutes les régions d'Haïti, sans coder en dur une seule ville.
- La source et la structure de référence géographique (communes, sections communales, quartiers/localités) devront être choisies et vérifiées avant le SQL final. Les localités personnalisées saisies par un vendeur devront être distinguées des subdivisions officielles.

Aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.

## 14. Décision confirmée — choix du mode de remise par produit

Le 12 novembre 2026, l'option C a été retenue : une entreprise peut proposer le retrait, la livraison ou les deux, et choisir les modes autorisés produit par produit.

- Chaque fiche produit doit indiquer si le produit est disponible en retrait, en livraison, ou dans les deux modes.
- Le client ne peut sélectionner qu'un mode autorisé pour chaque produit.
- La disponibilité de la livraison dépend aussi des zones et tarifs configurés par l'entreprise.
- Le mode choisi doit être conservé sur chaque ligne de commande ; le mode global de la commande vendeur devient un résumé calculé à partir des lignes.
- Le modèle doit donc gérer le cas où des produits d'une même entreprise sont choisis avec des modes différents.

Aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.

## 15. Décision confirmée — une commande vendeur peut combiner plusieurs modes de remise

Le 12 novembre 2026, l'option A a été retenue : les produits d'une même entreprise restent dans une seule commande vendeur, même si le client choisit des modes de remise différents selon les produits.

- Chaque ligne de commande conserve son propre mode de remise (`pickup` ou `delivery`).
- Une commande vendeur peut donc contenir des lignes à retirer sur place et d'autres à livrer.
- L'interface client doit présenter clairement, pour chaque article, le mode choisi, l'adresse de livraison si nécessaire, et les consignes de retrait le cas échéant.
- Le vendeur doit pouvoir suivre séparément l'avancement des lignes selon leur mode de remise, sans dupliquer artificiellement la commande.
- Le statut global de la commande est un résumé calculé à partir des statuts des lignes et de leurs remises ; il ne doit pas masquer qu'une partie est prête au retrait alors qu'une autre est encore en livraison.
- Les frais de livraison ne s'appliquent qu'aux lignes livrées ; leur règle de calcul est précisée à la section 16.

Aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.

## 16. Décision confirmée — un seul frais de livraison par commande vendeur

Le 12 novembre 2026, l'option A a été retenue : lorsqu'une commande vendeur contient plusieurs articles à livrer à la même adresse, le client paie un seul frais de livraison pour toute cette commande, et non un frais par article.

- Le frais unique est déterminé par la zone et le tarif configurés par l'entreprise vendeuse.
- Les lignes en retrait ne génèrent aucun frais de livraison.
- Si la commande contient à la fois des lignes en retrait et des lignes en livraison, le frais unique ne couvre que la livraison des lignes concernées.
- Si le vendeur refuse certains articles, le frais unique reste applicable dès qu'au moins une ligne acceptée doit encore être livrée ; il devient nul si aucune ligne livrée ne reste à traiter.
- Le montant et la devise du frais sont calculés côté serveur et enregistrés comme instantané dans la commande.
- Le client doit voir ce frais clairement avant de confirmer la commande.
- Cette règle est appliquée séparément à chaque commande vendeur d'un checkout multi-vendeurs : chaque entreprise conserve son propre frais.
- Toutes les lignes livrées d'une même commande vendeur partagent une seule adresse. Pour des adresses différentes, le client doit effectuer des achats séparés.

Aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.


## 17. Décision confirmée — une seule adresse de livraison par commande vendeur

Le 12 novembre 2026, l'option A a été retenue : chaque commande vendeur utilise une seule adresse de livraison.

- Toutes les lignes de cette commande qui sont en mode livraison sont envoyées à la même adresse.
- Les lignes en retrait peuvent coexister dans cette commande et ne nécessitent pas d'adresse de livraison.
- Le client ne peut pas saisir une adresse différente pour chaque article d'une même commande vendeur.
- Si le client souhaite faire livrer des articles à plusieurs adresses, il doit effectuer des achats séparés pour ces destinations.
- L'interface doit afficher clairement cette règle avant la validation du panier afin d'éviter toute confusion.
- Le serveur vérifie et enregistre l'adresse unique comme instantané dans la commande ; les frais de livraison uniques sont calculés selon cette adresse et la zone tarifaire du vendeur.
- Dans un panier multi-vendeurs, chaque commande vendeur conserve sa propre adresse unique. Les adresses peuvent donc différer d'une entreprise à l'autre si le client les renseigne au niveau de chaque commande vendeur.

Aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.


## 18. Décision confirmée — annulation d'une commande acceptée par le vendeur

Le 12 novembre 2026, l'option A a été retenue : un vendeur peut annuler une commande qu'il a déjà acceptée, mais il doit obligatoirement fournir une raison.

- Le vendeur doit saisir un motif avant de confirmer l'annulation ; le motif ne peut pas être vide.
- Le client reçoit automatiquement une notification indiquant que la commande a été annulée et présentant le motif communiqué par le vendeur.
- L'annulation et son motif sont enregistrés dans l'historique de la commande et dans le journal d'audit ; le vendeur ne peut pas effacer cette trace.
- La transition d'annulation est effectuée côté serveur après vérification des permissions du vendeur et de l'état actuel de la commande.
- Une commande annulée ne peut pas être réactivée ou modifiée comme si elle était toujours active ; toute éventuelle reprise doit suivre une procédure distincte et auditée.
- L'annulation d'une commande vendeur ne doit pas annuler automatiquement les commandes des autres entreprises présentes dans le même achat global.
- Cette décision concerne l'annulation de la commande vendeur entière. Le traitement d'une annulation limitée à un ou plusieurs articles après acceptation reste à préciser séparément.
- Au lancement, les paiements de commande se font directement entre le client et l'entreprise, hors Zack. Zack enregistre l'annulation et informe les parties, mais ne promet ni n'exécute automatiquement un remboursement.

Aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.


## 19. Décision confirmée — annulation d'une commande par le client

Le 12 novembre 2026, l'option A a été retenue : le client peut annuler une commande vendeur tant que le vendeur n'a pas commencé sa préparation.

- Le client peut annuler sa commande vendeur tant que celle-ci n'est pas passée à l'état « en préparation ».
- Dès que le vendeur a commencé la préparation et que la commande est passée à l'état `preparing`, l'annulation directe par le client n'est plus autorisée.
- Le contrôle est effectué côté serveur au moment de l'annulation, en vérifiant que l'utilisateur est bien le client propriétaire de la commande et que son état autorise encore cette opération.
- La vérification de l'état et l'annulation doivent être atomiques afin d'éviter qu'une annulation client et le démarrage de la préparation se produisent simultanément sans règle cohérente.
- Le vendeur concerné reçoit une notification de l'annulation. Le client voit la confirmation et la mise à jour de l'état de sa commande.
- L'annulation et son auteur sont conservés dans l'historique et le journal d'audit ; aucune des parties ne peut effacer cette trace.
- L'annulation par le client concerne uniquement la commande de l'entreprise concernée. Les commandes des autres vendeurs du même checkout global ne sont pas annulées.
- Au lancement, les paiements de commande se font directement entre le client et l'entreprise, hors Zack. Zack enregistre l'annulation et notifie les parties, mais ne déclenche ni ne garantit automatiquement un remboursement.

Cette règle s'applique à la commande vendeur entière. Le traitement d'une annulation partielle de certaines lignes après validation reste à définir séparément.

Aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.


## 20. Décision confirmée — annulation partielle d'une commande par le vendeur

Le 12 novembre 2026, l'option A a été retenue : après acceptation d'une commande, le vendeur peut annuler un ou plusieurs articles sans annuler toute la commande, à condition de fournir un motif pour chaque article annulé.

- Le vendeur peut sélectionner une ou plusieurs lignes de commande encore actives et demander leur annulation partielle.
- Un motif non vide est obligatoire pour chaque ligne annulée ; le motif est communiqué au client.
- Les autres lignes de la commande qui ne sont pas annulées continuent leur traitement normalement.
- Le client reçoit une notification indiquant précisément les articles annulés et les motifs correspondants.
- Les montants sont recalculés côté serveur à partir des lignes qui restent acceptées et actives. Le navigateur ne peut pas décider du nouveau total.
- Les frais de livraison suivent la règle déjà définie : ils restent applicables s'il reste au moins une ligne acceptée à livrer ; ils deviennent nuls si aucune ligne livrée ne reste à traiter.
- Le serveur vérifie que le vendeur agit sur une commande de sa propre entreprise, qu'il possède la permission de gestion nécessaire et que les lignes ciblées peuvent encore être annulées.
- La mise à jour des lignes, le recalcul des montants et des frais, l'historique et les notifications doivent être traités de manière atomique ou selon une orchestration fiable côté serveur.
- Chaque annulation partielle, son auteur, son motif, les lignes concernées et l'horodatage sont conservés dans un historique non effaçable et dans le journal d'audit.
- L'annulation de lignes par un vendeur ne doit pas annuler les autres lignes de la même commande ni les commandes d'autres vendeurs du checkout global.
- Une ligne déjà terminée ou déjà annulée ne peut pas être annulée une seconde fois. Les transitions autorisées devront être formalisées dans la machine à états et couvertes par des tests.
- Au lancement, les paiements de commande se font directement entre le client et l'entreprise, hors Zack. Zack enregistre l'annulation partielle et informe les parties, mais ne déclenche ni ne garantit automatiquement un remboursement.

Cette règle complète les décisions sur le refus d'articles avant acceptation (section 11), les frais de livraison (section 16) et l'annulation de commande entière par le vendeur (section 18). Les états de refus avant acceptation et d'annulation après acceptation doivent rester distincts dans l'historique.

Aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.


## 21. Décision confirmée — modification d'une commande après validation

Le 12 novembre 2026, l'option A a été retenue : le client ne peut pas modifier directement une commande après sa validation.

- Après validation, le client ne peut pas changer les produits, les quantités, les modes de remise, l'adresse ou les autres éléments de la commande existante.
- Si le client souhaite changer sa demande, il doit annuler la commande ou les lignes concernées selon les règles d'annulation applicables, puis créer une nouvelle commande avec les informations correctes.
- Une nouvelle commande est soumise à une nouvelle vérification de disponibilité, de prix, de frais de livraison et d'acceptation par le vendeur.
- Les références et l'historique de l'ancienne commande restent conservés ; la nouvelle commande ne remplace ni ne réécrit l'ancienne.
- Cette règle évite les modifications concurrentes et préserve la traçabilité des prix, quantités, adresses et décisions du vendeur.
- Les éventuelles corrections administratives exceptionnelles devront suivre une procédure distincte, autorisée et auditée ; elles ne constituent pas une modification libre par le client.

Aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.


## 22. Décision confirmée — horaires de traitement des commandes par entreprise

Le 12 novembre 2026, l'option A a été retenue : chaque entreprise peut définir ses propres horaires de traitement des commandes.

- Chaque entreprise configure ses jours et plages horaires habituels de traitement des commandes, indépendamment des horaires d'ouverture au public déjà renseignés dans sa fiche.
- Une entreprise peut recevoir des commandes en dehors de ses horaires de traitement si elle accepte les commandes à tout moment ; leur examen et leur traitement commencent pendant ses prochaines plages prévues.
- L'interface doit distinguer clairement la réception d'une commande de son traitement par le vendeur. Une commande reçue en dehors des horaires ne doit pas être présentée comme déjà acceptée ou en préparation.
- Le vendeur doit pouvoir indiquer ses périodes exceptionnelles de fermeture ou d'indisponibilité ; les modalités détaillées (jours fériés, congés, fermeture temporaire et éventuelle suspension de réception des commandes) restent à définir.
- Les horaires sont interprétés selon le fuseau horaire local de l'entreprise en Haïti ; le stockage technique devra conserver une référence de fuseau fiable et éviter les erreurs liées aux changements de date.
- Les horaires de traitement ne modifient pas automatiquement les horaires d'ouverture affichés au public et ne changent pas les règles de statut, d'acceptation ou d'annulation des commandes.
- Le système doit afficher au client une indication compréhensible lorsque sa commande est reçue hors des horaires habituels, sans promettre une heure exacte de traitement si elle n'est pas confirmée par le vendeur.

Aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.


## 23. Décision confirmée — absence de réponse du vendeur à une commande

Le 12 novembre 2026, l'option B a été retenue : si le vendeur ne répond pas à une commande dans le délai défini par Zack, la commande est automatiquement annulée et le client est informé.

- Zack définit le délai applicable ; sa valeur exacte et son mode de calcul restent à préciser avant l'implémentation.
- Avant l'annulation automatique, le vendeur reçoit une notification préalable lui signalant qu'il doit traiter la commande avant l'échéance.
- Si le vendeur accepte ou refuse les articles selon les règles prévues avant l'échéance, l'annulation automatique pour absence de réponse ne s'applique pas à la commande traitée.
- À l'expiration du délai sans réponse du vendeur, le serveur vérifie l'état courant de la commande et procède à son annulation automatiquement.
- Le client reçoit une notification indiquant que la commande a été annulée parce que le vendeur n'a pas répondu dans le délai prévu.
- Le vendeur reçoit également une notification de l'annulation automatique.
- L'opération, son motif système, son horodatage et les notifications sont conservés dans l'historique et le journal d'audit.
- L'annulation automatique concerne uniquement la commande vendeur restée sans réponse ; les commandes des autres entreprises du même checkout global ne sont pas affectées.
- Le mécanisme doit être idempotent et sûr en cas de traitement répété ou de course avec une réponse du vendeur : une commande déjà traitée, annulée ou passée dans un état incompatible ne doit pas être annulée une seconde fois.
- Le délai doit être cohérent avec les horaires de traitement configurés par l'entreprise (section 22). La règle exacte — temps calendaire ou heures ouvrées, point de départ du compteur et gestion des fermetures exceptionnelles — reste à décider.
- Au lancement, les paiements de commande se font directement entre le client et l'entreprise, hors Zack. Zack enregistre l'annulation et informe les parties, mais ne déclenche ni ne garantit automatiquement un remboursement.

Aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.


## 24. Décision confirmée — configuration du délai de réponse des vendeurs

Le 12 novembre 2026, l'option C a été retenue : Zack doit pouvoir configurer le délai accordé à un vendeur pour répondre à une commande, avec un choix entre heures calendaires et heures ouvrées.

- Le délai est défini dans les paramètres d'administration de Zack ; les valeurs proposées comprennent notamment 12 h, 24 h, 48 h et 72 h. La liste exacte des valeurs autorisées et la valeur par défaut restent à fixer.
- Pour chaque configuration, Zack choisit si le compteur utilise les heures calendaires ou les heures ouvrées.
- En mode heures calendaires, le compteur continue pendant les nuits, les week-ends et les jours fériés.
- En mode heures ouvrées, le compteur avance uniquement pendant les plages de traitement configurées par l'entreprise (section 22). Les fermetures exceptionnelles doivent être prises en compte selon les règles techniques à finaliser.
- Le point de départ du délai est l'heure à laquelle la commande vendeur est créée et mise à disposition du vendeur.
- Le rappel préalable doit être envoyé suffisamment tôt avant l'échéance ; le délai exact du rappel reste à définir dans la configuration.
- À l'échéance, une tâche serveur vérifie de façon atomique que la commande est toujours en attente de réponse avant de l'annuler automatiquement.
- La configuration appliquée à une commande doit être conservée comme instantané (durée, mode de calcul et paramètres pertinents), afin qu'une modification ultérieure des paramètres Zack ne change pas rétroactivement le délai déjà accordé.
- Les paramètres sont modifiables uniquement par les administrateurs Zack autorisés et leurs changements sont journalisés.
- Le mécanisme doit gérer les commandes créées en dehors des horaires, les fermetures exceptionnelles, les changements de fuseau et les traitements répétés sans double annulation.
- Le délai exact par défaut, la fréquence de vérification serveur et le délai du rappel préalable seront précisés avant la conception finale des tâches automatisées.

Aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.


## 25. Décision confirmée — canaux de notification des commandes

Le 12 novembre 2026, l'option C a été retenue : les clients doivent pouvoir recevoir les notifications de commande dans Zack, par e-mail et par WhatsApp lorsque l'intégration WhatsApp est disponible et que le client a choisi ce canal.

- Les notifications dans Zack constituent le canal interne de référence : elles restent consultables dans le compte du client et dans l'historique de ses commandes.
- Les notifications par e-mail peuvent être envoyées à l'adresse confirmée du client, selon ses préférences et les règles de délivrabilité.
- Les notifications WhatsApp ne sont envoyées que si l'intégration officielle et autorisée est configurée, si le client a fourni un numéro valide et a consenti à recevoir ces messages.
- Le client doit pouvoir gérer ses préférences de notification par canal, dans le respect des messages indispensables au fonctionnement du service et des obligations applicables.
- Les événements importants à notifier comprennent notamment : commande reçue, décision du vendeur (acceptation ou refus d'articles), début de préparation, commande prête, commande terminée, annulation totale ou partielle, annulation automatique pour absence de réponse et changements importants de statut.
- Les messages externes doivent contenir uniquement les informations nécessaires et éviter d'exposer des données sensibles. Un lien sécurisé vers Zack peut permettre au client de consulter les détails après authentification.
- L'envoi externe ne doit jamais être considéré comme la preuve qu'un client a lu ou accepté une notification. L'état de livraison et les erreurs d'envoi doivent être suivis séparément.
- Les notifications doivent être créées côté serveur à partir d'événements fiables, avec une file d'envoi, des tentatives contrôlées et une protection contre les doublons.
- Une panne d'e-mail ou de WhatsApp ne doit pas bloquer la commande ni empêcher l'enregistrement de la notification dans Zack.
- Les clés API, jetons et secrets des fournisseurs d'e-mail ou WhatsApp doivent rester côté serveur, jamais dans le frontend.
- Les coûts, limites, modèles de messages et conditions d'utilisation de WhatsApp Business devront être vérifiés avant de choisir le fournisseur et de lancer l'intégration.
- Les préférences, consentements, désabonnements et changements de coordonnées doivent être horodatés et protégés.

Aucune intégration e-mail ou WhatsApp n'a été activée et aucune table ni migration Supabase n'a été créée ou appliquée pour cette décision.

## 26. Décision confirmée — suivi de livraison

**Choix retenu : option C — suivi simple par défaut et GPS facultatif activé par l’entreprise.**

- Le suivi simple est disponible par défaut : l’entreprise ou un membre autorisé met à jour les statuts de livraison (par exemple « En livraison », puis « Livrée »).
- Le suivi GPS en temps réel est une option facultative que l’entreprise peut activer si elle dispose de livreurs équipés et d’une organisation adaptée.
- Lorsque le GPS est activé pour une livraison, le client peut visualiser le déplacement du livreur sur une carte.
- Une entreprise qui ne dispose pas de suivi GPS peut utiliser uniquement les mises à jour manuelles de statut.
- L’interface client doit clairement distinguer un statut manuel d’une position GPS en direct et ne jamais présenter une position ancienne comme étant en temps réel.
- Le partage de position doit être limité à la livraison concernée, activé explicitement et arrêté à la fin ou à l’annulation de celle-ci.
- L’accès à la position doit être réservé au client concerné et aux personnes autorisées pour cette commande. Les règles d’accès doivent être appliquées côté serveur.
- La disponibilité, la fréquence et la précision des positions dépendent du téléphone, du réseau et des autorisations GPS du livreur ; Zack doit prévoir un état de repli vers le suivi simple si la position n’est pas disponible.
- Aucune intégration GPS, table, politique RLS ou fonction serveur n’est créée à ce stade. Les détails techniques seront conçus après finalisation des décisions métier et revue de sécurité.

## 27. Décision confirmée — gestion des livreurs

**Choix retenu : option C — employés existants ou livreurs dédiés avec accès limités.**

- Une entreprise peut désigner comme livreur un membre déjà présent dans son équipe Zack.
- Une entreprise peut également inviter ou ajouter un livreur dédié disposant de son propre compte Zack, sans lui donner accès à la gestion générale de l’entreprise.
- Le livreur dédié n’obtient pas automatiquement le rôle de propriétaire, administrateur ou éditeur de l’entreprise.
- Les autorisations du livreur sont limitées aux missions qui lui sont attribuées : consulter les informations nécessaires à ses livraisons, mettre à jour les statuts autorisés et partager sa position GPS lorsqu'un suivi en direct est activé pour la livraison.
- Un livreur ne peut consulter ni modifier les commandes, clients, messages, produits, paramètres ou données d'autres entreprises ou d'autres livraisons qui ne lui sont pas attribuées, sauf autorisation distincte et explicitement définie.
- L'entreprise doit pouvoir attribuer, réattribuer et retirer une livraison à un livreur autorisé ; ces opérations sont contrôlées côté serveur et journalisées.
- La révocation de l'accès ou la fin d'une mission doit interrompre immédiatement les accès correspondants et le partage de position.
- Les règles exactes d'invitation, d'identification du livreur, de consentement GPS, de confidentialité et de révocation seront précisées dans la conception technique.
- Les autorisations devront être appliquées par RLS et par les fonctions serveur concernées, avec des tests négatifs garantissant l'isolation entre entreprises et entre livraisons.
- Aucune table, politique RLS, fonction serveur ou intégration n'est créée à ce stade.

## 28. Décision confirmée — attribution des livraisons aux livreurs

**Choix retenu : option C — attribution manuelle par défaut et attribution automatique facultative.**

- Par défaut, un responsable autorisé de l'entreprise attribue manuellement chaque livraison à un livreur.
- L'entreprise peut activer une option d'attribution automatique proposée par Zack.
- L'attribution automatique ne peut sélectionner que des livreurs actifs, autorisés par l'entreprise et disponibles selon les règles configurées.
- Les critères précis de disponibilité et de sélection (par exemple charge de travail, statut actif et capacité à accepter une mission) restent à définir avant implémentation ; Zack ne doit pas supposer une disponibilité à partir de la seule présence en ligne.
- Un responsable autorisé peut reprendre la main, réattribuer ou retirer une mission selon les règles opérationnelles à définir.
- Chaque attribution, réattribution, retrait et changement de mode doit être contrôlé côté serveur et conservé dans l'historique d'audit.
- Une même livraison ne doit pas être attribuée simultanément à plusieurs livreurs actifs, sauf décision métier explicite ultérieure.
- L'attribution automatique doit être fiable et idempotente afin d'éviter les doubles affectations en cas de concurrence ou de nouvelle tentative.
- L'entreprise conserve le contrôle de l'activation et de la désactivation du mode automatique.
- Aucune table, politique RLS, fonction serveur ou automatisation n'est créée à ce stade.

## 29. Décision confirmée — disponibilité des livreurs

**Choix retenu : option C — disponibilité déclarée par le livreur et disponibilité opérationnelle calculée par Zack.**

- Le livreur peut indiquer manuellement s'il est disponible ou indisponible pour recevoir de nouvelles missions.
- Zack tient également compte des missions déjà attribuées et de leur état avant de proposer ce livreur pour une nouvelle livraison.
- Le simple fait d'être connecté à Zack ne signifie pas que le livreur est disponible.
- Un livreur indisponible ne doit pas recevoir de nouvelle attribution automatique, sauf action explicite d'un responsable autorisé selon les règles à définir.
- L'interface doit distinguer clairement le choix du livreur (disponible/indisponible) de sa charge réelle de missions.
- La disponibilité opérationnelle doit être recalculée côté serveur et ne pas dépendre uniquement d'une valeur contrôlée par le navigateur.
- Les règles de capacité (nombre maximal de missions simultanées, disponibilité entre deux missions, pauses et situations exceptionnelles) restent à préciser avant implémentation.
- Les changements de disponibilité et les attributions qui en découlent doivent être horodatés et journalisés.
- Aucune table, politique RLS ou fonction serveur n'est créée à ce stade.

## 30. Décision confirmée — capacité simultanée des livreurs

**Choix retenu : option C — capacité maximale configurable par l'entreprise pour chaque livreur.**

- L'entreprise peut définir le nombre maximal de livraisons simultanées qu'un livreur peut prendre en charge.
- Cette limite peut varier d'un livreur à l'autre selon l'organisation de l'entreprise.
- L'attribution automatique doit respecter cette limite et ne pas attribuer une mission supplémentaire lorsque le livreur a atteint sa capacité.
- La capacité doit être vérifiée côté serveur au moment de l'attribution afin d'éviter les dépassements en cas d'attributions simultanées.
- Les missions comptabilisées dans la capacité (par exemple attribuées, acceptées, en préparation ou en cours de livraison) et les états qui libèrent une place restent à définir précisément.
- Les responsables autorisés peuvent modifier la capacité ; les changements sont horodatés et journalisés.
- Une modification de capacité ne doit pas supprimer ni annuler les missions déjà attribuées.
- Aucune table, politique RLS ou fonction serveur n'est créée à ce stade.

## 31. Décision confirmée — réponse du livreur à une mission

**Choix retenu : option C — acceptation explicite avec réattribution automatique en cas d'absence de réponse.**

- Lorsqu'une livraison lui est attribuée, le livreur doit pouvoir l'accepter ou la refuser.
- Si le livreur ne répond pas dans le délai configuré, Zack peut retirer cette proposition et réattribuer la livraison selon les règles définies par l'entreprise.
- Le refus explicite et l'absence de réponse doivent être distingués dans l'historique.
- Le délai de réponse, les rappels éventuels et les règles de réattribution restent à définir.
- Une livraison ne doit jamais être considérée comme acceptée ni être attribuée simultanément à plusieurs livreurs actifs à cause d'une course entre opérations.
- Les opérations d'acceptation, de refus, d'expiration et de réattribution sont contrôlées côté serveur, idempotentes et journalisées.
- Aucune table, politique RLS ou fonction serveur n'est créée à ce stade.

## 32. Décision confirmée — retards et livraisons échouées

**Choix retenu : option C — signalement par le livreur et solutions proposées selon les règles de l'entreprise.**

- Le livreur peut signaler un retard, une impossibilité de joindre le client, une adresse introuvable, un refus de réception ou tout autre incident prévu.
- Zack présente les suites possibles selon la situation et les règles configurées par l'entreprise : nouvelle tentative, retour au vendeur, attente d'instructions ou autre solution autorisée.
- Le signalement ne doit pas déclencher automatiquement une nouvelle tentative sans tenir compte du contexte et des règles de l'entreprise.
- Le client et l'entreprise sont informés des incidents pertinents.
- Le motif, les changements de statut, les décisions prises et leurs auteurs sont conservés dans l'historique.
- Les actions disponibles, délais et responsabilités en cas d'échec restent à préciser avant implémentation.
- Aucune table, politique RLS ou fonction serveur n'est créée à ce stade.

## 33. Décision confirmée — confirmation de réception par le client

**Choix retenu : option C — confirmation du livreur, puis confirmation client avec procédure en cas d'absence de réponse.**

- Le livreur indique que la livraison a été remise au client.
- Le client est invité à confirmer la réception ou à signaler un problème.
- Si le client ne répond pas dans un délai défini, Zack peut appliquer une procédure de confirmation automatique.
- La confirmation automatique ne doit pas empêcher le client de signaler ultérieurement un problème selon une procédure de contestation à définir.
- Les délais, rappels, conditions de confirmation automatique et durée de contestation restent à préciser.
- La confirmation du livreur et celle du client sont deux événements distincts, horodatés et conservés dans l'historique.
- Aucune table, politique RLS ou fonction serveur n'est créée à ce stade.

## 34. Décision confirmée — preuves de livraison

**Choix retenu : option D — plusieurs types de preuve configurables par l'entreprise.**

- L'entreprise peut choisir les preuves acceptées ou exigées selon son fonctionnement : code de confirmation, photo, signature ou combinaison de ces méthodes.
- Le code de confirmation doit être transmis au client par un canal approprié et ne doit pas être devinable ; il est vérifié côté serveur et ne doit pas être exposé dans les interfaces du livreur avant sa saisie par le client.
- Les photos et signatures sont des données potentiellement sensibles : leur accès doit être limité aux personnes autorisées, leur conservation encadrée et leur suppression soumise à une politique définie.
- La preuve exigée doit être annoncée avant la livraison et présentée clairement au livreur et au client.
- Zack conserve le type de preuve, l'horodatage et le lien sécurisé vers la preuve lorsque cela s'applique.
- Les exigences peuvent varier selon l'entreprise ou le type de livraison ; les détails de consentement, confidentialité, durée de conservation et contestation restent à définir.
- Aucune table, politique RLS ou fonction serveur n'est créée à ce stade.

## 35. Décision confirmée — rémunération des livreurs

**Choix retenu : option C — modes de rémunération configurables, calcul des sommes dues par Zack et paiement direct par l'entreprise.**

- L'entreprise peut configurer plusieurs modes de rémunération, par exemple un montant fixe par livraison, un montant par zone ou un montant calculé selon la distance.
- Les règles de calcul et leurs périodes d'application doivent être configurées par l'entreprise et conservées avec chaque livraison afin qu'un changement futur de tarif ne modifie pas les sommes déjà acquises.
- Zack enregistre les livraisons éligibles, calcule les montants dus et présente un historique consultable par les personnes autorisées.
- Le paiement du livreur reste effectué directement par l'entreprise, en dehors de Zack.
- Zack peut enregistrer le statut du règlement et les informations justificatives nécessaires, sans prétendre effectuer lui-même le paiement.
- Les corrections, ajustements et règlements doivent être traçables et journalisés ; un montant déjà calculé ne doit pas être silencieusement modifié.
- Les règles sur les annulations, livraisons échouées, pourboires, avances, périodes de paie et contestations restent à préciser.
- Aucune table, politique RLS ou fonction serveur n'est créée à ce stade.
