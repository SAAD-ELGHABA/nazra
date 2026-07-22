# API catalogue et fiches produit Nazra

Ce backend Express expose le catalogue public sous `/api/products`. Le contrat ci-dessous couvre la liste Store, la fiche produit, la lecture des avis, les variantes utilisées dans les commandes et les mutations de produits existantes.

## Démarrage local

Depuis `backend/` :

```bash
npm install
npm run dev
```

Variables utilisées par ce périmètre :

- `MONGO_URI` : connexion MongoDB requise ;
- `JWT_SECRET` : vérification des Bearer tokens pour les mutations authentifiées ;
- `PORT` : port HTTP optionnel, `5000` par défaut.

## GET `/api/products`

Endpoint public. Seuls les produits actifs sont renvoyés.

### Deux modes de réponse

- **Legacy** : sans paramètre `page`, la réponse reste `{ success, products }`. `limit` est optionnel ; sans limite, tous les produits correspondants sont renvoyés. Le tri par défaut est `newest`.
- **Paginé** : la présence de `page` active `{ success, products, pagination, appliedFilters }`. `limit` vaut `24` par défaut et ne peut pas dépasser `100`. Le tri par défaut est `best_selling`.

`include=filters`, `include=facets` ou `facets=true` ajoute `filters` uniquement à la réponse paginée.

### Paramètres acceptés

Les alias d’une même ligne alimentent le même filtre. Les filtres multivalués acceptent des paramètres répétés ou une liste séparée par des virgules, avec au plus 20 valeurs de 100 caractères. La comparaison des attributs est insensible à la casse.

| Paramètre | Alias | Valeurs et contraintes |
| --- | --- | --- |
| `page` | — | Entier de `1` à `1000000`; active la pagination |
| `limit` | `pageSize` | Entier de `1` à `100` |
| `sort` | `sortBy` | `best_selling`, `newest`, `price_asc`, `price_desc`, `top_rated`, `discount_desc` |
| `search` | `q` | Texte non vide, 100 caractères maximum |
| `gender` | `genders`, `category`, `categories` | Une ou plusieurs valeurs |
| `collection` | `collections` | Une ou plusieurs valeurs |
| `shape` | `shapes`, `type`, `types` | Une ou plusieurs valeurs |
| `color` | `colors` | Nom ou valeur de variante couleur |
| `polarized` | — | `true`, `false`, `1` ou `0` |
| `uv400` | — | `true`, `false`, `1` ou `0` |
| `stock` | `stocks`, `stockStatus` | `in_stock`, `low_stock`, `out_of_stock` ou alias ci-dessous |
| `inStock` | — | `true`, `false`, `1` ou `0` |
| `minPrice` | `min` | Nombre positif ou nul, 2 décimales maximum, jusqu’à `10000000` |
| `maxPrice` | `max` | Même contrainte que `minPrice` et supérieur ou égal à celui-ci |
| `include` | — | `filters` ou `facets` |
| `facets` | — | `true`, `false`, `1` ou `0` |

Alias de tri : `best-sellers`, `best-selling` et `bestsellers` donnent `best_selling`; `price-asc`, `price-desc`, `top-rated` et `discount` donnent respectivement `price_asc`, `price_desc`, `top_rated` et `discount_desc`.

Alias de stock : `available`, `instock`, `in-stock`; `lowstock`, `low-stock`; `unavailable`, `outofstock`, `out-of-stock`. `stock=true|1` équivaut à disponible et `stock=false|0` à indisponible. Une combinaison contradictoire entre un statut et `inStock` est refusée.

Pour préserver les anciens produits, `category` sert de repli à `gender`, `type` à `frameShape`, et l’état du stock est dérivé de `inStock` si `stockStatus` manque.

### Réponse paginée

```json
{
  "success": true,
  "products": [],
  "pagination": {
    "page": 2,
    "currentPage": 2,
    "limit": 12,
    "total": 42,
    "totalCount": 42,
    "totalPages": 4,
    "hasPreviousPage": true,
    "hasNextPage": true,
    "outOfRange": false
  },
  "appliedFilters": {
    "gender": ["Men"],
    "category": ["Men"],
    "collection": [],
    "shape": ["Round"],
    "type": ["Round"],
    "color": ["Black"],
    "polarized": true,
    "uv400": null,
    "stock": ["in_stock"],
    "inStock": null,
    "minPrice": 100,
    "maxPrice": null,
    "search": null,
    "sort": "price_asc"
  }
}
```

