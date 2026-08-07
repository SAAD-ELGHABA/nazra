/**
 * Homepage customer reviews — PLACEHOLDER CONTENT.
 *
 * ⚠️  These are mock reviews used to dress the homepage before real verified
 *     reviews exist. Two rules keep this safe:
 *
 *     1. They are NEVER used to generate Review / AggregateRating JSON-LD.
 *        Product schema in ProductPage.jsx still reads only real API ratings.
 *        Publishing fake structured data is a Google manual-action risk.
 *     2. Replace `CUSTOMER_REVIEWS` with the real reviews endpoint as soon as
 *        you have verified orders. The component reads this array only — swap
 *        the source and nothing else changes.
 *
 * Each entry carries its copy in the three storefront languages so the wall
 * reads naturally whichever language the visitor is browsing in.
 */

export const CUSTOMER_REVIEWS = [
  {
    id: "r1",
    name: "Yasmine B.",
    city: { fr: "Marrakech", en: "Marrakech", ar: "مراكش" },
    rating: 5,
    product: "Noir Eclipse",
    text: {
      fr: "Reçues en deux jours à Marrakech. La monture est légère et la finition fait vraiment haut de gamme pour le prix. J'ai payé à la livraison, aucun souci.",
      en: "Arrived in two days in Marrakech. The frame is light and the finish genuinely feels high-end for the price. I paid on delivery, no issues at all.",
      ar: "وصلت في يومين إلى مراكش. الإطار خفيف والتشطيب راقٍ فعلاً مقارنة بالثمن. دفعت عند الاستلام بدون أي مشكل.",
    },
  },
  {
    id: "r2",
    name: "Anas E.",
    city: { fr: "Casablanca", en: "Casablanca", ar: "الدار البيضاء" },
    rating: 5,
    product: "Atlas Gold",
    text: {
      fr: "Je cherchais une paire sobre pour le bureau et les week-ends. Celle-ci passe partout. Le service WhatsApp m'a aidé à choisir la bonne taille.",
      en: "I wanted one understated pair for the office and weekends. This one works everywhere. The WhatsApp team helped me pick the right size.",
      ar: "كنت أبحث عن نظارة بسيطة للعمل ولعطلة نهاية الأسبوع. هذه تناسب كل المناسبات. فريق واتساب ساعدني في اختيار المقاس المناسب.",
    },
  },
  {
    id: "r3",
    name: "Salma R.",
    city: { fr: "Rabat", en: "Rabat", ar: "الرباط" },
    rating: 4,
    product: "Sahara Amber",
    text: {
      fr: "Très jolies, exactement la couleur des photos. Un demi-point en moins parce que j'aurais aimé un étui rigide, mais je recommande.",
      en: "Really pretty, exactly the colour shown in the photos. Half a point off because I'd have liked a hard case, but I do recommend them.",
      ar: "جميلة جداً، ونفس اللون الظاهر في الصور. نقطة ناقصة لأنني كنت أتمنى علبة صلبة، لكنني أنصح بها.",
    },
  },
  {
    id: "r4",
    name: "Mehdi T.",
    city: { fr: "Marrakech", en: "Marrakech", ar: "مراكش" },
    rating: 5,
    product: "Medina Noir",
    text: {
      fr: "Le confort est le vrai point fort : je les porte toute la journée sans douleur au nez. Rien à voir avec ma paire précédente.",
      en: "Comfort is the real strength here: I wear them all day with no pressure on my nose. Nothing like my previous pair.",
      ar: "الراحة هي النقطة الأقوى: ألبسها طوال اليوم بدون أي ضغط على الأنف. لا تُقارن بنظارتي السابقة.",
    },
  },
  {
    id: "r5",
    name: "Imane K.",
    city: { fr: "Tanger", en: "Tangier", ar: "طنجة" },
    rating: 5,
    product: "Cobalt Wave",
    text: {
      fr: "Commandé un dimanche soir, livré mardi matin. Emballage soigné et la personne au téléphone était très correcte.",
      en: "Ordered on a Sunday evening, delivered Tuesday morning. Careful packaging, and the person on the phone was very courteous.",
      ar: "طلبتها مساء الأحد ووصلت صباح الثلاثاء. التغليف متقن والشخص الذي اتصل بي كان لطيفاً جداً.",
    },
  },
  {
    id: "r6",
    name: "Omar Z.",
    city: { fr: "Agadir", en: "Agadir", ar: "أكادير" },
    rating: 5,
    product: "Dune Tortoise",
    text: {
      fr: "À Agadir le soleil tape fort, et là je ne plisse plus les yeux en conduisant. C'est exactement ce que je voulais.",
      en: "The sun is harsh in Agadir, and I've stopped squinting while driving. Exactly what I was after.",
      ar: "الشمس قوية في أكادير، والآن لم أعد أضيّق عينيّ أثناء القيادة. هذا بالضبط ما كنت أريده.",
    },
  },
  {
    id: "r7",
    name: "Nour H.",
    city: { fr: "Fès", en: "Fez", ar: "فاس" },
    rating: 4,
    product: "Ivory Sand",
    text: {
      fr: "Design vraiment élégant et le prix est honnête. La livraison a pris un jour de plus que prévu, mais on m'a prévenue.",
      en: "Genuinely elegant design and the price is fair. Delivery took one extra day, but they let me know in advance.",
      ar: "تصميم أنيق حقاً والثمن معقول. التوصيل تأخر يوماً واحداً، لكنهم أخبروني مسبقاً.",
    },
  },
  {
    id: "r8",
    name: "Karim A.",
    city: { fr: "Marrakech", en: "Marrakech", ar: "مراكش" },
    rating: 5,
    product: "Atlas Gold",
    text: {
      fr: "Deuxième commande chez NAZRA. La première paire a tenu tout l'été sans une rayure, donc j'ai repris une autre couleur.",
      en: "Second order from NAZRA. The first pair survived the whole summer without a scratch, so I went back for another colour.",
      ar: "الطلب الثاني من نَظرة. النظارة الأولى صمدت طوال الصيف بدون أي خدش، لذلك اشتريت لوناً آخر.",
    },
  },
  {
    id: "r9",
    name: "Hajar M.",
    city: { fr: "Meknès", en: "Meknes", ar: "مكناس" },
    rating: 5,
    product: "Noir Eclipse",
    text: {
      fr: "Payer à la livraison m'a rassurée pour une première commande en ligne. Le produit correspond à la description.",
      en: "Paying on delivery reassured me for a first online order. The product matches the description.",
      ar: "الدفع عند الاستلام طمأنني في أول طلب لي عبر الإنترنت. المنتج مطابق للوصف.",
    },
  },
  {
    id: "r10",
    name: "Reda F.",
    city: { fr: "Marrakech", en: "Marrakech", ar: "مراكش" },
    rating: 5,
    product: "Medina Noir",
    text: {
      fr: "Offertes à ma sœur pour son anniversaire, elle ne les quitte plus. Le rendu est bien plus premium que sur les photos.",
      en: "Bought them for my sister's birthday and she hasn't taken them off since. They look far more premium in person.",
      ar: "أهديتها لأختي في عيد ميلادها ولم تعد تخلعها. تبدو أفخم بكثير على أرض الواقع مقارنة بالصور.",
    },
  },
  {
    id: "r11",
    name: "Chaimae L.",
    city: { fr: "Oujda", en: "Oujda", ar: "وجدة" },
    rating: 4,
    product: "Cobalt Wave",
    text: {
      fr: "Bonne qualité et forme qui va bien à un visage rond. J'aurais aimé plus de choix de couleurs sur ce modèle.",
      en: "Good quality and a shape that suits a round face. I'd have liked more colour options on this model.",
      ar: "جودة جيدة وشكل يناسب الوجه المستدير. كنت أتمنى خيارات ألوان أكثر لهذا الموديل.",
    },
  },
  {
    id: "r12",
    name: "Youssef B.",
    city: { fr: "Essaouira", en: "Essaouira", ar: "الصويرة" },
    rating: 5,
    product: "Dune Tortoise",
    text: {
      fr: "Solides face au vent et au sable d'Essaouira. Après deux mois, elles sont comme neuves.",
      en: "They hold up against the wind and sand in Essaouira. Two months in, they still look new.",
      ar: "صامدة أمام رياح ورمال الصويرة. بعد شهرين، ما زالت كأنها جديدة.",
    },
  },
];

/** Resolve a review to a single language, falling back to French. */
export const localizeReview = (review, language) => {
  const lang = ["fr", "en", "ar"].includes(language) ? language : "fr";
  return {
    ...review,
    city: review.city[lang] || review.city.fr,
    text: review.text[lang] || review.text.fr,
  };
};
