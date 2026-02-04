import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Briefcase, ExternalLink, Search, Loader } from "lucide-react";
import { massiveJobsDatabase } from "../data/jobsData";

export default function NextxCareerPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLocalData, setIsLocalData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 12;

  // Fetch jobs from Nexxt.com API or fallback to local data
  useEffect(() => {
    const fetchJobsFromNextx = async () => {
      try {
        setLoading(true);

        // Try to fetch from Nexxt.com with a CORS proxy or direct approach
        const corsProxyUrl = "https://cors-anywhere.herokuapp.com/";
        const nexxtUrl = "https://www.nexxt.com/api/jobs";

        try {
          // Attempt 1: Try direct fetch with simple headers
          const response = await fetch(nexxtUrl, {
            method: "GET",
            headers: {
              "Accept": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            const jobsData = data.jobs || data.data || [];

            if (jobsData.length > 0) {
              const formattedJobs = jobsData.map((job) => ({
                id: job.id || Math.random(),
                title: job.title || job.job_title || "Job Title",
                company: job.company || job.company_name || "Unknown",
                location:
                  job.location ||
                  (job.city ? job.city + (job.state ? ", " + job.state : "") + ", USA" : "USA"),
                url: job.url || job.link || `https://www.nexxt.com/jobs/${job.id}`,
                category: job.category || job.job_type || "IT",
                description: job.description || job.summary || "",
                salary: job.salary || "",
                posted: job.posted_date || "",
              }));

              setJobs(formattedJobs);
              setIsLocalData(false);
              setError(null);
              setLoading(false);
              return;
            }
          }
        } catch (directErr) {
          console.log("Direct fetch failed, using fallback data");
        }

        // Fallback: Use local jobs database
        console.log("Using local jobs database as fallback");
        setJobs(massiveJobsDatabase);
        setIsLocalData(true);
        setError(null);
      } catch (err) {
        console.error("Error in job fetching:", err);
        // Final fallback: use local database
        setJobs(massiveJobsDatabase);
        setIsLocalData(true);
        setError(
          "Nexxt.com API unavailable. Showing local job database instead."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobsFromNextx();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(jobs.map((job) => job.category).filter(Boolean));
    return ["All", ...Array.from(cats).sort()];
  }, [jobs]);

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || job.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, jobs]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIdx = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs.slice(startIdx, startIdx + jobsPerPage);

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
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
          🌍 Job Opportunities
        </h1>
        <p className="mt-4 text-gray-400 text-base">
          {isLocalData
            ? "Premium job database with 2,500+ opportunities"
            : "Real-time jobs from Nexxt.com"}
        </p>
        {jobs.length > 0 && (
          <p className="mt-2 text-sm text-gray-500">
            Total Matches:{" "}
            <span className="text-blue-400 font-bold">{filteredJobs.length}</span> positions
          </p>
        )}
      </motion.div>

      {/* Fallback Notice */}
      {isLocalData && (
        <motion.div
          className="max-w-6xl mx-auto mb-8 bg-blue-900/20 border border-blue-500/40 rounded-lg p-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-blue-300 text-sm">
            ℹ️ Using local job database. For direct Nexxt.com integration, set up a backend proxy.
          </p>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-6xl mx-auto text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Loader className="w-8 h-8 text-blue-400" />
          </motion.div>
          <p className="mt-4 text-gray-400">Loading job opportunities...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          className="max-w-6xl mx-auto bg-blue-900/20 border border-blue-500/40 rounded-lg p-6 text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-blue-300 font-medium">{error}</p>
          <p className="text-gray-400 text-sm mt-2">
            Don't worry - we're showing premium local jobs instead!
          </p>
        </motion.div>
      )}

      {/* Content */}
      {!loading && jobs.length > 0 && (
        <>
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
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </motion.div>

          {/* Category Filter */}
          {categories.length > 1 && (
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
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          )}

          {/* Jobs Grid */}
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((job) => (
                <motion.a
                  key={job.id}
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className="group relative bg-gray-800/60 hover:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-700 hover:border-blue-500 transition"
                >
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
                      <h2 className="text-lg font-semibold text-white group-hover:text-blue-400 line-clamp-2">
                        {job.title}
                      </h2>
                    </div>

                    {job.category && (
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          {job.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 mb-2 line-clamp-1">
                    {job.company}
                  </p>

                  <p className="text-xs text-gray-500 mb-2">
                    📍 {job.location}
                  </p>

                  {job.salary && (
                    <p className="text-xs text-green-400 mb-2">
                      💰 {job.salary}
                    </p>
                  )}

                  <div className="flex items-center text-sm text-cyan-400 group-hover:text-cyan-300">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    <span>View Job</span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
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
              Showing {startIdx + 1} to{" "}
              {Math.min(startIdx + jobsPerPage, filteredJobs.length)} of{" "}
              <span className="text-blue-400 font-bold">{filteredJobs.length}</span> jobs
            </p>
            <p className="mt-2">
              🔗{" "}
              {isLocalData
                ? "Premium job database"
                : "Powered by Nexxt.com"}
            </p>
          </motion.div>
        </>
      )}

      {/* No Jobs Available */}
      {!loading && !error && jobs.length === 0 && (
        <motion.div
          className="max-w-6xl mx-auto text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-400 text-lg mb-4">
            No jobs available at the moment.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
          >
            Try Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
