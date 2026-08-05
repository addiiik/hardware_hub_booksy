import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash } from "lucide-react"
import { toast } from "sonner"
import { UserItem } from "@/types/user"

export const getUserColumns = (onUserDeleted: () => void): ColumnDef<UserItem>[] => [
  { accessorKey: "first_name", header: "First Name" },
  { accessorKey: "last_name", header: "Last Name" },
  { accessorKey: "email", header: "Email" },
  { 
    accessorKey: "role", 
    header: "Role",
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("role")}</span>
    )
  },
  {
    accessorKey: "created_at",
    header: "Date Added",
    cell: ({ row }) => {
      return new Date(row.getValue("created_at")).toLocaleDateString()
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      async function handleDelete() {
        try {
          const res = await fetch(`http://localhost:8000/api/admin/users/${user.id}`, {
            method: "DELETE",
            credentials: "include"
          })
          if (!res.ok) throw new Error("Failed to delete user")
          toast.success(`Removed user ${user.email}`)
          onUserDeleted()
        } catch (err: any) {
          toast.error(err.message)
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Manage User</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:bg-destructive/10">
                <Trash className="mr-2 h-4 w-4" /> Remove User
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]