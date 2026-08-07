import { API_BASE_URL } from "@/lib/config"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { toast } from "sonner"
import LoadingOverlay from "@/components/loading-overlay"
import { RentedItem } from "@/types/rentals"
import { getRentalsColumns } from "@/components/columns/rentals-columns"

export default function MyRentalsPage() {
  const [data, setData] = useState<RentedItem[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchRentals() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rentals/me`, { 
        credentials: "include" 
      })
      if (!response.ok) throw new Error("Failed to fetch rentals")
      setData(await response.json())
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRentals()
  }, [])

  const columns = getRentalsColumns(fetchRentals)

  return (
    <div className="flex flex-col gap-4 px-2">
      <div>
        <h1 className="text-2xl font-bold">My Rentals</h1>
        <p className="text-muted-foreground mt-2">Equipment currently rented by you.</p>
      </div>
      {loading ? <LoadingOverlay transparent /> : <DataTable columns={columns} data={data} />}
    </div>
  )
}