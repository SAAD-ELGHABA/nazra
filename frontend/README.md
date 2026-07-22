# NAZRA Frontend

Interface React/Vite de la boutique NAZRA. La page d'accueil livre le hero de marque, les bénéfices de confiance, une sélection de quatre produits, les preuves sociales, les collections de style, l'histoire de la marque, les avis et le contact WhatsApp. Elle prend en charge le français, l'anglais et l'arabe (RTL), ainsi que les états chargement, erreur et sélection vide.

## Installation et commandes

Prérequis : Node.js et npm.

```bash
npm install
npm run dev
```

Depuis le dossier `frontend`, les commandes disponibles sont :

```bash
npm run dev      # serveur Vite local
npm run build    # build de production dans dist/
npm run preview  # prévisualisation du build
npm run lint     # ESLint sur le frontend
```

Il n'existe pas de script de tests automatisés dans `package.json`. Pour valider une modification, exécuter au minimum `npm run lint` et `npm run build`, puis vérifier manuellement la page d'accueil aux formats mobile et desktop.

## Configuration API

`VITE_API_URL` définit l'URL de base Axios utilisée par `src/api/api.js`. Elle est requise pour charger les données backend et doit inclure le préfixe `/api` attendu par le serveur.

```dotenv
VITE_API_URL=http://localhost:<port>/api
```

Utiliser `.env.development` en local et `.env.production` pour le build de production. Redémarrer le serveur Vite après toute modification d'une variable d'environnement.

### Sélection de la page d'accueil

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

## Problèmes courants

- Sélection vide ou en erreur : vérifier que le backend est démarré, que `VITE_API_URL` se termine par `/api` et que des produits actifs existent.
- Changements de configuration invisibles : redémarrer `npm run dev` après une modification des fichiers `.env`.
- Promotion absente : contrôler `SITE_CONFIG.promotion.enabled` dans `src/config/site.js`.
