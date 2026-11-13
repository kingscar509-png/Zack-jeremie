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

**Règles de suppression et de modification par l'entreprise confirmées :**
- Supprimer une publication déjà publiée ne libère pas la place consommée dans le quota du mois.
- Modifier une publication existante ne consomme pas une nouvelle place.
- Un brouillon supprimé avant sa première publication ne consomme aucun quota.

**Période de renouvellement confirmée : mois calendaire.** Le quota est renouvelé automatiquement le premier jour de chaque mois. Chaque entreprise dispose donc de son quota mensuel du 1er au dernier jour du mois. Le quota non utilisé n'est pas reporté au mois suivant.

L'heure de renouvellement doit être calculée selon un fuseau horaire de référence défini par Zack pour Haïti, afin que les entreprises voient des dates cohérentes.

**Publications générales et promotions — règle confirmée :** les deux types partagent le même quota mensuel. Une actualité, une annonce, un événement ou une promotion consomme donc une place dans le même compteur. Il n'existe pas de quota supplémentaire réservé aux promotions.

Le quota sera contrôlé côté serveur et partagé par l'entreprise, pas par membre.

**Durée d'affichage — règle confirmée :**
- Une publication générale reste visible jusqu'à sa suppression par l'entreprise ou par un administrateur Zack autorisé.
- Le renouvellement mensuel du quota ne supprime pas les publications déjà publiées.
- Une promotion peut comporter une date de début et une date de fin.
- À la date de fin, la promotion devient automatiquement inactive et cesse d'être présentée comme une offre en cours ; elle reste consultable dans l'historique de l'entreprise.
- Les règles d'affichage exactes des promotions expirées dans les pages publiques restent à préciser.

Ces limites et règles de fonctionnement sont des décisions de conception ; elles ne sont pas encore appliquées techniquement.

### 4.7 Commentaires sur les publications — décision confirmée

- Tous les visiteurs peuvent consulter les publications publiques.
- Seuls les utilisateurs connectés à un compte Zack peuvent publier un commentaire.
- Les entreprises peuvent répondre aux commentaires publiés sur leurs contenus, depuis un compte autorisé pour cette entreprise.
- **Gestion des commentaires par l'entreprise — décision confirmée :** l'entreprise peut répondre aux commentaires, masquer un commentaire sur son propre espace et signaler un commentaire à l'administration Zack. Elle ne peut pas supprimer définitivement le commentaire d'un client. Le masquage doit être réversible et son auteur ainsi que l'administration doivent pouvoir être identifiés dans les traces nécessaires.
- L'administration Zack conserve la responsabilité des décisions de modération définitives, selon des permissions dédiées.
- L'entreprise peut modifier ou supprimer sa propre réponse à un commentaire.
- Le client peut modifier ou supprimer son propre commentaire.
- Les modifications et suppressions importantes doivent laisser une trace d'audit adaptée (auteur, date et action), sans nécessairement exposer publiquement les anciennes versions.
- Les règles de notification, de recours, de durée de masquage et de visibilité des commentaires masqués restent à détailler.
- Les permissions de réponse et de modération doivent être vérifiées côté serveur.

### 4.8 Mentions « J'aime » — décision confirmée

- Seuls les utilisateurs connectés à un compte Zack peuvent aimer une publication.
- Un utilisateur ne peut enregistrer qu'une seule mention « J'aime » active par publication ; il peut la retirer.
- Les visiteurs non connectés peuvent consulter le contenu et le nombre de mentions « J'aime », mais ne peuvent pas interagir avec cette fonction.
- Le contrôle de l'unicité et des autorisations doit être effectué côté serveur afin d'éviter les doublons ou manipulations.

### 4.9 Partage des publications — décision confirmée

- Tout visiteur, avec ou sans compte Zack, peut partager une publication publique.
- Le partage peut se faire par lien direct ou via les applications disponibles sur son appareil, notamment WhatsApp et Facebook.
- Chaque publication publique dispose d'un lien partageable stable.
- Le partage ne doit pas révéler de données privées ni contourner les paramètres de visibilité ou une suppression/modération.

