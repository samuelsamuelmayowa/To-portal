// src/pages/Home.jsx
import React from "react";
import {
  Shield,
  Bug,
  Code2,
  Radar,
  TerminalSquare,
  Timer,
  FileSearch,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Lock,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
    {children}
  </span>
);

const PrimaryBtn = ({ children, href = "#get-started" }) => (
  <a
    href={href}
    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
  >
    {children}
    <ChevronRight className="h-4 w-4" />
  </a>
);

const SecondaryBtn = ({ children, href = "#how-it-works" }) => (
  <a
    href={href}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
  >
    {children}
    <ChevronRight className="h-4 w-4" />
  </a>
);

const Stat = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="mt-1 text-xs text-white/60">{label}</div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6">
    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/5 blur-2xl transition group-hover:bg-white/10" />
    <div className="relative">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/70">{desc}</p>
    </div>
  </div>
);

const Step = ({ n, title, desc }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-white">
        {n}
      </div>
      <div className="text-base font-semibold text-white">{title}</div>
    </div>
    <p className="mt-3 text-sm leading-relaxed text-white/70">{desc}</p>
  </div>
);

const CompareRow = ({ left, right }) => (
  <div className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-2">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-5 w-5 rounded-full border border-white/10 bg-white/5" />
      <div className="text-sm text-white/70">{left}</div>
    </div>
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 text-white" />
      <div className="text-sm text-white/80">{right}</div>
    </div>
  </div>
);

