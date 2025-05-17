"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function TeamSwitcher() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className={`flex items-center gap-2 ${
            isCollapsed ? "justify-center px-0" : "px-4"
          } py-2`}
        >
          <div className="bg-[#00ADB5] text-[#EEEEEE] flex aspect-square size-8 items-center justify-center rounded-lg shadow-md">
            <FileText className="size-4" />
          </div>
          {!isCollapsed && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-[#EEEEEE]">
                Resume Builder
              </span>
              <span className="truncate text-xs text-[#EEEEEE]/70">
                Professional Tool
              </span>
            </div>
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
