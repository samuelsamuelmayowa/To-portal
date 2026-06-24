import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
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
import { massiveJobsDatabase } from "../data/jobsData";

/* ---------- Category Mapping ---------- */
const CATEGORY_RULES = [
  { name: "SOC", match: ["soc", "security analyst", "incident response"] },
  { name: "SIEM", match: ["splunk", "siem", "log analysis"] },
  { name: "Cloud", match: ["cloud", "aws", "azure", "gcp"] },
  {
    name: "DevOps",
    match: ["devops", "kubernetes", "docker", "site reliability", "sre"],
  },
  { name: "Linux", match: ["linux", "sysadmin", "system administrator"] },
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

  return "IT";
}

function safeText(value, fallback = "") {
  return value || fallback;
}

function getJobDate(job) {
  return job.postedAt || job.datePosted || job.createdAt || job.updatedAt || "";
}

function isRecentJob(job, index) {
  const date = getJobDate(job);

  if (!date) {
    // If your jobs database has no date field, this still makes the first jobs appear as new.
    return index < 9;
  }

  const posted = new Date(date);
  if (Number.isNaN(posted.getTime())) return index < 9;

  const now = new Date();
  const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));

  return diffDays <= 14;
}

function getPostedLabel(job, index) {
  const date = getJobDate(job);

  if (!date) {
    return index < 9 ? "New" : "Recently added";
  }

  const posted = new Date(date);
  if (Number.isNaN(posted.getTime())) return "Recently added";

  const now = new Date();
  const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 14) return `${diffDays} days ago`;

  return "Older";
}

function normalizeJob(job, index) {
  const combinedText = `${job.title || ""} ${job.description || ""} ${
    job.company || ""
  }`;

  return {
    ...job,
    id: job.id || `${job.title}-${job.company}-${index}`,
    title: safeText(job.title, "Untitled Role"),
    company: safeText(job.company, "Company not listed"),
    location: safeText(job.location, "Remote / USA"),
    description: safeText(
      job.description,
      "Explore this role and apply directly through the job listing.",
    ),
    category: job.category || getCategory(combinedText),
    isNew: job.isNew || isRecentJob(job, index),
    postedLabel: getPostedLabel(job, index),
  };
}

function categoryStyle(category) {
  const map = {
    SOC: "border-red-400/20 bg-red-500/15 text-red-200",
    SIEM: "border-purple-400/20 bg-purple-500/15 text-purple-200",
    Cloud: "border-blue-400/20 bg-blue-500/15 text-blue-200",
    DevOps: "border-emerald-400/20 bg-emerald-500/15 text-emerald-200",
    Linux: "border-yellow-400/20 bg-yellow-500/15 text-yellow-100",
    IT: "border-slate-400/20 bg-slate-500/15 text-slate-200",
  };

  return map[category] || map.IT;
}

