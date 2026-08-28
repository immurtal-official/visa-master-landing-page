"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export type AuthLocale = "en" | "cn" | "es";

type AuthMode = "continue" | "reset";
type AuthStep = "email" | "password";
type DialogView = "early-access" | "invited" | "sign-in";

const copy = {
  en: {
    google: "Continue with Google",
    or: "or use email",
    email: "Email address",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    continue: "Continue",
    checking: "Checking…",
    reset: "Email me a reset link",
    forgot: "Forgot password?",
    back: "Back to sign in",
    close: "Close",
    confirm: "Your account is ready. Check your inbox to confirm your email, then continue.",
    invalidCredentials: "We couldn’t sign you in. Check your password, use Google, or reset your password.",
    emailNotConfirmed: "Check your inbox and confirm your email before continuing.",
    resetSent: "Check your inbox for a password reset link.",
    configuration: "Authentication is not configured for this environment yet.",
    unexpected: "Something went wrong. Please try again.",
    waitlistKicker: "PRIVATE BETA",
    waitlistTitle: "Want in early?",
    waitlistBody: "Leave your email and we’ll let you know when your Visa Master workspace is ready.",
    waitlistEmail: "Your email",
    joinWaitlist: "Yes",
    joiningWaitlist: "Joining…",
    waitlistJoined: "You’re on the list. We’ll be in touch.",
    waitlistError: "We couldn’t save your email. Please try again.",
    haveInvite: "I have an invite phrase",
    invitePhrase: "Invite phrase",
    checkInvite: "Continue",
    checkingInvite: "Checking…",
    inviteInvalid: "That invite phrase is not recognized.",
    inviteRateLimited: "Too many failed attempts. Try again in 24 hours.",
    inviteWaitlisted: "We added you to the waitlist and will notify you as soon as your workspace is ready.",
    existingAccount: "Already have an account? Sign in",
    invitedKicker: "INVITE ACCEPTED",
    invitedTitle: "Create your workspace.",
    invitedBody: "Continue with the invited email below. If you use Google, choose the same address.",
    signInKicker: "WELCOME BACK",
    signInTitle: "Pick up where you left off.",
    signInBody: "Sign in to continue to your Visa Master workspace.",
    backToEarlyAccess: "Back to early access",
  },
  cn: {
    google: "使用 Google 继续",
    or: "或使用邮箱",
    email: "邮箱地址",
    password: "密码",
    showPassword: "显示密码",
    hidePassword: "隐藏密码",
    continue: "继续",
    checking: "正在检查…",
    reset: "发送重置密码链接",
    forgot: "忘记密码？",
    back: "返回登录",
    close: "关闭",
    confirm: "账户已准备好。请查收邮件并确认邮箱，然后继续。",
    invalidCredentials: "无法登录。请检查密码、使用 Google，或重置密码。",
    emailNotConfirmed: "请先查收邮件并确认邮箱，然后继续。",
    resetSent: "请查收密码重置邮件。",
    configuration: "此环境尚未配置身份验证。",
    unexpected: "出现问题，请重试。",
    waitlistKicker: "内测阶段",
    waitlistTitle: "想提前体验？",
    waitlistBody: "留下邮箱，Visa Master 工作区开放时我们会通知你。",
    waitlistEmail: "你的邮箱",
    joinWaitlist: "是",
    joiningWaitlist: "正在加入…",
    waitlistJoined: "你已加入候补名单，我们会与你联系。",
    waitlistError: "暂时无法保存你的邮箱，请重试。",
    haveInvite: "我有邀请短语",
    invitePhrase: "邀请短语",
    checkInvite: "继续",
    checkingInvite: "正在验证…",
    inviteInvalid: "无法识别该邀请短语。",
    inviteRateLimited: "失败次数过多，请在 24 小时后重试。",
    inviteWaitlisted: "我们已将你加入候补名单，并会在你的工作区准备好后立即通知你。",
    existingAccount: "已有账户？登录",
    invitedKicker: "邀请已验证",
    invitedTitle: "创建你的工作区。",
    invitedBody: "请使用受邀邮箱继续。如果使用 Google，请选择同一邮箱。",
    signInKicker: "欢迎回来",
    signInTitle: "继续上次的进度。",
    signInBody: "登录并继续使用你的 Visa Master 工作区。",
    backToEarlyAccess: "返回提前体验",
  },
  es: {
    google: "Continuar con Google",
    or: "o usa tu correo",
    email: "Correo electrónico",
    password: "Contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    continue: "Continuar",
    checking: "Comprobando…",
    reset: "Enviarme un enlace",
    forgot: "¿Olvidaste tu contraseña?",
    back: "Volver a iniciar sesión",
    close: "Cerrar",
    confirm: "Tu cuenta está lista. Confirma tu correo y luego continúa.",
    invalidCredentials: "No pudimos iniciar sesión. Revisa tu contraseña, usa Google o restablécela.",
    emailNotConfirmed: "Confirma tu correo antes de continuar.",
    resetSent: "Revisa tu correo para restablecer la contraseña.",
    configuration: "La autenticación aún no está configurada en este entorno.",
    unexpected: "Algo salió mal. Inténtalo de nuevo.",
    waitlistKicker: "BETA PRIVADA",
    waitlistTitle: "¿Quieres entrar antes?",
    waitlistBody: "Déjanos tu correo y te avisaremos cuando tu espacio de Visa Master esté listo.",
    waitlistEmail: "Tu correo",
    joinWaitlist: "Sí",
    joiningWaitlist: "Añadiendo…",
    waitlistJoined: "Ya estás en la lista. Nos pondremos en contacto.",
    waitlistError: "No pudimos guardar tu correo. Inténtalo de nuevo.",
    haveInvite: "Tengo una frase de invitación",
    invitePhrase: "Frase de invitación",
    checkInvite: "Continuar",
    checkingInvite: "Comprobando…",
    inviteInvalid: "No reconocemos esa frase de invitación.",
    inviteRateLimited: "Demasiados intentos fallidos. Inténtalo en 24 horas.",
    inviteWaitlisted: "Te añadimos a la lista de espera y te avisaremos en cuanto tu espacio esté listo.",
    existingAccount: "¿Ya tienes una cuenta? Inicia sesión",
    invitedKicker: "INVITACIÓN ACEPTADA",
    invitedTitle: "Crea tu espacio.",
    invitedBody: "Continúa con el correo invitado. Si usas Google, elige la misma dirección.",
    signInKicker: "TE DAMOS LA BIENVENIDA",
    signInTitle: "Continúa donde lo dejaste.",
    signInBody: "Inicia sesión para continuar a tu espacio de Visa Master.",
    backToEarlyAccess: "Volver al acceso anticipado",
  },
} as const;

