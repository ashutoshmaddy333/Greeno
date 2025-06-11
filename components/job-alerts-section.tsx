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
              <CardDescription className="text-primary-foreground/90">
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
            <div className="h-full w-full overflow-hidden">
              <img
                src="/placeholder.svg?height=400&width=500&text=Job+Alerts"
                alt="Job alerts illustration"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
