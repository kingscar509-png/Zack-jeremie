# Zack — contrat technique cible MonCash V2

**Date : 14 novembre 2026**  
**Statut : spécification de travail — non exécutée, non migrée, non déployée.**  
**Référence : schéma de production inspecté en lecture seule.**

Ce document transforme l'audit des RPC en contrat d'implémentation testable. Il ne constitue pas une autorisation d'écriture dans Supabase.

## 1. État observé du projet

Tables présentes : `subscription_plans`, `business_subscriptions`, `payments`, `payment_events`, `payment_recipients`. PostgreSQL 17.11.

Au moment de l'inspection :
- un seul plan actif : Gratuit, 0 HTG, 30 jours ;
- aucun abonnement, paiement ou événement de paiement ;
- aucun destinataire de paiement ;
- aucune branche de développement Supabase.

Le schéma accepte actuellement MonCash et NatCash. Le RPC de demande crée toujours une ligne `pending_payment`. Le RPC de revue charge la durée actuelle du catalogue et annule systématiquement la ligne d'abonnement liée en cas de refus.

## 2. Décisions fonctionnelles retenues pour le premier lancement

- Fournisseur : MonCash uniquement. NatCash reste désactivé.
- Devise : HTG uniquement.
- Pas de paiement de commande en ligne dans ce chantier.
- Pas de collecte de PIN, OTP, mot de passe ou secret marchand dans Zack.
- Une demande ouverte maximum par entreprise.
- Une référence MonCash ne peut jamais être réutilisée, même après refus.
- Un renouvellement du même forfait prolonge l'abonnement actif après approbation.
- Un changement de forfait prend effet immédiatement à l'approbation, sans prorata au lancement ; l'ancien forfait est alors remplacé.
- Un refus de renouvellement ne doit jamais interrompre ni modifier l'abonnement actif.
- Un refus de première souscription ou de changement de forfait annule uniquement la ligne `pending_payment` correspondante.
- La confirmation reste manuelle par `main_admin` tant qu'une vérification MonCash officielle automatisée n'est pas mise en place.

## 3. Snapshots immuables à ajouter à `payments`

La ligne de paiement doit conserver les conditions exactes de la demande, indépendamment des modifications ultérieures du catalogue ou du compte de réception.

Champs cibles :
- `plan_id_snapshot uuid`
- `plan_code_snapshot text`
- `plan_name_snapshot text`
- `plan_price_htg_snapshot numeric`
- `plan_duration_days_snapshot integer`
- `plan_max_products_snapshot integer null`
- `plan_max_images_per_item_snapshot integer`
- `plan_features_snapshot jsonb`
- `subscription_action_snapshot text` avec valeurs `initial`, `renewal`, `change`
- `recipient_id_snapshot uuid`
- `recipient_label_snapshot text`
- `recipient_account_snapshot text`

Les colonnes snapshot sont renseignées par le RPC, jamais par le navigateur. Un trigger doit empêcher leur modification après insertion, y compris par les RPC de revue. Le numéro du destinataire est une copie historique du compte utilisé ; il ne doit pas être exposé dans les historiques généraux ou les vues publiques.

Les paiements historiques déjà présents restent compatibles : les colonnes sont ajoutées nullable, puis les nouvelles insertions sont obligées de les renseigner par le RPC. Ne pas fabriquer de snapshots pour des paiements historiques sans preuve.

## 4. Contraintes et index cibles

1. `payments.provider = 'moncash'` et `payment_recipients.provider = 'moncash'` pour les nouveaux enregistrements ; retirer NatCash du contrat d'entrée.
2. Index unique partiel : un seul destinataire actif par fournisseur.
3. Index unique partiel : une seule demande par entreprise parmi les statuts ouverts `initiated`, `pending`, `needs_review`.
4. Référence normalisée non vide, 4–60 caractères ; unicité globale par fournisseur sur toutes les références non nulles, y compris les paiements refusés ou annulés.
5. Les snapshots ne peuvent être modifiés après insertion.
6. Le destinataire référencé par un paiement ne peut être supprimé tant qu'un snapshot le référence ; sa désactivation reste possible.
7. Les index et contraintes doivent être ajoutés après vérification des doublons existants. Le relevé actuel indique zéro paiement et zéro destinataire.

