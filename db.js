// db.js — подключение к MySQL.
// Это НЕ файл для запуска внутри MySQL. Это код на JavaScript — его запускает
// Node.js (через server.js), а он уже сам разговаривает с MySQL по сети,
// используя данные из .env (хост, пользователь, пароль, имя базы).
//
// Таблицу в самой базе нужно создать один раз вручную — см. schema.sql
// (вот его действительно нужно вставить и выполнить в phpMyAdmin).

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10
});

async function insertOrder(order) {
  const [result] = await pool.execute(
    `INSERT INTO orders
      (created_at, fio, email, phone, social, city, fio_receiver, address, comment, promo, payment_method, items_json, total, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
    [
      order.created_at, order.fio, order.email, order.phone, order.social,
      order.city, order.fio_receiver, order.address, order.comment, order.promo,
      order.payment_method, order.items_json, order.total
    ]
  );
  return result.insertId;
}

async function getOrder(id) {
  const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
  return rows[0] || null;
}

async function setOrderStatus(id, status) {
  await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
}

module.exports = { insertOrder, getOrder, setOrderStatus };
