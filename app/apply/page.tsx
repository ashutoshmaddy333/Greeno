import ApplicationForm from "@/components/application-form"

export default function ApplyPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
  Apply for Green Tech Jobs
</h1>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete the application form below to start your journey towards a sustainable tech career. Our team will
            review your application and match you with suitable opportunities.
          </p>
        </div>

        <ApplicationForm />
      </div>
    </div>
  )
}
