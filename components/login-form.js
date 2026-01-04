"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export function LoginForm() {
  const { form, setForm, loading, handleLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Use semantic Tailwind classes instead of hard-coded colors
  const inputClass =
    "w-full rounded-md border border-input px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition bg-background text-foreground";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div>
      <form
        className="w-full max-w-sm mx-auto py-8 flex flex-col gap-5 items-center justify-center"
        onSubmit={handleLogin}
      >
        {/* Heading */}
        <h2 className="text-2xl font-bold text-foreground text-center my-2">
          Welcome back!
        </h2>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          Enter your credentials to access your dashboard.
        </p>

        {/* Email */}
        <Input
          type="email"
          name="email"
          autoComplete="email"
          className={inputClass}
          placeholder="Enter email"
          value={form.email}
          onChange={handleChange}
          required
          size="sm"
        />

        {/* Password */}
        <div className="relative w-full flex flex-col gap-1">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            className={inputClass}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            size="sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <Link
            href="/auth/forget"
            className="underline text-xs tracking-wide text-muted-foreground mt-1 self-end"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          size="sm"
          className="w-full rounded-md py-3 mt-2 transition"
        >
          {loading ? "Loading..." : "Continue"}
        </Button>

        {/* Terms */}
        <span className="text-xs font-medium tracking-wide text-muted-foreground text-center mt-2 leading-relaxed">
          By continuing you are logging in at an authenticated users only
          dashboard.
        </span>
      </form>
    </div>
  );
}
