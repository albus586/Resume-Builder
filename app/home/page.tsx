"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ResumeCardContainer } from "@/components/resume-card-container";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gradient-to-br from-[#F7F7F7] to-[#EEEEEE]/50 dark:from-[#222831] dark:to-[#393E46]/50">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 z-10 bg-white/80 dark:bg-[#222831]/80 backdrop-blur-sm border-b border-[#393E46]/10 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-[#393E46] hover:bg-[#00ADB5]/10 hover:text-[#00ADB5]" />
          </div>
        </header>
        <div className="p-6">
          <ResumeCardContainer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
