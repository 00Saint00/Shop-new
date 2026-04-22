import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type ResetForm = {
  password: string;
  confirmPassword: string;
};

const RECOVERY_SESSION_KEY = "shopco:password-recovery-active";

function recoverySignalsFromHref(href: string) {
  const h = href.toLowerCase();
  const hasPkceCode = h.includes("code=");
  const hasImplicitRecovery =
    h.includes("type=recovery") ||
    h.includes("type%3drecovery") ||
    /[#&?]type=recovery\b/.test(h);
  return { hasPkceCode, hasImplicitRecovery, hasAnyRecoveryHint: hasPkceCode || hasImplicitRecovery };
}

function setRecoveryPending() {
  try {
    sessionStorage.setItem(RECOVERY_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

function clearRecoveryPending() {
  try {
    sessionStorage.removeItem(RECOVERY_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function isRecoveryPending() {
  try {
    return sessionStorage.getItem(RECOVERY_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

type Screen = "form" | "invalid";

/** Poll until Supabase has finished PKCE / hash handling (user may submit quickly). */
async function waitForRecoverySession(sessionOk: { current: boolean }, maxMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (sessionOk.current) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      sessionOk.current = true;
      return;
    }
    await new Promise((r) => setTimeout(r, 80));
  }
  throw new Error(
    "Reset link is not ready yet. Wait a second and try again, or open the latest link from your email.",
  );
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("form");
  const sessionOk = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ResetForm>();

  useEffect(() => {
    const hrefOnLoad = window.location.href;
    const { hasPkceCode, hasImplicitRecovery, hasAnyRecoveryHint } =
      recoverySignalsFromHref(hrefOnLoad);
    const pendingFromStrictRemount = isRecoveryPending();

    let cancelled = false;

    const markSessionOk = () => {
      if (sessionOk.current) return;
      sessionOk.current = true;
      setRecoveryPending();
      setScreen("form");
    };

    const markInvalid = () => {
      if (cancelled) return;
      clearRecoveryPending();
      setScreen("invalid");
    };

    const failAfterMs = hasAnyRecoveryHint || pendingFromStrictRemount ? 25000 : 0;
    const failTimer =
      failAfterMs > 0
        ? window.setTimeout(() => {
            if (!sessionOk.current) markInvalid();
          }, failAfterMs)
        : null;

    const clearFailTimer = () => {
      if (failTimer !== null) clearTimeout(failTimer);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        clearFailTimer();
        markSessionOk();
      }
    });

    const tryRecoverSession = async (): Promise<boolean> => {
      if (pendingFromStrictRemount) {
        let { data: s0 } = await supabase.auth.getSession();
        if (!s0.session) {
          await new Promise((r) => setTimeout(r, 200));
          s0 = (await supabase.auth.getSession()).data;
        }
        if (s0.session) {
          clearFailTimer();
          markSessionOk();
          return true;
        }
        clearRecoveryPending();
        clearFailTimer();
        markInvalid();
        return false;
      }

      if (hasPkceCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(hrefOnLoad);
        if (!error) {
          clearFailTimer();
          markSessionOk();
          return true;
        }
        const { data: afterFail } = await supabase.auth.getSession();
        if (afterFail.session) {
          clearFailTimer();
          markSessionOk();
          return true;
        }
        console.error(error);
        clearFailTimer();
        clearRecoveryPending();
        markInvalid();
        toast.error(error.message);
        return false;
      }

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      const { data: s1, error: e1 } = await supabase.auth.getSession();
      if (e1) throw e1;
      if (hasImplicitRecovery && s1.session) {
        clearFailTimer();
        markSessionOk();
        return true;
      }

      await new Promise((r) => setTimeout(r, 300));
      if (sessionOk.current) return true;
      const { data: s2 } = await supabase.auth.getSession();
      if (s2.session && recoverySignalsFromHref(hrefOnLoad).hasImplicitRecovery) {
        clearFailTimer();
        markSessionOk();
        return true;
      }
      return false;
    };

    void (async () => {
      try {
        await tryRecoverSession();
      } catch (e: unknown) {
        if (cancelled) return;
        console.error(e);
        clearFailTimer();
        clearRecoveryPending();
        markInvalid();
        const msg = e instanceof Error ? e.message : "Could not use this reset link.";
        toast.error(msg);
      }
    })();

    return () => {
      cancelled = true;
      clearFailTimer();
      sub.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async ({ password }: ResetForm) => {
    if (screen === "invalid") return;
    try {
      await waitForRecoverySession(sessionOk);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      clearRecoveryPending();
      toast.success("Password updated. Sign in with your new password.");
      navigate("/auth", { replace: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not update password.";
      toast.error(msg);
    }
  };

  if (screen === "invalid") {
    return (
      <div className="px-[16px] lg:px-[100px] pt-[80px] pb-[40%] lg:pb-[168px]">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2">Link invalid or expired</h1>
          <p className="text-sm text-black/70 mb-6">
            Request a new reset link and open it from your email again.
          </p>
          <Button asChild className="bg-black text-white hover:bg-black/90">
            <Link to="/forgot-password">Forgot password</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-[16px] lg:px-[100px] pt-[80px] pb-[40%] lg:pb-[168px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold mb-1">Set new password</h1>
        <p className="text-sm text-black/60 mb-4">
          Choose a password for your account.
        </p>

        <div className="relative">
          <label className="mb-1 block text-sm font-medium">New password</label>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Minimum length is 6" },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
                message: "Password must contain letters and numbers",
              },
            })}
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="relative">
          <label className="mb-1 block text-sm font-medium">Confirm password</label>
          <input
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === getValues("password") || "Passwords do not match",
            })}
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white hover:bg-black/90 disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Update password"}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
