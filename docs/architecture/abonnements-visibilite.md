# Abonnements et visibilité Zack

Dernière mise à jour : 15 novembre 2026

## 1. Décisions commerciales confirmées

Tous les montants sont en gourdes haïtiennes (HTG).

| Limite / avantage | Gratuit | Pro | Ultra |
|---|---:|---:|---:|
| Prix mensuel | 0 | 500 | 750 |
| Durée des forfaits payants | — | 1 mois calendaire | 1 mois calendaire |
| Images par produit | 2 | 6 | 12 |
| Établissements | 2 | 5 | 20 |
| Produits | 5 | 15 | 30 |
| Services | 5 | 10 | 20 |
| Publications par mois | 3 | 12 | 20 |
| Comptes de gestion (équipe) | 1 | 3 | 10 |

Les tarifs actuels remplacent les anciens prix. Toute modification future des tarifs ne doit pas changer rétroactivement les conditions d'un abonnement déjà payé : les conditions acquises restent valables jusqu'à son expiration.

### Définitions fonctionnelles

- **Produits et services :** limites sur le nombre d'éléments enregistrés pour l'entreprise. Les données existantes ne sont jamais supprimées automatiquement à l'expiration.
- **Images :** maximum par produit, et non quota global de l'entreprise.
- **Établissements :** limite totale d'emplacements rattachés à une entreprise, emplacement principal compris. Le modèle actuel ne distingue pas encore proprement l'entreprise de ses établissements secondaires : la limite est enregistrée dans les forfaits mais son application attend le modèle de données dédié.
- **Comptes de gestion :** nombre total de comptes ayant accès à l'espace de gestion, propriétaire compris. Les clients et les livreurs ne sont pas des collaborateurs facturables; le rôle `courier` ne consomme pas de siège.
- **Publications :** quota mensuel commun pour les contenus publics ordinaires et promotionnels. Une même campagne ne doit pas consommer deux quotas si elle est représentée dans plusieurs tables. La règle de comptage doit être centralisée avant activation des forfaits payants.
- **Statistiques :**
  - Gratuit : tableau de bord de base, vues et suivi simple de l'activité/commandes.
  - Pro : statistiques détaillées, évolution des vues et performances commerciales.
  - Ultra : statistiques avancées, comparaisons de périodes et rapports téléchargeables.
  Ces niveaux ne peuvent être affichés comme disponibles que si les données et écrans correspondants existent réellement.
- **Visibilité :**
  - Gratuit : présence dans l'annuaire et fiche standard.
  - Pro : fiche enrichie, options supplémentaires de présentation et avantage de visibilité limité.
  - Ultra : fiche complète et avantage de visibilité supérieur.
  Les badges Pro/Ultra et options de mise en avant ne doivent être activés qu'une fois leur rendu réel disponible.

## 2. Durée, expiration et conservation

- Un abonnement Pro ou Ultra dure **un mois calendaire**, de la date/heure d'activation à la même date/heure du mois suivant. Si le mois suivant ne contient pas cette date (ex. activation le 31), la fin tombe le dernier jour de ce mois.
- Le forfait effectif est calculé à partir des dates `starts_at` et `ends_at`. À l'expiration, `current_plan()` renvoie automatiquement Gratuit, même si le statut historique de l'abonnement n'a pas encore été nettoyé.
- Les produits, services, publications, établissements, membres, avis et historiques excédentaires ne sont jamais supprimés automatiquement.
- Après expiration, les éléments existants restent conservés. L'entreprise ne peut pas créer de nouveaux éléments au-delà des limites gratuites applicables.
- Le retour au Gratuit ne supprime ni avis, ni notes, ni commandes, ni historiques, ni conversations.
- Le renouvellement du même forfait est placé à la suite de la période déjà payée : il ne fait pas perdre les jours restants.
- Le passage à un autre forfait approuvé remplace le forfait précédent à la date d'approbation.
- Une demande refusée n'annule pas l'abonnement actif déjà payé.
- Une seule demande de paiement ouverte par entreprise à la fois.
- Les souscriptions enregistrent un instantané du forfait (`plan_snapshot`) afin qu'une modification ultérieure des tarifs ou avantages ne modifie pas les conditions déjà payées.

## 3. Visibilité et classement

La visibilité n'est pas achetée exclusivement. L'abonnement apporte un avantage limité, mais ne garantit jamais la première place.

Le classement doit considérer au minimum :
1. Pertinence de la recherche, de la catégorie et de la localisation.
2. Commandes réellement reçues et surtout honorées/terminées.
3. Interactions authentiques (consultations, favoris, suivis et autres événements mesurables).
4. Notes moyennes et nombre d'avis vérifiés approuvés, avec lissage statistique.
5. Qualité et fiabilité des avis.
6. Activité récente et régularité de l'entreprise.
7. Avantage de visibilité du forfait, plafonné et secondaire par rapport à la pertinence et à la qualité.

