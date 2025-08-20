const fs = require('fs');
const path = require('path');

const translations = {
  en: {
    navbar: {
      home: "Home Page",
      shop: "Shop Now",
      about: "About Us",
      collection: "Collection",
      cart: "Cart",
      wishlist: "Wishlist"
    },
    hero: {
      title: "Elevate Your Style with Our Luxurious Sunglasses",
      subtitle: "Discover the perfect blend of elegance and protection with our premium sunglasses. Crafted with meticulous attention to detail, each pair offers unparalleled style and UV defense.",
      shopButton: "Shop Now",
      learnMoreButton: "Learn More"
    }
  },
  fr: {
    navbar: {
      home: "Page d'accueil",
      shop: "Acheter maintenant",
      about: "À propos de nous",
      collection: "Collection",
      cart: "Panier",
      wishlist: "Liste de souhaits"
    },
    hero: {
      title: "Élevez votre style avec nos lunettes de soleil luxueuses",
      subtitle: "Découvrez le mélange parfait d'élégance et de protection avec nos lunettes de soleil haut de gamme. Fabriquées avec un souci du détail méticuleux, chaque paire offre un style inégalé et une protection UV.",
      shopButton: "Acheter maintenant",
      learnMoreButton: "En savoir plus"
    }
  },
  ar: {
    navbar: {
      home: "الصفحة الرئيسية",
      shop: "تسوق الآن",
      about: "من نحن",
      collection: "المجموعة",
      cart: "السلة",
      wishlist: "قائمة الرغبات"
    },
    hero: {
      title: "ارتقِ بأناقتك مع نظاراتنا الشمسية الفاخرة",
      subtitle: "اكتشف المزيج المثالي من الأناقة والحماية مع نظاراتنا الشمسية المتميزة. مصنوعة بانتباه دقيق للتفاصيل، توفر كل زوج أسلوبًا لا مثيل له وحماية من الأشعة فوق البنفسجية.",
      shopButton: "تسوق الآن",
      learnMoreButton: "اعرف المزيد"
    }
  }
};

// Create directories if they don't exist
['en', 'fr', 'ar'].forEach(lang => {
  const dir = path.join('frontend', 'src', 'locales', lang);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write translation file
  const filePath = path.join(dir, 'translation.json');
  fs.writeFileSync(filePath, JSON.stringify(translations[lang], null, 2));
  console.log(`Created ${filePath}`);
});

console.log('Translation files generated successfully!');
