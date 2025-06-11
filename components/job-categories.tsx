import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Code, Database, Figma, LineChart, Megaphone, PenTool, ShoppingBag, Wrench } from "lucide-react"

export default function JobCategories() {
  const categories = [
    {
      name: "Technology",
      icon: <Code className="h-6 w-6 text-primary" />,
      count: 1245,
      description: "Software development, IT, and system administration",
    },
    {
      name: "Design",
      icon: <Figma className="h-6 w-6 text-primary" />,
      count: 873,
      description: "UX/UI, graphic design, and product design",
    },
    {
      name: "Marketing",
      icon: <Megaphone className="h-6 w-6 text-primary" />,
      count: 942,
      description: "Digital marketing, content creation, and SEO",
    },
    {
      name: "Data Science",
      icon: <Database className="h-6 w-6 text-primary" />,
      count: 658,
      description: "Data analysis, machine learning, and AI",
    },
    {
      name: "Business",
      icon: <LineChart className="h-6 w-6 text-primary" />,
      count: 1089,
      description: "Management, consulting, and operations",
    },
    {
      name: "Creative",
      icon: <PenTool className="h-6 w-6 text-primary" />,
      count: 547,
      description: "Writing, editing, and content production",
    },
    {
      name: "Sales",
      icon: <ShoppingBag className="h-6 w-6 text-primary" />,
      count: 763,
      description: "Sales, business development, and account management",
    },
    {
      name: "Engineering",
      icon: <Wrench className="h-6 w-6 text-primary" />,
      count: 892,
      description: "Mechanical, electrical, and civil engineering",
    },
  ]

  return (
    <section className="container mx-auto py-16 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Explore Job Categories</h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            Browse jobs by category to find the perfect role for your skills and interests
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => (
          <Link key={index} href={`/jobs?category=${category.name.toLowerCase()}`}>
            <Card className="h-full overflow-hidden transition-all hover:shadow-md hover-lift">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {category.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{category.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                  <div className="mt-4 flex items-center justify-between w-full">
                    <span className="text-sm font-medium">{category.count} jobs</span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Button variant="outline" className="group">
          View All Categories
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>
  )
}
