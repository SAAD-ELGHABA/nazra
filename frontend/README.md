# NAZRA Frontend

Interface React/Vite de la boutique NAZRA. La page d'accueil livre le hero de marque, les bénéfices de confiance, une sélection de quatre produits, les preuves sociales, les collections de style, l'histoire de la marque, les avis et le contact WhatsApp. Elle prend en charge le français, l'anglais et l'arabe (RTL), ainsi que les états chargement, erreur et sélection vide.

## Installation et commandes

Prérequis : Node.js et npm.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Sous macOS ou Linux, remplacer `Copy-Item` par `cp`. Le fichier `.env.local` reste local et ne doit pas être versionné.

Depuis le dossier `frontend`, les commandes disponibles sont :

```bash
npm run dev      # serveur Vite local
npm run build    # build de production dans dist/
npm run preview  # prévisualisation du build
npm run lint     # ESLint sur le frontend
```

Il n'existe pas de script de tests automatisés dans `package.json`. Pour valider une modification, exécuter au minimum `npm run lint` et `npm run build`, puis vérifier manuellement les pages concernées aux formats mobile et desktop.

## Configuration API

`VITE_API_URL` définit l'URL de base Axios utilisée par `src/api/api.js`. Elle est requise pour charger les données backend et doit inclure le préfixe `/api` attendu par le serveur.

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Copier `.env.example` vers `.env.local` en local et définir les mêmes noms dans la configuration du projet frontend chez l’hébergeur. Le frontend requiert uniquement `VITE_API_URL` pour l’API ; `VITE_APP_DEEPAR_SDK_KEY` reste la clé publique du SDK d’essayage virtuel. Redémarrer Vite après toute modification.

Toutes les variables `VITE_*` sont publiques : Vite les intègre au bundle téléchargé par le navigateur. Ne jamais y placer un secret Cloudinary, un mot de passe SMTP, un JWT secret, un pepper ou une chaîne MongoDB. La configuration Cloudinary réside uniquement côté backend ; aucun cloud name ni preset d’upload n’est requis dans `.env.local`.

### Uploads Cloudinary signés

Les formulaires administratifs demandent au backend une signature temporaire via `POST /api/media/upload-signature`, puis envoient directement le fichier à Cloudinary avec les paramètres signés reçus et le preset signé restrictif configuré sur le backend. La requête exige le Bearer token de l’administrateur connecté et un usage explicite :

- `product`, avec la permission `products.manage` ;
- `blog`, avec la permission `blog.manage`.

Un HTTP `401` impose une nouvelle connexion ; un HTTP `403` indique que le compte ne possède pas la permission adaptée. Un HTTP `503` indique généralement que la configuration Cloudinary du backend est absente ou incomplète.

## Fondation de l’administration (Phase 2)

L’administration utilise un shell React partagé sous le préfixe `/admins/dashboard`. Il fournit la navigation responsive, la barre supérieure, les breadcrumbs, l’identité de l’administrateur courant, les titres de page et les états communs des listes.

Routes actuellement disponibles :

- `/admins/dashboard` : vue d’ensemble ;
- `/admins/dashboard/products` : produits ;
- `/admins/dashboard/products/new` : création d’un produit ;
- `/admins/dashboard/products/:id/edit` : modification d’un produit ;
- `/admins/dashboard/orders` : commandes ;
- `/admins/dashboard/blogs` : blog ;
- `/admins/dashboard/analytics` : visiteurs et analytics ;
- `/admins/dashboard/subscribers` : abonnés consentants ;
- `/admins/dashboard/admins` : administrateurs.

`src/components/admin/navigation/adminNavigation.js` centralise les liens, leur correspondance avec les routes imbriquées et la capability requise. Le client charge l’utilisateur courant et ses capabilities, masque les entrées non autorisées et affiche un état 403 sur une route interdite. Cette filtration reste une aide d’interface : les contrôles d’autorisation du backend demeurent la source de vérité.