### 4.10 Statistiques des publications selon l'abonnement — décision confirmée

La répartition suivante est acceptée :

| Statistique | Gratuit | Payant | Ultra |
|---|---|---|---|
| Nombre de vues | Oui | Oui | Oui |
| Nombre de mentions « J'aime » | Oui | Oui | Oui |
| Nombre de commentaires | Oui | Oui | Oui |
| Nombre de partages | Non | Oui | Oui |
| Évolution des performances dans le temps | Non | Oui | Oui |
| Analyse détaillée par publication | Non | Non | Oui |

Les définitions de chaque indicateur, les périodes d'analyse, les règles de comptage (notamment vues uniques ou totales) et la présentation des tableaux de bord restent à préciser avant implémentation. Les statistiques doivent être calculées et protégées côté serveur.

### 4.11 Formats et gestion des publications — décisions confirmées

- **Contenus publiables :** texte et photos. La vidéo n'est pas incluse dans le périmètre de lancement actuellement retenu.
- **Photos par publication :** maximum de 5 photos par publication.
- **Modification :** l'entreprise peut modifier une publication déjà publiée immédiatement, sans validation préalable. La publication modifiée reste soumise au contrôle a posteriori de Zack et peut être retirée si elle enfreint les règles.
- **Notifications :** les utilisateurs qui suivent une entreprise peuvent recevoir une notification lorsqu'elle publie, selon leurs préférences et les notifications pertinentes qu'ils ont activées. Les notifications doivent respecter le consentement et les paramètres de chaque utilisateur.
- **Signalement :** un utilisateur peut signaler une publication et sélectionner un motif, notamment arnaque, contenu offensant, fausse information ou publicité trompeuse. Un signalement ne provoque pas de suppression ni de masquage automatique : la publication reste visible jusqu'à son examen par un administrateur Zack autorisé.
- **Archivage :** l'entreprise peut archiver manuellement ses propres publications. Une publication archivée devient invisible au public et reste accessible dans les archives privées de l'espace de gestion de l'entreprise. Elle continue de compter dans le quota mensuel. L'entreprise peut la restaurer sans consommer une nouvelle place.

Ces fonctions doivent être autorisées et vérifiées côté serveur. Les notifications ne doivent pas révéler de données privées et leur échec ne doit pas empêcher la publication.

### 4.12 Archivage, historique, signalements et notifications — décisions confirmées

- **Visibilité des archives :** une publication archivée est retirée de l'affichage public et conservée dans les archives privées de l'entreprise.
- **Quota après archivage :** l'archivage ne libère pas de place ; la publication continue de compter dans le quota mensuel partagé de l'entreprise.
- **Restauration :** l'entreprise peut restaurer une publication archivée sans consommer une nouvelle place de quota. La restauration ne doit pas créer une publication indépendante ni remettre à zéro son historique de quota.
- **Historique des modifications :** aucun historique des versions successives du contenu n'est prévu dans l'espace entreprise ni dans l'interface d'administration. Cette décision ne supprime pas les traces d'audit nécessaires pour les actions sensibles de modération, de sécurité ou d'administration.
- **Traitement des signalements :** le simple dépôt d'un signalement ne masque pas et ne supprime pas automatiquement la publication. Elle reste visible jusqu'à l'examen par un administrateur Zack autorisé, qui applique ensuite les mesures appropriées selon les règles de modération.
- **Notifications d'interactions :** les notifications peuvent concerner les nouveaux commentaires, les réponses et les mentions « J'aime ». L'utilisateur doit pouvoir activer ou désactiver séparément chaque catégorie, dans le respect de ses préférences et consentements. Les notifications doivent être envoyées aux personnes concernées uniquement et ne pas exposer de contenu privé.

Les contrôles d'accès, de quota, de restauration, de signalement et de préférences de notification doivent être effectués côté serveur.

### 4.13 Paramètres des photos, promotions, signalements et programmation — décisions confirmées

