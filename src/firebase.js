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

// Your web app's Firebase configuration provided by Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCiF8QAMmXXUPAnOBvsZ8J4uc1bY4PHaoI",
  authDomain: "bengali-pay.firebaseapp.com",
  projectId: "bengali-pay",
  storageBucket: "bengali-pay.firebasestorage.app",
  messagingSenderId: "1041405609011",
  appId: "1:1041405609011:web:afcafb83732c9cb6368f46",
  measurementId: "G-59QKDTTTJ3"
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
 */
export const getUserId = () => {
  try {
    // 1. Check Telegram WebApp user ID
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return `tg_${window.Telegram.WebApp.initDataUnsafe.user.id}`;
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
 * Listen to user data from Firestore in real-time
 */
export const subscribeUserData = (userId, onDataUpdate, onError) => {
  if (!userId) return () => {};
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
      console.warn("Firestore subscription notice:", err?.message || err);
      if (onError) onError(err);
    }
  );
};

/**
 * Save or update user data in Firestore
 */
export const saveUserToFirestore = async (userId, data) => {
  if (!userId) return;
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
    console.warn("Firestore save notice:", error?.message || error);
  }
};

/**
 * Submit withdrawal request to Firestore `withdrawals` collection
 */
export const submitWithdrawalToFirestore = async (withdrawalData) => {
  try {
    const withdrawalsCol = collection(db, "withdrawals");
    const docRef = await addDoc(withdrawalsCol, {
      ...withdrawalData,
      status: "pending",
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.warn("Withdrawal submission notice:", error?.message || error);
    return { success: false, error: error?.message || error };
  }
};

/**
 * Listen to user's withdrawals from Firestore in real-time
 */
export const subscribeUserWithdrawals = (userId, onUpdate) => {
  if (!userId) return () => {};
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
        console.warn("Withdrawals subscription notice:", err?.message || err);
        onUpdate([]);
      }
    );
  } catch (e) {
    console.warn("Withdrawals query error:", e);
    return () => {};
  }
};
