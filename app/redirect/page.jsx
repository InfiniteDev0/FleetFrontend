"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RedirectPage() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    // Small delay to feel professional
    const timer = setTimeout(() => {
      // Prefer localStorage user to avoid tampered query
      const storedUser = localStorage.getItem("user");
      let role = search.get("role");

      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          role = u?.role || role;
        } catch {
          // fallback to query role
        }
      }

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
          router.replace("/auth"); // safety fallback
      }
    }, 2500); // 2.5s

    return () => clearTimeout(timer);
  }, [router, search]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-2">
        <div className="loader"></div>
        <span className="text-muted-foreground !mt-18 text-sm">
          Redirecting to your dashboard...
        </span>
      </div>
    </div>
  );
}
