# Zack — Proposition des niveaux d'abonnement

**Date :** 13 novembre 2026  
**Branche :** `preparation/phase-1-frontend-plan`  
**Statut :** proposition de conception — À VALIDER — NON IMPLÉMENTÉE  
**Portée :** entreprises de toute Haïti.

## 1. Objectif

Définir une offre accessible aux entreprises de toutes tailles, sans empêcher les entreprises gratuites d'être découvertes et contactées. Les abonnements financent des capacités supplémentaires, mais ne doivent pas être confondus avec la vérification administrative ni avec l'achat de publicité.

Aucun prix définitif n'est fixé à ce stade.

## 2. Structure confirmée des abonnements

La structure choisie comporte trois niveaux :

1. **Gratuit** : accès sans paiement. Il permet à une entreprise d'être présente sur Zack et d'utiliser les fonctions essentielles.
2. **Payant** : premier niveau payant, destiné aux entreprises qui veulent davantage de capacités et d'outils.
3. **Ultra** : niveau supérieur, destiné aux entreprises qui ont besoin des capacités les plus avancées proposées par Zack.

Les niveaux **Payant** et **Ultra** seront chacun proposés avec deux périodicités :
- abonnement mensuel ;
- abonnement annuel.

Le niveau Gratuit n'exige aucun paiement. Les prix mensuels et annuels restent à définir ultérieurement.

## 3. Trois axes de valeur confirmés

Le choix retenu est de construire les avantages des abonnements autour des trois axes suivants, avec une progression réelle entre les niveaux :

### 3.1 Visibilité auprès des clients
- Présentation de l'entreprise dans l'annuaire national.
- Mise en valeur de sa fiche et de ses contenus.
- Outils pour mieux présenter ses produits, services et actualités.
- Options de visibilité supplémentaires selon le niveau, conformément à la progression précisée à la section 4.1.

### 3.2 Outils de gestion de l'entreprise
- Gestion de la fiche et du catalogue.
- Outils pour organiser les publications, promotions et interactions.
- Statistiques de consultation et d'activité.
- Outils plus avancés pour les entreprises ayant davantage de besoins opérationnels.

### 3.3 Développement des ventes
- Présentation et gestion du catalogue de produits et services.
- Réception et suivi des demandes et commandes selon les fonctionnalités activées.
- Outils facilitant les échanges avec les clients.
- Capacités supplémentaires pour les entreprises qui développent leur activité sur Zack.

Les fonctionnalités exactes et les quotas de chaque axe restent à préciser. Il ne faut pas promettre une fonctionnalité qui n'est pas encore conçue, développée et testée.

## 4. Matrice préliminaire des avantages

Les éléments ci-dessous sont des pistes de conception, sauf les décisions explicitement marquées comme confirmées.

| Fonctionnalité | Gratuit | Payant | Ultra |
|---|---|---|---|
| Présence dans l'annuaire national Zack | Oui | Oui | Oui |
| Fiche d'entreprise et informations essentielles | Oui | Oui | Oui |
| Téléphone, adresse, horaires et liens sociaux | Oui | Oui | Oui |
| Galerie de présentation de l'entreprise | 5 photos | 20 photos | 50 photos |
| Catalogue produits et services | 10 au total | 100 au total | 500 au total |
| Messagerie avec les clients | Fonctions essentielles | Fonctions avancées à définir | Fonctions avancées à définir |
| Réception de demandes de contact | Oui | Oui | Oui |
| Publications générales | 3 par mois | 20 par mois | 60 par mois |
| Gestion des commandes reçues | Gestion simple | Outils supplémentaires | Gestion approfondie |
| Suivi des ventes | Suivi simple des commandes | Suivi plus complet | Suivi des performances et analyses avancées |
| Statistiques | Essentielles | Plus détaillées | Analyses avancées à définir |
| Personnalisation de la fiche | Standard | Options supplémentaires | Options les plus avancées à définir |
| Outils de gestion de l'entreprise | Essentiels | Outils supplémentaires | Outils avancés à définir |
| Outils de développement des ventes | Fonctions essentielles | Capacités supplémentaires | Capacités avancées à définir |

