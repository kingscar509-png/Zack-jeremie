# Zack — stratégie de lancement progressif

**Date : 15 novembre 2026**  
**Statut : décision produit de référence**  
**Dépôt : `kingscar509-png/Zack-jeremie`**  
**Branche de travail : `hardening/phase-1-stabilisation`**

## 1. Décision

Zack conserve l'ensemble de sa vision fonctionnelle et toutes les fonctionnalités prévues. Le lancement public national en Haïti se fera progressivement : les modules ne seront pas tous ouverts le même jour.

Cette décision ne constitue ni une suppression, ni un abandon, ni une refonte de l'interface.

## 2. Périmètre de la première ouverture publique

Les trois parcours prioritaires sont :

- **Entreprise** : création et gestion de la fiche, catalogue de produits/services, informations et contenus autorisés, réception et traitement des commandes lorsque le parcours complet aura été validé.
- **Consommateur** : découverte/recherche des entreprises, consultation des fiches et catalogues, compte personnel, favoris et commandes lorsque le parcours complet aura été validé.
- **Livreur** : parcours dédié à un livreur authentifié, affectation explicite des livraisons, consultation de ses missions et mise à jour des étapes autorisées.

Le mot « lancement » ne signifie pas qu'une fonction est opérationnelle simplement parce qu'une table ou une RPC existe. Chaque parcours doit être validé de bout en bout, y compris les permissions RLS, les états d'erreur et les tests avec des comptes distincts.

## 3. Modules conservés pour une phase ultérieure

- **Fournisseurs** : espace fournisseur, catalogue fournisseur, relations d'approvisionnement et fonctions associées.
- **Marché B2B** : découverte et transactions entre entreprises, achats en gros, négociation et flux professionnels.

Ces modules restent dans la feuille de route. Ils ne doivent pas être présentés comme disponibles dans la première version. Aucune table, donnée ou fonction existante ne doit être supprimée uniquement pour les reporter.

## 4. Règle frontend

**Aucune modification du frontend dans le cadre de cette réorganisation.**

- Ne pas modifier les composants, routes, styles, textes, navigation ou apparence.
- Ne pas retirer des écrans ou des fonctionnalités prévues.
- Ne pas ajouter une bannière, un badge ou une page « À venir » sans nouvelle autorisation.
- Le frontend existant reste intact pendant le travail de préparation.
- Comme le frontend ne lit pas encore de configuration de disponibilité, la présente décision est d'abord une règle de planification et de validation. Elle ne prétend pas masquer automatiquement des modules dans l'interface.

## 5. Règle backend et données

Les structures peuvent être préparées pour les phases futures, mais leur présence ne vaut pas activation produit.

- Conserver les tables, relations et fonctions existantes utiles.
- Séparer les droits des entreprises, consommateurs et livreurs.
- Ne jamais traiter un livreur comme un simple membre d'entreprise ayant automatiquement les permissions de commande.
- Protéger chaque RPC privilégiée par une vérification explicite de l'identité et du périmètre d'accès.
- Ne pas activer un parcours futur par une simple permission générique.
- Pas de données de démonstration présentées comme réelles.
- Les modules Fournisseurs et B2B ne seront activés qu'après leur conception, leurs tests et une décision de lancement dédiée.

## 6. État technique observé le 15 novembre 2026

Audit Supabase effectué en lecture seule sur le projet `hwuwqalazmrmdxseawnm` :

- Projet actif, PostgreSQL 17.11.
- 38 tables dans le schéma public.
- RLS activée sur les 38 tables publiques.
- 28 migrations présentes dans l'historique Supabase.
- Aucune Edge Function déployée.
- Les structures `couriers`, `orders`, `order_items`, `conversations`, `messages`, `business_subscriptions`, `payments`, `payment_events` et `payment_recipients` existent.
- Aucun ensemble de tables clairement dédié aux fournisseurs ou au marché B2B n'a été confirmé dans l'inventaire des 38 tables.
- L'inventaire GitHub ne contient pas de dossier de migrations Supabase versionné confirmé dans le dépôt audité.

### Écarts à traiter avant toute activation