const DemoPanel = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-1/2 top-[-120px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-140px] h-[320px] w-[320px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TerminalSquare className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold text-white">Live Challenge Preview</span>
          </div>
          <Pill>
            <Timer className="mr-2 h-3.5 w-3.5" />
            22:14 left
          </Pill>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-5">
          {/* Left */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/80">Task</div>
                <Pill>
                  <Shield className="mr-2 h-3.5 w-3.5" />
                  Auth & Access Control
                </Pill>
              </div>
              <div className="mt-3 text-sm font-semibold text-white">
                Fix IDOR in Orders Endpoint
              </div>
              <p className="mt-2 text-sm text-white/70">
                Users can access other users’ orders by changing the ID. Patch the API
                and explain the root cause + fix.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-xs text-white/60">Expected Output</div>
                  <div className="mt-1 text-sm text-white/80">
                    403 for unauthorized access
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-xs text-white/60">Scoring</div>
                  <div className="mt-1 text-sm text-white/80">
                    Fix + Explanation + Tests
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/80">Code</div>
                <Pill>
                  <Code2 className="mr-2 h-3.5 w-3.5" />
                  Node.js / Express
                </Pill>
              </div>

              <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-4 text-[12px] leading-relaxed text-white/80">
{`// BEFORE (vulnerable)
app.get("/orders/:id", auth, async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  return res.json(order);
});

// TODO: authorize access by owner / role,
// return 403 on violations, add tests.`}
              </pre>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/80">Skill Report</div>
                <Pill>
                  <BarChart3 className="mr-2 h-3.5 w-3.5" />
                  Preview
                </Pill>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  ["Authentication", 82],
                  ["Authorization", 61],
                  ["Secure Coding", 74],
                  ["Logging", 58],
                ].map(([label, pct]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>{label}</span>
                      <span className="text-white/80">{pct}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="text-xs text-white/60">Weak Spot</div>
                <div className="mt-1 text-sm text-white/80">
                  Missing object-level authorization checks
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="text-xs text-white/60">Next Lab</div>
                <div className="mt-1 text-sm text-white/80">
                  Rate limiting + brute-force detection (logs)
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <FileSearch className="h-4 w-4" />
                Real Logs (SOC-style)
              </div>
              <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-4 text-[12px] leading-relaxed text-white/80">
{`Jan 30 21:12:04 nginx: POST /login 401 (ip=45.33.x.x)
Jan 30 21:12:06 nginx: POST /login 401 (ip=45.33.x.x)
Jan 30 21:12:08 nginx: POST /login 401 (ip=45.33.x.x)
...`}
              </pre>
              <div className="mt-3 text-sm text-white/70">
                Detect brute-force, tune alerts, and explain what you’d do next.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Pill>
            <Bug className="mr-2 h-3.5 w-3.5" />
            Web & Mobile Vulnerabilities
          </Pill>
          <Pill>
            <Radar className="mr-2 h-3.5 w-3.5" />
            Incident Investigation
          </Pill>
          <Pill>
            <Lock className="mr-2 h-3.5 w-3.5" />
            Login / Signup Hardening
          </Pill>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#07090f] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide">TO SKILLLAB</div>
              <div className="text-[11px] text-white/60">Proof-based skill training</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-white/75 md:flex">
            <a className="hover:text-white" href="#features">
              Features
            </a>
            <a className="hover:text-white" href="#how-it-works">
              How it works
            </a>

            {/* <NavLink */}
            <Link to={'/labview'}>LabView</Link>
            {/* <a className="hover:text-white" href="#tracks">
              Tracks
            </a> */}
            <a className="hover:text-white" href="#faq">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#get-started"
              className="hidden rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 md:inline-flex"
            >
              Join early access
            </a>
            {/* <a
              href="#get-started"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              Start
            </a> */}

              <Link to={'/loginskill'} clas  className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90">Start</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 pt-10 pb-10 md:pt-16">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <div className="flex flex-wrap gap-2">
                <Pill>Hands-on labs</Pill>
                <Pill>Interview pressure</Pill>
                <Pill>Skill reports</Pill>
              </div>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                Prove your cyber & tech skills —{" "}
                <span className="text-white/70">for real.</span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
                TO SkillLab is a hands-on platform where people practice and prove real
                skills the same way they’re tested in real job interviews — web/mobile
                vulnerabilities, log investigations, secure coding, and Splunk-style tasks.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <PrimaryBtn href="#get-started">Start practicing</PrimaryBtn>
                <SecondaryBtn href="#how-it-works">See how it works</SecondaryBtn>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <Stat label="Realistic labs" value="Hands-on" />
                <Stat label="Interview-style" value="Timed" />
                <Stat label="Skill feedback" value="Reports" />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm font-semibold text-white">
                  One-line version
                </div>
                <p className="mt-2 text-sm text-white/70">
                  TO SkillLab helps people prove they can actually do the job — not just talk about it.
                </p>
              </div>
            </div>

            <DemoPanel />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold">Built for real work</h2>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Not theory. Not endless videos. You practice exactly what interviews and real jobs require.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Bug}
              title="Web & Mobile Vulnerabilities"
              desc="Practice real exploit paths (auth bypass, IDOR, XSS, SQLi) and submit impact + fix."
            />
            <FeatureCard
              icon={FileSearch}
              title="Logs & Server Investigation"
              desc="Analyze website/server logs, detect attacks, triage alerts, and explain next steps."
            />
            <FeatureCard
              icon={Code2}
              title="Good Code / Secure Code"
              desc="Review insecure code, fix login/signup flaws, and justify your decisions like a senior dev."
            />
            <FeatureCard
              icon={Timer}
              title="Timed Interview Challenges"
              desc="Work under pressure. No hand-holding. Just like real technical interviews."
            />
            <FeatureCard
              icon={Radar}
              title="Real Scenarios (SOC-style)"
              desc="Investigate incidents with evidence, reasoning, and written explanations."
            />
            <FeatureCard
              icon={BarChart3}
              title="Skill Reports"
              desc="Strengths, weaknesses, and readiness scoring — you know exactly what to improve."
            />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">How it works</h2>
              <p className="text-sm text-white/70">
                Simple flow. Real output. Proof you’re job-ready.
              </p>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Step
                n="1"
                title="Pick a track"
                desc="Web security, mobile security, logs/SOC, secure coding, Splunk tasks."
              />
              <Step
                n="2"
                title="Do the task"
                desc="Vulnerable apps, real logs, broken code, real constraints."
              />
              <Step
                n="3"
                title="Explain your why"
                desc="Not just the answer — your reasoning and decision-making."
              />
              <Step
                n="4"
                title="Get a report"
                desc="Strengths, weak spots, and recommended next labs."
              />
            </div>
          </div>
        </section>

        {/* Tracks */}
        <section id="tracks" className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h2 className="text-2xl font-bold">MVP Tracks inside TO</h2>
              <p className="mt-2 text-sm text-white/70">
                Start lean. Launch fast. Expand later.
              </p>

              <div className="mt-6 space-y-3">
                <CompareRow
                  left="Practice-only platforms: watch, read, repeat."
                  right="TO SkillLab: break, fix, investigate, explain."
                />
                <CompareRow
                  left="Badges that don’t prove ability."
                  right="Reports that show strengths + weak areas."
                />
                <CompareRow
                  left="Theory questions: “What is XSS?”"
                  right="Scenario tasks: “Exploit XSS and patch it.”"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Pill>Web app vulnerabilities</Pill>
                <Pill>Mobile/API security</Pill>
                <Pill>Login & signup hardening</Pill>
                <Pill>Log analysis</Pill>
                <Pill>Splunk-style tasks</Pill>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h3 className="text-xl font-bold">Example labs (what users will do)</h3>

              <div className="mt-5 space-y-3">
                {[
                  {
                    icon: Shield,
                    title: "Login & Signup Audit",
                    desc: "Find account enumeration + missing rate limits, fix it, and explain the change.",
                  },
                  {
                    icon: Bug,
                    title: "Web Vuln Hunt (OWASP-style)",
                    desc: "Identify 3 vulnerabilities, provide impact + remediation, submit a mini report.",
                  },
                  {
                    icon: FileSearch,
                    title: "Server Log Investigation",
                    desc: "Detect brute-force attempts in logs and propose mitigations + alert tuning.",
                  },
                  {
                    icon: Radar,
                    title: "Splunk Task (MVP)",
                    desc: "Use a provided dataset to find suspicious behavior and answer investigation questions.",
                  },
                ].map((x) => (
                  <div
                    key={x.title}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5">
                      <x.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{x.title}</div>
                      <div className="mt-1 text-sm text-white/70">{x.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
            <h2 className="text-2xl font-bold">FAQ</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                {
                  q: "Is this a course?",
                  a: "No. It’s a practice + proof platform. You do tasks like real interviews and real work.",
                },
                {
                  q: "Will it include Splunk tasks?",
                  a: "Yes — starting with dataset-based investigations (MVP), then full lab environments later.",
                },
                {
                  q: "Do I need to be advanced?",
                  a: "No. Labs will be layered: beginner → intermediate → advanced.",
                },
                {
                  q: "What makes it different?",
                  a: "Timed challenges + real scenarios + explanations + skill reports. Proof over talk.",
                },
              ].map((f) => (
                <div key={f.q} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="text-sm font-semibold text-white">{f.q}</div>
                  <div className="mt-2 text-sm text-white/70">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="get-started" className="mx-auto max-w-6xl px-4 pb-16">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-8 md:p-12">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                Build proof. Get interview-ready.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-white/70">
                If you want TO SkillLab to feel elite, start with real labs: login/signup audits,
                web vulnerabilities, log investigations, and Splunk-style tasks.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <PrimaryBtn href="#get-started">Join early access</PrimaryBtn>
                <SecondaryBtn href="#features">Explore features</SecondaryBtn>
              </div>

              <div className="mt-6 text-xs text-white/55">
                Tip: wire your “Start” button to /labs when you build the lab list page.
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 md:flex-row md:items-center">
            <div className="text-sm text-white/60">
              © {new Date().getFullYear()} TO SkillLab — Proof-based learning.
            </div>
            <div className="flex gap-4 text-sm text-white/60">
              <a className="hover:text-white" href="#features">
                Features
              </a>
              <a className="hover:text-white" href="#how-it-works">
                How it works
              </a>
              <a className="hover:text-white" href="#get-started">
                Early access
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
