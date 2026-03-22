"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, User, LogOut, Settings, BriefcaseIcon } from "lucide-react"
import { cn, getLogoUrl, getLogoDimensions } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const pathname = usePathname()
  const { isAuthenticated, isEmployer, isAdmin, user, logout } = useAuth()
  const { settings } = useSettings()

  const { width, height } = getLogoDimensions('navbar')

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const getProfilePictureUrl = (path: string | undefined) => {
    if (!path) return "/placeholder.svg"
    
    // If it's already a full URL, return as is
    if (path.startsWith('http')) {
      return path
    }
    
    // If it's a relative path starting with /uploads, make it absolute
    if (path.startsWith('/uploads')) {
      // Get the current origin (protocol + hostname + port)
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      return `${origin}${path}`
    }
    
    // For any other case, return the path as is
    return path
  }

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (isAuthenticated && user) {
        try {
          if (isEmployer) {
            // Fetch employer profile
            const response = await fetch("/api/employer/profile")
            const data = await response.json()
            if (response.ok && data.company?.logo) {
              const logoUrl = getProfilePictureUrl(data.company.logo)
              setProfilePicture(logoUrl)
              setLastUpdate(Date.now())
            }
          } else {
            // Fetch job seeker profile
            const response = await fetch("/api/profile")
            const data = await response.json()
            if (response.ok && data.profilePicture) {
              const pictureUrl = getProfilePictureUrl(data.profilePicture)
              setProfilePicture(pictureUrl)
              setLastUpdate(Date.now())
            }
          }
        } catch (error) {
          console.error("Error fetching profile picture:", error)
        }
      }
    }

    fetchProfilePicture()
    // Set up an interval to refresh the profile picture every 30 seconds
    const interval = setInterval(fetchProfilePicture, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, isEmployer, user])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const navItems = isAdmin ? [] : isEmployer ? [
    { name: "Home", href: "/employer" },
    { name: "Jobs", href: "/jobs" },
    { name: "Companies", href: "/companies" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ] : [
    { name: "Home", href: "/" },
    { name: "Jobs", href: "/jobs" },
    { name: "Companies", href: "/companies" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-background",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <BriefcaseIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-lg sm:text-xl font-bold">{settings?.siteName || "GreenTech Jobs"}</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {!isAdmin && (
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "px-4 py-2",
                          pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/70 hover:text-foreground",
                        )}
                      >
                        {item.name}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        )}

        <div className="flex items-center space-x-2 sm:space-x-4">
          <ModeToggle />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={profilePicture ? `${profilePicture}?t=${lastUpdate}` : "/placeholder.svg"} 
                      alt={user?.name || "User"} 
                    />
                    <AvatarFallback>{isEmployer ? (user?.name?.charAt(0) || "U") : "A"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isAdmin && (
                  <>
                    {isEmployer ? (
                      <DropdownMenuItem asChild>
                        <Link href="/employer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Employer Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden lg:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" onClick={toggleMenu} className="h-8 w-8 sm:h-9 sm:w-9">
                {isOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-4">
              <nav className="flex flex-col gap-4 mt-4">
                {!isAdmin && navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center py-2 text-base sm:text-lg font-medium transition-colors",
                      pathname === item.href ? "text-primary" : "text-foreground/70 hover:text-foreground",
                    )}
                    onClick={closeMenu}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2">
                  {!isAuthenticated ? (
                    <>
                      <Button asChild variant="outline" className="w-full" onClick={closeMenu}>
                        <Link href="/login">Sign in</Link>
                      </Button>
                      <Button asChild className="w-full" onClick={closeMenu}>
                        <Link href="/signup">Sign up</Link>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        logout()
                        closeMenu()
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
