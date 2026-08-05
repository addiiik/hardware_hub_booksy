import { z } from "zod"

export const ROLES = ["employee", "admin"] as const

export const userCreationSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z
    .email("Please enter a valid email address")
    .refine(
      (email) => email.endsWith("@booksy.com"),
      {
        message: "You must use your @booksy.com email address",
      }
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(ROLES, {
    error: "Role is required",
  }),
})

export type UserCreationValues = z.infer<typeof userCreationSchema>