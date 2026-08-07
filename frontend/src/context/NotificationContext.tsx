"use client"

import { API_BASE_URL } from "@/lib/config"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"

export interface AppNotification {
  id: number
  title: string
  content: string
  is_read: boolean
  created_at: string
}

interface NotificationContextType {
  notifications: AppNotification[]
  unreadCount: number
  fetchNotifications: () => Promise<void>
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const fetchNotifications = useCallback(async () => {
    if (user?.role !== "admin") return
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, { credentials: "include" })
      if (res.ok) {
        const data: AppNotification[] = await res.json()
        setNotifications(data)
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "POST",
        credentials: "include"
      })
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch (e) {
      console.error(e)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "POST",
        credentials: "include"
      })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (e) {
      console.error(e)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}