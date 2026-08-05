export type RepairItem = {
  id: number
  repair_start_date: string
  item: {
    id: number
    name: string
    brand: string
    serial_number: string
    category: string
  }
}