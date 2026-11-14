> ⚠️ **Document historique — certains constats de schéma sont dépassés.** Le plan du 12 novembre indiquait que plusieurs tables de messagerie, commandes, paiements et abonnements étaient absentes. L'inventaire en lecture seule du 14 novembre confirme désormais 38 tables publiques avec RLS activée et 27 migrations appliquées. Les tests de ce document restent des scénarios à exécuter ; la présence des tables ne signifie pas que les interfaces, les permissions ou les parcours sont validés. Pour l'état de référence, consulter [`ETAT-REEL-SUPABASE-2026-11-14-APRES-M8-M13.md`](./ETAT-REEL-SUPABASE-2026-11-14-APRES-M8-M13.md).

# Zack — plan de tests et critères de recette

Date : 14 novembre 2026
Branche de travail : `hardening/phase-1-stabilisation`
Statut : le CI GitHub valide l'installation, le TypeScript et le build sur le HEAD `b32c576` ; les tests navigateur et les tests avec vrais comptes restent à exécuter.

## 1. Préparation

- Utiliser Node.js compatible avec le socle TanStack Start et installer les dépendances depuis `package.json`.
- Copier `.env.example` vers `.env.local`.
- Renseigner uniquement l'URL Supabase et la clé publishable.
- Ne jamais copier une clé `service_role`, un secret marchand, un PIN ou un OTP dans le frontend.
- Configurer dans Supabase Auth les URLs de redirection locales et de production avant les tests de récupération de mot de passe.
- Utiliser des comptes de test distincts pour visiteur, client, membre entreprise et administrateur.
- Ne pas utiliser de données personnelles réelles pour les tests.

## 2. Tests du socle technique

| ID | Scénario | Résultat attendu |
|---|---|---|
| TEC-01 | Installer les dépendances | Installation sans conflit de dépendances. |
| TEC-02 | Démarrer le serveur de développement | Le serveur TanStack Start démarre et affiche l'accueil. |
| TEC-03 | Compiler la production | `vite build` et `tsc --noEmit` réussissent. |
| TEC-04 | Variables Supabase absentes | Les pages publiques affichent un état indisponible sans exposer de secret ni planter. |
| TEC-05 | Vérifier les bundles client | Aucun secret serveur ni clé privilégiée n'est présent. |
| TEC-06 | Ouvrir directement une route profonde | La route est rendue correctement après rechargement. |

## 3. Tests de l'espace public actuellement amorcé

| ID | Scénario | Résultat attendu |
|---|---|---|
| PUB-01 | Ouvrir l'accueil sans connexion | L'accueil s'affiche sans demander de compte. |
| PUB-02 | Charger les catégories | Seules les catégories actives sont affichées. |
| PUB-03 | Charger les entreprises | Seules les entreprises avec statut `verified` sont visibles. |
| PUB-04 | Base vide | Un état vide explicite apparaît ; aucune statistique fictive n'est affichée. |
| PUB-05 | Supabase indisponible | Un message d'indisponibilité apparaît, sans stack trace. |
| PUB-06 | Rechercher un terme | La recherche serveur interroge le champ `search_document` des entreprises vérifiées. |
| PUB-07 | Ouvrir une fiche entreprise | Une entreprise vérifiée est affichée par son slug. |
| PUB-08 | Ouvrir une fiche en attente ou rejetée | La fiche n'est pas exposée publiquement. |
| PUB-09 | Coordonnées absentes | Les coordonnées absentes ne créent pas de faux boutons de contact. |
| PUB-10 | Liens externes | Les liens externes utilisent `rel="noreferrer"` lorsqu'ils ouvrent un nouvel onglet. |

## 4. Authentification et profil

| ID | Scénario | Résultat attendu |
|---|---|---|
| AUTH-01 | Créer un compte valide | Supabase Auth reçoit l'inscription ; le message tient compte de la confirmation e-mail. |
| AUTH-02 | Mot de passe trop court | Le formulaire refuse l'envoi avant l'appel réseau. |
| AUTH-03 | Se connecter avec des identifiants valides | La session est créée et l'utilisateur arrive dans l'espace professionnel. |
| AUTH-04 | Identifiants incorrects | Message générique ; aucune information ne révèle si l'e-mail existe. |
| AUTH-05 | Demander un lien de récupération | Supabase envoie le lien si le compte existe ; message neutre côté interface. |
| AUTH-06 | Réinitialiser avec un lien valide | Le mot de passe est mis à jour. |
| AUTH-07 | Réinitialiser avec un lien expiré | Message d'erreur et possibilité de demander un nouveau lien. |
| AUTH-08 | Modifier son profil | L'utilisateur ne peut modifier que son propre profil via RLS. |
| AUTH-09 | Se déconnecter | La session est terminée et l'utilisateur revient à l'accueil. |
| AUTH-10 | Appeler une action sans session | L'action serveur refuse l'opération. |
| AUTH-11 | Créer un profil lors du premier usage professionnel | La ligne `profiles` est créée uniquement pour l'utilisateur connecté et dans le respect de RLS. |

