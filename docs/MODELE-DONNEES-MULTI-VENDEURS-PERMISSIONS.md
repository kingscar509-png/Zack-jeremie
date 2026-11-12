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
