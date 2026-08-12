"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { useTripMetaStore } from "@/store/tripMeta";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function authErrorMessage(err: unknown, fallback: string): string {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-email":
      return "כתובת האימייל אינה תקינה";
    case "auth/user-disabled":
      return "החשבון הושבת. פנו לתמיכה";
    case "auth/user-not-found":
      return "לא נמצא משתמש עם האימייל הזה";
    case "auth/wrong-password":
      return "סיסמה שגויה";
    case "auth/invalid-credential":
      return "אימייל או סיסמה שגויים";
    case "auth/email-already-in-use":
      return "האימייל הזה כבר רשום. נסו להתחבר";
    case "auth/weak-password":
      return "הסיסמה חלשה מדי (לפחות 6 תווים)";
    case "auth/missing-password":
      return "יש להזין סיסמה";
    case "auth/missing-email":
      return "יש להזין אימייל";
    case "auth/too-many-requests":
      return "יותר מדי ניסיונות. נסו שוב בעוד כמה דקות";
    case "auth/network-request-failed":
      return "בעיית רשת. בדקו את החיבור ונסו שוב";
    case "auth/operation-not-allowed":
      return "התחברות באימייל אינה מופעלת ב־Firebase Console";
    case "auth/popup-closed-by-user":
      return "חלון ההתחברות נסגר לפני השלמה";
    case "auth/cancelled-popup-request":
      return "בקשת ההתחברות בוטלה";
    case "auth/account-exists-with-different-credential":
      return "קיים חשבון עם האימייל הזה באמצעי התחברות אחר";
    default:
      return err instanceof Error && err.message ? err.message : fallback;
  }
}

function ensureAuth() {
  const auth = getFirebaseAuth();
  if (!auth) {
    return {
      auth: null as ReturnType<typeof getFirebaseAuth>,
      error: "Firebase לא הוגדר. הוסיפו מפתחות ב־.env.local לפי .env.example",
    };
  }
  return { auth, error: null as string | null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next);
      if (next) {
        useTripMetaStore.getState().markPersonalAccount();
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { auth, error: configError } = ensureAuth();
    if (!auth) {
      setError(configError);
      return false;
    }
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      return true;
    } catch (err) {
      setError(authErrorMessage(err, "התחברות עם Google נכשלה"));
      return false;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { auth, error: configError } = ensureAuth();
    if (!auth) {
      setError(configError);
      return false;
    }
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return true;
    } catch (err) {
      setError(authErrorMessage(err, "התחברות נכשלה"));
      return false;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { auth, error: configError } = ensureAuth();
    if (!auth) {
      setError(configError);
      return false;
    }
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      return true;
    } catch (err) {
      setError(authErrorMessage(err, "הרשמה נכשלה"));
      return false;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { auth, error: configError } = ensureAuth();
    if (!auth) {
      setError(configError);
      return false;
    }
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (err) {
      setError(authErrorMessage(err, "שליחת איפוס סיסמה נכשלה"));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setError(null);
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      error,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
      logout,
      clearError: () => setError(null),
    }),
    [
      user,
      loading,
      configured,
      error,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
