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
| Produits actifs/publiés | 5 | 15 | 30 |
| Services actifs/publiés | 5 | 10 | 20 |
| Publications par mois | 3 | 12 | 20 |
| Comptes de gestion (équipe) | 1 | 3 | 10 |

Les tarifs actuels remplacent les anciens prix. Toute modification future des tarifs ne doit pas changer rétroactivement les conditions d'un abonnement déjà payé : les conditions acquises restent valables jusqu'à son expiration.

### Définitions fonctionnelles à respecter

- **Produits et services :** les limites concernent les éléments actifs/publiés. L'archivage ne supprime pas les données.
- **Images :** le quota est un maximum par produit, pas un quota global d'images pour toute l'entreprise.
- **Établissements :** limite totale d'emplacements rattachés à une entreprise, emplacement principal compris. Le modèle actuel de la base ne distingue pas encore proprement l'entreprise de ses établissements secondaires : ne pas simuler cette limite en comptant plusieurs fiches entreprises.
- **Comptes de gestion :** nombre total de comptes ayant accès à l'espace de gestion, propriétaire compris. Les clients et les livreurs ne sont pas des collaborateurs facturables; le rôle de livreur ne doit pas consommer un siège de gestion.
- **Publications :** quota mensuel commun pour les contenus publics ordinaires et promotionnels. Une même campagne ne doit pas consommer deux quotas si elle est représentée dans plusieurs tables. La règle de comptage doit être centralisée afin d'éviter les contournements.
- **Statistiques :**
  - Gratuit : tableau de bord de base, vues et suivi simple de l'activité/commandes.
  - Pro : statistiques détaillées, évolution des vues et performances commerciales.
  - Ultra : statistiques avancées, comparaisons de périodes et rapports téléchargeables.
  Ces niveaux ne peuvent être affichés comme disponibles que si les données et écrans correspondants existent réellement.
- **Visibilité :**
  - Gratuit : présence dans l'annuaire et fiche standard.
  - Pro : fiche enrichie, options supplémentaires de présentation et avantage de visibilité limité.
  - Ultra : fiche complète et avantage de visibilité supérieur.
  Les badges Pro/Ultra et les options de mise en avant ne doivent être activés qu'une fois leur rendu réel disponible.

## 2. Règles de durée, expiration et conservation

- Un abonnement Pro ou Ultra dure **un mois calendaire**, calculé de la date et de l'heure d'activation jusqu'à la même date et heure du mois suivant. Si le mois suivant ne contient pas cette date (ex. activation le 31), la fin tombe le dernier jour de ce mois, à la même heure.
- À l'expiration, l'entreprise revient automatiquement au forfait Gratuit. Le contrôle du forfait effectif doit se baser sur `ends_at`, même si un traitement périodique de nettoyage n'a pas encore marqué l'ancien abonnement comme `expired`.
- Les produits, services, publications, établissements, membres, avis et historiques excédentaires ne sont jamais supprimés automatiquement.
- Après expiration, les éléments existants restent conservés. L'entreprise ne peut pas créer ou publier de nouveaux éléments tant qu'elle dépasse une limite gratuite applicable.
- Le retour au forfait Gratuit ne doit pas effacer les avis, notes, commandes, historiques, conversations ou données de l'entreprise.
- Un renouvellement du même forfait prolonge la période payée selon la règle retenue pour le renouvellement; il ne doit pas interrompre un abonnement encore actif.
- Une demande de renouvellement refusée ne doit pas annuler l'abonnement actif déjà payé.
- Une seule demande de paiement ouverte par entreprise à la fois.

## 3. Règles de visibilité et de classement

La visibilité n'est pas achetée exclusivement. L'abonnement apporte un avantage limité, mais ne garantit jamais la première place.

Le classement doit considérer au minimum :
1. Pertinence de la recherche et de la catégorie/localisation.
2. Commandes réellement reçues et surtout honorées/terminées.
3. Interactions authentiques (consultations, favoris, suivis et autres événements mesurables).
4. Notes moyennes et nombre d'avis approuvés, avec une méthode de lissage statistique pour ne pas survaloriser quelques notes.
5. Qualité et fiabilité des avis.
6. Activité récente et régularité de l'entreprise.
7. Avantage de visibilité du forfait, plafonné et secondaire par rapport à la pertinence et à la qualité.

