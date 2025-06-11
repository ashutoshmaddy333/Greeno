"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Building2, Mail, Eye, Ban, CheckCircle, Globe } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { showToast } from "@/lib/toast"

interface Employer {
  _id: string
  user: {
    email: string
    isVerified: boolean
    isEmailVerified: boolean
  }
  fullName: string
  position: string
  company: {
    name: string
    industry: string
    location: string
    website?: string
    size?: string
    founded?: number
  }
  stats?: {
    totalJobs: number
    activeJobs: number
    totalApplications: number
  }
  createdAt: string
  status: "active" | "suspended"
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export default function EmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })

  useEffect(() => {
    fetchEmployers()
  }, [pagination.page, searchQuery])

  const fetchEmployers = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
      })

      const response = await fetch(`/api/admin/employers?${params}`)
      const data = await response.json()

      if (data.employers) {
        setEmployers(data.employers)
        setPagination(data.pagination)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Failed to fetch employers:", error)
      showToast.error("Failed to load employers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (employerId: string, newStatus: "active" | "suspended") => {
    try {
      const response = await fetch(`/api/admin/employers/${employerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      setEmployers((prev) =>
        prev.map((employer) =>
          employer._id === employerId ? { ...employer, status: newStatus } : employer
        )
      )

      showToast.success(`Employer ${newStatus === "active" ? "activated" : "suspended"} successfully`)
    } catch (error) {
      console.error("Failed to update employer status:", error)
      showToast.error("Failed to update status")
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Employers</h1>
        <p className="text-muted-foreground">Manage employers and their company accounts</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Employers</CardTitle>
              <CardDescription>
                Showing {employers.length} of {pagination.total} employers
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employers..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employers.map((employer) => (
                <TableRow key={employer._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{employer.fullName}</p>
                      <p className="text-sm text-muted-foreground">{employer.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{employer.company.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>{employer.company.industry}</p>
                        <p>{employer.company.location}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employer.position}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        {employer.user.email}
                      </div>
                      {employer.company.website && (
                        <div className="flex items-center text-sm">
                          <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                          <a 
                            href={employer.company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {employer.company.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={employer.status === "active" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {employer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(employer.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Building2 className="mr-2 h-4 w-4" />
                          View Company
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {employer.status === "active" ? (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleStatusChange(employer._id, "suspended")}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-green-600"
                            onClick={() => handleStatusChange(employer._id, "active")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate Account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} employers
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <div className="text-sm">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 