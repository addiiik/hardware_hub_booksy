export type Role = "admin" | "employee"

export type UserItem = {
  id: string
  first_name: string
  last_name: string
  email: string
  role: Role
  created_at: string
}