### 4.1 Progression de visibilité — décision confirmée

La progression de visibilité acceptée est la suivante :

- **Gratuit** : visibilité normale dans les résultats de recherche et l'annuaire.
- **Payant** : meilleure mise en valeur de la fiche de l'entreprise.
- **Ultra** : options de visibilité prioritaires et davantage de possibilités de mise en avant.

Garde-fous à respecter :
- Une mise en avant payante doit être identifiable comme telle (par exemple « Sponsorisé » ou « Mis en avant »).
- Aucun abonnement ne garantit une première place permanente dans les résultats.
- Les résultats organiques doivent conserver des critères pertinents pour les utilisateurs.
- Les options concrètes, leur fréquence, leur emplacement et leurs quotas restent à définir.
- La visibilité payante ne constitue ni une vérification ni une garantie de qualité de l'entreprise.

### 4.2 Progression des outils de gestion — décision confirmée

La progression acceptée est la suivante :

- **Gratuit** : gérer les informations essentielles de l'entreprise.
- **Payant** : gestion plus complète, statistiques et organisation des activités.
- **Ultra** : outils avancés, gestion d'équipe et analyses approfondies.

Pistes de fonctionnalités à étudier :
- Tableau de bord de gestion de la fiche et du catalogue.
- Organisation et planification des publications et promotions.
- Statistiques de visites, consultations de produits, demandes et interactions.
- Gestion d'équipe avec rôles et permissions configurables.
- Rapports plus détaillés pour aider le propriétaire à comprendre les performances de son entreprise.

Ces avantages doivent respecter les permissions d'équipe déjà décidées : le propriétaire et l'administrateur d'entreprise gèrent les accès ; un éditeur ne reçoit pas automatiquement des droits sur les messages ou commandes. Les abonnements ne doivent jamais contourner les permissions de sécurité.

### 4.3 Progression des outils de vente — décision confirmée

La progression acceptée est la suivante :

- **Gratuit** : présenter les produits et services, recevoir des demandes de contact et gérer simplement les commandes reçues.
- **Payant** : disposer d'un catalogue plus complet, d'outils supplémentaires de gestion des commandes et d'un suivi plus complet des ventes.
- **Ultra** : disposer d'outils avancés de vente, d'une gestion approfondie des commandes et d'un suivi des performances commerciales avec analyses avancées.

Principe d'équité confirmé : une entreprise au niveau Gratuit ne doit pas être exclue du commerce sur Zack. Elle peut recevoir et gérer ses commandes avec les fonctions de base. Les niveaux payants apportent des outils supplémentaires, mais ne réservent pas le commerce aux seuls abonnés.

Pistes à détailler avant toute implémentation :
- Outils de suivi des demandes et commandes adaptés aux droits de chaque membre.
- Rapports sur les ventes, les articles consultés et les commandes, avec définitions précises des indicateurs.
- Fonctionnalités avancées qui ne changent pas les règles métier communes du commerce Zack.

Les abonnements ne doivent pas modifier les règles fondamentales déjà retenues : panier multi-vendeurs, commandes séparées par vendeur, paiements de commandes hors plateforme au lancement, annulations et permissions contrôlées côté serveur. Un abonnement ne peut pas donner à un vendeur accès aux commandes d'une autre entreprise ni contourner les permissions de ses employés.

### 4.4 Quotas du catalogue — décision confirmée

Les limites proposées et acceptées sont :

- **Gratuit : 10** produits et services au total.
- **Payant : 100** produits et services au total.
- **Ultra : 500** produits et services au total.

Règles de comptage :
- Les produits et les services partagent un seul quota commun par entreprise. Par exemple, une entreprise Gratuit peut publier 6 produits et 4 services, soit 10 éléments au total.
- Modifier un élément existant ne consomme pas une place supplémentaire.
- Supprimer un élément libère une place dans le quota.
- Les limites sont cumulées au niveau de l'entreprise, pas séparément pour chaque membre de son équipe.
- Les quotas doivent être contrôlés côté serveur afin qu'un utilisateur ne puisse pas les contourner en modifiant l'interface.
- Les règles concernant les éléments masqués, archivés, en attente de modération ou désactivés devront être précisées dans la conception détaillée.

