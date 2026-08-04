import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .refine(
      (email) => email.endsWith("@booksy.com"),
      {
        message: "You must use your @booksy.com email address",
      }
    ),

  password: z
    .string()
    .min(1, "Password is required"),
})

export type LoginFormValues = z.infer<typeof loginSchema>