- **Poids des photos :** poids maximal de 2 Mo par photo envoyée dans une publication.
- **Formats acceptés :** JPG/JPEG, PNG et WebP.
- **Promotions terminées :** l'entreprise choisit le traitement d'affichage de chaque promotion après sa date de fin. Les options exactes à proposer dans l'interface restent à formaliser ; la promotion doit néanmoins être considérée comme terminée et ne plus être présentée comme une offre en cours.
- **Motifs de signalement :** Zack proposera une liste détaillée de motifs, comprenant notamment arnaque, contenu offensant, fausse information et publicité trompeuse, avec des catégories complémentaires pertinentes. La liste finale et les éventuels champs de précision restent à établir.
- **Information après modération :** l'entreprise est informée de la décision prise sur un signalement concernant sa publication, avec le motif communiqué par l'administration. Les informations personnelles du signalant ne doivent pas être divulguées.
- **Programmation :** une entreprise autorisée peut programmer une publication pour une date et une heure futures. La publication programmée doit être publiée automatiquement à l'heure prévue, sous réserve des contrôles serveur, des droits de l'entreprise et des règles de modération. Les règles de quota, de modification, d'annulation, de fuseau horaire et de gestion des échecs de publication restent à préciser avant implémentation.

Les limites de poids et formats doivent être contrôlées côté serveur, et les fichiers doivent être validés avant stockage. La programmation ne doit pas permettre de contourner les quotas ni les règles de modération.

### 4.14 Règles des publications programmées — décisions confirmées

- **Consommation du quota :** une publication programmée consomme une place dans le quota au moment où elle est effectivement publiée, et non au moment de sa programmation. Le contrôle du quota doit être effectué côté serveur juste avant la publication automatique.
- **Annulation :** l'entreprise peut annuler librement une publication programmée avant sa publication. Une publication annulée avant d'être publiée ne consomme pas de quota.
- **Modification :** l'entreprise peut modifier une publication programmée jusqu'à son heure de publication. Les droits de modification et la validité du contenu doivent être vérifiés côté serveur.
- **Fuseau horaire :** les dates et heures de programmation utilisent le fuseau horaire d'Haïti, identifié par IANA comme `America/Port-au-Prince`. L'interface doit présenter clairement la date et l'heure locales et gérer correctement les changements d'heure.
- **Échec de publication :** si la publication automatique échoue, Zack doit effectuer de nouvelles tentatives automatiques et prévenir l'entreprise si la publication ne peut finalement pas être effectuée. Le nombre de tentatives, leur intervalle, la durée maximale de reprise et les motifs d'échec nécessitant une intervention restent à définir.
- **Types de contenus :** les publications générales et les promotions peuvent toutes deux être programmées. Les dates de début et de fin d'une promotion doivent être cohérentes avec son horaire de publication.

La programmation doit être exécutée par un mécanisme serveur fiable, avec protection contre les doubles publications, journalisation des tentatives et traitement idempotent. Une publication programmée ne doit jamais être publiée si le quota n'est plus disponible, si l'entreprise a perdu les droits nécessaires ou si le contenu est devenu invalide. Les règles de modération a posteriori déjà définies restent applicables.

### 4.15 Quotas, brouillons et duplication — décisions confirmées

