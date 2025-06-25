import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Award, CheckCircle, Clock, Globe, Heart, Users, Building, Briefcase } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-muted/30 py-12 sm:py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="container mx-auto px-2 sm:px-4 md:px-6">
          <div className="grid gap-8 sm:gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  Our Mission is to <span className="text-primary">Connect</span> Talent
                </h1>
                <p className="max-w-full sm:max-w-[600px] text-muted-foreground text-base sm:text-lg md:text-xl">
                  We're on a mission to revolutionize how people find jobs and how companies find talent. Our platform
                  connects the right people with the right opportunities.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/jobs">
                  <Button size="lg" className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full min-[400px]:w-auto">
                    Explore Jobs
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/5 w-full min-[400px]:w-auto">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center mt-8 lg:mt-0">
              <div className="relative h-[220px] w-[220px] sm:h-[300px] sm:w-[300px] md:h-[350px] md:w-[350px] lg:h-[450px] lg:w-[450px] overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-2 sm:p-4 group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img
                  src="/1.jpg?height=450&width=450"
                  alt="Our team"
                  className="absolute inset-0 h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto py-8 sm:py-12 px-2 sm:px-4 md:px-6">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, value: "2M+", label: "Registered Users" },
            { icon: Building, value: "50K+", label: "Partner Companies" },
            { icon: Briefcase, value: "500K+", label: "Jobs Posted" },
            { icon: CheckCircle, value: "1M+", label: "Successful Placements" }
          ].map((stat, index) => (
            <Card key={index} className="group flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md hover:scale-105">
              <div className="rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                <stat.icon className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mt-4 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">{stat.value}</h3>
              <p className="text-center text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Our Story Section */}
      <section className="relative bg-muted/30 py-12 sm:py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="container mx-auto px-2 sm:px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Our Story</h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg md:text-xl">
              Greenotech Jobs was founded with a vision to revolutionize India's employment landscape through sustainable technology and skill development.
            </p>
          </div>
          <div className="mt-8 sm:mt-12 grid gap-8 md:grid-cols-2 lg:gap-12">
            <div className="space-y-4 relative">
              <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-primary/50 to-transparent rounded-full" />
              <h3 className="text-2xl font-bold">The Genesis of Greenotech Jobs</h3>
              <p className="text-muted-foreground">
                Born from the vision of Mr. Yatendra Chaprana, Greenotech Jobs emerged as a response to India's pressing unemployment challenges. Our founder, combining medical expertise with a deep understanding of societal needs, recognized that sustainable employment solutions required more than just job listings – they needed a comprehensive approach to skill development and community empowerment.
              </p>
              <p className="text-muted-foreground">
                What started as Boost a Step Ahead India has evolved into Greenotech Jobs, a platform that bridges the gap between traditional employment and emerging green technology sectors. Our journey began with a simple yet powerful mission: to create meaningful employment opportunities while promoting sustainable practices in the job market.
              </p>
            </div>
            <div className="space-y-4 relative">
              <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-primary/50 to-transparent rounded-full" />
              <h3 className="text-2xl font-bold">Our Evolution & Impact</h3>
              <p className="text-muted-foreground">
                Today, Greenotech Jobs stands at the forefront of employment innovation, combining traditional job placement with cutting-edge green technology opportunities. We've expanded our services to include:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground">
                {[
                  "Specialized training programs in green technology sectors",
                  "Partnerships with sustainable businesses and organizations",
                  "Community-focused skill development initiatives",
                  "Innovative job matching algorithms for better placement",
                  "Entrepreneurship support for green business ventures"
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground">
                Our platform has become a catalyst for change, helping thousands of individuals find meaningful employment while contributing to India's sustainable development goals. Through our unique blend of technology, community engagement, and environmental consciousness, we're not just creating jobs – we're building a greener, more sustainable future for India's workforce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="container mx-auto py-12 sm:py-16 px-2 sm:px-4 md:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter">Our Core Values</h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg md:text-xl">These principles guide everything we do at JobConnect</p>
        </div>
        <div className="mt-8 sm:mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col items-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-xl font-bold">People First</h3>
            <p className="mt-2 text-muted-foreground">
              We believe in putting people at the center of everything we do, creating experiences that respect and
              empower both job seekers and employers.
            </p>
          </Card>
          <Card className="flex flex-col items-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Accessibility</h3>
            <p className="mt-2 text-muted-foreground">
              We're committed to making career opportunities accessible to everyone, regardless of background, location,
              or circumstance.
            </p>
          </Card>
          <Card className="flex flex-col items-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Excellence</h3>
            <p className="mt-2 text-muted-foreground">
              We strive for excellence in our platform, our service, and our impact, constantly innovating to provide
              the best possible experience.
            </p>
          </Card>
          <Card className="flex flex-col items-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Empathy</h3>
            <p className="mt-2 text-muted-foreground">
              We approach every interaction with empathy, understanding the challenges and aspirations of both job
              seekers and employers.
            </p>
          </Card>
          <Card className="flex flex-col items-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Efficiency</h3>
            <p className="mt-2 text-muted-foreground">
              We value everyone's time and strive to create efficient processes that connect the right people with the
              right opportunities quickly.
            </p>
          </Card>
          <Card className="flex flex-col items-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Integrity</h3>
            <p className="mt-2 text-muted-foreground">
              We operate with transparency and honesty, building trust with our users through ethical practices and
              reliable service.
            </p>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-muted/30 py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-2 sm:px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Meet Our Leadership Team</h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg md:text-xl">
              The passionate individuals driving our mission forward
            </p>
          </div>

          {/* Founder Spotlight */}
          <div className="mt-8 sm:mt-12 mb-16">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col items-center group">
                <div className="relative overflow-hidden rounded-2xl bg-background shadow-lg transition-all duration-500 group-hover:shadow-xl">
                  {/* Decorative border elements */}
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl transition-colors duration-300 group-hover:border-primary/40" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl group-hover:opacity-75" />
                  
                  {/* Image container with advanced effects */}
                  <div className="relative aspect-square overflow-hidden">
                    {/* Main image with zoom effect */}
                    <img
                      src="/sir.png?height=500&width=500"
                      alt="Yatendra Chaprana"
                      className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                    />
                    
                    {/* Gradient overlay for better text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    
                    {/* Decorative corner accents */}
                    <div className="absolute top-0 left-0 h-16 w-16 -translate-x-8 -translate-y-8 rotate-45 bg-primary/20 blur-xl transition-all duration-500 group-hover:bg-primary/30" />
                    <div className="absolute bottom-0 right-0 h-16 w-16 translate-x-8 translate-y-8 rotate-45 bg-primary/20 blur-xl transition-all duration-500 group-hover:bg-primary/30" />
                  </div>
                  
                  {/* Floating info card that appears on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full bg-background/80 backdrop-blur-sm transition-transform duration-500 group-hover:translate-y-0">
                    <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Yatendra Chaprana</h3>
                    <p className="text-sm text-muted-foreground">Founder & Visionary Leader</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Yatendra Chaprana</h3>
                <p className="text-lg font-semibold text-primary">Founder & Visionary Leader</p>
                <p className="text-muted-foreground">
                  Mr. Yatendra Chaprana is more than just a medical doctor; they are a visionary leader and a passionate Administrator for social change, relentlessly committed to tackling one of India's most pressing challenges: unemployment. As the driving force behind Boost a Step Ahead India, Mr. Yatendra leverages their unique blend of Mentor, Teacher, Strong Leader, strategic insight, compassionate leadership, analytical acumen and deep understanding of societal needs to empower individuals and strengthen communities.
                </p>
                <p className="text-muted-foreground">
                  With a profound belief in the untapped potential of India's youth, Mr. Chaprana recognized early in their career that true societal well-being extends beyond physical health to encompass economic stability and dignified livelihoods. This conviction led to the founding of Boost a Step Ahead India, an initiative dedicated to creating tangible pathways to employment and self-sufficiency across the nation.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Key Initiatives:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "Skill Development & Vocational Training",
                      "Entrepreneurship Nurturing",
                      "Connecting Talent to Opportunity",
                      "Community Empowerment"
                    ].map((initiative, index) => (
                      <li key={index} className="flex items-center space-x-2 text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{initiative}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Rest of the Team */}
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-full sm:max-w-[1000px] mx-auto mt-8">
            {[
              {
                name: "Ankit kumar",
                role: "CEO & CMO",
                image: "/2.png?height=300&width=300",
              },
              {
                name: "Ashutosh Kumar",
                role: "Chief Technical Officer & MERN Stack Developer",
                image: "/3.png?height=300&width=300",
              },
              {
                name: "Mayank Kumar Singh",
                role: "Full Stack Developer",
                image: "/4.png?height=300&width=300",
              },
            ].map((member, index) => (
              <div key={index} className="group">
                <div className="overflow-hidden rounded-2xl bg-background shadow-lg transition-all duration-300 group-hover:shadow-xl">
                  <div className="aspect-square overflow-hidden bg-muted/20">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="container mx-auto py-12 sm:py-16 px-2 sm:px-4 md:px-6 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Join Our Team</h2>
            <p className="text-muted-foreground md:text-lg">
              We're always looking for talented individuals who are passionate about transforming how people find jobs
              and build careers.
            </p>
            <div className="space-y-3">
              {[
                "Work with a diverse, global team of passionate professionals",
                "Flexible work arrangements and competitive benefits",
                "Opportunities for growth and professional development",
                "Make a meaningful impact on millions of careers"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 group">
                  <div className="rounded-full bg-primary/10 p-1 transition-colors group-hover:bg-primary/20">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors">{benefit}</p>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <Link href="/careers">
                <Button size="lg" className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  View Open Positions
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center group mt-8 md:mt-0">
            <div className="overflow-hidden rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl w-full maxw-xs sm:max-w-md md:max-w-lg">
              <img
                src="/1.jpg?height=400&width=600"
                alt="Our office"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="relative bg-primary py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="container mx-auto px-2 sm:px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl">
                Have Questions?
              </h2>
              <p className="max-w-[600px] text-primary-foreground/90 md:text-lg">
                Our team is here to help. Reach out to us for any inquiries or support.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm">
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
