# ZACK — Plan central de préparation technique et de lancement

**Date du relevé :** 13 novembre 2026  
**Branche :** `preparation/phase-1-frontend-plan`  
**Statut :** préparation, audit en lecture seule et décisions documentées — **aucune modification de Supabase, aucune migration exécutée, aucun déploiement**.  
**Portée produit :** plateforme nationale pour les entreprises et clients de toute Haïti.  
**Référence fonctionnelle principale :** `docs/MODELE-DONNEES-MULTI-VENDEURS-PERMISSIONS.md`.

---

## 1. Objet de ce document

Ce document rassemble les préparatifs nécessaires avant le développement final et le lancement public de Zack. Il rapproche :
- les décisions fonctionnelles déjà validées ;
- l'audit Supabase vérifié le 13 novembre 2026 ;
- les constats du prototype Google AI Studio ;
- les constats du rapport d'audit Claude transmis par le propriétaire ;
- les tâches à préparer avant toute modification de la base ou tout déploiement.

Il ne remplace pas les décisions détaillées du document de modèle de données. En cas de contradiction, les décisions confirmées dans ce dernier prévalent sur les anciennes propositions de prototype ou d'audit.

## 2. Limites et règles de sécurité du travail

Pendant ce relevé :
- les tables, migrations, politiques, fonctions, déclencheurs, paramètres du bucket et alertes ont été consultés en lecture seule ;
- aucune requête DDL/DML n'a été exécutée ;
- aucune migration n'a été appliquée ;
- aucune fonction Edge n'a été déployée ;
- aucun secret, aucune clé privée et aucun fichier utilisateur n'ont été modifiés ;
- aucun fichier de l'application n'a été remplacé.

Les futurs scripts SQL doivent d'abord être préparés, relus et testés sur un environnement de développement. Une action sur le projet Supabase actif exigera une validation distincte et explicite.

## 3. Décisions fonctionnelles déjà confirmées

### 3.1 Produit et portée
- Zack couvre toute Haïti, et non uniquement Jérémie.
- Tous les secteurs d'activité sont concernés.
- La modération des publications est centralisée.
- L'accueil et la communication sont mixtes.
- La publication entreprise est limitée et soumise aux règles de modération.
- Le panier est conservé localement au lancement.
- Un compte Zack est nécessaire pour passer commande.
- Un visiteur sans compte peut initier un premier contact avec une entreprise par un formulaire dédié ; il ne peut pas consulter une conversation privée.

### 3.2 Panier et commandes multi-vendeurs
La décision confirmée est la division automatique d'un panier multi-entreprises :
- un `checkout_batches` pour la validation globale ;
- une commande `orders` distincte par entreprise ;
- les `order_items` de chaque commande appartiennent exclusivement à son vendeur ;
- aucune commande ne mélange plusieurs entreprises.

Le rapport ancien qui proposait un seul panier actif par entreprise est donc dépassé. Il ne doit pas servir de spécification.

Les règles complémentaires déjà décidées comprennent :
- acceptation ou refus de chaque article par le vendeur ;
- motif obligatoire pour tout refus ;
- une adresse de livraison au maximum par commande vendeur ;
- un frais de livraison unique par commande vendeur, calculé côté serveur ;
- retrait, livraison ou les deux selon les options proposées par l'entreprise et par produit ;
- possibilité de mélanger des lignes en retrait et des lignes en livraison dans une même commande vendeur ;
- annulation par le client avant le début de préparation ;
- annulation totale ou partielle par le vendeur selon les règles déjà documentées ;
- délais de réponse administrables, rappel avant échéance et annulation automatique si le vendeur ne répond pas ;
- notifications Zack comme canal de référence, e-mail et WhatsApp seulement selon disponibilité et consentement ;
- suivi de livraison simple par défaut, GPS facultatif ;
- livreurs avec compte Zack, mission attribuée et droits limités ;
- preuve de livraison configurable par l'entreprise ;
- rémunération des livreurs calculée par Zack mais payée directement par l'entreprise.

