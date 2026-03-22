import { Card, CardContent } from "@/components/ui/card"
import { QuoteIcon } from "lucide-react"

export default function Testimonials() {
  return (
    <section className="container mx-auto py-16 px-4 md:px-6 md:py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Success Stories</h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            Hear from professionals who found their dream jobs through our platform
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border dark:bg-card/50">
          <CardContent className="p-6">
            <QuoteIcon className="h-8 w-8 text-primary/20" />
            <p className="mt-4 text-muted-foreground">
              "Greenotech Jobs made my job search incredibly easy. Within two weeks, I had multiple interviews lined up and
              landed my dream role at a tech startup."
            </p>
            <div className="mt-6 flex items-center space-x-4">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                <img
                  src="/placeholder.svg?height=40&width=40"
                  alt="Sarah Johnson"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">UX Designer at DesignHub</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border dark:bg-card/50">
          <CardContent className="p-6">
            <QuoteIcon className="h-8 w-8 text-primary/20" />
            <p className="mt-4 text-muted-foreground">
              "As someone transitioning careers, I was worried about finding the right opportunity. Greenotech Jobs's
              matching algorithm connected me with companies that valued my transferable skills."
            </p>
            <div className="mt-6 flex items-center space-x-4">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                <img
                  src="/placeholder.svg?height=40&width=40"
                  alt="Michael Chen"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">Michael Chen</p>
                <p className="text-sm text-muted-foreground">Product Manager at InnovateCo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border dark:bg-card/50">
          <CardContent className="p-6">
            <QuoteIcon className="h-8 w-8 text-primary/20" />
            <p className="mt-4 text-muted-foreground">
              "The resources and career advice on Greenotech Jobs helped me prepare for interviews and negotiate a salary
              that was 20% higher than my previous role."
            </p>
            <div className="mt-6 flex items-center space-x-4">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                <img
                  src="/placeholder.svg?height=40&width=40"
                  alt="Emily Rodriguez"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">Emily Rodriguez</p>
                <p className="text-sm text-muted-foreground">Marketing Director at GrowthCo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