1. **Livreurs** : la table `couriers` est protégée par une policy unique qui exige la permission `orders`, tandis que la fonction de statut de commande prévoit aussi une permission `deliveries`. Le parcours d'un livreur indépendant n'est pas démontré. Concevoir l'identité, l'affectation, la lecture de ses propres missions et les transitions autorisées.
2. **Commandes** : les tables ont des policies de lecture limitées ; les écritures passent par des RPC privilégiées. Les fonctions doivent être testées contre les accès croisés et les changements de statut non autorisés.
3. **Abonnements/MonCash** : `request_subscription_payment` accepte actuellement `moncash` et `natcash`. La fonction `admin_review_payment` utilise le plan courant plutôt qu'un snapshot immuable, et son refus annule directement l'abonnement lié. Elle ne doit pas être utilisée pour une opération commerciale avant correction et tests.
4. **Destinataires de paiement** : `get_payment_recipients()` renvoie le numéro du compte à tout utilisateur authentifié. Vérifier si cette exposition est nécessaire et la limiter au parcours voulu.
5. **Fonctions SECURITY DEFINER** : l'advisor de sécurité signale une fonction exécutable par `anon` (`business_counts`) et 23 fonctions exécutables par `authenticated`. Plusieurs ont des contrôles internes légitimes, mais chaque fonction doit être auditée individuellement. Ne pas révoquer en bloc les RPC utilisées par l'application.
6. **Advisor Auth** : la protection contre les mots de passe compromis est désactivée ; évaluer son activation dans les paramètres Auth avant ouverture publique.
7. **Migrations** : l'historique distant comporte 28 entrées, mais aucun dossier de migrations versionné n'a été confirmé. Réconcilier l'historique et les fichiers avant de préparer un déploiement reproductible.
8. **Performance** : l'advisor signale 12 clés étrangères sans index couvrant, 47 cas de policies permissives multiples et 28 index actuellement inutilisés. Les index inutilisés ne doivent pas être supprimés sur la seule base de cet indicateur : le projet est récent et le trafic encore faible.

Les avertissements de policies permissives multiples et les fonctions privilégiées ne doivent pas être corrigés par suppression globale. Les policies doivent être évaluées selon leurs rôles et leurs conditions cumulées.

## 7. Ordre de réalisation

### Étape A — sécurisation du socle existant
- Auditer toutes les fonctions SECURITY DEFINER et leurs droits EXECUTE.
- Vérifier les policies RLS des profils, entreprises, membres, catalogue, commandes, livreurs, paiements et stockage.
- Corriger les défauts de logique métier et de contrôle d'accès identifiés.
- Réconcilier l'historique des migrations avec le dépôt.
- Ajouter des tests automatisés reproductibles.

### Étape B — première version Entreprise / Consommateur
- Valider inscription, connexion, récupération et profil.
- Valider création d'entreprise, appartenance, vérification et isolation interentreprises.
- Valider catalogue, fiches publiques, recherche et contenus.
- Valider les fonctions consommateur réellement disponibles.
- Ne pas annoncer les commandes avant validation du parcours complet.

### Étape C — parcours Livreur
- Définir le modèle d'identité du livreur et son lien avec une entreprise ou plusieurs missions.
- Définir les permissions `deliveries` distinctes de `orders`.
- Restreindre chaque livreur à ses missions affectées et aux informations strictement nécessaires.
- Tester affectation, retrait, refus, prise en charge, livraison et révocation.
- Ne pas exposer les coordonnées ou commandes d'autres clients/livreurs.

### Étape D — modules futurs
- Préserver les structures et contrats existants.
- Concevoir les modules Fournisseurs et B2B séparément.
- Ne les activer qu'après une recette dédiée et une décision de lancement.

### Étape E — recette et publication
- Tests avec comptes Entreprise A, Entreprise B, Consommateur et Livreur dans un environnement isolé.
- Tests négatifs d'accès interentreprises et interutilisateurs.
- Tests Android/mobile et navigateur.
- Build et tests CI verts.
- Rapport de recette soumis au propriétaire avant toute publication.

## 8. Garde-fous de modification

- Travailler uniquement sur une branche de préparation ; préserver `main`.
- Ne pas modifier le frontend pour cette réorganisation.
- Ne pas supprimer les tables ou fonctions des modules futurs.
- Ne pas utiliser les comptes réels pour des tests d'écriture ou de révocation.
- Ne pas exécuter de migration, modifier des données, des politiques, des fonctions, des clés ou des paramètres du projet Supabase de production sans approbation explicite de la migration exacte après revue.
- Ne pas déployer de fonction Edge ni publier l'application sans autorisation distincte.
- Ne pas annoncer comme prêt un parcours qui n'a pas été testé de bout en bout.

## 9. Critère de sortie de la première version

La première version est prête lorsque les parcours Entreprise, Consommateur et Livreur annoncés sont réellement utilisables, que leurs accès sont cloisonnés côté serveur, que les parcours critiques ont passé les tests, et que les modules Fournisseurs/B2B restent non activés sans être supprimés.

## 10. Notes sur les contrôles

- Les 38 tables publiques ont toutes RLS activée ; ce constat ne prouve pas à lui seul que chaque policy est correcte.
- L'advisor de sécurité du 15 novembre signale 1 fonction SECURITY DEFINER accessible à `anon`, 23 fonctions accessibles à `authenticated` et la protection Auth contre les mots de passe compromis désactivée.
- L'advisor de performance du 15 novembre signale 12 clés étrangères sans index couvrant, 47 combinaisons de policies permissives multiples et 28 index non utilisés à cette date.
- Le workflow GitHub `Zack frontend checks` est configuré sur les pushes de la branche `hardening/phase-1-stabilisation`. La récupération des runs associée au commit a renvoyé une liste vide avec l'outil de vérification disponible ; le statut du workflow après les commits documentaires reste donc à confirmer dans l'onglet Actions.