Consulter le document principal pour les transitions, permissions, snapshots, règles d'annulation et autres détails.

### 3.3 Permissions des équipes
Permissions configurables par entreprise :
- `messages_read`
- `messages_reply`
- `orders_read`
- `orders_manage`

Owner/Admin ont les droits de gestion par défaut. Editor n'obtient pas automatiquement accès aux messages ou commandes. Seuls Owner/Admin accordent ou retirent ces permissions. Les contrôles doivent être imposés par RLS et par les fonctions serveur.

### 3.4 Paiements
Au lancement :
- les commandes sont payées directement entre le client et le vendeur, hors Zack ;
- MonCash est prévu pour les abonnements Zack uniquement ;
- NatCash est reporté jusqu'à obtention et validation d'une documentation officielle ;
- Zack ne doit pas conserver ni redistribuer l'argent des ventes des entreprises au lancement.

Le modèle où Zack encaisserait puis reverserait aux vendeurs est reporté jusqu'à validation juridique et réglementaire en Haïti. Aucun PIN ou OTP ne doit être demandé dans Zack.

### 3.5 Dimensionnement et médias
Décisions de cadrage :
- forfait Supabase Free au départ, à confirmer dans le tableau de bord ;
- objectif à terme : 10 000 entreprises ;
- médias autorisés : photos uniquement ;
- les quotas gratuits ne doivent pas être considérés comme suffisants pour héberger durablement les photos de 10 000 entreprises ;
- compression, redimensionnement, miniatures, pagination et chargement à la demande sont nécessaires ;
- cible de planification proposée : 150–250 KB par photo optimisée, sans considérer cette cible comme une garantie.

## 4. État Supabase observé le 13 novembre 2026

Projet : `hwuwqalazmrmdxseawnm`  
Région : `us-west-2`  
PostgreSQL : 17.11  
État du projet au moment du relevé : actif et sain.

### 4.1 Tables
24 tables dans le schéma public ont été recensées. Toutes avaient RLS activée au moment de la lecture.

Tables :
- `profiles`
- `businesses`
- `business_members`
- `products`
- `services`
- `posts`
- `business_media`
- `promotions`
- `business_hours`
- `admin_roles`
- `admin_audit_log`
- `product_images`
- `reports`
- `categories`
- `site_settings`
- `product_categories`
- `reviews`
- `business_interactions`
- `notification_preferences`
- `notifications`
- `business_favorites`
- `push_subscriptions`
- `business_events`
- `business_stats_events`

Comptages approximatifs relevés :
- 2 profils ;
- 1 entreprise ;
- 1 membre d'entreprise ;
- 16 catégories ;
- 1 avis ;
- 3 notifications ;
- 7 lignes d'horaires ;
- aucun produit ni service enregistré.

Ces nombres décrivent uniquement l'instant de l'audit et peuvent changer.

### 4.2 Historique des migrations
21 migrations apparaissent dans l'historique du projet. Les trois dernières migrations nommées m5, m6 et m7 sont présentes :
- `20261111210641_m5_business_stats`
- `20261111210649_m6_admin_management`
- `20261111210655_m7_admin_audit_triggers`

Elles ont été appliquées antérieurement avec l'accord du propriétaire, selon l'historique de travail. Ce présent audit n'en a appliqué aucune.

### 4.3 Fonctions Edge
Aucune Edge Function n'était déployée au moment du relevé.

Cela signifie que les fonctions serveur nécessaires aux contacts invités, à la messagerie, aux commandes, aux abonnements MonCash et aux notifications externes restent à concevoir et à développer.

### 4.4 Stockage
Le bucket `zack-public-media` existe et est public.
- Limite actuelle par fichier : 20 MiB.
- Types MIME actuellement autorisés : JPEG, PNG, WebP, GIF, MP4 et WebM.
- Les politiques de stockage autorisent les membres d'entreprise à gérer les fichiers dans le dossier de leur entreprise.

