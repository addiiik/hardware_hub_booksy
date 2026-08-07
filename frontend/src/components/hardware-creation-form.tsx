"use client"

import { API_BASE_URL } from "@/lib/config"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import LoadingOverlay from "@/components/loading-overlay"
import {
  hardwareCreationSchema,
  type HardwareCreationValues,
  CATEGORIES,
  STATUSES,
} from "@/schemas/hardware"

interface HardwareCreationFormProps {
  onSuccess: () => void
}

export function HardwareCreationForm({ onSuccess }: HardwareCreationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HardwareCreationValues>({
    resolver: zodResolver(hardwareCreationSchema),
    defaultValues: {
      device_name: "",
      serial_number: "",
      brand: "",
      category: "" as any,
      status: "" as any,
      purchase_date: new Date().toISOString().split("T")[0],
      rentable: true,
    },
  })

  const selectedCategory = watch("category")
  const selectedStatus = watch("status")
  const selectedRentable = watch("rentable")
  const today = new Date().toISOString().split("T")[0];

  const onSubmit = async (values: HardwareCreationValues) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/hardware`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create hardware")
      }

      toast.success("Hardware created successfully!")
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative flex flex-col gap-4 py-2">
      {isSubmitting && <LoadingOverlay transparent />}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="device_name">Device Name</FieldLabel>
          <Input id="device_name" placeholder="MacBook Pro 16" {...register("device_name")} />
          {errors.device_name && <p className="text-sm text-destructive">{errors.device_name.message}</p>}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="serial_number">Serial Number</FieldLabel>
            <Input id="serial_number" placeholder="SN-98765432" {...register("serial_number")} />
            {errors.serial_number && <p className="text-sm text-destructive">{errors.serial_number.message}</p>}
          </Field>

          <Field>
            <FieldLabel htmlFor="brand">Brand</FieldLabel>
            <Input id="brand" placeholder="Apple" {...register("brand")} />
            {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              value={selectedCategory}
              onValueChange={(val) => setValue("category", val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </Field>

          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select
              value={selectedStatus}
              onValueChange={(val) => setValue("status", val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((stat) => (
                  <SelectItem key={stat} value={stat}>
                    {stat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="purchase_date">Purchase Date</FieldLabel>
            <Input 
              id="purchase_date" 
              type="date" 
              max={today} 
              {...register("purchase_date")} 
            />
            {errors.purchase_date && <p className="text-sm text-destructive">{errors.purchase_date.message}</p>}
          </Field>

          <Field>
            <FieldLabel>Rentable</FieldLabel>
            <Select
              value={selectedRentable ? "true" : "false"}
              onValueChange={(val) => setValue("rentable", val === "true")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rentable?" className={'capitalize'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
          Add New Hardware
        </Button>
      </FieldGroup>
    </form>
  )
}