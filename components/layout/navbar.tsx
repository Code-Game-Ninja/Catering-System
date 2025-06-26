"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type User, onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { ShoppingCart, Menu, X, UserIcon, LogOut, Store, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationBell } from "@/components/notifications"

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string>("")
  const [cartCount, setCartCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        // Get user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || "user")
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
        }
      } else {
        setUserRole("")
      }
    })

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
      setCartCount(totalItems)
    }

    updateCartCount()
    window.addEventListener("storage", updateCartCount)

    return () => {
      unsubscribe()
      window.removeEventListener("storage", updateCartCount)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      // Add loading state or transition effect
      const signOutButton = document.querySelector("[data-signout-btn]")
      if (signOutButton) {
        signOutButton.textContent = "Signing out..."
      }

      await signOut(auth)

      // Add a smooth transition before redirect
      setTimeout(() => {
        router.push("/")
      }, 500)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <nav className="sticky top-0 z-50 glass-dark border-b border-cadet-gray/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-jasmine to-orange-pantone rounded-lg flex items-center justify-center">
              <span className="text-gunmetal font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold text-jasmine">CaterEase</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-cadet-gray hover:text-jasmine transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-cadet-gray hover:text-jasmine">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-pantone text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Notifications - Only show for authenticated users */}
            {user && <NotificationBell />}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback className="bg-jasmine text-gunmetal">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gunmetal/90 border-cadet-gray/20" align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center text-cadet-gray hover:text-jasmine">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center text-cadet-gray hover:text-jasmine">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Order History
                    </Link>
                  </DropdownMenuItem>
                  {userRole === "admin" && (
                    <>
                      <DropdownMenuSeparator className="bg-cadet-gray/20" />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center text-cadet-gray hover:text-jasmine">
                          <Crown className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {userRole === "producer" && (
                    <>
                      <DropdownMenuSeparator className="bg-cadet-gray/20" />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/producer-dashboard"
                          className="flex items-center text-cadet-gray hover:text-jasmine"
                        >
                          <Store className="mr-2 h-4 w-4" />
                          Producer Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-cadet-gray/20" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-orange-pantone hover:text-orange-pantone/80"
                    data-signout-btn
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/auth">
                  <Button variant="ghost" className="text-cadet-gray hover:text-jasmine">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-cadet-gray hover:text-jasmine"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-cadet-gray/20">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-cadet-gray hover:text-jasmine transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-cadet-gray/20">
                  <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-cadet-gray hover:text-jasmine">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