Une page supérieure à la dernière page valide renvoie `products: []` et `pagination.outOfRange: true`. Un catalogue vide a `totalPages: 0` et `outOfRange: false`.

### Facettes contextuelles

Avec `include=filters`, la propriété `filters` contient :

- `genders` et son alias `categories` ;
- `collections` ;
- `shapes` et son alias `types` ;
- `colors`, avec `value`, `count` et le nuancier sous `swatch`, `color` et `hex` ;
- `polarized`, `uv400` et `stock`, sous forme de couples `value`/`count` ;
- `price: { min, max }` ;
- `scope: "contextual"`.

Chaque facette conserve la recherche et tous les autres filtres, mais ignore son propre filtre. Par exemple, les comptes de couleurs tiennent compte du genre, de la forme, du stock et du prix sélectionnés, sans être limités par la couleur déjà sélectionnée. Les comptes représentent des produits distincts.

### Champs produit Store

Chaque entrée publique peut contenir :

```text
_id, name, slug, original_price, sale_price, compareAtPrice,
discountPercentage, type, category, gender, collection, frameShape,
references, description, uv400, polarized, badges, ratingAverage,
reviewCount, stockStatus, inStock, sortPriority, createdAt, updatedAt,
colors[{ _id, name, value, images[{ url }] }]
```

`createdBy`, `__v` et les `public_id` Cloudinary ne font pas partie de cette projection publique. `discountPercentage` est calculé à la lecture depuis `compareAtPrice`, avec repli sur `original_price`.

### Erreurs de validation

Un paramètre inconnu ou invalide renvoie HTTP `400` :

```json
{
  "success": false,
  "message": "limit must be an integer between 1 and 100"
}
```

Sont notamment refusés : les clés inconnues, les alias scalaires contradictoires, les listes vides ou trop longues, les booléens non reconnus, les tris inconnus, les prix à plus de deux décimales, `minPrice > maxPrice` et les filtres de stock contradictoires.

### Exemples curl

```bash
# Contrat legacy
curl "http://localhost:5000/api/products?limit=4&type=Round"

# Pagination, filtres et facettes contextuelles
curl "http://localhost:5000/api/products?page=1&pageSize=12&categories=Men,Women&colors=Black&min=100&polarized=1&stock=in-stock&sortBy=price-asc&include=facets"

# Recherche et tri Store
curl "http://localhost:5000/api/products?page=1&q=aviator&sort=top_rated"
```

## Mutations produit

Les routes suivantes exigent `Authorization: Bearer <token>` :

- `POST /api/products/create` crée un produit ;
- `PUT /api/products/:id` applique une mise à jour partielle et exige que l’utilisateur authentifié soit le créateur ;
- `DELETE /api/products/:id` désactive le produit (`isActive=false`) et exige la même propriété.

Aucun rôle supplémentaire n’est imposé par ces routes. La création requiert `name`, `original_price`, `sale_price`, `type`, `category` et au moins une variante `colors` avec au moins une image. Les champs catalogue ajoutés et mutables sont `gender`, `collection`, `frameShape`, `compareAtPrice`, `uv400`, `polarized`, `badges`, `stockStatus`, `inStock`, `sortPriority`, `shortDescription`, `specifications` et les options imbriquées des couleurs. `ratingAverage` et `reviewCount` sont volontairement refusés dans les mutations publiques. Les valeurs de stock sont synchronisées : `stockStatus` prévaut lorsque les deux représentations sont fournies.

## Index MongoDB

Le schéma `Product` déclare l’index texte sur le nom et les descriptions, ainsi que les index du catalogue pour les attributs, le stock, le prix et les tris. Après un déploiement sur une base existante, créer les index manquants depuis `backend/` :

```bash
node -e "require('dotenv').config(); const mongoose=require('mongoose'); const Product=require('./models/Product'); (async()=>{await mongoose.connect(process.env.MONGO_URI); await Product.createIndexes(); await mongoose.disconnect();})().catch(error=>{console.error(error.message); process.exit(1)})"
```

Cette commande utilise `MONGO_URI` depuis l’environnement et ne supprime pas les index existants. Contrôler son exécution sur un environnement de préproduction avant la production.

