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
import { useSuperAdmin } from "../context/SuperAdminContext";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const UsersDataTable = dynamic(() => import("@/components/user-datatable"), {
  ssr: false,
});

const Users = () => {
  const {
    usersError,
    form,
    setForm,
    allowedRoles,
    canCreate,
    filteredUsers,
    // users,
    loading,
    currentUser,
    createUser,
    fetchUsers,
  } = useSuperAdmin();

  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

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

  const displayedUsers = React.useMemo(() => {
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

  return (
    <div className="py-6! flex flex-col gap-5 px-4!">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6!">
        <div>
          <h2 className="text-xl font-semibold">Users Management Page</h2>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all users.
          </p>
          {currentUser ? (
            <p className="text-xs text-muted-foreground mt-1!">
              Signed in as {currentUser.name} ({currentUser.role})
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1!">Not signed in</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <Input
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-62.5 p-2!"
          />

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40 p-2!">
              <IconFilter className="mr-2! size-4 text-muted-foreground" />
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="operator">Operator</SelectItem>
            </SelectContent>
          </Select>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="default"
                className="flex items-center gap-2 p-2!"
                disabled={false}
                title={"Add User"}
              >
                <IconPlus className="size-4" />
                Add User
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add User</SheetTitle>
                <SheetDescription>
                  Fill in the details to create a new user. Role options depend
                  on your permissions.
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={handleCreateUser} className="grid gap-6 mt-6!">
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
                  <Button type="submit" disabled={!canCreate || createLoading}>
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

      <div className="flex flex-col !px-2 gap-4">
        {loading ? (
          <div className="text-center text-muted-foreground">
            Loading Users...
          </div>
        ) : (
          <UsersDataTable data={displayedUsers} fetchUsers={fetchUsers} />
        )}
      </div>
    </div>
  );
};

export default Users;
