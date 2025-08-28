exports.userOrderEmail = (order, customer) => {
  return `
    <h2>Hello ${customer.fullName},</h2>
    <p>Thank you for your order! 🎉</p>
    <p>Your order has been created successfully. Here are the details:</p>

    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Color</th>
        </tr>
      </thead>
      <tbody>
        ${order.products.map(p => `
          <tr>
            <td>${p.product}</td>
            <td>${p.quantity}</td>
            <td>${p.color || "N/A"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <p>We’ll notify you once your order is shipped 🚚</p>
    <p>Thanks,<br/>The Store Team</p>
  `;
};
