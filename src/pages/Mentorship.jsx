import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import {
  FaClock,
  FaLaptop,
  FaCheckCircle,
  FaCreditCard,
  FaShieldAlt,
  FaUserGraduate,
  FaBriefcase,
  FaRocket,
  FaHeadset,
  FaArrowRight,
  FaCartPlus,
  FaStar,
} from "react-icons/fa";
import { FaCalendarDays } from "react-icons/fa6";
import CartItemContext from "../context/CartItemContext";

const pageMotion = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.12,
    },
  },
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 45,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: "easeOut",
    },
  },
};

const floatingMotion = {
  animate: {
    y: [0, -12, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const benefits = [
  "Weekly 1-on-1 mentorship sessions on Zoom",
  "Splunk and cybersecurity labs with practical guidance",
  "Resume and LinkedIn profile improvement",
  "Mock interviews for technical and behavioral questions",
  "Asynchronous support through Slack or Discord",
  "Job search playbook and referral guidance",
];

const processSteps = [
  {
    title: "Apply",
    text: "Choose a mentorship plan and secure your spot.",
  },
  {
    title: "Intro Call",
    text: "We understand your goal, background and timeline.",
  },
  {
    title: "Skill Check",
    text: "We review your current level and learning gaps.",
  },
  {
    title: "Custom Plan",
    text: "You get a guided path built around your target role.",
  },
  {
    title: "Weekly Sessions",
    text: "Hands-on labs, accountability and mentor feedback.",
  },
  {
    title: "Interview Prep",
    text: "Resume, LinkedIn, mock interviews and job support.",
  },
];

const testimonials = [
  {
    quote:
      "Landed a SOC Analyst role in just 7 weeks — coming from customer service!",
    name: "K.O.",
    title: "SOC Analyst",
  },
  {
    quote:
      "The mentorship helped me break into a Splunk Admin role with confidence.",
    name: "V.D.",
    title: "Splunk Admin",
  },
  {
    quote:
      "From zero IT experience to job-ready in 5 weeks. The labs and 1:1 sessions were game-changers.",
    name: "M.A.",
    title: "Cybersecurity Analyst",
  },
];

const pricingPlans = [
  {
    id: 110,
    name: "Starter",
    price: 300,
    duration: "4 Weeks",
    tag: "Foundation",
    description:
      "Best for learners who need basic direction, structure and resume support.",
    includes: [
      "Basic mentorship support",
      "Resume review",
      "2 mock interviews",
      "Access to community chat",
    ],
  },
  {
    id: 111,
    name: "Standard",
    price: 500,
    duration: "5 Weeks",
    tag: "Most Popular",
    featured: true,
    description:
      "Best for serious learners who want full mentorship, labs and weekly guidance.",
    includes: [
      "Full mentorship support",
      "Splunk and cybersecurity labs",
      "Resume and LinkedIn review",
      "Weekly 1-on-1 calls",
      "Slack support",
    ],
  },
  {
    id: 112,
    name: "Pro / Placement",
    price: 750,
    duration: "8 Weeks",
    tag: "Career Push",
    description:
      "Best for learners who want deeper support until interviews and job readiness.",
    includes: [
      "Advanced Splunk projects",
      "Job referral guidance",
      "Interview preparation",
      "Ongoing support until job offer",
    ],
  },
];

const faqs = [
  {
    question: "How long until I’m job-ready?",
    answer:
      "Most mentees become job-ready within 8–12 weeks depending on consistency, practice time and prior experience.",
  },
  {
    question: "What if I miss a session?",
    answer:
      "You can reschedule or receive an asynchronous review for that week.",
  },
  {
    question: "Do you help with Splunk certifications?",
    answer:
      "Yes. You receive certification guidance, practical labs and study direction.",
  },
  {
    question: "I’m new to IT. Can I join?",
    answer:
      "Yes. The mentorship is beginner-friendly and personalized to your pace.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes. Deferral or partial refund options may be available if mentorship is cancelled early.",
  },
];

const Mentorship = () => {
  const { cartItem = [], setCartItem } = useContext(CartItemContext);
  const navigate = useNavigate();

  const addToCart = (id, name, price) => {
    const alreadyInCart = cartItem.some((item) => item.id === id);

    if (!alreadyInCart) {
      toast.success(`${name} successfully added to cart`);

      setCartItem((prev) => [
        ...(prev || []),
        {
          id,
          name,
          price,
          type: "mentorship",
        },
      ]);

      return;
    }

    toast.info("This plan is already in your cart");
    navigate("/checkout");
  };

  useEffect(() => {
    localStorage.setItem("COURSE-CART", JSON.stringify(cartItem));
  }, [cartItem]);

  return (
    <>
      <motion.main
        variants={pageMotion}
        initial="hidden"
        animate="visible"
        className="overflow-hidden bg-white text-slate-950"
      >
        {/* ================= HERO ================= */}
        <section className="relative min-h-screen overflow-hidden bg-slate-950 px-6 pb-24 pt-36 text-white md:px-16 lg:px-24">
          <div className="absolute left-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full bg-BLUE opacity-40 blur-[140px]" />
          <div className="absolute bottom-[-200px] right-[-160px] h-[520px] w-[520px] rounded-full bg-cyan-400 opacity-20 blur-[150px]" />
          <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[160px]" />

          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div variants={fadeUp}>
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-BLUE">
                  <FaShieldAlt />
                </span>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-white/75">
                  Cybersecurity / Splunk Mentorship
                </span>
              </div>

              <h1 className="max-w-5xl text-5xl font-black leading-[1.03] tracking-tight md:text-6xl xl:text-7xl">
                Break into Cybersecurity & Splunk with 1-on-1 Mentorship.
              </h1>

              <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-white/70 md:text-xl">
                A practical 14-week mentorship built for beginners and career
                changers. Get hands-on labs, resume support, LinkedIn prep,
                mock interviews and guided support until you become job-ready.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() =>
                    addToCart(111, "Standard Mentorship", 500)
                  }
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 font-black text-BLUE shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:bg-slate-100"
                >
                  Apply for Mentorship
                  <FaArrowRight className="transition group-hover:translate-x-1" />
                </button>

                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-8 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-BLUE"
                >
                  View Curriculum & Pricing
                </a>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { value: "200+", label: "Learners trained" },
                  { value: "14", label: "Week roadmap" },
                  { value: "1:1", label: "Mentor support" },
                  { value: "8–12", label: "Weeks to job-ready" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
                  >
                    <h3 className="text-3xl font-black">{stat.value}</h3>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/50">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="relative">
              <div className="absolute inset-0 rotate-6 rounded-[3rem] bg-white/10" />

              <div className="relative rounded-[3rem] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
                <div className="rounded-[2.4rem] bg-white p-6 text-slate-950">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.25em] text-BLUE">
                        Mentorship Plan
                      </p>
                      <h2 className="mt-2 text-3xl font-black">
                        Standard
                      </h2>
                    </div>

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-BLUE text-2xl text-white">
                      <FaUserGraduate />
                    </div>
                  </div>

                  <div className="mt-8 rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-500">
                      Career Roadmap Progress
                    </p>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full w-[78%] rounded-full bg-BLUE" />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <FaLaptop className="text-xl text-BLUE" />
                        <p className="mt-3 text-sm font-black">
                          Hands-on Labs
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <FaBriefcase className="text-xl text-BLUE" />
                        <p className="mt-3 text-sm font-black">
                          Job Prep
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      "Weekly 1-on-1 sessions",
                      "Resume and LinkedIn review",
                      "Mock interviews",
                      "Job search support",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <FaCheckCircle className="text-BLUE" />
                        <p className="font-bold text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      addToCart(111, "Standard Mentorship", 500)
                    }
                    className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-BLUE px-6 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:opacity-90"
                  >
                    <FaCartPlus />
                    Add Standard Plan
                  </button>
                </div>
              </div>

              <motion.div
                variants={floatingMotion}
                animate="animate"
                className="absolute -bottom-8 -left-4 hidden rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-xl md:block"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                  Includes
                </p>
                <p className="mt-2 text-xl font-black">Mock Interviews</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ================= BENEFITS ================= */}
        <section className="bg-white px-6 py-24 md:px-16 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-BLUE">
                What You’ll Get
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Everything you need to become job-ready.
              </h2>
              <p className="mt-5 text-lg font-medium leading-8 text-slate-600">
                This is not just a course. It is a guided mentorship experience
                with support, accountability and career preparation.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {benefits.map((item, index) => (
                <motion.div
                  key={item}
                  variants={fadeUp}
                  className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-BLUE hover:shadow-2xl hover:shadow-slate-100"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-BLUE text-white">
                    <FaCheckCircle />
                  </div>

                  <h3 className="text-xl font-black text-slate-950">
                    {item}
                  </h3>

                  <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
                    Built to help you learn faster, stay accountable and
                    confidently prepare for real tech opportunities.
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="bg-slate-50 px-6 py-24 md:px-16 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <motion.div variants={fadeUp} className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-BLUE">
                How It Works
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                A clear path from beginner to confident candidate.
              </h2>
            </motion.div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  variants={fadeUp}
                  className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-100"
                >
                  <div className="absolute right-5 top-5 text-7xl font-black text-slate-100">
                    {index + 1}
                  </div>

                  <div className="relative z-10">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-BLUE text-white">
                      <FaRocket />
                    </div>

                    <h3 className="text-2xl font-black text-slate-950">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                      {step.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SUCCESS STORIES ================= */}
        <section className="bg-white px-6 py-24 md:px-16 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-BLUE">
                Success Stories
              </p>
              <h2 className="mt-4 text-4xl font-black md:text-5xl">
                Real mentorship. Real confidence.
              </h2>
            </motion.div>

            <div className="mt-14 grid gap-7 md:grid-cols-3">
              {testimonials.map((item) => (
                <motion.div
                  key={item.name}
                  variants={fadeUp}
                  className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-100"
                >
                  <div className="mb-5 flex gap-1 text-BLUE">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar key={star} />
                    ))}
                  </div>

                  <p className="text-lg font-bold leading-8 text-slate-800">
                    “{item.quote}”
                  </p>

                  <div className="mt-7 border-t border-slate-100 pt-5">
                    <p className="font-black text-slate-950">{item.name}</p>
                    <p className="mt-1 text-sm font-bold text-BLUE">
                      {item.title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= PRICING ================= */}
        <section
          id="pricing"
          className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white md:px-16 lg:px-24"
        >
          <div className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-BLUE opacity-30 blur-[130px]" />
          <div className="absolute bottom-[-180px] right-[-160px] h-[460px] w-[460px] rounded-full bg-cyan-400 opacity-20 blur-[150px]" />

          <div className="relative mx-auto max-w-7xl">
            <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-200">
                Pricing & Plans
              </p>
              <h2 className="mt-4 text-4xl font-black md:text-5xl">
                Choose the mentorship plan that fits your goal.
              </h2>
              <p className="mt-5 text-lg font-medium leading-8 text-white/65">
                Start small or go deeper with full career preparation and
                placement-focused support.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-7 lg:grid-cols-3">
              {pricingPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  variants={fadeUp}
                  className={`relative rounded-[2rem] p-[1px] ${
                    plan.featured
                      ? "bg-gradient-to-br from-white via-cyan-200 to-BLUE"
                      : "bg-white/10"
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-BLUE shadow-xl">
                      Most Popular
                    </div>
                  )}

                  <div className="flex h-full flex-col rounded-[2rem] bg-white p-7 text-slate-950">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.25em] text-BLUE">
                        {plan.tag}
                      </p>

                      <h3 className="mt-4 text-3xl font-black">
                        {plan.name}
                      </h3>

                      <p className="mt-3 min-h-[56px] text-sm font-medium leading-7 text-slate-600">
                        {plan.description}
                      </p>

                      <div className="mt-6 flex items-end gap-2">
                        <span className="text-5xl font-black text-slate-950">
                          ${plan.price}
                        </span>
                        <span className="pb-2 text-sm font-bold text-slate-500">
                          / {plan.duration}
                        </span>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                          <FaClock className="text-BLUE" />
                          {plan.duration}
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                          <FaCalendarDays className="text-BLUE" />
                          Weekly
                        </span>
                      </div>

                      <ul className="mt-7 space-y-4">
                        {plan.includes.map((item) => (
                          <li
                            key={item}
                            className="flex gap-3 text-sm font-semibold leading-7 text-slate-700"
                          >
                            <FaCheckCircle className="mt-1 shrink-0 text-BLUE" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => addToCart(plan.id, plan.name, plan.price)}
                      className={`mt-8 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 font-black transition duration-300 hover:-translate-y-1 ${
                        plan.featured
                          ? "bg-BLUE text-white shadow-xl shadow-blue-200 hover:opacity-90"
                          : "bg-slate-950 text-white hover:bg-BLUE"
                      }`}
                    >
                      <FaCartPlus />
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section className="bg-white px-6 py-24 md:px-16 lg:px-24">
          <div className="mx-auto max-w-4xl">
            <motion.div variants={fadeUp} className="text-center">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-BLUE">
                Questions
              </p>
              <h2 className="mt-4 text-4xl font-black md:text-5xl">
                Frequently Asked Questions
              </h2>
            </motion.div>

            <div className="mt-12 space-y-4">
              {faqs.map((faq) => (
                <motion.details
                  key={faq.question}
                  variants={fadeUp}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm open:shadow-xl open:shadow-slate-100"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-black text-slate-950">
                    {faq.question}
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-BLUE transition group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  <p className="mt-4 leading-8 text-slate-600">
                    {faq.answer}
                  </p>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="bg-slate-50 px-6 py-24 md:px-16 lg:px-24">
          <motion.div
            variants={fadeUp}
            className="mx-auto max-w-7xl overflow-hidden rounded-[2.7rem] bg-BLUE px-8 py-16 text-center text-white shadow-2xl shadow-blue-200 md:px-16"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl text-BLUE">
              <FaHeadset />
            </div>

            <p className="text-sm font-black uppercase tracking-[0.3em] text-white/70">
              Start Today
            </p>

            <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Ready to start your cybersecurity career?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-white/80">
              Join the mentorship, follow a clear roadmap and start preparing
              for real tech opportunities with guided support.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={() =>
                  addToCart(111, "Standard Mentorship", 500)
                }
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 font-black text-BLUE transition duration-300 hover:-translate-y-1"
              >
                Apply for Mentorship
                <FaArrowRight />
              </button>

              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/30 px-8 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-BLUE"
              >
                Compare Plans
              </a>
            </div>
          </motion.div>
        </section>
      </motion.main>

      <Toaster position="top-center" richColors />
    </>
  );
};

export default Mentorship;

// import { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { Toaster, toast } from "sonner";
// import { FaClock, FaCreditCard, FaLaptop, FaCheckCircle } from "react-icons/fa";
// import { FaCalendarDays } from "react-icons/fa6";
// import CartItemContext from "../context/CartItemContext";
// import { useStateContext } from "../context/ContextProvider";

// const Mentorship = () => {
//   const { FullScreen } = useStateContext();
//   const { cartItem, setCartItem } = useContext(CartItemContext);
//   const navigate = useNavigate();
//   const [mentorship, setMentorship] = useState(false);

//   const addToCart = (id, name, price) => {
//     if (!cartItem.some((item) => item.id === id)) {
//       toast.success(`${name} successfully added to cart`);
//       setCartItem((prev) => [...prev, { id, name, price }]);
//     } else {
//       toast.error("Already in the cart");
//       setTimeout(() => {
//         navigate("/checkout");
//       }, 2500);
//     }
//   };

//   useEffect(() => {
//     localStorage.setItem("COURSE-CART", JSON.stringify(cartItem));
//   }, [cartItem]);

//   return (
//     <>
//       <section className="bg-BLUE text-white text-center pt-48 py-24 px-4 md:px-10">
//         <h1 className="font-bold text-3xl md:text-5xl mb-4">
//           Break into Cybersecurity/Splunk in 14 Weeks with 1-on-1 Mentorship
//         </h1>
//         <p className="max-w-2xl mx-auto text-sm md:text-lg">
//           Hands-on 1-on-1 mentorship, labs, resume + LinkedIn prep, and interview
//           coaching designed for beginners and career-changers.
//         </p>
//         <div className="flex justify-center gap-4 mt-8">
//           <button
//             onClick={() => addToCart(111, "Standard Mentorship", 500)}
//             className="bg-white text-BLUE font-bold px-6 py-3 rounded-lg hover:bg-gray-200"
//           >
//             Apply for Mentorship
//           </button>
//           <a
//             href="#pricing"
//             className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-BLUE font-bold"
//           >
//             View Curriculum & Pricing
//           </a>
//         </div>
//         <div className="flex justify-center gap-6 mt-10 text-sm opacity-90">
//           <p>Trained 200+ learners</p>
//           <p>5+ years mentoring</p>
//           <p>Avg time to offer: 8–12 weeks</p>
//         </div>
//       </section>

//       {/* Offer Definition */}
//       <section className="p-4 md:p-10 text-center">
//         <h2 className="text-2xl md:text-4xl font-bold mb-6">
//           What You’ll Get
//         </h2>
//         <ul className="text-left max-w-2xl mx-auto space-y-3 text-gray-700">
//           {[
//             "Weekly 1:1 mentorship sessions (Zoom)",
//             "Splunk & cybersecurity labs with Git repo access",
//             "Resume + LinkedIn overhaul",
//             "Mock interviews (behavioral + technical)",
//             "Asynchronous mentor support via Slack/Discord (48-hr response)",
//             "Job search playbook + referral guidance",
//           ].map((item, idx) => (
//             <li key={idx} className="flex items-center gap-3">
//               <FaCheckCircle className="text-BLUE" />
//               {item}
//             </li>
//           ))}
//         </ul>
//       </section>

//       {/* Process Section */}
//       <section className="bg-gray-100 py-16 px-4 md:px-10">
//         <h2 className="text-center text-2xl md:text-4xl font-bold mb-10">
//           How It Works
//         </h2>
//         <div className="grid md:grid-cols-6 grid-cols-2 gap-6 text-center text-sm md:text-base font-medium">
//           {[
//             "Apply",
//             "Free Intro Call",
//             "Skills Baseline",
//             "Customized Plan",
//             "Weekly Sessions",
//             "Interview & Offer",
//           ].map((step, idx) => (
//             <div
//               key={idx}
//               className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
//             >
//               <span className="text-BLUE font-bold text-lg mb-2">
//                 {idx + 1}.
//               </span>
//               {step}
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Testimonials */}
//       <section className="p-4 md:p-10 text-center">
//         <h2 className="text-2xl md:text-4xl font-bold mb-8">Success Stories</h2>
//         <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
//           {[
//             {
//               quote:
//                 "Landed a SOC Analyst role in just 7 weeks — coming from customer service!",
//               name: "K.O.",
//               title: "SOC Analyst",
//             },
//             {
//               quote:
//                 "The mentorship helped me break into Splunk Admin role with confidence.",
//               name: "V.D.",
//               title: "Splunk Admin",
//             },
//             {
//               quote:
//                 "From zero IT experience to job-ready in 5 weeks. The labs and 1:1 sessions were game-changers.",
//               name: "M.A.",
//               title: "Cybersecurity Analyst",
//             },
//           ].map((t, idx) => (
//             <div
//               key={idx}
//               className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md"
//             >
//               <p className="italic mb-4">“{t.quote}”</p>
//               <p className="font-bold">{t.name}</p>
//               <p className="text-sm text-gray-600">{t.title}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Pricing Section */}
//       <section id="pricing" className="bg-BLUE text-white py-16 px-4 md:px-10">
//         <h2 className="text-center text-2xl md:text-4xl font-bold mb-10">
//           Pricing & Plans
//         </h2>
//         <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
//           {[
//             {
//               id: 110,
//               name: "Starter",
//               price: 300,
//               duration: "4 Weeks",
//               includes: [
//                 "Basic mentorship + resume help",
//                 "2 mock interviews",
//                 "Access to community chat",
//               ],
//             },
//             {
//               id: 111,
//               name: "Standard",
//               price: 500,
//               duration: "5 Weeks",
//               includes: [
//                 "Full mentorship + labs",
//                 "Resume + LinkedIn review",
//                 "Weekly 1:1 calls + Slack support",
//               ],
//             },
//             {
//               id: 112,
//               name: "Pro / Placement",
//               price: 750,
//               duration: "8 Weeks",
//               includes: [
//                 "Ongoing support until job offer",
//                 "Advanced Splunk projects",
//                 "Job referral + interview prep",
//               ],
//             },
//           ].map((plan) => (
//             <div
//               key={plan.id}
//               className="bg-white text-BLUE rounded-2xl p-6 shadow-md flex flex-col justify-between"
//             >
//               <div>
//                 <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
//                 <p className="text-gray-600 mb-3">{plan.duration}</p>
//                 <p className="text-3xl font-extrabold mb-4">${plan.price}</p>
//                 <ul className="text-sm space-y-2 mb-6">
//                   {plan.includes.map((item, idx) => (
//                     <li key={idx} className="flex items-center gap-2">
//                       <FaCheckCircle className="text-BLUE" />
//                       {item}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//               <button
//                 onClick={() => addToCart(plan.id, plan.name, plan.price)}
//                 className="mt-auto bg-BLUE text-white border-2 border-BLUE hover:bg-white hover:text-BLUE font-bold px-4 py-2 rounded-lg"
//               >
//                 Add to Cart
//               </button>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* FAQ */}
//       <section className="p-4 md:p-10 bg-gray-100">
//         <h2 className="text-center text-2xl md:text-4xl font-bold mb-8">
//           Frequently Asked Questions
//         </h2>
//         <div className="max-w-3xl mx-auto space-y-6 text-gray-700 text-sm md:text-base">
//           <div>
//             <h4 className="font-semibold">
//               How long until I’m job-ready?
//             </h4>
//             <p>Most mentees become job-ready within 8–12 weeks depending on prior experience.</p>
//           </div>
//           <div>
//             <h4 className="font-semibold">
//               What if I miss a session?
//             </h4>
//             <p>You can reschedule or receive a bonus asynchronous review that week.</p>
//           </div>
//           <div>
//             <h4 className="font-semibold">
//               Do you help with Splunk certifications?
//             </h4>
//             <p>Yes! We provide certification guidance and practice labs.</p>
//           </div>
//           <div>
//             <h4 className="font-semibold">
//               I’m new to IT — am I eligible?
//             </h4>
//             <p>Absolutely. The mentorship is beginner-friendly and personalized to your pace.</p>
//           </div>
//           <div>
//             <h4 className="font-semibold">
//               Do you offer refunds?
//             </h4>
//             <p>Yes, we offer deferral or partial refund options if mentorship is canceled early.</p>
//           </div>
//         </div>
//       </section>

//       {/* Final CTA */}
//       <section className="text-center py-16">
//         <h2 className="text-2xl md:text-4xl font-bold mb-4">
//           Ready to Start Your Cybersecurity Career?
//         </h2>
//         <button
//           onClick={() => addToCart(111, "Standard Mentorship", 500)}
//           className="bg-BLUE text-white font-bold px-6 py-3 rounded-lg hover:bg-white hover:text-BLUE border-2 border-BLUE"
//         >
//           Apply for Mentorship
//         </button>
//       </section>

//       <Toaster position="top-center" />
//     </>
//   );
// };

// export default Mentorship;
