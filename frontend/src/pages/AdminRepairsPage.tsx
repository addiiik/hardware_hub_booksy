"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { toast } from "sonner"
import LoadingOverlay from "@/components/loading-overlay"
import { getRepairsColumns } from "@/components/columns/repairs-columns"

export default function AdminRepairsPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchRepairs() {
    try {
      const response = await fetch("http://localhost:8000/api/admin/repairs", { 
        credentials: "include" 
      })
      if (!response.ok) throw new Error("Failed to fetch repairs")
      setData(await response.json())
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRepairs()
  }, [])

  const columns = getRepairsColumns(fetchRepairs)

  return (
    <div className="flex flex-col gap-4 px-2">
      <div>
        <h1 className="text-2xl font-bold">Repairs</h1>
        <p className="text-muted-foreground mt-2">Active equipment maintenance and repairs.</p>
      </div>
      {loading ? <LoadingOverlay transparent /> : <DataTable columns={columns} data={data} />}
    </div>
  )
}