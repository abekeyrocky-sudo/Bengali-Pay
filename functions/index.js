/**
 * Bengali Pay - Firebase Cloud Functions
 * Serverless Telegram Bot Webhook Backend (Node.js 20 ESM)
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const APP_URL = process.env.APP_URL || "https://bengali-pay.netlify.app/";
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Track and sync Telegram User to Firestore database
 * Guarantees Telegram ID is stored as an exact String
 */
async function trackUserInFirestore(user) {
  if (!user || user.id === undefined || user.id === null) return;
  try {
    const tgIdStr = String(user.id); // Guaranteed String in database
    const docId = `tg_${tgIdStr}`;
    const userRef = db.collection("users").doc(docId);

    const firstName = user.first_name ? String(user.first_name).trim() : "";
    const lastName = user.last_name ? String(user.last_name).trim() : "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || firstName || user.username || "Rocky";

    await userRef.set(
      {
        telegramId: tgIdStr, // Guaranteed String in database
        rawTelegramId: tgIdStr,
        telegramName: fullName,
        telegramFirstName: firstName,
        telegramUsername: user.username ? String(user.username) : "",
        isPremium: Boolean(user.is_premium),
        languageCode: user.language_code || "bn",
        lastActiveAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    logger.info(`Tracked Telegram User in DB: ${docId} (${fullName})`);
  } catch (err) {
    logger.warn("Firestore user tracking notice:", err.message);
  }
}

/**
 * Call Telegram API
 */
async function telegramApi(method, body = {}) {
  try {
    const res = await fetch(`${API_BASE}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (err) {
    logger.error(`Telegram [${method}] Error:`, err);
    return { ok: false, error: err.message };
  }
}

/**
 * Process referral reward (50৳ per referral) and send Telegram Bot notification
 * @param {Object} newUser - Telegram user object { id, first_name, last_name, username, ... }
 * @param {string} referrerParam - Referrer ID or referral code passed via start / startapp
 */
async function processReferralReward(newUser, referrerParam) {
  if (!newUser || newUser.id === undefined || !referrerParam) {
    return { success: false, reason: "invalid_params" };
  }
  
  const newTgId = String(newUser.id);
  const cleanRefParam = String(referrerParam).trim();
  const cleanRefId = cleanRefParam.replace(/^tg_/, "").trim();

  // 1. Prevent self-referral
  if (cleanRefParam === newTgId || cleanRefParam.includes(newTgId)) {
    logger.info(`Self-referral ignored for user ${newTgId}`);
    return { success: false, reason: "self_referral" };
  }

  try {
    const newUserDocRef = db.collection("users").doc(`tg_${newTgId}`);
    const newUserSnap = await newUserDocRef.get();

    // 2. Prevent duplicate referral: check if new user already has a referredBy
    if (newUserSnap.exists) {
      const data = newUserSnap.data();
      if (data.referredBy) {
        logger.info(`User ${newTgId} already referred by ${data.referredBy}. Duplicate ignored.`);
        return { success: false, reason: "already_referred" };
      }
    }

    // 3. Find Referrer in Firestore
    let referrerDocRef = null;
    let referrerTgId = null;
    let referrerData = null;

    // Check direct doc `tg_${cleanRefParam}`
    const directDoc = await db.collection("users").doc(`tg_${cleanRefParam}`).get();
    if (directDoc.exists) {
      referrerDocRef = db.collection("users").doc(`tg_${cleanRefParam}`);
      referrerTgId = cleanRefParam;
      referrerData = directDoc.data();
    } else {
      // Check doc `users/${cleanRefParam}`
      const altDoc = await db.collection("users").doc(cleanRefParam).get();
      if (altDoc.exists) {
        referrerDocRef = db.collection("users").doc(cleanRefParam);
        referrerData = altDoc.data();
        referrerTgId = String(referrerData.telegramId || referrerData.rawTelegramId || cleanRefParam.replace('tg_', ''));
      } else {
        // Query by telegramId field
        const querySnap = await db.collection("users").where("telegramId", "==", cleanRefParam).limit(1).get();
        if (!querySnap.empty) {
          referrerDocRef = querySnap.docs[0].ref;
          referrerData = querySnap.docs[0].data();
          referrerTgId = cleanRefParam;
        }
      }
    }

    // If referrer document does not exist yet, initialize it
    if (!referrerDocRef) {
      if (/^\d+$/.test(cleanRefParam)) {
        referrerTgId = cleanRefParam;
        referrerDocRef = db.collection("users").doc(`tg_${referrerTgId}`);
        referrerData = { telegramId: referrerTgId, balance: 0, tokens: 0, referralCount: 0 };
      } else {
        logger.warn(`Referrer not found for param: ${cleanRefParam}`);
        return { success: false, reason: "referrer_not_found" };
      }
    }

    const REFER_REWARD = 50; // 50৳ per refer

    // 4. Update Referrer's balance (+50৳), tokens (+50), referral count (+1), and referral bonus (+50৳)
    await referrerDocRef.set(
      {
        telegramId: referrerTgId,
        balance: FieldValue.increment(REFER_REWARD),
        referralCount: FieldValue.increment(1),
        referralBonus: FieldValue.increment(REFER_REWARD),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    // 5. Update New User record with referredBy
    await newUserDocRef.set(
      {
        telegramId: newTgId,
        referredBy: referrerTgId,
        referredAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    // 6. Record entry in `referrals` collection
    const newUserName = [newUser.first_name, newUser.last_name].filter(Boolean).join(" ") || newUser.first_name || newUser.username || "নতুন বন্ধু";
    await db.collection("referrals").add({
      referrerId: referrerTgId,
      referredUserId: newTgId,
      referredName: newUserName,
      rewardAmount: REFER_REWARD,
      createdAt: FieldValue.serverTimestamp()
    });

    // 7. Send Telegram Bot Notification to Referrer (Original Professional Text Format with Styled Buttons)
    const newTotalCount = ((referrerData?.referralCount || 0) + 1);
    const notifyMessage = 
`🎉 <b>অভিনন্দন! নতুন রেফারেল সফল হয়েছে!</b>

👤 <b>${newUserName}</b> আপনার রেফারেল লিংক দিয়ে Bengali Pay-তে জয়েন করেছেন।

💰 আপনার একাউন্টে <b>+৫০৳</b> রেফারেল বোনাস জমা হয়েছে!
👥 আপনার মোট সফল রেফারেল: <b>${newTotalCount} জন।</b>

কামলা দিন, টোকেন কামিয়ে বিকাশ ও নগদে ক্যাশআউট করুন! ৳`;

    const baseAppUrl = (APP_URL || "https://bengali-pay.netlify.app/").replace(/\/+$/, "");
    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: "🚀 অ্যাপে ব্যালেন্স দেখুন",
            web_app: { url: `${baseAppUrl}/` },
            style: "success"
          }
        ],
        [
          {
            text: "অফিসিয়াল গ্রুপ / চ্যানেল",
            url: "https://t.me/BengaliPay",
            style: "danger"
          }
        ]
      ]
    };

    const targetChatId = String(referrerTgId || referrerData?.telegramId || referrerData?.rawTelegramId || cleanRefParam).replace(/^tg_/, "").trim();

    if (targetChatId && /^\d+$/.test(targetChatId)) {
      logger.info(`Sending referral notification to ${targetChatId}...`);
      const sendRes = await telegramApi("sendMessage", {
        chat_id: targetChatId,
        text: notifyMessage,
        parse_mode: "HTML",
        reply_markup: replyMarkup
      });
      logger.info(`Referral notification result for ${targetChatId}:`, JSON.stringify(sendRes));
    } else {
      logger.warn(`Cannot send notification: targetChatId [${targetChatId}] is not a valid numeric Telegram ID.`);
    }

    logger.info(`Referral successfully processed: new user ${newTgId} referred by ${referrerTgId}, +50৳ credited.`);
    return { success: true, referrerTgId, reward: REFER_REWARD };
  } catch (err) {
    logger.error("Error processing referral reward:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send Welcome Message with WebApp Play button
 */
async function sendWelcome(chatId, user) {
  const message = 
`<b>স্বাগতম Bengali Pay-তে!</b>
কামলা দাও, টাস্ক করো আর রিওয়ার্ড কামাও! 

গেম • টাস্ক • রেফার
বিকাশ ও নগদে উত্তোলনের সুযোগ!

নিচের বাটনে ক্লিক করে শুরু করুন।`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "Start",
          web_app: { url: APP_URL },
          style: "success"
        }
      ],
      [
        {
          text: "অফিসিয়াল গ্রুপ / চ্যানেল",
          url: "https://t.me/BengaliPay",
          style: "danger"
        }
      ],
      [
        {
          text: "সাহায্য ও নিয়ম",
          callback_data: "help_info",
          style: "success"
        }
      ]
    ]
  };

  const photoUrl = `${APP_URL}start-image.jpg`;
  const photoRes = await telegramApi("sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption: message,
    parse_mode: "HTML",
    reply_markup: replyMarkup
  });

  if (photoRes && photoRes.ok) return photoRes;

  return await telegramApi("sendMessage", {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
    reply_markup: replyMarkup
  });
}

/**
 * Send Help Information
 */
async function sendHelp(chatId) {
  const message = 
`ℹ️ <b>Bengali Pay সাহায্য কেন্দ্র:</b>

1. <b>টোকেন থেকে টাকা:</b>
প্রতিটি টাস্ক এবং স্পিন থেকে প্রাপ্ত টোকেন আপনার অ্যাকাউন্টে জমা হবে।

2. <b>উইথড্র নিয়ম:</b>
সর্বনিম্ন ৫০০ টাকা হলে বিকাশ বা নগদ নম্বরে উইথড্র রিকোয়েস্ট পাঠাতে পারবেন। সাধারণত ১২ থেকে ২৪ ঘণ্টার মধ্যে পেমেন্ট প্রসেস হয়।

3. <b>ডেইলি চেক-ইন:</b>
প্রতিদিন অ্যাপ ওপেন করে দৈনিক ৫টি ফ্রি টোকেন ক্লেইম করুন!

এখনই খেলতে নিচের বাটনে ক্লিক করুন:`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "Start",
          web_app: { url: APP_URL },
          style: "success"
        }
      ],
      [
        {
          text: "অফিসিয়াল গ্রুপ / চ্যানেল",
          url: "https://t.me/BengaliPay",
          style: "danger"
        }
      ],
      [
        {
          text: "🔙 প্রধান মেনু",
          callback_data: "main_menu",
          style: "success"
        }
      ]
    ]
  };

  return await telegramApi("sendMessage", {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
    reply_markup: replyMarkup
  });
}

/**
 * Primary Telegram Bot Webhook Endpoint
 * Telegram will POST updates directly here
 */
export const telegramBot = onRequest(
  { cors: true, maxInstances: 15, timeoutSeconds: 30 },
  async (req, res) => {
    // Health check on GET
    if (req.method !== "POST") {
      res.status(200).send("✅ Bengali Pay Telegram Bot Cloud Function is Active!");
      return;
    }

    const update = req.body;
    if (!update) {
      res.status(200).send("No update");
      return;
    }

    // Direct API call from Mini App to process referral
    if (update.action === "claim_referral") {
      const { user, referrerParam } = update;
      const result = await processReferralReward(user, referrerParam);
      res.status(200).json({ ok: true, result });
      return;
    }

    // Direct API call from Mini App to verify @BengaliPay channel membership
    if (update.action === "check_channel_member") {
      const cleanId = String(update.userId || update.user_id || update.userTelegramId || "").replace("tg_", "").trim();
      if (!cleanId) {
        res.status(200).json({ ok: true, isMember: false, reason: "no_user_id" });
        return;
      }

      const checkRes = await telegramApi("getChatMember", {
        chat_id: "@BengaliPay",
        user_id: cleanId
      });

      if (checkRes && checkRes.ok && checkRes.result) {
        const status = checkRes.result.status;
        const isMember = ["creator", "administrator", "member", "restricted"].includes(status);
        res.status(200).json({ ok: true, isMember, status });
      } else {
        res.status(200).json({ ok: true, isMember: false, error: checkRes?.description || "not_member" });
      }
      return;
    }

    try {
      // 1. Text Messages
      if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text.trim();
        const user = update.message.from || {};

        logger.info(`Incoming command [${text}] from ${user.username || user.first_name}`);

        // Track Telegram user ID as string and name in Firestore
        if (user && user.id) {
          await trackUserInFirestore(user);
        }

        if (text.startsWith("/start") || text.startsWith("/play")) {
          // Check if start command has referral parameter (e.g. /start 123456789)
          const parts = text.split(/\s+/);
          if (parts.length > 1 && parts[1]) {
            const startParam = parts[1].trim();
            logger.info(`Received /start with referral param: ${startParam}`);
            await processReferralReward(user, startParam);
          }
          await sendWelcome(chatId, user);
        } else if (text.startsWith("/help")) {
          await sendHelp(chatId);
        } else {
          await sendWelcome(chatId, user);
        }
      }

      // 2. Inline Callback Queries
      if (update.callback_query) {
        const cb = update.callback_query;
        const chatId = cb.message?.chat?.id;
        if (cb.from && cb.from.id) {
          await trackUserInFirestore(cb.from);
        }
        if (cb.data === "help_info" && chatId) {
          await sendHelp(chatId);
        }
        await telegramApi("answerCallbackQuery", {
          callback_query_id: cb.id
        });
      }
    } catch (err) {
      logger.error("Error processing update:", err);
    }

    // Always respond 200 OK to Telegram
    res.status(200).json({ ok: true });
  }
);

/**
 * Dedicated endpoint for Mini App to record and process referral
 */
export const claimReferral = onRequest(
  { cors: true, maxInstances: 15, timeoutSeconds: 30 },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(200).send("claimReferral endpoint active");
      return;
    }
    try {
      const { user, referrerParam } = req.body || {};
      const result = await processReferralReward(user, referrerParam);
      res.status(200).json({ ok: true, result });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }
);

/**
 * Helper endpoint to configure Telegram Chat Menu Button
 * Visit this endpoint once in browser or curl to set the button
 */
export const setupMenu = onRequest(
  { cors: true, timeoutSeconds: 15 },
  async (req, res) => {
    const result = await telegramApi("setChatMenuButton", {
      menu_button: {
        type: "web_app",
        text: "Play ৳",
        web_app: {
          url: APP_URL
        }
      }
    });
    res.status(200).json(result);
  }
);
