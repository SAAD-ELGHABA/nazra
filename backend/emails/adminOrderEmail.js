exports.adminOrderEmail = (order, customer) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; color: #000; padding: 20px; border-radius: 8px; border: 1px solid #e5e5e5;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #000; font-size: 22px; margin-bottom: 5px;">📦 New Order Received!</h1>
      <p style="font-size: 16px; color: #555;">Order from ${customer.fullName}</p>
    </div>

    <!-- Customer Details -->
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #e5e5e5; margin-bottom: 20px;">
      <h2 style="font-size: 18px; margin-bottom: 10px; color: #000; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Customer Details</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px; font-weight: bold;">Name:</td>
          <td style="padding: 8px;">${customer.fullName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Email:</td>
          <td style="padding: 8px;">${customer.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Phone:</td>
          <td style="padding: 8px;">${customer.phone}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Address:</td>
          <td style="padding: 8px;">${customer.adresse}</td>
        </tr>
      </table>
    </div>

    <!-- Order Items -->
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #e5e5e5;">
      <h2 style="font-size: 18px; margin-bottom: 10px; color: #000; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Order Items</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Product</th>
            <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Quantity</th>
            <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Color</th>
          </tr>
        </thead>
        <tbody>
          ${order.products.map(p => `
            <tr>
              <td style="padding: 8px; display: flex; align-items: center; gap: 10px;">
                <img src="${p.product?.colors[0]?.images[0]?.url}" alt="${p.product?.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
                <span style="padding: 8px;">${p.product?.name}</span>
              </td>
              <td style="padding: 8px; text-align: center;">${p.quantity}</td>
              <td style="padding: 8px; text-align: center;">${p.color || "N/A"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #aaa;">
      <p>⚠️ Please prepare this order for shipping.</p>
      <p>Order created on: ${new Date(order.createdAt).toLocaleString()}</p>
      <p>© 2025 Nazra Glasses. All rights reserved.</p>
    </div>

  </div>
  `;
};
