exports.userOrderEmail = (order, customer) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; color: #000; padding: 20px; border-radius: 8px; border: 1px solid #e5e5e5;">
    
    <!-- Logo Header -->
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://res.cloudinary.com/dmiaxmuiy/image/upload/v1756556524/Main-logo_esr44s.jpg" alt="Nazra Glasses" style="max-width: 150px; margin-bottom: 15px;" />
      <h1 style="color: #000; font-weight: bold; font-size: 22px; margin-bottom: 5px;">Merci pour votre commande, ${customer.fullName} !</h1>
      <p style="font-size: 16px; color: #555;">Votre commande a été passée avec succès !</p>
    </div>

    <!-- Order Details -->
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #e5e5e5;">
      <h2 style="font-size: 18px; margin-bottom: 15px; color: #000; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px;">Détails de la commande</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">Produit</th>
            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">Nom</th>
            <th style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;">Quantité</th>
            <th style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;">Couleur</th>
            <th style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;">Prix</th>
            <th style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;">Total Par Produit</th>
          </tr>
        </thead>
        <tbody>
          ${order.products.map(p => `
            <tr>
              <td style="padding: 10px; text-align: center;">
                <img src="${p.product?.colors[0]?.images[0]?.url}" alt="${p.product?.name}" style="max-width: 60px; border-radius: 4px;" />
              </td>
              <td style="padding: 10px;">${p?.product?.name}</td>
              <td style="padding: 10px; text-align: center;">${p?.quantity}</td>
              <td style="padding: 10px; text-align: center;">${p?.color || "N/A"}</td>
              <td style="padding: 10px; text-align: center;">${p?.sale_price.toFixed(2) || "N/A"}</td>
              <td style="padding: 10px; text-align: center;">${((p?.quantity || 0) * (p?.product.sale_price || 0)).toFixed(2) || "N/A"}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="padding: 10px; text-align: right; font-weight: bold;">
              Total:
            </td>
            <td style="padding: 10px; text-align: center; font-weight: bold;">
              ${order.products.reduce((acc, p) => acc + (p?.quantity || 0) * (p?.product?.sale_price || 0), 0).toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Note -->
    <div style="margin-top: 30px; font-size: 14px; color: #555;">
      <p>Votre commande a été soumise </p>
      <p>Nous allons vous contacter dès que possible. Merci pour votre confiance et à très bientôt .</p>
    </div>

    <!-- Footer with Social Media -->
    <div style="text-align: center; margin-top: 40px;">
      <p style="font-size: 14px; color: #555; margin-bottom: 10px;">Suivez-nous sur les réseaux sociaux :</p>
      
      <table align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
          <td style="padding: 0 10px;">
            <a href="https://www.facebook.com/profile.php?id=61579011881076" target="_blank">
              <img src="https://img.icons8.com/color/48/000000/facebook.png" alt="Facebook" width="24" height="24" style="display: block;" />
            </a>
          </td>
          <td style="padding: 0 10px;">
            <a href="https://www.tiktok.com/@nazraglasses?is_from_webapp=1&sender_device=pc" target="_blank">
              <img src="https://img.icons8.com/color/48/000000/tiktok.png" alt="TikTok" width="24" height="24" style="display: block;" />
            </a>
          </td>
          <td style="padding: 0 10px;">
            <a href="https://www.instagram.com/nazraglasses" target="_blank">
              <img src="https://img.icons8.com/color/48/000000/instagram-new.png" alt="Instagram" width="24" height="24" style="display: block;" />
            </a>
          </td>
          <td style="padding: 0 10px;">
            <a href="https://pin.it/xJroIb6t6" target="_blank">
              <img src="https://img.icons8.com/color/48/000000/pinterest.png" alt="Pinterest" width="24" height="24" style="display: block;" />
            </a>
          </td>
        </tr>
      </table>
      
      <p style="margin-top: 20px; font-size: 12px; color: #aaa;">© 2025 Nazra Glasses. Tous droits réservés.</p>
    </div>

  </div>
  `;
};
