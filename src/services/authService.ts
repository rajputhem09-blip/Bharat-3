import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import { UserProfile } from '../types';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

// 1. Setup Invisible/Visible ReCaptcha for Phone Auth
export const setupPhoneRecaptcha = (containerId: string = 'recaptcha-container') => {
  if (typeof window === 'undefined') return undefined;
  try {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {
        // ignore clear error
      }
      delete window.recaptchaVerifier;
    }

    // Ensure container exists in DOM or create invisible helper container
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA response expired. Please retry.');
      },
    });

    return window.recaptchaVerifier;
  } catch (error) {
    console.error('Error initializing RecaptchaVerifier:', error);
    throw error;
  }
};

// 2. Send OTP to Phone Number
export const sendPhoneOtp = async (phoneNumber: string): Promise<ConfirmationResult> => {
  try {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const formattedPhone = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+91${digitsOnly.slice(-10)}`;

    const verifier = setupPhoneRecaptcha('recaptcha-container');
    if (!verifier) {
      throw new Error('reCAPTCHA security verifier could not be initialized.');
    }

    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (error: any) {
    console.error('Failed to send OTP via Firebase:', error);
    let userMsg = 'Failed to send OTP code. Please check your phone number.';
    if (error?.code === 'auth/invalid-phone-number') {
      userMsg = 'Invalid phone number format. Please enter a valid 10-digit mobile number.';
    } else if (error?.code === 'auth/quota-exceeded' || error?.code === 'auth/too-many-requests') {
      userMsg = 'SMS request limit reached. Please wait a few minutes before trying again.';
    } else if (error?.code === 'auth/captcha-check-failed') {
      userMsg = 'reCAPTCHA verification failed. Please refresh the page and try again.';
    } else if (error?.code === 'auth/missing-phone-number') {
      userMsg = 'Phone number is required.';
    } else if (error?.code === 'auth/network-request-failed') {
      userMsg = 'Network connection error. Please check your internet connection.';
    } else if (error?.message) {
      userMsg = error.message;
    }
    const customErr = new Error(userMsg);
    (customErr as any).code = error?.code;
    throw customErr;
  }
};

// 3. Confirm OTP and Login User
export const verifyPhoneOtp = async (otpCode: string): Promise<User> => {
  if (!window.confirmationResult) {
    throw new Error('No active OTP session found. Please request a new OTP code.');
  }
  try {
    const cleanCode = otpCode.trim().replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      throw new Error('Please enter a valid 6-digit OTP code.');
    }
    const result = await window.confirmationResult.confirm(cleanCode);
    return result.user;
  } catch (error: any) {
    console.error('Firebase OTP verification failed:', error);
    let userMsg = 'Invalid or expired OTP code. Please try again.';
    if (error?.code === 'auth/invalid-verification-code') {
      userMsg = 'The 6-digit OTP you entered is incorrect. Please check and re-enter.';
    } else if (error?.code === 'auth/code-expired') {
      userMsg = 'This OTP has expired. Please tap "Resend Now" to get a fresh code.';
    } else if (error?.code === 'auth/session-expired') {
      userMsg = 'Verification session expired. Please request a new OTP.';
    } else if (error?.code === 'auth/network-request-failed') {
      userMsg = 'Network connection error during verification. Please retry.';
    } else if (error?.message) {
      userMsg = error.message;
    }
    const customErr = new Error(userMsg);
    (customErr as any).code = error?.code;
    throw customErr;
  }
};

// 4. Fetch User Profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: uid,
        name: data.displayName || data.name || 'Bharat User',
        phone: data.phoneNumber || '',
        handle: data.username || data.handle || `user_${uid.slice(0, 5)}`,
        avatar: data.profilePhoto || data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        statusQuote: data.bio || data.statusQuote || 'Building the digital future of Bharat 🇮🇳',
        isOnline: data.isOnline ?? true,
        isVerified: data.isVerified ?? true,
        upiId: data.upiId || `${(data.username || 'user')}@bharatpay`,
        locale: data.language || data.locale || 'en',
        bio: data.bio || '',
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// 5. Create or Update User Profile
export const saveUserProfile = async (
  uid: string,
  profileData: Partial<UserProfile> & { phoneNumber?: string }
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const payload = {
      uid,
      displayName: profileData.name || 'Bharat User',
      name: profileData.name || 'Bharat User',
      phoneNumber: profileData.phone || profileData.phoneNumber || '',
      username: profileData.handle || `user_${uid.slice(0, 5)}`,
      handle: profileData.handle || `user_${uid.slice(0, 5)}`,
      profilePhoto: profileData.avatar || '',
      avatar: profileData.avatar || '',
      bio: profileData.statusQuote || profileData.bio || '',
      statusQuote: profileData.statusQuote || '',
      upiId: profileData.upiId || `${(profileData.handle || 'user')}@bharatpay`,
      language: profileData.locale || 'en',
      locale: profileData.locale || 'en',
      isOnline: true,
      isVerified: true,
      updatedAt: serverTimestamp(),
    };

    await setDoc(userDocRef, payload, { merge: true });

    // Also reserve username if provided
    if (profileData.handle) {
      const usernameRef = doc(db, 'usernames', profileData.handle.toLowerCase());
      await setDoc(usernameRef, { uid, username: profileData.handle.toLowerCase() }, { merge: true });
    }
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// 6. Check if username is available
export const checkUsernameAvailability = async (username: string, currentUid?: string): Promise<boolean> => {
  try {
    const cleanUsername = username.toLowerCase().trim();
    if (!cleanUsername) return false;
    const docRef = doc(db, 'usernames', cleanUsername);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return true;
    if (currentUid && snap.data()?.uid === currentUid) return true;
    return false;
  } catch {
    return true;
  }
};

// 7. Upload Media / Profile Photo to Firebase Storage
export const uploadFileToStorage = async (
  file: File | Blob,
  path: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const uploadTask = await uploadBytesResumable(storageRef, file);
    const downloadUrl = await getDownloadURL(uploadTask.ref);
    return downloadUrl;
  } catch (error) {
    console.error('Storage upload failed:', error);
    throw error;
  }
};

// 8. Sign Out
export const logoutFirebaseUser = async (): Promise<void> => {
  if (auth.currentUser) {
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, { isOnline: false, lastSeen: serverTimestamp() });
    } catch {
      // ignore
    }
  }
  await signOut(auth);
};

// 9. Sign in as Guest (Anonymous Firebase Auth session if enabled)
export const signInGuestUser = async (): Promise<User | null> => {
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (error: any) {
    // If anonymous sign-in is restricted or not enabled in Firebase Console, fallback silently without throwing
    if (
      error?.code === 'auth/admin-restricted-operation' ||
      error?.code === 'auth/operation-not-allowed'
    ) {
      return null;
    }
    console.info('Anonymous sign-in skipped (using local guest mode):', error?.message || error);
    return null;
  }
};

