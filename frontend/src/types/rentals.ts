export type RentedItem = {
  id: number
  rented_at: string
  item: {
    id: number
    name: string
    brand: string
    serial_number: string
    category: string
  }
}