# Zack — Audit ciblé messagerie, commandes et permissions

**Date :** 12 novembre 2026  
**Branche :** `preparation/phase-1-frontend-plan`  
**Statut :** constat documentaire — lecture seule — aucune modification Supabase.

## 1. Ce que montre le prototype HTML

Le fichier `google-studio-proposal.html.html` est une démonstration locale : les conversations, messages, commandes et panier sont conservés dans `STATE` côté navigateur.

### Messagerie
- Le bouton « Message » d'une fiche entreprise appelle `startChatWith(bizId, prefill)`.
- `startChatWith` exige actuellement `STATE.user`; sans connexion, il ouvre la fenêtre d'authentification.
- Les échanges sont simulés localement ; `sendChatMessage` ajoute le message au tableau local et fabrique une réponse simulée.
- Les conversations de démonstration sont associées à un `bizId`, avec messages, horodatage et compteur non lus.
- Le prototype contient aussi des boutons « Contacter l'entreprise », « Demander un devis » et « Contacter le vendeur » qui réutilisent `startChatWith`.

**Conséquence :** la décision validée d'autoriser un premier contact sans compte doit être réalisée avec un formulaire public distinct (nom, téléphone, e-mail facultatif, message), envoyé à une Edge Function. Elle ne doit pas rendre les conversations privées accessibles aux visiteurs anonymes. Après inscription/connexion et vérification du téléphone ou de l'adresse de contact, la demande pourra être rattachée à un compte et transformée en conversation privée.

### Commandes et panier
- `STATE.cart` contient des produits et quantités en mémoire locale.
- `openCartModal` calcule un total depuis les prix affichés dans le navigateur.
- Le formulaire actuel demande nom, téléphone, mode de réception et adresse complète.
- Le mode est libellé « Livraison à domicile » ou « Retrait en boutique ».
- L'adresse est actuellement obligatoire même si le client choisit le retrait.
- `placeOrder` construit une commande locale, choisit l'entreprise du premier produit (`firstProd.bizId`) et place tous les articles du panier dans cette commande.
- Le paiement est explicitement hors ligne au lancement.

**Point fonctionnel important :** le panier peut actuellement contenir des articles de plusieurs entreprises. Pourtant, la proposition SQL associe chaque commande à une seule entreprise. Le code actuel attribuerait alors tous les articles à l'entreprise du premier produit : ce comportement ne doit pas être reproduit en production.

## 2. Vérification des politiques RLS existantes

Lecture de `pg_policies` sur les tables pertinentes :

- `businesses` : les entreprises vérifiées sont visibles publiquement ; les membres voient leurs entreprises ; les gestionnaires peuvent mettre à jour leur entreprise ; les administrateurs ont des droits de gestion distincts.
- `business_members` : un utilisateur connecté peut lire ses propres appartenances ; les administrateurs ayant la permission appropriée peuvent lire les membres.
- `products` : les produits des entreprises vérifiées sont visibles publiquement ; les membres peuvent voir les produits de leur entreprise ; les rôles owner/admin/editor peuvent insérer, modifier et supprimer les produits.
- `profiles` : lecture et modification du profil personnel ; lecture admin distincte.
- `notifications` : chaque utilisateur lit ses notifications et peut marquer les siennes comme lues.

La fonction existante `public.is_business_manager(uuid)` est `SECURITY DEFINER`, avec `search_path = ''`, et retourne vrai uniquement pour les membres dont le rôle est `owner` ou `admin`. Elle ne considère pas `editor` comme gestionnaire.

**Conséquence :** il ne faut pas supposer que « membre de l'entreprise », « gestionnaire » et « éditeur » sont synonymes. Les permissions de messagerie et de commande doivent définir explicitement quels rôles peuvent lire et répondre. Le brouillon SQL utilise `is_business_manager` pour la lecture des commandes et des abonnements : cela donne accès aux owner/admin, pas aux editor.

## 3. Proposition de règles fonctionnelles à confirmer

### Messagerie
- Un visiteur non connecté peut soumettre une demande initiale de contact à une entreprise.
- Cette demande est isolée de la messagerie privée et reçue via Edge Function ; aucune lecture publique de `guest_contact_requests`.
- Seuls les comptes explicitement ajoutés comme participants peuvent lire une conversation et ses messages.
- La création d'une conversation et l'ajout de participants sont effectués par une opération serveur contrôlée.
- L'envoi d'un message exige que `sender_id = auth.uid()` et que l'utilisateur soit déjà participant.
- Les réponses automatiques de démonstration doivent disparaître ; aucun faux message ne doit être généré.

### Commandes
- Compte Zack obligatoire : `orders.customer_id` doit être `NOT NULL`.
- Un panier multi-entreprises doit être traité sans mélanger les vendeurs.
- La commande est créée côté serveur ; les prix, devises, disponibilité et entreprise de chaque produit sont relus depuis la base.
- L'adresse de livraison est obligatoire uniquement pour une livraison ; elle ne doit pas être exigée pour un retrait.
- Les statuts et transitions de commande sont gérés par des opérations autorisées côté serveur ou des policies strictes.
- Aucun paiement en ligne des commandes au lancement.

## 4. Décision produit encore nécessaire

**Panier avec plusieurs entreprises :** choisir le comportement à implémenter avant de finaliser le modèle de commande.

Option recommandée : **un seul panier actif par entreprise**. Si le client ajoute un produit d'une autre entreprise, Zack lui demande de terminer ou vider le panier actuel avant de changer de vendeur. Chaque commande correspond ainsi à une seule entreprise, ce qui simplifie le suivi, les frais de livraison, les statuts et les notifications.

Autre possibilité : diviser automatiquement le panier en plusieurs commandes, une par entreprise. Cette solution est plus complexe et nécessite un récapitulatif séparé pour chaque commande.

## 5. État de sécurité et périmètre

- Audit effectué en lecture seule.
- Aucun SQL appliqué.
- Aucune policy modifiée.
- Aucune table créée ou supprimée.
- Aucune donnée modifiée.
- Le prototype HTML demeure une maquette locale, pas une messagerie ou un système de commande opérationnel.


## 6. Décisions confirmées le 12 novembre 2026

- Panier multi-vendeurs : **option B retenue**. Un achat global regroupe une commande indépendante par entreprise vendeuse.
- Messagerie : **permissions configurables**. Owner/Admin contrôlent les droits ; un Editor n'a aucun accès automatique et doit recevoir les capacités nécessaires.
- Commandes : **permissions configurables**. Owner/Admin contrôlent les droits ; un Editor n'a aucun accès automatique et doit recevoir les capacités nécessaires.
- Compte Zack obligatoire pour passer commande.
- Les commandes restent sans paiement en ligne au lancement.

Le modèle détaillé est décrit dans `docs/MODELE-DONNEES-MULTI-VENDEURS-PERMISSIONS.md`.

**Attention :** le SQL présenté à la section 3 du document initial `SQL-PROPOSITION-MODULES-MANQUANTS-REVUE.md` est désormais obsolète pour les commandes multi-vendeurs et les permissions d'équipe. Il ne doit pas être appliqué. Il doit être remplacé par une proposition SQL versionnée après validation des règles encore ouvertes.

Aucun SQL n'a été exécuté et aucune migration Supabase n'a été appliquée.
