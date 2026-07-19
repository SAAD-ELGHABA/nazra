export const SITE_CONFIG = {
  name: "NAZRA",
  url: "https://nazra.store",
  email: "nazraglasses@gmail.com",
  whatsapp: "+212638995117",
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
