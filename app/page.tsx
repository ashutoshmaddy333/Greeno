"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, Building, Users, Search, CheckCircle } from "lucide-react"
import FeaturedJobs from "@/components/featured-jobs"
import HowItWorks from "@/components/how-it-works"
import Testimonials from "@/components/testimonials"
import CompanyLogos from "@/components/company-logos"
import JobCategories from "@/components/job-categories"
import JobAlertsSection from "@/components/job-alerts-section"
import RemoteJobsSection from "@/components/remote-jobs-section"
import Footer from "@/components/footer"

export default function Home() {
  const router = useRouter()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const searchQuery = formData.get('search') as string
    if (searchQuery.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 py-16 md:py-24"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-grid-white/10 bg-[length:20px_20px] [mask-image:radial-gradient(white,transparent_85%)]"></div>
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl"></div>

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-6 fade-in">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                <span className="mr-2 flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                Over 10,000+ jobs available now
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Find Your{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-primary">Dream Job</span>
                    <span className="absolute bottom-2 left-0 z-0 h-3 w-full bg-primary/20"></span>
                  </span>{" "}
                  Today
                </h1>
                <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
                  Connect with top employers and discover opportunities that match your skills, experience, and career
                  aspirations.
                </p>
              </div>

              <div className="mt-2 space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/jobs">
                    <Button size="lg" className="group relative overflow-hidden button-hover">
                      <span className="relative z-10 flex items-center">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      <span className="absolute inset-0 z-0 bg-primary/80 translate-y-[105%] group-hover:translate-y-0 transition-transform duration-300"></span>
                    </Button>
                  </Link>
                  <Link href="/companies">
                    <Button size="lg" variant="outline" className="button-hover border-primary/20">
                      Browse Companies
                    </Button>
                  </Link>
                </div>

                <div className="relative rounded-xl border bg-background/80 backdrop-blur-sm p-4 shadow-lg transition-all hover-lift">
                  <div className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Quick Search
                  </div>
                  <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <Building className="absolute left-3 top-3 h-5 w-5 text-primary" />
                      <input
                        name="search"
                        type="text"
                        placeholder="Job title, keywords, or company"
                        className="w-full rounded-md border border-input bg-background/50 px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <Button type="submit" className="shrink-0 button-hover bg-primary hover:bg-primary/90">
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                  </form>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>Trusted by 5,000+ companies</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>No sign-up required</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>100% free job search</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute -right-20 top-1/4 h-40 w-40 rounded-full bg-primary/5 blur-2xl"></div>
              <div className="absolute -left-20 bottom-1/4 h-40 w-40 rounded-full bg-primary/5 blur-2xl"></div>

              <div className="relative z-10 slide-in-right">
                <div className="relative">
                  <div className="absolute -left-6 -top-6 h-12 w-12 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20 animate-bounce-slow"></div>
                  <div className="absolute -right-6 -bottom-6 h-12 w-12 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20 animate-bounce-slow animation-delay-500"></div>

                  <div className="relative h-[350px] w-full max-w-[350px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 p-4 md:max-w-[450px] md:h-[450px] shadow-xl transition-all duration-300 hover:shadow-2xl">
  {/* Image container with improved hover effect */}
  <div className="relative h-full w-full rounded-xl overflow-hidden">
    <img
      src="/1.jpg?height=450&width=450&text=Job+Seekers"
      alt="Job seekers collaborating"
      className="h-full w-full object-cover transition-all duration-500 hover:scale-105"
    />
    
    {/* Gradient overlay for better text readability */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
  </div>

  {/* Floating stats cards - improved positioning and sizing */}
  <div className="absolute left-4 top-4 rounded-lg bg-background/90 backdrop-blur-sm p-3 shadow-lg border border-primary/10 animate-float min-w-[120px]">
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
        <Users className="h-4 w-4 text-primary" />
      </div>
      <div className="overflow-hidden">
        <p className="text-xs font-medium truncate">Active Users</p>
        <p className="text-sm font-bold truncate">2M+</p>
      </div>
    </div>
  </div>

  <div className="absolute right-4 bottom-4 rounded-lg bg-background/90 backdrop-blur-sm p-3 shadow-lg border border-primary/10 animate-float animation-delay-500 min-w-[120px]">
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
        <Briefcase className="h-4 w-4 text-primary" />
      </div>
      <div className="overflow-hidden">
        <p className="text-xs font-medium truncate">Jobs Posted</p>
        <p className="text-sm font-bold truncate">10K+</p>
      </div>
    </div>
  </div>

  {/* Optional: Main title/caption for the card */}
  <div className="absolute bottom-6 left-6 text-white">
    <h3 className="text-xl font-bold drop-shadow-md">Find Your Dream Job</h3>
    <p className="text-sm opacity-90">Join millions of professionals</p>
  </div>
</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover-lift card-hover">
            <Briefcase className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-3xl font-bold">10,000+</h3>
            <p className="text-center text-muted-foreground">Active Job Listings</p>
          </div>
          <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover-lift card-hover">
            <Building className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-3xl font-bold">5,000+</h3>
            <p className="text-center text-muted-foreground">Partner Companies</p>
          </div>
          <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover-lift card-hover">
            <Users className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-3xl font-bold">1M+</h3>
            <p className="text-center text-muted-foreground">Successful Placements</p>
          </div>
        </div>
      </section>

      {/* Company Logos */}
      <section id="companies">
        <CompanyLogos />
      </section>

      {/* Featured Jobs */}
      <section id="featured-jobs">
        <FeaturedJobs />
      </section>

      {/* Remote Jobs */}
      <section id="remote-jobs">
        <RemoteJobsSection />
      </section>

      {/* How It Works */}
      <section id="how-it-works">
        <HowItWorks />
      </section>

      {/* Testimonials */}
      <section id="testimonials">
        <Testimonials />
      </section>

      {/* Job Categories */}
      <section id="job-categories">
        <JobCategories />
      </section>

      {/* Job Alerts */}
      <section id="job-alerts">
        <JobAlertsSection />
      </section>

      {/* CTA Section */}
      <section id="cta" className="bg-primary py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl">
                Ready to Find Your Dream Job?
              </h2>
              <p className="max-w-[600px] text-primary-foreground/90 md:text-lg">
                Join thousands of job seekers who have found their perfect match.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="group button-hover">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