**Écart à corriger avant le lancement :** la configuration autorise encore GIF et vidéo, alors que la décision produit actuelle est « photos uniquement ». Il faudra aligner la liste MIME, les formulaires, les composants et les champs de contenu. Le caractère public du bucket doit aussi être pris en compte dans la stratégie de modération : une URL publique d'un fichier téléversé peut être consultée sans passer par l'interface Zack.

## 5. Clarification importante : les deux tables de statistiques ne sont pas des doublons identiques

La comparaison réelle des colonnes montre deux usages différents :

### `business_interactions`
- `business_id`
- `user_id`
- `interaction_type`
- `target_id`
- `created_at`

Elle enregistre des interactions associées à un utilisateur connecté, par exemple la consultation d'un produit ou service et un clic de contact.

### `business_stats_events`
- `business_id`
- `event_type`
- `product_id`
- `created_at`

Elle sert à enregistrer des événements de statistiques, y compris via une politique d'insertion accessible aux visiteurs anonymes.

**Conclusion :** les deux tables peuvent avoir un chevauchement fonctionnel en matière de statistiques, mais leurs structures et leurs règles d'accès sont différentes. Il ne faut supprimer ni fusionner l'une d'elles sur la seule base de leur nom. Il faut d'abord définir les métriques souhaitées, les sources d'événements, les besoins d'anonymat et les règles de conservation.

## 6. Sécurité — constats vérifiés et actions préparatoires

### 6.1 Priorité critique : fonction de déclencheur exposée
L'advisor Supabase signale que `public.log_admin_content_action()` est une fonction `SECURITY DEFINER` exécutable par `anon` et `authenticated`. Son ACL observée inclut également le rôle `PUBLIC`.

La fonction est attachée à plusieurs déclencheurs d'audit. Il faut préparer une correction des privilèges d'exécution directs tout en préservant l'exécution par les déclencheurs. Il ne faut pas révoquer en bloc les privilèges de toutes les fonctions `SECURITY DEFINER` : plusieurs fonctions existantes vérifient explicitement `auth.uid()` et les permissions avant d'effectuer leur opération.

Avant toute correction :
1. vérifier la documentation PostgreSQL/Supabase applicable ;
2. préparer le SQL exact de révocation ;
3. tester que les déclencheurs continuent de fonctionner ;
4. tester que les appels RPC directs anonymes et authentifiés sont refusés ;
5. faire relire puis approuver la migration.

### 6.2 Protection contre les mots de passe compromis
L'advisor confirme que la protection des mots de passe divulgués est désactivée dans Supabase Auth. Il faut l'activer dans les paramètres Auth et tester l'inscription, la connexion et le changement de mot de passe. Ce réglage n'a pas été modifié pendant l'audit.

### 6.3 Liens externes
Le frontend doit normaliser et valider les URLs de sites web et réseaux sociaux. Seuls les protocoles `https:` et éventuellement `http:` doivent être acceptés. Les protocoles tels que `javascript:`, `data:` et autres schémas non nécessaires doivent être rejetés. Cette validation doit être appliquée à l'affichage et, si possible, à l'enregistrement serveur.

### 6.4 Modération centralisée : incohérence à corriger
Les politiques RLS observées permettent actuellement aux membres de type owner/admin/editor d'insérer, modifier et supprimer plusieurs contenus d'entreprise, notamment produits, services, publications et promotions.

Pour les publications, les membres peuvent écrire dans les lignes tandis que la visibilité publique dépend de champs comme `is_published`. L'audit des politiques et déclencheurs doit vérifier qu'un membre ne peut pas publier directement un contenu sans validation centrale. Une logique de modération ne doit pas reposer uniquement sur le fait que l'interface cache un bouton.

