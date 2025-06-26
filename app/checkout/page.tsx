"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { collection, addDoc, doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, CreditCard, MapPin, ArrowLeft, ArrowRight, Shield, Banknote } from "lucide-react"
import { toast } from "sonner"

interface CartItem {
  id: string
  name: string
  price: number
  imageUrl?: string
  producerName?: string
  producerId?: string
  quantity: number
}

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        loadCheckoutData(user.uid)
      } else {
        router.push("/auth")
      }
    })

    return unsubscribe
  }, [router])

  const loadCheckoutData = async (userId: string) => {
    const checkoutCart = JSON.parse(localStorage.getItem("checkoutCart") || "[]")
    if (checkoutCart.length === 0) {
      router.push("/cart")
      return
    }

    setCart(checkoutCart)

    // Pre-fill user data
    try {
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        // You can pre-fill form fields here if needed
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const handleDeliverySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    setDeliveryInfo({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phone: formData.get("phone"),
      street: formData.get("street"),
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      instructions: formData.get("instructions"),
    })

    setCurrentStep(2)
  }

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!deliveryInfo) {
      toast.error("Delivery information missing. Please go back and fill it in.")
      setCurrentStep(1)
      return
    }

    setIsProcessing(true)
    try {
      // Payment form data
      const paymentFormData = new FormData(e.currentTarget)

      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const deliveryFee = 5.99
      const tax = subtotal * 0.08
      const total = subtotal + deliveryFee + tax
      const producerIds = [...new Set(cart.map((item) => item.producerId).filter(Boolean))]

      const orderData = {
        userId: user.uid,
        items: cart,
        deliveryInfo,
        paymentInfo: {
          method: paymentMethod,
          ...(paymentMethod === "card"
            ? {
                cardLast4: (paymentFormData.get("cardNumber") as string)?.slice(-4) || "",
                cardholderName: paymentFormData.get("cardholderName"),
              }
            : { codAmount: total }),
        },
        subtotal,
        deliveryFee,
        tax,
        total,
        status: "pending",
        producerIds,
        createdAt: new Date(),
        estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000),
      }

      const docRef = await addDoc(collection(db, "orders"), orderData)
      setOrderNumber(docRef.id.slice(-8))

      // Create notifications for each producer
      for (const producerId of producerIds) {
        if (producerId) {
          await addDoc(collection(db, "notifications"), {
            userId: producerId,
            type: "new_order",
            title: "New Order Received!",
            message: `You have a new order #${docRef.id.slice(-8)} worth $${total.toFixed(2)}`,
            orderId: docRef.id,
            isRead: false,
            createdAt: new Date(),
          })
        }
      }

      // Clear cart
      localStorage.removeItem("cart")
      localStorage.removeItem("checkoutCart")
      window.dispatchEvent(new Event("storage"))

      setCurrentStep(3)
      toast.success("Order placed successfully!")
    } catch (error) {
      console.error("Error processing order:", error)
      toast.error("Failed to process order. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = 5.99
  const tax = subtotal * 0.08
  const total = subtotal + deliveryFee + tax

  const getStepClass = (step: number) => {
    if (step < currentStep) return "bg-green-500 text-white"
    if (step === currentStep) return "bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal"
    return "bg-cadet-gray/20 text-cadet-gray"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gunmetal via-paynes-gray to-cadet-gray">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gunmetal/80 via-paynes-gray/80 to-cadet-gray/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-jasmine mb-4 animate-float">
            Secure <span className="text-gradient">Checkout</span>
          </h1>
          <p className="text-xl text-cadet-gray">Complete your order safely and securely</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${getStepClass(1)}`}
              >
                1
              </div>
              <span className="ml-2 text-jasmine font-medium">Delivery</span>
            </div>
            <div className="w-12 h-0.5 bg-cadet-gray/20"></div>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${getStepClass(2)}`}
              >
                2
              </div>
              <span className="ml-2 text-cadet-gray">Payment</span>
            </div>
            <div className="w-12 h-0.5 bg-cadet-gray/20"></div>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${getStepClass(3)}`}
              >
                3
              </div>
              <span className="ml-2 text-cadet-gray">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Delivery Information */}
            {currentStep === 1 && (
              <Card className="glass border-cadet-gray/20">
                <CardHeader>
                  <CardTitle className="text-jasmine flex items-center">
                    <MapPin className="mr-3 h-5 w-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form id="deliveryForm" onSubmit={handleDeliverySubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="text-cadet-gray">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          required
                          className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-cadet-gray">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          required
                          className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-cadet-gray">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                      />
                    </div>
                    <div>
                      <Label htmlFor="street" className="text-cadet-gray">
                        Street Address *
                      </Label>
                      <Input
                        id="street"
                        name="street"
                        required
                        className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="city" className="text-cadet-gray">
                          City *
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          required
                          className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-cadet-gray">
                          State *
                        </Label>
                        <Select name="state" required>
                          <SelectTrigger className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="zipCode" className="text-cadet-gray">
                          ZIP Code *
                        </Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          required
                          className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="instructions" className="text-cadet-gray">
                        Delivery Instructions (Optional)
                      </Label>
                      <Textarea
                        id="instructions"
                        name="instructions"
                        rows={3}
                        className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                        placeholder="e.g., Leave at front door, Ring doorbell"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90 font-semibold"
                    >
                      Continue to Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Information */}
            {currentStep === 2 && (
              <Card className="glass border-cadet-gray/20">
                <CardHeader>
                  <CardTitle className="text-jasmine flex items-center">
                    <CreditCard className="mr-3 h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div>
                      <Label className="text-cadet-gray mb-4 block">Payment Method *</Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 border border-cadet-gray/40 rounded-lg">
                          <input
                            type="radio"
                            id="card"
                            name="paymentMethod"
                            value="card"
                            checked={paymentMethod === "card"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-jasmine focus:ring-jasmine"
                          />
                          <label htmlFor="card" className="flex items-center text-cadet-gray cursor-pointer">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Credit/Debit Card
                          </label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border border-cadet-gray/40 rounded-lg">
                          <input
                            type="radio"
                            id="cod"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentMethod === "cod"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-jasmine focus:ring-jasmine"
                          />
                          <label htmlFor="cod" className="flex items-center text-cadet-gray cursor-pointer">
                            <Banknote className="mr-2 h-4 w-4" />
                            Cash on Delivery
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Card Details - Only show if card payment is selected */}
                    {paymentMethod === "card" && (
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="cardNumber" className="text-cadet-gray">
                            Card Number *
                          </Label>
                          <Input
                            id="cardNumber"
                            name="cardNumber"
                            required={paymentMethod === "card"}
                            placeholder="1234 5678 9012 3456"
                            className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="expiryDate" className="text-cadet-gray">
                              Expiry Date *
                            </Label>
                            <Input
                              id="expiryDate"
                              name="expiryDate"
                              required={paymentMethod === "card"}
                              placeholder="MM/YY"
                              className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv" className="text-cadet-gray">
                              CVV *
                            </Label>
                            <Input
                              id="cvv"
                              name="cvv"
                              required={paymentMethod === "card"}
                              placeholder="123"
                              className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="cardholderName" className="text-cadet-gray">
                            Cardholder Name *
                          </Label>
                          <Input
                            id="cardholderName"
                            name="cardholderName"
                            required={paymentMethod === "card"}
                            className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                          />
                        </div>
                      </div>
                    )}

                    {/* COD Notice - Only show if COD is selected */}
                    {paymentMethod === "cod" && (
                      <div className="bg-jasmine/10 border border-jasmine/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-jasmine">
                          <Banknote className="h-5 w-5" />
                          <span className="font-medium">Cash on Delivery Selected</span>
                        </div>
                        <p className="text-cadet-gray text-sm mt-2">
                          Please keep exact change ready. Total amount:{" "}
                          <span className="font-semibold text-jasmine">${total.toFixed(2)}</span>
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 border-cadet-gray/40 text-cadet-gray hover:text-jasmine hover:bg-cadet-gray/10"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90 font-semibold"
                      >
                        {isProcessing ? "Processing..." : "Place Order"}
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Order Confirmation */}
            {currentStep === 3 && (
              <Card className="glass border-cadet-gray/20">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-jasmine mb-4">Order Placed!</h2>
                  <p className="text-xl text-cadet-gray mb-6">
                    Thank you for your order. The restaurant will confirm it shortly.
                  </p>

                  <div className="bg-gunmetal/20 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-jasmine mb-4">Order Details</h3>
                    <div className="text-left space-y-2">
                      <div className="flex justify-between">
                        <span className="text-cadet-gray">Order Number:</span>
                        <span className="text-jasmine font-medium">#{orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cadet-gray">Status:</span>
                        <span className="text-jasmine font-medium">Pending Confirmation</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cadet-gray">Total Amount:</span>
                        <span className="text-jasmine font-bold text-lg">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => router.push("/orders")}
                      className="bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90 font-semibold"
                    >
                      Track Order
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/menu")}
                      className="border-cadet-gray/40 text-cadet-gray hover:text-jasmine hover:bg-cadet-gray/10"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="glass border-cadet-gray/20 sticky top-24">
              <CardHeader>
                <CardTitle className="text-jasmine">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <img
                        src={item.imageUrl || "/placeholder.svg?height=50&width=50"}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-jasmine font-medium text-sm">{item.name}</h4>
                        <p className="text-cadet-gray text-xs">{item.producerName || "Restaurant"}</p>
                        <p className="text-cadet-gray text-xs">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-jasmine font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 pt-4 border-t border-cadet-gray/20">
                  <div className="flex justify-between text-cadet-gray">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cadet-gray">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cadet-gray">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <hr className="border-cadet-gray/20" />
                  <div className="flex justify-between text-xl font-semibold text-jasmine">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-400">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Secure Payment</span>
                  </div>
                  <p className="text-green-300 text-sm mt-1">Your payment information is encrypted and secure</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