La protection d'unicité en base est obligatoire ; un verrou applicatif seul ne suffit pas.

## 5. Contrat de `request_subscription_payment`

Signature fonctionnelle à conserver si possible :
`request_subscription_payment(p_business uuid, p_plan uuid, p_provider text, p_reference text) returns uuid`.

Séquence :
1. Exiger `auth.uid()` et `is_business_manager(p_business)`.
2. Refuser tout fournisseur autre que `moncash`.
3. Verrouiller la ligne `businesses` correspondante avec `FOR UPDATE`.
4. Charger un plan actif payant et figer toutes ses conditions dans des variables locales.
5. Charger exactement un destinataire MonCash actif côté serveur ; refuser si aucun ou plus d'un.
6. Normaliser la référence (trim des espaces périphériques, sans transformer arbitrairement sa casse) et vérifier sa longueur.
7. Refuser si l'entreprise possède déjà un paiement dans un statut ouvert.
8. Lire l'abonnement actif de l'entreprise :
   - même `plan_id` que la demande : action `renewal`, rattacher le paiement à cette ligne active ;
   - plan différent : action `change`, créer une ligne `pending_payment` ;
   - aucun abonnement actif : action `initial`, créer une ligne `pending_payment`.
9. Insérer le paiement avec montant HTG, référence, snapshots plan et destinataire, action snapshot et créateur.
10. Insérer l'événement `submitted_for_review`.
11. Retourner l'UUID du paiement.

Les étapes doivent être atomiques dans la transaction de la fonction. Le navigateur ne transmet jamais le montant, la durée, les quotas, les fonctionnalités ou le numéro du destinataire comme valeurs faisant autorité.

## 6. Contrat de `admin_review_payment`

Signature existante : `admin_review_payment(p_payment uuid, p_approve boolean, p_note text)`.

Séquence :
1. Exiger `is_main_admin()`.
2. Verrouiller le paiement `FOR UPDATE`, vérifier le statut `needs_review`.
3. Verrouiller ensuite la ligne entreprise correspondante, dans cet ordre constant pour toutes les revues.
4. Vérifier cohérence du business, de l'abonnement référencé, du plan snapshot et du montant.
5. N'utiliser que les snapshots du paiement, jamais le catalogue modifiable.
6. Si refus :
   - action `renewal` : conserver absolument l'abonnement actif inchangé ;
   - actions `initial` ou `change` : annuler seulement la ligne `pending_payment` correspondante ;
   - paiement `failed`, événement `rejected`, note et audit.
7. Si approbation :
   - action `renewal` : exiger que la ligne référencée soit toujours active et corresponde au même plan ; prolonger `ends_at` depuis `greatest(ends_at, now())` de la durée snapshot ; ne pas expirer/recréer l'abonnement ;
   - actions `initial` ou `change` : exiger une ligne `pending_payment`, expirer l'ancien abonnement actif s'il existe, activer la ligne en attente avec début `now()` et fin calculée depuis la durée snapshot ;
   - paiement `succeeded`, événement `approved`, note et audit.
8. Refuser tout rejeu d'une décision finale.

Le verrou de l'entreprise sérialise les approbations de paiements distincts concernant la même entreprise. L'index unique `business_subscriptions_one_active` reste une dernière protection.

### Notifications

L'échec de `_order_notify` ne doit pas transformer une approbation financière déjà validée en réponse ambiguë. Le futur RPC doit isoler la notification dans un bloc d'exception et enregistrer un événement `notification_failed` sans données sensibles, ou adopter un outbox transactionnel. Le paiement, l'abonnement, l'événement financier et l'audit doivent rester cohérents.