- **Quota épuisé à l'heure d'une publication programmée :** la publication est conservée en attente jusqu'à ce qu'un quota soit de nouveau disponible. Elle ne doit pas être publiée en dépassant le quota. L'entreprise doit être informée de cette attente et de la date à laquelle une nouvelle tentative est prévue. La règle exacte de priorité entre plusieurs publications en attente reste à définir.
- **Délai de programmation :** une publication peut être programmée jusqu'à 12 mois à l'avance. La date et l'heure doivent être valides et postérieures à l'instant de programmation, selon le fuseau horaire de référence d'Haïti.
- **Nombre de brouillons :** une entreprise peut conserver un nombre illimité de brouillons. Les brouillons non publiés ne consomment pas le quota mensuel des publications.
- **Sauvegarde des brouillons :** les brouillons sont sauvegardés sur le compte Zack de l'entreprise et accessibles depuis ses appareils autorisés. L'accès doit respecter les rôles et permissions des membres de l'entreprise.
- **Duplication :** la duplication d'une publication existante pour en créer une nouvelle est réservée aux abonnements Payant et Ultra. La copie est un nouveau brouillon ; elle ne consomme aucun quota tant qu'elle n'est pas publiée. Elle ne doit pas copier les interactions, commentaires, statistiques ou identifiants de l'original.
- **Quota mensuel atteint :** Zack bloque la publication de nouveaux contenus lorsque le quota mensuel est épuisé et indique à l'entreprise qu'elle doit attendre le renouvellement du quota. Aucun achat ponctuel de publications supplémentaires ni changement automatique d'abonnement n'est effectué. Les brouillons peuvent toutefois continuer à être créés et modifiés.

Les contrôles de quota doivent être atomiques et exécutés côté serveur pour éviter qu'une publication simultanée dépasse la limite. Les brouillons et copies doivent rester privés jusqu'à leur publication explicite ou programmée.

### 4.16 Gestion de la file des publications en attente — décisions confirmées

- **Ordre de priorité :** lorsque plusieurs publications attendent un quota, Zack traite d'abord celle dont la date de programmation est la plus ancienne. En cas d'égalité, un ordre secondaire stable doit être appliqué côté serveur.
- **Mode de publication après libération d'un quota :** l'entreprise choisit dans ses paramètres si les publications en attente doivent être publiées automatiquement dès qu'un quota devient disponible, ou si chaque publication doit attendre une confirmation manuelle. Le choix doit être explicite et modifiable ; le comportement retenu doit être clairement indiqué dans l'espace de gestion.
- **Modification :** une publication en attente peut être modifiée librement avant sa publication. Toute modification doit être revalidée côté serveur, notamment pour le contenu, les droits, le quota et les dates.
- **Suppression :** si l'entreprise supprime une publication en attente, celle-ci est annulée et retirée définitivement de la file de publication. Elle ne consomme aucun quota puisqu'elle n'a pas été publiée.
- **Notification de mise en attente :** Zack informe l'entreprise lorsqu'une publication passe en attente, en indiquant la raison et la date prévue de la prochaine tentative ou de la prochaine disponibilité estimée du quota. Cette estimation doit être présentée comme telle lorsqu'elle dépend d'un événement futur incertain.
- **Publication devenue trop ancienne ou invalide :** si une publication en attente dépasse sa date de validité ou le délai maximal de conservation qui sera défini, Zack l'annule automatiquement et avertit l'entreprise. La durée maximale de conservation, les règles de validité et les éventuelles possibilités de réactivation restent à préciser.

La file doit être traitée de façon fiable et atomique, sans double publication ni dépassement de quota. Le choix de publication automatique ou avec confirmation ne doit jamais permettre de publier un contenu supprimé, invalide, non autorisé ou contraire aux règles de modération.

### 4.17 Création et affichage des promotions commerciales — décisions confirmées

- **Informations obligatoires d'une promotion :** titre, description, prix normal, prix promotionnel, dates de début et de fin, ainsi que photos. Le système doit vérifier que les prix et les dates sont cohérents ; le prix promotionnel doit être inférieur au prix normal pour être présenté comme une réduction.
- **Promotion indépendante du catalogue :** une promotion peut être créée sans être liée à un produit ou service déjà présent dans le catalogue de l'entreprise. Elle peut donc présenter une offre ponctuelle ou un ensemble de prestations. Lorsqu'elle est liée à un élément du catalogue, le lien doit être explicite.
- **Présentation des prix :** l'ancien prix est affiché barré et le nouveau prix promotionnel est mis en évidence. Zack ne doit pas afficher de réduction trompeuse ; les valeurs doivent être saisies et confirmées par l'entreprise.
- **Promotions simultanées :** une entreprise peut avoir plusieurs promotions actives en même temps, dans la limite de son quota de publications commun aux promotions et aux publications générales.
- **Promotions multi-produits/services :** une même promotion peut concerner plusieurs éléments du catalogue. Les éléments concernés doivent être identifiés clairement et le prix ou l'avantage doit être compréhensible pour chaque élément. Les règles de prix groupé, de variantes et d'exclusions restent à préciser.
- **Fin prochaine :** Zack signale automatiquement aux visiteurs qu'une promotion approche de sa date de fin, par exemple avec une mention « Se termine bientôt ». Le seuil exact de cette indication reste à définir. À sa date de fin, la promotion cesse d'être présentée comme une offre en cours ; le traitement de son affichage après expiration suit le choix de l'entreprise déjà confirmé.

