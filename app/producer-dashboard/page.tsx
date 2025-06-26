"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  limit,
  onSnapshot,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { auth, db, storage } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Edit,
  Trash2,
  Package,
  ShoppingBag,
  TrendingUp,
  Check,
  X,
  DollarSign,
  Star,
  Settings,
  BarChart3,
  Camera,
  MapPin,
  Phone,
  Mail,
  Globe,
  Eye,
  Download,
} from "lucide-react"
import { toast } from "sonner"
import { PaymentMethodBadge } from "@/components/payment-method-badge"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  category: string
  imageUrl?: string
  isVegetarian?: boolean
  status: string
  createdAt?: any
}

interface Order {
  id: string
  items: any[]
  deliveryInfo: any
  status: string
  total: number
  createdAt: any
  paymentInfo?: any
}

interface RestaurantProfile {
  id?: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  website?: string
  cuisine: string
  openingHours: any
  images: string[]
  rating: number
  totalReviews: number
  isActive: boolean
}

interface Analytics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  topProducts: any[]
  recentOrders: Order[]
  monthlyRevenue: number[]
}

export default function RestaurantDashboard() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [restaurantProfile, setRestaurantProfile] = useState<RestaurantProfile | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        await loadUserData(user.uid)
      } else {
        window.location.href = "/auth"
      }
    })

    return unsubscribe
  }, [])

  const loadUserData = async (userId: string) => {
    try {
      // Get user role
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        const role = userDoc.data().role || "user"
        setUserRole(role)

        if (role === "producer") {
          await loadProducts(userId)
          loadOrders(userId)
          await loadRestaurantProfile(userId)
          await calculateAnalytics(userId)
        } else {
          toast.error("Access denied. Restaurant owner privileges required.")
          window.location.href = "/"
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProducts = async (userId: string) => {
    try {
      const productsRef = collection(db, "products")
      const q = query(productsRef, where("producerId", "==", userId), limit(100))
      const querySnapshot = await getDocs(q)

      const loadedProducts: Product[] = []
      querySnapshot.forEach((doc) => {
        loadedProducts.push({ id: doc.id, ...doc.data() } as Product)
      })

      loadedProducts.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        const aTime = a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()
        const bTime = b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()
        return bTime - aTime
      })

      setProducts(loadedProducts)
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  const loadOrders = (userId: string) => {
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, where("producerIds", "array-contains", userId))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList: Order[] = []
      snapshot.forEach((doc) => {
        ordersList.push({ id: doc.id, ...doc.data() } as Order)
      })

      ordersList.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        const aTime = a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()
        const bTime = b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()
        return bTime - aTime
      })

      setOrders(ordersList)
    })

    return unsubscribe
  }

  const loadRestaurantProfile = async (userId: string) => {
    try {
      const profileDoc = await getDoc(doc(db, "restaurantProfiles", userId))
      if (profileDoc.exists()) {
        setRestaurantProfile({ id: profileDoc.id, ...profileDoc.data() } as RestaurantProfile)
      } else {
        // Create default profile
        const defaultProfile: RestaurantProfile = {
          name: user?.displayName || "My Restaurant",
          description: "",
          address: "",
          phone: "",
          email: user?.email || "",
          cuisine: "",
          openingHours: {
            monday: { open: "09:00", close: "22:00", closed: false },
            tuesday: { open: "09:00", close: "22:00", closed: false },
            wednesday: { open: "09:00", close: "22:00", closed: false },
            thursday: { open: "09:00", close: "22:00", closed: false },
            friday: { open: "09:00", close: "22:00", closed: false },
            saturday: { open: "09:00", close: "22:00", closed: false },
            sunday: { open: "09:00", close: "22:00", closed: false },
          },
          images: [],
          rating: 0,
          totalReviews: 0,
          isActive: true,
        }
        setRestaurantProfile(defaultProfile)
      }
    } catch (error) {
      console.error("Error loading restaurant profile:", error)
    }
  }

  const calculateAnalytics = async (userId: string) => {
    try {
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Calculate top products
      const productSales: { [key: string]: { name: string; sales: number; revenue: number } } = {}
      orders.forEach((order) => {
        order.items?.forEach((item: any) => {
          if (!productSales[item.id]) {
            productSales[item.id] = { name: item.name, sales: 0, revenue: 0 }
          }
          productSales[item.id].sales += item.quantity
          productSales[item.id].revenue += item.price * item.quantity
        })
      })

      const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)

      // Calculate monthly revenue (last 12 months)
      const monthlyRevenue = new Array(12).fill(0)
      const currentDate = new Date()
      orders.forEach((order) => {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
        const monthDiff =
          (currentDate.getFullYear() - orderDate.getFullYear()) * 12 + (currentDate.getMonth() - orderDate.getMonth())
        if (monthDiff >= 0 && monthDiff < 12) {
          monthlyRevenue[11 - monthDiff] += order.total || 0
        }
      })

      setAnalytics({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        topProducts,
        recentOrders: orders.slice(0, 5),
        monthlyRevenue,
      })
    } catch (error) {
      console.error("Error calculating analytics:", error)
    }
  }

  const saveRestaurantProfile = async (formData: FormData) => {
    try {
      const profileData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        website: formData.get("website") as string,
        cuisine: formData.get("cuisine") as string,
        isActive: formData.get("isActive") === "on",
        updatedAt: new Date(),
      }

      if (restaurantProfile?.id) {
        await updateDoc(doc(db, "restaurantProfiles", user.uid), profileData)
        toast.success("Restaurant profile updated successfully!")
      } else {
        await addDoc(collection(db, "restaurantProfiles"), {
          ...profileData,
          userId: user.uid,
          createdAt: new Date(),
        })
        toast.success("Restaurant profile created successfully!")
      }

      setIsProfileModalOpen(false)
      await loadRestaurantProfile(user.uid)
    } catch (error) {
      console.error("Error saving restaurant profile:", error)
      toast.error("Failed to save restaurant profile")
    }
  }

  const saveProduct = async (formData: FormData) => {
    try {
      const productData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: Number.parseFloat(formData.get("price") as string),
        category: formData.get("category") as string,
        isVegetarian: formData.get("isVegetarian") === "on",
        producerId: user.uid,
        producerName: restaurantProfile?.name || user.displayName || user.email,
        status: "active",
      }

      const imageFile = formData.get("image") as File
      if (imageFile && imageFile.size > 0) {
        const fileName = `${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
        const imageRef = ref(storage, `products/${user.uid}/${fileName}`)

        const uploadResult = await uploadBytes(imageRef, imageFile)
        const imageUrl = await getDownloadURL(uploadResult.ref)
        productData.imageUrl = imageUrl
      } else if (editingProduct && !imageFile) {
        productData.imageUrl = editingProduct.imageUrl
      }

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), {
          ...productData,
          updatedAt: new Date(),
        })
        toast.success("Product updated successfully!")
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date(),
        })
        toast.success("Product added successfully!")
      }

      setIsProductModalOpen(false)
      setEditingProduct(null)
      await loadProducts(user.uid)
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("Failed to save product")
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: status,
        updatedAt: new Date(),
      })
      toast.success("Order status updated successfully!")
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    }
  }

  const confirmOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "confirmed")
  }

  const rejectOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "rejected")
  }

  const deleteProduct = async (productId: string, imageUrl?: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await deleteDoc(doc(db, "products", productId))
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl)
        await deleteObject(imageRef).catch(() => {})
      }
      toast.success("Product deleted successfully!")
      await loadProducts(user.uid)
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-jasmine/20 text-jasmine border-jasmine/20"
      case "confirmed":
        return "bg-blue-500/20 text-blue-400 border-blue-400/20"
      case "preparing":
        return "bg-orange-500/20 text-orange-400 border-orange-400/20"
      case "ready":
        return "bg-purple-500/20 text-purple-400 border-purple-400/20"
      case "delivered":
        return "bg-green-500/20 text-green-400 border-green-400/20"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-400/20"
      default:
        return "bg-cadet-gray/20 text-cadet-gray border-cadet-gray/20"
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const exportData = () => {
    const data = {
      restaurant: restaurantProfile,
      products: products,
      orders: orders,
      analytics: analytics,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `restaurant-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Data exported successfully!")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gunmetal via-paynes-gray to-cadet-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jasmine mx-auto mb-4"></div>
          <p className="text-jasmine">Loading restaurant dashboard...</p>
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
              "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gunmetal/80 via-paynes-gray/80 to-cadet-gray/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-jasmine mb-2 animate-float">
              Producer <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-xl text-cadet-gray">Welcome back, {restaurantProfile?.name || "Producer"}</p>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={exportData}
              variant="outline"
              className="border-cadet-gray/40 text-cadet-gray hover:text-jasmine hover:bg-cadet-gray/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90">
                  <Settings className="mr-2 h-4 w-4" />
                  Producer Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gunmetal border-cadet-gray/20 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-jasmine">Producer Profile Settings</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    saveRestaurantProfile(new FormData(e.currentTarget))
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-cadet-gray">
                        Restaurant Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={restaurantProfile?.name}
                        required
                        className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cuisine" className="text-cadet-gray">
                        Cuisine Type *
                      </Label>
                      <Select name="cuisine" defaultValue={restaurantProfile?.cuisine} required>
                        <SelectTrigger className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine">
                          <SelectValue placeholder="Select cuisine type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="italian">Italian</SelectItem>
                          <SelectItem value="chinese">Chinese</SelectItem>
                          <SelectItem value="indian">Indian</SelectItem>
                          <SelectItem value="mexican">Mexican</SelectItem>
                          <SelectItem value="american">American</SelectItem>
                          <SelectItem value="thai">Thai</SelectItem>
                          <SelectItem value="japanese">Japanese</SelectItem>
                          <SelectItem value="mediterranean">Mediterranean</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-cadet-gray">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={restaurantProfile?.description}
                      rows={3}
                      className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                      placeholder="Describe your restaurant..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-cadet-gray">
                      Address *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={restaurantProfile?.address}
                      required
                      className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-cadet-gray">
                        Phone *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={restaurantProfile?.phone}
                        required
                        className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-cadet-gray">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={restaurantProfile?.email}
                        required
                        className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website" className="text-cadet-gray">
                      Website
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      defaultValue={restaurantProfile?.website}
                      className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                      placeholder="https://your-restaurant.com"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      name="isActive"
                      defaultChecked={restaurantProfile?.isActive}
                      className="border-cadet-gray/40 data-[state=checked]:bg-jasmine data-[state=checked]:border-jasmine"
                    />
                    <Label htmlFor="isActive" className="text-cadet-gray">
                      Restaurant is currently active and accepting orders
                    </Label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90 font-semibold"
                  >
                    Save Restaurant Profile
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gunmetal/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-jasmine data-[state=active]:text-gunmetal">
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-jasmine data-[state=active]:text-gunmetal">
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-jasmine data-[state=active]:text-gunmetal">
              Products
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-jasmine data-[state=active]:text-gunmetal">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-jasmine data-[state=active]:text-gunmetal">
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="glass border-cadet-gray/20">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-8 w-8 text-jasmine mx-auto mb-2" />
                    <p className="text-sm text-cadet-gray">Total Revenue</p>
                    <p className="text-3xl font-bold text-jasmine">{formatCurrency(analytics?.totalRevenue || 0)}</p>
                  </CardContent>
                </Card>
                <Card className="glass border-cadet-gray/20">
                  <CardContent className="p-6 text-center">
                    <ShoppingBag className="h-8 w-8 text-jasmine mx-auto mb-2" />
                    <p className="text-sm text-cadet-gray">Total Orders</p>
                    <p className="text-3xl font-bold text-jasmine">{analytics?.totalOrders || 0}</p>
                  </CardContent>
                </Card>
                <Card className="glass border-cadet-gray/20">
                  <CardContent className="p-6 text-center">
                    <Package className="h-8 w-8 text-jasmine mx-auto mb-2" />
                    <p className="text-sm text-cadet-gray">Active Products</p>
                    <p className="text-3xl font-bold text-jasmine">
                      {products.filter((p) => p.status === "active").length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="glass border-cadet-gray/20">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 text-jasmine mx-auto mb-2" />
                    <p className="text-sm text-cadet-gray">Avg Order Value</p>
                    <p className="text-3xl font-bold text-jasmine">
                      {formatCurrency(analytics?.averageOrderValue || 0)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders and Top Products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass border-cadet-gray/20">
                  <CardHeader>
                    <CardTitle className="text-jasmine">Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.recentOrders.length === 0 ? (
                      <p className="text-cadet-gray text-center py-4">No recent orders</p>
                    ) : (
                      <div className="space-y-3">
                        {analytics?.recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex justify-between items-center p-3 bg-gunmetal/20 rounded-lg"
                          >
                            <div>
                              <p className="text-jasmine font-medium">#{order.id.slice(-8)}</p>
                              <p className="text-cadet-gray text-sm">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-jasmine font-bold">{formatCurrency(order.total)}</p>
                              <Badge className={getOrderStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass border-cadet-gray/20">
                  <CardHeader>
                    <CardTitle className="text-jasmine">Top Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.topProducts.length === 0 ? (
                      <p className="text-cadet-gray text-center py-4">No product data available</p>
                    ) : (
                      <div className="space-y-3">
                        {analytics?.topProducts.map((product, index) => (
                          <div
                            key={product.id}
                            className="flex justify-between items-center p-3 bg-gunmetal/20 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-jasmine/20 rounded-full flex items-center justify-center">
                                <span className="text-jasmine font-bold">{index + 1}</span>
                              </div>
                              <div>
                                <p className="text-jasmine font-medium">{product.name}</p>
                                <p className="text-cadet-gray text-sm">{product.sales} sold</p>
                              </div>
                            </div>
                            <p className="text-jasmine font-bold">{formatCurrency(product.revenue)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="glass border-cadet-gray/20">
              <CardHeader>
                <CardTitle className="text-jasmine">Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-16 w-16 text-cadet-gray mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-jasmine mb-2">No orders yet</h3>
                    <p className="text-cadet-gray">Orders will appear here when customers place them!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="bg-gunmetal/20 border-cadet-gray/20">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-jasmine">Order #{order.id.slice(-8)}</h3>
                              <p className="text-cadet-gray text-sm">{formatDate(order.createdAt)}</p>
                              <p className="text-cadet-gray text-sm">
                                Customer: {order.deliveryInfo?.firstName} {order.deliveryInfo?.lastName}
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <Badge className={getOrderStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                              <PaymentMethodBadge method={order.paymentInfo?.method || "card"} />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="text-sm font-medium text-cadet-gray mb-2">Items</h4>
                              <div className="space-y-1">
                                {order.items?.map((item, index) => (
                                  <div key={index} className="text-sm text-jasmine">
                                    {item.name} x{item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-cadet-gray mb-2">Delivery Address</h4>
                              <div className="text-sm text-jasmine">
                                {order.deliveryInfo?.street}
                                <br />
                                {order.deliveryInfo?.city}, {order.deliveryInfo?.state} {order.deliveryInfo?.zipCode}
                                <br />
                                Phone: {order.deliveryInfo?.phone}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-xl font-bold text-jasmine">Total: ${order.total?.toFixed(2)}</div>
                            <div className="flex space-x-2">
                              {order.status === "pending" && (
                                <>
                                  <Button
                                    onClick={() => confirmOrder(order.id)}
                                    size="sm"
                                    className="bg-green-500/20 text-green-400 border border-green-400/20 hover:bg-green-500/30"
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Confirm
                                  </Button>
                                  <Button
                                    onClick={() => rejectOrder(order.id)}
                                    size="sm"
                                    className="bg-red-500/20 text-red-400 border border-red-400/20 hover:bg-red-500/30"
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {order.status === "confirmed" && (
                                <Button
                                  onClick={() => updateOrderStatus(order.id, "preparing")}
                                  size="sm"
                                  className="bg-orange-500/20 text-orange-400 border border-orange-400/20 hover:bg-orange-500/30"
                                >
                                  Start Preparing
                                </Button>
                              )}
                              {order.status === "preparing" && (
                                <Button
                                  onClick={() => updateOrderStatus(order.id, "ready")}
                                  size="sm"
                                  className="bg-purple-500/20 text-purple-400 border border-purple-400/20 hover:bg-purple-500/30"
                                >
                                  Mark Ready
                                </Button>
                              )}
                              {order.status === "ready" && (
                                <Button
                                  onClick={() => updateOrderStatus(order.id, "delivered")}
                                  size="sm"
                                  className="bg-green-500/20 text-green-400 border border-green-400/20 hover:bg-green-500/30"
                                >
                                  Mark Delivered
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="glass border-cadet-gray/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-jasmine">Product Management</CardTitle>
                  <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setEditingProduct(null)}
                        className="bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gunmetal border-cadet-gray/20 max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-jasmine">
                          {editingProduct ? "Edit Product" : "Add New Product"}
                        </DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          saveProduct(new FormData(e.currentTarget))
                        }}
                        className="space-y-6"
                      >
                        <div>
                          <Label htmlFor="name" className="text-cadet-gray">
                            Product Name *
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={editingProduct?.name}
                            required
                            className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                            placeholder="Enter product name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description" className="text-cadet-gray">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            name="description"
                            defaultValue={editingProduct?.description}
                            rows={3}
                            className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                            placeholder="Describe your product..."
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="price" className="text-cadet-gray">
                              Price ($) *
                            </Label>
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              step="0.01"
                              min="0"
                              defaultValue={editingProduct?.price}
                              required
                              className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="category" className="text-cadet-gray">
                              Category *
                            </Label>
                            <Select name="category" defaultValue={editingProduct?.category} required>
                              <SelectTrigger className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="appetizers">Appetizers</SelectItem>
                                <SelectItem value="mains">Main Course</SelectItem>
                                <SelectItem value="desserts">Desserts</SelectItem>
                                <SelectItem value="beverages">Beverages</SelectItem>
                                <SelectItem value="salads">Salads</SelectItem>
                                <SelectItem value="catering_packages">Catering Packages</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="image" className="text-cadet-gray">
                            Product Image {editingProduct ? "(Leave empty to keep current image)" : "*"}
                          </Label>
                          {editingProduct?.imageUrl && (
                            <div className="mt-2 mb-4">
                              <img
                                src={editingProduct.imageUrl || "/placeholder.svg"}
                                alt="Current product image"
                                className="w-32 h-32 object-cover rounded-lg border-2 border-cadet-gray/20"
                              />
                              <p className="text-cadet-gray text-sm mt-1">Current image</p>
                            </div>
                          )}
                          <Input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            required={!editingProduct}
                            className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine file:bg-jasmine file:text-gunmetal file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3"
                          />
                          <p className="text-cadet-gray text-xs mt-1">
                            Supported formats: JPG, PNG, GIF. Max size: 5MB
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isVegetarian"
                            name="isVegetarian"
                            defaultChecked={editingProduct?.isVegetarian}
                            className="border-cadet-gray/40 data-[state=checked]:bg-jasmine data-[state=checked]:border-jasmine"
                          />
                          <Label htmlFor="isVegetarian" className="text-cadet-gray">
                            Vegetarian Product
                          </Label>
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90 font-semibold"
                        >
                          {editingProduct ? "Update Product" : "Add Product"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 text-cadet-gray mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-jasmine mb-2">No products added yet</h3>
                    <p className="text-cadet-gray">Click "Add Product" to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <Card
                        key={product.id}
                        className="bg-gunmetal/20 border-cadet-gray/20 overflow-hidden hover-scale"
                      >
                        <div className="relative h-40">
                          <img
                            src={product.imageUrl || "/placeholder.svg?height=160&width=300"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <Badge
                            className={`absolute top-2 right-2 ${
                              product.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {product.status}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="text-lg font-semibold text-jasmine mb-2">{product.name}</h3>
                          <p className="text-cadet-gray text-sm mb-2 line-clamp-2">
                            {product.description || "No description"}
                          </p>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xl font-bold text-jasmine">${product.price}</span>
                            <Badge variant="outline" className="border-cadet-gray/40 text-cadet-gray">
                              {product.category}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingProduct(product)
                                setIsProductModalOpen(true)
                              }}
                              className="flex-1 border-cadet-gray/40 text-cadet-gray hover:text-jasmine hover:bg-cadet-gray/10"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteProduct(product.id, product.imageUrl)}
                              className="flex-1 border-red-400/40 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card className="glass border-cadet-gray/20">
                <CardHeader>
                  <CardTitle className="text-jasmine flex items-center">
                    <BarChart3 className="mr-3 h-5 w-5" />
                    Business Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                      <p className="text-cadet-gray text-sm">This Month Revenue</p>
                      <p className="text-3xl font-bold text-jasmine">
                        {formatCurrency(analytics?.monthlyRevenue[11] || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-cadet-gray text-sm">Orders This Month</p>
                      <p className="text-3xl font-bold text-jasmine">
                        {
                          orders.filter((order) => {
                            const orderDate = order.createdAt?.toDate
                              ? order.createdAt.toDate()
                              : new Date(order.createdAt)
                            const currentDate = new Date()
                            return (
                              orderDate.getMonth() === currentDate.getMonth() &&
                              orderDate.getFullYear() === currentDate.getFullYear()
                            )
                          }).length
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-cadet-gray text-sm">Customer Rating</p>
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-6 w-6 text-jasmine fill-current" />
                        <p className="text-3xl font-bold text-jasmine">{restaurantProfile?.rating || 0}</p>
                        <p className="text-cadet-gray">({restaurantProfile?.totalReviews || 0} reviews)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gunmetal/20 rounded-lg p-6">
                    <h3 className="text-jasmine font-semibold mb-4">Monthly Revenue Trend</h3>
                    <div className="flex items-end space-x-2 h-40">
                      {analytics?.monthlyRevenue.map((revenue, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="bg-jasmine/60 w-full rounded-t"
                            style={{
                              height: `${Math.max((revenue / Math.max(...(analytics?.monthlyRevenue || [1]))) * 120, 4)}px`,
                            }}
                          />
                          <p className="text-cadet-gray text-xs mt-2">
                            {new Date(Date.now() - (11 - index) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
                              "en-US",
                              { month: "short" },
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="glass border-cadet-gray/20">
              <CardHeader>
                <CardTitle className="text-jasmine">Producer Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-jasmine mb-4">Basic Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-jasmine/20 rounded-full flex items-center justify-center">
                            <span className="text-jasmine font-bold">{restaurantProfile?.name?.charAt(0) || "R"}</span>
                          </div>
                          <div>
                            <p className="text-jasmine font-medium">{restaurantProfile?.name || "Restaurant Name"}</p>
                            <p className="text-cadet-gray text-sm">{restaurantProfile?.cuisine || "Cuisine Type"}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-cadet-gray mt-0.5" />
                          <p className="text-cadet-gray">{restaurantProfile?.address || "Address not set"}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-cadet-gray" />
                          <p className="text-cadet-gray">{restaurantProfile?.phone || "Phone not set"}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-cadet-gray" />
                          <p className="text-cadet-gray">{restaurantProfile?.email || "Email not set"}</p>
                        </div>
                        {restaurantProfile?.website && (
                          <div className="flex items-center space-x-3">
                            <Globe className="h-5 w-5 text-cadet-gray" />
                            <a
                              href={restaurantProfile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-jasmine hover:text-orange-pantone transition-colors"
                            >
                              {restaurantProfile.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-jasmine mb-4">Description</h3>
                      <p className="text-cadet-gray">{restaurantProfile?.description || "No description available"}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-jasmine mb-4">Status</h3>
                      <Badge
                        className={
                          restaurantProfile?.isActive
                            ? "bg-green-500/20 text-green-400 border-green-400/20"
                            : "bg-red-500/20 text-red-400 border-red-400/20"
                        }
                      >
                        {restaurantProfile?.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-jasmine mb-4">Restaurant Gallery</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {restaurantProfile?.images?.length > 0 ? (
                          restaurantProfile.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image || "/placeholder.svg"}
                                alt={`Restaurant ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <Button size="sm" variant="ghost" className="text-white">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-8 border-2 border-dashed border-cadet-gray/40 rounded-lg">
                            <Camera className="h-12 w-12 text-cadet-gray mx-auto mb-2" />
                            <p className="text-cadet-gray">No images uploaded yet</p>
                            <Button size="sm" className="mt-2 bg-jasmine/20 text-jasmine hover:bg-jasmine/30">
                              Upload Images
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-jasmine mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Button
                          onClick={() => setIsProfileModalOpen(true)}
                          className="w-full bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                        <Button
                          onClick={() => setActiveTab("products")}
                          variant="outline"
                          className="w-full border-cadet-gray/40 text-cadet-gray hover:text-jasmine hover:bg-cadet-gray/10"
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Manage Products
                        </Button>
                        <Button
                          onClick={() => setActiveTab("orders")}
                          variant="outline"
                          className="w-full border-cadet-gray/40 text-cadet-gray hover:text-jasmine hover:bg-cadet-gray/10"
                        >
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          View Orders
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
