"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import Cookies from "js-cookie";

const SuperAdminContext = createContext();

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (!context)
    throw new Error("useSuperAdmin must be used within SuperAdminProvider");
  return context;
};

// Helper: read "user" cookie and parse JSON
function getUserFromCookie() {
  try {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const userCookie = cookies.find((c) => c.startsWith("user="));
    if (!userCookie) return null;
    const value = decodeURIComponent(userCookie.split("=")[1]);
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// Role options enforced by current user role
function getAllowedRoles(role) {
  if (role === "super_admin") return ["admin", "operator"];
  if (role === "admin") return ["operator"];
  return [];
}

// Token helper
function getToken() {
  if (typeof window === "undefined") return null;
  const lsToken = localStorage.getItem("token");
  if (lsToken) return lsToken;
  const cookieToken = Cookies.get("token");
  return cookieToken || null;
}

export const SuperAdminProvider = ({ children }) => {
  const currentUser =
    typeof window !== "undefined" ? getUserFromCookie() : null;
  const currentRole = currentUser?.role || null;
  const allowedRoles = getAllowedRoles(currentRole);
  const canCreate = allowedRoles.length > 0;

  // Users state
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState(null);

  // Trucks state
  const [trucks, setTrucks] = useState([]);
  const [trucksError, setTrucksError] = useState(null);

  // Shared loading
  const [loading, setLoading] = useState(false);

  // Shared form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: allowedRoles[0] || "",
    isActive: "true",
    plateNumber: "",
    model: "",
    capacity: "",
    status: "available",
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setUsersError(null);

      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Failed to fetch users: ${res.status}`);
      }

      const data = await res.json();
      setUsers(data.users || data.data || []);
    } catch (e) {
      setUsersError(e.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Create user
  const createUser = async () => {
    try {
      setLoading(true);
      setUsersError(null);

      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");

      const tmpPassword = Math.random().toString(36).slice(2, 10);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: tmpPassword,
          role: form.role,
          isActive: form.isActive === "true",
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed to create user");

      await fetchUsers();
      setForm({
        ...form,
        name: "",
        email: "",
        role: allowedRoles[0] || "",
        isActive: "true",
      });

      return {
        success: true,
        message: result.message || "User created successfully",
      };
    } catch (e) {
      setUsersError(e.message || "Failed to create user");
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => users, [users]);

  // Fetch trucks
  const getAllTrucks = async () => {
    try {
      setLoading(true);
      setTrucksError(null);

      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trucks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch trucks");

      const data = await res.json();
      setTrucks(data.data || []);
    } catch (e) {
      setTrucksError(e.message || "Failed to fetch trucks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTrucks();
    fetchUsers();
  }, []);

  const filteredTrucks = useMemo(() => trucks, [trucks]);

  // Create truck
  const handleCreateTruck = async (e) => {
    e.preventDefault();
    setTrucksError(null);

    if (!canCreate) {
      setTrucksError("You do not have permission to create trucks.");
      return;
    }
    if (!form.plateNumber || !form.model || !form.capacity) {
      setTrucksError("All fields are required.");
      return;
    }

    try {
      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trucks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plateNumber: form.plateNumber,
          model: form.model,
          capacity: Number(form.capacity),
          status: form.status,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result?.message || "Failed to create truck");
      }

      await getAllTrucks();

      setForm({
        ...form,
        plateNumber: "",
        model: "",
        capacity: "",
        status: "available",
      });
    } catch (e) {
      setTrucksError(e.message || "Failed to create truck");
    }
  };

  return (
    <SuperAdminContext.Provider
      value={{
        currentUser,
        currentRole,
        allowedRoles,
        canCreate,
        users,
        trucks,
        loading,
        usersError,
        trucksError,
        // tripsError,
        // repairsError,
        // operatorsError,
        // reportsError,
        form,
        setForm,
        fetchUsers,
        createUser,
        filteredUsers,
        filteredTrucks,
        handleCreateTruck,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
};
