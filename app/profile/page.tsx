"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { onAuthStateChanged, updatePassword, updateProfile } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { auth, db, storage } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Edit,
  Save,
  Shield,
  Bell,
  CreditCard,
  Settings,
  Store,
} from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  displayName?: string
  email?: string
  photoURL?: string
  phone?: string
  address?: string
  bio?: string
  dateOfBirth?: string
  role?: string
  businessName?: string
  businessType?: string
  createdAt?: any
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile>({})
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        await loadUserProfile(user.uid)
      } else {
        window.location.href = "/auth"
      }
    })

    return unsubscribe
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setProfile({
          displayName: user?.displayName || userData.displayName,
          email: user?.email || userData.email,
          photoURL: user?.photoURL || userData.photoURL,
          phone: userData.phone,
          address: userData.address,
          bio: userData.bio,
          dateOfBirth: userData.dateOfBirth,
          role: userData.role || "user",
          businessName: userData.businessName,
          businessType: userData.businessType,
          createdAt: userData.createdAt,
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const updatedProfile = {
        displayName: formData.get("displayName") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        bio: formData.get("bio") as string,
        dateOfBirth: formData.get("dateOfBirth") as string,
        businessName: formData.get("businessName") as string,
        businessType: formData.get("businessType") as string,
        updatedAt: new Date(),
      }

      // Update Firebase Auth profile
      if (user && updatedProfile.displayName !== user.displayName) {
        await updateProfile(user, { displayName: updatedProfile.displayName })
      }

      // Update Firestore document
      await updateDoc(doc(db, "users", user.uid), updatedProfile)

      setProfile({ ...profile, ...updatedProfile })
      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const imageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}_${file.name}`)
      const uploadResult = await uploadBytes(imageRef, file)
      const photoURL = await getDownloadURL(uploadResult.ref)

      // Update Firebase Auth profile
      await updateProfile(user, { photoURL })

      // Update Firestore document
      await updateDoc(doc(db, "users", user.uid), { photoURL, updatedAt: new Date() })

      setProfile({ ...profile, photoURL })
      toast.success("Profile photo updated successfully!")
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast.error("Failed to upload photo")
    } finally {
      setIsUploading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    try {
      await updatePassword(user, newPassword)
      setIsPasswordModalOpen(false)
      toast.success("Password updated successfully!")
    } catch (error: any) {
      console.error("Error updating password:", error)
      if (error.code === "auth/requires-recent-login") {
        toast.error("Please sign out and sign in again to change your password")
      } else {
        toast.error("Failed to update password")
      }
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500/20 text-red-400 border-red-400/20">Admin</Badge>
      case "producer":
        return <Badge className="bg-jasmine/20 text-jasmine border-jasmine/20">Producer</Badge>
      default:
        return <Badge className="bg-cadet-gray/20 text-cadet-gray border-cadet-gray/20">User</Badge>
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gunmetal via-paynes-gray to-cadet-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jasmine mx-auto mb-4"></div>
          <p className="text-jasmine">Loading profile...</p>
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
            backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gunmetal/80 via-paynes-gray/80 to-cadet-gray/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-jasmine mb-4 animate-float">
            My <span className="text-gradient">Profile</span>
          </h1>
          <p className="text-xl text-cadet-gray">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="glass border-cadet-gray/20">
              <CardContent className="p-8 text-center">
                <div className="relative inline-block mb-6">
                  <Avatar className="w-32 h-32 border-4 border-jasmine">
                    <AvatarImage src={profile.photoURL || ""} alt={profile.displayName || ""} />
                    <AvatarFallback className="bg-jasmine text-gunmetal text-3xl font-bold">
                      {profile.displayName?.charAt(0) || profile.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-2 right-2 bg-jasmine text-gunmetal rounded-full p-2 cursor-pointer hover:bg-jasmine/90 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>

                <h2 className="text-2xl font-bold text-jasmine mb-2">{profile.displayName || "No Name Set"}</h2>
                <p className="text-cadet-gray mb-4">{profile.email}</p>
                {getRoleBadge(profile.role || "user")}

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-cadet-gray">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Joined {formatDate(profile.createdAt)}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center justify-center space-x-2 text-cadet-gray">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-center justify-center space-x-2 text-cadet-gray">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{profile.address}</span>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <div className="mt-6 p-4 bg-gunmetal/20 rounded-lg">
                    <p className="text-cadet-gray text-sm italic">"{profile.bio}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gunmetal/20">
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:bg-jasmine data-[state=active]:text-gunmetal"
                >
                  Personal Info
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-jasmine data-[state=active]:text-gunmetal"
                >
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="data-[state=active]:bg-jasmine data-[state=active]:text-gunmetal"
                >
                  Preferences
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal">
                <Card className="glass border-cadet-gray/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-jasmine flex items-center">
                        <User className="mr-3 h-5 w-5" />
                        Personal Information
                      </CardTitle>
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant="outline"
                        className="border-cadet-gray/40 text-cadet-gray hover:text-jasmine hover:bg-cadet-gray/10"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        {isEditing ? "Cancel" : "Edit"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="displayName" className="text-cadet-gray">
                              Display Name
                            </Label>
                            <Input
                              id="displayName"
                              name="displayName"
                              defaultValue={profile.displayName}
                              className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-cadet-gray">
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              defaultValue={profile.phone}
                              className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="address" className="text-cadet-gray">
                            Address
                          </Label>
                          <Input
                            id="address"
                            name="address"
                            defaultValue={profile.address}
                            className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dateOfBirth" className="text-cadet-gray">
                            Date of Birth
                          </Label>
                          <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            defaultValue={profile.dateOfBirth}
                            className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio" className="text-cadet-gray">
                            Bio
                          </Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            defaultValue={profile.bio}
                            className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                        {(profile.role === "producer" || profile.role === "admin") && (
                          <>
                            <div>
                              <Label htmlFor="businessName" className="text-cadet-gray">
                                Business Name
                              </Label>
                              <Input
                                id="businessName"
                                name="businessName"
                                defaultValue={profile.businessName}
                                className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                              />
                            </div>
                            <div>
                              <Label htmlFor="businessType" className="text-cadet-gray">
                                Business Type
                              </Label>
                              <Input
                                id="businessType"
                                name="businessType"
                                defaultValue={profile.businessType}
                                className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                              />
                            </div>
                          </>
                        )}
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90 font-semibold"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-cadet-gray">Display Name</Label>
                            <p className="text-jasmine font-medium mt-1">{profile.displayName || "Not set"}</p>
                          </div>
                          <div>
                            <Label className="text-cadet-gray">Email</Label>
                            <p className="text-jasmine font-medium mt-1">{profile.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-cadet-gray">Phone</Label>
                            <p className="text-jasmine font-medium mt-1">{profile.phone || "Not set"}</p>
                          </div>
                          <div>
                            <Label className="text-cadet-gray">Date of Birth</Label>
                            <p className="text-jasmine font-medium mt-1">{profile.dateOfBirth || "Not set"}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-cadet-gray">Address</Label>
                          <p className="text-jasmine font-medium mt-1">{profile.address || "Not set"}</p>
                        </div>
                        <div>
                          <Label className="text-cadet-gray">Bio</Label>
                          <p className="text-jasmine font-medium mt-1">{profile.bio || "Not set"}</p>
                        </div>
                        {(profile.role === "producer" || profile.role === "admin") && (
                          <>
                            <div>
                              <Label className="text-cadet-gray">Business Name</Label>
                              <p className="text-jasmine font-medium mt-1">{profile.businessName || "Not set"}</p>
                            </div>
                            <div>
                              <Label className="text-cadet-gray">Business Type</Label>
                              <p className="text-jasmine font-medium mt-1">{profile.businessType || "Not set"}</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card className="glass border-cadet-gray/20">
                  <CardHeader>
                    <CardTitle className="text-jasmine flex items-center">
                      <Shield className="mr-3 h-5 w-5" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gunmetal/20 rounded-lg">
                      <div>
                        <h3 className="text-jasmine font-medium">Password</h3>
                        <p className="text-cadet-gray text-sm">Last updated: Never</p>
                      </div>
                      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="border-cadet-gray/40 text-cadet-gray hover:text-jasmine hover:bg-cadet-gray/10"
                          >
                            Change Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gunmetal border-cadet-gray/20">
                          <DialogHeader>
                            <DialogTitle className="text-jasmine">Change Password</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                              <Label htmlFor="newPassword" className="text-cadet-gray">
                                New Password
                              </Label>
                              <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                required
                                className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                              />
                            </div>
                            <div>
                              <Label htmlFor="confirmPassword" className="text-cadet-gray">
                                Confirm Password
                              </Label>
                              <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine"
                              />
                            </div>
                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90"
                            >
                              Update Password
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gunmetal/20 rounded-lg">
                      <div>
                        <h3 className="text-jasmine font-medium">Two-Factor Authentication</h3>
                        <p className="text-cadet-gray text-sm">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" disabled className="border-cadet-gray/40 text-cadet-gray opacity-50">
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <Card className="glass border-cadet-gray/20">
                  <CardHeader>
                    <CardTitle className="text-jasmine flex items-center">
                      <Settings className="mr-3 h-5 w-5" />
                      Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gunmetal/20 rounded-lg">
                      <div>
                        <h3 className="text-jasmine font-medium flex items-center">
                          <Bell className="mr-2 h-4 w-4" />
                          Email Notifications
                        </h3>
                        <p className="text-cadet-gray text-sm">Receive updates about your orders</p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-cadet-gray/40 text-cadet-gray hover:text-jasmine hover:bg-cadet-gray/10"
                      >
                        Manage
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gunmetal/20 rounded-lg">
                      <div>
                        <h3 className="text-jasmine font-medium flex items-center">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Payment Methods
                        </h3>
                        <p className="text-cadet-gray text-sm">Manage your saved payment methods</p>
                      </div>
                      <Button variant="outline" disabled className="border-cadet-gray/40 text-cadet-gray opacity-50">
                        Coming Soon
                      </Button>
                    </div>

                    {(profile.role === "producer" || profile.role === "admin") && (
                      <div className="flex items-center justify-between p-4 bg-jasmine/10 rounded-lg border border-jasmine/20">
                        <div>
                          <h3 className="text-jasmine font-medium flex items-center">
                            <Store className="mr-2 h-4 w-4" />
                            Producer Dashboard
                          </h3>
                          <p className="text-cadet-gray text-sm">Manage your products and business</p>
                        </div>
                        <Button
                          onClick={() => (window.location.href = "/producer-dashboard")}
                          className="bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90"
                        >
                          Go to Dashboard
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
