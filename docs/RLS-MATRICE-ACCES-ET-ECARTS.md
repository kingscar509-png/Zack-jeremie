# Zack — Matrice RLS et écarts d'autorisation observés

**Dernière mise à jour :** 14 novembre 2026  
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
| Produits | Public lit les produits publiés des entreprises vérifiées ; owner/admin/editor peuvent créer, modifier et supprimer selon les policies | Tester l'appartenance, les rôles, les champs modifiables et la publication directe |
| Services | Public lit les services publiés des entreprises vérifiées ; owner/admin/editor peuvent gérer selon les policies | Tester l'appartenance, les rôles et les permissions de contenu |
| Publications | Owner/admin/editor autorisés peuvent insérer, modifier, supprimer et publier directement ; public lit si `is_published = true` et entreprise vérifiée | Publication directe voulue ; tester l'isolation, les rôles et la protection du statut de vérification, sans approbation préalable |
| Promotions | Owner/admin/editor autorisés peuvent gérer et activer directement ; public lit les promotions actives et non archivées | Publication directe voulue ; tester les rôles et l'isolation interentreprises |
| Événements | Owner/admin/editor autorisés peuvent insérer, modifier, supprimer et publier directement ; public lit les événements publiés des entreprises vérifiées | Publication directe voulue ; tester les rôles et l'isolation interentreprises |
| Horaires | Owner/admin/editor peuvent gérer ; public lit les horaires des entreprises vérifiées | Vérifier si l'éditeur doit pouvoir changer les horaires |
| Médias d'entreprise | Owner/admin/editor peuvent gérer les lignes de média ; public lit les médias d'entreprises vérifiées | Bucket public : contrôler le propriétaire du fichier, les types et tailles ; signalements/retraits réactifs, sans quarantaine obligatoire |
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

## 3. Publication directe : comportement conforme à la décision produit

Décision confirmée le 14 novembre 2026 : les entreprises publient directement leurs publications, promotions et événements. Aucun contrôle préalable, approbation centrale Zack, file d'attente, trigger bloquant ou validation administrative avant publication ne doit être ajouté.

La lecture des policies et triggers confirme que les membres autorisés peuvent écrire les contenus et activer leur publication. Les lectures publiques restent conditionnées par les indicateurs de publication et le statut de vérification de l'entreprise. Ce comportement est voulu ; ce n'est pas un défaut de sécurité.

La sécurité doit se concentrer sur :
1. l'appartenance au même `business_id` ;
2. les rôles autorisés sur chaque table ;
3. la vérification du `business_id` final dans les clauses UPDATE `WITH CHECK` ;
4. l'impossibilité pour un manager ordinaire de modifier le statut de vérification de l'entreprise ;
5. l'isolation entre entreprises et l'effet immédiat de la révocation d'un membership.

Les tests à réaliser avec des comptes réels doivent couvrir owner/admin/editor, les changements de `business_id`, la révocation, et la publication directe. Ils ne doivent pas chercher à interdire la publication normale d'un membre autorisé.

Les signalements et retraits après examen sont des mécanismes réactifs de lutte contre les abus. Ils ne constituent pas une approbation avant publication.

## 4. Fonction statistiques : accès équipe à préciser

La fonction `public.business_stats(p_business_id, p_days)` est `SECURITY DEFINER`. Elle autorise un membre quelconque de l'entreprise ou un administrateur Zack ayant la permission `businesses` à lire les agrégats. La policy de lecture de `business_stats_events` suit aussi l'appartenance générale.

Le modèle de permissions déjà confirmé ne décrit pas encore un droit spécifique aux statistiques. Décider si :
- tous les membres peuvent voir les statistiques ;
- seuls owner/admin le peuvent ;
- une permission distincte `stats_read` est nécessaire.

Ne pas changer la fonction avant cette décision.

## 5. Stockage et médias

Le bucket `zack-public-media` est public. Les policies de stockage contrôlent les uploads, modifications et suppressions selon le dossier de l'entreprise, mais les téléchargements sont accessibles à toute personne disposant de l'URL.

Les politiques accordent actuellement l'upload et la gestion à owner/admin/editor. La publication directe ne doit pas être bloquée par une étape d'approbation des médias.

Prévoir :
- validation du type réel, de la taille et du chemin du fichier ;
- vérification côté serveur de l'appartenance au dossier de l'entreprise ;
- alignement des types autorisés sur la décision « photos uniquement » ;
- signalement et retrait réactif des médias abusifs ;
- audit des actions de retrait/restauration.

Ne pas créer de dépôt privé obligatoire ni de publication après approbation pour les médias ordinaires. Un futur brouillon privé, s'il est décidé, devra rester optionnel et ne pas bloquer le parcours de publication directe.

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
2. Tester la publication directe des contenus avec chaque rôle autorisé et vérifier l'isolation interentreprises.
3. Sécuriser les URLs externes du frontend historique.
4. Aligner les types de médias sur photos uniquement et tester les permissions Storage, les signalements et retraits réactifs.
5. Définir l'anti-spam pour signalements, avis, événements et formulaires invités.
6. Finaliser la matrice permissions entreprise et permissions admin Zack.
7. Revoir les 44 avertissements de policies permissives, sans suppression massive automatique.
8. Tester les politiques avec chaque acteur de la matrice avant toute ouverture publique.

## 8. État

Cette matrice est un constat de préparation. Aucune policy, fonction, table, bucket ou donnée n'a été modifié pendant l'audit.


## 9. Décision produit actualisée — 14 novembre 2026

La publication directe par les membres autorisés est la règle pour les posts, promotions et événements. Les anciennes recommandations d'approbation centrale et de quarantaine obligatoire sont obsolètes. Aucune migration de modération préalable ne doit être préparée.
