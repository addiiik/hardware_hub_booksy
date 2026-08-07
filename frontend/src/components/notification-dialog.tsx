import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AppNotification } from "@/context/NotificationContext"
import { CheckCircle2, XCircle } from "lucide-react"

interface NotificationDialogProps {
  notification: AppNotification | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationDialog({ notification, open, onOpenChange }: NotificationDialogProps) {
  if (!notification) return null

  const isSuccess = notification.title.includes("✅") || notification.title.includes("Successfully")
  const isError = notification.title.includes("❌") || notification.title.includes("Error") || notification.title.includes("Failed")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl min-h-[40vh] max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuccess ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : isError ? <XCircle className="h-5 w-5 text-destructive" /> : null}
            {notification.title.replace(/[✅❌]/g, '').trim()}
          </DialogTitle>
          <DialogDescription>
            {new Date(notification.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 bg-muted/30 rounded-md border mt-2 text-sm whitespace-pre-wrap wrap-break-word">
          {notification.content}
        </div>
      </DialogContent>
    </Dialog>
  )
}