Ces quotas sont des décisions de conception ; ils ne sont pas encore appliqués techniquement.

### 4.5 Quotas de la galerie de présentation — décision confirmée

Les limites acceptées pour la galerie générale de l'entreprise sont :

- **Gratuit : 5 photos**.
- **Payant : 20 photos**.
- **Ultra : 50 photos**.

Précisions :
- Ce quota concerne uniquement la galerie de présentation générale de l'entreprise.
- Il est distinct des images associées aux produits et services du catalogue.
- Le quota est partagé par toute l'entreprise et non attribué séparément à chaque membre.
- Remplacer une photo existante ne consomme pas une place supplémentaire ; supprimer une photo libère une place.
- Les limites doivent être vérifiées côté serveur.
- Les règles de comptage des photos en attente de modération ou masquées seront précisées dans la conception détaillée.

Ces quotas sont des décisions de conception ; ils ne sont pas encore appliqués techniquement.

La taille maximale des fichiers, les formats autorisés, la compression, les miniatures et les quotas de stockage doivent encore être définis pour maîtriser les coûts et garantir un affichage rapide sur mobile.

### 4.6 Quotas des publications générales — décision confirmée

Les limites acceptées pour les publications générales de l'entreprise sont :

- **Gratuit : 3 publications par mois**.
- **Payant : 20 publications par mois**.
- **Ultra : 60 publications par mois**.

Les publications générales peuvent notamment présenter les actualités de l'entreprise, ses nouveautés, annonces et événements.

**Mode de publication confirmé : publication immédiate.** Lorsqu'une entreprise publie, le contenu devient visible immédiatement, sans attendre une validation préalable par un administrateur. La modération est donc effectuée après publication.

**Pouvoir de modération confirmé :** un administrateur Zack autorisé peut supprimer une publication qui enfreint les règles. Le motif de suppression est obligatoire. L'entreprise concernée doit être informée du motif par une notification. Zack doit conserver une trace d'audit comprenant au minimum la publication concernée, l'administrateur ayant effectué l'action, le motif et la date. Les permissions de modération doivent être contrôlées côté serveur.

**Règle de quota confirmée :** lorsqu'une publication est supprimée par un administrateur pour non-respect des règles, elle continue de compter dans le quota de publications de l'entreprise pour la période concernée. Sa suppression ne libère donc pas une nouvelle place.

Précisions techniques à définir avant implémentation : période calendaire ou période glissante ; traitement des publications supprimées par leur auteur ; éventuelle distinction entre publications générales et promotions. Le quota sera contrôlé côté serveur et partagé par l'entreprise, pas par membre.

Ces limites et règles de fonctionnement sont des décisions de conception ; elles ne sont pas encore appliquées techniquement.

## 5. Périodicité des paiements

Pour les niveaux Payant et Ultra :

- **Mensuel** : l'entreprise paie pour une période d'un mois.
- **Annuel** : l'entreprise paie pour une période d'un an.
- Les deux périodicités donnent accès aux avantages du même niveau ; seule la durée et le prix changent, sauf décision commerciale ultérieure.
- Le prix annuel pourra être plus avantageux que douze paiements mensuels, mais le montant et la réduction ne sont pas encore décidés.
- Le renouvellement, les rappels d'expiration, les échecs de paiement et les éventuelles périodes de grâce doivent être définis avant implémentation.
- Les transactions MonCash doivent être vérifiées côté serveur. Un statut payé ne doit jamais être accordé sur la seule base d'une confirmation envoyée par le navigateur.

## 6. Règles de fonctionnement

### 6.1 Équité entre entreprises

- Une entreprise au niveau Gratuit reste consultable dans l'annuaire national.
- Elle peut recevoir des demandes de contact, utiliser les fonctions essentielles autorisées et gérer simplement les commandes reçues.
- Le paiement ne doit pas être une condition pour exister, être visible ou recevoir et traiter des commandes de base sur Zack.
- Les limites doivent être clairement affichées avant qu'une entreprise atteigne son quota.