Principaux éléments réutilisables :

- `src/components/admin/shell/` : shell, sidebar, top bar, breadcrumbs et menu utilisateur ;
- `src/components/admin/page/`, `feedback/`, `filters/`, `table/`, `forms/` et `status/` : en-têtes, états de données, filtres, tables, pagination, confirmations et badges ;
- `src/context/AdminAuthContext.jsx` et `src/context/AdminPageContext.jsx` : identité/capabilities et métadonnées propres à la page ;
- `src/hooks/useAdminListQuery.js` : état de liste non sensible dans l’URL (`page`, `limit`, `sort` et filtres autorisés) ;
- `src/utils/adminFormatting.js` et `src/utils/adminDates.js` : montants MAD, données de commande et dates administratives cohérentes.

La recherche produit peut être conservée dans `q`, car elle concerne le catalogue. Les recherches de commandes, d’abonnés et d’administrateurs restent uniquement dans l’état React et suppriment `q` de l’URL : une recherche peut contenir un nom, un e-mail, un téléphone ou un identifiant personnel qui ne doit pas apparaître dans l’historique du navigateur ou dans une URL partagée.

Limitation actuelle : les pages migrées chargent leur collection puis appliquent filtres et pagination côté client avec `paginateAdminItems`. Les totaux représentent donc les données déjà reçues, pas une pagination serveur. Pour des volumes importants, conserver les mêmes composants mais faire évoluer les endpoints afin qu’ils renvoient les lignes paginées et leurs métadonnées.

Pour vérifier la fondation depuis `frontend` :

```bash
npm run lint
npm run build
npm run dev
```

Il n’existe toujours pas de script de tests automatisés frontend. `npm run dev` permet les contrôles interactifs locaux ; cette documentation ne présume pas qu’ils ont été exécutés.

## Mot de passe oublié

Le lien « Forgot password? » de `/login` ouvre `/forgot-password`. Le parcours comporte deux étapes :

1. le formulaire envoie l’e-mail à `POST /api/auth/forgot-password` ;
2. `/reset-password` demande le même e-mail, le code numérique à huit chiffres reçu, le nouveau mot de passe et sa confirmation, puis appelle `POST /api/auth/reset-password`.

Le message après la première étape reste volontairement générique et le backend renvoie HTTP `202`, même si aucun compte ne correspond. Un code dure 10 minutes, ne peut servir qu’une fois et est bloqué après cinq essais incorrects. Le mot de passe doit contenir au moins 12 caractères, ne pas dépasser 72 octets UTF-8 et différer du mot de passe actuel.

Les réponses HTTP `429` affichent un compte à rebours fondé sur `Retry-After` ou `retryAfterSeconds`. Après une réussite, le client efface `User_Data` et `User_Data_token`, puis revient à `/login`. Le backend incrémente parallèlement `authVersion`, ce qui fait refuser les JWT précédents, y compris ceux encore stockés sur d’autres appareils.

Le stockage actuel dans `localStorage` reste accessible à tout JavaScript exécuté sur l’origine. Ne jamais y stocker le code de reset ou un mot de passe, maintenir une politique stricte contre les XSS et envisager des cookies `HttpOnly`, `Secure` et `SameSite` lors d’une future évolution de la gestion de session.

### Vérification manuelle

Après `npm run lint` et `npm run build`, vérifier :

- les validations e-mail, code, mot de passe et confirmation, y compris un code commençant par zéro ;
- les états chargement, succès, erreur réseau, `400`, `429` avec compte à rebours et `503` ;
- le renvoi vers `/reset-password`, le retour vers `/login` et le nettoyage du stockage après réussite ;
- l’affichage mobile, la navigation clavier, le focus sur la première erreur et les annonces accessibles ;
- la connexion avec le nouveau mot de passe et le rejet de l’ancien mot de passe et de l’ancien JWT.

## Sélection de la page d'accueil

La page appelle l'endpoint public suivant :

