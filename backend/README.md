# API catalogue et fiches produit Nazra

Ce backend Express expose le catalogue public sous `/api/products`. Le contrat ci-dessous couvre la liste Store, la fiche produit, la lecture des avis, les variantes utilisées dans les commandes et les mutations de produits existantes.

## Démarrage local

Prérequis : Node.js, npm et MongoDB. La réinitialisation effective du mot de passe utilise une transaction ; MongoDB doit donc fonctionner en replica set, y compris pour un test local complet de ce parcours.

Depuis `backend/`, créer la configuration locale sans modifier l’exemple versionné :

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Sous macOS ou Linux, remplacer `Copy-Item` par `cp`. Le serveur écoute sur `PORT` (`5000` par défaut).

### Variables d’environnement

`backend/.env.example` contient uniquement des valeurs neutres. Chaque secret entre chevrons doit être remplacé localement ou dans le gestionnaire de secrets de l’hébergeur.

| Variable | Statut | Utilisation |
| --- | --- | --- |
| `MONGO_URI` | Requise | Base MongoDB applicative, accessible comme replica set pour les transactions |
| `TEST_MONGO_URI` | Requise pour l’intégration | Base isolée réservée aux tests ; ne jamais utiliser la production |
| `JWT_SECRET` | Requise | Signature HS256 des JWT ; valeur aléatoire forte d’au moins 32 caractères |
| `PASSWORD_RESET_CODE_PEPPER` | Requise | HMAC des codes de réinitialisation ; valeur aléatoire indépendante d’au moins 32 caractères |
| `AUTH_RATE_LIMIT_PEPPER` | Requise | HMAC des identifiants de limitation ; valeur aléatoire indépendante d’au moins 32 caractères |
| `SMTP_USER`, `SMTP_PASS` | Requises pour le reset | Identifiants SMTP ; `EMAIL_USER`/`EMAIL_PASS` restent des alias historiques. Avec Gmail, utiliser un mot de passe d’application (les espaces d’affichage sont retirés côté serveur) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Requises en production | Transport SMTP. Utiliser généralement `587`/`false` pour STARTTLS ou `465`/`true` pour TLS implicite |
| `EMAIL_FROM` | Recommandée | Expéditeur autorisé par le fournisseur SMTP |
| `FRONTEND_URL` | Requise | Origine frontend autorisée par CORS |
| `API_URL` | Selon déploiement | Origine API ajoutée à la liste CORS existante |
| `BCRYPT_ROUNDS` | Optionnelle | Coût bcrypt de `10` à `14`, `12` par défaut |
| `NODE_ENV`, `PORT` | Optionnelles | Environnement d’exécution et port HTTP |
| `CLOUDINARY_*` | Requises pour les médias | Configuration serveur Cloudinary ; le secret reste exclusivement côté backend |
| `ADMIN_EMAIL`, `CONTACT_EMAIL` | Optionnelles | Destinataires des notifications administratives et de contact |

Les trois secrets d’authentification doivent être différents. Ne jamais les copier dans une variable `VITE_*`, car ces variables sont intégrées au JavaScript livré au navigateur.

## Authentification et réinitialisation du mot de passe

Les routes d’authentification n’acceptent que `application/json`, refusent les paramètres de requête et limitent le corps à 8 Kio. Les adresses e-mail sont normalisées en minuscules. Les nouveaux mots de passe doivent contenir au moins 12 caractères, au plus 72 octets UTF-8 et être différents du mot de passe actuel.

### POST `/api/auth/forgot-password`

Endpoint public qui demande l’envoi d’un code numérique à huit chiffres. Le code est conservé sous forme de HMAC, expire après 10 minutes et tout nouveau code invalide le précédent.

```json
{
  "email": "admin@example.com"
}
```

Une requête acceptée renvoie toujours HTTP `202`, que le compte existe ou non, afin de ne pas permettre l’énumération des comptes :

```json
{
  "success": true,
  "message": "If an account exists for that email, a reset code has been sent."
}
```

Les limites sont persistées dans MongoDB : 3 demandes par e-mail et par heure, 5 par adresse réseau et par 15 minutes, avec un délai de 60 secondes entre deux demandes pour un même e-mail. Une limite ou un délai lié à l’e-mail conserve la réponse générique HTTP `202` sans envoyer de nouveau code ; seule la limite réseau renvoie HTTP `429` avec `Retry-After` et `retryAfterSeconds`. Une configuration SMTP ou de sécurité absente renvoie HTTP `503` sans révéler l’existence du compte.

### POST `/api/auth/reset-password`

Endpoint public qui consomme le code en une seule transaction :

