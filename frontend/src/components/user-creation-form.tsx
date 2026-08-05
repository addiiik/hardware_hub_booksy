"use client"

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
import { userCreationSchema, type UserCreationValues } from "@/schemas/user"

interface UserCreationFormProps {
  onSuccess: () => void
}

export function UserCreationForm({ onSuccess }: UserCreationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserCreationValues>({
    resolver: zodResolver(userCreationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      password: "",
      email: "",
      role: "" as any,
    },
  })

  const onSubmit = async (values: UserCreationValues) => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create user")
      }

      toast.success("User created successfully!")
      onSuccess() 
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative flex flex-col gap-4 py-4">
      {isSubmitting && <LoadingOverlay transparent />}
      
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="first_name">First Name</FieldLabel>
            <Input id="first_name" placeholder="John" {...register("first_name")} />
            {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
          </Field>

          <Field>
            <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
            <Input id="last_name" placeholder="Doe" {...register("last_name")} />
            {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
          </Field>
        </div>

        <Field>
          <FieldLabel>Company Email</FieldLabel>
          <Input id="email" placeholder="name@booksy.com" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </Field>

        <Field>
          <FieldLabel>Role</FieldLabel>
          <Select 
            value={watch("role")}
            onValueChange={(value) => setValue("role", value as any, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" className="capitalize" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
          Create User Account
        </Button>
      </FieldGroup>
    </form>
  )
}