import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Clock,
  ExternalLink,
  Filter,
  Flame,
  Globe2,
  Layers3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { fetchCareerJobs } from "../services/jobsApi";

const CAREER_CATEGORIES = [
  "Splunk Analyst",
  "Splunk Administrator",
  "Splunk Engineer",
  "SOC Analyst",
  "Cybersecurity Analyst",
  "Information Security",
  "Linux Administrator",
  "System Administrator",
  "Cloud Engineer",
  "DevOps Engineer",
  "Software Engineer",
  "Backend Developer",
  "Frontend Developer",
  "Data Analyst",
  "AI Engineer",
  "Machine Learning Engineer",
  "IT Support",
  "Network Engineer",
];

/* ---------- Category Mapping ---------- */
const CATEGORY_RULES = [
  { name: "Finance", match: ["finance", "financial", "accountant", "accounting", "bookkeep", "auditor"] },
  {
    name: "Splunk",
    match: ["splunk", "siem", "security information and event management"],
  },
  {
    name: "Linux",
    match: ["linux", "unix", "sysadmin", "system administrator"],
  },
  {
    name: "Cybersecurity",
    match: [
      "cybersecurity",
      "cyber security",
      "information security",
      "infosec",
      "security analyst",
      "security engineer",
      "soc analyst",
      "incident response",
      "penetration tester",
    ],
  },
  {
    name: "Cloud & DevOps",
    match: [
      "cloud engineer",
      "cloud architect",
      "devops",
      "site reliability",
      "platform engineer",
      "kubernetes",
      "docker",
      "aws",
      "azure",
      "google cloud",
    ],
  },
  {
    name: "Data & AI",
    match: [
      "data engineer",
      "data analyst",
      "data scientist",
      "machine learning",
      "artificial intelligence",
      "ai engineer",
      "business intelligence",
    ],
  },
  {
    name: "Mobile",
    match: [
      "mobile developer",
      "react native",
      "android developer",
      "ios developer",
      "flutter developer",
    ],
  },
  {
    name: "Software",
    match: [
      "software engineer",
      "software developer",
      "frontend",
      "front end",
      "backend",
      "back end",
      "full stack",
      "web developer",
      "react developer",
      "node.js",
      "python developer",
      "java developer",
    ],
  },
  {
    name: "IT Support",
    match: [
      "technical support",
      "it support",
      "help desk",
      "desktop support",
      "network engineer",
      "systems support",
    ],
  },
];

const pageMotion = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.55,
      staggerChildren: 0.08,
    },
  },
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut",
    },
  },
};

/* ---------- Helpers ---------- */
function getCategory(jobText = "") {
  const lower = jobText.toLowerCase();

  for (let category of CATEGORY_RULES) {
    if (category.match.some((keyword) => lower.includes(keyword))) {
      return category.name;
    }
  }

  return "Other";
}

function safeText(value, fallback = "") {
  return value || fallback;
}

function getJobDate(job) {
  return (
    job.datePosted ||
    job.date_posted ||
    job.postedAt ||
    job.date_created ||
    job.createdAt ||
    job.updatedAt ||
    ""
  );
}

function isRecentJob(job) {
  const date = getJobDate(job);

  if (!date) {
    // Undated listings must not be advertised as new.
    return false;
  }

  const posted = new Date(date);
  if (Number.isNaN(posted.getTime())) return false;

  const now = new Date();
  const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= 14;
}

function getPostedLabel(job) {
  const date = getJobDate(job);

  if (!date) {
    return "Date not listed";
  }

  const posted = new Date(date);
  if (Number.isNaN(posted.getTime())) return "Date not listed";

  const now = new Date();
  const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 14) return `${diffDays} days ago`;

  return "Older";
}

