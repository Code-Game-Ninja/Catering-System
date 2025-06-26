"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Send, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { toast } from "sonner"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success("Thank you for your message! We'll get back to you soon.")
    e.currentTarget.reset()
    setIsSubmitting(false)
  }

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6 text-jasmine" />,
      title: "Our Office",
      content: "123 Catering Lane, Foodie City, FC 98765",
    },
    {
      icon: <Phone className="h-6 w-6 text-jasmine" />,
      title: "Phone",
      content: "+1 (555) 123-4567",
    },
    {
      icon: <Mail className="h-6 w-6 text-jasmine" />,
      title: "Email",
      content: "info@caterease.com",
    },
    {
      icon: <Clock className="h-6 w-6 text-jasmine" />,
      title: "Business Hours",
      content: (
        <div>
          <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
          <p>Saturday: 10:00 AM - 4:00 PM</p>
          <p>Sunday: Closed</p>
        </div>
      ),
    },
  ]

  const socialLinks = [
    { icon: <Facebook className="h-6 w-6" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="h-6 w-6" />, href: "#", label: "Twitter" },
    { icon: <Instagram className="h-6 w-6" />, href: "#", label: "Instagram" },
    { icon: <Linkedin className="h-6 w-6" />, href: "#", label: "LinkedIn" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gunmetal via-paynes-gray to-cadet-gray">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1526948128573-427044b0a8d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gunmetal/80 via-paynes-gray/80 to-cadet-gray/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-jasmine mb-4 animate-float">
            Get In <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-xl text-cadet-gray max-w-2xl mx-auto">
            We'd love to hear from you! Reach out with any questions or feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="glass border-cadet-gray/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-jasmine mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-cadet-gray">
                    Your Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine placeholder:text-paynes-gray focus:border-jasmine"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-cadet-gray">
                    Your Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine placeholder:text-paynes-gray focus:border-jasmine"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-cadet-gray">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine placeholder:text-paynes-gray focus:border-jasmine"
                    placeholder="Enter subject"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-cadet-gray">
                    Your Message *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="bg-gunmetal/20 border-cadet-gray/40 text-jasmine placeholder:text-paynes-gray focus:border-jasmine"
                    placeholder="Type your message here..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90 font-semibold"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="glass border-cadet-gray/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-jasmine mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-jasmine/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-jasmine font-medium mb-1">{info.title}</h3>
                      <div className="text-cadet-gray text-sm">
                        {typeof info.content === "string" ? <p>{info.content}</p> : info.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-jasmine mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="text-cadet-gray hover:text-jasmine transition-colors duration-200"
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