Protections :
- Les commandes annulées, rejetées ou artificielles ne doivent pas améliorer le classement.
- Les clics répétés, interactions automatisées ou avis suspects doivent être filtrés/pondérés.
- Un nouvel avis doit être lié à une commande `completed` du même client et de la même entreprise.
- Les avis historiques sans lien de commande sont conservés, mais ne sont pas comptés comme avis vérifiés dans la note de classement.
- Les nouvelles entreprises doivent bénéficier d'une exposition de découverte raisonnable, même sans historique de commandes ou d'avis.
- Le nombre brut d'avis ne suffit pas : moyenne, volume et fiabilité comptent ensemble.
- Les poids numériques du classement restent à définir et à tester sur des données représentatives avant activation.

## 4. État technique Supabase — 15 novembre 2026

### Déjà enregistré et partiellement appliqué

- Les trois forfaits existent dans `subscription_plans` :
  - Gratuit : 0 HTG, quotas 2 images / 5 produits / 5 services / 3 publications / 1 compte de gestion / 2 établissements.
  - Pro : 500 HTG, quotas 6 / 15 / 10 / 12 / 3 / 5.
  - Ultra : 750 HTG, quotas 12 / 30 / 20 / 20 / 10 / 20.
- **Pro et Ultra sont volontairement inactifs** dans Supabase tant que tous les contrôles et écrans ne sont pas prêts. Seul Gratuit est actif.
- Les colonnes de forfait contiennent aussi les niveaux de statistiques et de visibilité.
- Les limites d'images, produits, services et comptes de gestion sont désormais appliquées par des déclencheurs côté base de données. Les contrôles ne reposent donc pas uniquement sur l'interface.
- Les livreurs (`role = courier`) ne consomment pas les sièges de gestion; le propriétaire est comptabilisé.
- `current_plan()` prend en charge les instantanés de forfait et ignore les abonnements dont la période n'a pas commencé ou est terminée.
- `admin_review_payment()` calcule une période d'un mois calendaire et place le renouvellement du même forfait après la période déjà payée.
- La table `reviews` possède maintenant `order_id`. Les nouveaux avis exigent une commande terminée correspondant au client et à l'entreprise.
- La vue `business_rating_summary` est en mode `security_invoker` et ne compte dans le score que les avis approuvés liés à une commande.
- Les fonctions de déclenchement des quotas et de validation d'avis ne sont pas exécutables directement par les rôles anon/authenticated.

### Encore à construire

- Le modèle dédié des établissements secondaires et l'application réelle du quota 2/5/20.
- Le compteur mensuel unifié des publications et promotions, en évitant le double comptage d'une même campagne.
- Les niveaux statistiques réels et leurs écrans/rapports.
- Le score de visibilité combinant pertinence, commandes, interactions, avis et avantage d'abonnement. `search_businesses()` utilise encore principalement la pertinence textuelle.
- La connexion des écrans entreprise et admin aux RPC Supabase. Le parcours dans `index1.html` reste une maquette locale.
- Les numéros actifs MonCash et NatCash.
- Les tests complets de renouvellement avec session administrateur réelle et le parcours frontend de paiement.

### Migrations appliquées

- `20261115141529_subscription_plan_matrix_core_limits_and_calendar_renewal`
- `20261115141554_subscription_quota_trigger_functions_privileges`
- `20261115141622_verified_reviews_require_completed_order`
- `20261115141643_subscription_rating_view_and_plan_rpc_security`
- `20261115141742_subscription_same_plan_renewals_queue`

Les tests transactionnels exécutés ont confirmé les limites Gratuites (2 images, 5 produits, 5 services, 1 compte de gestion) et Pro (6 images, 15 produits, 10 services), le retour effectif au Gratuit après expiration, l'activation d'un forfait programmé à sa date de début, le renouvellement du même forfait après la période déjà payée, l'utilisation des instantanés, le rejet des avis sans commande terminée et la conservation des données de test après rollback.

## 5. Ordre d'implémentation restant

1. Concevoir le modèle des établissements secondaires.
2. Construire le compteur unifié des publications/promotions.
3. Tester le renouvellement et les expirations avec des sessions autorisées.
4. Concevoir et tester le score de visibilité combiné, avec exposition des nouvelles entreprises.
5. Vérifier les niveaux statistiques réellement disponibles.
6. Connecter les écrans existants du frontend, sans bouleverser l'interface.
7. Configurer les numéros MonCash/NatCash et tester le parcours de paiement.
8. Activer Pro et Ultra seulement lorsque toutes les limites promises sont réellement protégées et utilisables.

## 6. Sécurité et lancement

- Les paiements d'abonnement sont manuels par MonCash ou NatCash.
- La référence de transaction ne prouve jamais à elle seule que l'argent a été reçu.
- Seul l'administrateur principal vérifie réellement le transfert et approuve/refuse.
- Aucun PIN, OTP ou mot de passe mobile money n'est demandé ou stocké.
- Les commandes client-vendeur restent réglées directement entre eux, hors encaissement Zack.
