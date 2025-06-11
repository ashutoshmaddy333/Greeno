import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check, HelpCircle, Video } from "lucide-react"

export default function InterviewTips() {
  const commonQuestions = [
    {
      question: "Tell me about yourself",
      answer:
        "Focus on your professional background, relevant skills, and what makes you a good fit for the role. Keep it concise (1-2 minutes) and tailor it to the position you're applying for.",
    },
    {
      question: "Why do you want to work here?",
      answer:
        "Research the company beforehand and mention specific aspects that appeal to you, such as their mission, culture, products, or growth opportunities. Show how your values align with theirs.",
    },
    {
      question: "What are your strengths and weaknesses?",
      answer:
        "For strengths, highlight skills relevant to the job. For weaknesses, mention real areas for improvement, but focus on how you're actively working to address them.",
    },
    {
      question: "Where do you see yourself in 5 years?",
      answer:
        "Show ambition and a desire for growth while being realistic. Emphasize your interest in developing your skills and taking on more responsibilities within the company.",
    },
    {
      question: "Tell me about a challenge you faced at work and how you handled it",
      answer:
        "Use the STAR method (Situation, Task, Action, Result) to structure your answer. Choose an example that demonstrates problem-solving, teamwork, or leadership skills.",
    },
  ]

  return (
    <section className="container mx-auto py-16 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Interview Preparation</h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            Ace your next interview with these expert tips and common questions
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Common Interview Questions</CardTitle>
            <CardDescription>How to answer the most frequently asked interview questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {commonQuestions.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Interview Preparation Checklist</CardTitle>
              <CardDescription>Essential steps to prepare for your interview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Research the company</p>
                    <p className="text-sm text-muted-foreground">
                      Understand their products, services, culture, and recent news
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Review the job description</p>
                    <p className="text-sm text-muted-foreground">
                      Identify key skills and prepare examples that demonstrate them
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Prepare your STAR stories</p>
                    <p className="text-sm text-muted-foreground">
                      Situation, Task, Action, Result - for behavioral questions
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Practice common questions</p>
                    <p className="text-sm text-muted-foreground">Rehearse your answers but keep them conversational</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Prepare questions to ask</p>
                    <p className="text-sm text-muted-foreground">
                      Thoughtful questions show your interest and engagement
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Plan your outfit and logistics</p>
                    <p className="text-sm text-muted-foreground">
                      Dress appropriately and plan your route or test your video setup
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Video Interview Tips</CardTitle>
              <CardDescription>Special considerations for remote interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Video className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Test your technology</p>
                    <p className="text-sm text-muted-foreground">
                      Check your camera, microphone, and internet connection beforehand
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Video className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Set up a professional background</p>
                    <p className="text-sm text-muted-foreground">
                      Choose a clean, uncluttered space or use a simple virtual background
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Video className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Position your camera at eye level</p>
                    <p className="text-sm text-muted-foreground">This creates a more natural conversation experience</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Video className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Dress professionally from head to toe</p>
                    <p className="text-sm text-muted-foreground">
                      You never know when you might need to stand up during the call
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