export default function CareerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const jobsPerPage = 12;

  const jobs = useMemo(() => {
    return massiveJobsDatabase.map((job, index) => normalizeJob(job, index));
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(jobs.map((job) => job.category));
    return ["All", "New", ...Array.from(cats).sort()];
  }, [jobs]);

  const newJobs = useMemo(() => {
    return jobs.filter((job) => job.isNew).slice(0, 6);
  }, [jobs]);

  const featuredJobs = useMemo(() => {
    return jobs
      .filter(
        (job) =>
          job.isNew ||
          job.category === "SIEM" ||
          job.category === "SOC" ||
          job.title.toLowerCase().includes("splunk"),
      )
      .slice(0, 3);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const search = searchTerm.toLowerCase();

    let list = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        job.location.toLowerCase().includes(search) ||
        job.category.toLowerCase().includes(search) ||
        job.description.toLowerCase().includes(search);

      const matchesCategory =
        selectedCategory === "All" ||
        (selectedCategory === "New" && job.isNew) ||
        job.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "newest") {
      list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    }

    if (sortBy === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortBy === "company") {
      list = [...list].sort((a, b) => a.company.localeCompare(b.company));
    }

    return list;
  }, [jobs, searchTerm, selectedCategory, sortBy]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIdx = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs.slice(startIdx, startIdx + jobsPerPage);

  const socCount = jobs.filter((job) => job.category === "SOC").length;
  const siemCount = jobs.filter((job) => job.category === "SIEM").length;
  const remoteCount = jobs.filter((job) =>
    job.location.toLowerCase().includes("remote"),
  ).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("All");
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
                Fresh Tech Jobs for Splunk, SOC, Cloud & DevOps Students.
              </h1>

              <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-white/60 md:text-lg">
                Help your students discover relevant roles after training.
                Browse curated Splunk, SIEM, security, cloud and IT roles across
                remote and USA opportunities.
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
                value={`${jobs.length}+`}
                label="Total Jobs"
              />
              <StatCard icon={<Sparkles />} value={newJobs.length} label="New Jobs" />
              <StatCard icon={<ShieldCheck />} value={socCount} label="SOC Roles" />
              <StatCard icon={<Globe2 />} value={remoteCount} label="Remote Roles" />
            </div>
          </div>
        </motion.section>

        {/* ================= NEW JOBS SPOTLIGHT ================= */}
        <motion.section id="new-jobs" variants={fadeUp} className="mb-8">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-200">
                New Opportunities
              </p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                Jobs to show students first
              </h2>
            </div>

            <button
              onClick={() => setSelectedCategory("New")}
              className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-black text-white transition hover:-translate-y-1 hover:bg-white hover:text-purple-700"
            >
              See All New Jobs
              <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {featuredJobs.map((job, index) => (
              <FeaturedJobCard key={job.id} job={job} index={index} />
            ))}
          </div>
        </motion.section>

        {/* ================= FILTERS ================= */}
        <motion.section
          id="job-board"
          variants={fadeUp}
          className="mb-8 rounded-[2.3rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl md:p-6"
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_220px_140px]">
            <div className="flex h-14 items-center gap-4 rounded-2xl border border-white/10 bg-black/25 px-5 transition focus-within:border-cyan-300/40">
              <Search className="text-white/35" size={20} />
              <input
                type="text"
                placeholder="Search by title, company, location, skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-full w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30 md:text-base"
              />
            </div>

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

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <MiniStat icon={<Filter />} label="Showing" value={filteredJobs.length} />
            <MiniStat icon={<Layers3 />} label="Categories" value={categories.length - 2} />
            <MiniStat icon={<TrendingUp />} label="SIEM Roles" value={siemCount} />
            <MiniStat icon={<Users />} label="Page" value={`${currentPage}/${totalPages || 1}`} />
          </div>
        </motion.section>

        {/* ================= JOB GRID ================= */}
        <motion.section variants={fadeUp}>
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black md:text-3xl">
                {selectedCategory === "All"
                  ? "All Career Opportunities"
                  : selectedCategory === "New"
                    ? "New Job Opportunities"
                    : `${selectedCategory} Jobs`}
              </h2>
              <p className="mt-2 text-sm font-medium text-white/45">
                Showing {paginatedJobs.length} of {filteredJobs.length} matching jobs.
              </p>
            </div>
          </div>

          {paginatedJobs.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedJobs.map((job, index) => (
                <JobCard key={`${job.id}-${index}`} job={job} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState clearFilters={clearFilters} />
          )}
        </motion.section>

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-center justify-between gap-5 rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-2xl md:flex-row"
          >
            <p className="text-sm font-semibold text-white/50">
              Showing {startIdx + 1} to{" "}
              {Math.min(startIdx + jobsPerPage, filteredJobs.length)} of{" "}
              <span className="font-black text-cyan-200">
                {filteredJobs.length}
              </span>{" "}
              jobs
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-black text-white transition hover:bg-white hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} />
                Prev
              </button>

              <span className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-purple-700">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-black text-white transition hover:bg-white hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= FOOTER NOTE ================= */}
        <motion.div
          variants={fadeUp}
          className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl"
        >
          <p className="text-sm font-medium leading-7 text-white/45">
            Jobs are displayed from your local jobs database. For truly live job
            updates, connect this page to a backend job scraper or a jobs API.
          </p>
        </motion.div>
      </div>
    </motion.main>
  );
}

/* ===============================
   FEATURED JOB CARD
=============================== */
function FeaturedJobCard({ job }) {
  return (
    <motion.a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl transition hover:bg-white/[0.14]"
    >
      <div className="absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-200">
            <Flame size={14} />
            New
          </span>

          <span
            className={`rounded-full border px-4 py-2 text-xs font-black ${categoryStyle(
              job.category,
            )}`}
          >
            {job.category}
          </span>
        </div>

        <h3 className="line-clamp-2 text-2xl font-black leading-tight text-white group-hover:text-cyan-200">
          {job.title}
        </h3>

        <div className="mt-5 space-y-3">
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
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <span className="font-black text-cyan-200">Apply Now</span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-purple-700 transition group-hover:translate-x-1">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
    </motion.a>
  );
}