function normalizeJob(job, index) {
  const company = safeText(
    job.company || job.organization,
    "Employer not listed",
  );
  const location = safeText(job.location, "Location not listed");
  const description = safeText(
    job.description,
    "Description not provided by the employer.",
  );
  const combinedText = `${job.title || ""} ${description} ${company}`;

  return {
    ...job,
    id: job.id || `${job.title}-${company}-${index}`,
    title: safeText(job.title, "Untitled Role"),
    company,
    location,
    description,
    url: safeText(job.applyUrl || job.url, ""),
    postedAt: getJobDate(job),
    category:
      getCategory(job.title) !== "Other"
        ? getCategory(job.title)
        : getCategory(combinedText),
    isNew: isRecentJob(job, index),
    postedLabel: getPostedLabel(job, index),
    workArrangement: job.remote ? "Remote" : safeText(job.workArrangement, ""),
    salaryLabel: job.salaryLabel || formatSalary(job.salary),
  };
}

function formatSalary(salary) {
  if (!salary || (salary.min === undefined && salary.max === undefined)) {
    return "Salary not disclosed.";
  }
  const currency = salary.currency;
  const period = salary.period ? ` / ${salary.period.toLowerCase()}` : "";
  const formatAmount = (amount) => {
    if (!currency) return Number(amount).toLocaleString("en-US");
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency} ${Number(amount).toLocaleString("en-US")}`;
    }
  };
  if (salary.min !== undefined && salary.max !== undefined) {
    return `${formatAmount(salary.min)} – ${formatAmount(salary.max)}${period}`;
  }
  return `${formatAmount(salary.min ?? salary.max)}${period}`;
}
function categoryStyle(category) {
  const map = {
    Splunk: "border-purple-400/20 bg-purple-500/15 text-purple-200",
    Linux: "border-yellow-400/20 bg-yellow-500/15 text-yellow-100",
    Cybersecurity: "border-red-400/20 bg-red-500/15 text-red-200",
    "Cloud & DevOps": "border-blue-400/20 bg-blue-500/15 text-blue-200",
    "Data & AI": "border-cyan-400/20 bg-cyan-500/15 text-cyan-200",
    Mobile: "border-pink-400/20 bg-pink-500/15 text-pink-200",
    Software: "border-emerald-400/20 bg-emerald-500/15 text-emerald-200",
    "IT Support": "border-orange-400/20 bg-orange-500/15 text-orange-200",
    Technology: "border-slate-400/20 bg-slate-500/15 text-slate-200",
  };

  return map[category] || map.Technology;
}

export default function CareerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [appliedLocation, setAppliedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [workplace, setWorkplace] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [seniority, setSeniority] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [companyTerm, setCompanyTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedJob, setSelectedJob] = useState(null);

  // Explicit submission avoids spending an API request on every keystroke.
  function applySearch() {
    setAppliedSearch(searchTerm.trim());
    setAppliedLocation(locationTerm.trim());
  }

  const apiCategory = CAREER_CATEGORIES.includes(selectedCategory)
    ? selectedCategory
    : "";
  const apiWorkplace = workplace === "remote" || selectedCategory === "Remote"
    ? "remote"
    : workplace;
  const apiDatePosted = datePosted || (selectedCategory === "New" ? "week" : "");
  const jobsQuery = useInfiniteQuery({
    queryKey: [
      "careerJobs",
      {
        query: appliedSearch,
        category: apiCategory,
        location: appliedLocation,
        workplace: apiWorkplace,
        employmentType,
        seniority,
        datePosted: apiDatePosted,
      },
    ],
    queryFn: ({ pageParam, signal }) =>
      fetchCareerJobs({
        query: appliedSearch,
        category: apiCategory,
        location: appliedLocation,
        workplace: apiWorkplace,
        employmentType,
        seniority,
        datePosted: apiDatePosted,
        page: pageParam.page,
        cursor: pageParam.cursor,
        signal,
      }),
    initialPageParam: { page: 1 },
    getNextPageParam: (lastPage) => {
      if (!lastPage.jobs?.length) return undefined;
      if (lastPage.pagination?.nextCursor) {
        return {
          page: lastPage.pagination.page + 1,
          cursor: lastPage.pagination.nextCursor,
        };
      }
      if (lastPage.pagination?.hasMore && lastPage.pagination?.nextPage) {
        return { page: lastPage.pagination.nextPage };
      }
      return undefined;
    },
    staleTime: 45 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const jobs = useMemo(() => {
    const seen = new Set();
    return (jobsQuery.data?.pages || [])
      .flatMap((page) => page.jobs)
      .filter((job) => {
        const key = job.applyUrl || job.id;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((job, index) => normalizeJob(job, index));
  }, [jobsQuery.data]);

  const categories = [
    "All",
    "New",
    "Remote",
    ...CAREER_CATEGORIES,
  ];

  const newJobs = useMemo(() => {
    return jobs.filter((job) => job.isNew);
  }, [jobs]);

  const featuredJobs = useMemo(
    () =>
      jobs
        .filter((job) => job.category === "Splunk" || job.category === "Cybersecurity")
        .slice(0, 3),
    [jobs],
  );
  const spotlightJobs = featuredJobs.length ? featuredJobs : jobs.slice(0, 3);

  const filteredJobs = useMemo(() => {
    const companySearch = companyTerm.trim().toLowerCase();

    let list = jobs.filter((job) => {
      const arrangement = `${job.workArrangement} ${job.description}`.toLowerCase();
      const matchesCompany = !companySearch || job.company.toLowerCase().includes(companySearch);
      const matchesWorkplace =
        workplace === "remote" || selectedCategory === "Remote"
          ? job.remote || job.workArrangement?.toLowerCase() === "remote"
          : workplace === "hybrid"
            ? arrangement.includes("hybrid")
            : workplace === "onsite"
              ? arrangement.includes("on-site") || arrangement.includes("onsite")
              : true;
      const matchesSeniority =
        seniority !== "mid"
          ? true
          : /(^|\b)mid(?:[- ]level)?\b|intermediate/i.test(
              `${job.seniority || ""} ${job.title} ${job.description}`,
            );
      return matchesCompany && matchesWorkplace && matchesSeniority;
    });

    if (sortBy === "newest") {
      list = [...list].sort((a, b) => (Date.parse(b.postedAt) || 0) - (Date.parse(a.postedAt) || 0));
    }

    if (sortBy === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortBy === "company") {
      list = [...list].sort((a, b) => a.company.localeCompare(b.company));
    }

    return list;
  }, [jobs, companyTerm, workplace, selectedCategory, seniority, sortBy]);

  const splunkCount = jobs.filter((job) => job.category === "Splunk").length;
  const cybersecurityCount = jobs.filter(
    (job) => job.category === "Cybersecurity",
  ).length;
  const remoteCount = jobs.filter((job) => job.remote).length;
  const availableCategoryCount = new Set(
    jobs.map((job) => job.category).filter((category) => category !== "Other"),
  ).size;
  const loadedAt =
    jobsQuery.data?.pages?.[jobsQuery.data.pages.length - 1]?.refreshedAt;
  const hasStaleData = jobsQuery.data?.pages?.some((page) => page.stale);

  function clearFilters() {
    setSearchTerm("");
    setAppliedSearch("");
    setLocationTerm("");
    setAppliedLocation("");
    setSelectedCategory("All");
    setWorkplace("");
    setEmploymentType("");
    setSeniority("");
    setDatePosted("");
    setCompanyTerm("");
    setSortBy("newest");
  }

  return (
    <motion.main
      variants={pageMotion}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen overflow-hidden bg-[#060b18] px-4 py-8 text-white sm:px-6 lg:px-8"
    >
      {/* Background */}
      <div className="absolute left-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full bg-purple-500/30 blur-[140px]" />
      <div className="absolute bottom-[-240px] right-[-180px] h-[540px] w-[540px] rounded-full bg-blue-500/20 blur-[150px]" />
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[160px]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative z-10 mx-auto max-w-7xl pt-8 sm:pt-12">
        {/* ================= HERO ================= */}
        <motion.section
          variants={fadeUp}
          className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#111a31] via-[#10162b] to-[#101f30] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-10"
        >
          <div className="grid gap-10 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.08] px-4 py-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-200 text-slate-950">
                  <Briefcase size={15} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-100/80">
                  Technology careers · United States
                </span>
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
                Find work that moves your career <span className="text-cyan-200">forward.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Search live U.S. technology listings by role, location, and career
                category. Use each posting’s supplied application link.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#new-jobs"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-200 px-5 py-3.5 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-100"
                >
                  Explore opportunities
                  <ArrowUpRight size={18} />
                </a>

                <a
                  href="#job-board"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-sm font-bold text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  Browse all jobs
                  <ArrowUpRight size={17} />
                </a>
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={15} className="text-emerald-300" />
                Applications open the employer or job board destination provided by JSearch.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Search snapshot
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {jobsQuery.isPending
                      ? "Finding current openings"
                      : jobsQuery.isError
                        ? "Search is temporarily unavailable"
                        : "Opportunities loaded"}
                  </p>
                </div>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    jobsQuery.isError
                      ? "bg-rose-400"
                      : jobsQuery.isPending
                        ? "animate-pulse bg-amber-300"
                        : "bg-emerald-300"
                  }`}
                  aria-hidden="true"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={<Briefcase />}
                  value={jobsQuery.isPending ? "—" : jobsQuery.isError ? "—" : jobs.length}
                  label="Loaded jobs"
                />
                <StatCard
                  icon={<Sparkles />}
                  value={jobsQuery.isPending ? "—" : jobsQuery.isError ? "—" : newJobs.length}
                  label="Posted recently"
                />
                <StatCard
                  icon={<ShieldCheck />}
                  value={jobsQuery.isPending ? "—" : jobsQuery.isError ? "—" : splunkCount}
                  label="Splunk roles"
                />
                <StatCard
                  icon={<Globe2 />}
                  value={jobsQuery.isPending ? "—" : jobsQuery.isError ? "—" : remoteCount}
                  label="Remote roles"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* ================= NEW JOBS SPOTLIGHT ================= */}
        {!jobsQuery.isPending && !jobsQuery.isError && spotlightJobs.length > 0 && (
        <motion.section id="new-jobs" variants={fadeUp} className="mb-8">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                {featuredJobs.length ? "Featured roles" : "Spotlight"}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {featuredJobs.length
                  ? "Splunk & Cybersecurity Opportunities"
                  : "A few roles to get you started"}
              </h2>
            </div>

            <button
              onClick={() => setSelectedCategory("New")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:border-white/20 hover:bg-white/10"
            >
              Browse recent jobs
              <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {spotlightJobs.map((job) => (
              <FeaturedJobCard
                key={job.id}
                job={job}
                onDetails={() => setSelectedJob(job)}
              />
            ))}
          </div>
        </motion.section>
        )}

        <motion.section
          variants={fadeUp}
          className="mb-8 rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                Flexible work
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Explore remote roles</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Remote searches use provider search terms and work-arrangement data
                (best effort). Regional restrictions may apply.
              </p>
            </div>
            <button
              onClick={() => setSelectedCategory("Remote")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-200 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-100"
            >
              Explore remote jobs <ArrowUpRight size={18} />
            </button>
          </div>
          {jobs.some((job) => job.remote) && (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {jobs.filter((job) => job.remote).slice(0, 3).map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="rounded-xl border border-white/10 bg-slate-950/30 p-4 text-left transition hover:border-cyan-200/30 hover:bg-white/[0.06]"
                >
                  <span className="block font-black text-white">{job.title}</span>
                  <span className="mt-1 block text-sm text-white/55">{job.company}</span>
                </button>
              ))}
            </div>
          )}
        </motion.section>

        {/* ================= FILTERS ================= */}
        <motion.section
          id="job-board"
          variants={fadeUp}
          className="mb-8 rounded-[1.75rem] border border-white/10 bg-[#0d1424]/90 p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-6"
        >
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                Job board
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">Find your next role</h2>
            </div>
            <p className="text-sm text-slate-400">
              {jobsQuery.isPending ? "Searching live listings…" : `${filteredJobs.length} matching loaded`}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 transition focus-within:border-cyan-300/50 focus-within:ring-2 focus-within:ring-cyan-300/10">
              <Search className="text-white/35" size={20} />
              <input
                type="text"
                placeholder="Search job titles or keywords"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") applySearch(); }}
                aria-label="Search job keywords"
                className="h-full w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 transition focus-within:border-cyan-300/50 focus-within:ring-2 focus-within:ring-cyan-300/10">
              <MapPin className="text-white/35" size={20} />
              <input
                type="text"
                placeholder="City, state, or region"
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") applySearch(); }}
                aria-label="Search job location"
                className="h-full w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <input
              type="search"
              placeholder="Company (best effort)"
              value={companyTerm}
              onChange={(e) => setCompanyTerm(e.target.value)}
              aria-label="Filter by company"
              className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm font-medium text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
            />

            <select
              value={workplace}
              onChange={(e) => {
                setWorkplace(e.target.value);
                if (selectedCategory === "Remote") setSelectedCategory("All");
              }}
              aria-label="Filter by workplace"
              className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm font-semibold text-white outline-none focus:border-cyan-300/50"
            >
              <option className="bg-slate-950" value="">Any workplace</option>
              <option className="bg-slate-950" value="remote">Remote (best effort)</option>
              <option className="bg-slate-950" value="hybrid">Hybrid (best effort)</option>
              <option className="bg-slate-950" value="onsite">On-site (best effort)</option>
            </select>

            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              aria-label="Filter by employment type"
              className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm font-semibold text-white outline-none focus:border-cyan-300/50"
            >
              <option className="bg-slate-950" value="">Any employment type</option>
              <option className="bg-slate-950" value="full_time">Full-time (provider filter)</option>
              <option className="bg-slate-950" value="part_time">Part-time (provider filter)</option>
              <option className="bg-slate-950" value="contract">Contract (provider filter)</option>
              <option className="bg-slate-950" value="internship">Internship (provider filter)</option>
            </select>

            <select
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
              aria-label="Filter by experience level"
              className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm font-semibold text-white outline-none focus:border-cyan-300/50"
            >
              <option className="bg-slate-950" value="">Any experience level</option>
              <option className="bg-slate-950" value="entry">Entry-level (experience filter)</option>
              <option className="bg-slate-950" value="mid">Mid-level (best effort)</option>
              <option className="bg-slate-950" value="senior">Senior (experience filter)</option>
            </select>

            <select
              value={datePosted}
              onChange={(e) => setDatePosted(e.target.value)}
              aria-label="Filter by posting date"
              className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm font-semibold text-white outline-none focus:border-cyan-300/50"
            >
              <option className="bg-slate-950" value="">Any posting date</option>
              <option className="bg-slate-950" value="today">Today (provider filter)</option>
              <option className="bg-slate-950" value="three_days">Last 3 days (provider filter)</option>
              <option className="bg-slate-950" value="week">Last week (provider filter)</option>
              <option className="bg-slate-950" value="month">Last month (provider filter)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm font-semibold text-white outline-none focus:border-cyan-300/50"
            >
              <option className="bg-slate-950" value="newest">
                Sort: Newest
              </option>
              <option className="bg-slate-950" value="title">
                Sort: Title
              </option>
              <option className="bg-slate-950" value="company">
                Sort: Company
              </option>
            </select>

            <button
              onClick={applySearch}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-200 px-4 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-100"
            >
              <Search size={16} />
              Search jobs
            </button>

            <button
              onClick={clearFilters}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <X size={16} />
              Reset
            </button>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
                className={`shrink-0 rounded-full px-5 py-3 text-sm font-black transition ${
                  selectedCategory === category
                    ? "bg-cyan-200 text-slate-950 shadow-lg shadow-cyan-950/20"
                      : "border border-white/10 bg-white/[0.035] text-slate-300 hover:border-white/20 hover:bg-white/[0.08]"
                }`}
              >
                {category === "New" ? "New jobs" : category}
              </button>
            ))}
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Enter keywords and location, then select Search jobs (or press Enter).
            Role categories use live provider search; remote, employment type and date
            use provider filters. Company, hybrid/on-site and mid-level matching
            are best-effort on loaded results. Cached listings may not be current.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MiniStat icon={<Filter />} label="Matching loaded" value={filteredJobs.length} />
            <MiniStat icon={<Layers3 />} label="Categories in results" value={availableCategoryCount} />
            <MiniStat icon={<TrendingUp />} label="Cybersecurity loaded" value={cybersecurityCount} />
            <MiniStat icon={<Users />} label="Splunk loaded" value={splunkCount} />
          </div>
        </motion.section>

        {/* ================= JOB GRID ================= */}
        <motion.section variants={fadeUp}>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                {selectedCategory === "All" ? "The latest" : "Filtered results"}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">
                {selectedCategory === "All"
                  ? "Latest Opportunities"
                  : selectedCategory === "New"
                    ? "Recently Posted Opportunities"
                    : selectedCategory === "Remote"
                      ? "Remote Opportunities"
                      : `${selectedCategory} Jobs`}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Showing {filteredJobs.length} matching jobs from the records currently
                loaded for this search; this is not a total vacancy count.
              </p>
            </div>
            {loadedAt && (
              <p className="text-xs text-slate-500">
                {hasStaleData ? "Some results may be cached or incomplete; " : ""}
                Refreshed {new Date(loadedAt).toLocaleString()}
              </p>
            )}
          </div>

          {jobsQuery.isPending ? (
            <LoadingState />
          ) : jobsQuery.isError ? (
            <ErrorState
              message={jobsQuery.error?.message || "Unable to load jobs right now."}
              onRetry={() => jobsQuery.refetch()}
            />
          ) : filteredJobs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onDetails={() => setSelectedJob(job)}
                />
              ))}
            </div>
          ) : (
            <EmptyState clearFilters={clearFilters} />
          )}
          {jobsQuery.hasNextPage && (
            <div className="mt-8 text-center">
              <button
                onClick={() => jobsQuery.fetchNextPage()}
                disabled={jobsQuery.isFetchingNextPage}
                className="rounded-xl bg-cyan-200 px-6 py-3.5 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-100 disabled:opacity-50"
              >
                {jobsQuery.isFetchingNextPage ? "Loading more jobs…" : "Load more jobs"}
              </button>
            </div>
          )}
        </motion.section>

        {/* ================= FOOTER NOTE ================= */}
        <motion.div
          variants={fadeUp}
          className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center"
        >
          <p className="text-xs leading-6 text-slate-500 sm:text-sm">
            Job details and application links are supplied by OpenWeb Ninja JSearch.
            Missing salary or posting-date details are not estimated. Each Apply Now
            link opens the supplied job posting; availability and application methods
            are controlled by its publisher or employer.
          </p>
        </motion.div>
        {selectedJob && (
          <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
      </div>
    </motion.main>
  );
}

