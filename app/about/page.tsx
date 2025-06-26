import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Handshake, Lightbulb, Mail, Store } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const values = [
    {
      icon: <Heart className="h-12 w-12 text-jasmine" />,
      title: "Passion for Food",
      description: "We celebrate culinary artistry and strive to bring the best flavors to your table.",
    },
    {
      icon: <Handshake className="h-12 w-12 text-jasmine" />,
      title: "Trust & Transparency",
      description: "We build lasting relationships based on honesty and clear communication.",
    },
    {
      icon: <Lightbulb className="h-12 w-12 text-jasmine" />,
      title: "Innovation",
      description: "We continuously evolve our platform to offer the best user experience.",
    },
  ]

  const team = [
    {
      name: "Unified Mentor",
      role: "CEO & Founder",
      description: "Visionary leader passionate about culinary experiences.",
      image: "https://images.unsplash.com/photo-1553559707-0d8e571f58e9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWVudG9yfGVufDB8fDB8fHww",
    },
    {
      name: "Chirag MIshra",
      role: "Head of Operations",
      description: "Ensuring smooth deliveries and happy customers.",
      image: "https://plus.unsplash.com/premium_photo-1727343268376-0521b84e43ba?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDExfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gunmetal via-paynes-gray to-cadet-gray">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1549247775-aa45a80f089d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gunmetal/80 via-paynes-gray/80 to-cadet-gray/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-jasmine mb-4 animate-float">
            About <span className="text-gradient">CaterEase</span>
          </h1>
          <p className="text-xl text-cadet-gray max-w-2xl mx-auto">
            Our mission is to simplify catering and connect people through food.
          </p>
        </div>

        {/* Our Story Section */}
        <Card className="glass border-cadet-gray/20 mb-12">
          <CardContent className="p-8">
            <h2 className="text-3xl font-semibold text-jasmine mb-6 text-center">Our Story</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-cadet-gray leading-relaxed mb-4">
                  CaterEase was born from a simple idea: to make event catering effortless and enjoyable for everyone.
                  We noticed the challenges individuals and businesses faced when trying to find reliable, high-quality
                  caterers, and the struggle for talented local chefs and restaurants to reach a wider audience.
                </p>
                <p className="text-cadet-gray leading-relaxed">
                  Our founders, a team of food enthusiasts and tech innovators, set out to build a platform that bridges
                  this gap. We believe that every event, big or small, deserves exceptional food without the stress of
                  complex planning. Since our inception, we've been dedicated to curating a network of trusted caterers
                  and providing a seamless booking experience.
                </p>
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Our Story"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Values Section */}
        <Card className="glass border-cadet-gray/20 mb-12">
          <CardContent className="p-8">
            <h2 className="text-3xl font-semibold text-jasmine mb-6 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-jasmine mb-2">{value.title}</h3>
                  <p className="text-cadet-gray">{value.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Meet the Team Section */}
        <Card className="glass border-cadet-gray/20 mb-12">
          <CardContent className="p-8">
            <h2 className="text-3xl font-semibold text-jasmine mb-6 text-center">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-jasmine group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-jasmine">{member.name}</h3>
                  <p className="text-cadet-gray text-sm mb-2">{member.role}</p>
                  <p className="text-paynes-gray text-sm">{member.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action Section */}
        <Card className="glass border-cadet-gray/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold text-jasmine mb-6">Join Our Culinary Journey</h2>
            <p className="text-xl text-cadet-gray max-w-2xl mx-auto mb-10">
              Whether you're planning an event or looking to share your culinary talents, CaterEase is here for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90 font-semibold">
                  Contact Us <Mail className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/producer-dashboard">
                <Button
                  variant="outline"
                  className="border-cadet-gray/40 text-jasmine hover:bg-cadet-gray/10 font-semibold"
                >
                  Become a Producer <Store className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
