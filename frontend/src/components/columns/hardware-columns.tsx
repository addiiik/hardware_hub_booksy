import { API_BASE_URL } from "@/lib/config"

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
import { ArrowUpDown, MoreHorizontal, Hand, Eye, Wrench, Trash, RotateCcw } from "lucide-react"
import { ColumnDef, Row } from "@tanstack/react-table"
import { HardwareItem } from "@/types/hardware"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const ActionCell = ({ row, onRefresh }: { row: Row<HardwareItem>, onRefresh: () => void }) => {
  const { user } = useAuth()
  const item = row.original
  
  const isAvailable = item.status === "Available"
  const isInUse = item.status === "In Use"

  const activeRental = item.rentals?.find((r: any) => r.returned_at === null)

  const isAuthorizedToReturn = 
    user?.role === "admin" ||
    (activeRental && activeRental.user_id === user?.id)

  const isRentDisabled = isAvailable && !item.rentable
  const isReturnDisabled = isInUse && !isAuthorizedToReturn
  const isActionDisabled = (!isAvailable && !isInUse) || isRentDisabled || isReturnDisabled

  async function handleToggleRent() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hardware/${item.id}/toggle-rent`, {
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
          disabled={isActionDisabled}
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
}

export const getHardwareColumns = (onRefresh: () => void): ColumnDef<HardwareItem>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Device Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  { accessorKey: "serial_number", header: "Serial Number" },
  {
    accessorKey: "brand",
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Brand
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "purchase_date",
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Purchased
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
    cell: ({ row }) => <ActionCell row={row} onRefresh={onRefresh} />,
  },
]

export const getHardwareAdminColumns = (
  onItemDeleted: () => void,
  onViewDetails: (item: HardwareItem) => void
): ColumnDef<HardwareItem>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Device Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  { accessorKey: "serial_number", header: "Serial Number" },
  {
    accessorKey: "brand",
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Brand
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
    accessorKey: "purchase_date",
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Purchased
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  { 
    accessorKey: "rentable", 
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Rentable
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (row.original.rentable ? "Yes" : "No")
  },
  {
    accessorKey: "is_ai_indexed",
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        AI Ready?
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const isIndexed = row.getValue("is_ai_indexed")
      return isIndexed ? (
        <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">Yes</Badge>
      ) : (
        <Badge variant="secondary">No</Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original

      async function handleDelete() {
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/hardware/${item.id}`, {
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
          const res = await fetch(`${API_BASE_URL}/api/admin/hardware/${item.id}/toggle-repair`, {
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
          <DropdownMenuContent align="end" className={'min-w-50'}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Manage Item</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(item)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                disabled={item.status === "In Use"}
                onClick={handleToggleRepair}
              >
                <Wrench className="mr-2 h-4 w-4" /> 
                {item.status === "In Repair" ? "Finish Repair" : "Send to Repair"}
              </DropdownMenuItem>
              {!item.is_ai_indexed && (
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/admin/hardware/${item.id}/index-ai`, {
                        method: "POST",
                        credentials: "include"
                      })
                      if (!res.ok) {
                        const errorData = await res.json()
                        throw new Error(errorData.detail || "Failed to index item")
                      }
                      toast.success(`${item.name} indexed successfully!`)
                      onItemDeleted()
                    } catch (error: any) {
                      toast.error(error.message)
                    }
                  }}
                >
                  <Sparkles className="mr-2 h-4 w-4 text-purple-500" /> Index for AI Search
                </DropdownMenuItem>
              )}
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