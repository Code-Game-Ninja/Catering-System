"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, onSnapshot } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Users,
  Store,
  ShoppingBag,
  Activity,
  Search,
  Eye,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  DollarSign,
} from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface User {
  id: string
  email: string
  displayName?: string
  role: string
  createdAt: any
  lastLogin?: any
  isActive?: boolean
}

interface Restaurant {
  id: string
  name: string
  email: string
  phone: string
  cuisine: string
  isActive: boolean
  createdAt: any
  address: string
  rating?: number
  totalOrders?: number
}

interface Order {
  id: string
  userId: string
  total: number
  status: string
  createdAt: any
  items: any[]
  customerName?: string
  deliveryInfo?: any
  paymentInfo?: any
}

interface ActivityLog {
  id: string
  userId: string
  action: string
  timestamp: any
  details: string
  userEmail?: string
}

interface PaymentMethodProps {
  method: string
}

const PaymentMethodBadge: React.FC<PaymentMethodProps> = ({ method }) => {
  switch (method) {
    case "card":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/20">Card</Badge>
    case "paypal":
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/20">PayPal</Badge>
    case "crypto":
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/20">Crypto</Badge>
    default:
      return <Badge className="bg-cadet-gray/20 text-cadet-gray border-cadet-gray/20">{method}</Badge>
  }
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    activeRestaurants: 0,
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        await checkAdminAccess(user.uid)
      } else {
        window.location.href = "/auth"
      }
    })

    return unsubscribe
  }, [])

  const checkAdminAccess = async (userId: string) => {
    try {
      const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", userId)))

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data()
        if (userData.role === "admin") {
          setUserRole("admin")
          await loadAllData()
          setupRealTimeListeners()
        } else {
          toast.error("Access denied. Admin privileges required.")
          window.location.href = "/"
        }
      }
    } catch (error) {
      console.error("Error checking admin access:", error)
      window.location.href = "/"
    } finally {
      setIsLoading(false)
    }
  }

  const setupRealTimeListeners = () => {
    // Real-time users listener
    const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[]
      setUsers(usersData)
      updateStats(usersData, restaurants, orders)
    })

    // Real-time restaurants listener
    const restaurantsUnsubscribe = onSnapshot(collection(db, "restaurantProfiles"), (snapshot) => {
      const restaurantsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Restaurant[]
      setRestaurants(restaurantsData)
      updateStats(users, restaurantsData, orders)
    })

    // Real-time orders listener
    const ordersUnsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]
      setOrders(ordersData)
      updateStats(users, restaurants, ordersData)
    })

    return () => {
      usersUnsubscribe()
      restaurantsUnsubscribe()
      ordersUnsubscribe()
    }
  }

  const loadAllData = async () => {
    try {
      // Load users
      const usersSnapshot = await getDocs(collection(db, "users"))
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[]
      setUsers(usersData)

      // Load restaurants
      const restaurantsSnapshot = await getDocs(collection(db, "restaurantProfiles"))
      const restaurantsData = restaurantsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Restaurant[]
      setRestaurants(restaurantsData)

      // Load orders
      const ordersSnapshot = await getDocs(collection(db, "orders"))
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]
      setOrders(ordersData)

      // Load activity logs (mock data for now)
      const mockActivities: ActivityLog[] = [
        {
          id: "1",
          userId: "user1",
          action: "User Login",
          timestamp: new Date(),
          details: "User logged in successfully",
          userEmail: "user@example.com",
        },
        {
          id: "2",
          userId: "user2",
          action: "Order Placed",
          timestamp: new Date(Date.now() - 3600000),
          details: "Order #12345 placed for $45.99",
          userEmail: "customer@example.com",
        },
      ]
      setActivities(mockActivities)

      updateStats(usersData, restaurantsData, ordersData)
    } catch (error) {
      console.error("Error loading admin data:", error)
      toast.error("Failed to load admin data")
    }
  }

  const updateStats = (usersData: User[], restaurantsData: Restaurant[], ordersData: Order[]) => {
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0)
    const activeUsers = usersData.filter((user) => user.isActive !== false).length
    const activeRestaurants = restaurantsData.filter((restaurant) => restaurant.isActive).length

    setStats({
      totalUsers: usersData.length,
      totalRestaurants: restaurantsData.length,
      totalOrders: ordersData.length,
      totalRevenue,
      activeUsers,
      activeRestaurants,
    })
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole })
      toast.success("User role updated successfully!")
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role")
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), { isActive: !isActive })
      toast.success(`User ${!isActive ? "activated" : "deactivated"} successfully!`)
    } catch (error) {
      console.error("Error updating user status:", error)
      toast.error("Failed to update user status")
    }
  }

  const toggleRestaurantStatus = async (restaurantId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, "restaurantProfiles", restaurantId), { isActive: !isActive })
      toast.success(`Restaurant ${!isActive ? "activated" : "deactivated"} successfully!`)
    } catch (error) {
      console.error("Error updating restaurant status:", error)
      toast.error("Failed to update restaurant status")
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

    try {
      await deleteDoc(doc(db, "users", userId))
      toast.success("User deleted successfully!")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const getStatusBadge = (status: string | boolean) => {
    if (typeof status === "boolean") {
      return status ? (
        <Badge className="bg-green-500/20 text-green-400 border-green-400/20">Active</Badge>
      ) : (
        <Badge className="bg-red-500/20 text-red-400 border-red-400/20">Inactive</Badge>
      )
    }

    switch (status) {
      case "pending":
        return <Badge className="bg-jasmine/20 text-jasmine border-jasmine/20">Pending</Badge>
      case "confirmed":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/20">Confirmed</Badge>
      case "delivered":
        return <Badge className="bg-green-500/20 text-green-400 border-green-400/20">Delivered</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400 border-red-400/20">Cancelled</Badge>
      default:
        return <Badge className="bg-cadet-gray/20 text-cadet-gray border-cadet-gray/20">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/20">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        )
      case "producer":
        return (
          <Badge className="bg-jasmine/20 text-jasmine border-jasmine/20">
            <Store className="w-3 h-3 mr-1" />
            Producer
          </Badge>
        )
      case "user":
        return (
          <Badge className="bg-cadet-gray/20 text-cadet-gray border-cadet-gray/20">
            <Users className="w-3 h-3 mr-1" />
            User
          </Badge>
        )
      default:
        return <Badge className="bg-cadet-gray/20 text-cadet-gray border-cadet-gray/20">{role}</Badge>
    }
  }

  const formatOrderDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gunmetal via-paynes-gray to-cadet-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jasmine mx-auto mb-4"></div>
          <p className="text-jasmine">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gunmetal via-paynes-gray to-cadet-gray">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517486747129-e85d95323956?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gunmetal/90 via-paynes-gray/90 to-cadet-gray/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-jasmine mb-4 animate-float">
            Admin <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-xl text-cadet-gray">Complete platform management and analytics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="glass border-cadet-gray/20">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-jasmine mx-auto mb-2" />
              <p className="text-xs text-cadet-gray">Total Users</p>
              <p className="text-2xl font-bold text-jasmine">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          <Card className="glass border-cadet-gray/20">
            <CardContent className="p-4 text-center">
              <UserCheck className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-xs text-cadet-gray">Active Users</p>
              <p className="text-2xl font-bold text-green-400">{stats.activeUsers}</p>
            </CardContent>
          </Card>
          <Card className="glass border-cadet-gray/20">
            <CardContent className="p-4 text-center">
              <Store className="h-6 w-6 text-jasmine mx-auto mb-2" />
              <p className="text-xs text-cadet-gray">Restaurants</p>
              <p className="text-2xl font-bold text-jasmine">{stats.totalRestaurants}</p>
            </CardContent>
          </Card>
          <Card className="glass border-cadet-gray/20">
            <CardContent className="p-4 text-center">
              <Activity className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-xs text-cadet-gray">Active Restaurants</p>
              <p className="text-2xl font-bold text-green-400">{stats.activeRestaurants}</p>
            </CardContent>
          </Card>
          <Card className="glass border-cadet-gray/20">
            <CardContent className="p-4 text-center">
              <ShoppingBag className="h-6 w-6 text-jasmine mx-auto mb-2" />
              <p className="text-xs text-cadet-gray">Total Orders</p>
              <p className="text-2xl font-bold text-jasmine">{stats.totalOrders}</p>
            </CardContent>
          </Card>
          <Card className="glass border-cadet-gray/20">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-xs text-cadet-gray">Revenue</p>
              <p className="text-2xl font-bold text-green-400">${stats.totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cadet-gray h-4 w-4" />
            <Input
              placeholder="Search users, restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gunmetal/20 border-cadet-gray/40 text-jasmine placeholder-cadet-gray"
            />
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gunmetal/20">
            <TabsTrigger value="users" className="data-[state=active]:bg-jasmine data-[state=active]:text-gunmetal">
              Users
            </TabsTrigger>
            <TabsTrigger
              value="restaurants"
              className="data-[state=active]:bg-jasmine data-[state=active]:text-gunmetal"
            >
              Restaurants
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-jasmine data-[state=active]:text-gunmetal">
              Orders
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-jasmine data-[state=active]:text-gunmetal">
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="glass border-cadet-gray/20">
              <CardHeader>
                <CardTitle className="text-jasmine">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((userData) => (
                    <div
                      key={userData.id}
                      className="flex items-center justify-between p-4 bg-gunmetal/20 rounded-lg border border-cadet-gray/20"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="text-jasmine font-semibold">{userData.displayName || userData.email}</p>
                          {getRoleBadge(userData.role)}
                          {getStatusBadge(userData.isActive !== false)}
                        </div>
                        <p className="text-cadet-gray text-sm">{userData.email}</p>
                        <p className="text-paynes-gray text-xs">
                          Joined: {userData.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={userData.role || "user"}
                          onValueChange={(value) => updateUserRole(userData.id, value)}
                        >
                          <SelectTrigger className="w-32 bg-gunmetal/20 border-cadet-gray/40 text-jasmine">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="producer">Producer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(userData.id, userData.isActive !== false)}
                          className={`border-cadet-gray/40 ${
                            userData.isActive !== false
                              ? "text-red-400 hover:bg-red-500/10"
                              : "text-green-400 hover:bg-green-500/10"
                          }`}
                        >
                          {userData.isActive !== false ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteUser(userData.id)}
                          className="border-red-400/40 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants">
            <Card className="glass border-cadet-gray/20">
              <CardHeader>
                <CardTitle className="text-jasmine">Restaurant Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRestaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="flex items-center justify-between p-4 bg-gunmetal/20 rounded-lg border border-cadet-gray/20"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="text-jasmine font-semibold">{restaurant.name}</p>
                          {getStatusBadge(restaurant.isActive)}
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/20">
                            {restaurant.cuisine}
                          </Badge>
                        </div>
                        <p className="text-cadet-gray text-sm">{restaurant.email}</p>
                        <p className="text-cadet-gray text-sm">{restaurant.phone}</p>
                        <p className="text-paynes-gray text-xs">{restaurant.address}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-cadet-gray/40 text-cadet-gray hover:text-jasmine hover:bg-cadet-gray/10"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.isActive)}
                          className={`border-cadet-gray/40 ${
                            restaurant.isActive
                              ? "text-red-400 hover:bg-red-500/10"
                              : "text-green-400 hover:bg-green-500/10"
                          }`}
                        >
                          {restaurant.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="glass border-cadet-gray/20">
              <CardHeader>
                <CardTitle className="text-jasmine">Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 20).map((order) => (
                    <div key={order.id} className="p-4 bg-gunmetal/20 rounded-lg border border-cadet-gray/20">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-jasmine font-semibold">Order #{order.id.slice(-8)}</p>
                          <p className="text-cadet-gray text-sm">Customer: {order.customerName || "N/A"}</p>
                          <p className="text-cadet-gray text-sm">
                            Total: ${order.total?.toFixed(2)} | Items: {order.items?.length || 0}
                          </p>
                          <p className="text-paynes-gray text-xs">
                            {order.createdAt?.toDate?.()?.toLocaleString() || "N/A"}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                              className="border-cadet-gray/40 text-cadet-gray hover:text-pumpkin hover:bg-pumpkin/10"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gunmetal border-cadet-gray/20">
                            <DialogHeader>
                              <DialogTitle className="text-pumpkin text-xl">
                                Order Details #{selectedOrder?.id.slice(-8)}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-6 text-antiflash-white">
                                {/* Order Status & Date */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="text-celestial-blue font-semibold mb-2">Order Status</h3>
                                    <div className="flex items-center space-x-2">
                                      {getStatusBadge(selectedOrder.status)}
                                      <span className="text-sm text-cadet-gray">
                                        {formatOrderDate(selectedOrder.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="text-celestial-blue font-semibold mb-2">Order Total</h3>
                                    <p className="text-2xl font-bold text-pumpkin">
                                      ${selectedOrder.total?.toFixed(2) || "0.00"}
                                    </p>
                                  </div>
                                </div>

                                {/* Customer Information */}
                                <div>
                                  <h3 className="text-celestial-blue font-semibold mb-3">Customer Information</h3>
                                  <div className="bg-gunmetal/50 p-4 rounded-lg border border-cadet-gray/20">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-cadet-gray">Name</p>
                                        <p className="text-antiflash-white">
                                          {selectedOrder.deliveryInfo?.firstName} {selectedOrder.deliveryInfo?.lastName}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-cadet-gray">Email</p>
                                        <p className="text-antiflash-white">
                                          {selectedOrder.deliveryInfo?.email || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-cadet-gray">Phone</p>
                                        <p className="text-antiflash-white">
                                          {selectedOrder.deliveryInfo?.phone || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-cadet-gray">Delivery Address</p>
                                        <p className="text-antiflash-white">
                                          {selectedOrder.deliveryInfo?.street}
                                          <br />
                                          {selectedOrder.deliveryInfo?.city}, {selectedOrder.deliveryInfo?.state}{" "}
                                          {selectedOrder.deliveryInfo?.zipCode}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                  <h3 className="text-celestial-blue font-semibold mb-3">Order Items</h3>
                                  <div className="space-y-3">
                                    {selectedOrder.items?.map((item, index) => (
                                      <div
                                        key={index}
                                        className="bg-gunmetal/50 p-4 rounded-lg border border-cadet-gray/20"
                                      >
                                        <div className="flex items-center space-x-4">
                                          <img
                                            src={item.imageUrl || "/placeholder.svg?height=60&width=60"}
                                            alt={item.name}
                                            className="w-15 h-15 rounded-lg object-cover"
                                          />
                                          <div className="flex-1">
                                            <h4 className="text-antiflash-white font-semibold">{item.name}</h4>
                                            <p className="text-cadet-gray text-sm">by {item.producerName}</p>
                                            <div className="flex items-center justify-between mt-2">
                                              <span className="text-sm text-cadet-gray">Quantity: {item.quantity}</span>
                                              <span className="text-pumpkin font-semibold">
                                                ${(item.price * item.quantity).toFixed(2)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Payment Information */}
                                <div>
                                  <h3 className="text-celestial-blue font-semibold mb-3">Payment Information</h3>
                                  <div className="bg-gunmetal/50 p-4 rounded-lg border border-cadet-gray/20">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-cadet-gray">Payment Method</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <PaymentMethodBadge method={selectedOrder.paymentInfo?.method || "card"} />
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm text-cadet-gray">Transaction ID</p>
                                        <p className="text-antiflash-white font-mono text-sm">
                                          {selectedOrder.paymentInfo?.transactionId || selectedOrder.id}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Summary */}
                                <div>
                                  <h3 className="text-celestial-blue font-semibold mb-3">Order Summary</h3>
                                  <div className="bg-gunmetal/50 p-4 rounded-lg border border-cadet-gray/20">
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-cadet-gray">Subtotal</span>
                                        <span className="text-antiflash-white">
                                          ${((selectedOrder.total || 0) * 0.9).toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-cadet-gray">Tax</span>
                                        <span className="text-antiflash-white">
                                          ${((selectedOrder.total || 0) * 0.1).toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="border-t border-cadet-gray/20 pt-2">
                                        <div className="flex justify-between">
                                          <span className="text-pumpkin font-semibold">Total</span>
                                          <span className="text-pumpkin font-bold text-lg">
                                            ${selectedOrder.total?.toFixed(2) || "0.00"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="glass border-cadet-gray/20">
              <CardHeader>
                <CardTitle className="text-jasmine">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-4 bg-gunmetal/20 rounded-lg border border-cadet-gray/20">
                      <div className="flex items-start space-x-3">
                        <Activity className="h-5 w-5 text-jasmine mt-0.5" />
                        <div className="flex-1">
                          <p className="text-jasmine font-semibold">{activity.action}</p>
                          <p className="text-cadet-gray text-sm">{activity.details}</p>
                          <p className="text-paynes-gray text-xs">
                            {activity.userEmail} • {activity.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
