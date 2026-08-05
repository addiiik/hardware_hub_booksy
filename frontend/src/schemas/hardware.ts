import { z } from "zod"

export const CATEGORIES = [
  "Laptop",
  "Smartphone",
  "Tablet",
  "Monitor",
  "Peripheral",
  "Audio",
  "Accessory",
  "Networking",
  "Other",
] as const

export const STATUSES = ["Available", "In Use", "In Repair"] as const

export const hardwareCreationSchema = z.object({
  device_name: z.string().min(1, "Device name is required"),
  serial_number: z.string().min(1, "Serial number is required"),
  brand: z.string().min(1, "Brand is required"),
  category: z.enum(CATEGORIES, {
    error: "Category is required",
  }),
  status: z.enum(STATUSES, {
    error: "Status is required",
  }),
  purchase_date: z
    .string()
    .min(1, "Purchase date is required")
    .refine((val) => new Date(val) <= new Date(), {
      message: "Purchase date cannot be in the future",
    }),
  rentable: z.boolean(),
})

export type HardwareCreationValues = z.infer<typeof hardwareCreationSchema>