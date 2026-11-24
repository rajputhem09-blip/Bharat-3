import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import config from '../../firebase-applet-config.json';

// Initialize or retrieve Firebase App instance
export const app = !getApps().length ? initializeApp(config) : getApp();

// Firebase Auth Instance
export const auth = getAuth(app);

// Firestore Instance with configured database ID
export const db =
  config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, config.firestoreDatabaseId)
    : getFirestore(app);

// Export alias 'firestore' for flexible import naming
export const firestore = db;

// Firebase Storage Instance
export const storage = getStorage(app);

export default app;
