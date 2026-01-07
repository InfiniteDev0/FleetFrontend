// "use client";

// import {
//   IconCreditCard,
//   IconDotsVertical,
//   IconLogout,
//   IconNotification,
//   IconUserCircle,
// } from "@tabler/icons-react";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { SidebarMenuButton } from "@/components/ui/sidebar";
// import { useAuth } from "@/app/context/AuthContext";

// export function NavUser({
//   user,
// }: {
//   user: {
//     name: string;
//     email: string;
//     avatar: string;
//   };
// }) { 
//   const {logout} = useAuth();
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <SidebarMenuButton
//           size="lg"
//           className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
//         >
//           <Avatar className="h-10 w-10 roundedfull">
//             <AvatarImage
//               src={
//                 "https://galaxypfp.com/wp-content/uploads/2025/10/discord-zenitsu-pfp.webp"
//               }
//             />
//             <AvatarFallback className="rounded-lg">
//               {user.name?.[0] ?? "?"}
//             </AvatarFallback>
//           </Avatar>
//           <div className="grid flex-1 text-left text-sm leading-tight">
//             <span className="truncate font-medium">{user.name}</span>
//             <span className="text-muted-foreground truncate text-xs">
//               {user.email}
//             </span>
//           </div>
//           <IconDotsVertical className="ml-auto size-4" />
//         </SidebarMenuButton>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent
//         className="min-w-56 rounded-lg"
//         side="right"
//         align="end"
//         sideOffset={4}
//       >
//         <DropdownMenuItem onClick={logout}>
//           <IconLogout className="mr-2 size-4" />
//           Log out
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

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
