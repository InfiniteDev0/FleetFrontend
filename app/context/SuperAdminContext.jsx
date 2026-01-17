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
  const [currentUser, setCurrentUser] = useState(null);
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

  // Shared form state (used for both user and driver forms, but fields differ)
  const [form, setForm] = useState({
    // User fields
    name: "",
    email: "",
    password: "",
    role: allowedRoles[0] || "", // e.g. "admin", "operator", "super_admin"
    isActive: "true", // keep as string if backend expects string, else boolean

    // Truck fields
    plateNumber: "",
    model: "",
    capacity: "",
    status: "available", // "available" | "in-use" | "maintenance"

    // Optional driver info stored directly in truck schema
    driverName: "",
    phoneNumber: "",

    // Trip fields
    truckId: "", // reference to Truck._id
    product: "", // "AGO" | "PMS" | "JET A-1"
    routeOrigin: "",
    routeDestination: "",
    transport: "", // numeric string, will cast to Number
    tripStatus: "scheduled", // "scheduled" | "in-progress" | "completed"
    startTime: null, // Date
    endTime: null, // optional Date
  });

  useEffect(() => {
    setCurrentUser(getUserFromCookie());
  }, []);

  // Delete user
  const handleDeleteUser = async (id) => {
    try {
      setUsersError(null);
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed to delete user");
      await fetchUsers();
      return true;
    } catch (e) {
      setUsersError(e.message || "Failed to delete user");
      return false;
    } finally {
      setLoading(false);
    }
  };
  // Helper to get user from cookie (simple fallback)
  function getUserFromCookie() {
    // Try to get user from localStorage or cookie (customize as needed)
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    // Optionally, try to get from cookies if you store user info there
    return null;
  }
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password, // use entered password instead of tmpPassword
          role: form.role,
          isActive: form.isActive === "true", // convert string to boolean
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed to create user");

      await fetchUsers();

      // Reset form after success
      setForm({
        name: "",
        email: "",
        password: "",
        role: allowedRoles[0] || "",
        isActive: "true",
        phoneNumber: "",
        licenseNumber: "",
        salaryType: "monthly",
        status: "",
        plateNumber: "",
        model: "",
        capacity: "",
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

  // ...existing code...

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
      return null;
    }
    if (!form.plateNumber || !form.model || !form.capacity) {
      setTrucksError("All fields are required.");
      return null;
    }

    try {
      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");

      // Build payload exactly as your schema expects
      // Normalize phone: remove + and convert to Number
      const rawPhone = String(form.phoneNumber || "")
        .replace(/\+/g, "") // remove + sign
        .replace(/\D/g, "") // remove any remaining non-digits
        .trim();
      const phoneNumberValue = rawPhone !== "" ? Number(rawPhone) : null;

      const truckPayload = {
        plateNumber: form.plateNumber,
        model: form.model,
        capacity: Number(form.capacity),
        status: form.status || "available",
        driverName: form.driverName || null,
        PhoneNumber: phoneNumberValue,
      };

      // Debug: log outgoing payload and the form phone for quick diagnosis
      console.debug("Creating truck payload", {
        truckPayload,
        formPhone: form.phoneNumber,
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trucks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(truckPayload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to create truck");
      }

      await getAllTrucks();

      // Reset form
      setForm({
        plateNumber: "",
        model: "",
        capacity: "",
        status: "",
        driverName: "",
        phoneNumber: "",
      });

      return result.data; // created truck object
    } catch (e) {
      setTrucksError(e.message || "Failed to create truck");
      return null;
    }
  };
  // Get truck by ID
  const handleGetTruckById = async (id) => {
    try {
      setTrucksError(null);
      setLoading(true);

      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");

      const trimmedId = typeof id === "string" ? id.trim() : id;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trucks/${trimmedId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to get truck");
      }

      return result.data;
    } catch (e) {
      setTrucksError(e.message || "Failed to get truck");
      return null;
    } finally {
      setLoading(false);
    }
  };

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
  // ...existing code...

  const handleDeleteTruck = async (id) => {
    try {
      setTrucksError(null);
      setLoading(true);

      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");

      const trimmedId = typeof id === "string" ? id.trim() : id;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trucks/${trimmedId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to delete truck");
      }

      await getAllTrucks();
      return true;
    } catch (e) {
      setTrucksError(e.message || "Failed to delete truck");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update truck
  const handleUpdateTruck = async (id, updatedData) => {
    try {
      setTrucksError(null);
      setLoading(true);

      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trucks/${id}`,
        {
          method: "PUT", // update uses PUT
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        },
      );

      const result = await res.json();
      if (!res.ok || !result.success)
        throw new Error(result.message || "Failed to update truck");

      await getAllTrucks(); // refresh list
      return result.data;
    } catch (e) {
      setTrucksError(e.message || "Failed to update truck");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Trips state
  const [trips, setTrips] = useState([]);
  const [tripsError, setTripsError] = useState(null);
  // Expenses state
  const [expenses, setExpenses] = useState([]);
  const [expensesError, setExpensesError] = useState(null);
  // Trip report state
  const [tripReport, setTripReport] = useState(null);
  const [tripReportError, setTripReportError] = useState(null);

  // Fetch all trips
  const fetchTrips = async (filters = {}) => {
    try {
      setTripsError(null);
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");
      // Build query string from filters
      const params = new URLSearchParams(filters).toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/trips${
        params ? `?${params}` : ""
      }`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Failed to fetch trips: ${res.status}`);
      }
      const data = await res.json();
      setTrips(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setTripsError(e.message || "Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  };

  // Fetch single trip by ID
  const fetchTripById = async (id) => {
    try {
      setTripsError(null);
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to fetch trip");
      return data.data;
    } catch (e) {
      setTripsError(e.message || "Failed to fetch trip");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setTripsError(null);
    setLoading(true);

    // Validate required fields
    if (
      !form.truckId ||
      !form.product ||
      !form.routeOrigin ||
      !form.routeDestination ||
      !form.transport ||
      !form.startTime
    ) {
      setTripsError("All fields are required.");
      setLoading(false);
      return null;
    }

    try {
      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");

      // Build payload exactly as your Trip schema expects
      const tripPayload = {
        truckId: form.truckId,
        product: form.product,
        route: {
          origin: form.routeOrigin.trim(),
          destination: form.routeDestination.trim(),
        },
        transport: Number(form.transport),
        status: form.tripStatus || "scheduled",
        startTime: form.startTime,
        endTime: form.endTime || null,
      };

      console.debug("Creating trip payload", { tripPayload });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tripPayload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to create trip");
      }

      await fetchTrips();

      // Reset only trip fields in form
      setForm((f) => ({
        ...f,
        truckId: "",
        product: "",
        routeOrigin: "",
        routeDestination: "",
        transport: "",
        tripStatus: "scheduled",
        startTime: null,
        endTime: null,
      }));

      return result.data; // created trip object
    } catch (e) {
      setTripsError(e.message || "Failed to create trip");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update trip
  const updateTrip = async (id, tripData) => {
    try {
      setTripsError(null);
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(tripData),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to update trip");
      await fetchTrips();
      return { success: true, message: data.message, data: data.data };
    } catch (e) {
      setTripsError(e.message || "Failed to update trip");
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete trip
  const deleteTrip = async (id) => {
    try {
      setTripsError(null);
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to delete trip");
      await fetchTrips();
      return { success: true, message: data.message };
    } catch (e) {
      setTripsError(e.message || "Failed to delete trip");
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch expenses for a trip
  const fetchExpensesByTrip = async (tripId) => {
    try {
      setExpensesError(null);
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/expenses`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to fetch expenses");
      return Array.isArray(data.data) ? data.data : [];
    } catch (e) {
      setExpensesError(e.message || "Failed to fetch expenses");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add expense to a trip
  const addExpenseToTrip = async (tripId, expenseData) => {
    try {
      setExpensesError(null);
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(expenseData),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to add expense");
      return { success: true, message: data.message, data: data.data };
    } catch (e) {
      setExpensesError(e.message || "Failed to add expense");
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch trip report (JSON)
  const fetchTripReport = async (filters = {}) => {
    try {
      setTripReportError(null);
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Missing token. Please re-login.");
      const params = new URLSearchParams(filters).toString();
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/trips/report/download${params ? `?${params}` : ""}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to fetch trip report");
      setTripReport(data.data);
      return data.data;
    } catch (e) {
      setTripReportError(e.message || "Failed to fetch trip report");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete expense by ID
  const deleteExpense = async (expenseId) => {
    try {
      setExpensesError(null);
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("No auth token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/expenses/${expenseId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to delete expense");
      }
      // Optionally refresh expenses state if needed
      return { success: true, message: result.message };
    } catch (e) {
      setExpensesError(e.message || "Failed to delete expense");
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };
  return (
    <SuperAdminContext.Provider
      value={{
        // Auth / Current user
        currentUser,
        currentRole,
        allowedRoles,
        canCreate,

        // Users
        users,
        usersError,
        filteredUsers,
        fetchUsers,
        createUser,
        handleDeleteUser,

        // Trucks
        trucks,
        trucksError,
        filteredTrucks,
        handleCreateTruck,
        handleGetTruckById,
        handleUpdateTruck,
        handleDeleteTruck,
        getAllTrucks,
        // Trips
        trips,
        tripsError,
        fetchTrips,
        fetchTripById,
        handleCreateTrip,
        updateTrip,
        deleteTrip,

        // Expenses
        expenses,
        expensesError,
        fetchExpensesByTrip,
        addExpenseToTrip,
        deleteExpense,

        // Trip Report
        tripReport,
        tripReportError,
        fetchTripReport,

        // Shared state
        loading,
        form,
        setForm,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
};
