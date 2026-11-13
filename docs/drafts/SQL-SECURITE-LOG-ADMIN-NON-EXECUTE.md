# SQL candidat — sécurisation de log_admin_content_action

**Statut : BROUILLON — NON EXÉCUTÉ — NE PAS COPIER DANS LE SQL EDITOR DE PRODUCTION SANS VALIDATION.**

Projet concerné : `hwuwqalazmrmdxseawnm`  
Fonction observée : `public.log_admin_content_action()`  
Type : trigger function, `SECURITY DEFINER`, `search_path = ''`  
Constat : son ACL actuelle accorde `EXECUTE` à `PUBLIC`, `anon`, `authenticated`, `postgres` et `service_role`. Les advisors Supabase signalent l'exposition à `anon` et `authenticated`.

## 1. Objectif

Empêcher les rôles `anon` et `authenticated` d'appeler directement la fonction par RPC, sans supprimer ni recréer les déclencheurs d'audit déjà attachés aux tables.

Ne pas révoquer les privilèges des autres fonctions `SECURITY DEFINER` en bloc. Plusieurs sont des fonctions métier appelées par RLS et vérifient elles-mêmes l'identité ou les permissions.

## 2. SQL candidat

```sql
begin;

revoke execute
on function public.log_admin_content_action()
from public;

revoke execute
on function public.log_admin_content_action()
from anon, authenticated;

commit;
```

Ce script ne modifie ni le corps de la fonction ni les déclencheurs. Il n'est pas appliqué.

## 3. Contrôles avant toute exécution

- Confirmer que la fonction existe toujours avec exactement cette signature sans argument.
- Confirmer la liste des déclencheurs qui la référencent.
- Confirmer que les déclencheurs n'ont pas été remplacés depuis le dernier audit.
- Vérifier qu'aucune fonctionnalité ne dépend d'un appel RPC direct de cette fonction.
- Exécuter d'abord sur un projet de développement ou une branche Supabase isolée.

PostgreSQL précise que le privilège EXECUTE est nécessaire pour créer un déclencheur qui référence la fonction. Le présent script ne recrée pas les déclencheurs existants ; il faut néanmoins tester leur fonctionnement après révocation.

## 4. Vérification après application en environnement de test

### 4.1 Vérifier les privilèges directs

```sql
select
  has_function_privilege('anon', 'public.log_admin_content_action()', 'EXECUTE')
    as anon_can_execute,
  has_function_privilege('authenticated', 'public.log_admin_content_action()', 'EXECUTE')
    as authenticated_can_execute,
  has_function_privilege('service_role', 'public.log_admin_content_action()', 'EXECUTE')
    as service_role_can_execute;
```

Résultat attendu :
- `anon_can_execute = false`
- `authenticated_can_execute = false`

Le résultat attendu pour `service_role` dépend de la politique finale de privilèges. Si aucun appel direct n'est nécessaire, le droit peut également être retiré après analyse.

### 4.2 Vérifier que les déclencheurs sont toujours attachés

```sql
select
  event_object_table,
  trigger_name,
  action_statement
from information_schema.triggers
where trigger_schema = 'public'
  and action_statement ilike '%log_admin_content_action%'
order by event_object_table, trigger_name;
```

Comparer la liste avec l'état avant correction.

### 4.3 Tests fonctionnels requis

1. Un appel RPC direct en tant que rôle `anon` doit échouer avec une erreur de permission.
2. Un appel RPC direct en tant que rôle `authenticated` doit échouer avec une erreur de permission.
3. Une action d'administration autorisée qui déclenche un audit doit toujours produire son entrée de journal.
4. Une action d'un utilisateur non administrateur ne doit pas pouvoir falsifier une entrée d'audit.
5. Les advisors Supabase doivent être relancés ; l'alerte `anon_security_definer_function_executable` pour cette fonction doit disparaître.

Ne pas effectuer les tests destructifs sur les données de production.

## 5. Références

- Supabase Database Functions : https://supabase.com/docs/guides/database/functions
- Supabase — révocation de l'exécution d'une fonction : https://supabase.com/kb/troubleshooting/how-can-i-revoke-execution-of-a-postgresql-function-2GYb0A
- PostgreSQL CREATE TRIGGER : https://www.postgresql.org/docs/current/sql-createtrigger.html