À préparer :
- distinguer brouillon, soumis, approuvé, rejeté et archivé ;
- imposer l'approbation centrale côté serveur ;
- empêcher un membre d'entreprise de modifier lui-même les champs de validation ;
- auditer les politiques des publications, promotions et événements ;
- décider séparément si les produits et services exigent une validation centrale ou seulement une modération réactive.

### 6.5 Médias et modération
Le bucket actuel est public. Pour éviter qu'un média de brouillon soit exposé avant validation, étudier :
- un espace privé de dépôt/quarantaine ;
- le déplacement contrôlé vers le bucket public après approbation ;
- ou une stratégie équivalente avec URLs signées et publication explicite.

Aucune option n'a encore été appliquée.

### 6.6 Anti-spam et limites
Des limites côté serveur sont à préparer pour :
- les signalements anonymes ;
- les événements de statistiques accessibles aux visiteurs ;
- les avis ;
- les formulaires de premier contact ;
- les demandes d'inscription et de création d'entreprise.

Prévoir quotas par IP et/ou compte, fenêtre temporelle, détection d'abus, CAPTCHA ou preuve anti-robot lorsque nécessaire, journalisation et réponses d'erreur adaptées. Ne pas compter sur un simple délai JavaScript côté navigateur.

### 6.7 RLS et fonctions privilégiées
Les advisors ont relevé 44 cas de politiques permissives multiples pour un même rôle et une même action. Ce signal est surtout un avertissement de performance et de complexité ; il ne prouve pas à lui seul une faille. Les politiques permissives se combinent, il faut donc vérifier leur logique OR et tester chaque rôle.

Les fonctions `SECURITY DEFINER` ne doivent pas être toutes bloquées sans analyse. Les fonctions d'administration, de création d'entreprise et de statistiques ont des contrôles internes qui doivent être relus individuellement. Les fonctions exposées comme RPC doivent avoir une raison explicite d'être appelables par les rôles concernés.

### 6.8 Performance
Les advisors ont également relevé :
- une clé étrangère sans index couvrant sur `business_stats_events.product_id` ;
- 17 index actuellement signalés comme inutilisés.

Ne pas supprimer les index inutilisés sur la seule base de cet indicateur : le projet contient peu de données et très peu de trafic. Mesurer les requêtes et la charge réelle avant de décider.

## 7. Architecture cible à préparer

### 7.1 Géographie nationale
Préparer une structure géographique hiérarchique et versionnée permettant de rechercher par département, arrondissement, commune, section communale et localité, selon le jeu de données officiel retenu.

Actions :
- obtenir et vérifier les données de référence auprès de l'IHSI ou d'une source publique officielle ;
- documenter les noms, identifiants, variantes orthographiques et relations parent-enfant ;
- distinguer les localités officielles des zones personnalisées saisies par les entreprises ;
- définir la migration de rattachement des entreprises existantes ;
- préparer index et recherche géographique.

Aucune liste géographique ne doit être inventée ou figée à partir d'une seule ville.

### 7.2 Modules de données à concevoir
Modules manquants ou à compléter :
- géographie nationale ;
- abonnements aux entreprises ;
- conversations, participants et messages ;
- demandes de contact invité ;
- achat global multi-vendeurs ;
- commandes et lignes ;
- zones, tarifs et adresses de livraison ;
- livreurs, disponibilité, missions et preuves ;
- paiements et événements de paiement ;
- plans et abonnements Zack ;
- file de notifications et tentatives d'envoi ;
- journal d'audit métier et transitions de commande.

Les noms et colonnes définitifs doivent être établis à partir du modèle fonctionnel complet, pas en copiant une proposition SQL antérieure obsolète.

### 7.3 Fonctions serveur à prévoir
Concevoir, documenter et tester avant déploiement :
- recherche paginée avec filtres géographiques ;
- premier contact invité avec anti-spam ;
- création et gestion des conversations privées ;
- validation atomique du panier multi-vendeurs ;
- acceptation/refus et transitions des articles ;
- calcul des frais de livraison ;
- attribution et suivi des missions de livraison ;
- création et vérification des paiements d'abonnement MonCash ;
- rapprochement des transactions en attente ;
- création et envoi des notifications ;
- tâches planifiées pour rappels, expirations et commandes sans réponse.

