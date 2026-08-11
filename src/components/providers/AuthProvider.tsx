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
  onAuthStateChanged,
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
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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
    const auth = getFirebaseAuth();
    if (!auth) {
      setError(
        "Firebase לא הוגדר. הוסיפו מפתחות ב־.env.local לפי .env.example",
      );
      return;
    }
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "התחברות עם Google נכשלה";
      setError(message);
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
      logout,
      clearError: () => setError(null),
    }),
    [user, loading, configured, error, signInWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
