/**
 * Copy for the /discover page ("Nos engagements").
 *
 * Deliberate constraint: nothing here invents a product specification.
 * Lens category, polarisation and materials are described generically and the
 * reader is sent to the product sheet for the actual value of a given model.
 */
export const discoverTranslations = {
  fr: {
    seoTitle: "Nos engagements | NAZRA Lunettes au Maroc",
    seoDescription:
      "Livraison 1–2 jours ouvrés, paiement à la livraison, échange sous 14 jours. Découvrez les engagements NAZRA, le déroulement d'une commande et le guide des formes de montures.",
    hero: {
      eyebrow: "Nos engagements",
      title: "Acheter des lunettes en ligne, sans mauvaise surprise.",
      lead: "Choisir une monture sur un écran demande de la confiance. Voici précisément comment nous travaillons : ce que nous vous livrons, en combien de temps, ce que vous payez et ce qui se passe si le modèle ne vous va pas.",
      shop: "Voir les modèles",
      contact: "Poser une question",
    },
    stats: {
      delivery: { value: "{{days}} jours", label: "Délai de livraison ouvré" },
      payment: { value: "0 DH", label: "À avancer avant réception" },
      returns: { value: "{{days}} jours", label: "Pour demander un échange" },
      support: { value: "7j/7", label: "Assistance WhatsApp" },
    },
    commitments: {
      eyebrow: "Ce sur quoi nous nous engageons",
      title: "Six engagements, expliqués sans détour.",
      copy: "Pas de promesses vagues. Chaque point ci-dessous décrit une pratique concrète que vous pouvez vérifier lors de votre commande.",
      items: {
        selection: {
          title: "Une sélection restreinte",
          copy: "Nous préférons un catalogue court à un catalogue large. Chaque modèle est retenu pour sa tenue sur le visage, la qualité de ses charnières et la propreté de ses finitions. Si une monture ne nous convainc pas, elle ne rejoint pas la boutique.",
        },
        lenses: {
          title: "Des informations verres claires",
          copy: "La catégorie de verre et les caractéristiques réelles de chaque modèle sont indiquées sur sa fiche produit. Nous n'appliquons pas un argument technique uniforme à tout le catalogue : ce qui est écrit sur une fiche correspond à ce modèle précis.",
        },
        payment: {
          title: "Paiement à la livraison",
          copy: "Vous ne payez rien à la commande. Le règlement se fait en espèces, au moment où le livreur vous remet le colis. Vous pouvez ouvrir la boîte et vérifier le modèle et la couleur avant de payer.",
        },
        delivery: {
          title: "Livraison partout au Royaume",
          copy: "Nous expédions dans toutes les villes du Maroc. Les commandes validées avant 16h partent le jour même. Vous recevez un appel de confirmation avant l'expédition, puis un appel du livreur le jour de la remise.",
        },
        returns: {
          title: "Échange sous {{days}} jours",
          copy: "Si la monture ne vous va pas, contactez-nous dans les {{days}} jours suivant la réception. Le produit doit être dans son état d'origine, non rayé et avec son emballage. Nous organisons l'échange ou le remboursement selon la situation.",
        },
        support: {
          title: "Une équipe locale, joignable",
          copy: "Nous répondons depuis le Maroc, en français, en arabe et en darija. Avant l'achat pour vous aider à choisir une taille, après l'achat si quelque chose ne va pas. Un vrai numéro, pas un formulaire sans réponse.",
        },
      },
    },
    steps: {
      eyebrow: "Le déroulement",
      title: "Une commande, du clic à la remise.",
      copy: "Quatre étapes, aucune carte bancaire nécessaire.",
      items: {
        choose: {
          title: "Vous choisissez",
          copy: "Sélectionnez le modèle, la couleur et vérifiez la disponibilité affichée. En cas d'hésitation entre deux tailles, écrivez-nous sur WhatsApp avant de commander.",
        },
        order: {
          title: "Vous commandez",
          copy: "Via le site ou directement sur WhatsApp. Nous demandons uniquement votre nom, votre téléphone, votre ville et votre adresse. Aucun paiement en ligne.",
        },
        confirm: {
          title: "Nous confirmons",
          copy: "Un membre de l'équipe vous appelle pour valider l'adresse et le modèle. C'est le moment de modifier ou d'annuler sans frais. Le colis part ensuite.",
        },
        receive: {
          title: "Vous recevez et payez",
          copy: "Le livreur vous contacte. Vous vérifiez le contenu du colis, puis vous réglez en espèces. À partir de ce jour, vous disposez de {{days}} jours pour demander un échange.",
        },
      },
    },
    logistics: {
      eyebrow: "Le détail pratique",
      delivery: {
        title: "Livraison",
        rows: {
          zone: { term: "Zones couvertes", detail: "Toutes les villes du Maroc, y compris les zones périurbaines desservies par nos transporteurs partenaires." },
          time: { term: "Délai", detail: "{{days}} jours ouvrés après confirmation téléphonique. Les grandes villes sont généralement livrées plus vite que les zones éloignées." },
          cutoff: { term: "Heure limite", detail: "Les commandes confirmées avant 16h sont préparées le jour même. Après 16h, elles partent le jour ouvré suivant." },
          tracking: { term: "Suivi", detail: "Vous êtes prévenu par téléphone à la confirmation puis par le livreur le jour de la remise." },
        },
      },
      returns: {
        title: "Retours et échanges",
        rows: {
          window: { term: "Délai", detail: "{{days}} jours calendaires à compter de la réception du colis." },
          condition: { term: "État requis", detail: "Monture non rayée, non portée à l'extérieur, avec son emballage et ses accessoires d'origine." },
          how: { term: "Démarche", detail: "Écrivez-nous sur WhatsApp ou via la page contact avec votre numéro de commande. Nous vous indiquons la marche à suivre sous 24h." },
          exclusions: { term: "Limites", detail: "Les montures endommagées par une chute, une rayure ou un usage inadapté ne peuvent pas être reprises." },
        },
      },
      note: "Ces conditions s'appliquent à toute commande passée sur nazra.store. La politique complète est détaillée sur nos pages dédiées.",
      shippingLink: "Informations de livraison",
      returnsLink: "Politique de retour",
    },
    shapes: {
      eyebrow: "Bien choisir",
      title: "Quelle forme pour quel visage ?",
      copy: "Le principe est simple : une monture qui contraste avec la géométrie de votre visage l'équilibre. Ce guide réduit le risque de vous tromper, mais rien ne remplace un essai.",
      recommends: "Formes conseillées",
      items: {
        round: { face: "Visage rond", advice: "Des lignes anguleuses structurent les traits et allongent visuellement le visage.", frames: "Rectangulaire, carrée, œil-de-chat" },
        square: { face: "Visage carré", advice: "Des courbes adoucissent une mâchoire marquée et équilibrent le front.", frames: "Ronde, ovale, aviateur" },
        oval: { face: "Visage ovale", advice: "Les proportions équilibrées acceptent presque toutes les formes. Gardez une largeur proche de celle du visage.", frames: "Presque toutes" },
        heart: { face: "Visage en cœur", advice: "Une monture plus large en bas rééquilibre un front plus large que le menton.", frames: "Aviateur, ronde, sans cerclage bas" },
      },
      tip: "Astuce : mesurez la largeur de votre visage d'une tempe à l'autre, puis comparez-la à la largeur totale indiquée sur la fiche produit.",
    },
    faq: {
      eyebrow: "Questions fréquentes",
      title: "Les réponses aux questions qu'on nous pose le plus.",
      items: [
        { q: "Dois-je payer quelque chose avant de recevoir ma commande ?", a: "Non. Le paiement à la livraison est notre mode de règlement principal : vous payez en espèces au livreur, après avoir vérifié le contenu du colis. Aucune avance, aucune carte bancaire." },
        { q: "En combien de temps serai-je livré ?", a: "Comptez {{deliveryDays}} jours ouvrés après l'appel de confirmation. Les commandes validées avant 16h sont préparées le jour même. Les délais peuvent s'allonger légèrement pour les zones éloignées ou pendant les périodes de forte demande." },
        { q: "La livraison est-elle payante ?", a: "Les frais applicables à votre commande sont affichés dans le récapitulatif avant validation. Nous n'ajoutons jamais de montant au moment de la remise du colis : le prix annoncé est celui que vous payez au livreur." },
        { q: "Puis-je essayer les lunettes avant de payer ?", a: "Vous pouvez ouvrir le colis et vérifier le modèle, la couleur et l'état de la monture devant le livreur avant de régler. Si le produit ne correspond pas à votre commande, vous pouvez le refuser." },
        { q: "Que faire si la monture ne me va pas ?", a: "Contactez-nous dans les {{days}} jours suivant la réception, par WhatsApp ou via la page contact, avec votre numéro de commande. La monture doit être dans son état d'origine. Nous organisons alors l'échange ou le remboursement." },
        { q: "Comment savoir si la taille me conviendra ?", a: "Chaque fiche produit indique les dimensions de la monture. Comparez-les à la largeur de votre visage, ou à une paire que vous portez déjà. En cas de doute, envoyez-nous une photo de face sur WhatsApp : nous vous orientons." },
        { q: "Les verres protègent-ils du soleil ?", a: "Les caractéristiques des verres sont précisées sur la fiche de chaque modèle. Nous ne communiquons pas de spécification générique valable pour tout le catalogue : référez-vous à la fiche du modèle qui vous intéresse." },
        { q: "Puis-je commander directement sur WhatsApp ?", a: "Oui. Envoyez-nous le nom ou la photo du modèle, votre ville et votre téléphone. Nous vérifions la disponibilité et enregistrons la commande pour vous. Le paiement reste à la livraison." },
      ],
    },
    cta: {
      title: "Prêt à choisir votre monture ?",
      copy: "Parcourez le catalogue, ou écrivez-nous si vous préférez être guidé.",
      shop: "Découvrir la collection",
      whatsapp: "Demander conseil",
      message: "Bonjour NAZRA, j'ai lu vos engagements et j'aimerais un conseil pour choisir une monture.",
    },
  },

  en: {
    seoTitle: "Our commitments | NAZRA Eyewear Morocco",
    seoDescription:
      "Delivery in 1–2 business days, cash on delivery, 14-day exchange. Read the NAZRA commitments, how an order works, and our frame shape guide.",
    hero: {
      eyebrow: "Our commitments",
      title: "Buying eyewear online, without the bad surprises.",
      lead: "Choosing a frame on a screen takes trust. Here is exactly how we work: what we deliver, how long it takes, what you pay, and what happens if the frame doesn't suit you.",
      shop: "Browse the frames",
      contact: "Ask a question",
    },
    stats: {
      delivery: { value: "{{days}} days", label: "Business-day delivery" },
      payment: { value: "0 DH", label: "Paid before you receive it" },
      returns: { value: "{{days}} days", label: "To request an exchange" },
      support: { value: "7 days", label: "WhatsApp support a week" },
    },
    commitments: {
      eyebrow: "What we commit to",
      title: "Six commitments, explained plainly.",
      copy: "No vague promises. Each point below describes a concrete practice you can verify when you order.",
      items: {
        selection: {
          title: "A deliberately short catalogue",
          copy: "We would rather carry few frames than many. Each model is kept for how it sits on the face, the quality of its hinges and the cleanliness of its finish. If a frame doesn't convince us, it doesn't reach the shop.",
        },
        lenses: {
          title: "Clear lens information",
          copy: "The lens category and real characteristics of each model are listed on its product page. We don't apply one technical claim across the whole catalogue: what's written on a page describes that specific model.",
        },
        payment: {
          title: "Cash on delivery",
          copy: "You pay nothing when ordering. Payment is made in cash when the courier hands over the parcel. You can open the box and check the model and colour before paying.",
        },
        delivery: {
          title: "Delivery across the Kingdom",
          copy: "We ship to every city in Morocco. Orders confirmed before 4pm leave the same day. You get a confirmation call before dispatch, then a call from the courier on delivery day.",
        },
        returns: {
          title: "{{days}}-day exchange",
          copy: "If the frame doesn't suit you, contact us within {{days}} days of receiving it. The product must be in original condition, unscratched and with its packaging. We arrange an exchange or refund depending on the case.",
        },
        support: {
          title: "A local team you can reach",
          copy: "We answer from Morocco, in French, Arabic and Darija. Before purchase to help you pick a size, after purchase if something is wrong. A real number, not an unanswered form.",
        },
      },
    },
    steps: {
      eyebrow: "How it works",
      title: "An order, from click to handover.",
      copy: "Four steps, no bank card needed.",
      items: {
        choose: { title: "You choose", copy: "Pick the model and colour, and check the availability shown. If you're torn between two sizes, message us on WhatsApp before ordering." },
        order: { title: "You order", copy: "Through the site or directly on WhatsApp. We ask only for your name, phone, city and address. No online payment." },
        confirm: { title: "We confirm", copy: "A team member calls to confirm the address and model. That's the moment to change or cancel free of charge. The parcel then ships." },
        receive: { title: "You receive and pay", copy: "The courier contacts you. You check the parcel contents, then pay in cash. From that day you have {{days}} days to request an exchange." },
      },
    },
    logistics: {
      eyebrow: "The practical detail",
      delivery: {
        title: "Delivery",
        rows: {
          zone: { term: "Areas covered", detail: "Every city in Morocco, including outlying areas served by our partner carriers." },
          time: { term: "Lead time", detail: "{{days}} business days after the confirmation call. Major cities are usually delivered faster than remote areas." },
          cutoff: { term: "Cut-off", detail: "Orders confirmed before 4pm are prepared the same day. After 4pm they leave the next business day." },
          tracking: { term: "Tracking", detail: "You're notified by phone at confirmation, then by the courier on delivery day." },
        },
      },
      returns: {
        title: "Returns and exchanges",
        rows: {
          window: { term: "Window", detail: "{{days}} calendar days from the date you receive the parcel." },
          condition: { term: "Required condition", detail: "Frame unscratched, not worn outdoors, with original packaging and accessories." },
          how: { term: "Process", detail: "Message us on WhatsApp or through the contact page with your order number. We explain the next steps within 24 hours." },
          exclusions: { term: "Limits", detail: "Frames damaged by a fall, a scratch or unsuitable use cannot be taken back." },
        },
      },
      note: "These conditions apply to any order placed on nazra.store. The full policy is detailed on our dedicated pages.",
      shippingLink: "Delivery information",
      returnsLink: "Return policy",
    },
    shapes: {
      eyebrow: "Choosing well",
      title: "Which shape for which face?",
      copy: "The principle is simple: a frame that contrasts with your face's geometry balances it. This guide lowers the risk of getting it wrong, but nothing replaces trying a pair on.",
      recommends: "Suggested shapes",
      items: {
        round: { face: "Round face", advice: "Angular lines add structure and visually lengthen the face.", frames: "Rectangular, square, cat-eye" },
        square: { face: "Square face", advice: "Curves soften a defined jaw and balance the forehead.", frames: "Round, oval, aviator" },
        oval: { face: "Oval face", advice: "Balanced proportions suit almost any shape. Keep the width close to that of your face.", frames: "Almost any" },
        heart: { face: "Heart-shaped face", advice: "A frame wider at the bottom rebalances a forehead broader than the chin.", frames: "Aviator, round, bottom-rimless" },
      },
      tip: "Tip: measure your face width from temple to temple, then compare it with the total width listed on the product page.",
    },
    faq: {
      eyebrow: "Frequently asked",
      title: "Answers to what we're asked most.",
      items: [
        { q: "Do I have to pay anything before receiving my order?", a: "No. Cash on delivery is our main payment method: you pay the courier in cash after checking the parcel. No deposit, no bank card." },
        { q: "How long will delivery take?", a: "Allow {{deliveryDays}} business days after the confirmation call. Orders confirmed before 4pm are prepared the same day. Times may stretch slightly for remote areas or during busy periods." },
        { q: "Is delivery charged?", a: "Any fees applying to your order are shown in the summary before you confirm. We never add an amount at handover: the price announced is the price you pay the courier." },
        { q: "Can I try the glasses before paying?", a: "You can open the parcel and check the model, colour and condition in front of the courier before paying. If the product doesn't match your order, you can refuse it." },
        { q: "What if the frame doesn't suit me?", a: "Contact us within {{days}} days of receiving it, on WhatsApp or via the contact page, with your order number. The frame must be in original condition. We then arrange an exchange or refund." },
        { q: "How do I know the size will fit?", a: "Every product page lists the frame dimensions. Compare them with your face width, or with a pair you already wear. If in doubt, send us a front-facing photo on WhatsApp and we'll advise." },
        { q: "Do the lenses protect against the sun?", a: "Lens characteristics are stated on each model's product page. We don't publish a generic specification covering the whole catalogue: check the page for the model you're interested in." },
        { q: "Can I order directly on WhatsApp?", a: "Yes. Send us the model name or a photo, your city and your phone number. We check availability and register the order for you. Payment still happens on delivery." },
      ],
    },
    cta: {
      title: "Ready to choose your frame?",
      copy: "Browse the catalogue, or write to us if you'd rather be guided.",
      shop: "Discover the collection",
      whatsapp: "Ask for advice",
      message: "Hello NAZRA, I've read your commitments and I'd like advice on choosing a frame.",
    },
  },

  ar: {
    seoTitle: "التزاماتنا | نَظرة للنظارات في المغرب",
    seoDescription:
      "التوصيل خلال 1–2 يوم عمل، الدفع عند الاستلام، الاستبدال خلال 14 يوماً. تعرّف على التزامات نَظرة، ومراحل الطلب، ودليل اختيار شكل الإطار.",
    hero: {
      eyebrow: "التزاماتنا",
      title: "شراء النظارات عبر الإنترنت، بدون مفاجآت.",
      lead: "اختيار إطار عبر الشاشة يتطلب ثقة. إليك بالضبط كيف نعمل: ما الذي نوصله لك، وفي كم من الوقت، وكم تدفع، وماذا يحدث إذا لم يناسبك الموديل.",
      shop: "تصفح الموديلات",
      contact: "اطرح سؤالاً",
    },
    stats: {
      delivery: { value: "{{days}} يوم", label: "مدة التوصيل بأيام العمل" },
      payment: { value: "0 درهم", label: "تدفعه قبل الاستلام" },
      returns: { value: "{{days}} يوماً", label: "لطلب الاستبدال" },
      support: { value: "7/7", label: "دعم عبر واتساب" },
    },
    commitments: {
      eyebrow: "ما نلتزم به",
      title: "ستة التزامات، مشروحة بوضوح.",
      copy: "بدون وعود غامضة. كل نقطة أدناه تصف ممارسة ملموسة يمكنك التحقق منها عند الطلب.",
      items: {
        selection: {
          title: "تشكيلة مختارة بعناية",
          copy: "نفضّل كتالوجاً محدوداً على كتالوج واسع. كل موديل يُختار حسب وقعه على الوجه، وجودة مفاصله، ونظافة تشطيبه. إذا لم يقنعنا إطار، فلن يدخل المتجر.",
        },
        lenses: {
          title: "معلومات واضحة عن العدسات",
          copy: "فئة العدسة وخصائصها الحقيقية مذكورة في صفحة كل منتج. لا نطبّق ادعاءً تقنياً واحداً على الكتالوج كله: ما هو مكتوب في الصفحة يخص ذلك الموديل تحديداً.",
        },
        payment: {
          title: "الدفع عند الاستلام",
          copy: "لا تدفع شيئاً عند الطلب. الدفع يتم نقداً لحظة تسليم الطرد. يمكنك فتح العلبة والتحقق من الموديل واللون قبل الدفع.",
        },
        delivery: {
          title: "التوصيل في كل المملكة",
          copy: "نشحن إلى جميع مدن المغرب. الطلبات المؤكدة قبل الساعة الرابعة مساءً تُرسل في اليوم نفسه. تصلك مكالمة تأكيد قبل الشحن، ثم مكالمة من المندوب يوم التسليم.",
        },
        returns: {
          title: "استبدال خلال {{days}} يوماً",
          copy: "إذا لم يناسبك الإطار، تواصل معنا خلال {{days}} يوماً من الاستلام. يجب أن يكون المنتج بحالته الأصلية، غير مخدوش ومع تغليفه. ننظم الاستبدال أو الاسترجاع حسب الحالة.",
        },
        support: {
          title: "فريق محلي يمكن الوصول إليه",
          copy: "نرد من داخل المغرب، بالفرنسية والعربية والدارجة. قبل الشراء لمساعدتك في اختيار المقاس، وبعده إذا حدث أي خلل. رقم حقيقي، وليس استمارة بلا جواب.",
        },
      },
    },
    steps: {
      eyebrow: "مراحل الطلب",
      title: "من النقرة إلى التسليم.",
      copy: "أربع مراحل، بدون أي بطاقة بنكية.",
      items: {
        choose: { title: "تختار", copy: "اختر الموديل واللون وتحقق من التوفر المعروض. إذا ترددت بين مقاسين، راسلنا على واتساب قبل الطلب." },
        order: { title: "تطلب", copy: "عبر الموقع أو مباشرة على واتساب. نطلب فقط اسمك وهاتفك ومدينتك وعنوانك. بدون أي دفع إلكتروني." },
        confirm: { title: "نؤكد", copy: "يتصل بك أحد أفراد الفريق لتأكيد العنوان والموديل. هذه لحظة التعديل أو الإلغاء بدون رسوم. بعدها يُشحن الطرد." },
        receive: { title: "تستلم وتدفع", copy: "يتصل بك المندوب. تتحقق من محتوى الطرد ثم تدفع نقداً. من ذلك اليوم لديك {{days}} يوماً لطلب الاستبدال." },
      },
    },
    logistics: {
      eyebrow: "التفاصيل العملية",
      delivery: {
        title: "التوصيل",
        rows: {
          zone: { term: "المناطق المغطاة", detail: "جميع مدن المغرب، بما فيها المناطق المحيطة التي يخدمها شركاؤنا في النقل." },
          time: { term: "المدة", detail: "{{days}} يوم عمل بعد مكالمة التأكيد. المدن الكبرى تُخدم عادةً أسرع من المناطق البعيدة." },
          cutoff: { term: "آخر أجل", detail: "الطلبات المؤكدة قبل الرابعة مساءً تُحضّر في اليوم نفسه. بعدها تُرسل في يوم العمل الموالي." },
          tracking: { term: "التتبع", detail: "نُعلمك هاتفياً عند التأكيد، ثم يتصل بك المندوب يوم التسليم." },
        },
      },
      returns: {
        title: "الإرجاع والاستبدال",
        rows: {
          window: { term: "المدة", detail: "{{days}} يوماً تقويمياً ابتداءً من تاريخ استلام الطرد." },
          condition: { term: "الحالة المطلوبة", detail: "إطار غير مخدوش، لم يُستعمل في الخارج، مع تغليفه وملحقاته الأصلية." },
          how: { term: "الإجراء", detail: "راسلنا على واتساب أو عبر صفحة الاتصال مع رقم طلبك. نوضح لك الخطوات خلال 24 ساعة." },
          exclusions: { term: "الاستثناءات", detail: "الإطارات المتضررة بسبب السقوط أو الخدش أو الاستعمال غير الملائم لا يمكن استرجاعها." },
        },
      },
      note: "تنطبق هذه الشروط على كل طلب يتم عبر nazra.store. السياسة الكاملة مفصّلة في صفحاتنا المخصصة.",
      shippingLink: "معلومات التوصيل",
      returnsLink: "سياسة الإرجاع",
    },
    shapes: {
      eyebrow: "حسن الاختيار",
      title: "أي شكل يناسب أي وجه؟",
      copy: "المبدأ بسيط: الإطار الذي يتباين مع هندسة وجهك يوازنه. هذا الدليل يقلل احتمال الخطأ، لكن لا شيء يعوّض التجربة.",
      recommends: "الأشكال المقترحة",
      items: {
        round: { face: "وجه مستدير", advice: "الخطوط الحادة تمنح بنية للملامح وتطيل الوجه بصرياً.", frames: "مستطيل، مربع، عين القطة" },
        square: { face: "وجه مربع", advice: "الانحناءات تلطّف الفك البارز وتوازن الجبهة.", frames: "مستدير، بيضاوي، أفياتور" },
        oval: { face: "وجه بيضاوي", advice: "التناسق يسمح بمعظم الأشكال. حافظ على عرض قريب من عرض الوجه.", frames: "معظم الأشكال" },
        heart: { face: "وجه على شكل قلب", advice: "إطار أعرض من الأسفل يوازن جبهة أعرض من الذقن.", frames: "أفياتور، مستدير، بدون إطار سفلي" },
      },
      tip: "نصيحة: قِس عرض وجهك من صدغ إلى صدغ، ثم قارنه بالعرض الإجمالي المذكور في صفحة المنتج.",
    },
    faq: {
      eyebrow: "أسئلة متكررة",
      title: "أجوبة عن أكثر ما يُطرح علينا.",
      items: [
        { q: "هل يجب أن أدفع شيئاً قبل استلام طلبي؟", a: "لا. الدفع عند الاستلام هو طريقتنا الأساسية: تدفع نقداً للمندوب بعد التحقق من الطرد. بدون مقدّم وبدون بطاقة بنكية." },
        { q: "كم يستغرق التوصيل؟", a: "احسب {{deliveryDays}} يوم عمل بعد مكالمة التأكيد. الطلبات المؤكدة قبل الرابعة مساءً تُحضّر في اليوم نفسه. قد تطول المدة قليلاً في المناطق البعيدة أو في فترات الذروة." },
        { q: "هل التوصيل مؤدى عنه؟", a: "الرسوم المطبقة على طلبك تظهر في الملخص قبل التأكيد. لا نضيف أي مبلغ عند التسليم: الثمن المعلن هو ما تدفعه للمندوب." },
        { q: "هل يمكنني تجربة النظارة قبل الدفع؟", a: "يمكنك فتح الطرد والتحقق من الموديل واللون وحالة الإطار أمام المندوب قبل الدفع. إذا لم يطابق المنتج طلبك، يمكنك رفضه." },
        { q: "ماذا أفعل إذا لم يناسبني الإطار؟", a: "تواصل معنا خلال {{days}} يوماً من الاستلام، عبر واتساب أو صفحة الاتصال، مع رقم طلبك. يجب أن يكون الإطار بحالته الأصلية. عندها ننظم الاستبدال أو الاسترجاع." },
        { q: "كيف أعرف أن المقاس سيناسبني؟", a: "كل صفحة منتج تذكر أبعاد الإطار. قارنها بعرض وجهك، أو بنظارة ترتديها بالفعل. عند الشك، أرسل لنا صورة أمامية على واتساب وسنوجهك." },
        { q: "هل تحمي العدسات من الشمس؟", a: "خصائص العدسات مذكورة في صفحة كل موديل. لا ننشر مواصفة عامة تشمل الكتالوج كله: راجع صفحة الموديل الذي يهمك." },
        { q: "هل يمكنني الطلب مباشرة عبر واتساب؟", a: "نعم. أرسل لنا اسم الموديل أو صورته، ومدينتك، ورقم هاتفك. نتحقق من التوفر ونسجّل الطلب نيابة عنك. ويبقى الدفع عند الاستلام." },
      ],
    },
    cta: {
      title: "مستعد لاختيار إطارك؟",
      copy: "تصفح الكتالوج، أو راسلنا إذا كنت تفضل أن نوجهك.",
      shop: "اكتشف المجموعة",
      whatsapp: "اطلب نصيحة",
      message: "مرحباً نَظرة، قرأت التزاماتكم وأود نصيحة لاختيار إطار مناسب.",
    },
  },
};