## 5. Inscription d'une entreprise

| ID | Scénario | Résultat attendu |
|---|---|---|
| BIZ-01 | Soumettre sans être connecté | L'inscription est refusée. |
| BIZ-02 | Nom trop court ou invalide | La validation serveur refuse les données. |
| BIZ-03 | Slug déjà utilisé | Message clair ; aucune seconde entreprise n'est créée. |
| BIZ-04 | Créer une entreprise valide | La RPC `create_business` crée une entreprise en attente et le membre owner. |
| BIZ-05 | Ajouter ville et quartier | La ville est enregistrée dans `businesses.city`, le quartier dans `businesses.neighborhood`. |
| BIZ-06 | Vérifier la visibilité publique | La nouvelle fiche n'est pas visible avant validation. |
| BIZ-07 | Mettre à jour une entreprise d'un autre utilisateur | RLS refuse l'opération. |
| NOT-01 | Ouvrir ses notifications | Seules les notifications de l'utilisateur connecté sont affichées. |
| NOT-02 | Marquer une notification comme lue | Seule sa propre notification est mise à jour. |

## 6. Tests d'autorisation RLS obligatoires

- Un client ne lit ni ne modifie le profil d'un autre utilisateur.
- Un membre de l'entreprise A ne lit ni ne modifie les ressources privées de l'entreprise B.
- Un membre `editor` ne peut pas modifier les rôles d'administration.
- Un utilisateur sans permission admin ne peut pas appeler les RPC d'administration avec succès.
- Un utilisateur non connecté ne peut pas lire les avis en attente.
- Un utilisateur ne peut pas soumettre un avis au nom d'un autre utilisateur.
- Un utilisateur ne peut pas créer un produit pour une entreprise dont il n'est pas membre.
- Un utilisateur ne peut pas rattacher une image ou une catégorie produit à un produit d'une autre entreprise.
- Un visiteur ne peut lire que les entreprises vérifiées et les contenus publiés prévus par les politiques.
- Les insertions publiques d'événements statistiques sont testées contre les doublons, les types invalides et l'abus automatisé.

## 7. Responsive, accessibilité et expérience

- Vérifier 320 px, 375 px, 768 px, 1024 px et desktop large.
- Aucun débordement horizontal.
- Tous les champs ont un label associé.
- Les formulaires peuvent être utilisés au clavier.
- Les boutons indiquent l'état occupé et sont désactivés pendant l'envoi.
- Contraste suffisant, en particulier texte foncé sur jaune.
- Thèmes clair, sombre et automatique respectent les préférences système.
- Les images ont un texte alternatif approprié ou un alt vide lorsqu'elles sont décoratives.

## 8. Paiements et abonnements — tables présentes, parcours incomplet

L'inventaire du 14 novembre 2026 confirme que les tables suivantes existent déjà et ont RLS activée :
- `subscription_plans` ;
- `business_subscriptions` ;
- `payments` ;
- `payment_events` ;
- `payment_recipients`.

Le schéma ne signifie pas que le parcours est prêt :
- seul le forfait Gratuit est actuellement configuré ;
- aucun plan Pro/Ultra ni destinataire MonCash n'est enregistré ;
- aucun abonnement, paiement ou événement de paiement n'est actuellement enregistré ;
- les RPC acceptent encore NatCash, ne figent pas tous les snapshots et ne garantissent pas une seule demande en attente par entreprise ;
- aucun écran de paiement ou d'administration des paiements n'est présent dans la branche frontend.

