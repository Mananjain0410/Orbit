import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { 
  initializeAppCheck, 
  ReCaptchaV3Provider, 
  ReCaptchaEnterpriseProvider, 
  AppCheck 
} from 'firebase/app-check';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey || "dummy",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || "dummy",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || "dummy",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || "dummy",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId || "dummy",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId || "dummy"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Singleton instance for App Check
let appCheckInstance: AppCheck | null = null;

export function initAppCheck(): AppCheck | null {
  if (appCheckInstance) {
    return appCheckInstance;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const siteKey = 
    import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY || 
    import.meta.env.VITE_RECAPTCHA_SITE_KEY || 
    (firebaseConfigJson as { recaptchaSiteKey?: string }).recaptchaSiteKey;

  const isEnterprise = 
    import.meta.env.VITE_FIREBASE_RECAPTCHA_ENTERPRISE === 'true' || 
    import.meta.env.VITE_RECAPTCHA_ENTERPRISE === 'true' ||
    Boolean((firebaseConfigJson as { isRecaptchaEnterprise?: boolean }).isRecaptchaEnterprise);

  // Allow debug token in development mode if configured
  if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN) {
    // @ts-expect-error Firebase App Check debug token global definition
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN === 'true' 
      ? true 
      : import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
  }

  if (siteKey && siteKey.trim() !== '') {
    try {
      const provider = isEnterprise
        ? new ReCaptchaEnterpriseProvider(siteKey)
        : new ReCaptchaV3Provider(siteKey);

      appCheckInstance = initializeAppCheck(app, {
        provider,
        isTokenAutoRefreshEnabled: true,
      });
      console.log(`Firebase App Check initialized successfully using ${isEnterprise ? 'reCAPTCHA Enterprise' : 'reCAPTCHA v3'}`);
    } catch (error) {
      console.warn('Firebase App Check initialization skipped or already initialized:', error);
    }
  } else {
    console.warn('Firebase App Check site key is not set. Set VITE_FIREBASE_RECAPTCHA_SITE_KEY or recaptchaSiteKey in firebase-applet-config.json when App Check enforcement is active.');
  }

  return appCheckInstance;
}

// Automatically initialize during app startup in browser environment
if (typeof window !== 'undefined') {
  initAppCheck();
}

