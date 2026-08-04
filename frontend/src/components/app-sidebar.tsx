"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar"
import { LaptopIcon, ClipboardListIcon, WrenchIcon, UsersIcon } from "lucide-react"
import { useAuth } from "@/auth/AuthContext"

const platformLinks = [
  { title: "Hardware List", url: "/", icon: <LaptopIcon />, isActive: true },
  { title: "My Rentals", url: "/rentals", icon: <ClipboardListIcon /> },
]

const adminLinks = [
  { title: "Hardware", url: "/admin/hardware", icon: <WrenchIcon /> },
  { title: "Users", url: "/admin/users", icon: <UsersIcon /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-default hover:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-transparent">
                <img src="/booksy_small.svg" alt="Booksy Logo" className="size-6" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Hardware Hub</span>
                <span className="truncate text-xs">Internal</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain label="Platform" items={platformLinks} />
        
        {user?.role === "admin" && (
          <NavMain label="Admin Panel" items={adminLinks} />
        )}
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}