Scénarios obligatoires avant activation des paiements :
- un utilisateur ne peut demander un forfait que pour une entreprise qu'il gère ;
- le serveur relit le prix, la durée, les avantages et le destinataire actif, sans faire confiance au navigateur ;
- les snapshots restent identiques si le plan ou le destinataire change après la demande ;
- une seule demande en attente existe par entreprise, même avec deux appels simultanés ;
- une référence MonCash déjà utilisée est refusée ;
- une demande refusée peut être remplacée selon la règle métier sans permettre de rejouer la même transaction ;
- seul `main_admin` peut approuver ou refuser ;
- le même forfait renouvelé prolonge la date de fin existante ;
- un changement de forfait applique les nouvelles conditions à l'approbation, sans prorata au lancement, avec avertissement préalable ;
- deux approbations concurrentes ne peuvent pas créer deux abonnements actifs ;
- une notification en échec ne doit pas rendre ambigu le résultat du paiement ;
- l'historique et les événements permettent de reconstituer chaque décision.

Ces scénarios doivent d'abord être testés sur un environnement de développement gratuit. Aucun paiement réel ne doit être accepté tant que les écarts RPC, les snapshots, les interfaces et la recette ne sont pas terminés.

## 9. Publication directe des contenus

- Un owner/admin/editor autorisé peut publier directement les contenus de son entreprise selon les policies de la table concernée.
- Aucun approbation Zack préalable ni file de modération ne doit bloquer la publication.
- Les tests doivent couvrir l'isolation interentreprises, les rôles, le changement de `business_id`, la révocation d'un membre et la protection du statut de vérification.
- Les signalements et retraits sont réactifs ; ils ne doivent pas être confondus avec une validation obligatoire avant publication.


## 10. État de validation à date

- Audit statique de l'ancien frontend : effectué.
- Inventaire Supabase en lecture seule : effectué.
- Types TypeScript Supabase : générés depuis le schéma actuel et enregistrés dans le dépôt.
- Routes frontend initiales : écrites ; page de consultation des abonnements `/abonnements` ajoutée en lecture seule pour owner/admin.
- Build TypeScript/Vite : réussi sur le HEAD `b32c576` (runs CI push `43627903143` et pull request `43627909871`, installation, TypeScript, build et finalisation terminés).
- Tests navigateur : non exécutés.
- Tests de sécurité avec comptes réels de test : non exécutés.
- Déploiement : non effectué.

Ne jamais marquer une étape comme réussie sans résultat de test observé.


## 11. Mise à jour du statut CI — 14 novembre 2026

- HEAD contrôlé : `b32c5768259429d5869590e1fff66cb95a4faf58`.
- Run push `43627903143` : succès confirmé, installation, TypeScript, build de production et finalisation terminés.
- Run pull request `43627909871` : succès confirmé, installation, TypeScript, build de production et finalisation terminés.
- Les tests navigateur, les tests RLS avec comptes réels et la recette complète restent non exécutés.


## 12. Mise à jour — consultation des abonnements

Le 14 novembre 2026, une page `/abonnements` a été ajoutée à la branche de stabilisation :
- authentification vérifiée côté serveur ;
- liste limitée aux entreprises dont l'utilisateur est owner/admin ;
- lecture des plans actifs, abonnements et paiements selon les RLS existantes ;
- aucune récupération des numéros de réception MonCash ni des notes internes de revue ;
- aucune création de demande, aucun encaissement et aucun changement d'état.

Tests à faire avec des comptes réels : owner, admin, editor, utilisateur sans entreprise, entreprise multiple, session expirée, et accès interentreprises. Le parcours de paiement reste désactivé tant que les RPC MonCash ne sont pas corrigés et testés.

Dernière vérification du code de la page sur le HEAD `b32c576` : les champs `review_note` et la RPC `get_payment_recipients` ne sont plus sollicités par cette page. La consultation est en lecture seule ; cela ne remplace pas les tests de sécurité avec plusieurs comptes.


## 13. Mise à jour de validation — HEAD 86eba3f — 14 novembre 2026

- Les quatre formulaires Auth gèrent maintenant les exceptions réseau et réinitialisent l'état occupé même en cas d'échec.
- Le message de connexion ne révèle pas si une adresse e-mail existe ; l'inscription et la récupération conservent des messages neutres.
- Quatre tests automatisés supplémentaires couvrent les protections Auth.
- CI push `43636563843` et CI pull request `43636568676` : succès complet sur le HEAD `86eba3f1b35ff26d618d5a80aee51073ba9aad73`.
- Résultat : 20/20 tests automatisés, vérification TypeScript et builds client, SSR et Nitro réussis.
- Les tests navigateur, appareils mobiles et RLS avec comptes réels restent non exécutés. Aucun test sur la base Supabase de production n'est autorisé.
- Aucun déploiement, paiement réel, changement de base, dépense ou fusion n'a été effectué.
