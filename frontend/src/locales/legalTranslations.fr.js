/**
 * French legal copy.
 *
 * Grounded in Moroccan law:
 * - Loi n° 09-08 (protection des données à caractère personnel) and the CNDP.
 * - Loi n° 31-08 (protection du consommateur), art. 36: 7 clear days of
 *   withdrawal for distance selling, refund within 30 days.
 *
 * The commercial 14-day exchange sits on top of the 7-day legal minimum; the
 * two are stated separately on purpose. Figures interpolate from SITE_CONFIG.
 */
export const legalFr = {
  eyebrow: "Informations légales",
  updated: "Dernière mise à jour : {{date}}",
  toc: "Sommaire",
  tocLabel: "Sommaire du document",
  identity: "Éditeur du site",
  identityFields: {
    companyName: "Dénomination",
    legalForm: "Forme juridique",
    address: "Siège",
    rc: "Registre de commerce",
    ice: "ICE",
    if: "Identifiant fiscal",
    cndpDeclaration: "Déclaration CNDP",
  },
  contactTitle: "Une question sur ce document ?",
  contactCopy:
    "Écrivez-nous : nous répondons à toute demande relative à vos données, à une commande ou à ces conditions dans un délai raisonnable.",
  contactCta: "Nous contacter",
  related: "Autres documents",
  relatedLabel: "Documents liés",
  returnsPolicy: "Politique de retour",

  /* ─────────────────────────── CONFIDENTIALITÉ ─────────────────────────── */
  privacy: {
    seoTitle: "Politique de confidentialité | {{brand}}",
    seoDescription:
      "Comment {{brand}} collecte, utilise et protège vos données personnelles, conformément à la loi marocaine 09-08. Vos droits d'accès, de rectification et d'opposition.",
    title: "Politique de confidentialité",
    intro:
      "Cette politique explique quelles données personnelles {{brand}} collecte lorsque vous visitez {{site}} ou passez commande, pourquoi nous les collectons, combien de temps nous les conservons et comment exercer vos droits. Elle s'inscrit dans le cadre de la loi n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.",
    sections: [
      {
        id: "responsable",
        heading: "Responsable du traitement",
        paragraphs: [
          "{{brand}} exploite la boutique en ligne accessible à l'adresse {{site}} et détermine les finalités et les moyens des traitements décrits ci-dessous.",
          "Pour toute question relative à vos données personnelles, vous pouvez nous joindre par e-mail à {{email}} ou par téléphone au {{phone}}.",
        ],
      },
      {
        id: "donnees",
        heading: "Données que nous collectons",
        paragraphs: [
          "Nous appliquons un principe de minimisation : nous ne demandons que ce qui est nécessaire pour traiter votre commande et vous répondre.",
        ],
        bullets: [
          "Données de commande : nom et prénom, numéro de téléphone, ville, adresse de livraison, contenu du panier et adresse e-mail lorsqu'elle est renseignée.",
          "Données de contact : les informations que vous saisissez dans le formulaire de contact ou que vous nous transmettez par WhatsApp.",
          "Données d'inscription à la newsletter : votre adresse e-mail, uniquement si vous vous inscrivez volontairement.",
          "Données de navigation : un identifiant de visite aléatoire stocké dans votre navigateur, ainsi que les pages et fiches produit consultées, à des fins de mesure d'audience.",
          "Données de compte administrateur : réservées à notre équipe interne, elles ne concernent pas les clients de la boutique.",
        ],
      },
      {
        id: "finalites",
        heading: "Pourquoi nous les utilisons",
        bullets: [
          "Traiter, confirmer, préparer et livrer votre commande.",
          "Vous appeler pour valider l'adresse et le modèle avant expédition.",
          "Gérer les échanges, retours et réclamations éventuelles.",
          "Répondre à vos messages et demandes de conseil.",
          "Vous envoyer nos actualités, uniquement si vous vous êtes inscrit à la newsletter.",
          "Comprendre l'usage du site de façon agrégée afin d'améliorer le catalogue et le parcours d'achat.",
        ],
      },
      {
        id: "fondement",
        heading: "Fondement du traitement",
        paragraphs: [
          "Le traitement de vos données de commande repose sur l'exécution du contrat de vente que vous concluez avec nous. L'envoi de communications commerciales repose sur votre consentement, que vous pouvez retirer à tout moment. La mesure d'audience repose sur notre intérêt légitime à faire fonctionner et améliorer la boutique.",
        ],
      },
      {
        id: "partage",
        heading: "Qui a accès à vos données",
        paragraphs: [
          "Nous ne vendons pas vos données personnelles et nous ne les louons à personne. Elles sont accessibles aux membres de notre équipe qui en ont besoin, ainsi qu'aux prestataires techniques suivants, agissant pour notre compte :",
        ],
        bullets: [
          "Les transporteurs partenaires chargés de la livraison, qui reçoivent votre nom, votre téléphone et votre adresse.",
          "Notre hébergeur d'infrastructure et notre base de données, qui stockent les informations de commande.",
          "Notre service d'hébergement d'images, utilisé pour les visuels du catalogue.",
          "Notre service d'envoi d'e-mails transactionnels et de newsletter.",
        ],
      },
      {
        id: "conservation",
        heading: "Durée de conservation",
        paragraphs: [
          "Les données de commande sont conservées le temps nécessaire au traitement de la commande, puis pendant la durée requise par les obligations comptables et fiscales applicables. Les messages de contact sont conservés le temps de traiter votre demande. Votre inscription à la newsletter est conservée jusqu'à votre désinscription. Les données de navigation sont conservées sous forme agrégée.",
        ],
      },
      {
        id: "securite",
        heading: "Sécurité",
        paragraphs: [
          "Le site est servi en HTTPS. Les accès à l'espace d'administration sont protégés par mot de passe et par un système d'autorisations limitant chaque membre de l'équipe aux seules fonctions dont il a besoin. Aucun système n'étant infaillible, nous ne pouvons garantir une sécurité absolue, mais nous nous engageons à traiter tout incident sans délai et à vous en informer lorsque cela est requis.",
        ],
      },
      {
        id: "paiement",
        heading: "Paiement à la livraison",
        paragraphs: [
          "Nos commandes sont réglées en espèces au moment de la livraison. Nous ne collectons donc aucune donnée bancaire : ni numéro de carte, ni RIB, ni identifiant de paiement. Si un tiers vous demande ces informations en notre nom, il ne s'agit pas de nous.",
        ],
      },
      {
        id: "droits",
        heading: "Vos droits",
        paragraphs: [
          "Conformément à la loi n° 09-08, vous disposez d'un droit d'accès, de rectification et d'opposition au traitement de vos données personnelles. Vous pouvez également vous opposer, sans frais, à l'utilisation de vos données à des fins de prospection commerciale.",
          "Pour exercer ces droits, écrivez-nous à {{email}} en précisant votre demande. Nous y répondons dans un délai raisonnable. Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP).",
        ],
      },
      {
        id: "cookies",
        heading: "Cookies et stockage local",
        paragraphs: [
          "Le site utilise le stockage local de votre navigateur pour des fonctions essentielles, sans lesquelles la boutique ne fonctionnerait pas correctement :",
        ],
        bullets: [
          "Le contenu de votre panier et de vos favoris, afin de les retrouver d'une visite à l'autre.",
          "Votre langue d'affichage préférée.",
          "Votre choix en matière de cookies, ainsi que sa date, afin de ne pas vous le redemander à chaque visite.",
          "Un jeton de session, uniquement pour les membres de l'équipe connectés à l'administration.",
        ],
      },
      {
        id: "cookies-choix",
        heading: "Vos choix en matière de traceurs",
        paragraphs: [
          "La mesure d'audience repose sur un identifiant de visite aléatoire et non nominatif. Elle n'est pas essentielle : elle n'est activée que si vous l'acceptez, et l'identifiant n'est créé qu'à ce moment-là. Si vous refusez, il n'existe pas ; si vous retirez votre accord, il est supprimé de votre navigateur.",
          "Vous pouvez modifier ou retirer votre consentement à tout moment via le lien « Préférences cookies » présent en bas de chaque page. Le détail de chaque traceur figure dans notre politique de cookies.",
        ],
      },
      {
        id: "mineurs",
        heading: "Mineurs",
        paragraphs: [
          "La boutique s'adresse à des personnes majeures. Nous ne collectons pas sciemment de données concernant des mineurs. Si vous constatez qu'un mineur nous a transmis des données, écrivez-nous et nous les supprimerons.",
        ],
      },
      {
        id: "modifications",
        heading: "Modifications de cette politique",
        paragraphs: [
          "Nous pouvons faire évoluer cette politique, notamment pour tenir compte de changements techniques ou réglementaires. La date de dernière mise à jour figure en haut de cette page. En cas de modification substantielle, nous en informerons nos clients par les moyens appropriés.",
        ],
      },
    ],
  },

  /* ────────────────────────── CONDITIONS D'UTILISATION ────────────────────────── */
  termsOfUse: {
    seoTitle: "Conditions d'utilisation | {{brand}}",
    seoDescription:
      "Règles d'accès et d'utilisation du site {{site}} : usage autorisé, propriété intellectuelle, avis clients, responsabilité et droit applicable.",
    title: "Conditions d'utilisation",
    intro:
      "Ces conditions encadrent l'accès au site {{site}} et son utilisation. Elles portent sur le site lui-même. Les règles applicables à l'achat d'un produit figurent dans nos conditions générales de vente.",
    sections: [
      {
        id: "objet",
        heading: "Objet",
        paragraphs: [
          "Le présent document définit les règles d'accès et d'utilisation du site {{site}}, édité par {{brand}}. En naviguant sur le site, vous acceptez ces conditions. Si vous ne les acceptez pas, nous vous invitons à ne pas utiliser le site.",
        ],
      },
      {
        id: "acces",
        heading: "Accès au site",
        paragraphs: [
          "L'accès au site est libre et gratuit. Les frais de connexion et d'équipement restent à votre charge. Nous nous efforçons de maintenir le site accessible en permanence, sans pouvoir le garantir : une interruption peut survenir pour maintenance, mise à jour ou pour une cause indépendante de notre volonté.",
        ],
      },
      {
        id: "usage",
        heading: "Usage autorisé",
        paragraphs: ["Vous vous engagez à utiliser le site de bonne foi et à vous abstenir notamment de :"],
        bullets: [
          "Tenter d'accéder à des espaces réservés, notamment l'administration, sans autorisation.",
          "Perturber le fonctionnement du site, le surcharger de requêtes automatisées ou en extraire massivement le contenu.",
          "Passer des commandes fictives ou fournir volontairement des coordonnées erronées.",
          "Publier un contenu illicite, injurieux, trompeur ou portant atteinte aux droits d'un tiers.",
          "Utiliser le site à des fins contraires à la législation marocaine en vigueur.",
        ],
      },
      {
        id: "propriete",
        heading: "Propriété intellectuelle",
        paragraphs: [
          "La marque {{brand}}, le logo, les textes, les photographies, les vidéos, la charte graphique et la structure du site sont protégés. Toute reproduction, représentation ou exploitation, totale ou partielle, sans autorisation écrite préalable, est interdite.",
          "Vous pouvez librement partager un lien vers une page du site. En revanche, la réutilisation de nos visuels produits à des fins commerciales, y compris pour revendre des articles, n'est pas autorisée.",
        ],
      },
      {
        id: "avis",
        heading: "Avis et contenus déposés par les utilisateurs",
        paragraphs: [
          "Si vous déposez un avis ou un contenu sur le site, vous garantissez qu'il est le vôtre, qu'il reflète une expérience réelle et qu'il ne porte atteinte à aucun droit. Nous pouvons refuser ou retirer un contenu manifestement faux, injurieux, hors sujet ou publié dans le but de nuire.",
          "En publiant un contenu, vous nous autorisez à l'afficher sur le site et dans nos communications relatives au produit concerné.",
        ],
      },
      {
        id: "liens",
        heading: "Liens et services tiers",
        paragraphs: [
          "Le site renvoie vers des services tiers, notamment WhatsApp et nos réseaux sociaux. Ces services ont leurs propres conditions et politiques de confidentialité, sur lesquelles nous n'avons aucun contrôle. Nous vous invitons à en prendre connaissance.",
        ],
      },
      {
        id: "informations",
        heading: "Exactitude des informations",
        paragraphs: [
          "Nous apportons le plus grand soin aux descriptions, photographies et disponibilités affichées. Des écarts de rendu des couleurs peuvent néanmoins exister d'un écran à l'autre, et une erreur ponctuelle reste possible. En cas d'erreur manifeste sur un prix ou une caractéristique, nous vous en informons avant l'expédition et vous pouvez annuler sans frais.",
        ],
      },
      {
        id: "responsabilite",
        heading: "Responsabilité",
        paragraphs: [
          "Nous ne pouvons être tenus responsables d'un dommage indirect résultant de l'utilisation du site, tel qu'une perte de données ou un manque à gagner. Cette limitation ne s'applique pas à nos obligations légales envers les consommateurs, ni en cas de faute lourde ou intentionnelle.",
        ],
      },
      {
        id: "droit",
        heading: "Droit applicable et différends",
        paragraphs: [
          "Ces conditions sont régies par le droit marocain. En cas de différend, nous vous invitons à nous contacter en premier lieu afin de rechercher une solution amiable. À défaut d'accord, le litige relève des juridictions marocaines compétentes.",
        ],
      },
      {
        id: "evolution",
        heading: "Évolution des conditions",
        paragraphs: [
          "Nous pouvons modifier ces conditions à tout moment. La version applicable est celle publiée sur cette page au moment de votre visite. La date de dernière mise à jour est indiquée en haut du document.",
        ],
      },
    ],
  },

  /* ──────────────────── CONDITIONS GÉNÉRALES DE VENTE ──────────────────── */
  terms: {
    seoTitle: "Conditions générales de vente | {{brand}}",
    seoDescription:
      "CGV {{brand}} : commande, prix en dirhams, paiement à la livraison, délais de livraison, droit de rétractation de {{withdrawalDays}} jours et échange sous {{returnDays}} jours.",
    title: "Conditions générales de vente",
    intro:
      "Ces conditions régissent toute commande passée sur {{site}}. Elles précisent le déroulement de la commande, les prix, le paiement à la livraison, les délais, ainsi que vos droits de rétractation et d'échange. Passer commande implique leur acceptation.",
    sections: [
      {
        id: "objet",
        heading: "Objet et vendeur",
        paragraphs: [
          "{{brand}} vend des lunettes de soleil et de vue à distance, à destination de clients situés au Maroc, via le site {{site}} et via WhatsApp au {{phone}}.",
          "Ces conditions s'appliquent à l'exclusion de toute autre. Elles sont accessibles à tout moment sur cette page et vous pouvez les enregistrer ou les imprimer.",
        ],
      },
      {
        id: "produits",
        heading: "Produits et disponibilité",
        paragraphs: [
          "Chaque fiche produit indique le modèle, les coloris proposés, le prix et la disponibilité au moment de la consultation. Les caractéristiques propres à un modèle, y compris celles de ses verres, figurent sur sa fiche : elles ne sont pas généralisées à l'ensemble du catalogue.",
          "Les stocks évoluant en continu, la disponibilité est confirmée définitivement lors de notre appel de confirmation. Si un article s'avère indisponible, nous vous proposons un coloris équivalent, un autre modèle ou l'annulation sans frais.",
        ],
      },
      {
        id: "prix",
        heading: "Prix",
        paragraphs: [
          "Les prix sont indiqués en dirhams marocains (MAD), toutes taxes comprises. Les éventuels frais de livraison applicables à votre commande sont affichés dans le récapitulatif avant validation.",
          "Le montant que vous réglez au livreur est celui affiché lors de la validation de la commande. Aucun supplément n'est ajouté au moment de la remise du colis. Nous pouvons modifier nos prix à tout moment, sans effet sur les commandes déjà confirmées.",
        ],
      },
      {
        id: "commande",
        heading: "Passation de la commande",
        paragraphs: ["La commande se déroule en quatre étapes :"],
        bullets: [
          "Vous sélectionnez le modèle, le coloris et la quantité souhaités, puis vous validez votre panier.",
          "Vous renseignez vos coordonnées de livraison : nom, téléphone, ville et adresse.",
          "Un membre de notre équipe vous appelle pour confirmer l'adresse et le modèle. La vente est réputée conclue à cette confirmation.",
          "Le colis est préparé puis remis au transporteur.",
        ],
      },
      {
        id: "annulation",
        heading: "Modification et annulation avant expédition",
        paragraphs: [
          "Tant que le colis n'est pas expédié, vous pouvez modifier ou annuler votre commande sans frais et sans justification, en nous appelant ou en nous écrivant sur WhatsApp au {{phone}}.",
        ],
      },
      {
        id: "paiement",
        heading: "Paiement à la livraison",
        paragraphs: [
          "Le paiement s'effectue en espèces, au moment où le livreur vous remet le colis. Aucune avance, aucun acompte et aucune donnée bancaire ne sont demandés lors de la commande.",
          "Avant de payer, vous pouvez ouvrir le colis et vérifier que le modèle, le coloris et l'état correspondent à votre commande. Si ce n'est pas le cas, vous pouvez refuser le colis.",
        ],
      },
      {
        id: "livraison",
        heading: "Livraison",
        paragraphs: [
          "Nous livrons dans toutes les villes du Maroc. Le délai indicatif est de {{deliveryDays}} jours ouvrés à compter de l'appel de confirmation. Ce délai peut être allongé pour les zones éloignées ou en période de forte demande.",
          "Le livreur vous contacte au numéro communiqué lors de la commande. En cas d'absence ou de numéro injoignable, le transporteur effectue de nouvelles tentatives selon ses procédures. Une commande restée non réclamée nous est retournée et peut être annulée.",
          "Il vous appartient de fournir une adresse et un numéro de téléphone exacts. Nous ne pouvons être tenus responsables d'un retard imputable à des coordonnées erronées.",
        ],
      },
      {
        id: "retractation",
        heading: "Droit de rétractation",
        paragraphs: [
          "Conformément à la loi n° 31-08 édictant des mesures de protection du consommateur, vous disposez d'un délai de rétractation de {{withdrawalDays}} jours francs à compter de la réception du produit, sans avoir à justifier de motif ni à payer de pénalité.",
          "Pour exercer ce droit, informez-nous par e-mail à {{email}} ou par WhatsApp au {{phone}} en indiquant votre numéro de commande. Le produit doit nous être restitué complet, dans son état d'origine et avec son emballage. Le remboursement des sommes versées intervient dans un délai maximum de {{refundDays}} jours suivant la rétractation.",
        ],
      },
      {
        id: "echange",
        heading: "Échange commercial sous {{returnDays}} jours",
        paragraphs: [
          "Au-delà du délai légal, et à titre commercial, {{brand}} accepte les demandes d'échange formulées dans les {{returnDays}} jours suivant la réception, sous réserve que la monture soit intacte, non rayée, non portée à l'extérieur, et accompagnée de son emballage et de ses accessoires d'origine.",
          "Cette facilité s'ajoute à vos droits légaux et ne les remplace pas. Les montures endommagées par une chute, une rayure ou un usage inadapté ne peuvent pas être reprises à ce titre.",
        ],
      },
      {
        id: "conformite",
        heading: "Produit non conforme ou endommagé",
        paragraphs: [
          "Si le produit reçu ne correspond pas à votre commande, ou s'il présente un défaut à la réception, contactez-nous dans les meilleurs délais avec votre numéro de commande et une photo du produit. Nous organisons à nos frais le remplacement ou le remboursement, selon votre choix et la disponibilité du modèle.",
        ],
      },
      {
        id: "responsabilite",
        heading: "Responsabilité",
        paragraphs: [
          "Notre responsabilité au titre d'une commande ne peut excéder le montant effectivement payé pour celle-ci. Nous ne saurions être tenus responsables d'un manquement imputable à un cas de force majeure, au fait d'un tiers ou à des informations de livraison inexactes fournies par le client.",
        ],
      },
      {
        id: "donnees",
        heading: "Données personnelles",
        paragraphs: [
          "Les données recueillies dans le cadre d'une commande sont traitées conformément à notre politique de confidentialité, dans le respect de la loi n° 09-08. Vous y trouverez le détail de vos droits d'accès, de rectification et d'opposition.",
        ],
      },
      {
        id: "droit",
        heading: "Droit applicable et différends",
        paragraphs: [
          "Les présentes conditions sont soumises au droit marocain. En cas de difficulté, contactez-nous d'abord : la grande majorité des situations se règle directement. À défaut de solution amiable, le litige relève des juridictions marocaines compétentes.",
        ],
      },
    ],
  },

  /* ──────────────────────── POLITIQUE DE COOKIES ──────────────────────── */
  cookiePolicy: {
    seoTitle: "Politique de cookies | {{brand}}",
    seoDescription:
      "Quels cookies et quel stockage local {{brand}} utilise, à quoi ils servent, combien de temps ils sont conservés et comment modifier vos choix à tout moment.",
    title: "Politique de cookies",
    intro:
      "Cette page détaille les traceurs utilisés sur {{site}} : ce qu'ils font, pourquoi ils existent et comment refuser ou retirer votre consentement. Elle complète notre politique de confidentialité et s'inscrit dans le cadre de la loi n° 09-08.",
    sections: [
      {
        id: "principe",
        heading: "Notre principe",
        paragraphs: [
          "Rien qui ne soit strictement nécessaire n'est déposé avant votre accord. Tant que vous n'avez pas choisi, seules les fonctions indispensables au fonctionnement de la boutique sont actives.",
          "Refuser est aussi simple qu'accepter : les deux boutons sont présentés côte à côte, et vous pouvez revenir sur votre décision à tout moment.",
          "{{brand}} utilise principalement le stockage local de votre navigateur plutôt que des cookies au sens strict. Le principe reste le même et nous les traitons avec les mêmes exigences.",
        ],
      },
      {
        id: "necessaires",
        heading: "Traceurs nécessaires",
        paragraphs: [
          "Ils ne peuvent pas être désactivés : sans eux, la boutique ne fonctionne plus. Ils ne servent ni à la publicité, ni au profilage, et ne sont jamais transmis à un tiers.",
        ],
        bullets: [
          "Panier : conserve les articles sélectionnés d'une page à l'autre et jusqu'à votre prochaine visite.",
          "Favoris : conserve les modèles que vous avez mis de côté.",
          "Langue d'affichage : mémorise si vous naviguez en français, en anglais ou en arabe.",
          "Choix de cookies : mémorise votre décision sur cette page, ainsi que sa date, afin de ne pas vous la redemander à chaque visite.",
          "Session d'administration : uniquement pour les membres de l'équipe {{brand}} connectés à l'espace de gestion. Aucun client n'est concerné.",
        ],
      },
      {
        id: "mesure",
        heading: "Mesure d'audience",
        paragraphs: [
          "Déposée uniquement si vous l'acceptez. Elle repose sur un identifiant de visite aléatoire, généré au moment de votre accord, qui ne contient ni votre nom, ni votre e-mail, ni votre téléphone et ne permet pas de vous identifier.",
          "Elle nous sert à savoir combien de personnes visitent la boutique et quels modèles sont consultés, afin d'améliorer le catalogue. Si vous refusez, cet identifiant n'est jamais créé ; si vous retirez votre accord, il est supprimé de votre navigateur.",
        ],
      },
      {
        id: "marketing",
        heading: "Marketing",
        paragraphs: [
          "Cette catégorie couvre les outils qui mesurent l'efficacité de nos publicités sur les réseaux sociaux et les moteurs de recherche.",
          "À ce jour, aucun outil publicitaire tiers n'est chargé sur {{site}}. Si nous en ajoutons un, il ne se déclenchera qu'après votre acceptation de cette catégorie, et cette page sera mise à jour au préalable.",
        ],
      },
      {
        id: "duree",
        heading: "Durée de conservation",
        paragraphs: [
          "Le stockage local n'a pas de date d'expiration automatique : il reste dans votre navigateur jusqu'à ce que vous le supprimiez, ou que vous retiriez votre consentement pour les catégories concernées.",
          "Votre choix de cookies est conservé avec sa date. Si nous ajoutons un nouveau traceur, votre consentement précédent cesse d'être valable et la demande vous est présentée à nouveau.",
        ],
      },
      {
        id: "gerer",
        heading: "Modifier vos choix",
        paragraphs: [
          "Le lien « Préférences cookies », présent en bas de chaque page, rouvre le panneau de choix. Vos modifications prennent effet immédiatement.",
          "Vous pouvez également vider le stockage local et les cookies depuis les réglages de votre navigateur. Dans ce cas, votre panier, vos favoris et votre choix de langue seront également effacés, et la demande de consentement réapparaîtra.",
        ],
      },
      {
        id: "contact-cookies",
        heading: "Nous contacter",
        paragraphs: [
          "Pour toute question sur cette politique ou sur l'usage de vos données, écrivez-nous à {{email}}. Vous pouvez également saisir la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP).",
        ],
      },
    ],
  },
};
