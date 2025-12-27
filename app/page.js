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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: "16px", animation: "spin 1s linear infinite" }}
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="#3b82f6"
            strokeWidth="4"
            strokeDasharray="31.4 31.4"
            strokeLinecap="round"
          />
        </svg>
        <div>Loading, please wait...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