/* ===============================
   JOB CARD
=============================== */
function JobCard({ job }) {
  return (
    <motion.a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
      className="group relative flex min-h-[310px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:bg-white/[0.14]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 transition group-hover:opacity-100" />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-purple-700">
            <Briefcase size={21} />
          </div>

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

        <h2 className="line-clamp-2 text-xl font-black leading-tight text-white transition group-hover:text-cyan-200">
          {job.title}
        </h2>

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

        <p className="mt-4 line-clamp-3 text-sm font-medium leading-7 text-white/45">
          {job.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5">
          <span className="inline-flex items-center gap-2 text-sm font-black text-cyan-200">
            <ExternalLink size={16} />
            Apply Now
          </span>

          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition group-hover:bg-white group-hover:text-purple-700">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
    </motion.a>
  );
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

// import React, { useEffect, useState, useMemo } from "react";
// import { motion } from "framer-motion";
// import { Briefcase, ExternalLink, Search } from "lucide-react";
// import { massiveJobsDatabase } from "../data/jobsData";

// /* ---------- Import massive jobs database (2,500+ positions) ---------- */
// // Jobs are pre-generated from jobsData.jsx

// /* ---------- Category Mapping ---------- */
// const CATEGORY_RULES = [
//   { name: "SOC", match: ["soc", "security analyst", "incident response"] },
//   { name: "SIEM", match: ["splunk", "siem", "log analysis"] },
//   { name: "Cloud", match: ["cloud", "aws", "azure", "gcp"] },
//   { name: "DevOps", match: ["devops", "kubernetes", "docker", "site reliability"] },
// ];

// /* ---------- Get Job Category ---------- */
// function getCategory(jobText) {
//   const lower = jobText.toLowerCase();

//   for (let category of CATEGORY_RULES) {
//     if (category.match.some(keyword => lower.includes(keyword))) {
//       return category.name;
//     }
//   }
//   return "IT";
// }

// /* ---------- USA Filter ---------- */
// function isUSAJob(location) {
//   if (!location) return false;
//   const text = location.toLowerCase();
//   return text.includes("usa") || text.includes("united states") || text.includes("remote");
// }

// /* ---------- Filter IT Jobs ---------- */
// const IT_KEYWORDS = [
//   "splunk",
//   "siem",
//   "security",
//   "soc",
//   "cloud",
//   "devops",
//   "linux",
//   "sysadmin",
//   "incident",
//   "log analysis",
// ];

// function filterITJobs(jobs) {
//   return jobs.filter((job) => {
//     const text = `${job.title} ${job.description || ""}`.toLowerCase();
//     const isIT = IT_KEYWORDS.some(keyword => text.includes(keyword));
//     const usaOnly = isUSAJob(job.location);

//     return isIT && usaOnly;
//   });
// }

// /* ---------- Category Tag UI ---------- */
// function CategoryTag({ category }) {
//   const COLORS = {
//     SOC: "bg-red-500/20 text-red-400 border-red-500/40",
//     SIEM: "bg-purple-500/20 text-purple-400 border-purple-500/40",
//     Cloud: "bg-blue-500/20 text-blue-400 border-blue-500/40",
//     DevOps: "bg-green-500/20 text-green-400 border-green-500/40",
//     IT: "bg-gray-500/20 text-gray-300 border-gray-500/40",
//   };

//   return (
//     <span
//       className={`text-xs px-2 py-1 rounded-full border ${COLORS[category]}`}
//     >
//       {category}
//     </span>
//   );
// }

// export default function CareerPage() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [currentPage, setCurrentPage] = useState(1);
//   const jobsPerPage = 12;

//   // Get unique categories from jobs database
//   const categories = useMemo(() => {
//     const cats = new Set(massiveJobsDatabase.map((job) => job.category));
//     return ["All", ...Array.from(cats).sort()];
//   }, []);

//   // Filter and search jobs
//   const filteredJobs = useMemo(() => {
//     return massiveJobsDatabase.filter((job) => {
//       const matchesSearch =
//         job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         job.location.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesCategory =
//         selectedCategory === "All" || job.category === selectedCategory;

//       return matchesSearch && matchesCategory;
//     });
//   }, [searchTerm, selectedCategory]);

//   // Pagination
//   const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
//   const startIdx = (currentPage - 1) * jobsPerPage;
//   const paginatedJobs = filteredJobs.slice(
//     startIdx,
//     startIdx + jobsPerPage
//   );

//   // Reset to page 1 when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, selectedCategory]);

//   return (
//     <div className="min-h-screen bg-[#0d1117] text-gray-100 py-16 px-4 sm:px-8 lg:px-16 mt-9">
//       {/* Header */}
//       <motion.div
//         className="max-w-6xl mx-auto text-center mb-12"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//       >
//         <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
//           🚀 2,500+ Job Opportunities
//         </h1>
//         <p className="mt-4 text-gray-400 text-base">
//           Splunk, Security, Cloud, DevOps, and IT careers across the USA
//         </p>
//         <p className="mt-2 text-sm text-gray-500">
//           Total Matches: <span className="text-purple-400 font-bold">{filteredJobs.length}</span> positions
//         </p>
//       </motion.div>

//       {/* Search Bar */}
//       <motion.div
//         className="max-w-6xl mx-auto mb-8"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5, delay: 0.1 }}
//       >
//         <div className="relative">
//           <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
//           <input
//             type="text"
//             placeholder="Search jobs by title, company, or location..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
//           />
//         </div>
//       </motion.div>

//       {/* Category Filter */}
//       <motion.div
//         className="max-w-6xl mx-auto mb-8 flex flex-wrap gap-2 justify-center"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5, delay: 0.2 }}
//       >
//         {categories.map((category) => (
//           <button
//             key={category}
//             onClick={() => setSelectedCategory(category)}
//             className={`px-4 py-2 rounded-full font-medium transition ${
//               selectedCategory === category
//                 ? "bg-purple-600 text-white"
//                 : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//             }`}
//           >
//             {category}
//           </button>
//         ))}
//       </motion.div>

//       {/* Jobs Grid */}
//       <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
//         {paginatedJobs.length > 0 ? (
//           paginatedJobs.map((job, idx) => (
//             <motion.a
//               key={`${job.title}-${job.company}-${idx}`}
//               href={job.url}
//               target="_blank"
//               rel="noopener noreferrer"
//               whileHover={{ y: -5, scale: 1.02 }}
//               transition={{ duration: 0.25 }}
//               className="group relative bg-gray-800/60 hover:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-700 hover:border-purple-500 transition"
//             >
//               <div className="flex flex-col gap-2 mb-3">
//                 <div className="flex items-start gap-2">
//                   <Briefcase className="w-5 h-5 text-purple-400 mt-1 shrink-0" />
//                   <h2 className="text-lg font-semibold text-white group-hover:text-purple-400 line-clamp-2">
//                     {job.title}
//                   </h2>
//                 </div>

//                 <div className="flex gap-2 flex-wrap">
//                   <CategoryTag category={job.category} />
//                 </div>
//               </div>

//               <p className="text-sm text-gray-400 mb-2 line-clamp-1">
//                 {job.company}
//               </p>

//               <p className="text-xs text-gray-500 mb-3">
//                 📍 {job.location}
//               </p>

//               <div className="flex items-center text-sm text-blue-400 group-hover:text-blue-300">
//                 <ExternalLink className="w-4 h-4 mr-1" />
//                 <span>Apply Now</span>
//               </div>

//               <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//             </motion.a>
//           ))
//         ) : (
//           <div className="col-span-full text-center py-12">
//             <p className="text-gray-400 text-lg">
//               No jobs found matching your criteria. Try adjusting your search.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <motion.div
//           className="max-w-6xl mx-auto flex items-center justify-center gap-4 mb-8"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           <button
//             onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//             disabled={currentPage === 1}
//             className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition"
//           >
//             ← Previous
//           </button>

//           <span className="text-gray-400">
//             Page {currentPage} of {totalPages}
//           </span>

//           <button
//             onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//             disabled={currentPage === totalPages}
//             className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition"
//           >
//             Next →
//           </button>
//         </motion.div>
//       )}

//       {/* Stats Footer */}
//       <motion.div
//         className="max-w-6xl mx-auto text-center text-sm text-gray-500 py-4 border-t border-gray-700"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5, delay: 0.3 }}
//       >
//         <p>
//           Showing {startIdx + 1} to {Math.min(startIdx + jobsPerPage, filteredJobs.length)} of{" "}
//           <span className="text-purple-400 font-bold">{filteredJobs.length}</span> jobs
//         </p>
//         <p className="mt-2">✨ Database updated with 2,500+ opportunities from top tech companies</p>
//       </motion.div>
//     </div>
//   );
// }


// // import React from "react";
// // import { motion } from "framer-motion";
// // import { Briefcase, ExternalLink } from "lucide-react";

// // const jobs = [
// //   {
// //     title: "Site Reliability Engineer – Fully Remote",
// //     company: "Splunk",
// //     location: "Remote",
// //     url: "https://www.splunk.com/en_us/careers/jobs/site-reliability-engineer-fully-32917.html",
// //   },
// //   {
// //     title: "Splunk Systems Engineer / Senior Advisor",
// //     company: "Peraton",
// //     location: "Annapolis Junction, Maryland, USA",
// //     url: "https://www.careers.peraton.com/jobs/splunk-systems-engineer-senior-advisor-annapolis-junction-maryland-159953-jobs–information-technology–",
// //   },
// //   {
// //     title: "Splunk Engineer (Hybrid)",
// //     company: "ClearanceJobs Listing",
// //     location: "USA (Hybrid)",
// //     url: "https://www.clearancejobs.com/jobs/8332199/splunk-engineer-hybrid",
// //   },
// //   {
// //     title: "Splunk Engineer – Maryland Listings",
// //     company: "Dice",
// //     location: "Maryland, USA",
// //     url: "https://www.dice.com/jobs/q-splunk-l-maryland-jobs",
// //   },
// //   {
// //     title: "Splunk Engineer – Remote Jobs",
// //     company: "Glassdoor",
// //     location: "Remote, USA",
// //     url: "https://www.glassdoor.com/Job/splunk-engineer-remote-jobs-SRCH_KO0%2C22.htm",
// //   },
// //   {
// //     title: "Remote Splunk Engineer – Indeed Listing A",
// //     company: "Indeed",
// //     location: "Remote, USA",
// //     url: "https://www.indeed.com/q-remote-splunk-engineer-jobs.html",
// //   },
// //   {
// //     title: "Splunk Engineer – Remote Jobs – Indeed B",
// //     company: "Indeed",
// //     location: "Remote, USA",
// //     url: "https://www.indeed.com/q-Splunk-Engineer-Remote-jobs.html",
// //   },
// //   {
// //     title: "Splunk Engineer – Remote Jobs – Indeed C",
// //     company: "Indeed",
// //     location: "Remote, USA",
// //     url: "https://www.indeed.com/q-Splunk-Engineer-Remote-jobs.html",
// //   },
// //   {
// //     title: "Splunk Engineer – Maryland Jobs – Indeed",
// //     company: "Indeed",
// //     location: "Maryland, USA",
// //     url: "https://www.indeed.com/q-splunk-engineer-l-maryland-jobs.html",
// //   },
// //   {
// //     title: "Splunk + Engineer – Remote Jobs",
// //     company: "Dice",
// //     location: "Remote, USA",
// //     url: "https://www.dice.com/jobs/q-splunk%2Bengineer%2Bremote-jobs",
// //   },
// // ];

// // export default function CareerPage() {
// //   return (
// //     <div className="min-h-screen bg-[#0d1117] text-gray-100 py-16 px-4 sm:px-8 lg:px-16 mt-9">
// //       <motion.div
// //         className="max-w-6xl mx-auto text-center mb-12"
// //         initial={{ opacity: 0, y: -20 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ duration: 0.6 }}
// //       >
// //         <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
// //           Career Opportunities
// //         </h1>
// //         <p className="mt-4 text-gray-400 text-base sm:text-lg">
// //           Explore live job listings in the Splunk ecosystem — from engineering
// //           to observability, security, and data analytics roles.
// //         </p>
// //       </motion.div>

// //       <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
// //         {jobs.map((job, idx) => (
// //           <motion.a
// //             key={idx}
// //             href={job.url}
// //             target="_blank"
// //             rel="noopener noreferrer"
// //             whileHover={{ y: -5, scale: 1.02 }}
// //             transition={{ duration: 0.25 }}
// //             className="group relative bg-gray-800/60 hover:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-700 hover:border-purple-500 transition-colors duration-300"
// //           >
// //             <div className="flex items-center gap-2 mb-3">
// //               <Briefcase className="w-5 h-5 text-purple-400" />
// //               <h2 className="text-lg font-semibold text-white group-hover:text-purple-400 transition">
// //                 {job.title}
// //               </h2>
// //             </div>
// //             <p className="text-sm text-gray-400 mb-2">
// //               {job.company} • {job.location}
// //             </p>
// //             <div className="flex items-center text-sm text-blue-400 group-hover:text-blue-300">
// //               <ExternalLink className="w-4 h-4 mr-1" />
// //               <span>Apply Now</span>
// //             </div>
// //             <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
// //           </motion.a>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }


// // // import React from 'react';

// // // const jobs = [
// // //   {
// // //     title: 'Site Reliability Engineer – Fully Remote',
// // //     company: 'Splunk',
// // //     location: 'Remote',
// // //     url: 'https://www.splunk.com/en_us/careers/jobs/site-reliability-engineer-fully-32917.html',
// // //   },
// // //   {
// // //     title: 'Splunk Systems Engineer / Senior Advisor',
// // //     company: 'Peraton',
// // //     location: 'Annapolis Junction, Maryland, USA',
// // //     url: 'https://www.careers.peraton.com/jobs/splunk-systems-engineer-senior-advisor-annapolis-junction-maryland-159953-jobs–information-technology–',
// // //   },
// // //   {
// // //     title: 'Splunk Engineer (Hybrid)',
// // //     company: 'ClearanceJobs Listing',
// // //     location: 'USA (Hybrid)',
// // //     url: 'https://www.clearancejobs.com/jobs/8332199/splunk-engineer-hybrid',
// // //   },
// // //   {
// // //     title: 'Splunk Engineer – Maryland Listings',
// // //     company: 'Dice',
// // //     location: 'Maryland, USA',
// // //     url: 'https://www.dice.com/jobs/q-splunk-l-maryland-jobs',
// // //   },
// // //   {
// // //     title: 'Splunk Engineer – Remote Jobs',
// // //     company: 'Glassdoor',
// // //     location: 'Remote, USA',
// // //     url: 'https://www.glassdoor.com/Job/splunk-engineer-remote-jobs-SRCH_KO0%2C22.htm',
// // //   },
// // //   {
// // //     title: 'Remote Splunk Engineer – Indeed Listing A',
// // //     company: 'Indeed',
// // //     location: 'Remote, USA',
// // //     url: 'https://www.indeed.com/q-remote-splunk-engineer-jobs.html',
// // //   },
// // //   {
// // //     title: 'Splunk Engineer – Remote Jobs – Indeed B',
// // //     company: 'Indeed',
// // //     location: 'Remote, USA',
// // //     url: 'https://www.indeed.com/q-Splunk-Engineer-Remote-jobs.html',
// // //   },
// // //   {
// // //     title: 'Splunk Engineer – Remote Jobs – Indeed C',
// // //     company: 'Indeed',
// // //     location: 'Remote, USA',
// // //     url: 'https://www.indeed.com/q-Splunk-Engineer-Remote-jobs.html',
// // //   },
// // //   {
// // //     title: 'Splunk Engineer – Maryland Jobs – Indeed',
// // //     company: 'Indeed',
// // //     location: 'Maryland, USA',
// // //     url: 'https://www.indeed.com/q-splunk-engineer-l-maryland-jobs.html',
// // //   },
// // //   {
// // //     title: 'Splunk + Engineer – Remote Jobs',
// // //     company: 'Dice',
// // //     location: 'Remote, USA',
// // //     url: 'https://www.dice.com/jobs/q-splunk%2Bengineer%2Bremote-jobs',
// // //   },
// // // ];

// // // export default function CareerPage() {
// // //   return (
// // //     <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
// // //       <div className="max-w-7xl mx-auto">
// // //         <h1 className="text-3xl font-bold mb-6">Career Opportunities – Splunk & Related Roles</h1>
// // //         <p className="mb-8 text-gray-300">Below are live job listings relevant to Splunk engineers and related roles. Click a listing to view and apply.</p>
// // //         <div className="space-y-4">
// // //           {jobs.map((job, idx) => (
// // //             <a
// // //               key={idx}
// // //               href={job.url}
// // //               target="_blank"
// // //               rel="noopener noreferrer"
// // //               className="block p-4 bg-gray-800 hover:bg-gray-700 rounded-md transition ease-in-out duration-150"
// // //             >
// // //               <h2 className="text-xl font-semibold">{job.title}</h2>
// // //               <p className="text-sm text-gray-400">{job.company} • {job.location}</p>
// // //             </a>
// // //           ))}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // const CareerPage = () => {
// // // //   return (

// // // //     // <div className='min-h-screen flex justify-center items-center md:text-3xl font-bold'>CAREER</div>
// // // //   )
// // // // }

// // // // export default CareerPage