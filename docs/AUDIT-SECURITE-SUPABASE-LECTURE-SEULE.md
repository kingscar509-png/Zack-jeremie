

## 8. Actualisation de l'audit — 15 novembre 2026

Nouvelle vérification en lecture seule du projet Supabase `hwuwqalazmrmdxseawnm` :

- Le projet est actif sur PostgreSQL 17.11.
- L'inventaire actuel comporte 38 tables publiques, toutes avec RLS activée. Les 24 tables indiquées dans l'audit du 12 novembre correspondent à l'état antérieur et ne sont plus le décompte actuel.
- L'historique Supabase contient 28 migrations (versions de `20261110125637` à `20261114124326`).
- Aucune Edge Function n'est déployée.
- La vue `business_rating_summary` expose un résultat agrégé des avis approuvés des entreprises vérifiées ; sa configuration `security_invoker` doit rester vérifiée avant toute évolution.
- La table `couriers` possède une seule policy `ALL` pour les utilisateurs authentifiés, basée sur `has_business_permission(business_id, 'orders')`. Ce contrôle ne suffit pas à prouver qu'un livreur indépendant peut consulter uniquement ses missions.
- La fonction `request_subscription_payment` accepte encore MonCash et NatCash. La fonction `admin_review_payment` ne met pas en œuvre les snapshots immuables et les règles de renouvellement prévues dans le contrat MonCash V2.
- `get_payment_recipients()` renvoie le numéro du destinataire à tout utilisateur authentifié.

### Advisors actuels

- Security : 1 fonction `SECURITY DEFINER` accessible à `anon` (`business_counts`), 23 fonctions accessibles à `authenticated`, et protection contre les mots de passe compromis désactivée.
- Performance : 12 clés étrangères sans index couvrant, 47 cas de policies permissives multiples et 28 index non utilisés au moment de l'observation.
- Les policies multiples ne sont pas automatiquement une vulnérabilité ; leurs expressions doivent être évaluées ensemble. Les index non utilisés ne doivent pas être supprimés sans mesures réelles de charge.

### Conséquence

Ces résultats remplacent les chiffres antérieurs de cet audit pour l'état actuel du projet. Ils ne justifient aucune correction automatique en production. Toute modification SQL doit être préparée dans un environnement isolé, testée, proposée sous forme de migration versionnée et approuvée avant application.

Aucune table, policy, fonction, donnée, clé, configuration Auth ou migration n'a été modifiée pendant cette actualisation.