## GET `/api/products/:slug` — fiche produit

Endpoint public. Le slug doit être canonique (`atlas`, `atlas-premium`, 160 caractères maximum) et le produit doit être actif. La réponse est volontairement projetée : `createdBy`, `__v` et les identifiants Cloudinary `public_id` ne sont jamais exposés.

```bash
curl "http://localhost:5000/api/products/atlas"
```

```json
{
  "success": true,
  "product": {
    "id": "...",
    "_id": "...",
    "name": "ATLAS",
    "slug": "atlas",
    "shortDescription": { "fr": "...", "en": "...", "ar": "..." },
    "description": { "fr": "...", "en": "...", "ar": "..." },
    "original_price": 349,
    "sale_price": 249,
    "compareAtPrice": 349,
    "discountPercentage": 29,
    "currency": "MAD",
    "prices": { "current": 249, "compareAt": 349, "currency": "MAD", "discountPercentage": 29 },
    "features": { "uv400": true, "polarized": true },
    "category": "Men",
    "gender": "Men",
    "collection": "Desert",
    "frameShape": "Square",
    "badges": ["BEST SELLER"],
    "images": [{ "id": "...", "url": "https://...", "alt": null }],
    "colors": [{
      "id": "...",
      "name": "Noir Mat",
      "value": "#000000",
      "price": 249,
      "compareAtPrice": 349,
      "stockStatus": "in_stock",
      "available": true,
      "active": true,
      "images": [],
      "lensOptions": [{
        "id": "...",
        "name": "Polarized (Cat. 3)",
        "type": "polarized",
        "category": 3,
        "price": 279,
        "compareAtPrice": 349,
        "stockStatus": "low_stock",
        "available": true,
        "images": []
      }]
    }],
    "variants": [{
      "id": "<colorId>:<lensOptionId>",
      "colorId": "...",
      "lensOptionId": "...",
      "lensType": "polarized",
      "lensCategory": 3,
      "price": 279,
      "compareAtPrice": 349,
      "stockStatus": "low_stock",
      "available": true,
      "images": []
    }],
    "rating": { "average": 0, "count": 0 },
    "ratingAverage": 0,
    "reviewCount": 0,
    "specifications": {
      "frameMaterial": "Acetate",
      "lensMaterial": null,
      "lensCategory": 3,
      "frameWidth": null,
      "lensWidth": 52,
      "bridgeWidth": 20,
      "templeLength": 145,
      "weight": null,
      "frameColor": "Black",
      "lensColor": "Smoke"
    },
    "stock": { "status": "in_stock", "available": true, "availableVariantCount": 2 },
    "seo": { "title": "ATLAS", "description": "...", "image": "https://..." },
    "relatedProducts": []
  }
}
```

`relatedProducts` contient au plus quatre cartes publiques, calculées dynamiquement à partir de la collection, forme, genre/catégorie, type et proximité de prix. Le produit courant et les produits inactifs sont exclus. Les couleurs/options inactives, les SKU internes et les quantités exactes ne sont pas exposés ; le client reçoit uniquement `available` et `stockStatus`. Les anciens produits restent compatibles : `category` remplace `gender`, `type` remplace `frameShape`, une description complète alimente la description courte et une couleur sans `lensOptions` devient une variante achetable.

La note et le nombre d’avis sont recalculés à partir des seuls avis approuvés. Un slug mal formé renvoie HTTP `400`, un produit absent ou inactif HTTP `404`, et une erreur interne HTTP `500` avec un message générique.

## GET `/api/products/:slug/reviews`

Endpoint public en lecture seule. Il ne renvoie que les avis `approved`, triés du plus récent au plus ancien, sans `user` ni `order`.

Paramètres : `page` (défaut `1`, maximum `1000`) et `limit` (défaut `6`, maximum `20`). Toute autre clé est refusée.

```bash
curl "http://localhost:5000/api/products/atlas/reviews?page=1&limit=6"
```

```json
{
  "success": true,
  "reviews": [{
    "id": "...",
    "displayName": "Youssef E.",
    "rating": 5,
    "title": "Excellent",
    "comment": "Très satisfait.",
    "verifiedPurchase": true,
    "createdAt": "2026-07-22T10:00:00.000Z"
  }],
  "rating": { "average": 0, "count": 0 },
  "pagination": {
    "page": 1,
    "limit": 6,
    "total": 0,
    "totalPages": 0,
    "hasPreviousPage": false,
    "hasNextPage": false,
    "outOfRange": false
  }
}
```