function authRedirect(next: string) {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

function emailConfirmationRedirect(next: string) {
  return `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`;
}

export function AuthPanel({
  locale = "en",
  next = "/workspace",
  initialEmail = "",
  allowSignUp = false,
}: {
  locale?: AuthLocale;
  next?: string;
  initialEmail?: string;
  allowSignUp?: boolean;
}) {
  const router = useRouter();
  const t = copy[locale];
  const [mode, setMode] = useState<AuthMode>("continue");
  const [step, setStep] = useState<AuthStep>(allowSignUp && Boolean(initialEmail) ? "password" : "email");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "error" | "success"; message: string } | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "continue" && step === "password") {
      passwordInputRef.current?.focus();
    }
  }, [mode, step]);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setStep(nextMode === "continue" && allowSignUp && Boolean(initialEmail) ? "password" : "email");
    setPasswordVisible(false);
    setFeedback(null);
  }

  async function continueWithGoogle() {
    setPending(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: authRedirect(next),
          queryParams: initialEmail ? { login_hint: initialEmail } : undefined,
        },
      });
      if (error) throw error;
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error && !error.message.startsWith("Supabase is not configured") ? error.message : t.configuration,
      });
      setPending(false);
    }
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (mode === "continue" && step === "email") {
      setStep("password");
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();

      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: authRedirect("/account/update-password"),
        });
        if (error) throw error;
        setFeedback({ kind: "success", message: t.resetSent });
        setPending(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        if (signInError.code === "email_not_confirmed") {
          setFeedback({ kind: "success", message: t.emailNotConfirmed });
          setPending(false);
          return;
        }

        const credentialsWereRejected =
          signInError.code === "invalid_credentials" ||
          signInError.message.toLowerCase().includes("invalid login credentials");

        if (!credentialsWereRejected) throw signInError;

        if (!allowSignUp) {
          setFeedback({ kind: "error", message: t.invalidCredentials });
          setPending(false);
          return;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: emailConfirmationRedirect(next) },
        });
        if (signUpError) {
          const accountMayExist =
            signUpError.code === "user_already_exists" ||
            signUpError.code === "identity_already_exists" ||
            signUpError.message.toLowerCase().includes("already registered");

          if (accountMayExist) {
            setFeedback({ kind: "error", message: t.invalidCredentials });
            setPending(false);
            return;
          }

          throw signUpError;
        }

        // Supabase deliberately obscures whether a confirmed user already
        // exists. An empty identities array means no new email identity was
        // created, so keep the response generic instead of exposing the account.
        if ((signUpData.user?.identities?.length ?? 0) === 0) {
          setFeedback({ kind: "error", message: t.invalidCredentials });
          setPending(false);
          return;
        }

        if (!signUpData.session) {
          setFeedback({ kind: "success", message: t.confirm });
          setPending(false);
          return;
        }
      }

      router.push(next);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const mayRevealAccount =
        message.toLowerCase().includes("invalid login credentials") ||
        message.toLowerCase().includes("already registered");

      setFeedback({
        kind: "error",
        message: mayRevealAccount
          ? t.invalidCredentials
          : message.startsWith("Supabase is not configured")
            ? t.configuration
            : message || t.unexpected,
      });
      setPending(false);
    }
  }

  return (
    <div className="auth-panel">
      <button
        className="google-button"
        type="button"
        onClick={continueWithGoogle}
        disabled={pending}
        aria-label={t.google}
      >
        <svg className="google-mark" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
          <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.716v2.258h2.909c1.702-1.567 2.684-3.875 2.684-6.615Z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.18l-2.909-2.258c-.806.54-1.835.859-3.047.859-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z" />
          <path fill="#FBBC05" d="M3.963 10.707A5.41 5.41 0 0 1 3.682 9c0-.592.102-1.168.281-1.707V4.961H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.039l3.007-2.332Z" />
          <path fill="#EA4335" d="M9 3.579c1.322 0 2.508.454 3.441 1.346l2.581-2.581C13.464.892 11.426 0 9 0A9 9 0 0 0 .956 4.961l3.007 2.332C4.672 5.164 6.656 3.579 9 3.579Z" />
        </svg>
      </button>

      <div className="auth-divider"><span>{t.or}</span></div>

      <form className="auth-form" onSubmit={submitEmail}>
        <label>
          <span>{t.email}</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={initialEmail}
            readOnly={allowSignUp && Boolean(initialEmail)}
            required
          />
        </label>

        {mode === "continue" && step === "password" && (
          <label>
            <span>{t.password}</span>
            <div className="password-field">
              <input
                ref={passwordInputRef}
                name="password"
                type={passwordVisible ? "text" : "password"}
                autoComplete={allowSignUp ? "new-password" : "current-password"}
                minLength={8}
                required
              />
              <button
                className="password-visibility"
                type="button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={passwordVisible ? t.hidePassword : t.showPassword}
                aria-pressed={passwordVisible}
                title={passwordVisible ? t.hidePassword : t.showPassword}
              >
                {passwordVisible ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
                    <path d="M9.9 4.3A10.7 10.7 0 0 1 12 4c5.2 0 8.6 5.1 9 6.8a3 3 0 0 1 0 1.4 10.8 10.8 0 0 1-2.2 3.8" />
                    <path d="M6.2 6.2A11.7 11.7 0 0 0 3 10.8a3 3 0 0 0 0 1.4C3.4 13.9 6.8 19 12 19a10.8 10.8 0 0 0 3-.4" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M2.9 10.8C3.4 9.1 6.8 4 12 4s8.6 5.1 9.1 6.8a3 3 0 0 1 0 1.4C20.6 13.9 17.2 19 12 19S3.4 13.9 2.9 12.2a3 3 0 0 1 0-1.4Z" />
                    <circle cx="12" cy="11.5" r="2.5" />
                  </svg>
                )}
              </button>
            </div>
          </label>
        )}

        {feedback && (
          <p className={`auth-feedback ${feedback.kind}`} role={feedback.kind === "error" ? "alert" : "status"}>
            {feedback.message}
          </p>
        )}

        <button className="email-button" type="submit" disabled={pending}>
          {pending ? t.checking : mode === "continue" ? t.continue : t.reset}
        </button>
      </form>

      <div className="auth-switches">
        {mode === "continue" && step === "password" && <button type="button" onClick={() => changeMode("reset")}>{t.forgot}</button>}
        {mode === "reset" && <button type="button" onClick={() => changeMode("continue")}>{t.back}</button>}
      </div>
    </div>
  );
}

