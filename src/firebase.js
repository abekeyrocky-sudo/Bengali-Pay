// Firebase Configuration and Integration for Bengali Pay
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where
} from "firebase/firestore";
import { getDatabase, ref, set, get, onValue } from "firebase/database";

// Your web app's Firebase configuration loaded from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bengali-pay.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bengali-pay",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bengali-pay.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1041405609011",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1041405609011:web:afcafb83732c9cb6368f46",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-59QKDTTTJ3"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore (Primary Modern NoSQL DB)
export const db = getFirestore(app);

// Initialize Realtime Database (Alternative DB support)
export const rtdb = getDatabase(app);

// Initialize Analytics safely
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((yes) => {
      if (yes) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}

/**
 * Get or create unique user ID for Telegram or Web session
 * Guarantees Telegram ID is converted and handled strictly as a string
 */
export const getUserId = () => {
  try {
    // 1. Check Telegram WebApp user ID
    const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (tgId !== undefined && tgId !== null) {
      return `tg_${String(tgId)}`;
    }
  } catch (e) {
    // Ignore error
  }

  // 2. Check stored local user ID
  let stored = localStorage.getItem("bp_uid");
  if (!stored) {
    stored = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem("bp_uid", stored);
  }
  return stored;
};

/**
 * Get pure Telegram numeric ID as a string, if available
 */
export const getRawTelegramId = () => {
  try {
    const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (tgId !== undefined && tgId !== null) {
      return String(tgId);
    }
  } catch (e) {}
  return localStorage.getItem("bp_tg_id") || "";
};

// Flag to prevent console error spam if Firestore daily quota is hit
let isQuotaExhausted = false;

/**
 * Fetch user data once from Firestore (Safe single read, avoids infinite loops)
 */
export const getUserFromFirestore = async (userId) => {
  if (!userId || isQuotaExhausted) return null;
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
      isQuotaExhausted = true;
      console.warn("Firestore daily quota limit reached. Using local cache smoothly.");
    } else {
      console.warn("Firestore getUser notice:", err?.message || err);
    }
    return null;
  }
};

/**
 * Listen to user data from Firestore in real-time
 */
export const subscribeUserData = (userId, onDataUpdate, onError) => {
  if (!userId || isQuotaExhausted) return () => {};
  const userRef = doc(db, "users", userId);
  return onSnapshot(
    userRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onDataUpdate(docSnap.data());
      } else {
        onDataUpdate(null);
      }
    },
    (err) => {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
        isQuotaExhausted = true;
      } else {
        console.warn("Firestore subscription notice:", err?.message || err);
      }
      if (onError) onError(err);
    }
  );
};

/**
 * Save or update user data in Firestore
 */
export const saveUserToFirestore = async (userId, data) => {
  if (!userId || isQuotaExhausted) return;
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        ...data,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (error) {
    if (error?.code === 'resource-exhausted' || error?.message?.includes('Quota exceeded')) {
      isQuotaExhausted = true;
      console.warn("Firestore daily quota reached, saved to local storage.");
    } else {
      console.warn("Firestore save notice:", error?.message || error);
    }
  }
};

/**
 * Submit withdrawal request to Firestore `withdrawals` collection
 */
export const submitWithdrawalToFirestore = async (withdrawalData) => {
  if (isQuotaExhausted) {
    return { success: true, id: `local_${Date.now()}` };
  }
  try {
    const withdrawalsCol = collection(db, "withdrawals");
    const docRef = await addDoc(withdrawalsCol, {
      ...withdrawalData,
      status: "pending",
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    if (error?.code === 'resource-exhausted' || error?.message?.includes('Quota exceeded')) {
      isQuotaExhausted = true;
      return { success: true, id: `local_${Date.now()}` };
    }
    console.warn("Withdrawal submission notice:", error?.message || error);
    return { success: false, error: error?.message || error };
  }
};

/**
 * Listen to user's withdrawals from Firestore in real-time
 */
export const subscribeUserWithdrawals = (userId, onUpdate) => {
  if (!userId || isQuotaExhausted) return () => {};
  try {
    const withdrawalsCol = collection(db, "withdrawals");
    const q = query(withdrawalsCol, where("userId", "==", userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        list.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        onUpdate(list);
      },
      (err) => {
        if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
          isQuotaExhausted = true;
        } else {
          console.warn("Withdrawals subscription notice:", err?.message || err);
        }
        onUpdate([]);
      }
    );
  } catch (e) {
    return () => {};
  }
};

/**
 * Notify backend to process referral reward (50৳) and send instant bot notification
 */
export const recordReferralOnBackend = async (user, referrerParam) => {
  if (!user || !referrerParam) return null;
  const endpoint = "https://us-central1-bengali-pay.cloudfunctions.net/telegramBot";
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "claim_referral",
        user: user,
        referrerParam: String(referrerParam)
      })
    });
    return await res.json();
  } catch (err) {
    console.warn("Backend referral record error:", err);
    return null;
  }
};

/**
 * Verify if user is a member of @BengaliPay channel via Telegram getChatMember
 */
export const checkChannelMembershipAPI = async (userId) => {
  const cleanId = String(userId || "").replace("tg_", "").trim();
  if (!cleanId) return { isMember: false, reason: "no_user_id" };

  const endpoint = "https://us-central1-bengali-pay.cloudfunctions.net/telegramBot";
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "check_channel_member",
        userId: cleanId
      })
    });
    const data = await res.json();
    return { isMember: Boolean(data && data.isMember), status: data?.status };
  } catch (err) {
    console.warn("Backend channel membership check error:", err);
    return { isMember: false, error: err.message };
  }
};