Le modèle `Review` prépare les champs `product`, `user`, `order`, `displayName`, `rating`, `title`, `comment`, `verifiedPurchase`, `status` et les timestamps. Aucune route d’écriture n’est exposée : les commandes actuelles sont invitées et ne lient pas de manière vérifiable une commande à un utilisateur authentifié. Accepter une adresse e-mail ou un numéro de commande envoyé par le client ne constituerait pas une preuve sûre d’achat. Une future écriture devra d’abord ajouter cette propriété de commande et vérifier côté serveur une commande `delivered` contenant le produit.

Une page supérieure à la dernière page renvoie une liste vide avec `outOfRange: true`. Un slug ou un paramètre invalide renvoie HTTP `400`; un produit absent ou inactif renvoie HTTP `404`.

## Variantes et validation des commandes

`colors[]` reste compatible avec les anciens documents et accepte désormais `sku`, `price`, `compareAtPrice`, `stock`, `active` et `lensOptions[]`. Une option de verre accepte `name`, `type`, `category` (0–4), `sku`, `price`, `compareAtPrice`, `stock`, `active` et des images optionnelles.

Lors de `POST /api/orders/create`, chaque ligne continue d'exiger `product`, `color` et `quantity`. `product` doit être un ObjectId; `color` accepte l’ObjectId, le nom ou la valeur de la couleur. Pour une couleur ayant des options de verre, envoyer également `lensOption` (ou l'alias `lensOptionId`). Une option est résolue par son ObjectId, son nom, son type ou son SKU. Si les deux alias sont envoyés, ils doivent désigner la même valeur.

```json
{
  "products": [{
    "product": "64b000000000000000000001",
    "color": "64b000000000000000000002",
    "lensOption": "64b000000000000000000003",
    "quantity": 1
  }],
  "customer": {
    "fullName": "Client Nazra",
    "email": "client@example.com",
    "phone": "+212600000000",
    "adresse": "Casablanca"
  }
}
```

L’API :

- résout exactement la combinaison couleur/verre et rejette les combinaisons inexistantes ou inactives ;
- recalcule le prix côté serveur (`lens.price`, puis `color.price`, puis `product.sale_price`) ;
- vérifie la quantité sur le stock numérique le plus précis : stock du verre, puis stock de la couleur ;
- enregistre dans la commande les snapshots `colorVariantId`, `lensOptionId`, `lensType`, `lensCategory`, `sku` et `unitPrice` ;
- décrémente le stock par une mise à jour MongoDB conditionnelle atomique, puis compense les réservations précédentes si une ligne concurrente échoue ou si l'enregistrement de la commande échoue.

Quand le verre n’a pas de stock numérique mais que sa couleur en possède un, la quantité est réservée sur la couleur. Les variantes sans aucun stock numérique conservent le comportement historique fondé sur `stockStatus`/`inStock` et ne font pas l’objet d’un décrément. Le statut global `out_of_stock` ou `inStock=false`, une variante inactive, une combinaison inconnue et une quantité insuffisante sont refusés avant la sauvegarde.

Une commande valide renvoie HTTP `201` avec `{ success, message, order }`. Une entrée invalide ou une réservation concurrente perdue renvoie HTTP `400`; une erreur interne renvoie HTTP `500`. L’échec d’envoi des e-mails n’annule pas une commande déjà enregistrée.

La compensation protège les erreurs applicatives normales ; elle n’est pas une transaction MongoDB multi-document. Un replica set et une transaction restent recommandés afin de couvrir un arrêt brutal du processus entre la réservation et la création de la commande. L’écriture des avis reste désactivée tant que la propriété authentifiée des commandes invitées ne peut pas être établie côté serveur.

La création publique est limitée à 10 tentatives par adresse IP et par minute. Le header facultatif `Idempotency-Key` accepte 16 à 128 caractères sûrs (`A-Z`, `a-z`, chiffres, `.`, `_`, `:`, `-`). Seul son hash SHA-256 est stocké. Une répétition renvoie la commande existante avec HTTP `200` et `Idempotency-Replayed: true`, sans réserver le stock une seconde fois.

