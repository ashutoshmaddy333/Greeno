"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Greenotech Jobs ("the Platform"), you accept and agree to be bound by 
              the terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Greenotech Jobs is a job search platform that connects job seekers with employers. We provide 
              tools and services to facilitate job searching, application submission, and recruitment processes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">Account Creation</h3>
                <p className="text-muted-foreground">
                  To use certain features of the Platform, you must create an account. You agree to 
                  provide accurate, current, and complete information during registration and to update 
                  such information to keep it accurate, current, and complete.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Account Security</h3>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account credentials 
                  and for all activities that occur under your account. You agree to notify us immediately 
                  of any unauthorized use of your account.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">Job Seekers</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Provide accurate and truthful information in your profile and applications</li>
                  <li>Respect employer privacy and confidentiality</li>
                  <li>Use the Platform only for legitimate job search purposes</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Employers</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Post only legitimate job opportunities</li>
                  <li>Provide accurate job descriptions and requirements</li>
                  <li>Respect candidate privacy and data protection rights</li>
                  <li>Comply with equal opportunity employment laws</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
            <p className="text-muted-foreground mb-4">You may not use the Platform:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
              <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
              <li>For any obscene or immoral purpose</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Content and Intellectual Property</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">User Content</h3>
                <p className="text-muted-foreground">
                  You retain ownership of content you submit to the Platform. By submitting content, 
                  you grant us a non-exclusive, royalty-free, worldwide license to use, display, and 
                  distribute your content in connection with the Platform.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Platform Content</h3>
                <p className="text-muted-foreground">
                  The Platform and its original content, features, and functionality are owned by 
                  Greenotech Jobs and are protected by international copyright, trademark, patent, trade 
                  secret, and other intellectual property laws.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Privacy Policy</h2>
            <p className="text-muted-foreground">
              Your privacy is important to us. Please review our Privacy Policy, which also governs 
              your use of the Platform, to understand our practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimers and Limitations</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">Service Availability</h3>
                <p className="text-muted-foreground">
                  We do not guarantee that the Platform will be available at all times. We may 
                  experience hardware, software, or other problems or need to perform maintenance.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Job Matching</h3>
                <p className="text-muted-foreground">
                  We do not guarantee job placement or successful job matches. The Platform is a 
                  tool to facilitate connections between job seekers and employers.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  In no event shall Greenotech Jobs, nor its directors, employees, partners, agents, 
                  suppliers, or affiliates, be liable for any indirect, incidental, special, 
                  consequential, or punitive damages arising out of your use of the Platform.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account and bar access to the Platform immediately, 
              without prior notice or liability, under our sole discretion, for any reason whatsoever 
              and without limitation, including but not limited to a breach of the Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which 
              Greenotech Jobs operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any 
              time. If a revision is material, we will provide at least 30 days notice prior to any 
              new terms taking effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p><strong>Email:</strong> hrm@greenotechjobs.com</p>
              <p><strong>Address:</strong> Beta Plaza, S-40 Beta 1, Greater Noida, 201310, India</p>
              <p><strong>Phone:</strong> +91 9211490072</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
