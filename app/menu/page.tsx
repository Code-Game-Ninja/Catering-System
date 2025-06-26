"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Star, Leaf } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  category: string
  imageUrl?: string
  producerName?: string
  producerId?: string
  isVegetarian?: boolean
  status: string
  createdAt?: any
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  const categories = [
    { value: "all", label: "All" },
    { value: "appetizers", label: "Appetizers" },
    { value: "mains", label: "Main Course" },
    { value: "desserts", label: "Desserts" },
    { value: "beverages", label: "Beverages" },
    { value: "salads", label: "Salads" },
    { value: "catering_packages", label: "Catering Packages" },
  ]

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory])

  const loadProducts = async () => {
    try {
      console.log("Loading products from Firestore...")
      const productsRef = collection(db, "products")

      // Use simple query without orderBy to avoid index requirement
      const q = query(productsRef, where("status", "==", "active"), limit(100))

      const querySnapshot = await getDocs(q)
      console.log("Query snapshot size:", querySnapshot.size)

      const loadedProducts: Product[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        console.log("Product data:", data)
        loadedProducts.push({ id: doc.id, ...data } as Product)
      })

      // Sort by createdAt in memory (client-side sorting)
      loadedProducts.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        const aTime = a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()
        const bTime = b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()
        return bTime - aTime // Descending order (newest first)
      })

      console.log("Loaded products:", loadedProducts.length)
      setProducts(loadedProducts)
    } catch (error) {
      console.error("Error loading products:", error)

      // Try fallback query without any filters if the main query fails
      try {
        console.log("Trying fallback query...")
        const productsRef = collection(db, "products")
        const fallbackQuery = query(productsRef, limit(100))
        const fallbackSnapshot = await getDocs(fallbackQuery)

        const fallbackProducts: Product[] = []
        fallbackSnapshot.forEach((doc) => {
          const data = doc.data()
          // Only include active products
          if (data.status === "active") {
            fallbackProducts.push({ id: doc.id, ...data } as Product)
          }
        })

        console.log("Fallback products loaded:", fallbackProducts.length)
        setProducts(fallbackProducts)
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError)
        toast.error("Failed to load menu items. Please check your connection and try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.producerName && product.producerName.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const addToCart = (product: Product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      const existingItem = cart.find((item: any) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          producerName: product.producerName,
          producerId: product.producerId,
          quantity: 1,
        })
      }

      localStorage.setItem("cart", JSON.stringify(cart))

      // Dispatch custom event for cart updates
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: cart }))

      toast.success(`${product.name} added to cart!`)
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    }
  }

  // Helper function to get a safe image URL
  const getSafeImageUrl = (imageUrl?: string, fallback = "/placeholder.svg?height=400&width=500") => {
    if (!imageUrl) return fallback

    // Check if it's a valid HTTP/HTTPS URL
    try {
      const url = new URL(imageUrl)
      if (url.protocol === "http:" || url.protocol === "https:") {
        return imageUrl
      }
    } catch {
      // Invalid URL, use fallback
    }

    return fallback
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gunmetal via-paynes-gray to-cadet-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jasmine mx-auto mb-4"></div>
          <p className="text-jasmine">Loading delicious dishes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gunmetal via-paynes-gray to-cadet-gray">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gunmetal/80 via-paynes-gray/80 to-cadet-gray/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-jasmine mb-4">
            Our <span className="text-gradient">Menu</span>
          </h1>
          <p className="text-lg sm:text-xl text-cadet-gray max-w-2xl mx-auto">
            Discover delicious dishes from our partner restaurants and caterers
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="glass border-cadet-gray/20 mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cadet-gray h-4 w-4" />
                <Input
                  placeholder="Search dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gunmetal/20 border-cadet-gray/40 text-jasmine placeholder:text-paynes-gray"
                />
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.value)}
                    size="sm"
                    className={
                      selectedCategory === category.value
                        ? "bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal"
                        : "border-cadet-gray/40 text-cadet-gray hover:text-jasmine hover:bg-cadet-gray/10"
                    }
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-cadet-gray mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-jasmine mb-2">No dishes found</h3>
            <p className="text-cadet-gray">
              {products.length === 0 ? "No products available yet" : "Try adjusting your search or filters"}
            </p>
            {products.length === 0 && (
              <Button
                onClick={loadProducts}
                className="mt-4 bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal"
              >
                Retry Loading
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="glass border-cadet-gray/20 overflow-hidden hover:bg-cadet-gray/5 transition-all duration-300 group hover-scale"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getSafeImageUrl(product.imageUrl) || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (target.src !== "/placeholder.svg?height=400&width=500") {
                        target.src = "/placeholder.svg?height=400&width=500"
                      }
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-jasmine/20 text-jasmine border-jasmine/20 capitalize">
                      {product.category.replace("_", " ")}
                    </Badge>
                  </div>
                  {product.isVegetarian && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-400/20">
                        <Leaf className="h-3 w-3 mr-1" />
                        Veg
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-jasmine group-hover:text-orange-pantone transition-colors">
                      {product.name}
                    </h3>
                    <span className="text-xl sm:text-2xl font-bold text-orange-pantone">${product.price}</span>
                  </div>
                  <p className="text-cadet-gray mb-4 line-clamp-2 text-sm">
                    {product.description || "Delicious dish prepared with care"}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-cadet-gray">
                      <span>{product.producerName || "Restaurant"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-jasmine fill-current" />
                      <span className="text-jasmine">4.5</span>
                      <span className="text-cadet-gray text-sm">({Math.floor(Math.random() * 100) + 10})</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90 font-semibold"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