## 7. Contrat de `get_payment_recipients`

La fonction actuelle renvoie les destinataires actifs à tout utilisateur authentifié. La prochaine version doit limiter la lecture aux gestionnaires de l'entreprise concernée, par exemple en recevant `p_business uuid` et en vérifiant `is_business_manager(p_business)`.

Le RPC de demande reste l'autorité : il choisit lui-même le destinataire actif et copie ses informations dans le snapshot. L'interface ne doit pas envoyer de numéro de compte au RPC de création de paiement.

## 8. Matrice de tests obligatoires

| ID | Cas | Résultat attendu |
|---|---|---|
| MON-01 | Visiteur non connecté | Refus 42501, aucune ligne créée |
| MON-02 | Utilisateur non membre | Refus 42501 |
| MON-03 | Membre sans rôle gestionnaire | Refus 42501 |
| MON-04 | Fournisseur NatCash | Refus |
| MON-05 | Plan gratuit ou inactif | Refus |
| MON-06 | Aucun destinataire MonCash actif | Refus |
| MON-07 | Deux destinataires actifs | Refus + contrainte unique empêche l'état |
| MON-08 | Référence trop courte/longue | Refus |
| MON-09 | Référence déjà utilisée, même sur paiement refusé | Refus |
| MON-10 | Deux demandes simultanées pour une entreprise | Une seule demande créée |
| MON-11 | Demande même forfait avec abonnement actif | Paiement lié à la ligne active, action renewal |
| MON-12 | Refus du renouvellement | Abonnement actif et dates inchangés |
| MON-13 | Approbation du renouvellement | Date de fin prolongée par durée snapshot |
| MON-14 | Refus d'une première souscription | Ligne pending annulée, aucun abonnement actif créé |
| MON-15 | Refus d'un changement de forfait | Ancien abonnement actif conservé |
| MON-16 | Approbation d'un changement | Ancien actif expiré, nouveau forfait activé |
| MON-17 | Modification du prix/durée/features après demande | Paiement traité avec les snapshots initiaux |
| MON-18 | Suppression du destinataire utilisé | Refusée par FK/contrainte |
| MON-19 | Deux revues concurrentes pour une entreprise | Une seule décision effective, un seul abonnement actif |
| MON-20 | Rejeu d'une revue finale | Refus |
| MON-21 | Échec de notification | État financier conservé et échec notification journalisé |
| MON-22 | Tentative de modification d'un snapshot | Refusée |
| MON-23 | Lecture des destinataires par non-gestionnaire | Refus |
| MON-24 | Vérification RLS après changement de rôle/révocation | Accès retiré immédiatement selon les policies |

## 9. État d'implémentation

- [x] Schéma et fonctions existants inspectés en lecture seule.
- [x] Règles métier et snapshots proposés.
- [x] Cas critique « refus de renouvellement » explicitement couvert.
- [x] Interface de consultation en lecture seule ajoutée dans la branche de travail.
- [ ] Migration SQL écrite dans le dossier migrations officiel.
- [ ] RPC corrigés.
- [ ] Tests automatisés exécutés sur une base de développement.
- [ ] Types Supabase régénérés après migration.
- [ ] Formulaires de demande et revue admin implémentés.
- [ ] Tests réels avec comptes dédiés.
- [ ] Validation explicite avant toute migration de production.

## 10. Garde-fous

- Ne pas créer de branche Supabase hébergée sans vérifier le coût et obtenir l'accord nécessaire.
- Ne pas utiliser la base de production comme environnement de test, même avec une transaction annulée.
- Ne pas appliquer ce contrat directement en production.
- Ne pas fusionner la PR #2 automatiquement.
- Aucun montant Pro/Ultra, compte MonCash, référence ou identifiant de paiement ne doit être inventé.
