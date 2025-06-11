import { ArrowRight, FileCheck, Search, UserCheck } from "lucide-react"

export default function HowItWorks() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Find your dream job in just a few simple steps
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Search Jobs</h3>
            <p className="text-center text-muted-foreground">
              Browse through thousands of job listings tailored to your skills and preferences.
            </p>
            <div className="flex items-center text-primary">
              <span className="font-medium">Step 1</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <FileCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Apply with Ease</h3>
            <p className="text-center text-muted-foreground">
              Submit your application with just a few clicks and track your application status.
            </p>
            <div className="flex items-center text-primary">
              <span className="font-medium">Step 2</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Get Hired</h3>
            <p className="text-center text-muted-foreground">
              Connect with employers, ace your interviews, and land your dream job.
            </p>
            <div className="flex items-center text-primary">
              <span className="font-medium">Step 3</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
