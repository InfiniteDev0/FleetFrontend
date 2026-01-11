"use client";

import { IconLogout } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
export function NavUser() {
  const { logout } = useAuth();
  return (
    <Button className="flex items-center gap-2" onClick={logout}>
      {" "}
      <IconLogout className="size-4" /> Log out{" "}
    </Button>
  );
}
