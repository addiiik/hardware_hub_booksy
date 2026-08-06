"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, CheckCheck, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { NotificationDialog } from "@/components/notification-dialog"
import { useNotifications, AppNotification } from "@/context/NotificationContext"

export default function AdminNotificationPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [page, setPage] = useState(1)
  const pageSize = 10
  
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenDialog = (notif: AppNotification) => {
    setSelectedNotification(notif)
    setIsDialogOpen(true)
    if (!notif.is_read) {
      markAsRead(notif.id)
    }
  }

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const totalPages = Math.max(1, Math.ceil(sortedNotifications.length / pageSize))
  const paginatedNotifications = sortedNotifications.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full max-w-5xl mx-auto gap-4 px-2 pb-4">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Admin Notifications</h1>
          <p className="text-muted-foreground text-sm">View system alerts and activity.</p>
        </div>
        {unreadCount > 0 && (
          <div className="flex flex-col gap-1 text-right">
            <Button onClick={markAllAsRead} className="gap-2">
              <CheckCheck className="size-4" />
              Mark all as read
            </Button>
            <p className="text-muted-foreground text-sm">Unread notifications: {unreadCount}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 bg-card border rounded-lg shadow-sm overflow-hidden">
        {sortedNotifications.length === 0 ? (
          <div className="flex items-center justify-center flex-1 p-8 text-center text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y">
            {paginatedNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-stretch transition-colors hover:bg-muted/50 ${
                  notif.is_read ? 'opacity-70 bg-transparent' : 'bg-muted/20 font-medium'
                }`}
              >
                <button 
                  className="flex-1 flex gap-3 items-center p-4 text-left"
                  onClick={() => handleOpenDialog(notif)}
                >
                  {notif.message.includes("✅") || notif.message.includes("Successfully") ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : notif.message.includes("❌") || notif.message.includes("Error") || notif.message.includes("Failed") ? (
                    <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  ) : (
                    <div className="h-5 w-5 shrink-0" />
                  )}
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <p className="text-sm truncate">
                      {notif.message.replace(/[✅❌]/g, '').trim()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                </button>

                <div className="flex items-center pr-4">
                  {!notif.is_read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(notif.id)
                      }}
                    >
                      <Check className="size-3.5" />
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between shrink-0 py-2">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <NotificationDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        notification={selectedNotification} 
      />
    </div>
  )
}