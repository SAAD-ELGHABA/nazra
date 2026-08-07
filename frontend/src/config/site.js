export const SITE_CONFIG = {
  name: "NAZRA",
  url: "https://nazra.store",
  brand: {
    logo: "/assets/brand/nazra-logo-primary.png",
    logoLight: "/assets/brand/nazra-logo-primary-white.png",
    icon: "/assets/brand/nazra-icon.png",
  },
  email: "contact.nazra.info@gmail.com",
  phone: "+212638995117",
  whatsapp: "+212638995117",
  policies: {
    deliveryBusinessDays: "1–2",
    returnsDays: 14,
    cashOnDelivery: true,
    // Legal withdrawal period for distance selling in Morocco (Loi 31-08, art. 36).
    // The 14-day exchange above is a commercial policy on top of this minimum.
    legalWithdrawalDays: 7,
    refundDays: 30,
  },

  /**
   * Company identity shown on the legal pages.
   * Leave a field empty and its row is simply not rendered — fill these in as
   * soon as the registration details are available, they are expected on a
   * Moroccan e-commerce site.
   */
  legal: {
    companyName: "",
    legalForm: "",
    address: "",
    rc: "",
    ice: "",
    if: "",
    // Set once the processing has been declared to the CNDP.
    cndpDeclaration: "",
    lastUpdated: "2026-08-07",
  },
  social: {
    instagram: "https://www.instagram.com/nazra.sunglasses/",
    facebook: "https://web.facebook.com/profile.php?id=61581395211534",
  },
  promotion: {
    enabled: false,
    titleKey: "home.promotion.offerTitle",
    descriptionKey: "home.promotion.offerDescription",
    href: "/store/products?offer=two-for-399",
  },
};

export const createWhatsAppLink = (message) => {
  const digits = SITE_CONFIG.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};
