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
import { LaptopIcon, ClipboardListIcon, UsersIcon, HardDrive, Bell } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useNotifications } from "@/context/NotificationContext"

const platformLinks = [
  { title: "Hardware List", url: "/hardware", icon: <LaptopIcon /> },
  { title: "My Rentals", url: "/rentals", icon: <ClipboardListIcon /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()

  const adminLinks = [
    { title: "All Hardware", url: "/admin/hardware", icon: <HardDrive /> },
    { title: "Users", url: "/admin/accounts", icon: <UsersIcon /> },
    { 
      title: "Notifications", 
      url: "/admin/notifications", 
      icon: (
        <div className="relative flex items-center justify-center">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      ) 
    },
  ]

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
                <span className="truncate text-xs capitalize">
                  {user?.role ?? "Internal"}
                </span>
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