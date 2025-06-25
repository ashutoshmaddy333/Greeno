"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Briefcase, Facebook, Instagram, Linkedin, Twitter, Youtube, ChevronRight } from "lucide-react"
import { useScrollTo } from "@/hooks/use-scroll-to"
import { useAuth } from "@/contexts/auth-context"

export default function Footer() {
  const { scrollToHash, scrollToTop } = useScrollTo()
  const { user } = useAuth()
  const isJobSeeker = user?.role === "jobseeker"

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If it's a hash link
    if (href.startsWith("#")) {
      scrollToHash(e, href)
      return
    }

    // If it's the current page link (like "/")
    if (href === window.location.pathname) {
      e.preventDefault()
      scrollToTop()
    }
  }

  const jobSeekerLinks = [
    { name: "Browse Jobs", href: "/jobs" },
    { name: "Companies", href: "/companies" },
    { name: "Saved Jobs", href: "/profile?tab=saved" },
    { name: "Applied Jobs", href: "/profile?tab=applied" },
  ]

  const employerLinks = [
    { name: "Post a Job", href: "/employer/post-job" },
    { name: "Manage Jobs", href: "/employer/jobs" },
    { name: "Applications", href: "/employer/applications" },
    { name: "Company Profile", href: "/employer/profile" },
    { name: "Resources", href: "/employer/resources" },
  ]

  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blog" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ]

  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 sm:py-12 md:px-6 md:py-16 lg:py-20">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2" onClick={(e) => handleLinkClick(e, "/")}>
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-lg sm:text-xl font-bold">JobConnect</span>
            </Link>
            <p className="max-w-xs text-sm sm:text-base text-muted-foreground">
              Connecting talented professionals with their dream careers and helping employers find the perfect
              candidates.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 hover:bg-primary/20 hover:text-primary transition-colors"
                asChild
              >
                <a
                  href="https://www.facebook.com/share/1EwvYnhkyo/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="sr-only">Facebook</span>
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 hover:bg-primary/20 hover:text-primary transition-colors"
                asChild
              >
                <a
                  href="https://x.com/GreenotechJobs?t=flhULKxmhILuXzw81RhJxw&s=09"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="sr-only">Twitter</span>
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 hover:bg-primary/20 hover:text-primary transition-colors"
                asChild
              >
                <a
                  href="https://www.instagram.com/greenotechjobs?igsh=bzBtcGdseG0zNGY5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="sr-only">Instagram</span>
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 hover:bg-primary/20 hover:text-primary transition-colors"
                asChild
              >
                <a
                  href="https://youtube.com/@greenotechjobs?si=rB4NqWdhPzaO6FzT"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="sr-only">YouTube</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Show different links based on user role */}
          {isJobSeeker ? (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-medium uppercase tracking-wider">For Job Seekers</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {jobSeekerLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="group flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => handleLinkClick(e, item.href)}
                    >
                      <ChevronRight className="mr-1 h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-medium uppercase tracking-wider">For Employers</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {employerLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="group flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => handleLinkClick(e, item.href)}
                    >
                      <ChevronRight className="mr-1 h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-medium uppercase tracking-wider">Company</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {companyLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => handleLinkClick(e, item.href)}
                  >
                    <ChevronRight className="mr-1 h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 border-t pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} JobConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
