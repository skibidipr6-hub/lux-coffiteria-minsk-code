require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function escapeMarkdown(text) {
  if (!text) return '';
  return String(text).replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database
const db = new Database(path.join(__dirname, 'data.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    guests TEXT NOT NULL,
    zone TEXT NOT NULL,
    wishes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// --- API: Bookings ---

app.post('/api/bookings', (req, res) => {
  const { name, phone, date, time, guests, zone, wishes } = req.body;

  if (!name || !phone || !date || !time || !guests || !zone) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }

  const stmt = db.prepare(
    'INSERT INTO bookings (name, phone, date, time, guests, zone, wishes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(name, phone, date, time, guests, zone, wishes || '');

  const zoneNames = { main: 'Основной зал', bar: 'У барной стойки', terrace: 'Терраса', library: 'Библиотека' };
  const message = [
    '🎉 <b>Новое бронирование!</b>',
    '',
    `👤 <b>Имя:</b> ${escapeMarkdown(name)}`,
    `📞 <b>Телефон:</b> ${escapeMarkdown(phone)}`,
    `📅 <b>Дата:</b> ${escapeMarkdown(date)}`,
    `🕐 <b>Время:</b> ${escapeMarkdown(time)}`,
    `👥 <b>Гостей:</b> ${escapeMarkdown(guests)}`,
    `🪑 <b>Зона:</b> ${zoneNames[zone] || zone}`,
    wishes ? `💬 <b>Пожелания:</b> ${escapeMarkdown(wishes)}` : '💬 <b>Пожелания:</b> —',
    '',
    `🆔 <b>ID брони:</b> #${result.lastInsertRowid}`,
  ].join('\n');

  bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'HTML' }).catch(err => {
    console.error('Ошибка отправки в Telegram:', err.message);
  });

  res.json({ success: true, id: result.lastInsertRowid });
});

// --- API: Reviews ---

app.get('/api/reviews', (req, res) => {
  const reviews = db.prepare(
    'SELECT id, name, rating, text, created_at FROM reviews ORDER BY created_at DESC LIMIT 50'
  ).all();
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const { name, rating, text } = req.body;

  if (!name || !rating || !text) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  const numRating = parseInt(rating, 10);
  if (numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Рейтинг от 1 до 5' });
  }

  if (text.length > 1000) {
    return res.status(400).json({ error: 'Отзыв слишком длинный (макс. 1000 символов)' });
  }

  const stmt = db.prepare(
    'INSERT INTO reviews (name, rating, text) VALUES (?, ?, ?)'
  );
  const result = stmt.run(name, numRating, text);

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
  res.json({ success: true, review });
});

// --- API: Subscriptions ---

app.post('/api/subscriptions', (req, res) => {
  const { plan, price, name, phone, email } = req.body;

  if (!plan || !name || !phone) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }

  const message = [
    '☕ <b>Новая заявка на подписку!</b>',
    '',
    `📦 <b>Тариф:</b> ${escapeMarkdown(plan)} — ${escapeMarkdown(price)}`,
    `👤 <b>Имя:</b> ${escapeMarkdown(name)}`,
    `📞 <b>Телефон:</b> ${escapeMarkdown(phone)}`,
    email ? `📧 <b>Email:</b> ${escapeMarkdown(email)}` : '📧 <b>Email:</b> —',
  ].join('\n');

  bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'HTML' }).catch(err => {
    console.error('Ошибка отправки в Telegram:', err.message);
  });

  res.json({ success: true });
});

// Fallback to index.html
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LUX Coffiteria server running on http://localhost:${PORT}`);
});
