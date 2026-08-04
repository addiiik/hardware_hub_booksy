import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="hidden bg-muted lg:flex items-center justify-center p-10">
        <img
          src="/booksy.svg"
          alt="Booksy Logo"
          className="max-h-24 max-w-xs h-auto w-auto object-contain dark:brightness-200"
        />
      </div>
    </div>
  )
}