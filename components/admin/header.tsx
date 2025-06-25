"use client"

import { useAdmin } from "@/contexts/admin-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AdminHeader() {
  const { logout } = useAdmin()

  return (
    <header className="bg-background border-b border-border">
      <div className="flex h-16 items-center justify-between px-8">
        <div className="flex items-center flex-1">
          <div className="w-full max-w-lg">
            <div className="relative">
              {/* Notification icon removed */}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-accent">
                {/* Notification icon removed */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-background">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer hover:bg-accent">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">New job application</p>
                  <p className="text-xs text-muted-foreground">John Doe applied for Senior Developer position</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-accent">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">New employer registered</p>
                  <p className="text-xs text-muted-foreground">Tech Corp has joined the platform</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-accent">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">New job posted</p>
                  <p className="text-xs text-muted-foreground">Product Manager position at Design Studio</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Admin profile avatar removed */}
        </div>
      </div>
    </header>
  )
} 