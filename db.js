// db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Обязательно для Render
});

async function insertOrder(order) {
  const query = `
    INSERT INTO orders
      (created_at, fio, email, phone, social, city, fio_receiver, address, comment, promo, payment_method, items_json, total, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'new')
     RETURNING id;
  `;
  const values = [
    order.created_at, order.fio, order.email, order.phone, order.social,
    order.city, order.fio_receiver, order.address, order.comment, order.promo,
    order.payment_method, order.items_json, order.total
  ];
  
  const res = await pool.query(query, values);
  return res.rows[0].id;
}

async function getOrder(id) {
  const res = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function setOrderStatus(id, status) {
  await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
}

module.exports = { insertOrder, getOrder, setOrderStatus };