Toutes les opérations sensibles doivent valider l'identité, les permissions, les états et les montants côté serveur.

## 8. Paiements — préparation

### 8.1 MonCash
Le premier périmètre est le paiement des abonnements Zack uniquement.

Préparer :
- dossier marchand et accès sandbox ;
- adaptateur serveur MonCash ;
- stockage des secrets côté serveur, jamais dans le frontend ;
- création de paiement avec référence unique ;
- redirection vers la passerelle ;
- vérification serveur du statut, du montant, de la devise, de la référence et du marchand ;
- idempotence et journal append-only ;
- rapprochement périodique si aucun webhook officiel n'est disponible ;
- tests de succès, échec, abandon, doublon, retour tardif et montant incorrect.

Les conditions commerciales, frais, plafonds, délais de reversement et exigences de production restent à confirmer directement auprès de Digicel.

### 8.2 NatCash
Aucune intégration ne doit être planifiée comme acquise tant que Natcom n'a pas fourni de documentation officielle et confirmé les conditions d'accès marchand et d'intégration web.

### 8.3 Encaissement des ventes des entreprises
Le lancement ne prévoit pas que Zack encaisse puis reverse les paiements des ventes. Tout modèle de conservation ou redistribution de fonds doit faire l'objet d'une validation juridique et réglementaire haïtienne avant conception opérationnelle.

## 9. Frontend et prototypes

- Le fichier Google AI Studio est un prototype HTML autonome et sert de référence de comparaison visuelle.
- Le rapport Claude décrit un audit de ce fichier, pas du projet React complet.
- Le code Dyad n'a pas été fourni pour audit.
- La réponse de Lovable est attendue.
- L'utilisateur souhaite comparer les fichiers HTML de Google AI Studio, Claude et les propositions visuelles de Lovable avant de choisir le mélange final.
- Aucun prototype HTML ne doit remplacer automatiquement la branche React/TanStack existante.
- Les prototypes doivent rester des références indépendantes jusqu'à la sélection de l'interface de référence.

Après réception des propositions :
1. comparer navigation et ergonomie mobile ;
2. comparer fiches entreprise et découverte nationale ;
3. comparer espaces client, entreprise et administration ;
4. comparer messagerie, panier multi-vendeurs et commandes ;
5. vérifier l'accessibilité, les états vides, les erreurs et les formulaires ;
6. sélectionner les composants et parcours les plus solides ;
7. rédiger une spécification d'interface avant intégration au frontend connecté.

## 10. Plan de travail priorisé

### Phase 0 — Stabilisation des spécifications
- conserver les décisions validées comme source de vérité ;
- corriger les documents anciens qui contredisent les décisions actuelles ;
- comparer les prototypes Google, Claude et Lovable ;
- établir une liste des écrans et composants finaux.

### Phase 1 — Sécurité de la base existante
- corriger l'exposition directe de `log_admin_content_action` après tests ;
- activer la protection des mots de passe compromis ;
- vérifier la modération centralisée ;
- valider les URLs ;
- décider du traitement des médias de brouillon ;
- préparer les limites anti-spam ;
- tester RLS et fonctions avec chaque rôle.

### Phase 2 — Géographie nationale et annuaire
- sélectionner le jeu de données officiel ;
- créer le modèle géographique ;
- rattacher les entreprises ;
- développer recherche et filtres nationaux.

### Phase 3 — Comptes, favoris et notifications
- compléter profil personnel ;
- interface favoris et abonnements aux entreprises ;
- préférences et centre de notifications ;
- canaux externes selon consentement.

### Phase 4 — Messagerie
- formulaire de premier contact invité ;
- conversations privées authentifiées ;
- participants et permissions configurables ;
- temps réel, anti-spam, pièces jointes limitées aux photos si retenues.

