import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "@/pages/LoginPage"
import DashboardLayout from "@/layouts/DashboardLayout"
import HardwareListPage from "@/pages/HardwareListPage"
import MyRentalsPage from "@/pages/MyRentalsPage"
import AdminHardwarePage from "@/pages/AdminHardwarePage"
import AdminAccountsPage from "@/pages/AdminAccountsPage"
import AdminNotificationPage from "@/pages/AdminNotificationPage"
import ProtectedRoute from "@/routes/ProtectedRoute"
import GuestRoute from "@/routes/GuestRoute"
import { AuthProvider } from "./context/AuthContext"
import { Toaster } from "sonner"
import { NotificationProvider } from "./context/NotificationContext"

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
        <Toaster position="bottom-right" />
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/signin" element={<LoginPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Navigate to="/hardware" replace />} />
                <Route path="/hardware" element={<HardwareListPage />} />
                <Route path="/rentals" element={<MyRentalsPage />} />

                <Route element={<ProtectedRoute adminOnly />}>
                  <Route path="/admin/hardware" element={<AdminHardwarePage />} />
                  <Route path="/admin/accounts" element={<AdminAccountsPage />} />
                  <Route path="/admin/notifications" element={<AdminNotificationPage />} /> 
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/hardware" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  )
}