# Zack — Matrice RLS et écarts d'autorisation observés

**Relevé :** 13 novembre 2026  
**Projet :** `hwuwqalazmrmdxseawnm`  
**Méthode :** lecture de `pg_policies`, des fonctions et des déclencheurs ; aucune modification effectuée.  
**Statut :** audit préparatoire — les recommandations ne sont pas des migrations.

## 1. Principes de lecture

- RLS activée sur une table ne signifie pas que ses règles correspondent déjà au produit final.
- Les policies permissives d'une même action se combinent généralement par OR : une policy supplémentaire peut élargir l'accès.
- Les rôles `owner`, `admin` et `editor` sont des rôles d'équipe d'entreprise ; ils ne sont pas équivalents aux rôles PostgreSQL `anon` et `authenticated`.
- L'interface ne constitue jamais la barrière de sécurité : la base et les fonctions serveur doivent imposer les règles.

## 2. Matrice synthétique des politiques actuelles

| Domaine | Accès actuellement observé | Écart ou contrôle à prévoir |
|---|---|---|
| Entreprises | Public lit les entreprises vérifiées ; membres lisent leurs entreprises ; managers owner/admin peuvent modifier | Conserver la séparation entre lecture d'équipe et gestion ; ajouter les identifiants géographiques nationaux |
| Produits | Public lit les produits des entreprises vérifiées ; owner/admin/editor peuvent créer, modifier et supprimer | Définir le niveau de modération et les champs qu'un éditeur peut modifier |
| Services | Public lit les services des entreprises vérifiées ; owner/admin/editor peuvent gérer | Définir le niveau de modération et les permissions de contenu |
| Publications | Owner/admin/editor peuvent insérer, modifier et supprimer ; public lit si `is_published = true` et entreprise vérifiée | Écart majeur : un membre peut potentiellement publier directement en écrivant le champ de publication ; imposer une approbation serveur |
| Promotions | Owner/admin/editor peuvent gérer ; public lit les promotions actives et non archivées | Empêcher l'activation publique avant approbation centrale si la modération l'exige |
| Événements | Owner/admin/editor peuvent insérer, modifier et supprimer ; public lit les événements publiés des entreprises vérifiées | Même contrôle sur `is_published` ; aligner avec la modération centralisée |
| Horaires | Owner/admin/editor peuvent gérer ; public lit les horaires des entreprises vérifiées | Vérifier si l'éditeur doit pouvoir changer les horaires |
| Médias d'entreprise | Owner/admin/editor peuvent gérer les lignes de média ; public lit les médias d'entreprises vérifiées | Le bucket public rend les fichiers accessibles par URL ; prévoir quarantaine des brouillons |
| Images produit | Owner/admin/editor peuvent gérer les images ; public lit les images des entreprises vérifiées | Vérifier la publication de l'image en cohérence avec l'état du produit |
| Avis | Utilisateur connecté soumet et modifie son avis en attente ; public lit les avis approuvés ; owner/admin répondent | Ajouter anti-spam, règles de fréquence et tests de propriété |
| Signalements | Visiteur anonyme ou connecté peut signaler une entreprise vérifiée ; l'état initial est contraint | Ajouter limitation serveur et anti-robot |
| Interactions | Utilisateur connecté peut enregistrer ses propres interactions autorisées et les lire | Harmoniser les métriques avec `business_stats_events` |
| Événements de statistiques | Visiteur anonyme ou connecté peut insérer un événement pour une entreprise vérifiée ; membres/admins lisent les statistiques | Ajouter anti-spam, validation stricte des types, contrôle des champs et politique de rétention |
| Favoris | Utilisateur connecté gère et lit ses propres favoris | Pas d'écart majeur observé dans la policy ; tester les cas d'entreprise supprimée/suspendue |
| Notifications | Utilisateur lit et marque comme lues ses propres notifications | L'envoi doit rester serveur ; tester les clés anti-doublon |
| Push subscriptions | Utilisateur gère ses propres abonnements push | Valider endpoint, rotation, suppression et limitation |
| Membres d'entreprise | Utilisateur lit ses appartenances ; admins Zack avec permission peuvent lire les membres | Les permissions granulaires messages/commandes restent à construire |
| Rôles admin Zack | Un admin lit son rôle ; main admin gère les rôles d'admin | Vérifier les procédures de récupération et les changements de permissions |

