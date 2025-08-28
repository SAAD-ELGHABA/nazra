exports.adminOrderEmail = (order, customer) => {
  return `
    <h2>📦 New Order Received</h2>
    <p><strong>Customer:</strong> ${customer.fullName}</p>
    <p><strong>Email:</strong> ${customer.email}</p>
    <p><strong>Phone:</strong> ${customer.phone}</p>
    <p><strong>Address:</strong> ${customer.adresse}</p>

    <h3>Order Items:</h3>
    <ul>
      ${order.products.map(p => `
        <li>
          Product: ${p.product} <br/>
          Quantity: ${p.quantity} <br/>
          Color: ${p.color || "N/A"}
        </li>
      `).join("")}
    </ul>

    <p>⚠️ Please prepare this order for shipping.</p>
  `;
};
