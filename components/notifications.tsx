"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { collection, query, where, onSnapshot, updateDoc, doc, limit } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Check } from "lucide-react"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  orderId?: string
  isRead: boolean
  createdAt: any
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        loadNotifications(user.uid)
      } else {
        setUser(null)
        setNotifications([])
      }
    })

    return unsubscribe
  }, [])

  const loadNotifications = (userId: string) => {
    try {
      const notificationsRef = collection(db, "notifications")
      const q = query(
        notificationsRef,
        where("userId", "==", userId),
        limit(50), // Limit to prevent large queries
      )

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const notificationsList: Notification[] = []
          snapshot.forEach((doc) => {
            notificationsList.push({ id: doc.id, ...doc.data() } as Notification)
          })

          // Sort notifications client-side by createdAt (newest first)
          notificationsList.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0
            const aTime = a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()
            const bTime = b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()
            return bTime - aTime
          })

          setNotifications(notificationsList)
        },
        (error) => {
          console.error("Error loading notifications:", error)
          // Don't show error toast for notifications as it's not critical
        },
      )

      return unsubscribe
    } catch (error) {
      console.error("Error setting up notifications listener:", error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        isRead: true,
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return ""
    }
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-cadet-gray hover:text-jasmine relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-orange-pantone text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card className="bg-gunmetal/90 border-cadet-gray/20 max-h-96 overflow-y-auto">
            <CardContent className="p-4">
              <h3 className="text-jasmine font-semibold mb-4">Notifications</h3>
              {notifications.length === 0 ? (
                <p className="text-cadet-gray text-sm">No notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.isRead ? "bg-gunmetal/20 border-cadet-gray/20" : "bg-jasmine/10 border-jasmine/20"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-jasmine font-medium text-sm">{notification.title}</h4>
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 p-0 text-cadet-gray hover:text-jasmine"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-cadet-gray text-xs mb-2">{notification.message}</p>
                      <p className="text-paynes-gray text-xs">{formatDate(notification.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