Protections :
- Les commandes annulées, rejetées ou artificielles ne doivent pas améliorer le classement.
- Les clics répétés, interactions automatisées ou avis suspects doivent être filtrés/pondérés.
- Les avis vérifiés doivent être liés à une commande réellement terminée et au client concerné. Le schéma actuel des avis n'enregistre pas encore l'identifiant de commande : cette liaison doit être ajoutée et testée avant de présenter tous les avis comme vérifiés.
- Les nouvelles entreprises doivent bénéficier d'une exposition de découverte raisonnable, même sans historique de commandes ou d'avis.
- Le nombre brut d'avis ne suffit pas : la moyenne, le volume, la récence et la fiabilité comptent ensemble.
- Les poids numériques du classement restent à définir et à tester sur des données représentatives avant activation.

## 4. État technique observé dans Supabase au 15 novembre 2026

- La table `subscription_plans` contient uniquement le forfait Gratuit.
- Le forfait Gratuit enregistré est incohérent avec la décision produit : `max_images_per_item = 5` alors que le quota validé est 2.
- `max_products` existe déjà, mais les colonnes de quotas de services, publications, membres et établissements ne sont pas encore présentes.
- La fonction `limit_product_images()` applique une limite fixe de 5 images; elle ne respecte pas encore les quotas variables des forfaits.
- La fonction `current_plan()` renvoie le forfait Gratuit si aucun abonnement actif non expiré n'existe : le repli fonctionnel existe déjà.
- La fonction `admin_review_payment()` calcule actuellement la fin avec un nombre de jours (`duration_days`) et doit être adaptée au mois calendaire.
- Les tables `products`, `services`, `posts`, `promotions`, `business_members`, `reviews`, `orders` et `business_stats_events` existent.
- Aucun modèle dédié ne sépare actuellement une entreprise de ses établissements secondaires.
- La vue `business_rating_summary` calcule déjà une note de classement lissée à partir des avis approuvés.
- La fonction `search_businesses()` classe actuellement principalement selon la pertinence textuelle; elle n'intègre pas encore le score combiné commandes/interactions/avis/forfait.
- La table `reviews` n'a pas de lien vers une commande; les règles actuelles ne garantissent donc pas que chaque avis vient d'un acheteur ayant terminé une commande.
- Le parcours de paiement dans le frontend reste une maquette locale et n'appelle pas encore les RPC Supabase.

## 5. Ordre d'implémentation

1. Étendre le modèle des forfaits et enregistrer les valeurs commerciales, sans rendre les forfaits payants disponibles avant que les contrôles soient opérationnels.
2. Corriger le quota d'images et appliquer les quotas produits/services/publications/comptes côté base de données, pas uniquement dans l'interface.
3. Concevoir le modèle d'établissements secondaires avant d'appliquer le quota 2/5/20.
4. Adapter la validation administrative pour une durée d'un mois calendaire et vérifier le retour effectif au Gratuit.
5. Ajouter la preuve de commande terminée pour les avis vérifiés, sans perdre les avis existants.
6. Concevoir et tester le score de visibilité combiné; conserver la pertinence locale et prévoir l'exposition des nouvelles entreprises.
7. Connecter ensuite les écrans existants du frontend, en préservant l'interface actuelle.
8. Tester les cas limites, les permissions et les refus de paiement avant toute activation publique.

## 6. Principes de sécurité et de lancement

- Les paiements d'abonnement sont manuels par MonCash ou NatCash, au choix de l'entreprise.
- La référence de transaction ne prouve jamais à elle seule que l'argent a été reçu.
- Seul l'administrateur principal vérifie réellement le transfert et approuve/refuse.
- Aucun PIN, OTP ou mot de passe mobile money n'est demandé ou stocké.
- Les commandes client-vendeur restent réglées directement entre eux, hors encaissement Zack.
- Les forfaits payants restent désactivés tant que les numéros de réception, les quotas côté serveur, le parcours frontend et les tests ne sont pas terminés.
