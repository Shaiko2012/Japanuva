"use client";

import { useId, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cloud, LogIn, LogOut, Pencil, UserRound } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { GlassModal } from "@/components/editor/GlassModal";
import { TripSetupWizard } from "@/components/auth/TripSetupWizard";
import {
  formatTripRangeHe,
  useTripMetaStore,
} from "@/store/tripMeta";
import { useFamilyStore } from "@/store/family";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { softTapProps } from "@/lib/motion";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

type PendingAuth =
  | { kind: "google" }
  | { kind: "email"; mode: AuthMode; email: string; password: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

const inputClass =
  "mt-1.5 w-full min-h-11 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent/50";

function validateEmailPassword(
  email: string,
  password: string,
  confirm: string,
  mode: AuthMode,
): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "יש להזין אימייל";
  if (!EMAIL_RE.test(trimmed)) return "כתובת האימייל אינה תקינה";
  if (!password) return "יש להזין סיסמה";
  if (password.length < MIN_PASSWORD) {
    return `הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD} תווים`;
  }
  if (mode === "signup" && password !== confirm) {
    return "הסיסמאות אינן תואמות";
  }
  return null;
}

export function AuthButton() {
  const {
    user,
    loading,
    configured,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    logout,
    clearError,
  } = useAuth();
  const onboardingCompleted = useTripMetaStore((s) => s.onboardingCompleted);
  const startDate = useTripMetaStore((s) => s.startDate);
  const endDate = useTripMetaStore((s) => s.endDate);
  const family = useFamilyStore((s) => s.family);
  const formId = useId();
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const confirmId = `${formId}-confirm`;

  const [open, setOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<PendingAuth | null>(null);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const tapMotion = softTapProps(reduceMotion);

  function resetFormMessages() {
    setLocalError(null);
    setResetNotice(null);
    clearError();
  }

  async function runEmailAuth(
    authMode: AuthMode,
    nextEmail: string,
    nextPassword: string,
  ) {
    setBusy(true);
    clearError();
    setLocalError(null);
    setResetNotice(null);
    const ok =
      authMode === "signup"
        ? await signUpWithEmail(nextEmail, nextPassword)
        : await signInWithEmail(nextEmail, nextPassword);
    setBusy(false);
    if (ok) {
      setOpen(false);
      setPassword("");
      setConfirmPassword("");
    }
  }

  async function handleGoogle() {
    if (!onboardingCompleted) {
      setPendingAuth({ kind: "google" });
      setOpen(false);
      setSetupOpen(true);
      return;
    }
    setBusy(true);
    clearError();
    setLocalError(null);
    const ok = await signInWithGoogle();
    setBusy(false);
    if (ok) setOpen(false);
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    resetFormMessages();
    const validation = validateEmailPassword(
      email,
      password,
      confirmPassword,
      mode,
    );
    if (validation) {
      setLocalError(validation);
      return;
    }
    if (!onboardingCompleted) {
      setPendingAuth({
        kind: "email",
        mode,
        email: email.trim(),
        password,
      });
      setOpen(false);
      setSetupOpen(true);
      return;
    }
    await runEmailAuth(mode, email, password);
  }

  async function handleForgotPassword() {
    resetFormMessages();
    const trimmed = email.trim();
    if (!trimmed) {
      setLocalError("הזינו אימייל לאיפוס סיסמה");
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setLocalError("כתובת האימייל אינה תקינה");
      return;
    }
    setBusy(true);
    const ok = await resetPassword(trimmed);
    setBusy(false);
    if (ok) {
      setResetNotice("נשלח אימייל לאיפוס סיסמה (בדקו גם בספאם)");
    }
  }

  async function afterSetupFinished() {
    setSetupOpen(false);
    const pending = pendingAuth;
    setPendingAuth(null);
    if (!pending) {
      setOpen(true);
      return;
    }
    if (pending.kind === "google") {
      setBusy(true);
      clearError();
      await signInWithGoogle();
      setBusy(false);
      return;
    }
    await runEmailAuth(pending.mode, pending.email, pending.password);
  }

  async function handleLogout() {
    setBusy(true);
    await logout();
    setBusy(false);
    setOpen(false);
  }

  const displayError = localError || error;

  if (loading) {
    return (
      <div
        className="h-11 w-11 animate-pulse rounded-full border border-border bg-surface"
        aria-hidden
      />
    );
  }

  return (
    <>
      <motion.button
        type="button"
        {...tapMotion}
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-bold transition sm:gap-2 sm:px-3",
          user
            ? "border-border bg-surface-strong text-foreground shadow-[var(--card-shadow)] hover:border-yellow/45 hover:shadow-[var(--card-shadow-hover)]"
            : "glow-accent border-transparent bg-nav-bg text-nav-fg hover:brightness-110",
        )}
        aria-label={user ? "החשבון שלי" : "התחברות"}
      >
        {user?.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt=""
            className="h-7 w-7 shrink-0 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : user ? (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground/5"
            aria-hidden
          >
            <UserRound className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20"
            aria-hidden
          >
            <LogIn className="h-3.5 w-3.5" />
          </span>
        )}
        {user ? (
          <span className="hidden max-w-[9rem] truncate sm:inline">
            {user.displayName || user.email || "החשבון שלי"}
          </span>
        ) : (
          <span className="whitespace-nowrap">התחברות</span>
        )}
      </motion.button>

      <GlassModal
        open={open}
        onClose={() => {
          setOpen(false);
          resetFormMessages();
        }}
        title={user ? "החשבון שלי" : "הרשמה / התחברות"}
      >
        <div className="space-y-5">
          <p className="text-sm leading-6 text-muted">
            לפני יצירת חשבון נבקש תאריכי טיול והרכב משפחה. אחר כך אפשר לשנות
            הכל מהדשבורד, והכל יישמר בענן אחרי ההתחברות.
          </p>

          <div className="rounded-2xl border border-border bg-background/35 p-3.5 text-xs leading-5 text-muted">
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
                setPendingAuth(null);
                setSetupOpen(true);
              }}
              className="mt-2.5 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-1 text-sm text-accent hover:underline"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              עריכת פרטי הטיול
            </button>
          </div>

          {!configured && (
            <div
              role="status"
              className="rounded-2xl border border-warning/35 bg-warning/10 p-3 text-xs leading-5 text-warning"
            >
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
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent"
                    aria-hidden
                  >
                    <UserRound className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    {user.displayName || "משתמש מחובר"}
                  </div>
                  <div className="truncate text-xs text-muted">{user.email}</div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs text-success">
                <Cloud className="h-3.5 w-3.5" aria-hidden />
                שמירה בענן פעילה (מסלול · משפחה · תאריכים · מפה)
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={handleLogout}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm hover:border-accent/40"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                התנתקות
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <SegmentedTabs
                items={[
                  { id: "signin", label: "התחברות" },
                  { id: "signup", label: "הרשמה" },
                ]}
                value={mode}
                onChange={(id) => {
                  setMode(id);
                  resetFormMessages();
                }}
                layoutId="auth-mode-pill"
                aria-label="מצב התחברות"
                className="rounded-2xl border border-border bg-background/35 p-1"
              />

              <form onSubmit={handleEmailSubmit} className="space-y-3.5" noValidate>
                <div>
                  <label
                    htmlFor={emailId}
                    className="block text-sm font-semibold text-foreground"
                  >
                    אימייל
                  </label>
                  <input
                    id={emailId}
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                    disabled={busy || !configured}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(localError && !email.trim())}
                  />
                </div>

                <div>
                  <label
                    htmlFor={passwordId}
                    className="block text-sm font-semibold text-foreground"
                  >
                    סיסמה
                  </label>
                  <input
                    id={passwordId}
                    type="password"
                    name="password"
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder={`לפחות ${MIN_PASSWORD} תווים`}
                    disabled={busy || !configured}
                    required
                    aria-required="true"
                    minLength={MIN_PASSWORD}
                  />
                </div>

                {mode === "signup" && (
                  <div>
                    <label
                      htmlFor={confirmId}
                      className="block text-sm font-semibold text-foreground"
                    >
                      אימות סיסמה
                    </label>
                    <input
                      id={confirmId}
                      type="password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      dir="ltr"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                      placeholder="הקלידו שוב את הסיסמה"
                      disabled={busy || !configured}
                      required
                      aria-required="true"
                      minLength={MIN_PASSWORD}
                    />
                  </div>
                )}

                {mode === "signin" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={busy || !configured}
                      onClick={handleForgotPassword}
                      className="min-h-11 rounded-lg px-2 text-sm text-foreground hover:underline disabled:opacity-50"
                    >
                      שכחתי סיסמה
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy || !configured}
                  className="glow-accent inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-nav-bg px-4 py-3 text-sm font-bold text-nav-fg disabled:opacity-50"
                >
                  {busy
                    ? mode === "signup"
                      ? "נרשם..."
                      : "מתחבר..."
                    : !onboardingCompleted
                      ? mode === "signup"
                        ? "הגדרת טיול ואז הרשמה"
                        : "הגדרת טיול ואז התחברות"
                      : mode === "signup"
                        ? "הרשמה"
                        : "התחברות"}
                </button>
              </form>

              <div
                className="flex items-center gap-3 text-xs text-muted"
                role="separator"
                aria-label="או המשך עם Google"
              >
                <span className="h-px flex-1 bg-border" aria-hidden />
                או המשך עם Google
                <span className="h-px flex-1 bg-border" aria-hidden />
              </div>

              <button
                type="button"
                disabled={busy || !configured}
                onClick={handleGoogle}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-background/35 px-4 py-3 text-sm font-bold hover:border-yellow/45 disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" aria-hidden />
                {busy
                  ? "מתחבר..."
                  : onboardingCompleted
                    ? "המשך עם Google"
                    : "הגדרת טיול ואז Google"}
              </button>
            </div>
          )}

          <AnimatePresence>
            {resetNotice && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                className="rounded-xl border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success"
              >
                {resetNotice}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {displayError && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="rounded-xl border border-accent/30 bg-accent-soft px-3 py-2.5 text-sm text-accent"
              >
                {displayError}
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
          setPendingAuth(null);
        }}
        onFinished={afterSetupFinished}
        title={
          pendingAuth
            ? "לפני יצירת חשבון · פרטי הטיול"
            : "עריכת פרטי הטיול"
        }
      />
    </>
  );
}