/* ===============================
   FEATURED JOB CARD
=============================== */
function FeaturedJobCard({ job, onDetails }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.075] to-white/[0.025] p-5 shadow-xl shadow-black/15 transition hover:border-cyan-200/20 hover:from-white/[0.1]"
    >
      <div className="absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-200">
            <Flame size={14} />
            Spotlight
          </span>

          <span
            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${categoryStyle(
              job.category,
            )}`}
          >
            {job.category}
          </span>
        </div>

        <button onClick={onDetails} className="text-left">
          <h3 className="line-clamp-2 text-xl font-extrabold leading-snug text-white transition group-hover:text-cyan-200">
            {job.title}
          </h3>
        </button>

        <div className="mt-4 space-y-2.5">
          {job.companyLogo && (
            <img
              src={job.companyLogo}
              alt={`${job.company} logo`}
              loading="lazy"
              className="h-10 max-w-36 rounded-lg bg-white object-contain p-1"
            />
          )}
          <p className="flex items-center gap-2.5 text-sm font-medium text-slate-300">
            <Building2 size={16} className="shrink-0 text-slate-500" />
            {job.company}
          </p>

          <p className="flex items-center gap-2.5 text-sm font-medium text-slate-300">
            <MapPin size={16} className="shrink-0 text-slate-500" />
            {job.location}
          </p>

          <p className="flex items-center gap-2.5 text-sm font-medium text-slate-400">
            <Clock size={16} className="shrink-0 text-slate-500" />
            {job.postedLabel}
          </p>
          <p className="text-sm font-bold text-cyan-100">{job.salaryLabel}</p>
          <p className="text-xs text-slate-500">Source: {job.source || "Not listed"}</p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <button
            onClick={onDetails}
            className="text-sm font-bold text-slate-300 transition hover:text-white"
          >
            View details
          </button>
          {job.url && <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-cyan-200 transition hover:text-cyan-100"
          >
            Apply Now <ArrowUpRight size={18} />
          </a>}
        </div>
      </div>
    </motion.article>
  );
}
FeaturedJobCard.propTypes = {
  job: PropTypes.shape({
    category: PropTypes.string,
    title: PropTypes.string.isRequired,
    company: PropTypes.string,
    companyLogo: PropTypes.string,
    location: PropTypes.string,
    postedLabel: PropTypes.string,
    salaryLabel: PropTypes.string,
    source: PropTypes.string,
    url: PropTypes.string.isRequired,
  }).isRequired,
  onDetails: PropTypes.func.isRequired,
};

/* ===============================
   JOB CARD
=============================== */
function JobCard({ job, onDetails }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.065] to-white/[0.02] p-5 shadow-xl shadow-black/15 transition hover:border-cyan-200/20 hover:from-white/[0.09]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 transition group-hover:opacity-100" />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mb-5 flex items-start justify-between gap-3">
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={`${job.company} logo`}
              loading="lazy"
              className="h-12 w-12 shrink-0 rounded-2xl bg-white object-contain p-1"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-800 text-cyan-200">
              <Building2 size={21} />
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            {job.isNew && (
              <span className="rounded-full bg-orange-400/10 px-3 py-1 text-[11px] font-bold text-orange-200">
                New
              </span>
            )}

            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-bold ${categoryStyle(
                job.category,
              )}`}
            >
              {job.category}
            </span>
          </div>
        </div>

        <button onClick={onDetails} className="text-left">
          <h2 className="line-clamp-2 text-lg font-extrabold leading-snug text-white transition group-hover:text-cyan-200">
            {job.title}
          </h2>
        </button>

        <p className="mt-4 flex items-center gap-2.5 text-sm font-medium text-slate-300">
          <Building2 size={15} className="shrink-0 text-slate-500" />
          <span className="line-clamp-1">{job.company}</span>
        </p>

        <p className="mt-2.5 flex items-center gap-2.5 text-sm font-medium text-slate-300">
          <MapPin size={15} className="shrink-0 text-slate-500" />
          <span className="line-clamp-1">{job.location}</span>
        </p>

        <p className="mt-2.5 flex items-center gap-2.5 text-sm text-slate-400">
          <Clock size={15} className="shrink-0 text-slate-500" />
          {job.postedLabel}
        </p>
        <p className="mt-3 text-xs text-slate-500">Source: {job.source || "Not listed"}</p>
        <p className="mt-2.5 text-sm font-bold text-cyan-100">{job.salaryLabel}</p>
        <p className="mt-1.5 text-xs font-medium text-slate-400">
          {job.workArrangement || "Work arrangement not listed"}
          {job.employmentType ? ` · ${employmentLabel(job.employmentType)}` : ""}
        </p>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
          {job.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <button
            onClick={onDetails}
            className="text-sm font-bold text-slate-300 transition hover:text-white"
          >
            View details
          </button>
          {job.url && <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-cyan-200 transition hover:text-cyan-100"
          >
            <ExternalLink size={16} /> Apply Now
          </a>}
        </div>
      </div>
    </motion.article>
  );
}
JobCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.string.isRequired,
    companyLogo: PropTypes.string,
    company: PropTypes.string,
    isNew: PropTypes.bool,
    category: PropTypes.string,
    title: PropTypes.string.isRequired,
    location: PropTypes.string,
    postedLabel: PropTypes.string,
    source: PropTypes.string,
    salaryLabel: PropTypes.string,
    workArrangement: PropTypes.string,
    employmentType: PropTypes.string,
    description: PropTypes.string,
    url: PropTypes.string.isRequired,
  }).isRequired,
  onDetails: PropTypes.func.isRequired,
};

