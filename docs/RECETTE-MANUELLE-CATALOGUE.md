# Recette manuelle — catalogue professionnel Zack

Date de préparation : 14 novembre 2026

## But

Vérifier le parcours réel du catalogue (produits et services) dans un environnement de test isolé, avec plusieurs comptes et plusieurs entreprises. Cette recette complète les tests automatiques statiques ; elle ne doit pas être considérée comme exécutée tant que chaque résultat n'a pas été observé.

## Conditions de sécurité avant de commencer

- Utiliser uniquement un projet Supabase de test séparé de la production, avec des données fictives.
- Ne pas copier de clé service-role, de mot de passe ni de jeton dans GitHub, les captures d'écran ou les messages.
- Ne pas effectuer cette recette sur la base de production : la suppression d'un produit peut aussi supprimer en cascade ses lignes liées dans `product_images`.
- Créer deux entreprises de test distinctes (A et B) et les comptes listés ci-dessous.
- L'entreprise A doit avoir un catalogue fictif ; l'entreprise B doit servir à vérifier l'isolation.
- Laisser les paiements désactivés. Aucun achat ou commande n'est testé ici.

## Comptes de test requis

| Compte | Relation avec l'entreprise A | Résultat attendu |
|---|---|---|
| A-owner | owner | Consulter et gérer le catalogue |
| A-admin | admin | Consulter et gérer le catalogue |
| A-editor | editor | Consulter et gérer le catalogue |
| A-viewer | viewer ou autre rôle sans écriture | Consulter seulement |
| B-owner | owner de l'entreprise B, aucun rôle sur A | Aucun accès au catalogue privé A |
| Invité | Aucun compte connecté | Pas d'accès à la gestion |

Ne pas partager les identifiants ou mots de passe ici. Utiliser des comptes jetables de test.

## Scénarios à exécuter

### 1. Session et accès

- [ ] Ouvrir `/pro` en étant déconnecté : l'application demande une connexion.
- [ ] Se connecter avec A-owner : l'entreprise A apparaît.
- [ ] Se connecter avec A-viewer : le catalogue est consultable, les commandes de modification ne sont pas proposées.
- [ ] Se connecter avec B-owner : aucune donnée de catalogue de A ne doit apparaître.
- [ ] Se déconnecter, puis revenir sur `/pro` : la gestion n'est plus accessible.

### 2. Produits — compte A-owner

- [ ] Créer un produit avec nom, description, prix HTG et URL d'image HTTPS, disponible.
- [ ] Vérifier que le produit apparaît dans la liste du gestionnaire.
- [ ] Ouvrir la fiche publique de A : le produit disponible apparaît.
- [ ] Modifier le nom et le prix : les nouvelles valeurs sont visibles après actualisation.
- [ ] Désactiver le produit : il reste dans le gestionnaire comme indisponible mais disparaît de la fiche publique.
- [ ] Réactiver le produit : il réapparaît publiquement.
- [ ] Créer un produit sans prix : la fiche indique « Prix sur demande ».
- [ ] Supprimer le produit de test : il disparaît du gestionnaire et de la fiche publique.

### 3. Services — compte A-owner

- [ ] Créer un service avec nom, description, prix et durée.
- [ ] Vérifier qu'il apparaît sur la fiche publique.
- [ ] Modifier sa durée et son prix.
- [ ] Le rendre indisponible, puis vérifier qu'il disparaît de la fiche publique.
- [ ] Le supprimer et vérifier qu'il n'apparaît plus.

### 4. Rôles et isolation

Répéter une modification de test (sur un élément fictif) avec A-admin puis A-editor : elle doit réussir.

- [ ] Avec A-viewer, tenter d'appeler l'interface de modification : aucune action d'écriture ne doit être accessible.
- [ ] Avec B-owner, tenter de modifier un élément de A : le serveur doit refuser l'opération.
- [ ] Avec un identifiant d'élément inexistant ou appartenant à B, le serveur ne doit pas confirmer une modification de A.
- [ ] Vérifier qu'une URL d'image HTTP (non HTTPS) est rejetée.
- [ ] Vérifier qu'un prix négatif et un nom trop court sont rejetés.

### 5. Affichage et réseau

- [ ] Vérifier les fiches publiques sur téléphone et ordinateur.
- [ ] Vérifier l'affichage lorsqu'un catalogue est vide.
- [ ] Simuler une erreur réseau : un message d'indisponibilité apparaît, sans fausses données.
- [ ] Vérifier qu'aucune commande, aucun paiement et aucune demande de paiement n'est déclenché par le catalogue.

## Registre des résultats

Pour chaque scénario, noter : date, environnement (test uniquement), compte/role utilisé, résultat observé (réussi/échoué), capture sans donnée personnelle et anomalie éventuelle.

**Statut initial : NON EXÉCUTÉ.** Les 11 tests automatisés du dépôt et le build CI ne remplacent pas cette recette avec de vrais comptes.