Les promotions doivent respecter les mêmes règles de publication, quota, programmation, archivage, modération et sécurité que les autres publications. La validation des prix, des dates, des éléments de catalogue et des permissions est effectuée côté serveur.

### 4.18 Conditions d'utilisation des promotions — décisions confirmées

- **Dates obligatoires :** chaque promotion doit obligatoirement comporter une date de début et une date de fin. Une promotion sans ces deux dates ne peut pas être publiée.
- **Type de réduction :** l'entreprise peut définir une réduction sous forme de montant fixe ou de pourcentage. Zack doit calculer et présenter clairement le prix promotionnel final, vérifier la cohérence des valeurs et éviter toute ambiguïté sur la devise et le montant économisé.
- **Quantité limitée :** l'entreprise peut fixer une quantité maximale d'articles ou de services disponibles dans le cadre de la promotion. Le système doit suivre les quantités restantes et empêcher de présenter comme disponible une offre dont le quota est épuisé. Les règles de réservation et de décrémentation effective de la quantité devront être précisées avec le fonctionnement des commandes.
- **Conditions d'accès :** l'entreprise peut définir des conditions pour bénéficier d'une promotion (par exemple une clientèle ou une situation particulière). Ces conditions doivent être visibles et compréhensibles avant que le client ne s'engage.
- **Promotions non cumulables :** lorsque plusieurs promotions concernent le même produit ou service, elles ne se cumulent pas. L'entreprise choisit la promotion applicable ; Zack doit afficher clairement celle qui s'applique et ne pas additionner automatiquement les réductions.
- **Codes promotionnels :** les entreprises peuvent créer des codes que les clients saisissent pour bénéficier d'une promotion. Les règles de génération, durée, nombre d'utilisations, conditions d'éligibilité, protection contre les usages abusifs et application au panier restent à détailler.

Ces règles s'appliquent à la conception des promotions. Les conditions, quantités, codes et réductions doivent être vérifiés côté serveur au moment pertinent, notamment lors de l'application d'une offre et de la validation d'une commande. Une interface ne doit jamais suffire à accorder un avantage ou à modifier un prix.

### 4.19 Règles d'utilisation des codes promotionnels — décisions confirmées

- **Distribution des codes :** les codes promotionnels sont partagés directement par l'entreprise avec les clients. Zack ne les propose pas automatiquement dans un catalogue public de codes.
- **Nombre d'utilisations :** l'entreprise peut fixer un nombre maximal total d'utilisations pour chaque code. Le code devient indisponible lorsque cette limite est atteinte.
- **Utilisation par client :** un même client ne peut utiliser un code donné qu'une seule fois.
- **Portée du code :** l'entreprise choisit si le code s'applique à un seul produit ou service, à plusieurs éléments déterminés ou à l'ensemble d'une commande, selon les options prévues par Zack.
- **Nouveaux clients :** une promotion peut être réservée aux nouveaux clients. La définition technique d'un nouveau client (par exemple selon l'existence d'une commande antérieure auprès de l'entreprise concernée) devra être précisée pour éviter les abus.
- **Code invalide ou expiré :** Zack affiche un message expliquant clairement pourquoi le code ne peut pas être utilisé, sans révéler d'informations sensibles ni permettre de tester abusivement les codes.

