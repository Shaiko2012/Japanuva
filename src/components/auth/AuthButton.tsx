"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cloud, LogIn, LogOut, Pencil, UserRound } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { GlassModal } from "@/components/editor/GlassModal";
import { TripSetupWizard } from "@/components/auth/TripSetupWizard";
import {
  formatTripRangeHe,
  useTripMetaStore,
} from "@/store/tripMeta";
import { useFamilyStore } from "@/store/family";
import { cn } from "@/lib/utils";

export function AuthButton() {
  const {
    user,
    loading,
    configured,
    error,
    signInWithGoogle,
    logout,
    clearError,
  } = useAuth();
  const onboardingCompleted = useTripMetaStore((s) => s.onboardingCompleted);
  const startDate = useTripMetaStore((s) => s.startDate);
  const endDate = useTripMetaStore((s) => s.endDate);
  const family = useFamilyStore((s) => s.family);

  const [open, setOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingGoogle, setPendingGoogle] = useState(false);

  async function handleGoogle() {
    if (!onboardingCompleted) {
      setPendingGoogle(true);
      setOpen(false);
      setSetupOpen(true);
      return;
    }
    setBusy(true);
    clearError();
    await signInWithGoogle();
    setBusy(false);
    setOpen(false);
  }

  async function afterSetupFinished() {
    setSetupOpen(false);
    if (pendingGoogle) {
      setPendingGoogle(false);
      setBusy(true);
      clearError();
      await signInWithGoogle();
      setBusy(false);
    } else {
      setOpen(true);
    }
  }

  async function handleLogout() {
    setBusy(true);
    await logout();
    setBusy(false);
    setOpen(false);
  }

  if (loading) {
    return (
      <div className="h-11 w-11 animate-pulse rounded-full border border-border bg-surface" />
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1.5 text-xs font-medium transition hover:border-accent/40 hover:text-accent",
          user && "border-accent/30 bg-accent-soft text-accent",
        )}
        aria-label={user ? "חשבון Google" : "התחברות"}
      >
        {user?.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5">
            <UserRound className="h-3.5 w-3.5" />
          </span>
        )}
        <span className="hidden max-w-[9rem] truncate sm:inline">
          {user ? user.displayName || user.email : "התחברות"}
        </span>
      </button>

      <GlassModal
        open={open}
        onClose={() => {
          setOpen(false);
          clearError();
        }}
        title={user ? "החשבון שלי" : "הרשמה / התחברות"}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-muted">
            לפני יצירת חשבון נבקש תאריכי טיול והרכב משפחה. אחר כך אפשר לשנות
            הכל מהדשבורד, והכל יישמר בענן אחרי Google.
          </p>

          <div className="rounded-2xl border border-border bg-background/35 p-3 text-xs leading-5 text-muted">
            <div>
              תאריכים:{" "}
              <span className="font-medium text-foreground">
                {formatTripRangeHe(startDate, endDate)}
              </span>
            </div>
            <div className="mt-1">
              משפחה:{" "}
              <span className="font-medium text-foreground">
                {family.adults} מבוגרים · {family.kids} ילדים
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPendingGoogle(false);
                setSetupOpen(true);
              }}
              className="mt-2 inline-flex items-center gap-1 text-accent hover:underline"
            >
              <Pencil className="h-3 w-3" />
              עריכת פרטי הטיול
            </button>
          </div>

          {!configured && (
            <div className="rounded-2xl border border-warning/35 bg-warning/10 p-3 text-xs leading-5 text-warning">
              Firebase עדיין לא הוגדר. מלאו את{" "}
              <code className="rounded bg-background/40 px-1">.env.local</code>.
            </div>
          )}

          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/35 p-3">
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt=""
                    className="h-12 w-12 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <UserRound className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    {user.displayName || "משתמש Google"}
                  </div>
                  <div className="truncate text-xs text-muted">{user.email}</div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs text-success">
                <Cloud className="h-3.5 w-3.5" />
                שמירה בענן פעילה (מסלול · משפחה · תאריכים · מפה)
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm hover:border-accent/40"
              >
                <LogOut className="h-4 w-4" />
                התנתקות
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy || !configured}
              onClick={handleGoogle}
              className="glow-accent inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              {busy
                ? "מתחבר..."
                : onboardingCompleted
                  ? "המשך עם Google"
                  : "הגדרת טיול ואז Google"}
            </button>
          )}

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 text-xs text-accent"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </GlassModal>

      <TripSetupWizard
        open={setupOpen}
        allowSkip
        onClose={() => {
          setSetupOpen(false);
          setPendingGoogle(false);
        }}
        onFinished={afterSetupFinished}
        title={
          pendingGoogle
            ? "לפני יצירת חשבון · פרטי הטיול"
            : "עריכת פרטי הטיול"
        }
      />
    </>
  );
}
