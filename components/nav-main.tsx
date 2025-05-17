"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[#EEEEEE]/70">
        Navigation
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <Link href={item.url} passHref>
              <SidebarMenuButton
                tooltip={item.title}
                className={
                  item.isActive
                    ? "bg-[#393E46]/50 text-[#00ADB5] flex items-center gap-3"
                    : "text-[#EEEEEE] hover:text-[#00ADB5] hover:bg-[#393E46]/30 flex items-center gap-3"
                }
                asChild
              >
                <div className="flex items-center w-full">
                  {item.icon && (
                    <item.icon
                      className={
                        item.isActive
                          ? "text-[#00ADB5] h-5 w-5 mr-3 flex-shrink-0"
                          : "text-[#EEEEEE] h-5 w-5 mr-3 flex-shrink-0 group-hover:text-[#00ADB5]"
                      }
                    />
                  )}
                  <span className="flex-grow">{item.title}</span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