```json
{
  "email": "admin@example.com",
  "code": "00123456",
  "password": "<new-password-of-at-least-12-characters>",
  "passwordConfirmation": "<same-new-password>"
}
```

Une réussite renvoie HTTP `200` :

```json
{
  "success": true,
  "message": "Password reset successfully. Please sign in again."
}
```

Le code devient inutilisable, les autres challenges actifs du compte sont invalidés et la modification du mot de passe incrémente `authVersion`. Les JWT HS256 sont liés à l’émetteur `nazra-api`, à l’audience `nazra-admin` et doivent contenir un `authVersion` entier correspondant à celui du compte ; les anciens JWT sont donc refusés après la rotation obligatoire de `JWT_SECRET`. Le code accepte au plus cinq essais incorrects. La route est en outre limitée à 10 requêtes par e-mail et 20 par adresse réseau sur 15 minutes.

Une validation incorrecte renvoie HTTP `400` avec `{ success, message, errors }`. Un code absent, invalide, expiré, déjà utilisé ou ayant épuisé ses essais renvoie le message générique `Invalid or expired reset code.`. Réutiliser le mot de passe actuel renvoie également HTTP `400`. Ne jamais journaliser les codes, mots de passe, JWT ou peppers.

### Administration des comptes

`POST /api/auth/register` et `GET /api/auth/users` exigent `Authorization: Bearer <token>` et le rôle backend `superadmin`. La liste ne projette que `_id`, `name`, `email` et `role` ; les hashes de mots de passe et `authVersion` ne sont jamais exposés. L’interface peut masquer ces actions, mais le contrôle du rôle côté serveur reste la source de vérité.

Le frontend supprime son stockage d’authentification local après un reset réussi. Les copies résiduelles du JWT sur d’autres navigateurs restent physiquement présentes dans `localStorage`, mais sont rejetées grâce à `authVersion`. `localStorage` reste lisible par tout script exécuté dans l’origine : prévenir les XSS et envisager à terme des cookies `HttpOnly`, `Secure` et `SameSite` pour réduire ce risque.

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

Le reset ajoute également un index unique partiel sur le challenge actif par e-mail et des index TTL sur `PasswordResetChallenge.expiresAt` et `AuthRateLimit.expiresAt`. Avant d’ouvrir le parcours en production, créer et contrôler ces index depuis `backend/` :

```bash
node -e "require('dotenv').config(); const mongoose=require('mongoose'); const User=require('./models/User'); const Challenge=require('./models/PasswordResetChallenge'); const RateLimit=require('./models/AuthRateLimit'); (async()=>{await mongoose.connect(process.env.MONGO_URI); await Promise.all([User.createIndexes(), Challenge.createIndexes(), RateLimit.createIndexes()]); await mongoose.disconnect();})().catch(error=>{console.error(error.message); process.exit(1)})"
```

La suppression TTL de MongoDB est asynchrone : la présence temporaire d’un document expiré ne rend pas son code valide, car l’expiration est aussi vérifiée dans chaque requête. La consommation du code et la mise à jour du compte utilisent `withTransaction`; le déploiement doit donc fournir un replica set MongoDB et autoriser les transactions. Valider ces deux prérequis sur une base de préproduction avant la mise en ligne.

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

L’échec SMTP n’annule pas un message enregistré. Son état interne passe à `failed`; si aucun destinataire n’est configuré, il passe à `skipped`. La notification utilise, dans l’ordre, `CONTACT_EMAIL`, `ADMIN_EMAIL`, `SMTP_USER`, puis l’alias historique `EMAIL_USER`. L’expéditeur peut être défini avec `EMAIL_FROM`; `SMTP_HOST`, `SMTP_PORT` et `SMTP_SECURE` sont facultatifs et conservent Gmail/465 comme valeurs compatibles avec la configuration historique. Les valeurs fournies par le client sont échappées avant insertion dans l’e-mail HTML.

La route applique un délai minimal de 10 secondes entre deux tentatives et une limite de 5 tentatives par fenêtre de 15 minutes. Les compteurs sont en mémoire et utilisent une empreinte éphémère de l’adresse réseau ; aucune adresse IP ni aucun user-agent n’est enregistré dans MongoDB. Sur une infrastructure multi-instance, utiliser à terme un compteur partagé (par exemple Redis) pour une limite globale.

Les routes de lecture, détail et mise à jour des messages ne sont pas exposées. La création et la liste des administrateurs sont désormais réservées au rôle `superadmin` côté serveur ; toute future boîte de réception de contact devra appliquer le même principe de permission explicite.

## Déploiement et gestion des secrets