Les limites d'utilisation, l'unicité par client, l'éligibilité, la portée et la validité temporelle doivent être vérifiées côté serveur au moment de l'application et de la validation de la commande. Les utilisations concurrentes doivent être traitées de manière atomique afin de ne pas dépasser le nombre maximal défini.

### 4.20 Outils de gestion d'entreprise et fonctionnalités selon l'abonnement — décisions confirmées

- **Nombre de membres d'une entreprise :** les limites exactes par abonnement (Gratuit, Payant et Ultra) ne sont pas encore fixées. Elles seront définies dans une série ultérieure. Les droits d'accès doivent rester fondés sur des rôles et permissions, et non sur le seul fait d'être membre.
- **Rôles de l'équipe :** Zack proposera des rôles avec des permissions prédéfinies. Le propriétaire et les responsables autorisés pourront attribuer les rôles prévus, sans que l'abonnement permette de contourner les permissions de sécurité.
- **Téléchargement des statistiques :** cette fonctionnalité est réservée à l'abonnement Ultra. Les indicateurs visibles dans chaque niveau restent soumis à la matrice des statistiques déjà définie.
- **Gestion des stocks :** une gestion simple des stocks sera disponible dès l'abonnement Gratuit. Elle permettra notamment à l'entreprise d'enregistrer les quantités disponibles et de suivre leur évolution. Le niveau de détail des fonctions avancées reste à définir. Les mises à jour de stock liées aux commandes devront suivre les états de commande retenus et être traitées côté serveur pour éviter les quantités incohérentes.
- **Gestion des clients :** un outil de suivi des clients (par exemple historique des commandes et coordonnées utiles) sera disponible à partir de Payant. Les données ne seront accessibles qu'aux membres autorisés de l'entreprise et devront respecter les règles de confidentialité et de protection des données.
- **Devis et factures :** la création de devis et de factures sera disponible à partir de Payant. Les modèles, numérotations, statuts, formats d'exportation et règles fiscales applicables en Haïti restent à définir avant implémentation. Zack ne doit pas présenter un document comme une facture fiscale conforme sans validation des exigences applicables.

Ces fonctionnalités sont des décisions de conception et ne sont pas encore implémentées. Les contrôles d'abonnement, les rôles et les autorisations doivent être appliqués côté serveur.

### 4.21 Nombre de membres autorisés par entreprise — décision confirmée

Les limites de membres par entreprise sont fixées comme suit :

- **Gratuit : 1 membre.**
- **Payant : 5 membres.**
- **Ultra : 20 membres.**

Le propriétaire est inclus dans le nombre total de membres autorisés. Les invitations et l'ajout de membres doivent être bloqués côté serveur lorsque la limite de l'abonnement est atteinte. Les rôles et permissions prédéfinis restent applicables à chaque membre.

### 4.22 Gestion des stocks — décisions confirmées

- **Moment de diminution du stock :** la quantité disponible est diminuée lorsque la commande est remise au client. Les règles de réservation temporaire des quantités pendant la préparation, ainsi que le traitement des annulations et des livraisons échouées, restent à définir afin d'éviter les ventes en dépassement de stock.
- **Plusieurs magasins ou entrepôts :** une entreprise peut gérer plusieurs lieux de stockage dès le lancement. Chaque quantité doit être rattachée au lieu concerné ; les règles de transfert entre lieux et de disponibilité globale restent à détailler.
- **Produit en rupture :** lorsque le stock atteint zéro, le produit reste visible dans le catalogue, avec une indication claire qu'il est indisponible. Il ne doit pas pouvoir être commandé comme un article disponible.
- **Seuil d'alerte :** l'entreprise peut définir un seuil de stock faible et recevoir une notification lorsque la quantité atteint ce seuil. Les préférences de notification doivent être respectées.
- **Historique des mouvements :** Zack conserve l'historique des entrées, des ventes et des corrections de stock, avec au minimum la quantité concernée, le type de mouvement, la date et le membre autorisé à l'origine de l'action.
- **Droits de modification :** le propriétaire et les membres auxquels les permissions correspondantes ont été attribuées peuvent modifier les quantités. Les autres membres ne doivent pas pouvoir modifier le stock.

