"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const REQUIRED_KEYS = ["token", "user"];

export default function Home() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const hasAll = REQUIRED_KEYS.every((k) => localStorage.getItem(k));

    if (!hasAll) {
      router.replace("/auth");
      return;
    }

    const storedUser = localStorage.getItem("user");
    let role = null;

    try {
      role = JSON.parse(storedUser)?.role;
    } catch {}

    // Only set state in a callback/microtask
    Promise.resolve().then(() => setIsRedirecting(true));

    const timeout = setTimeout(() => {
      switch (role) {
        case "super_admin":
          router.replace("/client/super-admin");
          break;
        case "admin":
          router.replace("/client/admin");
          break;
        case "operator":
          router.replace("/client/operator");
          break;
        default:
          router.replace("/auth");
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [router]);

  if (!isRedirecting) return null;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-2">
        <div className="loader"></div>
        <span className="text-muted-foreground !mt-20 text-sm">
          Redirecting to your dashboard...
        </span>
      </div>
    </div>
  );
}
