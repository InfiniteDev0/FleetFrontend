"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/app/context/AuthContext";

export function LoginForm() {
  const { form, setForm, loading, handleLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const inputClass =
    "w-full rounded-md border border-gray-200 !px-3 !py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div>
      <Card className="overflow-hidden !p-0 shadow-none">
        <CardContent className="grid !p-0 md:grid-cols-2">
          <AnimatePresence mode="wait">
            <motion.div
              key="login"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full max-w-md !p-8 flex flex-col items-center"
            >
              {/* Logo */}
              <div className="flex flex-col items-center">
                <img
                  src="https://gamoiltrading.com/wp-content/uploads/2025/04/GLogo.png"
                  alt="Company Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>

              {/* Form */}
              <form
                className="w-full max-w-sm mx-auto  !px-6 !py-8 flex flex-col gap-5 items-center justify-center"
                onSubmit={handleLogin}
              >
                {/* Heading */}
                <h2 className="text-2xl font-bold text-gray-800 text-center !my-2">
                  Welcome back!
                </h2>
                <p className="text-gray-500 text-sm text-center max-w-xs">
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
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <Link
                    href="/auth/forget"
                    className="underline text-xs  tracking-wide text-gray-600 !mt-1 self-end"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  size="sm"
                  className="w-full rounded-md bg-[#15132b] text-white  !py-3 !mt-2 transition hover:bg-[#201c3e]"
                >
                  {loading ? "Loading..." : "Continue"}
                </Button>

                {/* Terms */}
                <span className="text-xs font-medium tracking-wide text-gray-700 text-center !mt-2 leading-relaxed">
                  By continuing, you agree to our{" "}
                  <Link
                    href="/help#terms"
                    className="underline hover:text-amber-600"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/help#privacy"
                    className="underline hover:text-amber-600"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </form>
            </motion.div>
          </AnimatePresence>
          <div className="bg-muted relative hidden md:block">
            <img
              src="https://assets.gulfoilltd.com/gomel/files/Logistics%20truck%20carrying%20goods.webp?VersionId=9Vnifpa2Mvjd9yYlRcJ2.eAfvZIpZR0b"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
