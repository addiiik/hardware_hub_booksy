import { API_BASE_URL } from "@/lib/config"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, RotateCcw } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { RentedItem } from "@/types/rentals"
import { toast } from "sonner"

export const getRentalsColumns = (onItemReturned: () => void): ColumnDef<RentedItem>[] => [
  { accessorKey: "item.name", header: "Device Name" },
  { accessorKey: "item.brand", header: "Brand" },
  { accessorKey: "item.serial_number", header: "Serial Number" },
  { accessorKey: "item.category", header: "Category" },
  {
    accessorKey: "rented_at",
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Rented At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return new Date(row.getValue("rented_at")).toLocaleDateString()
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rental = row.original

      async function handleReturn() {
        try {
          const res = await fetch(`${API_BASE_URL}/api/hardware/${rental.item.id}/toggle-rent`, {
            method: "POST",
            credentials: "include"
          })
          
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.detail || "Failed to return item")
          }
          
          toast.success(`Successfully returned ${rental.item.name}`)
          onItemReturned()
        } catch (error: any) {
          toast.error(error.message)
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
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleReturn}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Return Item
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]