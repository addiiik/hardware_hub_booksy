export type CategoryType = 
  | "Laptop" 
  | "Smartphone" 
  | "Tablet" 
  | "Monitor" 
  | "Peripheral" 
  | "Audio" 
  | "Accessory" 
  | "Networking" 
  | "Other"

export type StatusType = "Available" | "In Use" | "In Repair"

export type HardwareItem = {
  id: number
  name: string
  serial_number: string
  brand: string
  category: CategoryType
  status: StatusType
  purchase_date: string
  rentable: boolean
}