Les stocks, les mouvements et les permissions doivent être contrôlés côté serveur. Les mises à jour simultanées doivent être sécurisées afin d'éviter les quantités négatives ou incohérentes. Ces décisions sont documentaires et ne constituent pas une implémentation technique.

### 4.23 Réception et traitement des commandes — décisions confirmées

- **Confirmation de disponibilité :** lorsqu'un client passe une commande, le vendeur doit d'abord confirmer la disponibilité des produits ou services concernés avant que la commande soit acceptée. Zack doit distinguer clairement la demande reçue, la vérification de disponibilité et l'acceptation de la commande.
- **Délai de réponse :** le délai accordé au vendeur pour répondre est fixé à 12 heures. Le point de départ exact du délai et le traitement des heures non ouvrées devront être précisés dans les règles opérationnelles.
- **Absence de réponse :** si le vendeur ne répond pas dans le délai, le client choisit la suite à donner à la commande. Zack doit lui proposer les actions adaptées, notamment maintenir la demande en attente ou l'annuler. Aucune annulation automatique ne doit être déclenchée sans le choix du client.
- **Contact au sujet d'une commande :** le client peut contacter le vendeur par la messagerie intégrée de Zack au sujet de sa commande. L'accès à la conversation doit être limité aux participants et aux membres de l'entreprise autorisés.
- **Modification de quantité en cas de stock insuffisant :** le vendeur peut proposer une quantité différente, mais la modification ne devient effective qu'après acceptation explicite du client. En cas de refus, la ligne concernée suit la règle de refus partiel déjà définie ; les autres lignes de la commande peuvent continuer leur traitement.
- **Notifications de statut :** le client peut être informé des changements de statut par notification Zack, email et WhatsApp, sous réserve de son consentement pour les canaux concernés et de la disponibilité des services. Les préférences de notification doivent pouvoir être gérées par le client.

Les statuts, délais, modifications de lignes, autorisations et notifications doivent être contrôlés côté serveur et consignés de façon appropriée. Ces décisions complètent les règles déjà définies sur le panier multi-vendeurs, les commandes séparées par vendeur et les refus partiels ; elles ne les remplacent pas.


### 4.24 Paiements et remboursements des commandes — décisions confirmées

- **Moyens de paiement acceptés :** le client peut payer directement le vendeur avec tous les moyens de paiement que celui-ci accepte. Zack ne limite donc pas les paiements des commandes à une liste fixe de moyens.
- **Affichage des moyens de paiement :** le vendeur peut indiquer facultativement sur sa fiche les moyens de paiement qu'il accepte. L'absence de cette information ne signifie pas qu'il n'accepte aucun moyen de paiement.
- **Déclaration du paiement par le client :** le client peut simplement déclarer que le paiement a été effectué ou joindre une preuve de paiement. La preuve est facultative et ne constitue pas, à elle seule, une vérification automatique du paiement.
- **Confirmation par le vendeur :** le vendeur doit obligatoirement confirmer la réception du paiement dans Zack avant que la commande soit considérée comme payée. La déclaration du client ou une preuve jointe ne remplace pas cette confirmation.
- **Remboursements :** le vendeur et le client s'organisent directement pour effectuer le remboursement. Le vendeur peut ensuite enregistrer le remboursement dans Zack afin de conserver le suivi de la commande. Zack ne traite pas lui-même le transfert de remboursement au lancement.
- **Historique des paiements :** Zack conserve l'historique des paiements uniquement pour les abonnements Zack. L'historique détaillé des paiements des commandes n'est pas prévu dans le périmètre retenu pour le lancement.

