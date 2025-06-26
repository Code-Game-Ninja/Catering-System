"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Eye, RotateCcw, MapPin } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { PaymentMethodBadge } from "@/components/payment-method-badge"

interface Order {
  id: string
  items: any[]
  deliveryInfo: any
  status: string
  total: number
  createdAt: any
  estimatedDelivery?: any
  paymentInfo?: any
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [currentFilter, setCurrentFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        loadOrders(user.uid)
      } else {
        window.location.href = "/auth"
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, currentFilter])

  const loadOrders = async (userId: string) => {
    try {
      const ordersRef = collection(db, "orders")
      // Remove orderBy to avoid index requirement - we'll sort client-side
      const q = query(ordersRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      const loadedOrders: Order[] = []
      querySnapshot.forEach((doc) => {
        loadedOrders.push({ id: doc.id, ...doc.data() } as Order)
      })

      // Sort client-side by createdAt descending
      loadedOrders.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
        return bTime.getTime() - aTime.getTime()
      })

      setOrders(loadedOrders)
    } catch (error) {
      console.error("Error loading orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (currentFilter === "active") {
      filtered = orders.filter((order) => ["confirmed", "preparing", "on-the-way"].includes(order.status))
    } else if (currentFilter === "delivered") {
      filtered = orders.filter((order) => order.status === "delivered")
    } else if (currentFilter === "cancelled") {
      filtered = orders.filter((order) => order.status === "cancelled")
    }

    setFilteredOrders(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500/20 text-blue-400 border-blue-400/20"
      case "preparing":
        return "bg-jasmine/20 text-jasmine border-jasmine/20"
      case "on-the-way":
        return "bg-purple-500/20 text-purple-400 border-purple-400/20"
      case "delivered":
        return "bg-green-500/20 text-green-400 border-green-400/20"
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-400/20"
      default:
        return "bg-cadet-gray/20 text-cadet-gray border-cadet-gray/20"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed"
      case "preparing":
        return "Preparing"
      case "on-the-way":
        return "On the Way"
      case "delivered":
        return "Delivered"
      case "cancelled":
        return "Cancelled"
      default:
        return "Pending"
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const reorderItems = (order: Order) => {
    if (!order.items) return

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    order.items.forEach((item) => {
      const existingItem = cart.find((cartItem: any) => cartItem.id === item.id)
      if (existingItem) {
        existingItem.quantity += item.quantity
      } else {
        cart.push({
          id: item.id || `reorder-${Date.now()}-${Math.random()}`,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          producerName: item.producerName,
          quantity: item.quantity,
        })
      }
    })

    localStorage.setItem("cart", JSON.stringify(cart))
    window.dispatchEvent(new Event("storage"))
    toast.success("Items added to cart successfully!")
  }

  const filters = [
    { value: "all", label: "All Orders" },
    { value: "active", label: "Active" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gunmetal via-paynes-gray to-cadet-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jasmine mx-auto mb-4"></div>
          <p className="text-jasmine">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gunmetal via-paynes-gray to-cadet-gray">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2081&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gunmetal/80 via-paynes-gray/80 to-cadet-gray/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-jasmine mb-4 animate-float">
            Order <span className="text-gradient">History</span>
          </h1>
          <p className="text-xl text-cadet-gray">Track your past and current orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <Card className="glass border-cadet-gray/20">
            <CardContent className="p-2">
              <div className="flex space-x-2">
                {filters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={currentFilter === filter.value ? "default" : "ghost"}
                    onClick={() => setCurrentFilter(filter.value)}
                    className={
                      currentFilter === filter.value
                        ? "bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal"
                        : "text-cadet-gray hover:text-jasmine hover:bg-cadet-gray/10"
                    }
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="glass border-cadet-gray/20 max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 text-cadet-gray mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-jasmine mb-4">No orders found</h3>
              <p className="text-cadet-gray mb-8">You haven't placed any orders yet. Start exploring our menu!</p>
              <Link href="/menu">
                <Button className="bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90">
                  Browse Menu
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="glass border-cadet-gray/20 hover:bg-cadet-gray/5 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-jasmine">Order #{order.id.slice(-8)}</h3>
                          <p className="text-cadet-gray text-sm">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                          <PaymentMethodBadge method={order.paymentInfo?.method || "card"} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-cadet-gray mb-2">
                            Items ({order.items?.length || 0})
                          </h4>
                          <div className="space-y-1">
                            {order.items?.slice(0, 2).map((item, index) => (
                              <div key={index} className="text-sm text-jasmine">
                                {item.name} x{item.quantity}
                              </div>
                            ))}
                            {order.items?.length > 2 && (
                              <div className="text-sm text-cadet-gray">+{order.items.length - 2} more items</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-cadet-gray mb-2">Delivery Address</h4>
                          <div className="text-sm text-jasmine">
                            {order.deliveryInfo?.street || "N/A"}
                            <br />
                            {order.deliveryInfo?.city || ""}, {order.deliveryInfo?.state || ""}{" "}
                            {order.deliveryInfo?.zipCode || ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-jasmine">${order.total?.toFixed(2) || "0.00"}</div>
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-cadet-gray/40 text-cadet-gray hover:text-jasmine hover:bg-cadet-gray/10"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          {(order.status === "confirmed" || order.status === "preparing") && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90"
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              Track Order
                            </Button>
                          )}
                          {order.status === "delivered" && (
                            <Button
                              onClick={() => reorderItems(order)}
                              size="sm"
                              className="bg-green-500/20 text-green-400 border border-green-400/20 hover:bg-green-500/30"
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Reorder
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
