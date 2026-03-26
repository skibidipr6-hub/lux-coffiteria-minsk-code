exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { TELEGRAM_TOKEN, CHAT_ID } = process.env;

  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Telegram not configured' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const sep = '— — — — — — — — — —';
  let message;

  if (data.type === 'booking') {
    const zoneNames = {
      main: 'Основной зал',
      bar: 'У барной стойки',
      terrace: 'Терраса',
      library: 'Библиотека',
    };
    message = [
      '📅 <b>Новое бронирование!</b>',
      sep,
      `👤 <b>Имя:</b> ${esc(data.name)}`,
      `📞 <b>Телефон:</b> ${esc(data.phone)}`,
      `🗓 <b>Дата:</b> ${esc(data.date)}`,
      `⏰ <b>Время:</b> ${esc(data.time)}`,
      `👥 <b>Гостей:</b> ${esc(data.guests)}`,
      `📍 <b>Зона:</b> ${zoneNames[data.zone] || data.zone}`,
      `💬 <b>Пожелания:</b> ${data.wishes ? esc(data.wishes) : '—'}`,
      sep,
    ].join('\n');
  } else if (data.type === 'subscription') {
    message = [
      '☕️ <b>Новая заявка на подписку!</b>',
      sep,
      `📦 <b>Тариф:</b> ${esc(data.plan)} — ${esc(data.price)}`,
      `👤 <b>Имя:</b> ${esc(data.name)}`,
      `📞 <b>Телефон:</b> ${esc(data.phone)}`,
      `📧 <b>Email:</b> ${data.email ? esc(data.email) : '—'}`,
      sep,
    ].join('\n');
  } else if (data.type === 'review') {
    const starsText = '⭐️'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
    message = [
      '✍️ <b>Новый отзыв!</b>',
      sep,
      `👤 <b>Имя:</b> ${esc(data.name)}`,
      `🌟 <b>Оценка:</b> ${starsText}`,
      `💬 <b>Текст:</b> ${esc(data.text)}`,
      sep,
    ].join('\n');
  } else {
    message = [
      '📩 <b>Новая заявка!</b>',
      sep,
      `👤 <b>Имя:</b> ${esc(data.name)}`,
      `📞 <b>Телефон:</b> ${esc(data.phone)}`,
      `📧 <b>Email:</b> ${data.email ? esc(data.email) : '—'}`,
      sep,
    ].join('\n');
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Telegram error:', err);
    return { statusCode: 502, body: JSON.stringify({ error: 'Telegram send failed' }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};

function esc(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
