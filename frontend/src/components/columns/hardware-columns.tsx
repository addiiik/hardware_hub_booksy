import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Hand, Eye, Edit, Wrench, Trash, NotepadText, RotateCcw } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { HardwareItem } from "@/types/hardware"
import { toast } from "sonner"

export const getHardwareColumns = (onRefresh: () => void): ColumnDef<HardwareItem>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Device Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  { accessorKey: "serial_number", header: "Serial Number" },
  { accessorKey: "brand", header: "Brand" },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "purchase_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Purchase Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            status === "Available"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : status === "In Use"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          }`}
        >
          {status}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original
      const isAvailable = item.status === "Available"
      const isInUse = item.status === "In Use"

      async function handleToggleRent() {
        try {
          const res = await fetch(`http://localhost:8000/api/hardware/${item.id}/toggle-rent`, {
            method: "POST",
            credentials: "include"
          })
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.detail || "Failed to update rental status")
          }
          toast.success(isAvailable ? `Rented ${item.name}` : `Returned ${item.name}`)
          onRefresh()
        } catch (err: any) {
          toast.error(err.message)
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={(!isAvailable && !isInUse) || (isAvailable && !item.rentable)}
              onClick={handleToggleRent}
            >
              {isInUse ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" /> Return Item
                </>
              ) : (
                <>
                  <Hand className="mr-2 h-4 w-4" /> Rent Item
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export const getHardwareAdminColumns = (onItemDeleted: () => void): ColumnDef<HardwareItem>[] => [
  { accessorKey: "name", header: "Device Name" },
  { accessorKey: "serial_number", header: "Serial Number" },
  { accessorKey: "brand", header: "Brand" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "status", header: "Status" },
  { 
    accessorKey: "rentable", 
    header: "Rentable",
    cell: ({ row }) => (row.original.rentable ? "Yes" : "No")
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original

      async function handleDelete() {
        try {
          const res = await fetch(`http://localhost:8000/api/admin/hardware/${item.id}`, {
            method: "DELETE",
            credentials: "include"
          })
          if (!res.ok) throw new Error("Failed to delete item")
          toast.success(`Removed hardware ${item.name}`)
          onItemDeleted()
        } catch (err: any) {
          toast.error(err.message)
        }
      }

      async function handleToggleRepair() {
        try {
          const res = await fetch(`http://localhost:8000/api/admin/hardware/${item.id}/toggle-repair`, {
            method: "POST",
            credentials: "include"
          })
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.detail || "Failed to toggle repair status")
          }
          toast.success(`Updated repair status for ${item.name}`)
          onItemDeleted() 
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
              <DropdownMenuLabel>Manage Item</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => toast.info(`View details ${item.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info(`Edit ${item.id}`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                disabled={item.status === "In Use"}
                onClick={handleToggleRepair}
              >
                <Wrench className="mr-2 h-4 w-4" /> 
                {item.status === "In Repair" ? "Finish Repair" : "Send to Repair"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info(`Add Note ${item.id}`)}>
                <NotepadText className="mr-2 h-4 w-4" /> Add Note
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:bg-destructive/10">
                <Trash className="mr-2 h-4 w-4" /> Remove
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]