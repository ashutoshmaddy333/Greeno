"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, ExternalLink, BookOpen, Users, TrendingUp, FileText } from "lucide-react"
import Link from "next/link"

export default function EmployerResourcesPage() {
  const resources = [
    {
      id: 1,
      title: "Hiring Best Practices Guide",
      description: "Learn the latest strategies for attracting and retaining top talent in today's competitive market.",
      type: "PDF Guide",
      category: "Hiring",
      icon: BookOpen,
      downloadUrl: "#"
    },
    {
      id: 2,
      title: "Interview Questions Database",
      description: "Access a comprehensive collection of interview questions organized by role and skill level.",
      type: "Template",
      category: "Interviewing",
      icon: FileText,
      downloadUrl: "#"
    },
    {
      id: 3,
      title: "Job Description Templates",
      description: "Professional job description templates for various roles and industries.",
      type: "Template",
      category: "Job Posting",
      icon: FileText,
      downloadUrl: "#"
    },
    {
      id: 4,
      title: "Onboarding Checklist",
      description: "Ensure a smooth onboarding process with our comprehensive checklist.",
      type: "Checklist",
      category: "Onboarding",
      icon: Users,
      downloadUrl: "#"
    },
    {
      id: 5,
      title: "Salary Benchmarking Report",
      description: "Stay competitive with up-to-date salary data for various positions and locations.",
      type: "Report",
      category: "Compensation",
      icon: TrendingUp,
      downloadUrl: "#"
    },
    {
      id: 6,
      title: "Remote Work Policy Template",
      description: "Create effective remote work policies with our customizable template.",
      type: "Template",
      category: "Policy",
      icon: FileText,
      downloadUrl: "#"
    }
  ]

  const categories = ["All", "Hiring", "Interviewing", "Job Posting", "Onboarding", "Compensation", "Policy"]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/employer">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Employer Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Employer Resources</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Access our comprehensive collection of hiring guides, templates, and best practices to help you build a successful team.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === "All" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => {
            const IconComponent = resource.icon
            return (
              <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {resource.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {resource.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {resource.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Resources Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Hiring Support
                </CardTitle>
                <CardDescription>
                  Get personalized assistance with your hiring process from our expert team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Market Insights
                </CardTitle>
                <CardDescription>
                  Stay updated with the latest hiring trends and market insights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Insights
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
