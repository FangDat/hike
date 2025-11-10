import { firebaseConfig } from '../firebaseConfig'; // fill in your config
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';

// ---------- In-memory fallback (kept for dev/emulator) ----------
let memHikes = [];
let memId = 1;

// ---------- Firebase (Firestore) state ----------
let firestore = null;
let firestoreEnabled = false;

// init firebase app if not already
const ensureFirebase = () => {
  try {
    if (!getApps()?.length) {
      initializeApp(firebaseConfig);
    }
    firestore = getFirestore();
    firestoreEnabled = true;
    console.log('✅ Firestore initialized (using Firebase).');
  } catch (err) {
    firestore = null;
    firestoreEnabled = false;
    console.log('⚠️ Firestore init failed, will use in-memory fallback.', err);
  }
};

// Public check (for debugging)
export const isFirestoreEnabled = () => firestoreEnabled;

// initDatabase: here we ensure firebase is initialized. Firestore doesn't require creating tables.
export const initDatabase = async () => {
  // make sure user filled firebaseConfig
  if (
    !firebaseConfig ||
    firebaseConfig.apiKey === 'YOUR_API_KEY' ||
    !firebaseConfig.projectId
  ) {
    console.warn('⚠️ firebaseConfig seems not configured in firebaseConfig.js');
    // still try to initialize; ensureFirebase will fail and fallback to mem
  }

  ensureFirebase();

  // return true if firestore ready, otherwise false (fallback)
  return firestoreEnabled;
};

// Collection name
const HIKES_COLLECTION = 'hikes';

// ------------------- CRUD: Firestore-backed (but same public names) -------------------

// INSERT
export const insertHikefilebase= async (hike) => {
  if (firestoreEnabled && firestore) {
    // Add createdAt for ordering
    const docRef = await addDoc(collection(firestore, HIKES_COLLECTION), {
      ...hike,
      createdAt: Date.now()
    });
    return { success: true, id: docRef.id };
  } else {
    // in-memory fallback
    const copy = { ...hike, id: memId++ };
    memHikes.push(copy);
    return { success: true, id: copy.id };
  }
};

// GET ALL
export const getAllHikesfilebase = async () => {
  if (firestoreEnabled && firestore) {
    const q = query(collection(firestore, HIKES_COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return arr;
  } else {
    // return shallow copy, newest first
    return [...memHikes].reverse();
  }
};

// UPDATE
export const updateHikefilebase = async (hike) => {
  if (firestoreEnabled && firestore) {
    if (!hike.id) throw new Error('Missing id in hike for update');
    const ref = doc(firestore, HIKES_COLLECTION, hike.id);
    // do not update createdAt (keep)
    const { id, createdAt, ...rest } = hike;
    await updateDoc(ref, rest);
    return { success: true };
  } else {
    const idx = memHikes.findIndex(h => h.id === hike.id);
    if (idx !== -1) memHikes[idx] = { ...hike };
    return { success: true };
  }
};

// DELETE
export const deleteHikefilebase = async (id) => {
  if (firestoreEnabled && firestore) {
    const ref = doc(firestore, HIKES_COLLECTION, id.toString());
    await deleteDoc(ref);
    return { success: true };
  } else {
    memHikes = memHikes.filter(h => h.id !== id);
    return { success: true };
  }
};

// RESET (delete all)
export const resetHikesfilebase = async () => {
  if (firestoreEnabled && firestore) {
    // Firestore has no single SQL delete; we read docs then batch delete
    const snap = await getDocs(collection(firestore, HIKES_COLLECTION));
    if (snap.empty) return { success: true };
    const batch = writeBatch(firestore);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    return { success: true };
  } else {
    memHikes = [];
    memId = 1;
    return { success: true };
  }
};

/* 
  -------------------------
  NOTES & fallback info
  -------------------------
  - This file keeps the function names you already use in screens so you don't
    need to modify UI files.
  - If firebaseConfig.js is not filled, the code will fallback to in-memory.
  - Firestore documents will have an auto-generated document id (string).
  - For compatibility with your previous UI which expected numeric `id` in-memory,
    we still return objects with `id` properties. When using Firestore, `id` is the doc id (string).
*/

/* -------------- OPTIONAL / OLD: (SQLite code kept for reference) --------------
If you want to keep your old expo-sqlite implementation, you can paste it here or
restore it later. I intentionally didn't delete any of your UI files.
------------------------------------------------------------------------------ */
