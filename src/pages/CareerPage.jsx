import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Briefcase, ExternalLink, Search } from "lucide-react";
import { massiveJobsDatabase } from "../data/jobsData";

/* ---------- Import massive jobs database (2,500+ positions) ---------- */
// Jobs are pre-generated from jobsData.jsx

/* ---------- Category Mapping ---------- */
const CATEGORY_RULES = [
  { name: "SOC", match: ["soc", "security analyst", "incident response"] },
  { name: "SIEM", match: ["splunk", "siem", "log analysis"] },
  { name: "Cloud", match: ["cloud", "aws", "azure", "gcp"] },
  { name: "DevOps", match: ["devops", "kubernetes", "docker", "site reliability"] },
];

/* ---------- Get Job Category ---------- */
function getCategory(jobText) {
  const lower = jobText.toLowerCase();

  for (let category of CATEGORY_RULES) {
    if (category.match.some(keyword => lower.includes(keyword))) {
      return category.name;
    }
  }
  return "IT";
}

/* ---------- USA Filter ---------- */
function isUSAJob(location) {
  if (!location) return false;
  const text = location.toLowerCase();
  return text.includes("usa") || text.includes("united states") || text.includes("remote");
}

/* ---------- Filter IT Jobs ---------- */
const IT_KEYWORDS = [
  "splunk",
  "siem",
  "security",
  "soc",
  "cloud",
  "devops",
  "linux",
  "sysadmin",
  "incident",
  "log analysis",
];

function filterITJobs(jobs) {
  return jobs.filter((job) => {
    const text = `${job.title} ${job.description || ""}`.toLowerCase();
    const isIT = IT_KEYWORDS.some(keyword => text.includes(keyword));
    const usaOnly = isUSAJob(job.location);

    return isIT && usaOnly;
  });
}

