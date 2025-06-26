import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Shield, Headphones, Star } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: <Star className="h-8 w-8 sm:h-12 sm:w-12 text-jasmine" />,
      title: "Wide Selection",
      description: "Browse diverse menus from local caterers and restaurants, tailored for any occasion.",
    },
    {
      icon: <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-jasmine" />,
      title: "Trusted Partners",
      description: "We vet all our caterers to ensure quality, reliability, and exceptional service.",
    },
    {
      icon: <Headphones className="h-8 w-8 sm:h-12 sm:w-12 text-jasmine" />,
      title: "24/7 Support",
      description: "Our dedicated support team is always here to help you plan and execute your event.",
    },
  ]

  const steps = [
    {
      number: "1",
      title: "Choose Your Menu",
      description: "Browse our extensive list of caterers and menus to find the perfect fit for your event.",
    },
    {
      number: "2",
      title: "Customize & Order",
      description: "Customize your order, set your delivery details, and place your order securely online.",
    },
    {
      number: "3",
      title: "Enjoy Your Event",
      description: "Relax and enjoy while our caterers prepare and deliver delicious food right to your venue.",
    },
  ]

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

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-jasmine mb-4 sm:mb-6 animate-float">
            Crafting <span className="text-gradient"> Moments </span>, One Meal at a Time.
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-cadet-gray max-w-3xl mb-6 sm:mb-10 px-4">
            From village kitchens to world-class events, CaterEase brings people together through food.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link href="/menu">
              <Button
                size="lg"
                className="bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold w-full sm:w-auto"
              >
                Explore Menus
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-cadet-gray/40 text-jasmine hover:bg-cadet-gray/10 w-full sm:w-auto"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-12 sm:py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-jasmine text-center mb-8 sm:mb-12">
          Why Choose <span className="text-gradient">CaterEase?</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glass border-cadet-gray/20 hover:bg-cadet-gray/10 transition-all duration-300 hover-scale"
            >
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="flex justify-center mb-4 sm:mb-6">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-jasmine mb-3 sm:mb-4">{feature.title}</h3>
                <p className="text-cadet-gray text-sm sm:text-base">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-12 sm:py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-jasmine text-center mb-8 sm:mb-12">
          How It <span className="text-gradient">Works</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="glass border-cadet-gray/20">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="bg-jasmine/20 text-jasmine rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                  {step.number}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-jasmine mb-3 sm:mb-4">{step.title}</h3>
                <p className="text-cadet-gray text-sm sm:text-base">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-12 sm:py-16 text-center">
        <Card className="glass border-cadet-gray/20">
          <CardContent className="p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-jasmine mb-4 sm:mb-6">Ready to Plan Your Next Event?</h2>
            <p className="text-lg sm:text-xl text-cadet-gray max-w-2xl mx-auto mb-6 sm:mb-10 px-4">
              Join thousands of happy customers who trust CaterEase for their catering needs.
            </p>
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-jasmine to-orange-pantone text-gunmetal hover:from-jasmine/90 hover:to-orange-pantone/90 text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 font-semibold"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
