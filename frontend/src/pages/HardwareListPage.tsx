"use client"

import { API_BASE_URL } from "@/lib/config"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { toast } from "sonner"
import LoadingOverlay from "@/components/loading-overlay"
import { HardwareItem } from "@/types/hardware"
import { getHardwareColumns } from "@/components/columns/hardware-columns"

export default function HardwareListPage() {
  const [data, setData] = useState<HardwareItem[]>([])
  const [aiData, setAiData] = useState<HardwareItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAiMode, setIsAiMode] = useState(false)

  async function fetchHardware() {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/hardware`, {
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch hardware data")
      
      const freshData: HardwareItem[] = await response.json()
      setData(freshData)

      setAiData((prevAiData) => {
        if (!prevAiData) return null
        return prevAiData.map((aiItem) => {
          const matchingFreshItem = freshData.find((item) => item.id === aiItem.id)
          return matchingFreshItem ? { ...aiItem, ...matchingFreshItem } : aiItem
        })
      })

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAiSearch(query: string) {
    if (!query.trim()) {
       setAiData(null)
       return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/hardware/ai-search?query=${encodeURIComponent(query)}`, {
        credentials: "include",
      })
      if (!response.ok) throw new Error("AI search failed")
      setAiData(await response.json())
      toast.success("AI found the best matches!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleAiMode = (enabled: boolean) => {
    setIsAiMode(enabled)
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
        <DataTable 
          columns={columns} 
          data={isAiMode && aiData ? aiData : data} 
          initialSorting={[{ id: "status", desc: false }]} 
          enableAiSearch={true}
          isAiMode={isAiMode}
          onAiToggle={toggleAiMode}
          onAiSearchSubmit={handleAiSearch}
        />
      )}
    </div>
  )
}