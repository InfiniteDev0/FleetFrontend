"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconFilter, IconPlus } from "@tabler/icons-react";
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
import { useSuperAdmin } from "../context/SuperAdminContext"; // ✅ import hook

const Admins = () => {
  const {
    error,
    form,
    setForm,
    allowedRoles,
    canCreate,
    filteredAdmins, // ✅ from context
    admins, // ✅ from context
    loading,
    currentUser,
    createAdmin, // ✅ correct function name from context
  } = useSuperAdmin();

  // Local UI state
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="!py-6 flex flex-col gap-5 !px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 !mb-6">
        {/* Left: Title and Description */}
        <div>
          <h2 className="text-xl font-semibold">Admins Management Page</h2>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all admins.
          </p>
          {currentUser ? (
            <p className="text-xs text-muted-foreground !mt-1">
              Signed in as {currentUser.name} ({currentUser.role})
            </p>
          ) : (
            <p className="text-xs text-muted-foreground !mt-1">Not signed in</p>
          )}
        </div>

        {/* Right: Filters and Actions */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Field */}
          <Input
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[250px]"
          />

          {/* Status Filter */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]">
              <IconFilter className="!mr-2 size-4 text-muted-foreground" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Add Admin Button + Sheet */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="default"
                className="flex items-center gap-2"
                disabled={!canCreate}
                title={
                  !canCreate
                    ? "You do not have permission to add admins"
                    : "Add Admin"
                }
              >
                <IconPlus className="size-4" />
                Add Admin
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add Admin</SheetTitle>
                <SheetDescription>
                  Fill in the details to create a new user. Role options depend
                  on your permissions.
                </SheetDescription>
              </SheetHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createAdmin();
                }}
                className="grid gap-6 !mt-6"
              >
                {/* Name */}
                <div className="grid gap-2">
                  <Label htmlFor="admin-name">Name</Label>
                  <Input
                    id="admin-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Full name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="name@example.com"
                    required
                  />
                </div>

                {/* Role */}
                <div className="grid gap-2">
                  <Label htmlFor="admin-role">Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(val) =>
                      setForm((f) => ({ ...f, role: val }))
                    }
                  >
                    <SelectTrigger id="admin-role" className="w-full">
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

                {/* Active status */}
                <div className="grid gap-2">
                  <Label htmlFor="admin-active">Status</Label>
                  <Select
                    value={form.isActive}
                    onValueChange={(val) =>
                      setForm((f) => ({ ...f, isActive: val }))
                    }
                  >
                    <SelectTrigger id="admin-active" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Error display */}
                {error && <div className="text-red-600 text-sm">{error}</div>}

                <SheetFooter className="!mt-2">
                  <Button type="submit" disabled={!canCreate}>
                    Create user
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

      {/* Admins list */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-muted-foreground">Loading admins...</div>
        ) : filteredAdmins.length === 0 ? (
          <div className="min-h-[30vh] flex items-center justify-center text-muted-foreground">
            No admins found. Create an admin to get started.
          </div>
        ) : (
          <div className="rounded-xl border bg-card">
            <div className="p-4 border-b text-sm text-muted-foreground">
              Showing {filteredAdmins.length} of {admins.length}
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAdmins.map((u) => (
                  <div
                    key={u.id || u._id}
                    className="rounded-lg border p-4 flex flex-col gap-1"
                  >
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {u.email}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Role:</span> {u.role}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Status:</span>{" "}
                      {u.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admins;
