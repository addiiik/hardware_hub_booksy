"use client"

import { API_BASE_URL } from "@/lib/config"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import LoadingOverlay from "@/components/loading-overlay"
import { HardwareItem } from "@/types/hardware"
import { Plus } from "lucide-react"
import { getHardwareAdminColumns } from "@/components/columns/hardware-columns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HardwareCreationForm } from "@/components/hardware-creation-form"
import { HardwareDetailsDialog } from "@/components/hardware-details-dialog"

export default function AdminHardwarePage() {
  const [data, setData] = useState<HardwareItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [selectedItem, setSelectedItem] = useState<HardwareItem | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  async function fetchAllHardware() {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/hardware`, { credentials: "include" })
      if (!response.ok) throw new Error("Failed to fetch all hardware")
      const items: HardwareItem[] = await response.json()
      setData(items)
      
      if (selectedItem) {
        const updated = items.find((i) => i.id === selectedItem.id)
        if (updated) setSelectedItem(updated)
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllHardware()
  }, [])

  function handleHardwareCreated() {
    setIsDialogOpen(false)
    fetchAllHardware()
  }

  function handleViewDetails(item: HardwareItem) {
    setSelectedItem(item)
    setIsDetailsOpen(true)
  }

  const columns = getHardwareAdminColumns(fetchAllHardware, handleViewDetails)

  const AddItemButton = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger 
        render={
          <Button size="sm" className="h-9">
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        }
      />
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Add New Hardware</DialogTitle>
          <DialogDescription>
            Add a new item to the Hardware Hub.
          </DialogDescription>
        </DialogHeader>
        <HardwareCreationForm onSuccess={handleHardwareCreated} />
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="flex flex-col gap-4 px-2">
      <div>
        <h1 className="text-2xl font-bold">Manage Hardware (Admin)</h1>
        <p className="text-muted-foreground mt-2">Add, remove, and toggle hardware repair status.</p>
      </div>
      {loading ? (
        <LoadingOverlay transparent />
      ) : (
        <DataTable columns={columns} data={data} actionButton={AddItemButton} />
      )}
      
      <HardwareDetailsDialog 
        item={selectedItem} 
        open={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen} 
        onRefresh={fetchAllHardware}
      />
    </div>
  )
}