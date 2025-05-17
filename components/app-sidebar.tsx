"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Home,
  FileText,
} from "lucide-react";
import Cookies from "js-cookie";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = React.useState({
    name: "",
    email: "",
    avatar: "/avatars/shadcn.jpg",
  });

  React.useEffect(() => {
    // Get user data from cookie or API
    const token = Cookies.get("token");
    if (token) {
      try {
        // Attempt to decode the JWT token
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(window.atob(base64));

        if (payload.userId && payload.email) {
          // We have the user ID and email, now fetch full profile data
          fetchUserData();
        }
      } catch (error) {
        console.error("Error parsing token:", error);
        fetchUserData();
      }
    } else {
      // If no token in cookies, try API call
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        setUserData({
          name: data.name || "User", // Use the actual name from user profile
          email: data.email || "user@example.com",
          avatar: data.profilePhotoUrl || "/avatars/shadcn.jpg",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Rest of the teams data
  const data = {
    teams: [
      {
        name: "Acme Inc",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Home",
        url: "/home",
        icon: Home,
        isActive: false,
      },
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: PieChart,
        isActive: false,
      },
      {
        title: "View Resume",
        url: "/view-resume",
        icon: FileText,
        isActive: false,
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  };

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="bg-[#393E46] border-r border-[#393E46]/30"
    >
      <SidebarHeader className="bg-[#393E46] border-b border-[#393E46]/20">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="bg-[#393E46]">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="bg-[#393E46] border-t border-[#393E46]/20">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail className="bg-[#393E46]/10 hover:bg-[#393E46]/20" />
    </Sidebar>
  );
}
