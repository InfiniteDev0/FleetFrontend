"use client";
import React, { useState } from "react";
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
          {/* Mobile: add user button right of title */}
          <div className="md:hidden flex items-center justify-end">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  className="flex items-center gap-2 p-2!"
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
                <form onSubmit={handleCreateUser} className="grid gap-6 mt-6!">
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
          {/* Desktop: add user button right-aligned */}
          <div className="hidden md:flex items-center">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  className="items-center gap-2 p-2!"
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
                <form onSubmit={handleCreateUser} className="grid gap-6 mt-6!">
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
        ) : isMobile ? (
          <>
            {paginatedUsers.map((user) => (
              <div key={user._id || user.email} className="!mb-2">
                <div className="w-full flex flex-col gap-3 !px-3 !py-2 rounded-lg border bg-card">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-5">
                      <Avatar className="bg-white/60 backdrop-blur-md border border-white/30 text-black flex items-center justify-center w-10 h-10 rounded-full shadow-md">
                        {user.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : "U"}
                      </Avatar>
                      <div>
                        <p className="text-sm">{user.name}</p>
                        <p className="text-xs">{user.email}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="!px-1.5 flex items-center gap-1"
                    >
                      <IconCircleCheckFilled className="size-4 fill-green-500 dark:fill-green-400" />
                      {user.isActive === true || user.isActive === "true"
                        ? "active"
                        : "inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between !mt-2">
                    <p className="text-sm">
                      role: <span className="text-xs">{user.role}</span>
                    </p>
                    <div className="flex items-center !gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
                              />
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Pagination for mobile cards (matching trips-data-table) */}
            <div className="flex items-center justify-between !px-4 !py-2">
              <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {paginatedUsers.length} of {filtered.length} row(s) displayed.
              </div>
              <div className="flex w-full items-center !gap-8 lg:w-fit">
                <div className="hidden items-center !gap-2 lg:flex">
                  <Label
                    htmlFor="rows-per-page"
                    className="text-sm font-medium"
                  >
                    Rows per page
                  </Label>
                  <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => {
                      setPage(0);
                      // @ts-ignore
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      // @ts-ignore
                      setPageSize(Number(value));
                    }}
                  >
                    <SelectTrigger
                      size="sm"
                      className="w-20"
                      id="rows-per-page"
                    >
                      <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((size) => (
                        <SelectItem key={size} value={`${size}`}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                  Page {page + 1} of {Math.ceil(filtered.length / pageSize)}
                </div>
                <div className="ml-auto flex items-center !gap-2 lg:!ml-0">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                  >
                    <span className="sr-only">Go to first page</span>
                    <IconChevronsLeft />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <IconChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() =>
                      setPage((p) =>
                        p + 1 < Math.ceil(filtered.length / pageSize)
                          ? p + 1
                          : p
                      )
                    }
                    disabled={page + 1 >= Math.ceil(filtered.length / pageSize)}
                  >
                    <span className="sr-only">Go to next page</span>
                    <IconChevronRight />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden size-8 lg:flex"
                    size="icon"
                    onClick={() =>
                      setPage(
                        Math.max(0, Math.ceil(filtered.length / pageSize) - 1)
                      )
                    }
                    disabled={page + 1 >= Math.ceil(filtered.length / pageSize)}
                  >
                    <span className="sr-only">Go to last page</span>
                    <IconChevronsRight />
                  </Button>
                </div>
              </div>
            </div>
          </>
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
