"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: token, 3: reset
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill email/token from URL if present
  useEffect(() => {
    const urlEmail = searchParams.get("email");
    const urlToken = searchParams.get("token");
    if (urlEmail) setEmail(urlEmail);
    if (urlToken) {
      setToken(urlToken);
      setStep(3); // jump to reset step if token present
    }
  }, [searchParams]);

  const inputClass =
    "w-full rounded-md border border-gray-200 !px-3 !py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition";

  // Step 1: Request reset token
  const handleRequestToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset code");
      toast.success(
        "A reset code was sent to your email. Please check your inbox (and spam folder)."
      );
      setStep(2);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Enter reset token
  const handleVerifyToken = (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please enter the reset code sent to your email.");
      return;
    }
    setStep(3);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, resetToken: token, newPassword }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      toast.success("Password reset successfully! Please login.");
      setTimeout(() => router.push("/auth"), 1500);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md !p-8 flex flex-col items-center">
        <h2 className="text-lg font-semibold text-gray-800 text-center !my-2">
          Forgot Password
        </h2>
        <p className="text-xs !mb-4 text-gray-500 text-center">
          {step === 1 && "Enter your email to receive a reset code."}
          {step === 2 &&
            "Check your email for a reset code (long string). Paste it below."}
          {step === 3 && "Enter your new password."}
        </p>

        {step === 1 && (
          <form
            className="w-full flex flex-col gap-5"
            onSubmit={handleRequestToken}
          >
            <Input
              type="email"
              name="email"
              autoComplete="email"
              className={inputClass}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form
            className="w-full flex flex-col gap-5"
            onSubmit={handleVerifyToken}
          >
            <Input
              type="text"
              name="token"
              className={inputClass}
              placeholder="Paste reset code from email"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Verifying..." : "Continue"}
            </Button>
          </form>
        )}

        {step === 3 && (
          <form
            className="w-full flex flex-col gap-5"
            onSubmit={handleResetPassword}
          >
            <Input
              type="password"
              name="newPassword"
              className={inputClass}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              className={inputClass}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
