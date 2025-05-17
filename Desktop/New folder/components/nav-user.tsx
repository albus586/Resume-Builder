"use client";

import { Bell, ChevronsUpDown, LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call the logout API to clear the HTTP-only cookie
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Also remove any client-side storage
      localStorage.removeItem("token");
      Cookies.remove("token");

      // Show toast notification
      toast.success("Logged out successfully", {
        description: "You have been logged out of your account",
      });

      // Redirect to sign-in page
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed", {
        description: "Please try again",
      });
    }
  };

  const navigateToProfile = () => {
    router.push("/profile");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="bg-[#393E46]/20 hover:bg-[#393E46]/40 text-[#EEEEEE] data-[state=open]:bg-[#393E46]/50 data-[state=open]:text-[#00ADB5]"
            >
              <Avatar className="h-8 w-8 rounded-lg border-2 border-[#00ADB5]/30">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-[#00ADB5]/10 text-[#00ADB5]">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-[#EEEEEE]">
                  {user.name}
                </span>
                <span className="truncate text-xs text-[#EEEEEE]/70">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-[#00ADB5]" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-[#393E46] border border-[#393E46]/30 shadow-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel
              className="p-0 font-normal cursor-pointer hover:bg-[#393E46]/80 hover:text-[#00ADB5] focus:bg-[#393E46]/80 focus:text-[#00ADB5] transition-colors"
              onClick={navigateToProfile}
            >
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm group relative">
                <Avatar className="h-8 w-8 rounded-lg border-2 border-[#00ADB5]/30">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-[#00ADB5]/10 text-[#00ADB5]">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-[#EEEEEE] group-hover:text-[#00ADB5]">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-[#EEEEEE]/70 group-hover:text-[#00ADB5]/80">
                    {user.email}
                  </span>
                </div>

                {/* Visual indicator for clickable profile */}
                <div className="absolute inset-0 border-2 border-[#00ADB5]/0 rounded-md group-hover:border-[#00ADB5]/30 transition-colors"></div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#393E46]/50" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 p-2 text-[#EEEEEE] hover:bg-[#393E46]/80 hover:text-[#00ADB5] focus:bg-[#393E46]/80 focus:text-[#00ADB5]">
                <Sparkles className="text-[#00ADB5] h-4 w-4" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-[#393E46]/50" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 p-2 text-[#EEEEEE] hover:bg-[#393E46]/80 hover:text-[#00ADB5] focus:bg-[#393E46]/80 focus:text-[#00ADB5]">
                <Bell className="text-[#00ADB5] h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-[#393E46]/50" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2 p-2 text-[#EEEEEE] hover:bg-[#393E46]/80 hover:text-[#00ADB5] focus:bg-[#393E46]/80 focus:text-[#00ADB5]"
            >
              <LogOut className="text-[#00ADB5] h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
