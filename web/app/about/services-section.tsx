"use client";

import Image from "next/image";
import { useState } from "react";

type Service = {
  title: string;
  audience: string;
  description: string;
  image: string;
  href: string;
};

const services: Service[] = [
  {
    title: "School registration & approvals",
    audience: "Schools",
    description:
      "Register a new school, renew approvals, and meet national operating requirements.",
    image: "/svc-registration.jpg",
    href: "/services/registration",
  },
  {
    title: "Examinations & results",
    audience: "Students & parents",
    description:
      "Find exam timetables, sit national assessments, and access your results online.",
    image: "/svc-examinations.jpg",
    href: "/services/examinations",
  },
  {
    title: "Teacher services & payroll",
    audience: "Teachers",
    description:
      "Manage teacher registration, professional development, and payroll enquiries.",
    image: "/svc-teachers.jpg",
    href: "/services/teachers",
  },
];

export default function Services() {
  const [active, setActive] = useState(0);

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

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
        {/* left: accordion list */}
        <ul className="border-t border-border">
          {services.map((s, i) => {
            const isActive = i === active;
            const panelId = `service-panel-${i}`;
            return (
              <li key={s.href} className="border-b border-border">
                <h3>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-expanded={isActive}
                    aria-controls={panelId}
                    className="group flex w-full items-center gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <span
                      className={`flex-1 font-serif text-xl transition-colors sm:text-2xl ${
                        isActive
                          ? "text-primary"
                          : "text-foreground group-hover:text-primary"
                      }`}
                    >
                      {s.title}
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                        isActive ? "rotate-180 text-primary" : "text-muted"
                      }`}
                      aria-hidden
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </h3>

                {/* expanding detail */}
                <div
                  id={panelId}
                  className={`grid transition-all duration-300 ease-out ${
                    isActive
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pb-6">
                      <p className="max-w-md text-base leading-7 text-muted">
                        {s.description}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* right: image of active service */}
        <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-border shadow-sm lg:min-h-full">
          {services.map((s, i) => (
            <Image
              key={s.href}
              src={s.image}
              alt={s.title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={`object-cover transition-opacity duration-500 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              {services[active].audience}
            </span>
            <p className="mt-3 font-serif text-2xl leading-snug">
              {services[active].title}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
