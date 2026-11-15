# Paiements et abonnements Zack

Dernière mise à jour : 15 novembre 2026

## Décision produit

- Les commandes ne sont pas encaissées par Zack. Le client et le vendeur conviennent du paiement directement entre eux, hors plateforme.
- Les abonnements des entreprises sont payés directement au propriétaire de Zack, au choix par MonCash ou NatCash.
- Le paiement d'un abonnement est vérifié manuellement par l'administrateur principal. Une référence saisie par l'entreprise ne constitue jamais une preuve automatique de réception.
- Aucun PIN, OTP ou mot de passe mobile money ne doit être demandé ni stocké par Zack.

## Parcours prévu

1. L'entreprise sélectionne un forfait payant.
2. Zack affiche le numéro actif du fournisseur choisi (MonCash ou NatCash), le bénéficiaire et le montant en HTG.
3. L'entreprise effectue le transfert depuis son propre service mobile money.
4. Elle soumet la référence de transaction dans Zack.
5. L'administrateur vérifie le mouvement sur son compte MonCash/NatCash.
6. L'administrateur approuve ou refuse la demande.
7. En cas d'approbation, Zack active ou programme le forfait et calcule la fin selon un mois calendaire.

## Tarification et limites officielles

La matrice complète est documentée dans [abonnements-visibilite.md](./abonnements-visibilite.md).

| Limite / avantage | Gratuit | Pro | Ultra |
|---|---:|---:|---:|
| Prix mensuel | 0 HTG | 500 HTG | 750 HTG |
| Durée | — | 1 mois calendaire | 1 mois calendaire |
| Images par produit | 2 | 6 | 12 |
| Établissements | 2 | 5 | 20 |
| Produits | 5 | 15 | 30 |
| Services | 5 | 10 | 20 |
| Publications / mois | 3 | 12 | 20 |
| Comptes de gestion | 1 | 3 | 10 |

Les forfaits Pro et Ultra sont enregistrés dans Supabase mais restent inactifs jusqu'à ce que tous les contrôles et écrans nécessaires soient prêts.

## Backend Supabase

Tables principales :
- `payment_recipients` : numéros de réception configurés par fournisseur.
- `subscription_plans` : forfaits, prix et limites.
- `business_subscriptions` : souscriptions, périodes et instantané des avantages/prix (`plan_snapshot`).
- `payments` et `payment_events` : demandes de paiement et journal d'événements.

RPC principales :
- `get_payment_recipients()` : expose uniquement les numéros actifs aux utilisateurs connectés.
- `request_subscription_payment(...)` : crée une demande de paiement et fige les conditions du forfait dans `plan_snapshot`.
- `admin_review_payment(...)` : réservé à l'administrateur principal pour confirmer ou refuser une demande.

Les fournisseurs acceptés sont `moncash` et `natcash`. Les migrations de durcissement et de préparation des forfaits comprennent :
- `20261115135049_manual_subscription_payments_hardening`
- `20261115141529_subscription_plan_matrix_core_limits_and_calendar_renewal`
- `20261115141554_subscription_quota_trigger_functions_privileges`
- `20261115141622_verified_reviews_require_completed_order`
- `20261115141643_subscription_rating_view_and_plan_rpc_security`
- `20261115141742_subscription_same_plan_renewals_queue`

### Renouvellement

- Le renouvellement du même forfait est enregistré comme `queued` et commence à la fin de la période déjà payée.
- Le renouvellement ajoute un mois calendaire complet.
- Le forfait actuellement payé reste actif jusqu'à son échéance.
- Un changement vers un forfait différent, après validation du paiement, remplace le forfait précédent à la date d'approbation.
- Une demande refusée n'interrompt pas le forfait actif.

## Configuration et intégration encore nécessaires

- Ajouter le numéro de réception MonCash et son libellé.
- Ajouter le numéro de réception NatCash et son libellé.
- Terminer les contrôles des publications mensuelles et des établissements.
- Connecter l'interface entreprise et l'interface administrateur aux RPC Supabase.
- Tester le parcours avec les véritables rôles utilisateurs avant toute activation publique.

## État du frontend GitHub

Le dépôt contient actuellement les fichiers HTML `index.html` et `index1.html`. Le parcours d'abonnement présent dans `index1.html` est encore un aperçu local : il n'appelle pas Supabase et ne doit pas être présenté comme un paiement opérationnel tant que la connexion Auth/RPC n'a pas été intégrée et testée.
