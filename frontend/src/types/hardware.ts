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

export type BasicUserInfo = {
  first_name: string;
  last_name: string;
  email: string;
};

export type NoteItem = {
  id: number;
  content: string;
  created_at: string;
  author: BasicUserInfo;
};

export type RepairItemBase = {
  id: number;
  repair_start_date: string;
  repair_end_date: string | null;
};

export type RentalItemBase = {
  id: number;
  user_id: string;
  user: BasicUserInfo;
  rented_at: string;
  returned_at: string | null;
};

export type HardwareItem = {
  id: number
  name: string
  serial_number: string
  brand: string
  category: CategoryType
  status: StatusType
  purchase_date: string
  created_at?: string
  rentable: boolean
  rentals?: RentalItemBase[];
  repairs?: RepairItemBase[];
  notes?: NoteItem[];
  is_ai_indexed: boolean;
}