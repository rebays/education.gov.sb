import { MediaAccordion, type MediaAccordionItem } from "@/components/ui/accordion"

const services: MediaAccordionItem[] = [
  {
    title: "School registration & approvals",
    tag: "Schools",
    description:
      "Register a new school, renew approvals, and meet national operating requirements.",
    image: "/svc-registration.jpg",
  },
  {
    title: "Examinations & results",
    tag: "Students & parents",
    description:
      "Find exam timetables, sit national assessments, and access your results online.",
    image: "/svc-examinations.jpg",
  },
  {
    title: "Teacher services & payroll",
    tag: "Teachers",
    description:
      "Manage teacher registration, professional development, and payroll enquiries.",
    image: "/svc-teachers.jpg",
  },
]

export default function Services() {
  return (
    <div className="mx-auto w-full max-w-8xl px-6 py-20 sm:py-24">
      {/* header */}
      <div className="max-w-2xl">
        <h2 className="font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          Services.
        </h2>
        <p className="mt-4 text-lg leading-8 text-muted">
          Everyday services for students, schools, teachers, and the public —
          select a service to learn more.
        </p>
      </div>

      <MediaAccordion items={services} className="mt-12" />
    </div>
  )
}
