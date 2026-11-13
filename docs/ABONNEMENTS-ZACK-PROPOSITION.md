# Zack — Proposition des niveaux d'abonnement

**Date :** 13 novembre 2026  
**Branche :** `preparation/phase-1-frontend-plan`  
**Statut :** proposition de conception — À VALIDER — NON IMPLÉMENTÉE  
**Portée :** entreprises de toute Haïti.

## 1. Objectif

Définir une offre simple au lancement, accessible aux petites entreprises, sans empêcher les entreprises gratuites d'être découvertes et contactées. Les abonnements financent des capacités supplémentaires, mais ne doivent pas être confondus avec la vérification administrative ni avec l'achat de publicité.

Aucun prix n'est fixé dans cette proposition.

## 2. Structure recommandée au lancement

Commencer avec deux niveaux seulement :

- **Gratuit** : présence de base complète dans l'annuaire national et accès aux fonctions essentielles.
- **Premium** : capacités plus élevées, outils de gestion et statistiques avancées.

Éviter de lancer plusieurs niveaux payants avant d'avoir observé les besoins réels des entreprises haïtiennes.

## 3. Matrice proposée des avantages

Les quotas ci-dessous sont des valeurs de départ à valider. Ils ne sont pas encore des limites techniques ou commerciales définitives.

| Fonctionnalité | Gratuit | Premium |
|---|---:|---:|
| Présence dans l'annuaire national Zack | Oui | Oui |
| Fiche d'entreprise et informations essentielles | Oui | Oui |
| Téléphone, adresse, horaires et liens sociaux | Oui | Oui |
| Galerie de présentation | Jusqu'à 5 photos | Jusqu'à 30 photos |
| Catalogue produits et services | Jusqu'à 10 éléments actifs | Jusqu'à 100 éléments actifs |
| Messagerie avec les clients | Oui | Oui |
| Réception de demandes de contact | Oui | Oui |
| Publications | Quota limité | Quota supérieur |
| Promotions | Quota limité | Quota supérieur |
| Statistiques | Essentielles | Détaillées |
| Personnalisation de la fiche | Présentation standard | Options avancées |
| Gestion des membres de l'équipe | Fonctions de base selon permissions | Fonctions de base selon permissions |

Les quotas de publications et promotions doivent être chiffrés avant le SQL final. La taille des photos, leur compression et les quotas de stockage doivent également être définis pour maîtriser les coûts.

## 4. Règles de fonctionnement

### 4.1 Équité entre entreprises

- Une entreprise au niveau Gratuit reste consultable dans l'annuaire national.
- Elle peut recevoir des demandes de contact et utiliser les fonctions essentielles autorisées.
- Le niveau payant ne doit pas être une condition pour exister ou être visible sur Zack.
- Les limites doivent être clairement affichées avant qu'une entreprise atteigne son quota.

### 4.2 Premium et vérification sont deux notions différentes

- Le paiement d'un abonnement Premium ne rend pas automatiquement une entreprise vérifiée.
- Le badge de vérification est attribué uniquement après le processus de vérification défini par Zack.
- Une entreprise peut être vérifiée et rester au niveau Gratuit.
- Une entreprise Premium peut ne pas être vérifiée.
- Les interfaces ne doivent pas utiliser un badge ou un libellé qui laisse croire qu'un paiement constitue une preuve de fiabilité.

### 4.3 Premium et publicité sont deux notions différentes

- L'abonnement Premium donne accès aux avantages prévus dans sa matrice.
- Il ne garantit pas automatiquement une position permanente en première place dans les recherches.
- Une future fonctionnalité de promotion payante ou de publicité doit être distincte, clairement identifiée et encadrée par des règles d'affichage équitables.
- Les résultats organiques doivent conserver des critères pertinents pour l'utilisateur.

### 4.4 Modération des contenus

- Les publications restent soumises à la modération centralisée déjà décidée pour Zack.
- Un abonnement payant ne permet pas de contourner la modération.
- Les limites de publication ne changent pas les règles de validation du contenu.

## 5. Offres gratuites accordées par l'administration

La proposition conserve la décision déjà documentée dans le modèle de données :

- Un administrateur Zack ayant la permission dédiée peut accorder le niveau Premium sans paiement.
- La durée peut être prédéfinie, personnalisée ou illimitée.
- Le motif est obligatoire.
- Une offre illimitée reste active jusqu'à révocation ou remplacement explicite.
- L'offre ne génère ni transaction fictive, ni reçu de paiement, ni revenu.
- L'offre et un abonnement réellement payé restent des droits distincts, historisés séparément.
- Le niveau effectif est calculé côté serveur.

## 6. Éléments à décider avant validation commerciale

1. Confirmer les quotas exacts de photos et d'éléments du catalogue.
2. Définir les quotas de publications et de promotions pour chaque niveau.
3. Définir précisément les statistiques incluses dans Gratuit et Premium.
4. Définir les options de personnalisation Premium.
5. Décider si Premium est facturé au mois, à l'année, ou selon les deux modalités.
6. Fixer les prix seulement après validation des coûts, du marché cible et des moyens de paiement disponibles.
7. Définir la période de grâce et les effets d'une expiration ou d'un échec de renouvellement.
8. Définir la permission d'administration permettant d'accorder et de révoquer les offres gratuites.

## 7. Recommandation

Pour le premier lancement, privilégier deux niveaux simples, puis mesurer l'utilisation réelle avant d'ajouter un niveau supérieur. Garder la publicité et les mises en avant payantes comme modules séparés qui pourront être conçus ultérieurement.

## 8. État technique

Cette proposition est uniquement documentaire. Aucune table, migration SQL, policy RLS, fonction serveur, interface, configuration ou donnée Supabase n'a été créée ou modifiée. Aucun prix ni quota n'est considéré comme définitivement approuvé.