function EarlyAccessPanel({
  locale,
  onAuthorized,
  onSignIn,
}: {
  locale: AuthLocale;
  onAuthorized: (email: string) => void;
  onSignIn: () => void;
}) {
  const t = copy[locale];
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [phrase, setPhrase] = useState("");
  const [inviteVisible, setInviteVisible] = useState(false);
  const [pending, setPending] = useState<"waitlist" | "invite" | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "error" | "success"; message: string } | null>(null);

  async function saveToWaitlist() {
    const response = await fetch("/api/early-access/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error(t.waitlistError);
  }

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending("waitlist");
    setFeedback(null);

    try {
      await saveToWaitlist();
      setFeedback({ kind: "success", message: t.waitlistJoined });
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : t.unexpected,
      });
    } finally {
      setPending(null);
    }
  }

  async function redeemInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailInputRef.current?.reportValidity()) return;
    setPending("invite");
    setFeedback(null);

    try {
      const response = await fetch("/api/early-access/redeem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, phrase }),
      });
      const payload = (await response.json()) as { email?: string; error?: string };

      if (!response.ok) {
        const inviteError = response.status === 429 ? t.inviteRateLimited : t.inviteInvalid;
        let message: string = inviteError;

        try {
          await saveToWaitlist();
          message = `${inviteError} ${t.inviteWaitlisted}`;
        } catch {
          // Keep the invite error accurate when the fallback waitlist request fails.
        }

        throw new Error(message);
      }

      onAuthorized(payload.email || email.trim().toLowerCase());
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : t.unexpected,
      });
      setPending(null);
    }
  }

  return (
    <div className="early-access-panel">
      <form
        className="waitlist-form"
        onSubmit={inviteVisible ? (event) => event.preventDefault() : joinWaitlist}
      >
        <div className="early-access-pill">
          <input
            ref={emailInputRef}
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (feedback) setFeedback(null);
            }}
            placeholder={t.waitlistEmail}
            aria-label={t.email}
            autoComplete="email"
            required
          />
          {!inviteVisible && (
            <button type="submit" disabled={pending !== null}>
              {pending === "waitlist" ? t.joiningWaitlist : t.joinWaitlist}
            </button>
          )}
        </div>
      </form>

      {inviteVisible ? (
        <form className="invite-form" onSubmit={redeemInvite}>
          <div className="early-access-pill invite-pill">
            <input
              name="phrase"
              type="text"
              value={phrase}
              onChange={(event) => {
                setPhrase(event.target.value.toUpperCase());
                if (feedback) setFeedback(null);
              }}
              placeholder={t.invitePhrase}
              aria-label={t.invitePhrase}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={160}
              required
              autoFocus
            />
            <button type="submit" disabled={pending !== null}>
              {pending === "invite" ? t.checkingInvite : t.checkInvite}
            </button>
          </div>
        </form>
      ) : (
        <button
          className="invite-reveal"
          type="button"
          onClick={() => {
            setInviteVisible(true);
            setFeedback(null);
          }}
        >
          {t.haveInvite}
        </button>
      )}

      {feedback && (
        <p className={`auth-feedback ${feedback.kind}`} role={feedback.kind === "error" ? "alert" : "status"}>
          {feedback.message}
        </p>
      )}

      <button className="existing-account" type="button" onClick={onSignIn}>
        {t.existingAccount}
      </button>
    </div>
  );
}

