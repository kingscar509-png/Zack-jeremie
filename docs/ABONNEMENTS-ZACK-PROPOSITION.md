# Zack — Proposition des niveaux d'abonnement

**Date :** 13 novembre 2026  
**Branche :** `preparation/phase-1-frontend-plan`  
**Statut :** proposition de conception — À VALIDER — NON IMPLÉMENTÉE  
**Portée :** entreprises de toute Haïti.

## 1. Objectif

Définir une offre accessible aux entreprises de toutes tailles, sans empêcher les entreprises gratuites d'être découvertes et contactées. Les abonnements financent des capacités supplémentaires, mais ne doivent pas être confondus avec la vérification administrative ni avec l'achat de publicité.

Aucun prix ni quota définitif n'est fixé à ce stade.

## 2. Structure confirmée des abonnements

La structure choisie comporte trois niveaux :

1. **Gratuit** : accès sans paiement. Il permet à une entreprise d'être présente sur Zack et d'utiliser les fonctions essentielles.
2. **Payant** : premier niveau payant, destiné aux entreprises qui veulent davantage de capacités et d'outils.
3. **Ultra** : niveau supérieur, destiné aux entreprises qui ont besoin des capacités les plus avancées proposées par Zack.

Les niveaux **Payant** et **Ultra** seront chacun proposés avec deux périodicités :
- abonnement mensuel ;
- abonnement annuel.

Le niveau Gratuit n'exige aucun paiement. Les prix mensuels et annuels restent à définir ultérieurement.

## 3. Matrice préliminaire des avantages

Les éléments ci-dessous sont des pistes de conception, pas des quotas ni des fonctionnalités définitivement approuvés. Les différences exactes entre Payant et Ultra doivent encore être validées.

| Fonctionnalité | Gratuit | Payant | Ultra |
|---|---|---|---|
| Présence dans l'annuaire national Zack | Oui | Oui | Oui |
| Fiche d'entreprise et informations essentielles | Oui | Oui | Oui |
| Téléphone, adresse, horaires et liens sociaux | Oui | Oui | Oui |
| Galerie de présentation | Quota de base | Quota supérieur | Quota maximal à définir |
| Catalogue produits et services | Quota de base | Quota supérieur | Quota maximal à définir |
| Messagerie avec les clients | Fonctions essentielles | Fonctions avancées à définir | Fonctions avancées à définir |
| Réception de demandes de contact | Oui | Oui | Oui |
| Publications et promotions | Quotas de base | Quotas supérieurs | Quotas les plus élevés à définir |
| Statistiques | Essentielles | Plus détaillées | Analyses avancées à définir |
| Personnalisation de la fiche | Standard | Options supplémentaires | Options les plus avancées à définir |
| Outils de gestion de l'entreprise | Essentiels | Outils supplémentaires | Outils avancés à définir |

Les quotas de photos, produits, services, publications et promotions doivent être chiffrés avant la conception SQL finale. La taille des photos, leur compression et les quotas de stockage doivent aussi être définis pour maîtriser les coûts.

## 4. Périodicité des paiements

Pour les niveaux Payant et Ultra :

- **Mensuel** : l'entreprise paie pour une période d'un mois.
- **Annuel** : l'entreprise paie pour une période d'un an.
- Les deux périodicités donnent accès aux avantages du même niveau ; seule la durée et le prix changent, sauf décision commerciale ultérieure.
- Le prix annuel pourra être plus avantageux que douze paiements mensuels, mais le montant et la réduction ne sont pas encore décidés.
- Le renouvellement, les rappels d'expiration, les échecs de paiement et les éventuelles périodes de grâce doivent être définis avant implémentation.
- Les transactions MonCash doivent être vérifiées côté serveur. Un statut payé ne doit jamais être accordé sur la seule base d'une confirmation envoyée par le navigateur.

## 5. Règles de fonctionnement

### 5.1 Équité entre entreprises

- Une entreprise au niveau Gratuit reste consultable dans l'annuaire national.
- Elle peut recevoir des demandes de contact et utiliser les fonctions essentielles autorisées.
- Le paiement ne doit pas être une condition pour exister ou être visible sur Zack.
- Les limites doivent être clairement affichées avant qu'une entreprise atteigne son quota.

### 5.2 Abonnement et vérification sont deux notions différentes

- Le paiement de Payant ou Ultra ne rend pas automatiquement une entreprise vérifiée.
- Le badge de vérification est attribué uniquement après le processus de vérification défini par Zack.
- Une entreprise peut être vérifiée et rester au niveau Gratuit.
- Une entreprise Payant ou Ultra peut ne pas être vérifiée.
- L'interface ne doit pas laisser croire qu'un paiement constitue une preuve de fiabilité.

### 5.3 Abonnement et publicité sont deux notions différentes

- Les niveaux donnent accès aux avantages décrits dans leur matrice.
- Payant ou Ultra ne garantit pas automatiquement une position permanente en première place dans les recherches.
- Une future fonctionnalité de promotion payante ou de publicité doit être distincte, clairement identifiée et encadrée par des règles d'affichage équitables.
- Les résultats organiques doivent conserver des critères pertinents pour l'utilisateur.

### 5.4 Modération des contenus

- Les publications restent soumises à la modération centralisée déjà décidée pour Zack.
- Un abonnement payant ne permet pas de contourner la modération.
- Les quotas ne changent pas les règles de validation du contenu.

## 6. Avantages offerts gratuitement par l'administration

La décision déjà confirmée est maintenue :

- Un administrateur Zack ayant la permission dédiée peut accorder gratuitement le niveau Payant ou Ultra à une entreprise.
- La durée peut être prédéfinie, personnalisée ou illimitée.
- Le motif est obligatoire.
- Une offre illimitée reste active jusqu'à révocation ou remplacement explicite par un administrateur autorisé.
- L'offre ne génère ni transaction fictive, ni reçu de paiement, ni revenu.
- Une offre administrative et un abonnement réellement payé restent des droits distincts, historisés séparément.
- Le niveau effectif est calculé côté serveur.
- Si plusieurs droits valides coexistent, Zack applique le niveau le plus élevé autorisé sans supprimer l'historique des autres droits. La fin ou révocation d'une offre ne doit pas interrompre un abonnement payé toujours valide.

## 7. Décisions encore nécessaires

1. Définir les avantages précis de Payant.
2. Définir les avantages supplémentaires propres à Ultra.
3. Fixer les quotas exacts de photos, produits, services, publications et promotions.
4. Définir les statistiques et outils de gestion de chaque niveau.
5. Décider si certains avantages Ultra sont réservés aux entreprises ayant une équipe ou un volume d'activité important.
6. Fixer les prix mensuels et annuels après analyse des coûts et du marché haïtien.
7. Définir les règles de renouvellement, d'expiration, d'échec de paiement et de période de grâce.
8. Définir la permission administrative permettant d'accorder et de révoquer les offres gratuites.

## 8. Recommandation

Conserver trois niveaux clairement différenciés. Le niveau Gratuit doit rester utile ; Payant doit apporter une amélioration concrète ; Ultra doit proposer des outils et capacités nettement supérieurs, sans simplement répéter les avantages de Payant avec un prix plus élevé.

## 9. État technique

Cette mise à jour est uniquement documentaire. Aucune table, migration SQL, policy RLS, fonction serveur, interface, configuration ou donnée Supabase n'a été créée ou modifiée. Les prix, quotas et détails des avantages restent à valider.