function employmentLabel(type) {
  const labels = {
    FULLTIME: "Full-time",
    "full-time": "Full-time",
    PARTTIME: "Part-time",
    "part-time": "Part-time",
    CONTRACTOR: "Contract",
    contractor: "Contract",
    INTERN: "Internship",
    internship: "Internship",
  };
  return labels[type] || type;
}

/* ===============================
   STATS
=============================== */
function StatCard({ icon, value, label }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-3.5 transition hover:border-white/15 hover:bg-white/[0.06] sm:p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-200/10 text-cyan-200">
        {React.cloneElement(icon, { size: 18 })}
      </div>

      <h3 className="truncate text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{value}</h3>

      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}
StatCard.propTypes = {
  icon: PropTypes.element.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
};

function MiniStat({ icon, value, label }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-200/[0.08] text-cyan-200">
        {React.cloneElement(icon, { size: 17 })}
      </div>

      <div className="min-w-0">
        <p className="text-xl font-extrabold text-white">{value}</p>
        <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      </div>
    </div>
  );
}
MiniStat.propTypes = {
  icon: PropTypes.element.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
};

/* ===============================
   EMPTY STATE
=============================== */
function EmptyState({ clearFilters }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-xl shadow-black/20 sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-200/10 text-cyan-200">
        <Search size={24} />
      </div>

      <h3 className="mt-5 text-2xl font-extrabold text-white">No jobs found</h3>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
        Try another keyword, change your category filter, or reset the search.
      </p>

      <button
        onClick={clearFilters}
        className="mt-6 rounded-xl bg-cyan-200 px-6 py-3.5 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-100"
      >
        Reset Filters
      </button>
    </div>
  );
}
EmptyState.propTypes = { clearFilters: PropTypes.func.isRequired };