Ces décisions concernent les commandes payées directement auprès des vendeurs, hors plateforme au lancement. Zack doit distinguer clairement les déclarations du client, la confirmation de réception par le vendeur et l'enregistrement éventuel d'un remboursement. Aucun statut « payé » ne doit être attribué automatiquement sur la seule base d'une déclaration ou d'une pièce jointe du client. Les paiements d'abonnement Zack restent un flux distinct, avec vérification côté serveur.


### 4.25 Organisation de la livraison et du retrait — décisions confirmées

- **Fixation des frais de livraison :** chaque vendeur fixe lui-même les frais de livraison applicables à ses commandes. Zack ne fixe pas un tarif unique à la place des entreprises.
- **Méthode de calcul :** le vendeur choisit la méthode qu'il souhaite appliquer pour déterminer ses frais. Il peut donc définir ses propres règles, par exemple un tarif fixe, des tarifs par zone ou un calcul selon la distance. Les options précises de configuration restent à concevoir.
- **Prise en charge des frais :** le vendeur décide des conditions de prise en charge des frais de livraison. Il peut notamment les faire payer au client, les prendre à sa charge ou proposer la livraison gratuite, selon les conditions qu'il définit. Ces conditions doivent être clairement présentées au client avant la validation de sa commande.
- **Livreurs autorisés :** les livraisons peuvent être effectuées par des livreurs employés par l'entreprise ou par des livreurs indépendants disposant d'un compte Zack. Les règles d'inscription, de vérification, d'attribution et d'autorisation des livreurs doivent être définies avant leur activation.
- **Choix entre livraison et retrait :** le vendeur configure les options disponibles pour chaque entreprise ou commande. Le client choisit parmi les options effectivement proposées ; il ne peut pas sélectionner un retrait que le vendeur n'a pas activé.
- **Livraison échouée :** en cas d'échec, le livreur, le client et le vendeur doivent pouvoir communiquer afin que le client et le vendeur décident ensemble de la suite à donner. Zack conserve le statut de l'incident et les informations utiles au suivi, sans annuler automatiquement la commande.

Les frais, options disponibles, affectations de livreurs et incidents doivent être visibles et compréhensibles avant la confirmation de la commande. Les changements de statut et les preuves de livraison doivent être enregistrés de manière fiable et accessibles uniquement aux personnes autorisées. Ces décisions complètent les règles déjà retenues sur le suivi simple des livraisons, l'attribution manuelle par défaut, la disponibilité et la capacité des livreurs, l'acceptation ou le refus d'une mission, la preuve de remise et la rémunération configurée.

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
4. Définir les règles détaillées de comptage des publications, le quota commun déjà retenu et les éventuels cas limites.
5. Définir les règles de comptage des éléments masqués, archivés, en attente de modération ou désactivés.
6. Définir les règles techniques des photos : poids, formats, compression, miniatures et stockage.
7. Définir les statistiques et outils de gestion de chaque niveau.
8. Définir les outils concrets de vente et de suivi des performances.
9. Fixer les prix mensuels et annuels après analyse des coûts et du marché haïtien.
10. Définir les règles de renouvellement, d'expiration, d'échec de paiement et de période de grâce.
11. Définir la permission administrative permettant d'accorder et de révoquer les offres gratuites.
12. Définir les règles détaillées de modération, notification, recours et conservation des commentaires.
13. Définir les règles de visibilité, restauration et quota des publications archivées.
14. Finaliser la liste des motifs de signalement et le traitement des signalements de publications.

## 9. Recommandation

Conserver trois niveaux clairement différenciés. Le niveau Gratuit doit rester utile ; Payant doit apporter une amélioration concrète ; Ultra doit proposer des outils et capacités nettement supérieurs, sur les trois axes : visibilité, gestion et développement des ventes.

## 10. État technique

Cette mise à jour est uniquement documentaire. Aucune table, migration SQL, policy RLS, fonction serveur, interface, configuration ou donnée Supabase n'a été créée ou modifiée. Les prix et les détails des avantages restent à valider. Les règles détaillées de comptage et d'affichage des publications sont documentées dans la section 4.6.
