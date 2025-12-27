"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

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
    return JSON.parse(value); // already parsed JSON
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

export const SuperAdminProvider = ({ children }) => {

    
  const currentUser =
    typeof window !== "undefined" ? getUserFromCookie() : null;
  const currentRole = currentUser?.role || null;
  const allowedRoles = getAllowedRoles(currentRole);
  const canCreate = allowedRoles.length > 0;

  // Admins state
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Shared form state (used for both admins and trucks)
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

  // Fetch admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users?role=admin`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error(`Failed to fetch admins: ${res.status}`);
      const data = await res.json();
      const list = data.users || data.data || [];
      setAdmins(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Create admin
  const createAdmin = async () => {
    setError(null);
    if (!canCreate) {
      setError("You do not have permission to create users.");
      return;
    }
    if (!allowedRoles.includes(form.role)) {
      setError("Selected role is not allowed for your account.");
      return;
    }
    if (!form.name || !form.email || !form.role) {
      setError("All fields are required.");
      return;
    }
    if (form.role === "super_admin") {
      setError("Cannot create Super Admin.");
      return;
    }

    try {
      const tmpPassword = Math.random().toString(36).slice(2, 10);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

      await fetchAdmins();
      // reset form
      setForm({
        ...form,
        name: "",
        email: "",
        role: allowedRoles[0] || "",
        isActive: "true",
      });
    } catch (e) {
      setError(e.message);
    }
  };

  // Filtered admins (status/search handled in component, not here)
  const filteredAdmins = useMemo(() => admins, [admins]);

  // Trucks state
  const [trucks, setTrucks] = useState([]);

  const getAllTrucks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trucks`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch trucks");
      const data = await res.json();
      setTrucks(data.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTrucks();
    fetchAdmins();
  }, []);

  // Filtered trucks (status/search handled in component, not here)
  const filteredTrucks = useMemo(() => trucks, [trucks]);

  // Create truck
  const handleCreateTruck = async (e) => {
    e.preventDefault();
    setError(null);

    if (!canCreate) {
      setError("You do not have permission to create trucks.");
      return;
    }
    if (!form.plateNumber || !form.model || !form.capacity) {
      setError("All fields are required.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trucks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          plateNumber: form.plateNumber,
          model: form.model,
          capacity: Number(form.capacity),
          status: form.status,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed to create truck");

      await getAllTrucks();
      // reset form
      setForm({
        ...form,
        plateNumber: "",
        model: "",
        capacity: "",
        status: "available",
      });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <SuperAdminContext.Provider
      value={{
        currentUser,
        currentRole,
        allowedRoles,
        canCreate,
        admins,
        trucks,
        loading,
        error,
        form,
        setForm,
        fetchAdmins,
        createAdmin,
        filteredAdmins,
        filteredTrucks,
        handleCreateTruck,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
};
