"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react"; // Optional: for a close icon
// Responsive hook
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconFilter,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useSuperAdmin } from "../context/SuperAdminContext";
import { Eye, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const UsersDataTable = dynamic(
  () => import("@/components/user-datatable").then((mod) => mod.UsersDataTable),
  { ssr: false }
);

const Users = () => {
  const {
    usersError,
    form,
    setForm,
    allowedRoles,
    canCreate,
    filteredUsers,
    loading,
    currentUser,
    createUser,
    fetchUsers,
  } = useSuperAdmin();

  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetSmOpen, setSmSheetOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const isMobile = useIsMobile();
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    const result = await createUser();
    setCreateLoading(false);
    if (result?.success) {
      toast.success(result.message);
      setSheetOpen(false);
    } else {
      toast.error(result?.message || "Failed to create user");
    }
  };

  const filtered = React.useMemo(() => {
    return filteredUsers.filter((u) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        u.name?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.role?.toLowerCase().includes(searchLower);
      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [filteredUsers, search, roleFilter]);

  // Paginated users for current page
  const paginatedUsers = React.useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div className="py-6! flex flex-col gap-5 px-4!">
      {/* Responsive header: mobile and desktop layouts */}
      <div className="flex flex-col gap-2 mb-6!">
        {/* First line: title and add user (mobile: both, desktop: title left, add user right) */}
        <div className="flex flex-row items-center w-full pr-1!">
          <h2 className="text-xl font-semibold flex-1">
            Users Management Page
          </h2>
          <Button onClick={() => setSmSheetOpen(true)} title="Add User">
            <IconPlus className="size-4" />
            Add User
          </Button>
          {/* Mobile: add user button right of title */}
          <AnimatePresence>
            {sheetSmOpen && (
              <motion.div
                className="fixed inset-0 z-50 flex justify-end bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-full max-w-md bg-background !px-4 !py-3 overflow-y-auto shadow-lg relative"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setSmSheetOpen(false)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </button>

                  {/* Header */}
                  <div className="!mb-4 !pr-8">
                    <h2 className="text-lg font-semibold">Add User</h2>
                    <p className="text-sm text-muted-foreground">
                      Fill in the details to create a new user. Role options
                      depend on your permissions.
                    </p>
                  </div>

                  {/* ✅ Full Form */}
                  <form onSubmit={handleCreateUser} className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="user-name">Name</Label>
                      <Input
                        id="user-name"
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="Full name"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="user-email">Email</Label>
                      <Input
                        id="user-email"
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                        placeholder="name@example.com"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="user-password">Password</Label>
                      <Input
                        id="user-password"
                        type="password"
                        value={form.password}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, password: e.target.value }))
                        }
                        placeholder="Enter password"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="user-role">Role</Label>
                      <Select
                        value={form.role}
                        onValueChange={(val) =>
                          setForm((f) => ({ ...f, role: val }))
                        }
                      >
                        <SelectTrigger id="user-role" className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedRoles.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="user-active">Status</Label>
                      <Select
                        value={form.isActive}
                        onValueChange={(val) =>
                          setForm((f) => ({ ...f, isActive: val }))
                        }
                      >
                        <SelectTrigger id="user-active" className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {usersError && (
                      <div className="text-red-600 text-sm">{usersError}</div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button
                        type="submit"
                        disabled={!canCreate || createLoading}
                      >
                        {createLoading ? "Creating..." : "Create User"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSmSheetOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Desktop: add user button right-aligned */}
          <div className="hidden md:flex items-center">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  className="items-center gap-2 !p-2"
                  title="Add User"
                >
                  <IconPlus className="size-4" />
                  Add User
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto max-h-screen">
                {/* ...existing code for SheetContent... */}
                <SheetHeader>
                  <SheetTitle>Add User</SheetTitle>
                  <SheetDescription>
                    Fill in the details to create a new user. Role options
                    depend on your permissions.
                  </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleCreateUser} className="grid gap-6 !mt-6">
                  {/* ...existing code for form fields... */}
                  <div className="grid gap-2 p-0!">
                    <Label htmlFor="user-name">Name</Label>
                    <Input
                      id="user-name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div className="grid gap-2 p-0!">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2 p-0!">
                    <Label htmlFor="user-password">Password</Label>
                    <Input
                      id="user-password"
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div className="grid gap-2 p-0!">
                    <Label htmlFor="user-role">Role</Label>
                    <Select
                      value={form.role}
                      onValueChange={(val) =>
                        setForm((f) => ({ ...f, role: val }))
                      }
                    >
                      <SelectTrigger id="user-role" className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedRoles.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 p-0!">
                    <Label htmlFor="user-active">Status</Label>
                    <Select
                      value={form.isActive}
                      onValueChange={(val) =>
                        setForm((f) => ({ ...f, isActive: val }))
                      }
                    >
                      <SelectTrigger id="user-active" className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {usersError && (
                    <div className="text-red-600 text-sm">{usersError}</div>
                  )}
                  <SheetFooter className="mt-2!">
                    <Button
                      type="submit"
                      disabled={!canCreate || createLoading}
                    >
                      {createLoading ? "Creating..." : "Create User"}
                    </Button>
                    <SheetClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {/* Subtitle and current user info */}
        <p className="text-sm text-muted-foreground">
          Manage and monitor all users.
        </p>
        {/* Second line: search and refresh (mobile only) */}
        <div className="flex flex-row items-center gap-2 w-full md:hidden">
          <Input
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-45 flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <IconRefresh className="mr-1! size-4" />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        {/* Second line: search and refresh (desktop only) */}
        <div className="hidden md:flex flex-row items-center gap-2 w-full justify-end">
          <Input
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-45 md:w-62.5 lg:w-75"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <IconRefresh className="mr-1! size-4" />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        {/* Third line: role filter, always right-aligned */}
        <div className="flex justify-end mt-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="min-w-35">
              <SelectValue placeholder="Role Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="operator">Operator</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Table or Cards */}
      <div className="flex flex-col px-2 gap-4">
        {loading ? (
          <div className="text-center text-muted-foreground">
            Loading Users...
          </div>
        ) : (
          <UsersDataTable
            data={paginatedUsers}
            fetchUsers={fetchUsers}
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            setPage={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default Users;
