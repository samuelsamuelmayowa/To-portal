import React, { useEffect, useMemo, useState } from "react";
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
    salaryLabel: formatSalary(job.salary),
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [workplace, setWorkplace] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [seniority, setSeniority] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [companyTerm, setCompanyTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 450);
    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  const apiCategory = CAREER_CATEGORIES.includes(selectedCategory)
    ? selectedCategory
    : "";
  const apiWorkplace = workplace === "remote" || selectedCategory === "Remote"
    ? "remote"
    : "";
  const apiDatePosted = datePosted || (selectedCategory === "New" ? "week" : "");
  const jobsQuery = useInfiniteQuery({
    queryKey: [
      "careerJobs",
      {
        query: debouncedSearch,
        category: apiCategory,
        location: locationTerm.trim(),
        workplace: apiWorkplace,
        employmentType,
        seniority,
        datePosted: apiDatePosted,
      },
    ],
    queryFn: ({ pageParam, signal }) =>
      fetchCareerJobs({
        query: debouncedSearch,
        category: apiCategory,
        location: locationTerm.trim(),
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

  const filteredJobs = useMemo(() => {
    const companySearch = companyTerm.trim().toLowerCase();

    let list = jobs.filter((job) => {
      const arrangement = `${job.workArrangement} ${job.description}`.toLowerCase();
      const matchesCompany = !companySearch || job.company.toLowerCase().includes(companySearch);
      const matchesWorkplace =
        workplace === "remote" || selectedCategory === "Remote"
          ? job.remote
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
    setDebouncedSearch("");
    setLocationTerm("");
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
      className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-10 text-white sm:px-8 lg:px-16"
    >
      {/* Background */}
      <div className="absolute left-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full bg-purple-500/30 blur-[140px]" />
      <div className="absolute bottom-[-240px] right-[-180px] h-[540px] w-[540px] rounded-full bg-blue-500/20 blur-[150px]" />
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[160px]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative z-10 mx-auto max-w-[1600px] pt-16">
        {/* ================= HERO ================= */}
        <motion.section
          variants={fadeUp}
          className="mb-8 overflow-hidden rounded-[2.7rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-9"
        >
          <div className="grid gap-10 xl:grid-cols-[1fr_560px] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-purple-700">
                  <Briefcase size={16} />
                </span>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-white/70">
                  Career Opportunities Hub
                </span>
              </div>

              <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[1.03] tracking-tight md:text-7xl">
                Find your next opportunity in technology.
              </h1>

              <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-white/60 md:text-lg">
                Explore currently advertised U.S. roles from OpenWeb Ninja JSearch.
                Search by title, location, and career category, then apply through
                the original job listing.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#new-jobs"
                  className="inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 font-black text-purple-700 transition hover:-translate-y-1 hover:bg-slate-100"
                >
                  View New Jobs
                  <ArrowUpRight size={18} />
                </a>

                <a
                  href="#job-board"
                  className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-white hover:text-purple-700"
                >
                  Browse All Jobs
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
            
           <StatCard
  icon={<Briefcase />}
  value={jobs.length}
  label="Jobs Loaded"
/>

<StatCard
  icon={<Sparkles />}
  value={newJobs.length}
  label="New Jobs"
/>

<StatCard
  icon={<ShieldCheck />}
  value={splunkCount}
  label="Splunk Roles"
/>

<StatCard
  icon={<Globe2 />}
  value={remoteCount}
  label="Remote Roles"
/>
            </div>
          </div>
        </motion.section>

        {/* ================= NEW JOBS SPOTLIGHT ================= */}
        <motion.section id="new-jobs" variants={fadeUp} className="mb-8">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-200">
                Featured Roles
              </p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                Splunk & Cybersecurity Opportunities
              </h2>
            </div>

            <button
              onClick={() => setSelectedCategory("New")}
              className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-black text-white transition hover:-translate-y-1 hover:bg-white hover:text-purple-700"
            >
              Browse Recent Jobs
              <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {featuredJobs.map((job) => (
              <FeaturedJobCard
                key={job.id}
                job={job}
                onDetails={() => setSelectedJob(job)}
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          className="mb-8 rounded-[2.3rem] border border-white/10 bg-white/5 p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-200">
                Remote Jobs
              </p>
              <h2 className="mt-2 text-2xl font-black">Work from anywhere</h2>
              <p className="mt-2 text-sm text-white/50">
                Remote searches use provider search terms and work-arrangement data
                (best effort). Regional restrictions may apply.
              </p>
            </div>
            <button
              onClick={() => setSelectedCategory("Remote")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-purple-700"
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
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:bg-white/10"
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
          className="mb-8 rounded-[2.3rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl md:p-6"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="flex h-14 items-center gap-4 rounded-2xl border border-white/10 bg-black/25 px-5 transition focus-within:border-cyan-300/40">
              <Search className="text-white/35" size={20} />
              <input
                type="text"
                placeholder="Search job titles or keywords"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search job keywords"
                className="h-full w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30 md:text-base"
              />
            </div>

            <div className="flex h-14 items-center gap-4 rounded-2xl border border-white/10 bg-black/25 px-5 transition focus-within:border-cyan-300/40">
              <MapPin className="text-white/35" size={20} />
              <input
                type="text"
                placeholder="City, state, or region"
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                aria-label="Search job location"
                className="h-full w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30"
              />
            </div>

            <input
              type="search"
              placeholder="Company (best effort)"
              value={companyTerm}
              onChange={(e) => setCompanyTerm(e.target.value)}
              aria-label="Filter by company"
              className="h-14 rounded-2xl border border-white/10 bg-black/25 px-5 text-sm font-semibold text-white outline-none placeholder:text-white/30"
            />

            <select
              value={workplace}
              onChange={(e) => {
                setWorkplace(e.target.value);
                if (selectedCategory === "Remote") setSelectedCategory("All");
              }}
              aria-label="Filter by workplace"
              className="h-14 rounded-2xl border border-white/10 bg-black/25 px-5 text-sm font-black text-white outline-none"
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
              className="h-14 rounded-2xl border border-white/10 bg-black/25 px-5 text-sm font-black text-white outline-none"
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
              className="h-14 rounded-2xl border border-white/10 bg-black/25 px-5 text-sm font-black text-white outline-none"
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
              className="h-14 rounded-2xl border border-white/10 bg-black/25 px-5 text-sm font-black text-white outline-none"
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
              className="h-14 rounded-2xl border border-white/10 bg-black/25 px-5 text-sm font-black text-white outline-none"
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
              onClick={clearFilters}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-purple-700 transition hover:-translate-y-1"
            >
              <X size={16} />
              Reset
            </button>
          </div>

          <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full px-5 py-3 text-sm font-black transition ${
                  selectedCategory === category
                    ? "bg-white text-purple-700 shadow-xl"
                    : "border border-white/10 bg-white/5 text-white/60 hover:bg-white hover:text-purple-700"
                }`}
              >
                {category === "New" ? "🔥 New Jobs" : category}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs leading-6 text-white/45">
            Category, keyword, location, and remote terms use relevance-based provider
            search. Employment type and posting date use provider filters. Experience
            level is based on provider experience requirements; company, remote,
            hybrid/on-site, and mid-level matching are best-effort on loaded results.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <MiniStat icon={<Filter />} label="Matching loaded" value={filteredJobs.length} />
            <MiniStat icon={<Layers3 />} label="Categories in results" value={availableCategoryCount} />
            <MiniStat icon={<TrendingUp />} label="Cybersecurity loaded" value={cybersecurityCount} />
            <MiniStat icon={<Users />} label="Splunk loaded" value={splunkCount} />
          </div>
        </motion.section>

        {/* ================= JOB GRID ================= */}
        <motion.section variants={fadeUp}>
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black md:text-3xl">
                {selectedCategory === "All"
                  ? "Latest Opportunities"
                  : selectedCategory === "New"
                    ? "Recently Posted Opportunities"
                    : selectedCategory === "Remote"
                      ? "Remote Opportunities"
                      : `${selectedCategory} Jobs`}
              </h2>
              <p className="mt-2 text-sm font-medium text-white/45">
                Showing {filteredJobs.length} matching jobs from the records currently
                loaded for this search; this is not a total vacancy count.
              </p>
            </div>
            {loadedAt && (
              <p className="text-xs text-white/45">
                {hasStaleData ? "Showing cached results; " : ""}
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
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                className="rounded-2xl bg-white px-7 py-4 font-black text-purple-700 transition hover:-translate-y-1 disabled:opacity-50"
              >
                {jobsQuery.isFetchingNextPage ? "Loading more jobs…" : "Load more jobs"}
              </button>
            </div>
          )}
        </motion.section>

        {/* ================= FOOTER NOTE ================= */}
        <motion.div
          variants={fadeUp}
          className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl"
        >
          <p className="text-sm font-medium leading-7 text-white/45">
            Job details and application links are supplied by OpenWeb Ninja JSearch.
            Missing salary or posting-date details are not estimated. Each Apply Now
            link opens the original listing; availability and application methods
            are controlled by the employer.
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
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl transition hover:bg-white/[0.14]"
    >
      <div className="absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-200">
            <Flame size={14} />
            Featured
          </span>

          <span
            className={`rounded-full border px-4 py-2 text-xs font-black ${categoryStyle(
              job.category,
            )}`}
          >
            {job.category}
          </span>
        </div>

        <button onClick={onDetails} className="text-left">
          <h3 className="line-clamp-2 text-2xl font-black leading-tight text-white group-hover:text-cyan-200">
            {job.title}
          </h3>
        </button>

        <div className="mt-5 space-y-3">
          {job.companyLogo && (
            <img
              src={job.companyLogo}
              alt={`${job.company} logo`}
              loading="lazy"
              className="h-10 max-w-36 rounded-lg bg-white object-contain p-1"
            />
          )}
          <p className="flex items-center gap-3 text-sm font-bold text-white/60">
            <Building2 size={17} />
            {job.company}
          </p>

          <p className="flex items-center gap-3 text-sm font-bold text-white/60">
            <MapPin size={17} />
            {job.location}
          </p>

          <p className="flex items-center gap-3 text-sm font-bold text-white/60">
            <Clock size={17} />
            {job.postedLabel}
          </p>
          <p className="text-sm font-bold text-cyan-100">{job.salaryLabel}</p>
          <p className="text-xs text-cyan-200">Source: {job.source || "Not listed"}</p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <button
            onClick={onDetails}
            className="font-black text-white/70 transition hover:text-white"
          >
            View details
          </button>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-black text-cyan-200"
          >
            Apply Now <ArrowUpRight size={18} />
          </a>
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
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
      className="group relative flex min-h-[310px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:bg-white/[0.14]"
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
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-purple-700">
              <Building2 size={21} />
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            {job.isNew && (
              <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-black text-orange-200">
                New
              </span>
            )}

            <span
              className={`rounded-full border px-3 py-1 text-xs font-black ${categoryStyle(
                job.category,
              )}`}
            >
              {job.category}
            </span>
          </div>
        </div>

        <button onClick={onDetails} className="text-left">
          <h2 className="line-clamp-2 text-xl font-black leading-tight text-white transition group-hover:text-cyan-200">
            {job.title}
          </h2>
        </button>

        <p className="mt-4 flex items-center gap-3 text-sm font-bold text-white/55">
          <Building2 size={16} />
          <span className="line-clamp-1">{job.company}</span>
        </p>

        <p className="mt-3 flex items-center gap-3 text-sm font-bold text-white/55">
          <MapPin size={16} />
          <span className="line-clamp-1">{job.location}</span>
        </p>

        <p className="mt-3 flex items-center gap-3 text-sm font-bold text-white/45">
          <Clock size={16} />
          {job.postedLabel}
        </p>
        <p className="mt-3 text-xs text-cyan-200">Source: {job.source || "Not listed"}</p>
        <p className="mt-3 text-sm font-bold text-cyan-100">{job.salaryLabel}</p>
        <p className="mt-2 text-xs font-semibold text-white/50">
          {job.workArrangement || "Work arrangement not listed"}
          {job.employmentType ? ` · ${employmentLabel(job.employmentType)}` : ""}
        </p>

        <p className="mt-4 line-clamp-3 text-sm font-medium leading-7 text-white/45">
          {job.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-5">
          <button
            onClick={onDetails}
            className="text-sm font-black text-white/70 transition hover:text-white"
          >
            View details
          </button>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-black text-cyan-200"
          >
            <ExternalLink size={16} /> Apply Now
          </a>
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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-purple-700">
        {React.cloneElement(icon, { size: 21 })}
      </div>

      <h3 className="truncate text-3xl font-black text-white">{value}</h3>

      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/40">
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
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 text-cyan-200">
        {React.cloneElement(icon, { size: 18 })}
      </div>

      <p className="text-2xl font-black text-white">{value}</p>

      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/35">
        {label}
      </p>
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
    <div className="rounded-[2.3rem] border border-white/10 bg-white/10 p-10 text-center shadow-2xl shadow-black/20 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-purple-700">
        <Search size={24} />
      </div>

      <h3 className="mt-6 text-3xl font-black text-white">No jobs found</h3>

      <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-white/50">
        Try another keyword, change your category filter, or reset the search.
      </p>

      <button
        onClick={clearFilters}
        className="mt-7 rounded-2xl bg-white px-7 py-4 font-black text-purple-700 transition hover:-translate-y-1"
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
          className="min-h-[300px] animate-pulse rounded-[2rem] border border-white/10 bg-white/5 p-6"
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
    <div className="rounded-[2.3rem] border border-red-400/20 bg-red-500/10 p-10 text-center shadow-2xl shadow-black/20 backdrop-blur-2xl">
      <h3 className="text-2xl font-black text-white">
        Jobs could not be loaded
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-white/60">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="mt-6 rounded-2xl bg-white px-7 py-4 font-black text-purple-700 transition hover:-translate-y-1"
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
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-purple-700 transition hover:-translate-y-1"
        >
          Apply Now <ExternalLink size={17} />
        </a>
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

// import React, { useEffect, useMemo, useState } from "react";
// import { motion } from "framer-motion";
// import {
//   ArrowUpRight,
//   Briefcase,
//   Building2,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   ExternalLink,
//   Filter,
//   Flame,
//   Globe2,
//   Layers3,
//   MapPin,
//   Search,
//   ShieldCheck,
//   Sparkles,
//   TrendingUp,
//   Users,
//   X,
// } from "lucide-react";
// import { massiveJobsDatabase } from "../data/jobsData";

// /* ---------- Category Mapping ---------- */
// const CATEGORY_RULES = [
//   { name: "SOC", match: ["soc", "security analyst", "incident response"] },
//   { name: "SIEM", match: ["splunk", "siem", "log analysis"] },
//   { name: "Cloud", match: ["cloud", "aws", "azure", "gcp"] },
//   {
//     name: "DevOps",
//     match: ["devops", "kubernetes", "docker", "site reliability", "sre"],
//   },
//   { name: "Linux", match: ["linux", "sysadmin", "system administrator"] },
// ];

// const pageMotion = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       duration: 0.55,
//       staggerChildren: 0.08,
//     },
//   },
// };

// const fadeUp = {
//   hidden: {
//     opacity: 0,
//     y: 35,
//   },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.65,
//       ease: "easeOut",
//     },
//   },
// };

// /* ---------- Helpers ---------- */
// function getCategory(jobText = "") {
//   const lower = jobText.toLowerCase();

//   for (let category of CATEGORY_RULES) {
//     if (category.match.some((keyword) => lower.includes(keyword))) {
//       return category.name;
//     }
//   }

//   return "IT";
// }

// function safeText(value, fallback = "") {
//   return value || fallback;
// }

// function getJobDate(job) {
//   return job.postedAt || job.datePosted || job.createdAt || job.updatedAt || "";
// }

// function isRecentJob(job, index) {
//   const date = getJobDate(job);

//   if (!date) {
//     // If your jobs database has no date field, this still makes the first jobs appear as new.
//     return index < 9;
//   }

//   const posted = new Date(date);
//   if (Number.isNaN(posted.getTime())) return index < 9;

//   const now = new Date();
//   const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));

//   return diffDays <= 14;
// }

// function getPostedLabel(job, index) {
//   const date = getJobDate(job);

//   if (!date) {
//     return index < 9 ? "New" : "Recently added";
//   }

//   const posted = new Date(date);
//   if (Number.isNaN(posted.getTime())) return "Recently added";

//   const now = new Date();
//   const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));

//   if (diffDays <= 0) return "Today";
//   if (diffDays === 1) return "Yesterday";
//   if (diffDays <= 14) return `${diffDays} days ago`;

//   return "Older";
// }

// function normalizeJob(job, index) {
//   const combinedText = `${job.title || ""} ${job.description || ""} ${
//     job.company || ""
//   }`;

//   return {
//     ...job,
//     id: job.id || `${job.title}-${job.company}-${index}`,
//     title: safeText(job.title, "Untitled Role"),
//     company: safeText(job.company, "Company not listed"),
//     location: safeText(job.location, "Remote / USA"),
//     description: safeText(
//       job.description,
//       "Explore this role and apply directly through the job listing.",
//     ),
//     category: job.category || getCategory(combinedText),
//     isNew: job.isNew || isRecentJob(job, index),
//     postedLabel: getPostedLabel(job, index),
//   };
// }

// function categoryStyle(category) {
//   const map = {
//     SOC: "border-red-400/20 bg-red-500/15 text-red-200",
//     SIEM: "border-purple-400/20 bg-purple-500/15 text-purple-200",
//     Cloud: "border-blue-400/20 bg-blue-500/15 text-blue-200",
//     DevOps: "border-emerald-400/20 bg-emerald-500/15 text-emerald-200",
//     Linux: "border-yellow-400/20 bg-yellow-500/15 text-yellow-100",
//     IT: "border-slate-400/20 bg-slate-500/15 text-slate-200",
//   };

//   return map[category] || map.IT;
// }

// export default function CareerPage() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [sortBy, setSortBy] = useState("newest");
//   const [currentPage, setCurrentPage] = useState(1);

//   const jobsPerPage = 12;

//   const jobs = useMemo(() => {
//     return massiveJobsDatabase.map((job, index) => normalizeJob(job, index));
//   }, []);

//   const categories = useMemo(() => {
//     const cats = new Set(jobs.map((job) => job.category));
//     return ["All", "New", ...Array.from(cats).sort()];
//   }, [jobs]);

//   const newJobs = useMemo(() => {
//     return jobs.filter((job) => job.isNew).slice(0, 6);
//   }, [jobs]);

//   const featuredJobs = useMemo(() => {
//     return jobs
//       .filter(
//         (job) =>
//           job.isNew ||
//           job.category === "SIEM" ||
//           job.category === "SOC" ||
//           job.title.toLowerCase().includes("splunk"),
//       )
//       .slice(0, 3);
//   }, [jobs]);

//   const filteredJobs = useMemo(() => {
//     const search = searchTerm.toLowerCase();

//     let list = jobs.filter((job) => {
//       const matchesSearch =
//         job.title.toLowerCase().includes(search) ||
//         job.company.toLowerCase().includes(search) ||
//         job.location.toLowerCase().includes(search) ||
//         job.category.toLowerCase().includes(search) ||
//         job.description.toLowerCase().includes(search);

//       const matchesCategory =
//         selectedCategory === "All" ||
//         (selectedCategory === "New" && job.isNew) ||
//         job.category === selectedCategory;

//       return matchesSearch && matchesCategory;
//     });

//     if (sortBy === "newest") {
//       list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
//     }

//     if (sortBy === "title") {
//       list = [...list].sort((a, b) => a.title.localeCompare(b.title));
//     }

//     if (sortBy === "company") {
//       list = [...list].sort((a, b) => a.company.localeCompare(b.company));
//     }

//     return list;
//   }, [jobs, searchTerm, selectedCategory, sortBy]);

//   const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
//   const startIdx = (currentPage - 1) * jobsPerPage;
//   const paginatedJobs = filteredJobs.slice(startIdx, startIdx + jobsPerPage);

//   const socCount = jobs.filter((job) => job.category === "SOC").length;
//   const siemCount = jobs.filter((job) => job.category === "SIEM").length;
//   const remoteCount = jobs.filter((job) =>
//     job.location.toLowerCase().includes("remote"),
//   ).length;

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, selectedCategory, sortBy]);

//   function clearFilters() {
//     setSearchTerm("");
//     setSelectedCategory("All");
//     setSortBy("newest");
//   }

//   return (
//     <motion.main
//       variants={pageMotion}
//       initial="hidden"
//       animate="visible"
//       className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-10 text-white sm:px-8 lg:px-16"
//     >
//       {/* Background */}
//       <div className="absolute left-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full bg-purple-500/30 blur-[140px]" />
//       <div className="absolute bottom-[-240px] right-[-180px] h-[540px] w-[540px] rounded-full bg-blue-500/20 blur-[150px]" />
//       <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[160px]" />
//       <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

//       <div className="relative z-10 mx-auto max-w-[1600px] pt-16">
//         {/* ================= HERO ================= */}
//         <motion.section
//           variants={fadeUp}
//           className="mb-8 overflow-hidden rounded-[2.7rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-9"
//         >
//           <div className="grid gap-10 xl:grid-cols-[1fr_560px] xl:items-center">
//             <div>
//               <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
//                 <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-purple-700">
//                   <Briefcase size={16} />
//                 </span>
//                 <span className="text-xs font-black uppercase tracking-[0.25em] text-white/70">
//                   Career Opportunities Hub
//                 </span>
//               </div>

//               <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[1.03] tracking-tight md:text-7xl">
//                 Fresh Tech Jobs for Splunk, SOC, Cloud & DevOps Students.
//               </h1>

//               <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-white/60 md:text-lg">
//                 Help discover relevant roles after training.
//                 Browse curated Splunk, SIEM, security, cloud and IT roles across
//                 remote and USA opportunities.
//               </p>

//               <div className="mt-7 flex flex-wrap gap-3">
//                 <a
//                   href="#new-jobs"
//                   className="inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 font-black text-purple-700 transition hover:-translate-y-1 hover:bg-slate-100"
//                 >
//                   View New Jobs
//                   <ArrowUpRight size={18} />
//                 </a>

//                 <a
//                   href="#job-board"
//                   className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-white hover:text-purple-700"
//                 >
//                   Browse All Jobs
//                   <ExternalLink size={18} />
//                 </a>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <StatCard
//                 icon={<Briefcase />}
//                 value={`${jobs.length}+`}
//                 label="Total Jobs"
//               />
//               <StatCard icon={<Sparkles />} value={newJobs.length} label="New Jobs" />
//               <StatCard icon={<ShieldCheck />} value={socCount} label="SOC Roles" />
//               <StatCard icon={<Globe2 />} value={remoteCount} label="Remote Roles" />
//             </div>
//           </div>
//         </motion.section>

//         {/* ================= NEW JOBS SPOTLIGHT ================= */}
//         <motion.section id="new-jobs" variants={fadeUp} className="mb-8">
//           <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
//             <div>
//               <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-200">
//                 New Opportunities
//               </p>
//               <h2 className="mt-3 text-3xl font-black md:text-4xl">
//                 Jobs to show students first
//               </h2>
//             </div>

//             <button
//               onClick={() => setSelectedCategory("New")}
//               className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-black text-white transition hover:-translate-y-1 hover:bg-white hover:text-purple-700"
//             >
//               See All New Jobs
//               <ArrowUpRight size={18} />
//             </button>
//           </div>

//           <div className="grid gap-5 lg:grid-cols-3">
//             {featuredJobs.map((job, index) => (
//               <FeaturedJobCard key={job.id} job={job} index={index} />
//             ))}
//           </div>
//         </motion.section>

//         {/* ================= FILTERS ================= */}
//         <motion.section
//           id="job-board"
//           variants={fadeUp}
//           className="mb-8 rounded-[2.3rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl md:p-6"
//         >
//           <div className="grid gap-4 xl:grid-cols-[1fr_220px_140px]">
//             <div className="flex h-14 items-center gap-4 rounded-2xl border border-white/10 bg-black/25 px-5 transition focus-within:border-cyan-300/40">
//               <Search className="text-white/35" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search by title, company, location, skill..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="h-full w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30 md:text-base"
//               />
//             </div>

//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="h-14 rounded-2xl border border-white/10 bg-black/25 px-5 text-sm font-black text-white outline-none"
//             >
//               <option className="bg-slate-950" value="newest">
//                 Sort: Newest
//               </option>
//               <option className="bg-slate-950" value="title">
//                 Sort: Title
//               </option>
//               <option className="bg-slate-950" value="company">
//                 Sort: Company
//               </option>
//             </select>

//             <button
//               onClick={clearFilters}
//               className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-purple-700 transition hover:-translate-y-1"
//             >
//               <X size={16} />
//               Reset
//             </button>
//           </div>

//           <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
//             {categories.map((category) => (
//               <button
//                 key={category}
//                 onClick={() => setSelectedCategory(category)}
//                 className={`shrink-0 rounded-full px-5 py-3 text-sm font-black transition ${
//                   selectedCategory === category
//                     ? "bg-white text-purple-700 shadow-xl"
//                     : "border border-white/10 bg-white/5 text-white/60 hover:bg-white hover:text-purple-700"
//                 }`}
//               >
//                 {category === "New" ? "🔥 New Jobs" : category}
//               </button>
//             ))}
//           </div>

//           <div className="mt-5 grid gap-4 md:grid-cols-4">
//             <MiniStat icon={<Filter />} label="Showing" value={filteredJobs.length} />
//             <MiniStat icon={<Layers3 />} label="Categories" value={categories.length - 2} />
//             <MiniStat icon={<TrendingUp />} label="SIEM Roles" value={siemCount} />
//             <MiniStat icon={<Users />} label="Page" value={`${currentPage}/${totalPages || 1}`} />
//           </div>
//         </motion.section>

//         {/* ================= JOB GRID ================= */}
//         <motion.section variants={fadeUp}>
//           <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//             <div>
//               <h2 className="text-2xl font-black md:text-3xl">
//                 {selectedCategory === "All"
//                   ? "All Career Opportunities"
//                   : selectedCategory === "New"
//                     ? "New Job Opportunities"
//                     : `${selectedCategory} Jobs`}
//               </h2>
//               <p className="mt-2 text-sm font-medium text-white/45">
//                 Showing {paginatedJobs.length} of {filteredJobs.length} matching jobs.
//               </p>
//             </div>
//           </div>

//           {paginatedJobs.length > 0 ? (
//             <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
//               {paginatedJobs.map((job, index) => (
//                 <JobCard key={`${job.id}-${index}`} job={job} index={index} />
//               ))}
//             </div>
//           ) : (
//             <EmptyState clearFilters={clearFilters} />
//           )}
//         </motion.section>

//         {/* ================= PAGINATION ================= */}
//         {totalPages > 1 && (
//           <motion.div
//             variants={fadeUp}
//             className="mt-10 flex flex-col items-center justify-between gap-5 rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-2xl md:flex-row"
//           >
//             <p className="text-sm font-semibold text-white/50">
//               Showing {startIdx + 1} to{" "}
//               {Math.min(startIdx + jobsPerPage, filteredJobs.length)} of{" "}
//               <span className="font-black text-cyan-200">
//                 {filteredJobs.length}
//               </span>{" "}
//               jobs
//             </p>

//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                 disabled={currentPage === 1}
//                 className="flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-black text-white transition hover:bg-white hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 <ChevronLeft size={18} />
//                 Prev
//               </button>

//               <span className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-purple-700">
//                 {currentPage} / {totalPages}
//               </span>

//               <button
//                 onClick={() =>
//                   setCurrentPage(Math.min(totalPages, currentPage + 1))
//                 }
//                 disabled={currentPage === totalPages}
//                 className="flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-black text-white transition hover:bg-white hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 Next
//                 <ChevronRight size={18} />
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {/* ================= FOOTER NOTE ================= */}
//         <motion.div
//           variants={fadeUp}
//           className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl"
//         >
//           <p className="text-sm font-medium leading-7 text-white/45">
//             Jobs are displayed from your local jobs database. For truly live job
//             updates, connect this page to a backend job scraper or a jobs API.
//           </p>
//         </motion.div>
//       </div>
//     </motion.main>
//   );
// }

// /* ===============================
//    FEATURED JOB CARD
// =============================== */
// function FeaturedJobCard({ job }) {
//   return (
//     <motion.a
//       href={job.url}
//       target="_blank"
//       rel="noopener noreferrer"
//       whileHover={{ y: -8 }}
//       className="group relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl transition hover:bg-white/[0.14]"
//     >
//       <div className="absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />

//       <div className="relative z-10">
//         <div className="mb-5 flex items-center justify-between gap-3">
//           <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-200">
//             <Flame size={14} />
//             New
//           </span>

//           <span
//             className={`rounded-full border px-4 py-2 text-xs font-black ${categoryStyle(
//               job.category,
//             )}`}
//           >
//             {job.category}
//           </span>
//         </div>

//         <h3 className="line-clamp-2 text-2xl font-black leading-tight text-white group-hover:text-cyan-200">
//           {job.title}
//         </h3>

//         <div className="mt-5 space-y-3">
//           <p className="flex items-center gap-3 text-sm font-bold text-white/60">
//             <Building2 size={17} />
//             {job.company}
//           </p>

//           <p className="flex items-center gap-3 text-sm font-bold text-white/60">
//             <MapPin size={17} />
//             {job.location}
//           </p>

//           <p className="flex items-center gap-3 text-sm font-bold text-white/60">
//             <Clock size={17} />
//             {job.postedLabel}
//           </p>
//         </div>

//         <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
//           <span className="font-black text-cyan-200">Apply Now</span>
//           <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-purple-700 transition group-hover:translate-x-1">
//             <ArrowUpRight size={18} />
//           </span>
//         </div>
//       </div>
//     </motion.a>
//   );
// }

// /* ===============================
//    JOB CARD
// =============================== */
// function JobCard({ job }) {
//   return (
//     <motion.a
//       href={job.url}
//       target="_blank"
//       rel="noopener noreferrer"
//       whileHover={{ y: -8 }}
//       transition={{ duration: 0.25 }}
//       className="group relative flex min-h-[310px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:bg-white/[0.14]"
//     >
//       <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 transition group-hover:opacity-100" />

//       <div className="relative z-10 flex flex-1 flex-col">
//         <div className="mb-5 flex items-start justify-between gap-3">
//           <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-purple-700">
//             <Briefcase size={21} />
//           </div>

//           <div className="flex flex-wrap justify-end gap-2">
//             {job.isNew && (
//               <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-black text-orange-200">
//                 New
//               </span>
//             )}

//             <span
//               className={`rounded-full border px-3 py-1 text-xs font-black ${categoryStyle(
//                 job.category,
//               )}`}
//             >
//               {job.category}
//             </span>
//           </div>
//         </div>

//         <h2 className="line-clamp-2 text-xl font-black leading-tight text-white transition group-hover:text-cyan-200">
//           {job.title}
//         </h2>

//         <p className="mt-4 flex items-center gap-3 text-sm font-bold text-white/55">
//           <Building2 size={16} />
//           <span className="line-clamp-1">{job.company}</span>
//         </p>

//         <p className="mt-3 flex items-center gap-3 text-sm font-bold text-white/55">
//           <MapPin size={16} />
//           <span className="line-clamp-1">{job.location}</span>
//         </p>

//         <p className="mt-3 flex items-center gap-3 text-sm font-bold text-white/45">
//           <Clock size={16} />
//           {job.postedLabel}
//         </p>

//         <p className="mt-4 line-clamp-3 text-sm font-medium leading-7 text-white/45">
//           {job.description}
//         </p>

//         <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5">
//           <span className="inline-flex items-center gap-2 text-sm font-black text-cyan-200">
//             <ExternalLink size={16} />
//             Apply Now
//           </span>

//           <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition group-hover:bg-white group-hover:text-purple-700">
//             <ArrowUpRight size={18} />
//           </span>
//         </div>
//       </div>
//     </motion.a>
//   );
// }

// /* ===============================
//    STATS
// =============================== */
// function StatCard({ icon, value, label }) {
//   return (
//     <div className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10">
//       <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-purple-700">
//         {React.cloneElement(icon, { size: 21 })}
//       </div>

//       <h3 className="truncate text-3xl font-black text-white">{value}</h3>

//       <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/40">
//         {label}
//       </p>
//     </div>
//   );
// }

// function MiniStat({ icon, value, label }) {
//   return (
//     <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
//       <div className="mb-3 text-cyan-200">
//         {React.cloneElement(icon, { size: 18 })}
//       </div>

//       <p className="text-2xl font-black text-white">{value}</p>

//       <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/35">
//         {label}
//       </p>
//     </div>
//   );
// }

// /* ===============================
//    EMPTY STATE
// =============================== */
// function EmptyState({ clearFilters }) {
//   return (
//     <div className="rounded-[2.3rem] border border-white/10 bg-white/10 p-10 text-center shadow-2xl shadow-black/20 backdrop-blur-2xl">
//       <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-purple-700">
//         <Search size={24} />
//       </div>

//       <h3 className="mt-6 text-3xl font-black text-white">No jobs found</h3>

//       <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-white/50">
//         Try another keyword, change your category filter, or reset the search.
//       </p>

//       <button
//         onClick={clearFilters}
//         className="mt-7 rounded-2xl bg-white px-7 py-4 font-black text-purple-700 transition hover:-translate-y-1"
//       >
//         Reset Filters
//       </button>
//     </div>
//   );
// }
