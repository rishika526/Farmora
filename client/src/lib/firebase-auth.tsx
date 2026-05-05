import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type Auth } from "firebase/auth";
import { syncFirebaseUser, type FarmoraUser } from "@/lib/api";

type AuthContextValue = {
  user: FarmoraUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

function getFirebaseAuth() {
  if (firebaseAuth) return firebaseAuth;

  // Required Vite env vars:
  // VITE_FIREBASE_API_KEY
  // VITE_FIREBASE_AUTH_DOMAIN
  // VITE_FIREBASE_PROJECT_ID
  // VITE_FIREBASE_APP_ID
  // Optional: VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  };

  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error("Firebase is not configured. Add the VITE_FIREBASE_* values to your .env file.");
  }

  firebaseApp = firebaseApp || initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  return firebaseAuth;
}

function getPreferredRole(): "creator" | "user" {
  const role = window.localStorage.getItem("farmora:selected-role") || window.sessionStorage.getItem("farmora:active-role");
  return role === "creator" ? "creator" : "user";
}

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FarmoraUser | null>(() => {
    const cached = window.localStorage.getItem("farmora:firebase-user");
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser?.email) {
          setUser(null);
          window.localStorage.removeItem("farmora:firebase-user");
          return;
        }

        setLoading(true);
        try {
          const synced = await syncFirebaseUser({
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            preferredRole: getPreferredRole(),
          });
          setUser(synced);
          window.localStorage.setItem("farmora:firebase-user", JSON.stringify(synced));
        } finally {
          setLoading(false);
        }
      });
    } catch {
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, []);

  async function loginWithGoogle() {
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      if (!result.user.email) throw new Error("Google account did not return an email address.");
      const synced = await syncFirebaseUser({
        email: result.user.email,
        name: result.user.displayName,
        photoURL: result.user.photoURL,
        preferredRole: getPreferredRole(),
      });
      setUser(synced);
      window.localStorage.setItem("farmora:firebase-user", JSON.stringify(synced));
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await signOut(getFirebaseAuth());
    } catch {
      // If Firebase was not configured, still clear the local presentation state.
    }
    setUser(null);
    window.localStorage.removeItem("farmora:firebase-user");
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    loginWithGoogle,
    logout,
    isAdmin: user?.role === "admin",
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useFirebaseAuth must be used inside FirebaseAuthProvider");
  return context;
}