export function AuthDialog({
  open,
  onOpenChange,
  locale,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: AuthLocale;
}) {
  if (!open) return null;

  return <OpenAuthDialog onOpenChange={onOpenChange} locale={locale} />;
}

function OpenAuthDialog({
  onOpenChange,
  locale,
}: {
  onOpenChange: (open: boolean) => void;
  locale: AuthLocale;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const t = copy[locale];
  const [view, setView] = useState<DialogView>("early-access");
  const [authorizedEmail, setAuthorizedEmail] = useState("");

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const focusableSelector = [
      "a[href]",
      "button:not(:disabled)",
      "input:not(:disabled)",
      "select:not(:disabled)",
      "textarea:not(:disabled)",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onOpenChange]);

  return (
    <div className="modal-backdrop" onPointerDown={(event) => {
      if (event.target === event.currentTarget) onOpenChange(false);
    }}>
      <div ref={modalRef} className="signup-modal" role="dialog" aria-modal="true" aria-labelledby="signup-title">
        <button className="modal-close" type="button" onClick={() => onOpenChange(false)} aria-label={t.close}>×</button>
        {view === "early-access" && <>
          <small>{t.waitlistKicker}</small>
          <h2 id="signup-title">{t.waitlistTitle}</h2>
          <p>{t.waitlistBody}</p>
          <EarlyAccessPanel
            locale={locale}
            onAuthorized={(email) => {
              setAuthorizedEmail(email);
              setView("invited");
            }}
            onSignIn={() => setView("sign-in")}
          />
        </>}

        {view === "invited" && <>
          <small>{t.invitedKicker}</small>
          <h2 id="signup-title">{t.invitedTitle}</h2>
          <p>{t.invitedBody}</p>
          <AuthPanel locale={locale} initialEmail={authorizedEmail} allowSignUp />
        </>}

        {view === "sign-in" && <>
          <small>{t.signInKicker}</small>
          <h2 id="signup-title">{t.signInTitle}</h2>
          <p>{t.signInBody}</p>
          <AuthPanel locale={locale} />
          <button className="modal-back-link" type="button" onClick={() => setView("early-access")}>{t.backToEarlyAccess}</button>
        </>}
      </div>
    </div>
  );
}
