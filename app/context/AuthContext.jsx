"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const [mode, setMode] = useState("light");
  const router = useRouter();

  const storeUser = (userData) => {
    setUser(userData);
    // ✅ Store in localStorage (sync)
    localStorage.setItem("user", JSON.stringify(userData));
    // Optionally still set cookie for persistence
    Cookies.set("user", JSON.stringify(userData), { expires: 7 });
  };

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        Cookies.remove("user");
      }
    } catch {
      localStorage.removeItem("user");
      Cookies.remove("user");
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    Cookies.remove("user");
    setUser(null);
    router.push("/");
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: "Login failed" };
        }
        throw new Error(error.message);
      }

      const data = await response.json();
      storeUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await toast.promise(
        (async () => {
          const result = await login(form.email, form.password);
          if (!result || !result.success) {
            throw new Error(result?.message || "Login failed");
          }

          // ✅ Read from localStorage (sync)
          const storedUser = localStorage.getItem("user");
          if (!storedUser) throw new Error("User not found in storage");
          let loggedInUser;
          try {
            loggedInUser = JSON.parse(storedUser);
          } catch {
            throw new Error("User data corrupted.");
          }

          switch (loggedInUser?.role) {
            case "super_admin":
              router.push("/client/super-admin");
              break;
            case "admin":
              router.push("/client/admin");
              break;
            case "operator":
              router.push("/client/operator");
              break;
            default:
              throw new Error("Unknown user role.");
          }
        })(),
        {
          loading: "Logging in...",
          success: "Welcome back!",
          error: (err) => err.message || "Login failed",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const value = {
    mode,
    setMode,
    user,
    loading,
    setLoading,
    login,
    logout,
    form,
    setForm,
    handleLogin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};