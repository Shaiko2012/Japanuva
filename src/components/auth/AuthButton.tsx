"use client";

import { useId, useState, type FormEvent } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Dialog } from "@/components/ui/Dialog";
import { TripSetupWizard } from "@/components/auth/TripSetupWizard";
import {
  formatTripRangeHe,
  useTripMetaStore,
} from "@/store/tripMeta";
import { useFamilyStore } from "@/store/family";
import { SlidingPill } from "@/components/ui/Motion";

type AuthMode = "signin" | "signup";

type PendingAuth =
  | { kind: "google" }
  | { kind: "email"; mode: AuthMode; email: string; password: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

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
  const initial = (user?.displayName || user?.email || "?").trim().charAt(0);

  if (loading) {
    return <span className="inline-block h-9 w-24" aria-hidden />;
  }

  const submitLabel = busy
    ? mode === "signup"
      ? "נרשמים…"
      : "מתחברים…"
    : !onboardingCompleted
      ? mode === "signup"
        ? "הגדרת הטיול ואז הרשמה"
        : "הגדרת הטיול ואז התחברות"
      : mode === "signup"
        ? "הרשמה"
        : "התחברות";

  return (
    <>
      {user ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-icon overflow-hidden rounded-full p-0"
          aria-label="החשבון שלי"
          title="החשבון שלי"
        >
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-bold text-on-ink">
              {initial}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-secondary btn-sm"
        >
          התחברות
        </button>
      )}

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          resetFormMessages();
        }}
        title={user ? "החשבון שלי" : "התחברות לשמירה בענן"}
        description={
          user
            ? undefined
            : "המסלול, התאריכים והרכב המשפחה יישמרו בחשבון ויסונכרנו בין מכשירים."
        }
      >
        <div className="space-y-6">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-rule py-3 text-sm">
            <dt className="text-muted">תאריכים</dt>
            <dd className="font-medium">{formatTripRangeHe(startDate, endDate)}</dd>
            <dt className="text-muted">נוסעים</dt>
            <dd className="font-medium">
              {family.adults} מבוגרים · {family.kids} ילדים
            </dd>
            <dd className="col-span-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setPendingAuth(null);
                  setSetupOpen(true);
                }}
                className="btn btn-tertiary btn-sm -ms-1.5"
              >
                עריכת פרטי הטיול
              </button>
            </dd>
          </dl>

          {!configured && (
            <p role="status" className="note text-sm leading-6">
              ההתחברות אינה זמינה כרגע: Firebase לא הוגדר בסביבה הזו. הנתונים
              נשמרים במכשיר בלבד.
            </p>
          )}

          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt=""
                    className="h-12 w-12 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-lg font-bold text-on-ink"
                    aria-hidden
                  >
                    {initial}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    {user.displayName || "משתמש מחובר"}
                  </div>
                  <div className="truncate text-sm text-muted" dir="ltr">
                    {user.email}
                  </div>
                </div>
              </div>
              <p className="text-sm leading-6 text-ink-soft">
                שמירה בענן פעילה: מסלול, משפחה, תאריכים והעדפות מפה.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={handleLogout}
                className="btn btn-secondary btn-block"
              >
                {busy ? "מתנתקים…" : "התנתקות"}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div role="tablist" aria-label="סוג כניסה" className="tabs">
                {(
                  [
                    { id: "signin", label: "יש לי חשבון" },
                    { id: "signup", label: "חשבון חדש" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={mode === tab.id}
                    className="tab tab-motion"
                    onClick={() => {
                      setMode(tab.id);
                      resetFormMessages();
                    }}
                  >
                    {mode === tab.id && <SlidingPill layoutId="japanuva-auth-tabs" />}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor={emailId} className="field-label">
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
                    className="field"
                    placeholder="you@example.com"
                    disabled={busy || !configured}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(localError && !email.trim())}
                  />
                </div>

                <div>
                  <label htmlFor={passwordId} className="field-label">
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
                    className="field"
                    placeholder={`לפחות ${MIN_PASSWORD} תווים`}
                    disabled={busy || !configured}
                    required
                    aria-required="true"
                    minLength={MIN_PASSWORD}
                  />
                </div>

                {mode === "signup" && (
                  <div>
                    <label htmlFor={confirmId} className="field-label">
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
                      className="field"
                      placeholder="הקלידו שוב את הסיסמה"
                      disabled={busy || !configured}
                      required
                      aria-required="true"
                      minLength={MIN_PASSWORD}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy || !configured}
                  className="btn btn-primary btn-block"
                >
                  {submitLabel}
                </button>

                {mode === "signin" && (
                  <button
                    type="button"
                    disabled={busy || !configured}
                    onClick={handleForgotPassword}
                    className="btn btn-tertiary btn-sm"
                  >
                    שכחתי את הסיסמה
                  </button>
                )}
              </form>

              <div
                className="flex items-center gap-3 text-sm text-muted"
                role="separator"
              >
                <span className="h-px flex-1 bg-rule" aria-hidden />
                או
                <span className="h-px flex-1 bg-rule" aria-hidden />
              </div>

              <button
                type="button"
                disabled={busy || !configured}
                onClick={handleGoogle}
                className="btn btn-secondary btn-block"
              >
                {busy
                  ? "מתחברים…"
                  : onboardingCompleted
                    ? "המשך עם Google"
                    : "הגדרת הטיול ואז Google"}
              </button>
            </div>
          )}

          {resetNotice && (
            <p role="status" className="note-quiet text-sm text-moss">
              {resetNotice}
            </p>
          )}

          {displayError && (
            <p role="alert" className="note text-sm">
              {displayError}
            </p>
          )}
        </div>
      </Dialog>

      <TripSetupWizard
        open={setupOpen}
        allowSkip
        onClose={() => {
          setSetupOpen(false);
          setPendingAuth(null);
        }}
        onFinished={afterSetupFinished}
        title={
          pendingAuth ? "לפני יצירת החשבון: פרטי הטיול" : "פרטי הטיול"
        }
      />
    </>
  );
}
