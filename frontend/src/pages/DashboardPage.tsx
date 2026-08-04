import React from "react"
import { useLocation } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function formatPathName(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default function Dashboard({ children }: { children?: React.ReactNode }) {
  const location = useLocation()
  
  const pathnames = location.pathname.split("/").filter((x) => x)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Platform</BreadcrumbLink>
                </BreadcrumbItem>

                {pathnames.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                
                {pathnames.map((value, index) => {
                  const isLast = index === pathnames.length - 1
                  const to = `/${pathnames.slice(0, index + 1).join("/")}`

                  return (
                    <React.Fragment key={to}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{formatPathName(value)}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={to} className="hidden md:block">
                            {formatPathName(value)}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
           {children ? children : (
              <>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                  <div className="aspect-video rounded-xl bg-muted/50" />
                  <div className="aspect-video rounded-xl bg-muted/50" />
                  <div className="aspect-video rounded-xl bg-muted/50" />
                </div>
                <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
              </>
           )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}