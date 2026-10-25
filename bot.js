/**
 * Bengali Pay - Official Telegram Bot Server
 * Handles /start, /help, /play and WebApp Launcher
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env manually without external dependencies
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim();
      }
    }
  });
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
if (!BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN not found in .env file!');
}
const APP_URL = process.env.APP_URL || 'https://bengali-pay.netlify.app/';
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Call Telegram Bot API Helper
 */
async function telegramRequest(method, payload = {}) {
  try {
    const response = await fetch(`${API_BASE}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.error(`Telegram API [${method}] Error:`, error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Configure Persistent Chat Menu Button (Lower Left of chat)
 */
async function setupMenuButton() {
  const res = await telegramRequest('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: 'Play ৳',
      web_app: {
        url: APP_URL
      }
    }
  });
  if (res.ok) {
    console.log('✅ Telegram Chat Menu Button configured: Play ৳');
  } else {
    console.warn('⚠️ Menu button notice:', res.description || res);
  }
}

/**
 * Handle /start command with photo banner
 */
async function handleStartCommand(chatId, user) {
  const welcomeText = 
`<b>স্বাগতম Bengali Pay-তে!</b>
কামলা দাও, টাস্ক করো আর রিওয়ার্ড কামাও! 

গেম • টাস্ক • রেফার
বিকাশ ও নগদে উত্তোলনের সুযোগ!

নিচের Start বাটনে ক্লিক করে শুরু করুন।`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: 'Start',
          web_app: { url: APP_URL },
          style: 'success'
        }
      ],
      [
        {
          text: 'অফিসিয়াল গ্রুপ / চ্যানেল',
          url: 'https://t.me/BengaliPay_bot',
          style: 'danger'
        }
      ],
      [
        {
          text: 'সাহায্য ও নিয়ম',
          callback_data: 'help_info',
          style: 'success'
        }
      ]
    ]
  };

  // Check if start-image.jpg exists locally in assets or public
  const localImgPath = path.join(__dirname, 'src', 'assets', 'start-image.jpg');
  const publicImgPath = path.join(__dirname, 'public', 'start-image.jpg');
  const targetPath = fs.existsSync(localImgPath) ? localImgPath : (fs.existsSync(publicImgPath) ? publicImgPath : null);

  if (targetPath) {
    try {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('caption', welcomeText);
      formData.append('parse_mode', 'HTML');
      formData.append('reply_markup', JSON.stringify(replyMarkup));
      const fileData = fs.readFileSync(targetPath);
      formData.append('photo', new Blob([fileData]), 'start-image.jpg');

      const photoRes = await fetch(`${API_BASE}/sendPhoto`, {
        method: 'POST',
        body: formData
      });
      const data = await photoRes.json();
      if (data && data.ok) {
        return;
      }
    } catch (e) {
      console.warn('sendPhoto multipart error, trying URL/text:', e.message);
    }
  }

  // Fallback 1: sendPhoto via URL
  const urlRes = await telegramRequest('sendPhoto', {
    chat_id: chatId,
    photo: `${APP_URL}start-image.jpg`,
    caption: welcomeText,
    parse_mode: 'HTML',
    reply_markup: replyMarkup
  });

  if (urlRes && urlRes.ok) return;

  // Fallback 2: sendMessage text
  await telegramRequest('sendMessage', {
    chat_id: chatId,
    text: welcomeText,
    parse_mode: 'HTML',
    reply_markup: replyMarkup
  });
}

/**
 * Handle /help command
 */
async function handleHelpCommand(chatId) {
  const helpText = 
`ℹ️ <b>Bengali Pay সাহায্য কেন্দ্র:</b>

1. <b>টোকেন থেকে টাকা:</b>
প্রতিটি টাস্ক এবং স্পিন থেকে প্রাপ্ত টোকেন আপনার অ্যাকাউন্টে জমা হবে।

2. <b>উইথড্র নিয়ম:</b>
সর্বনিম্ন ৫০০ টাকা হলে আপনি বিকাশ বা নগদ নম্বরে উইথড্র রিকোয়েস্ট পাঠাতে পারবেন। সাধারণত ১২ থেকে ২৪ ঘণ্টার মধ্যে পেমেন্ট প্রসেস হয়।

3. <b>ডেইলি চেক-ইন:</b>
প্রতিদিন অ্যাপ ওপেন করে দৈনিক ৫টি ফ্রি টোকেন ক্লেইম করুন!

এখনই খেলতে নিচের বাটনে ক্লিক করুন:`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '🚀 অ্যাপ ওপেন করুন',
          web_app: { url: APP_URL }
        }
      ]
    ]
  };

  await telegramRequest('sendMessage', {
    chat_id: chatId,
    text: helpText,
    parse_mode: 'HTML',
    reply_markup: replyMarkup
  });
}

/**
 * Long Polling Update Loop
 */
let lastUpdateId = 0;

async function pollUpdates() {
  try {
    const res = await telegramRequest('getUpdates', {
      offset: lastUpdateId + 1,
      timeout: 25,
      allowed_updates: ['message', 'callback_query']
    });

    if (res && res.ok && Array.isArray(res.result)) {
      for (const update of res.result) {
        lastUpdateId = update.update_id;

        // 1. Text Messages
        if (update.message && update.message.text) {
          const chatId = update.message.chat.id;
          const text = update.message.text.trim();
          const user = update.message.from || {};

          if (text.startsWith('/start')) {
            await handleStartCommand(chatId, user);
          } else if (text.startsWith('/help')) {
            await handleHelpCommand(chatId);
          } else if (text.startsWith('/play')) {
            await handleStartCommand(chatId, user);
          } else {
            // Default reply with play button
            await handleStartCommand(chatId, user);
          }
        }

        // 2. Callback Queries (Inline button clicks)
        if (update.callback_query) {
          const cb = update.callback_query;
          const chatId = cb.message?.chat?.id;
          if (cb.data === 'help_info' && chatId) {
            await handleHelpCommand(chatId);
          }
          await telegramRequest('answerCallbackQuery', {
            callback_query_id: cb.id
          });
        }
      }
    }
  } catch (err) {
    console.error('Polling cycle error:', err.message);
    await new Promise(r => setTimeout(r, 3000));
  }

  // Continue next polling loop
  setImmediate(pollUpdates);
}

// Start Bot Service
async function startBot() {
  console.log('🤖 Bengali Pay Telegram Bot starting...');
  const me = await telegramRequest('getMe');
  if (!me.ok) {
    console.error('❌ Failed to connect to Telegram Bot. Token might be invalid:', me);
    return;
  }

  console.log(`🚀 Bot connected as @${me.result.username} (${me.result.first_name})`);
  await setupMenuButton();
  console.log('📡 Long polling active. Waiting for /start messages...');
  pollUpdates();
}

startBot();