```http
GET /api/products/homepage-selection?limit=4
```

`limit` est optionnel (4 par défaut) et accepte un entier de 1 à 12. Une réponse réussie contient `products` et `meta`. Le champ `meta.source` indique l'origine réelle de la sélection :

- `sales` : quatre produits actifs ont pu être classés à partir des quantités vendues dans les commandes `processing`, `shipped` ou `delivered` ;
- `recent` : les données de vente sont insuffisantes pour remplir la limite demandée, donc l'API renvoie les produits actifs les plus récents.

Le titre visible reste « Best Sellers », mais il ne faut pas interpréter une réponse `meta.source: "recent"` comme un classement des meilleures ventes. Si cet endpoint échoue, le client essaie successivement `/products/products-shortcut`, puis `/products?limit=4` ; ces replis ne garantissent pas non plus un classement par ventes.

## Configuration du site

Les coordonnées et liens publics sont centralisés dans `src/config/site.js` : nom et URL du site, e-mail, WhatsApp, réseaux sociaux et bannière promotionnelle. Modifier `SITE_CONFIG` plutôt que de dupliquer ces valeurs dans les composants. La promotion n'est affichée que lorsque `SITE_CONFIG.promotion.enabled` vaut `true`.

## Assets de la page d'accueil

Les images statiques sont servies depuis `public/assets/images/home/` :

- `hero-nazra.webp` pour le hero ;
- `promotion-sandstone.webp` pour la bannière et les collections ;
- `ugc-01.webp` à `ugc-04.webp` pour la galerie communautaire.

Conserver ces noms, ou mettre à jour les références dans `src/components/home/`, lors du remplacement des fichiers. Optimiser les nouvelles images en WebP avant de les ajouter.

## Déploiement

Définir `VITE_API_URL` avec le préfixe `/api` et vérifier que l’origine frontend exacte figure dans `FRONTEND_URL` côté backend. Configurer `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` et `CLOUDINARY_UPLOAD_PRESET` uniquement sur le backend ; le preset doit être signé et restrictif. Les pages `/forgot-password` et `/reset-password` dépendent de la réécriture SPA configurée dans `vercel.json` ; tester leur ouverture directe après chaque déploiement.

Les anciennes variables d’environnement frontend ont existé dans l’historique Git. Supprimer les fichiers courants ne retire pas leurs anciennes versions : les responsables des fournisseurs doivent révoquer les identifiants concernés, et le propriétaire du dépôt doit coordonner le nettoyage complet de l’historique décrit dans le README backend. Toute valeur `VITE_*` doit être considérée comme publique, même après ce nettoyage.

## Problèmes courants

- Sélection vide ou en erreur : vérifier que le backend est démarré, que `VITE_API_URL` se termine par `/api` et que des produits actifs existent.
- Reset HTTP `503` : le transport SMTP ou les secrets de sécurité du backend sont absents ; aucune correction frontend ne peut rétablir le service.
- Code absent malgré HTTP `202` : vérifier le dossier indésirable ; pour une adresse sans compte, ce comportement générique est intentionnel.
- Compte à rebours après HTTP `429` : attendre la durée affichée ; actualiser la page ne supprime pas la limite MongoDB.
- Ancien JWT encore présent sur un autre appareil : il peut rester dans `localStorage`, mais le backend doit le refuser à la prochaine requête protégée après le reset.
- Upload média HTTP `401` ou `403` : se reconnecter, puis vérifier la permission `products.manage` ou `blog.manage` correspondant au formulaire.
- Upload média HTTP `503` : vérifier les quatre variables `CLOUDINARY_*` côté backend et la configuration signée du preset ; aucune variable Cloudinary frontend ne doit être ajoutée.
- Changements de configuration invisibles : redémarrer `npm run dev` après une modification de `.env.local`.
- Promotion absente : contrôler `SITE_CONFIG.promotion.enabled` dans `src/config/site.js`.
