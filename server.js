// server.js — order API + Telegram notification.
// Run with: npm install && npm start   (see README.md)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { insertOrder, getOrder, setOrderStatus } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function notifyTelegram(order, orderId) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('Telegram not configured — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env');
    return;
  }
  const itemsText = order.items
    .map(i => `• ${i.name} — размер ${i.size} × ${i.qty}`)
    .join('\n');

  const text =
    `🛍 Новый заказ #${orderId}\n\n` +
    `${itemsText}\n\n` +
    `Итого: ${order.total.toLocaleString('ru-RU')} ₽\n\n` +
    `Клиент: ${order.customer.fio}\n` +
    `Тел: ${order.customer.phone}\n` +
    `Email: ${order.customer.email}\n` +
    (order.customer.social ? `Соцсеть: ${order.customer.social}\n` : '') +
    `\nГород: ${order.shipping.city}\n` +
    `Адрес: ${order.shipping.address}` +
    (order.shipping.comment ? `\nКомментарий: ${order.shipping.comment}` : '') +
    (order.promo ? `\nПромокод: ${order.promo}` : '');

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text })
  });
  if (!res.ok) console.error('Telegram notify failed:', await res.text());
}

app.post('/api/orders', async (req, res) => {
  const order = req.body;

  // Basic validation — expand as needed.
  if (!order?.customer?.fio || !order?.customer?.phone || !order?.items?.length) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  let orderId;
  try {
    orderId = await insertOrder({
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '), // MySQL DATETIME format
      fio: order.customer.fio,
      email: order.customer.email,
      phone: order.customer.phone,
      social: order.customer.social || '',
      city: order.shipping.city,
      fio_receiver: order.shipping.fioReceiver || '',
      address: order.shipping.address,
      comment: order.shipping.comment || '',
      promo: order.promo || '',
      payment_method: order.paymentMethod || 'card',
      items_json: JSON.stringify(order.items),
      total: order.total
    });
  } catch (err) {
    console.error('MySQL insert failed:', err);
    return res.status(500).json({ ok: false, error: 'Database error — check MySQL connection in .env' });
  }

  try {
    await notifyTelegram(order, orderId);
  } catch (err) {
    console.error('Telegram error:', err);
  }

  // ---- Payment integration goes here -------------------------------------
  // Once your bank / payment page is ready (YooKassa, CloudPayments, Tinkoff
  // Acquiring, etc.), create a payment session for `order.total` and return
  // its redirect URL instead of paymentUrl: null below. Example shape:
  //
  //   const payment = await yookassa.createPayment({ amount: order.total, orderId });
  //   return res.json({ ok: true, orderId, paymentUrl: payment.confirmation.confirmation_url });
  // --------------------------------------------------------------------------

  res.json({ ok: true, orderId, paymentUrl: null });
});

// Optional: let a payment webhook mark the order paid.
app.post('/api/orders/:id/mark-paid', async (req, res) => {
  await setOrderStatus(req.params.id, 'paid');
  res.json({ ok: true });
});

app.get('/api/orders/:id', async (req, res) => {
  const order = await getOrder(req.params.id);
  if (!order) return res.status(404).json({ ok: false });
  res.json({ ok: true, order });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Made Noise API running on http://localhost:${PORT}`));
