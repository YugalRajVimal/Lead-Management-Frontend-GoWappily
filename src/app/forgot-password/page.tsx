"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as api from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";

type Step = "email" | "otp" | "reset" | "done";

// Single-page, step-based flow (email -> otp -> reset -> done) rather than
// separate static routes per step, per 11-ADMIN-FRONTEND-PHASE3-PROMPT.md
// Epic 1 ("keep it to one flow, one page with steps is simplest for a
// static-export app"). The resetToken is held only in component state —
// never localStorage — since it's short-lived and single-purpose.
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [requesting, setRequesting] = useState(false);

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [lockedOut, setLockedOut] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const requestOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setRequesting(true);
    try {
      // Always shows the same generic message regardless of what the
      // backend actually did, per the contract's no-email-enumeration rule.
      await api.forgotPassword(email);
      setOtpError(null);
      setLockedOut(false);
      setOtp("");
      setStep("otp");
    } finally {
      setRequesting(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setOtpError(null);
    try {
      const res = await api.verifyOtp(email, otp);
      setResetToken(res.resetToken);
      setStep("reset");
    } catch (err) {
      if (err instanceof ApiError) {
        // The lockout message is distinct from a plain wrong-OTP message so
        // the person understands why "resend code" is now their only option.
        if (err.message.toLowerCase().includes("too many")) {
          setLockedOut(true);
        }
        setOtpError(err.message);
      } else {
        setOtpError("Something went wrong. Try again.");
      }
    } finally {
      setVerifying(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (newPassword !== confirmPassword) {
      setResetError("Passwords don't match.");
      return;
    }
    if (!resetToken) return;
    setResetting(true);
    try {
      await api.resetPassword(resetToken, newPassword);
      setStep("done");
    } catch (err) {
      setResetError(
        err instanceof ApiError ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-900">GoWappily</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {step === "email" && (
            <>
              <h1 className="text-base font-semibold text-slate-900 mb-1">
                Reset your password
              </h1>
              <p className="text-sm text-slate-500 mb-5">
                Enter your email and we&apos;ll send you a code.
              </p>
              <form onSubmit={requestOtp} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>
                <Button type="submit" className="w-full" loading={requesting}>
                  Send code
                </Button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <button
                onClick={() => setStep("email")}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 mb-3"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <h1 className="text-base font-semibold text-slate-900 mb-1">
                Enter your code
              </h1>
              <p className="text-sm text-slate-500 mb-5">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a
                6-digit code. It expires in 10 minutes.
              </p>
              <form onSubmit={verifyOtp} className="space-y-4">
                <div>
                  <Label>6-digit code</Label>
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="tracking-[0.3em] text-center text-lg"
                    disabled={lockedOut}
                  />
                </div>
                {otpError && (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                    {otpError}
                  </p>
                )}
                {!lockedOut && (
                  <Button
                    type="submit"
                    className="w-full"
                    loading={verifying}
                    disabled={otp.length !== 6}
                  >
                    Verify code
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => requestOtp()}
                  disabled={requesting}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 underline disabled:opacity-50"
                >
                  {lockedOut ? "Request a new code" : "Resend code"}
                </button>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <h1 className="text-base font-semibold text-slate-900 mb-1">
                Choose a new password
              </h1>
              <p className="text-sm text-slate-500 mb-5">
                Must be at least 8 characters.
              </p>
              <form onSubmit={submitReset} className="space-y-4">
                <div>
                  <Label>New password</Label>
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <Label>Confirm password</Label>
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                {resetError && (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                    {resetError}
                  </p>
                )}
                <Button type="submit" className="w-full" loading={resetting}>
                  Reset password
                </Button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
              <h1 className="text-base font-semibold text-slate-900 mb-1">
                Password reset
              </h1>
              <p className="text-sm text-slate-500 mb-5">
                You can now sign in with your new password.
              </p>
              <Button className="w-full" onClick={() => router.push("/login/")}>
                Back to sign in
              </Button>
            </div>
          )}

          {step !== "done" && (
            <p className="mt-4 text-center text-[11px] text-slate-400">
              <Link href="/login/" className="underline hover:text-slate-600">
                Back to sign in
              </Link>
            </p>
          )}

          {process.env.NEXT_PUBLIC_USE_MOCK_API === "true" && step === "otp" && (
            <p className="mt-3 text-center text-[11px] text-slate-400">
              Mock mode — the code is always <strong>123456</strong>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