function LoadingState() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading jobs">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="min-h-[300px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.035] p-5"
        >
          <div className="h-12 w-12 rounded-2xl bg-white/10" />
          <div className="mt-7 h-5 w-3/4 rounded bg-white/10" />
          <div className="mt-4 h-4 w-1/2 rounded bg-white/10" />
          <div className="mt-3 h-4 w-2/3 rounded bg-white/10" />
          <div className="mt-8 h-16 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-8 text-center shadow-xl shadow-black/20 sm:p-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-400/10 text-rose-200">
        <Briefcase size={21} />
      </div>
      <h3 className="mt-4 text-2xl font-extrabold text-white">
        Jobs could not be loaded
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="mt-6 rounded-xl bg-cyan-200 px-6 py-3.5 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-100"
      >
        Try Again
      </button>
    </div>
  );
}
ErrorState.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
};

function JobDetailsModal({ job, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-details-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0b1225] p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-cyan-200">
              {job.company || "Employer not listed"}
            </p>
            <h2 id="job-details-title" className="mt-2 text-2xl font-black text-white">
              {job.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close job details"
            className="rounded-xl border border-white/10 p-2 text-white/70 hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
          <span>{job.location}</span>
          <span>{job.workArrangement || "Work arrangement not listed"}</span>
          <span>{job.employmentType ? employmentLabel(job.employmentType) : "Employment type not listed"}</span>
          <span>{job.postedLabel}</span>
        </div>
        <p className="mt-4 font-bold text-cyan-100">{job.salaryLabel}</p>
        <p className="mt-2 text-xs text-white/45">Source: {job.source || "Not listed"}</p>
        <div className="mt-6 whitespace-pre-line text-sm leading-7 text-white/75">
          {job.description}
        </div>
        {job.url && <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-purple-700 transition hover:-translate-y-1"
        >
          Apply Now <ExternalLink size={17} />
        </a>}
      </section>
    </div>
  );
}
JobDetailsModal.propTypes = {
  job: PropTypes.shape({
    company: PropTypes.string,
    title: PropTypes.string.isRequired,
    location: PropTypes.string,
    workArrangement: PropTypes.string,
    employmentType: PropTypes.string,
    postedLabel: PropTypes.string,
    salaryLabel: PropTypes.string,
    source: PropTypes.string,
    description: PropTypes.string,
    url: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};