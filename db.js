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

async function initDb() {
  const query = `
    CREATE TABLE IF NOT EXISTS orders (
      id             SERIAL PRIMARY KEY,
      created_at     TIMESTAMP NOT NULL,
      fio            VARCHAR(255) NOT NULL,
      email          VARCHAR(255) NOT NULL,
      phone          VARCHAR(50)  NOT NULL,
      social         VARCHAR(255),
      city           VARCHAR(255) NOT NULL,
      fio_receiver   VARCHAR(255),
      address        VARCHAR(500) NOT NULL,
      comment        TEXT,
      promo          VARCHAR(100),
      payment_method VARCHAR(50) NOT NULL,
      items_json     TEXT NOT NULL,
      total          INT NOT NULL,
      status         VARCHAR(30) NOT NULL DEFAULT 'new'
    );
  `;
  try {
    await pool.query(query);
    console.log('✅ Таблица orders успешно создана или уже существует!');
  } catch (err) {
    console.error('❌ Ошибка создания таблицы:', err);
  }
}
initDb();

module.exports = { insertOrder, getOrder, setOrderStatus };
