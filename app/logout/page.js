"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Remove user and token from localStorage/cookies
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // Optionally clear cookies if you use them for auth
    // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Small delay for UX
    const timer = setTimeout(() => {
      router.replace("/auth");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-2">
        <div className="loader"></div>
        <span className="text-muted-foreground !mt-18 text-sm">
          Logging out...
        </span>
      </div>
    </div>
  );
}
