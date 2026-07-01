import React from "react";
import { Link } from "react-router-dom";

const courseHighlights = [
  "14-week Splunk training",
  "Splunk basics & architecture",
  "Search Processing Language (SPL)",
  "Dashboards, reports & visualizations",
  "Alerts & monitoring",
  "Data inputs & indexing",
  "User management & security",
  "Advanced SPL & optimization",
  "Final capstone project",
];

const certificationFocus = [
  "Splunk Core Power User Certification Exam",
  "Splunk Enterprise Certified Admin Exam",
];

const schedule = [
  {
    date: "October 31st",
    title: "Orientation Date",
    description:
      "Live orientation session to introduce the Splunk training program, learning path, expectations, certification goals, and enrollment process.",
  },
  {
    date: "November 14th to December 19th",
    title: "Splunk Core Power User Certification Preparation",
    description:
      "Students begin the first training phase focused on Splunk fundamentals, searching, SPL, dashboards, reports, fields, alerts, and real-world use cases.",
  },
  {
    date: "Two Weeks Break",
    title: "Power User Certification Exam & Holidays",
    description:
      "Students use this break to revise, complete practice tasks, prepare for the Splunk Core Power User Certification Exam, and observe the holiday period.",
  },
  {
    date: "January 9th to February 27th",
    title: "Splunk Enterprise Certified Admin Training",
    description:
      "The second training phase focuses on Splunk administration, data inputs, indexing, user management, security, performance, deployment, and optimization.",
  },
  {
    date: "March 13th",
    title: "Admin Exam",
    description:
      "Final preparation and exam focus for students taking the Splunk Enterprise Certified Admin Exam.",
  },
];

const deliverables = [
  "Weekly assignments",
  "Hands-on Splunk search tasks",
  "Dashboard and report practice",
  "Alert configuration practice",
  "Final project: Complete Splunk solution from data ingestion to dashboards and alerts",
];

