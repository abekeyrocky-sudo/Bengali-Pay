/**
 * Helper to register or inspect Telegram Webhook URL
 * Usage: node functions/set-webhook.js <FUNCTION_URL>
 * Example: node functions/set-webhook.js https://telegrambot-xxxx-uc.a.run.app
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPaths = [path.join(__dirname, '.env'), path.join(__dirname, '..', '.env')];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...v] = trimmed.split('=');
        if (k && v.length) process.env[k.trim()] = v.join('=').trim();
      }
    });
    break;
  }
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN not found in .env!");
}
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

const targetUrl = process.argv[2];

async function checkOrSetWebhook() {
  if (!targetUrl) {
    console.log("ℹ️ Fetching current webhook info...");
    const res = await fetch(`${API_BASE}/getWebhookInfo`);
    const data = await res.json();
    console.log("Current Webhook Status:", JSON.stringify(data, null, 2));
    console.log("\n💡 To set a new webhook, run: node functions/set-webhook.js <FUNCTION_URL>");
    return;
  }

  console.log(`📡 Setting Telegram Webhook to: ${targetUrl} ...`);
  const res = await fetch(`${API_BASE}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: targetUrl,
      drop_pending_updates: true,
      allowed_updates: ["message", "callback_query"]
    })
  });
  const data = await res.json();
  if (data.ok) {
    console.log("✅ Webhook successfully set to Firebase Cloud Function!");
  } else {
    console.error("❌ Failed to set webhook:", data);
  }
}

checkOrSetWebhook();
