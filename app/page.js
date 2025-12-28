"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Client-side home redirect
 * - If any of the required localStorage keys are missing (TOKEN_KEYS),
 *   redirect to /auth/login
 * - Otherwise redirect to the appropriate role dashboard
 *
 * NOTE: Change TOKEN_KEYS to match the exact keys you store in localStorage.
 */
const TOKEN_KEYS = ["token", "role", "user"];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Only runs in the browser
    const hasAll = TOKEN_KEYS.every((k) => localStorage.getItem(k));

    if (!hasAll) {
      router.replace("/auth");
      return;
    }

    const role = localStorage.getItem("role");

    switch (role) {
      case "SUPER_ADMIN":
        router.replace("/client/super-admin");
        break;
      case "ADMIN":
        router.replace("/client/admin-dashboard");
        break;
      case "OPERATOR":
        router.replace("/client/operator-dashboard");
        break;
      default:
        // Unknown role — send back to login
        router.replace("/auth");
    }
  }, [router]);

  // Show a loading spinner while redirecting
  return (
<div class="loader"></div>
  );
}
