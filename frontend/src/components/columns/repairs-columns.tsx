import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Wrench } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { RepairItem } from "@/types/repairs"

export const getRepairsColumns = (onRepairToggled: () => void): ColumnDef<RepairItem>[] => [
  { accessorKey: "item.name", header: "Device Name" },
  { accessorKey: "item.brand", header: "Brand" },
  { accessorKey: "item.serial_number", header: "Serial Number" },
  { accessorKey: "item.category", header: "Category" },
  {
    accessorKey: "repair_start_date",
    header: "Repair Start",
    cell: ({ row }) => {
      return new Date(row.getValue("repair_start_date")).toLocaleDateString()
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const repair = row.original

      async function handleToggleRepair() {
        try {
          const res = await fetch(`http://localhost:8000/api/admin/hardware/${repair.item.id}/toggle-repair`, {
            method: "POST",
            credentials: "include"
          })
          
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.detail || "Failed to update repair status")
          }
          
          toast.success(`Updated repair status for ${repair.item.name}`)
          onRepairToggled()
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
              <DropdownMenuItem onClick={handleToggleRepair}>
                <Wrench className="mr-2 h-4 w-4" />
                Finish Repair
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]