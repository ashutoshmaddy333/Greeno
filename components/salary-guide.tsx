import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IndianRupee } from "lucide-react"

export default function SalaryGuide() {
  const techRoles = [
    { role: "Software Engineer", junior: "₹7L - ₹9L", mid: "₹9L - ₹12L", senior: "₹12L - ₹18L+" },
    { role: "Frontend Developer", junior: "₹6.5L - ₹8.5L", mid: "₹8.5L - ₹11L", senior: "₹11L - ₹16L+" },
    { role: "Backend Developer", junior: "₹7L - ₹9L", mid: "₹9L - ₹12L", senior: "₹12L - ₹17L+" },
    { role: "Full Stack Developer", junior: "₹7.5L - ₹9.5L", mid: "₹9.5L - ₹12.5L", senior: "₹12.5L - ₹18L+" },
    { role: "DevOps Engineer", junior: "₹8L - ₹10L", mid: "₹10L - ₹13L", senior: "₹13L - ₹19L+" },
  ]

  const designRoles = [
    { role: "UX Designer", junior: "₹6L - ₹8L", mid: "₹8L - ₹11L", senior: "₹11L - ₹15L+" },
    { role: "UI Designer", junior: "₹5.5L - ₹7.5L", mid: "₹7.5L - ₹10L", senior: "₹10L - ₹14L+" },
    { role: "Product Designer", junior: "₹6.5L - ₹8.5L", mid: "₹8.5L - ₹11.5L", senior: "₹11.5L - ₹16L+" },
    { role: "Graphic Designer", junior: "₹5L - ₹6.5L", mid: "₹6.5L - ₹8.5L", senior: "₹8.5L - ₹12L+" },
    { role: "Motion Designer", junior: "₹5.5L - ₹7.5L", mid: "₹7.5L - ₹10L", senior: "₹10L - ₹14L+" },
  ]

  const marketingRoles = [
    { role: "Marketing Manager", junior: "₹6L - ₹8L", mid: "₹8L - ₹11L", senior: "₹11L - ₹15L+" },
    { role: "Content Strategist", junior: "₹5.5L - ₹7L", mid: "₹7L - ₹9.5L", senior: "₹9.5L - ₹13L+" },
    { role: "SEO Specialist", junior: "₹5L - ₹7L", mid: "₹7L - ₹9L", senior: "₹9L - ₹12L+" },
    { role: "Social Media Manager", junior: "₹4.5L - ₹6.5L", mid: "₹6.5L - ₹8.5L", senior: "₹8.5L - ₹11.5L+" },
    { role: "Growth Marketer", junior: "₹6L - ₹8L", mid: "₹8L - ₹11L", senior: "₹11L - ₹15L+" },
  ]

  return (
    <section className="container mx-auto py-16 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <IndianRupee className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Salary Guide</h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            Know your worth with our comprehensive salary guide for popular roles
          </p>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="tech" className="w-full">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="tech">Technology</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
            </TabsList>
          </div>
          <div className="mt-6">
            <TabsContent value="tech">
              <Card>
                <CardHeader>
                  <CardTitle>Technology Roles</CardTitle>
                  <CardDescription>Average annual salaries for technology positions in INR</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-2 text-left font-medium">Role</th>
                          <th className="pb-2 text-left font-medium">Junior</th>
                          <th className="pb-2 text-left font-medium">Mid-Level</th>
                          <th className="pb-2 text-left font-medium">Senior</th>
                        </tr>
                      </thead>
                      <tbody>
                        {techRoles.map((role, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3 font-medium">{role.role}</td>
                            <td className="py-3 text-muted-foreground">{role.junior}</td>
                            <td className="py-3 text-muted-foreground">{role.mid}</td>
                            <td className="py-3 text-muted-foreground">{role.senior}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="design">
              <Card>
                <CardHeader>
                  <CardTitle>Design Roles</CardTitle>
                  <CardDescription>Average annual salaries for design positions in INR</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-2 text-left font-medium">Role</th>
                          <th className="pb-2 text-left font-medium">Junior</th>
                          <th className="pb-2 text-left font-medium">Mid-Level</th>
                          <th className="pb-2 text-left font-medium">Senior</th>
                        </tr>
                      </thead>
                      <tbody>
                        {designRoles.map((role, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3 font-medium">{role.role}</td>
                            <td className="py-3 text-muted-foreground">{role.junior}</td>
                            <td className="py-3 text-muted-foreground">{role.mid}</td>
                            <td className="py-3 text-muted-foreground">{role.senior}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="marketing">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Roles</CardTitle>
                  <CardDescription>Average annual salaries for marketing positions in INR</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-2 text-left font-medium">Role</th>
                          <th className="pb-2 text-left font-medium">Junior</th>
                          <th className="pb-2 text-left font-medium">Mid-Level</th>
                          <th className="pb-2 text-left font-medium">Senior</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketingRoles.map((role, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3 font-medium">{role.role}</td>
                            <td className="py-3 text-muted-foreground">{role.junior}</td>
                            <td className="py-3 text-muted-foreground">{role.mid}</td>
                            <td className="py-3 text-muted-foreground">{role.senior}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Note: Salary ranges are approximate and may vary based on location, company size, industry, and individual
          experience. Data updated as of May 2025.
        </p>
      </div>
    </section>
  )
}
