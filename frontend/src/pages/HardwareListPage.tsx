"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { toast } from "sonner"
import LoadingOverlay from "@/components/loading-overlay"
import { HardwareItem } from "@/types/hardware"
import { getHardwareColumns } from "@/components/columns/hardware-columns"

export default function HardwareListPage() {
  const [data, setData] = useState<HardwareItem[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchHardware() {
    try {
      const response = await fetch("http://localhost:8000/api/hardware", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch hardware data")
      }

      const result = await response.json()
      setData(result)
    } catch (error: any) {
      toast.error(error.message || "Something went wrong fetching data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHardware()
  }, [])

  const columns = getHardwareColumns(fetchHardware)

  return (
    <div className="flex flex-col gap-4 px-2">
      <div>
        <h1 className="text-2xl font-bold">Hardware List</h1>
      </div>

      {loading ? (
        <LoadingOverlay transparent/>
      ) : (
        <DataTable columns={columns} data={data} initialSorting={[{ id: "status", desc: false }]} />
      )}
    </div>
  )
}