- Configurer les variables backend dans le gestionnaire de secrets de l’hébergeur, jamais dans le projet frontend ni dans un fichier versionné.
- Utiliser trois valeurs aléatoires indépendantes d’au moins 32 caractères pour `JWT_SECRET`, `PASSWORD_RESET_CODE_PEPPER` et `AUTH_RATE_LIMIT_PEPPER`. Une rotation du JWT déconnecte tous les utilisateurs ; une rotation du pepper des codes invalide les challenges en cours.
- Vérifier l’accès SMTP sortant, l’expéditeur autorisé et les enregistrements SPF, DKIM et DMARC du domaine. Les mots de passe de compte ordinaires ne doivent pas servir d’identifiants SMTP.
- Utiliser un replica set MongoDB, créer les index d’authentification ci-dessus et tester une transaction réelle avant de diriger le trafic de production. Les limites d’authentification sont stockées dans MongoDB et restent donc cohérentes entre plusieurs instances applicatives.
- Définir `TEST_MONGO_URI` vers une base isolée et jetable. Elle ne doit jamais partager un cluster logique, un nom de base ou des identifiants à privilèges élevés avec la production.

Des fichiers d’environnement ont existé dans l’historique Git du projet. Les retirer de l’index ne suffit pas : les responsables de chaque fournisseur doivent révoquer et remplacer les identifiants MongoDB, JWT, Cloudinary, SMTP et SDK concernés, contrôler les journaux d’accès, puis mettre à jour les secrets de déploiement. Le propriétaire du dépôt doit coordonner une réécriture de tout l’historique avec `git filter-repo` ou un outil approuvé, forcer la publication des branches et tags nettoyés, puis demander aux collaborateurs de repartir d’un clone propre. Les forks et clones externes restent hors de ce nettoyage ; toute valeur anciennement versionnée doit être considérée comme compromise.

## Tests

Depuis `backend/`, lancer toutes les suites déclarées par le projet :

```bash
npm test
```

Pour limiter l’exécution au périmètre auth :

```bash
node --test test/authValidation.test.js test/authSecurity.test.js test/authRouteParsing.test.js
```

Ces tests couvrent la validation stricte, le format et le HMAC des codes, les champs sensibles des schémas, les index déclarés, l’échappement du modèle d’e-mail, la révocation par `authVersion`, la projection de la liste et le rôle `superadmin`. Ils ne remplacent pas un test d’intégration contre `TEST_MONGO_URI` sur un replica set : vérifier la création des TTL, la transaction de consommation unique, deux resets concurrents et la persistance des limites entre instances.

Avant une mise en production, tester également avec un transport SMTP de test ou injecté, sans vraie boîte client : e-mail inconnu et réponse générique, code à zéro initial, expiration après 10 minutes, cinq erreurs, code réutilisé, délai de renvoi, réponses `429`, mot de passe inchangé refusé, ancien JWT rejeté et connexion réussie uniquement avec le nouveau mot de passe.

Le frontend ne possède pas de script de tests automatisés. Exécuter dans `frontend/` :

```bash
npm run lint
npm run build
```

### Problèmes courants

- **`DB connection failed`** : vérifier que `MONGO_URI` est défini et que MongoDB est accessible.
- **Reset HTTP `503`** : contrôler les trois secrets d’authentification, `SMTP_USER`, `SMTP_PASS` (ou leurs alias historiques) et l’accès au serveur SMTP.
- **E-mail absent après HTTP `202`** : la réponse est volontairement identique pour un compte inconnu ; pour un compte existant, contrôler le dossier indésirable, l’expéditeur autorisé et les journaux SMTP sans y inscrire le code.
- **HTTP `429`** : respecter `Retry-After` ou `retryAfterSeconds`. Les compteurs sont conservés dans MongoDB et ne sont pas réinitialisés par un redémarrage applicatif.
- **Code invalide ou expiré** : utiliser le dernier code reçu dans les 10 minutes ; un nouveau code, cinq erreurs ou une première utilisation réussie invalident le précédent.
- **Transaction non prise en charge** : démarrer MongoDB en replica set et vérifier que `MONGO_URI` cible bien ce déploiement.
- **HTTP `400` après ajout d’un filtre** : vérifier son nom exact ; les paramètres inconnus sont volontairement rejetés.
- **Facettes absentes** : fournir `page` et `include=filters` (ou `include=facets`/`facets=true`).
- **HTTP `401` sur une mutation** : fournir un Bearer token valide et vérifier `JWT_SECRET`; après un reset, se reconnecter pour obtenir un JWT portant le nouvel `authVersion`.
- **Tri, filtres ou reset lents après déploiement** : créer les index déclarés par les schémas avec les commandes ci-dessus.