export default function SplunkOrientation() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50 to-white">
        <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-[300px] w-[300px] rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-10 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm">
                T.O Analytics LLC Orientation Program
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
                T.O Orientation
                <span className="mt-3 block bg-gradient-to-r from-purple-800 to-fuchsia-600 bg-clip-text text-3xl text-transparent md:text-5xl">
                  Introduction to Splunk
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                Join our Introduction to Splunk Orientation and discover how
                Splunk helps with data collection, indexing, searching,
                dashboards, alerts, IT operations, security, and business
                analytics.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="https://www.to-analytics.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-gradient-to-r from-purple-800 to-fuchsia-600 px-7 py-4 text-center font-bold text-white shadow-lg shadow-purple-500/25 transition hover:scale-[1.02]"
                >
                  Register Now
                </a>

                <a
                  href="mailto:t.oanalyticsllc@gmail.com"
                  className="rounded-2xl border border-purple-200 bg-white px-7 py-4 text-center font-bold text-purple-800 shadow-sm transition hover:bg-purple-50"
                >
                  Contact for Enrollment
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
                <span className="rounded-full bg-purple-100 px-4 py-2 text-purple-800">
                  $3,500 Tuition
                </span>
                <span className="rounded-full bg-fuchsia-100 px-4 py-2 text-fuchsia-800">
                  Zelle Payment
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2">
                  Poppins-style Clean Layout
                </span>
              </div>
            </div>

            {/* SUMMARY CARD */}
            <div className="rounded-[2rem] border border-purple-100 bg-white p-6 shadow-2xl shadow-purple-900/10">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-purple-950 via-purple-800 to-fuchsia-700 p-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-100">
                  Program Schedule
                </p>

                <h2 className="mt-3 text-3xl font-extrabold">
                  Orientation starts October 31st
                </h2>

                <p className="mt-4 text-purple-100">
                  A structured Splunk learning path focused on Power User and
                  Enterprise Admin certification preparation.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="font-bold">November 14th to December 19th</p>
                    <p className="text-sm text-purple-100">
                      Splunk Core Power User Certification Exam preparation
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="font-bold">January 9th to February 27th</p>
                    <p className="text-sm text-purple-100">
                      Splunk Enterprise Certified Admin Exam preparation
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="font-bold">March 13th</p>
                    <p className="text-sm text-purple-100">Admin Exam</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-purple-100 p-4">
                  <p className="text-sm text-slate-500">Tuition Fee</p>
                  <p className="mt-1 text-3xl font-extrabold text-slate-950">
                    $3,500
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-100 p-4">
                  <p className="text-sm text-slate-500">Payment Option</p>
                  <p className="mt-1 font-bold text-slate-950">Zelle</p>
                  <p className="mt-1 break-all text-sm text-slate-600">
                    t.oanalyticsllc@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICATION FOCUS */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10">
        <div className="mb-10 text-center">
          <p className="font-bold uppercase tracking-[0.25em] text-purple-700">
            Certification Focus
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-950 md:text-5xl">
            Built around real Splunk certification goals
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-slate-600">
            This orientation introduces the training path, certification
            expectations, schedule, payment details, and the practical skills
            students will build during the program.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {certificationFocus.map((item, index) => (
            <div
              key={item}
              className="rounded-3xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-7 shadow-lg shadow-purple-900/5"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-700 text-2xl font-black text-white">
                {index + 1}
              </div>
              <h3 className="text-2xl font-extrabold text-slate-950">
                {item}
              </h3>
              <p className="mt-3 text-slate-600">
                Students will be guided through the core knowledge areas,
                hands-on practice, exam preparation, and project-based learning
                needed to become more confident with Splunk.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* COURSE HIGHLIGHTS */}
      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="font-bold uppercase tracking-[0.25em] text-fuchsia-300">
                Course Highlights
              </p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-5xl">
                What students will learn
              </h2>
              <p className="mt-5 text-slate-300">
                The program covers beginner-friendly Splunk foundations and
                gradually moves into dashboards, alerts, security, indexing,
                optimization, and administration.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {courseHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="mb-3 h-2 w-10 rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-400" />
                  <p className="font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SCHEDULE */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10">
        <div className="mb-12">
          <p className="font-bold uppercase tracking-[0.25em] text-purple-700">
            Training Schedule
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-950 md:text-5xl">
            Important program dates
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-5 top-0 hidden h-full w-px bg-purple-200 md:block" />

          <div className="space-y-6">
            {schedule.map((item, index) => (
              <div
                key={item.date}
                className="relative rounded-3xl border border-purple-100 bg-white p-6 shadow-lg shadow-purple-900/5 md:ml-12"
              >
                <div className="absolute -left-[3.25rem] top-6 hidden h-10 w-10 items-center justify-center rounded-full bg-purple-700 text-sm font-bold text-white md:flex">
                  {index + 1}
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xl font-extrabold text-purple-800">
                      {item.date}
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-4xl leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-purple-100 px-4 py-2 text-sm font-bold text-purple-800">
                    Phase {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DELIVERABLES + PAYMENT */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-purple-100 bg-white p-8 shadow-xl shadow-purple-900/5">
              <p className="font-bold uppercase tracking-[0.25em] text-purple-700">
                Deliverables
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-950">
                What each student receives
              </h2>

              <ul className="mt-8 space-y-4">
                {deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-slate-700">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-700 text-xs text-white">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl shadow-purple-900/20">
              <p className="font-bold uppercase tracking-[0.25em] text-fuchsia-300">
                Enrollment Details
              </p>
              <h2 className="mt-3 text-3xl font-extrabold">
                Secure your seat for the Splunk Orientation
              </h2>

              <div className="mt-8 grid gap-4">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-sm text-slate-300">Course Tuition Fee</p>
                  <p className="mt-1 text-4xl font-extrabold">$3,500</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-sm text-slate-300">Payment Option</p>
                  <p className="mt-1 text-xl font-bold">Zelle</p>
                  <p className="mt-1 break-all text-slate-200">
                    t.oanalyticsllc@gmail.com
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-sm text-slate-300">Website</p>
                  <a
                    href="https://www.to-analytics.com"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-all text-xl font-bold text-fuchsia-200 underline"
                  >
                    https://www.to-analytics.com
                  </a>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="mailto:t.oanalyticsllc@gmail.com"
                  className="rounded-2xl bg-white px-6 py-4 text-center font-bold text-purple-900"
                >
                  Email for Enrollment
                </a>

                <Link
                  to="/contact"
                  className="rounded-2xl border border-white/20 px-6 py-4 text-center font-bold text-white hover:bg-white/10"
                >
                  Contact Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10">
        <div className="mb-10 text-center">
          <p className="font-bold uppercase tracking-[0.25em] text-purple-700">
            Quick Questions
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-950 md:text-5xl">
            Orientation FAQ
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-950">
              Who is this orientation for?
            </h3>
            <p className="mt-3 text-slate-600">
              It is for beginners, IT professionals, security learners, data
              analysts, and anyone who wants to understand Splunk and prepare
              for certification.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-950">
              Is there a certification path?
            </h3>
            <p className="mt-3 text-slate-600">
              Yes. The program focuses on the Splunk Core Power User
              Certification Exam and the Splunk Enterprise Certified Admin
              Exam.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-950">
              Will students do practical work?
            </h3>
            <p className="mt-3 text-slate-600">
              Yes. Students will receive weekly assignments and complete a final
              project involving data ingestion, dashboards, and alerts.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-950">
              How do students enroll?
            </h3>
            <p className="mt-3 text-slate-600">
              Students can register through the website or contact T.O Analytics
              LLC directly using the enrollment email.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}