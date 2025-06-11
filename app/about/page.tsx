import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Award, CheckCircle, Clock, Globe, Heart, Users, Building, Briefcase } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Our Mission is to <span className="text-primary">Connect</span> Talent
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  We're on a mission to revolutionize how people find jobs and how companies find talent. Our platform
                  connects the right people with the right opportunities.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/jobs">
                  <Button size="lg" className="group">
                    Explore Jobs
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-[350px] overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-4 md:h-[450px] md:w-[450px]">
                <img
                  src="/1.jpg?height=450&width=450"
                  alt="Our team"
                  className="absolute inset-0 h-full w-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md">
            <Users className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-3xl font-bold">2M+</h3>
            <p className="text-center text-muted-foreground">Registered Users</p>
          </Card>
          <Card className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md">
            <Building className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-3xl font-bold">50K+</h3>
            <p className="text-center text-muted-foreground">Partner Companies</p>
          </Card>
          <Card className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md">
            <Briefcase className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-3xl font-bold">500K+</h3>
            <p className="text-center text-muted-foreground">Jobs Posted</p>
          </Card>
          <Card className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md">
            <CheckCircle className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-3xl font-bold">1M+</h3>
            <p className="text-center text-muted-foreground">Successful Placements</p>
          </Card>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Story</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Greenotech Jobs was founded with a vision to revolutionize India's employment landscape through sustainable technology and skill development.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">The Genesis of Greenotech Jobs</h3>
              <p className="text-muted-foreground">
                Born from the vision of Mr. Yatendra Chaprana, Greenotech Jobs emerged as a response to India's pressing unemployment challenges. Our founder, combining medical expertise with a deep understanding of societal needs, recognized that sustainable employment solutions required more than just job listings – they needed a comprehensive approach to skill development and community empowerment.
              </p>
              <p className="text-muted-foreground">
                What started as Boost a Step Ahead India has evolved into Greenotech Jobs, a platform that bridges the gap between traditional employment and emerging green technology sectors. Our journey began with a simple yet powerful mission: to create meaningful employment opportunities while promoting sustainable practices in the job market.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Our Evolution & Impact</h3>
              <p className="text-muted-foreground">
                Today, Greenotech Jobs stands at the forefront of employment innovation, combining traditional job placement with cutting-edge green technology opportunities. We've expanded our services to include:
              </p>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                <li>Specialized training programs in green technology sectors</li>
                <li>Partnerships with sustainable businesses and organizations</li>
                <li>Community-focused skill development initiatives</li>
                <li>Innovative job matching algorithms for better placement</li>
                <li>Entrepreneurship support for green business ventures</li>
              </ul>
              <p className="text-muted-foreground">
                Our platform has become a catalyst for change, helping thousands of individuals find meaningful employment while contributing to India's sustainable development goals. Through our unique blend of technology, community engagement, and environmental consciousness, we're not just creating jobs – we're building a greener, more sustainable future for India's workforce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="container mx-auto py-16 px-4 md:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Core Values</h2>
          <p className="mt-4 text-muted-foreground md:text-lg">These principles guide everything we do at JobConnect</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Meet Our Leadership Team</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              The passionate individuals driving our mission forward
            </p>
          </div>

          {/* Founder Spotlight */}
          <div className="mt-12 mb-16">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col items-center">
                <div className="overflow-hidden rounded-lg bg-background">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src="/y.jpg?height=500&width=500"
                      alt="Yatendra Chaprana"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <h3 className="text-2xl font-bold">Yatendra Chaprana</h3>
                <p className="text-lg font-semibold text-primary">Founder & Visionary Leader</p>
                <p className="text-muted-foreground">
                  Mr. Yatendra Chaprana is more than just a medical doctor; they are a visionary leader and a passionate Administrator for social change, relentlessly committed to tackling one of India's most pressing challenges: unemployment. As the driving force behind Boost a Step Ahead India, Mr. Yatendra leverages their unique blend of Mentor, Teacher, Strong Leader, strategic insight, compassionate leadership, analytical acumen and deep understanding of societal needs to empower individuals and strengthen communities.
                </p>
                <p className="text-muted-foreground">
                  With a profound belief in the untapped potential of India's youth, Mr. Chaprana recognized early in their career that true societal well-being extends beyond physical health to encompass economic stability and dignified livelihoods. This conviction led to the founding of Boost a Step Ahead India, an initiative dedicated to creating tangible pathways to employment and self-sufficiency across the nation.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Initiatives:</h4>
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    <li>Skill Development & Vocational Training</li>
                    <li>Entrepreneurship Nurturing</li>
                    <li>Connecting Talent to Opportunity</li>
                    <li>Community Empowerment</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  Mr. Chaprana's innovative approach combines data-driven strategies, grassroots engagement, and technological integration with a profound human touch. Their leadership ensures that Boost a Step Ahead India not only provides immediate relief but also lays the groundwork for long-term economic resilience and growth, contributing significantly to a more prosperous and equitable India.
                </p>
              </div>
            </div>
          </div>

          {/* Rest of the Team */}
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-[1000px] mx-auto">
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
                <div className="overflow-hidden rounded-lg bg-background">
                  <div className="aspect-square overflow-hidden bg-muted/20 rounded-lg">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105 rounded-lg"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="container mx-auto py-16 px-4 md:px-6 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Join Our Team</h2>
            <p className="text-muted-foreground md:text-lg">
              We're always looking for talented individuals who are passionate about transforming how people find jobs
              and build careers.
            </p>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                <p>Work with a diverse, global team of passionate professionals</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                <p>Flexible work arrangements and competitive benefits</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                <p>Opportunities for growth and professional development</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                <p>Make a meaningful impact on millions of careers</p>
              </div>
            </div>
            <div className="pt-4">
              <Link href="/careers">
                <Button size="lg" className="group">
                  View Open Positions
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="overflow-hidden rounded-lg">
              <img
                src="/1.jpg?height=400&width=600"
                alt="Our office"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 md:px-6">
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
                <Button size="lg" variant="secondary" className="group">
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