/* ---------- Category Tag UI ---------- */
function CategoryTag({ category }) {
  const COLORS = {
    SOC: "bg-red-500/20 text-red-400 border-red-500/40",
    SIEM: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    Cloud: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    DevOps: "bg-green-500/20 text-green-400 border-green-500/40",
    IT: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full border ${COLORS[category]}`}
    >
      {category}
    </span>
  );
}

export default function CareerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 12;

  // Get unique categories from jobs database
  const categories = useMemo(() => {
    const cats = new Set(massiveJobsDatabase.map((job) => job.category));
    return ["All", ...Array.from(cats).sort()];
  }, []);

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    return massiveJobsDatabase.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || job.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIdx = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs.slice(
    startIdx,
    startIdx + jobsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 py-16 px-4 sm:px-8 lg:px-16 mt-9">
      {/* Header */}
      <motion.div
        className="max-w-6xl mx-auto text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          🚀 2,500+ Job Opportunities
        </h1>
        <p className="mt-4 text-gray-400 text-base">
          Splunk, Security, Cloud, DevOps, and IT careers across the USA
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Total Matches: <span className="text-purple-400 font-bold">{filteredJobs.length}</span> positions
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        className="max-w-6xl mx-auto mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search jobs by title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
          />
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        className="max-w-6xl mx-auto mb-8 flex flex-wrap gap-2 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              selectedCategory === category
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Jobs Grid */}
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {paginatedJobs.length > 0 ? (
          paginatedJobs.map((job, idx) => (
            <motion.a
              key={`${job.title}-${job.company}-${idx}`}
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="group relative bg-gray-800/60 hover:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-700 hover:border-purple-500 transition"
            >
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex items-start gap-2">
                  <Briefcase className="w-5 h-5 text-purple-400 mt-1 shrink-0" />
                  <h2 className="text-lg font-semibold text-white group-hover:text-purple-400 line-clamp-2">
                    {job.title}
                  </h2>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <CategoryTag category={job.category} />
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-2 line-clamp-1">
                {job.company}
              </p>

              <p className="text-xs text-gray-500 mb-3">
                📍 {job.location}
              </p>

              <div className="flex items-center text-sm text-blue-400 group-hover:text-blue-300">
                <ExternalLink className="w-4 h-4 mr-1" />
                <span>Apply Now</span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.a>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">
              No jobs found matching your criteria. Try adjusting your search.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          className="max-w-6xl mx-auto flex items-center justify-center gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition"
          >
            ← Previous
          </button>

          <span className="text-gray-400">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition"
          >
            Next →
          </button>
        </motion.div>
      )}

      {/* Stats Footer */}
      <motion.div
        className="max-w-6xl mx-auto text-center text-sm text-gray-500 py-4 border-t border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <p>
          Showing {startIdx + 1} to {Math.min(startIdx + jobsPerPage, filteredJobs.length)} of{" "}
          <span className="text-purple-400 font-bold">{filteredJobs.length}</span> jobs
        </p>
        <p className="mt-2">✨ Database updated with 2,500+ opportunities from top tech companies</p>
      </motion.div>
    </div>
  );
}


// import React from "react";
// import { motion } from "framer-motion";
// import { Briefcase, ExternalLink } from "lucide-react";

// const jobs = [
//   {
//     title: "Site Reliability Engineer – Fully Remote",
//     company: "Splunk",
//     location: "Remote",
//     url: "https://www.splunk.com/en_us/careers/jobs/site-reliability-engineer-fully-32917.html",
//   },
//   {
//     title: "Splunk Systems Engineer / Senior Advisor",
//     company: "Peraton",
//     location: "Annapolis Junction, Maryland, USA",
//     url: "https://www.careers.peraton.com/jobs/splunk-systems-engineer-senior-advisor-annapolis-junction-maryland-159953-jobs–information-technology–",
//   },
//   {
//     title: "Splunk Engineer (Hybrid)",
//     company: "ClearanceJobs Listing",
//     location: "USA (Hybrid)",
//     url: "https://www.clearancejobs.com/jobs/8332199/splunk-engineer-hybrid",
//   },
//   {
//     title: "Splunk Engineer – Maryland Listings",
//     company: "Dice",
//     location: "Maryland, USA",
//     url: "https://www.dice.com/jobs/q-splunk-l-maryland-jobs",
//   },
//   {
//     title: "Splunk Engineer – Remote Jobs",
//     company: "Glassdoor",
//     location: "Remote, USA",
//     url: "https://www.glassdoor.com/Job/splunk-engineer-remote-jobs-SRCH_KO0%2C22.htm",
//   },
//   {
//     title: "Remote Splunk Engineer – Indeed Listing A",
//     company: "Indeed",
//     location: "Remote, USA",
//     url: "https://www.indeed.com/q-remote-splunk-engineer-jobs.html",
//   },
//   {
//     title: "Splunk Engineer – Remote Jobs – Indeed B",
//     company: "Indeed",
//     location: "Remote, USA",
//     url: "https://www.indeed.com/q-Splunk-Engineer-Remote-jobs.html",
//   },
//   {
//     title: "Splunk Engineer – Remote Jobs – Indeed C",
//     company: "Indeed",
//     location: "Remote, USA",
//     url: "https://www.indeed.com/q-Splunk-Engineer-Remote-jobs.html",
//   },
//   {
//     title: "Splunk Engineer – Maryland Jobs – Indeed",
//     company: "Indeed",
//     location: "Maryland, USA",
//     url: "https://www.indeed.com/q-splunk-engineer-l-maryland-jobs.html",
//   },
//   {
//     title: "Splunk + Engineer – Remote Jobs",
//     company: "Dice",
//     location: "Remote, USA",
//     url: "https://www.dice.com/jobs/q-splunk%2Bengineer%2Bremote-jobs",
//   },
// ];

// export default function CareerPage() {
//   return (
//     <div className="min-h-screen bg-[#0d1117] text-gray-100 py-16 px-4 sm:px-8 lg:px-16 mt-9">
//       <motion.div
//         className="max-w-6xl mx-auto text-center mb-12"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//       >
//         <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
//           Career Opportunities
//         </h1>
//         <p className="mt-4 text-gray-400 text-base sm:text-lg">
//           Explore live job listings in the Splunk ecosystem — from engineering
//           to observability, security, and data analytics roles.
//         </p>
//       </motion.div>

//       <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {jobs.map((job, idx) => (
//           <motion.a
//             key={idx}
//             href={job.url}
//             target="_blank"
//             rel="noopener noreferrer"
//             whileHover={{ y: -5, scale: 1.02 }}
//             transition={{ duration: 0.25 }}
//             className="group relative bg-gray-800/60 hover:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-700 hover:border-purple-500 transition-colors duration-300"
//           >
//             <div className="flex items-center gap-2 mb-3">
//               <Briefcase className="w-5 h-5 text-purple-400" />
//               <h2 className="text-lg font-semibold text-white group-hover:text-purple-400 transition">
//                 {job.title}
//               </h2>
//             </div>
//             <p className="text-sm text-gray-400 mb-2">
//               {job.company} • {job.location}
//             </p>
//             <div className="flex items-center text-sm text-blue-400 group-hover:text-blue-300">
//               <ExternalLink className="w-4 h-4 mr-1" />
//               <span>Apply Now</span>
//             </div>
//             <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//           </motion.a>
//         ))}
//       </div>
//     </div>
//   );
// }


// // import React from 'react';

// // const jobs = [
// //   {
// //     title: 'Site Reliability Engineer – Fully Remote',
// //     company: 'Splunk',
// //     location: 'Remote',
// //     url: 'https://www.splunk.com/en_us/careers/jobs/site-reliability-engineer-fully-32917.html',
// //   },
// //   {
// //     title: 'Splunk Systems Engineer / Senior Advisor',
// //     company: 'Peraton',
// //     location: 'Annapolis Junction, Maryland, USA',
// //     url: 'https://www.careers.peraton.com/jobs/splunk-systems-engineer-senior-advisor-annapolis-junction-maryland-159953-jobs–information-technology–',
// //   },
// //   {
// //     title: 'Splunk Engineer (Hybrid)',
// //     company: 'ClearanceJobs Listing',
// //     location: 'USA (Hybrid)',
// //     url: 'https://www.clearancejobs.com/jobs/8332199/splunk-engineer-hybrid',
// //   },
// //   {
// //     title: 'Splunk Engineer – Maryland Listings',
// //     company: 'Dice',
// //     location: 'Maryland, USA',
// //     url: 'https://www.dice.com/jobs/q-splunk-l-maryland-jobs',
// //   },
// //   {
// //     title: 'Splunk Engineer – Remote Jobs',
// //     company: 'Glassdoor',
// //     location: 'Remote, USA',
// //     url: 'https://www.glassdoor.com/Job/splunk-engineer-remote-jobs-SRCH_KO0%2C22.htm',
// //   },
// //   {
// //     title: 'Remote Splunk Engineer – Indeed Listing A',
// //     company: 'Indeed',
// //     location: 'Remote, USA',
// //     url: 'https://www.indeed.com/q-remote-splunk-engineer-jobs.html',
// //   },
// //   {
// //     title: 'Splunk Engineer – Remote Jobs – Indeed B',
// //     company: 'Indeed',
// //     location: 'Remote, USA',
// //     url: 'https://www.indeed.com/q-Splunk-Engineer-Remote-jobs.html',
// //   },
// //   {
// //     title: 'Splunk Engineer – Remote Jobs – Indeed C',
// //     company: 'Indeed',
// //     location: 'Remote, USA',
// //     url: 'https://www.indeed.com/q-Splunk-Engineer-Remote-jobs.html',
// //   },
// //   {
// //     title: 'Splunk Engineer – Maryland Jobs – Indeed',
// //     company: 'Indeed',
// //     location: 'Maryland, USA',
// //     url: 'https://www.indeed.com/q-splunk-engineer-l-maryland-jobs.html',
// //   },
// //   {
// //     title: 'Splunk + Engineer – Remote Jobs',
// //     company: 'Dice',
// //     location: 'Remote, USA',
// //     url: 'https://www.dice.com/jobs/q-splunk%2Bengineer%2Bremote-jobs',
// //   },
// // ];

// // export default function CareerPage() {
// //   return (
// //     <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
// //       <div className="max-w-7xl mx-auto">
// //         <h1 className="text-3xl font-bold mb-6">Career Opportunities – Splunk & Related Roles</h1>
// //         <p className="mb-8 text-gray-300">Below are live job listings relevant to Splunk engineers and related roles. Click a listing to view and apply.</p>
// //         <div className="space-y-4">
// //           {jobs.map((job, idx) => (
// //             <a
// //               key={idx}
// //               href={job.url}
// //               target="_blank"
// //               rel="noopener noreferrer"
// //               className="block p-4 bg-gray-800 hover:bg-gray-700 rounded-md transition ease-in-out duration-150"
// //             >
// //               <h2 className="text-xl font-semibold">{job.title}</h2>
// //               <p className="text-sm text-gray-400">{job.company} • {job.location}</p>
// //             </a>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // const CareerPage = () => {
// // //   return (

// // //     // <div className='min-h-screen flex justify-center items-center md:text-3xl font-bold'>CAREER</div>
// // //   )
// // // }

// // // export default CareerPage