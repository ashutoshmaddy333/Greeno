import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, BookOpen, FileText, Lightbulb, Newspaper, PenTool, Video } from "lucide-react"
import SalaryGuide from "@/components/salary-guide"
import InterviewTips from "@/components/interview-tips"

export default function ResourcesPage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 md:px-6">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Career Resources</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Explore our comprehensive resources to help you advance in your career journey
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex justify-center overflow-x-auto pb-2">
            <TabsList className="grid w-full max-w-2xl grid-cols-3 md:grid-cols-6 min-w-[320px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-8">
            {/* Featured Resources */}
            <section>
              <h2 className="mb-6 text-xl sm:text-2xl font-bold tracking-tight">Featured Resources</h2>
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="overflow-hidden w-full">
                  <div className="h-32 sm:h-40 md:h-48 w-full overflow-hidden bg-muted">
                    <img
                      src="/placeholder.svg?height=200&width=400"
                      alt="Resume writing guide"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Guide</Badge>
                      <span className="text-xs text-muted-foreground">10 min read</span>
                    </div>
                    <CardTitle className="line-clamp-2">The Ultimate Guide to Writing a Standout Resume</CardTitle>
                    <CardDescription>
                      Learn how to craft a resume that gets noticed by recruiters and hiring managers.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between">
                      Read Guide
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src="/placeholder.svg?height=200&width=400"
                      alt="Interview preparation"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Video</Badge>
                      <span className="text-xs text-muted-foreground">25 min</span>
                    </div>
                    <CardTitle className="line-clamp-2">
                      Mastering the Job Interview: Tips from Hiring Managers
                    </CardTitle>
                    <CardDescription>
                      Expert advice on how to prepare for and excel in job interviews across industries.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between">
                      Watch Video
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src="/placeholder.svg?height=200&width=400"
                      alt="Salary negotiation"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Article</Badge>
                      <span className="text-xs text-muted-foreground">8 min read</span>
                    </div>
                    <CardTitle className="line-clamp-2">
                      The Art of Salary Negotiation: Getting What You're Worth
                    </CardTitle>
                    <CardDescription>
                      Strategies and scripts for negotiating your salary with confidence and success.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between">
                      Read Article
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </section>

            {/* Resource Categories */}
            <section>
              <h2 className="mb-6 text-2xl font-bold tracking-tight">Resource Categories</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mt-2">Resume & Cover Letters</CardTitle>
                    <CardDescription>Templates, examples, and writing guides</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Resume Templates</Link>
                      </li>
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Cover Letter Examples</Link>
                      </li>
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">ATS-Friendly Resumes</Link>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between">
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mt-2">Interview Preparation</CardTitle>
                    <CardDescription>Tips, common questions, and practice tools</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Common Interview Questions</Link>
                      </li>
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Behavioral Interview Guide</Link>
                      </li>
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Virtual Interview Tips</Link>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between">
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Lightbulb className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mt-2">Career Development</CardTitle>
                    <CardDescription>Growth strategies and skill building</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Skill Assessment Tools</Link>
                      </li>
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Career Path Planning</Link>
                      </li>
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Professional Certifications</Link>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between">
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <PenTool className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mt-2">Personal Branding</CardTitle>
                    <CardDescription>LinkedIn optimization and networking</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">LinkedIn Profile Optimization</Link>
                      </li>
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Personal Website Templates</Link>
                      </li>
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Networking Strategies</Link>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between">
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mt-2">Industry Insights</CardTitle>
                    <CardDescription>Trends, salaries, and market analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Salary Guides by Industry</Link>
                      </li>
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Emerging Job Trends</Link>
                      </li>
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Industry Growth Reports</Link>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between">
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Newspaper className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mt-2">Job Search Strategies</CardTitle>
                    <CardDescription>Effective techniques and tools</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Hidden Job Market Guide</Link>
                      </li>
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Job Search Automation Tools</Link>
                      </li>
                      <li className="text-muted-foreground hover:text-foreground">
                        <Link href="#">Recruiter Outreach Templates</Link>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between">
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </section>

            {/* Latest Articles */}
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Latest Articles</h2>
                <Button variant="ghost" size="sm">
                  View All Articles
                </Button>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <article key={i} className="group cursor-pointer space-y-3">
                    <div className="overflow-hidden rounded-lg">
                      <img
                        src={`/placeholder.svg?height=200&width=400&text=Article+${i}`}
                        alt={`Article ${i}`}
                        className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary">Career Development</span>
                        <span className="text-xs text-muted-foreground">May {i + 10}, 2025</span>
                      </div>
                      <h3 className="mt-1 line-clamp-2 text-lg font-semibold group-hover:text-primary">
                        How to Stand Out in a Competitive Job Market in 2025
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        Practical strategies to differentiate yourself and catch the attention of employers in today's
                        challenging job landscape.
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="articles">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Career Articles</h2>
              <p className="text-muted-foreground">Insights and advice from industry experts</p>
            </div>
            {/* Articles content would go here */}
          </TabsContent>

          <TabsContent value="guides">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Career Guides</h2>
              <p className="text-muted-foreground">Comprehensive guides for every stage of your career</p>
            </div>
            {/* Guides content would go here */}
          </TabsContent>

          <TabsContent value="templates">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Resume & Cover Letter Templates</h2>
              <p className="text-muted-foreground">Professional templates to help you stand out</p>
            </div>
            {/* Templates content would go here */}
          </TabsContent>

          <TabsContent value="videos">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Video Resources</h2>
              <p className="text-muted-foreground">Watch and learn from career experts</p>
            </div>
            {/* Videos content would go here */}
          </TabsContent>

          <TabsContent value="tools">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Career Tools</h2>
              <p className="text-muted-foreground">Interactive tools to advance your career</p>
            </div>
            {/* Tools content would go here */}
          </TabsContent>
        </Tabs>

        {/* Interview Tips Section */}
        <section>
          <InterviewTips />
        </section>

        {/* Salary Guide Section */}
        <section>
          <SalaryGuide />
        </section>

        {/* Newsletter Section */}
        <section className="rounded-lg bg-primary p-8 text-primary-foreground">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold">Get Career Tips in Your Inbox</h2>
            <p className="mt-2 text-primary-foreground/90">
              Subscribe to our newsletter for the latest career advice, industry insights, and job search tips.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="rounded-md border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
              />
              <Button variant="secondary">Subscribe</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