### 6.2 Abonnement et vérification sont deux notions différentes

- Le paiement de Payant ou Ultra ne rend pas automatiquement une entreprise vérifiée.
- Le badge de vérification est attribué uniquement après le processus de vérification défini par Zack.
- Une entreprise peut être vérifiée et rester au niveau Gratuit.
- Une entreprise Payant ou Ultra peut ne pas être vérifiée.
- L'interface ne doit pas laisser croire qu'un paiement constitue une preuve de fiabilité.

### 6.3 Abonnement et publicité sont deux notions différentes

- Les niveaux donnent accès aux avantages décrits dans leur matrice.
- Payant ou Ultra ne garantit pas automatiquement une position permanente en première place dans les recherches.
- Une future fonctionnalité de promotion payante ou de publicité doit être distincte, clairement identifiée et encadrée par des règles d'affichage équitables.
- Les résultats organiques doivent conserver des critères pertinents pour l'utilisateur.

### 6.4 Modération des contenus

- Les publications sont visibles immédiatement après leur envoi, puis peuvent être contrôlées par la modération centralisée de Zack.
- Un administrateur autorisé peut supprimer un contenu non conforme avec un motif obligatoire.
- L'entreprise reçoit une notification expliquant la suppression.
- L'action de modération est conservée dans un historique d'audit.
- Un abonnement payant ne permet pas de contourner les règles de modération.
- Les quotas ne changent pas les règles de modération.

## 7. Avantages offerts gratuitement par l'administration

La décision déjà confirmée est maintenue :

- Un administrateur Zack ayant la permission dédiée peut accorder gratuitement le niveau Payant ou Ultra à une entreprise.
- La durée peut être prédéfinie, personnalisée ou illimitée.
- Le motif est obligatoire.
- Une offre illimitée reste active jusqu'à révocation ou remplacement explicite par un administrateur autorisé.
- L'offre ne génère ni transaction fictive, ni reçu de paiement, ni revenu.
- Une offre administrative et un abonnement réellement payé restent des droits distincts, historisés séparément.
- Le niveau effectif est calculé côté serveur.
- Si plusieurs droits valides coexistent, Zack applique le niveau le plus élevé autorisé sans supprimer l'historique des autres droits. La fin ou révocation d'une offre ne doit pas interrompre un abonnement payé toujours valide.

## 8. Décisions encore nécessaires

1. Définir les avantages précis de Payant.
2. Définir les avantages supplémentaires propres à Ultra.
3. Définir les options concrètes de visibilité, leur emplacement, leur fréquence et leurs quotas.
4. Définir les règles détaillées de comptage des publications et déterminer si les promotions utilisent un quota distinct.
5. Définir les règles de comptage des éléments masqués, archivés, en attente de modération ou désactivés.
6. Définir les règles techniques des photos : poids, formats, compression, miniatures et stockage.
7. Définir les statistiques et outils de gestion de chaque niveau.
8. Définir les outils concrets de vente et de suivi des performances.
9. Fixer les prix mensuels et annuels après analyse des coûts et du marché haïtien.
10. Définir les règles de renouvellement, d'expiration, d'échec de paiement et de période de grâce.
11. Définir la permission administrative permettant d'accorder et de révoquer les offres gratuites.

## 9. Recommandation

Conserver trois niveaux clairement différenciés. Le niveau Gratuit doit rester utile ; Payant doit apporter une amélioration concrète ; Ultra doit proposer des outils et capacités nettement supérieurs, sur les trois axes : visibilité, gestion et développement des ventes.

## 10. État technique

Cette mise à jour est uniquement documentaire. Aucune table, migration SQL, policy RLS, fonction serveur, interface, configuration ou donnée Supabase n'a été créée ou modifiée. Les prix et les détails des avantages restent à valider. Les quotas de publications générales sont confirmés, mais leurs règles détaillées de comptage restent à définir.