### Phase 5 — Abonnements Zack
- plans et prix validés ;
- MonCash sandbox ;
- fonctions serveur et rapprochement ;
- reçus et historique ;
- tests avant production.

### Phase 6 — Commandes multi-vendeurs
- panier local ;
- checkout global ;
- commande par vendeur ;
- snapshots prix et coordonnées ;
- acceptation/refus par article ;
- annulations, délais et notifications ;
- paiement hors Zack.

### Phase 7 — Livraison
- zones et tarifs ;
- retrait/livraison par article ;
- livreurs et missions ;
- incidents, preuves et confirmations ;
- calculs et historique des sommes dues.

### Phase 8 — Préparation de production
- revue sécurité complète ;
- tests multi-comptes et multi-rôles ;
- tests sur Android et connexions lentes ;
- tests de charge et pagination ;
- sauvegardes, surveillance, domaine, conditions d'utilisation et politique de confidentialité ;
- ouverture progressive aux entreprises.

## 11. Matrice de tests obligatoire

Tester au minimum :
- visiteur anonyme ;
- client connecté ;
- propriétaire d'entreprise ;
- administrateur d'entreprise ;
- éditeur sans permission supplémentaire ;
- éditeur avec permission de lecture/réponse ;
- éditeur avec permission de gestion des commandes ;
- administrateur Zack avec permissions limitées ;
- administrateur principal ;
- livreur affecté à une mission ;
- livreur non affecté à cette mission.

Scénarios essentiels :
- accès direct aux données d'une autre entreprise ;
- lecture d'une conversation non participante ;
- attribution de permissions à soi-même ;
- modification de prix dans le navigateur ;
- panier contenant trois vendeurs ;
- refus d'une seule ligne ;
- frais de livraison avec lignes mixtes ;
- annulation d'une commande sans affecter les autres vendeurs ;
- vendeur ne répondant pas dans le délai ;
- double clic ou requête répétée ;
- notification envoyée plusieurs fois ;
- paiement MonCash retourné mais non confirmé ;
- montant ou référence de paiement falsifiés ;
- accès public à un média non approuvé.

## 12. Dépendances externes et questions ouvertes

À obtenir avant production :
- données géographiques officielles (IHSI ou autre source publique fiable) ;
- compte marchand et documentation API officielle Digicel MonCash ;
- documentation officielle Natcom NatCash si l'intégration est envisagée ;
- validation juridique haïtienne avant toute conservation ou redistribution de fonds ;
- conditions, tarifs et limites actuels des offres Supabase ;
- règles de confidentialité, consentement et durée de conservation des numéros, messages et preuves de livraison.

À décider plus tard :
- prix et niveaux des abonnements Zack ;
- délai exact de rappel avant auto-annulation ;
- délais d'acceptation des missions livreur ;
- durée de contestation après preuve de livraison ;
- durée de conservation des photos et preuves ;
- règles exactes de fermeture exceptionnelle et de traitement des commandes hors horaires.

## 13. État de validation

| Élément | État |
|---|---|
| Décisions fonctionnelles multi-vendeurs | Confirmées et documentées |
| Portée nationale | Confirmée |
| Paiement des commandes hors Zack au lancement | Confirmé |
| MonCash pour abonnements Zack | Confirmé |
| NatCash | En attente de documentation officielle |
| 24 tables publiques et RLS activée | Vérifié en lecture seule |
| 21 migrations dans l'historique | Vérifié en lecture seule |
| Fonctions Edge déployées | Aucune au relevé |
| Doublon interactions/statistiques | Pas de doublon identique ; usages à harmoniser |
| Fonction d'audit exposée | Alerte vérifiée ; correction non appliquée |
| Protection mots de passe compromis | Désactivée selon advisor ; non modifiée |
| Bucket médias | Public, 20 MiB, images et vidéos autorisées ; à aligner sur photos uniquement |
| Sécurité de modération | Audit approfondi nécessaire |
| Projet React/TanStack | Présent dans la branche de préparation ; audit complet du code à poursuivre |
| Prototype Google AI Studio | Présent ; non testé dans un navigateur pendant cet audit |
| Proposition Lovable | En attente |
| Modifications de Supabase pendant ce relevé | Aucune |