Les transitions autorisées sont `pending → processing|cancelled`, `processing → shipped|cancelled` et `shipped → delivered`. `delivered` et `cancelled` sont terminaux. Répéter le statut actuel est idempotent. Une annulation restaure la source de stock réservée (`color` ou `lens`) dans la même transaction MongoDB que le changement de statut ; le déploiement doit donc utiliser un replica set. Les anciennes commandes sans snapshot `inventorySource` ne déclenchent aucune restauration automatique ambiguë.

## POST `/api/contact`

Endpoint public du formulaire de contact. Il accepte uniquement `application/json` avec une taille maximale de 16 Kio. Les champs inconnus et les paramètres de requête sont refusés.

```json
{
  "name": "Client NAZRA",
  "email": "client@example.com",
  "phone": "+212612345678",
  "subject": "order",
  "message": "Bonjour, je souhaite obtenir des informations sur ma commande.",
  "website": ""
}
```

- `name` : requis, 2 à 100 caractères ;
- `email` : requis, adresse valide de 254 caractères maximum ;
- `phone` : facultatif, numéro marocain ou international valide, normalisé au format E.164 ;
- `subject` : `order`, `shipping`, `returns`, `product`, `payment`, `partnership`, `press` ou `other` ;
- `message` : requis, 10 à 3 000 caractères ;
- `website` : honeypot réservé au formulaire, il doit rester vide.

Une soumission valide est persistée dans `ContactMessage` avant la tentative de notification par e-mail. La réponse publique est volontairement générique :

```json
{
  "success": true,
  "message": "Your message has been received."
}
```

L’échec SMTP n’annule pas un message enregistré. Son état interne passe à `failed`; si aucun destinataire n’est configuré, il passe à `skipped`. La notification utilise, dans l’ordre, `CONTACT_EMAIL`, `ADMIN_EMAIL`, puis `EMAIL_USER`. L’expéditeur peut être défini avec `EMAIL_FROM`; `SMTP_HOST`, `SMTP_PORT` et `SMTP_SECURE` sont facultatifs et conservent Gmail/465 comme valeurs compatibles avec la configuration historique. Les valeurs fournies par le client sont échappées avant insertion dans l’e-mail HTML.

La route applique un délai minimal de 10 secondes entre deux tentatives et une limite de 5 tentatives par fenêtre de 15 minutes. Les compteurs sont en mémoire et utilisent une empreinte éphémère de l’adresse réseau ; aucune adresse IP ni aucun user-agent n’est enregistré dans MongoDB. Sur une infrastructure multi-instance, utiliser à terme un compteur partagé (par exemple Redis) pour une limite globale.

Les routes de lecture, détail et mise à jour des messages ne sont pas exposées. Le modèle utilisateur actuel autorise encore une inscription publique avec un rôle administrateur par défaut, ce qui ne constitue pas un contrôle d’administration fiable. Il faut corriger cette politique et ajouter un middleware de rôle côté serveur avant d’exposer la boîte de réception de contact.

## Tests

Le script `npm test` n’est pas configuré dans ce projet. Exécuter les tests unitaires du parseur et des filtres avec :

```bash
node --test test/*.test.js
```

Ces tests vérifient le mode legacy, les alias, la pagination, les booléens et prix, la déduplication, les erreurs `400` attendues et les replis sur les anciens champs. Les agrégations MongoDB et les routes HTTP nécessitent encore des tests d’intégration avec une base de test isolée.

Les suites couvrent également la normalisation de la fiche produit, la validation de la pagination des avis, la résolution couleur/verre, le calcul serveur du prix, le contrôle des quantités et la réservation/compensation du stock. Elles ne remplacent pas un test d’intégration MongoDB pour les écritures atomiques concurrentes.

### Problèmes courants

- **`DB connection failed`** : vérifier que `MONGO_URI` est défini et que MongoDB est accessible.
- **HTTP `400` après ajout d’un filtre** : vérifier son nom exact ; les paramètres inconnus sont volontairement rejetés.
- **Facettes absentes** : fournir `page` et `include=filters` (ou `include=facets`/`facets=true`).
- **HTTP `401` sur une mutation** : fournir un Bearer token valide et vérifier `JWT_SECRET`.
- **Tri ou filtres lents après déploiement** : créer les index déclarés par le schéma avec la commande ci-dessus.
