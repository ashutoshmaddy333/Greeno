import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Check } from "lucide-react"

export default function JobAlertsSection() {
  return (
    <section className="container mx-auto py-16 px-4 md:px-6">
      <Card className="overflow-hidden bg-primary text-primary-foreground">
        <div className="md:grid md:grid-cols-2">
          <div className="p-6 md:p-8">
            <CardHeader className="p-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10">
                <Bell className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4 text-2xl font-bold md:text-3xl">Never Miss a Job Opportunity</CardTitle>
              <CardDescription className="text-primary-foreground/90">x
                Get personalized job alerts delivered straight to your inbox
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-5 w-5 text-primary-foreground/90" />
                  <p className="text-primary-foreground/90">
                    Receive alerts for jobs matching your skills and preferences
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-5 w-5 text-primary-foreground/90" />
                  <p className="text-primary-foreground/90">Customize frequency - daily, weekly, or real-time alerts</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-5 w-5 text-primary-foreground/90" />
                  <p className="text-primary-foreground/90">Be among the first to apply for new job postings</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Button variant="secondary" className="shrink-0">
                  Create Job Alert
                </Button>
              </div>
            </CardContent>
          </div>
          <div className="hidden md:block">
            <div className="relative overflow-hidden rounded-2xl bg-background shadow-lg transition-all duration-500 hover:shadow-xl mx-4 my-6">
              {/* Decorative border */}
              <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl transition-colors duration-300 hover:border-primary/40" />
              
              {/* Image container with hover effects */}
              <div className="relative overflow-hidden">
                <img
                  src="/new.jpg?height=400&width=500&text=Job+Alerts"
                  alt="Job alerts illustration"
                  className="w-full h-auto object-contain transition-all duration-700 hover:scale-105"
                />
                
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100" />
                
                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 h-16 w-16 -translate-x-8 -translate-y-8 rotate-45 bg-primary/20 blur-xl transition-all duration-500 hover:bg-primary/30" />
                <div className="absolute bottom-0 right-0 h-16 w-16 translate-x-8 translate-y-8 rotate-45 bg-primary/20 blur-xl transition-all duration-500 hover:bg-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