---

**Règle de clôture :** ce document est un plan de préparation. Il ne constitue pas une autorisation d'appliquer les migrations, de changer les paramètres Auth, de modifier le bucket, de déployer des Edge Functions ou de publier Zack. Chaque changement réel devra être présenté avec son objectif, son impact, son script ou sa procédure, puis validé avant exécution.


## 14. Compléments après vérification de la documentation officielle Supabase

### 14.1 Révocation ciblée de la fonction d'audit

La documentation Supabase confirme que les fonctions sont exécutables par défaut et recommande une révocation ciblée de `EXECUTE` depuis `PUBLIC` et les rôles concernés. Le SQL candidat, **non exécuté**, est :

```sql
begin;

revoke execute
on function public.log_admin_content_action()
from public;

revoke execute
on function public.log_admin_content_action()
from anon, authenticated;

commit;
```

La documentation PostgreSQL précise que le privilège `EXECUTE` est nécessaire pour créer un déclencheur sur une fonction. Les déclencheurs existants doivent donc être conservés et leur fonctionnement testé après toute révocation. La correction ne doit pas être considérée comme terminée avant :
- vérification que `anon` et `authenticated` ne peuvent plus appeler la fonction par RPC ;
- vérification que les déclencheurs existants sont toujours attachés ;
- test contrôlé d'une action auditée dans une transaction annulée ou un environnement de test ;
- nouveau contrôle des advisors.

Références :
- Supabase — Database Functions : https://supabase.com/docs/guides/database/functions
- Supabase — How can I revoke execution of a Postgres function? : https://supabase.com/kb/troubleshooting/how-can-i-revoke-execution-of-a-postgresql-function-2GYb0A
- PostgreSQL — CREATE TRIGGER : https://www.postgresql.org/docs/current/sql-createtrigger.html

### 14.2 Protection des mots de passe compromis et plan Free

La documentation Supabase indique que la protection contre les mots de passe divulgués via HaveIBeenPwned est disponible sur le plan Pro et supérieur. Comme le propriétaire a indiqué commencer sur Free, cette protection ne doit pas être décrite comme un simple réglage activable sans changement de forfait.

Action à planifier :
- confirmer le forfait réel dans le tableau de bord ;
- si Zack reste sur Free pendant le développement, consigner cette protection comme contrôle indisponible sur ce forfait ;
- prévoir le passage à un forfait éligible avant production si cette protection est exigée ;
- après activation, tester inscription et changement de mot de passe.

Référence : https://supabase.com/docs/guides/auth/password-security

### 14.3 Changement de l'exposition Data API pour les nouvelles tables

Le changelog Supabase signale qu'à compter du 30 octobre 2026, les nouvelles tables ne sont plus automatiquement exposées à la Data API par défaut pour tous les projets. Lors de la conception des nouvelles tables :
- décider explicitement si chaque table doit être accessible par Data API ;
- ne pas confondre exposition API et RLS ;
- accorder uniquement les privilèges nécessaires ;
- privilégier les Edge Functions ou un schéma non exposé pour les tables sensibles ;
- tester les accès REST réels après création.

Référence : https://supabase.com/changelog/breaking-change-data-api-tables-not-exposed-by-default

### 14.4 Supabase CLI v3

Le changelog du 4 novembre 2026 précise que Supabase CLI v3 cible la stack locale par défaut et exige des précautions explicites pour les opérations distantes. Tout futur processus CI/CD doit épingler la version CLI et utiliser les commandes documentées pour la version choisie. Aucune commande de migration ne doit être lancée sans vérifier la cible.

Référence : https://supabase.com/changelog/breaking-change-supabase-cli-v3-local-by-default
