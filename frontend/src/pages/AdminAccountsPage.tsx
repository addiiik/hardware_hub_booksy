"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"
import LoadingOverlay from "@/components/loading-overlay"
import { UserCreationForm } from "@/components/user-creation-form"
import { getUserColumns } from "@/components/columns/user-columns"
import { UserItem } from "@/types/user"

export default function AdminAccountsPage() {
  const [data, setData] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  async function fetchUsers() {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8000/api/admin/users", { credentials: "include" })
      if (!response.ok) throw new Error("Failed to fetch users")
      setData(await response.json())
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  function handleUserCreated() {
    setIsDialogOpen(false)
    fetchUsers()
  }

  const columns = getUserColumns(fetchUsers)

  const AddUserButton = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger 
        render={
          <Button size="sm" className="h-9">
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        }
      />
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new employee to the Hardware Hub.
          </DialogDescription>
        </DialogHeader>
        <UserCreationForm onSuccess={handleUserCreated} />
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="flex flex-col gap-4 px-2">
      <div>
        <h1 className="text-2xl font-bold">Account Management (Admin)</h1>
        <p className="text-muted-foreground mt-2">Create and manage employee accounts.</p>
      </div>
      {loading ? (
        <LoadingOverlay transparent />
      ) : (
        <DataTable columns={columns} data={data} actionButton={AddUserButton} />
      )}
    </div>
  )
}