## 3. Écart principal : modération centralisée non imposée uniformément

Les policies actuelles des tables `posts`, `promotions` et `business_events` permettent aux membres owner/admin/editor d'insérer et modifier leurs contenus. Les politiques de lecture publique vérifient les indicateurs de publication/activation, mais les policies d'écriture ne suffisent pas à démontrer qu'un membre ne peut pas lui-même activer ces indicateurs.

Le produit exige une modération centralisée. La future conception doit donc :
1. séparer l'état de soumission de l'état de publication ;
2. faire de l'approbation une action réservée à un administrateur Zack autorisé ;
3. empêcher l'auteur de modifier les champs de validation ;
4. contrôler aussi les fonctions serveur et les transitions, pas seulement l'interface ;
5. créer des tests RLS pour les rôles owner, admin et editor.

Les produits et services doivent faire l'objet d'une décision fonctionnelle explicite : validation centrale avant publication ou publication directe sous responsabilité de l'entreprise avec modération réactive. Ne pas inventer cette règle.

## 4. Fonction statistiques : accès équipe à préciser

La fonction `public.business_stats(p_business_id, p_days)` est `SECURITY DEFINER`. Elle autorise un membre quelconque de l'entreprise ou un administrateur Zack ayant la permission `businesses` à lire les agrégats. La policy de lecture de `business_stats_events` suit aussi l'appartenance générale.

Le modèle de permissions déjà confirmé ne décrit pas encore un droit spécifique aux statistiques. Décider si :
- tous les membres peuvent voir les statistiques ;
- seuls owner/admin le peuvent ;
- une permission distincte `stats_read` est nécessaire.

Ne pas changer la fonction avant cette décision.

## 5. Stockage et médias

Le bucket `zack-public-media` est public. Les policies de stockage contrôlent les uploads, modifications et suppressions selon le dossier de l'entreprise, mais un bucket public rend les téléchargements accessibles à toute personne possédant l'URL.

Les politiques de stockage accordent actuellement l'upload et la gestion à owner/admin/editor. Cela ne constitue pas une validation éditoriale.

Préparer :
- un dépôt privé des médias en attente ;
- une validation de type MIME et de taille côté serveur ;
- une publication vers l'emplacement public après approbation ;
- une stratégie d'accès aux médias déjà publiés ;
- l'alignement sur la décision « photos uniquement ».

## 6. Rôles de test à utiliser

| Acteur | Accès attendu à tester |
|---|---|
| Visiteur anonyme | Annuaire public, fiches vérifiées, contenus publiés ; pas de données privées |
| Client connecté | Profil, favoris, notifications, commandes personnelles, conversations participantes |
| Owner entreprise | Gestion complète de son entreprise et de son équipe |
| Admin entreprise | Gestion selon les règles owner/admin |
| Editor | Gestion des contenus explicitement autorisés ; pas d'accès automatique aux messages/commandes |
| Editor avec permission | Accès limité aux conversations/commandes de son entreprise selon la permission |
| Admin Zack avec permissions limitées | Seulement les domaines autorisés |
| Admin principal | Gestion globale selon le rôle |
| Livreur | Seulement les missions qui lui sont attribuées |

## 7. Ordre recommandé des corrections

1. Révoquer l'appel direct de `log_admin_content_action()` aux rôles non nécessaires, après validation du SQL candidat et tests des déclencheurs.
2. Corriger le contournement possible de la modération centralisée.
3. Sécuriser les URLs externes du frontend historique.
4. Définir le traitement privé/public des médias et aligner les types sur photos uniquement.
5. Définir l'anti-spam pour signalements, avis, événements et formulaires invités.
6. Finaliser la matrice permissions entreprise et permissions admin Zack.
7. Revoir les 44 avertissements de policies permissives, sans suppression massive automatique.
8. Tester les politiques avec chaque acteur de la matrice avant toute ouverture publique.

## 8. État

Cette matrice est un constat de préparation. Aucune policy, fonction, table, bucket ou donnée n'a été modifié pendant l'audit.
