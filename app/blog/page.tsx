"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Clock, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "10 Tips for Writing a Standout Resume in 2024",
      excerpt: "Learn the latest resume writing strategies that will help you land more interviews and job offers in today's competitive market.",
      content: "In today's competitive job market, having a standout resume is more important than ever. Here are 10 proven tips to make your resume shine...",
      author: "Sarah Johnson",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "Career Tips",
      image: "/blog-images/resume-tips.svg",
      featured: true
    },
    {
      id: 2,
      title: "Remote Work: The Future of Employment",
      excerpt: "Explore how remote work is reshaping the job market and what it means for job seekers and employers in the post-pandemic world.",
      content: "The pandemic has fundamentally changed how we work, and remote work is here to stay. This comprehensive guide covers...",
      author: "Michael Chen",
      date: "2024-01-10",
      readTime: "7 min read",
      category: "Industry Trends",
      image: "/blog-images/remote-work.svg",
      featured: false
    },
    {
      id: 3,
      title: "How to Ace Your Next Job Interview",
      excerpt: "Master the art of job interviews with these proven techniques and strategies from hiring managers and career experts.",
      content: "Job interviews can be nerve-wracking, but with the right preparation, you can turn them into opportunities to shine...",
      author: "Emily Rodriguez",
      date: "2024-01-05",
      readTime: "6 min read",
      category: "Interview Tips",
      image: "/blog-images/interview-tips.svg",
      featured: false
    },
    {
      id: 4,
      title: "Building Your Personal Brand as a Professional",
      excerpt: "Learn how to create a strong personal brand that attracts the right opportunities and employers in your industry.",
      content: "Your personal brand is what people say about you when you're not in the room. Here's how to build one that works for you...",
      author: "David Kim",
      date: "2024-01-01",
      readTime: "8 min read",
      category: "Personal Branding",
      image: "/blog-images/personal-branding.svg",
      featured: false
    },
    {
      id: 5,
      title: "The Rise of AI in Recruitment",
      excerpt: "Discover how artificial intelligence is transforming the hiring process and what it means for job seekers and recruiters.",
      content: "AI is revolutionizing recruitment, from resume screening to candidate matching. Here's what you need to know...",
      author: "Lisa Wang",
      date: "2023-12-28",
      readTime: "9 min read",
      category: "Technology",
      image: "/blog-images/ai-recruitment.svg",
      featured: false
    },
    {
      id: 6,
      title: "Networking Strategies That Actually Work",
      excerpt: "Build meaningful professional relationships with these proven networking strategies and techniques that advance your career.",
      content: "Networking isn't just about collecting business cards. It's about building genuine relationships that can advance your career...",
      author: "James Wilson",
      date: "2023-12-25",
      readTime: "6 min read",
      category: "Networking",
      image: "/blog-images/networking.svg",
      featured: false
    }
  ]

  const categories = ["All", "Career Tips", "Industry Trends", "Interview Tips", "Personal Branding", "Technology", "Networking"]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Career Blog</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Stay updated with the latest career advice, industry trends, and job search tips from our expert team at Greenotech Jobs.
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

        {/* Featured Post */}
        <div className="mb-12">
          <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto">
                <img
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                </div>
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-4" variant="outline">{blogPosts[0].category}</Badge>
                <CardTitle className="text-2xl mb-4 group-hover:text-primary transition-colors">{blogPosts[0].title}</CardTitle>
                <CardDescription className="text-base mb-4 line-clamp-3">
                  {blogPosts[0].excerpt}
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {blogPosts[0].author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(blogPosts[0].date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {blogPosts[0].readTime}
                  </div>
                </div>
                <Button className="group/btn">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="relative h-48">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                    {post.category}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </div>
                <Button variant="outline" className="w-full group/btn">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden">
            <CardContent className="p-8 text-center relative">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
                <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                  Get the latest career advice and job market insights delivered straight to your inbox. 
                  Join thousands of professionals who trust Greenotech Jobs for their career growth.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 rounded-md text-foreground placeholder:text-muted-foreground border-0 focus:ring-2 focus:ring-primary-foreground/20"
                  />
                  <Button variant="secondary" className="whitespace-nowrap group/btn">
                    Subscribe
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
                <p className="text-xs text-primary-foreground/70 mt-4">
                  No spam, unsubscribe at any time. We respect your privacy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Resources */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">More Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Career Resources</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Access our comprehensive library of career development resources and guides.
                </p>
                <Button variant="outline" size="sm">Explore Resources</Button>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Expert Advice</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get personalized career advice from our team of industry experts.
                </p>
                <Button variant="outline" size="sm">Get Advice</Button>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Job Alerts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set up job alerts to never miss opportunities that match your skills.
                </p>
                <Button variant="outline" size="sm">Set Alerts</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
