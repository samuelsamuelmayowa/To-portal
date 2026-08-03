import { useEffect, useMemo, useState } from "react";

import {
  FaChartLine,
  FaCheckCircle,
  FaClipboardList,
  FaSearch,
  FaUsers,
} from "react-icons/fa";

const PAGE_SIZE = 10;

const calculatePercentage = (score, totalQuestions) => {
  const safeScore = Number(score) || 0;
  const safeTotal = Number(totalQuestions) || 0;

  if (safeTotal <= 0) return 0;

  return (safeScore / safeTotal) * 100;
};

const formatResultDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const ResultStatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-500">{title}</p>

        <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          {value}
        </p>

        <p className="mt-1 text-xs font-medium text-slate-400">
          {description}
        </p>
      </div>

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClassName}`}
      >
        <Icon size={19} />
      </div>
    </div>
  </div>
);

const SeeQuiz = () => {
  const api = import.meta.env.VITE_HOME_OO;

  /*
    This email check is only visual protection.

    Your backend /api/all-scores endpoint must also verify that the
    request belongs to an authenticated administrator.
  */
  const adminEmails = ["admin@gmail.com"];
  const storedUser = "admin@gmail.com";
  const userEmail = storedUser.toLowerCase();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchResults = async () => {
      const isAdmin = adminEmails.includes(userEmail);

      if (!isAdmin) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      if (!api) {
        setFetchError("The VITE_HOME_OO API URL is not configured.");
        setLoading(false);
        return;
      }

      try {
        setFetchError("");

        const endpoint = `${api}/api/all-scores`;
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(
            `Unable to load quiz results. Server returned ${response.status}.`
          );
        }

        const responseData = await response.json();

        if (!Array.isArray(responseData)) {
          throw new Error("The quiz result response is not a valid array.");
        }

        const sortedResults = [...responseData].sort((first, second) => {
          const firstDate = new Date(first?.dateTaken || 0).getTime();
          const secondDate = new Date(second?.dateTaken || 0).getTime();

          return secondDate - firstDate;
        });

        setResults(sortedResults);
      } catch (error) {
        console.error("Error fetching results:", error);
        setFetchError(
          error.message || "An unexpected error occurred while loading results."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [api, userEmail]);

  const resultStatistics = useMemo(() => {
    const totalSubmissions = results.length;

    const percentages = results.map((result) =>
      calculatePercentage(result?.score, result?.totalQuestions)
    );

    const averagePercentage =
      percentages.length > 0
        ? percentages.reduce((sum, value) => sum + value, 0) /
          percentages.length
        : 0;

    const passedResults = percentages.filter(
      (percentage) => percentage >= 50
    ).length;

    const uniqueStudents = new Set(
      results
        .map((result) => result?.username?.trim().toLowerCase())
        .filter(Boolean)
    ).size;

    return {
      totalSubmissions,
      averagePercentage,
      passedResults,
      uniqueStudents,
    };
  }, [results]);

  const filteredResults = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return results.filter((result) => {
      const percentage = calculatePercentage(
        result?.score,
        result?.totalQuestions
      );

      const matchesSearch =
        !normalizedSearch ||
        [result?.username, result?.testName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesFilter =
        resultFilter === "all" ||
        (resultFilter === "passed" && percentage >= 50) ||
        (resultFilter === "failed" && percentage < 50);

      return matchesSearch && matchesFilter;
    });
  }, [resultFilter, results, searchValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, resultFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredResults.length / PAGE_SIZE)
  );

  const firstResultIndex = (currentPage - 1) * PAGE_SIZE;

  const paginatedResults = filteredResults.slice(
    firstResultIndex,
    firstResultIndex + PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-bold text-slate-600">
            Loading quiz results...
          </p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
          ⛔
        </div>

        <h2 className="mt-5 text-2xl font-black text-slate-950">
          Access denied
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Only authorized administrators can view students’ quiz results.
        </p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-xl font-black text-red-800">
          Results could not be loaded
        </h2>

        <p className="mt-2 text-sm text-red-600">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FaClipboardList size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              Students’ quiz results
            </h1>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Review student scores, performance percentages and submission
              history.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResultStatCard
          title="Submissions"
          value={resultStatistics.totalSubmissions}
          description="Total completed tests"
          icon={FaClipboardList}
          iconClassName="bg-indigo-50 text-indigo-600"
        />

        <ResultStatCard
          title="Average score"
          value={`${resultStatistics.averagePercentage.toFixed(1)}%`}
          description="Across all submissions"
          icon={FaChartLine}
          iconClassName="bg-purple-50 text-purple-600"
        />

        <ResultStatCard
          title="Passed"
          value={resultStatistics.passedResults}
          description="Scores of 50% and above"
          icon={FaCheckCircle}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <ResultStatCard
          title="Students"
          value={resultStatistics.uniqueStudents}
          description="Unique student names"
          icon={FaUsers}
          iconClassName="bg-amber-50 text-amber-600"
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Result records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredResults.length} result
              {filteredResults.length === 1 ? "" : "s"} found.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:w-72">
              <FaSearch
                size={14}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search student or test"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <select
              value={resultFilter}
              onChange={(event) => setResultFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="all">All results</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {paginatedResults.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FaClipboardList size={23} />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-900">
              No results found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              There are no quiz records matching your current search.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-[950px] w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "#",
                      "Student",
                      "Test name",
                      "Score",
                      "Percentage",
                      "Result",
                      "Date taken",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedResults.map((result, index) => {
                    const percentage = calculatePercentage(
                      result?.score,
                      result?.totalQuestions
                    );

                    const passed = percentage >= 50;

                    const resultKey =
                      result?.id ||
                      result?._id ||
                      `${result?.username}-${result?.testName}-${result?.dateTaken}-${index}`;

                    return (
                      <tr
                        key={resultKey}
                        className="transition hover:bg-indigo-50/40"
                      >
                        <td className="px-5 py-4 text-sm font-bold text-slate-400">
                          {firstResultIndex + index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-slate-900">
                            {result?.username || "Unknown student"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-600">
                          {result?.testName || "Untitled test"}
                        </td>

                        <td className="px-5 py-4 text-sm font-black text-slate-900">
                          {result?.score ?? 0}/
                          {result?.totalQuestions ?? 0}
                        </td>

                        <td className="px-5 py-4 text-sm font-black text-slate-800">
                          {percentage.toFixed(1)}%
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-xs font-black",
                              passed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700",
                            ].join(" ")}
                          >
                            {passed ? "Passed" : "Failed"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-500">
                          {formatResultDate(result?.dateTaken)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {paginatedResults.map((result, index) => {
                const percentage = calculatePercentage(
                  result?.score,
                  result?.totalQuestions
                );

                const passed = percentage >= 50;

                const resultKey =
                  result?.id ||
                  result?._id ||
                  `${result?.username}-${result?.testName}-${result?.dateTaken}-${index}`;

                return (
                  <article
                    key={resultKey}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-900">
                          {result?.username || "Unknown student"}
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {result?.testName || "Untitled test"}
                        </p>
                      </div>

                      <span
                        className={[
                          "shrink-0 rounded-full px-2.5 py-1 text-xs font-black",
                          passed
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700",
                        ].join(" ")}
                      >
                        {passed ? "Passed" : "Failed"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-400">
                          Score
                        </p>

                        <p className="mt-1 font-black text-slate-900">
                          {result?.score ?? 0}/
                          {result?.totalQuestions ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-400">
                          Percentage
                        </p>

                        <p className="mt-1 font-black text-slate-900">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs font-medium text-slate-400">
                      Taken {formatResultDate(result?.dateTaken)}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-center text-sm font-semibold text-slate-500 sm:text-left">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default SeeQuiz;
// import React, { useEffect, useState } from "react";

// const SeeQuiz = () => {
//   const api = import.meta.env.VITE_HOME_OO;

//   // ✅ Admin email
//   const adminEmails = ["admin@gmail.com"];

//   // ✅ Simulate the current logged-in user
//   const storedUser = "admin@gmail.com";
//   const userEmail = storedUser.toLowerCase();

//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [accessDenied, setAccessDenied] = useState(false);

//   useEffect(() => {
//     const fetchResults = async () => {
//       const isAdmin = adminEmails.includes(userEmail);

//       if (!isAdmin) {
//         setAccessDenied(true);
//         setLoading(false);
//         return;
//       }

//       try {
//         const endpoint = `${api}/api/all-scores`;
//         const res = await fetch(endpoint);
//         const data = await res.json();

//         if (!Array.isArray(data)) {
//           console.warn("Expected array but got:", data);
//           setResults([]);
//           return;
//         }

//         // sort newest first
//         setResults(data.reverse());
//       } catch (err) {
//         console.error("Error fetching results:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchResults();
//   }, [api, userEmail]);

//   if (loading)
//     return <div className="text-center text-white p-4">Loading quiz scores...</div>;

//   if (accessDenied)
//     return (
//       <div className="text-center text-white p-8 bg-red-900 rounded-lg mt-10 max-w-lg mx-auto shadow-lg">
//         <h2 className="text-2xl font-bold mb-3">Access Denied ❌</h2>
//         <p>Only admin can view all quiz results.</p>
//       </div>
//     );

//   if (!results.length)
//     return (
//       <div className="text-center text-white p-6 bg-gray-900 rounded-lg">
//         <h2 className="text-xl font-bold mb-2">  No Quiz Results Found  </h2>
//         <p>No quiz data yet.</p>
//       </div>
//     );

//   return (
//     <div className="p-6 bg-gray-900 text-white rounded-lg max-w-5xl mx-auto mt-20 shadow-xl">
//       <h2 className="text-2xl font-bold mb-6 text-center text-indigo-400">
//         All Students’ Quiz Results 📊
//       </h2>

//       <table className="w-full border-collapse text-sm sm:text-base">
//         <thead>
//           <tr className="bg-gray-800 text-left text-indigo-300 uppercase">
//             <th className="p-2 border-b border-gray-700">#</th>
//             <th className="p-2 border-b border-gray-700">Student</th>
//             <th className="p-2 border-b border-gray-700">Test Name</th>
//             <th className="p-2 border-b border-gray-700">Score</th>
//             <th className="p-2 border-b border-gray-700">Total</th>
//             <th className="p-2 border-b border-gray-700">Percentage</th>
//             <th className="p-2 border-b border-gray-700">Date Taken</th>
//           </tr>
//         </thead>
//         <tbody>
//           {results.map((r, index) => {
//             const date = r.dateTaken
//               ? new Date(r.dateTaken).toLocaleString()
//               : "N/A";
//             const percent = r.totalQuestions
//               ? ((r.score / r.totalQuestions) * 100).toFixed(1)
//               : "0.0";

//             return (
//               <tr
//                 key={index}
//                 className="hover:bg-gray-800 transition-colors border-b border-gray-700"
//               >
//                 <td className="p-2">{index + 1}</td>
//                 <td className="p-2 font-semibold text-gray-200">
//                   {r.username || "Unknown"}
//                 </td>
//                 <td className="p-2">{r.testName || "Untitled Test"}</td>
//                 <td className="p-2 font-bold">{r.score}</td>
//                 <td className="p-2">{r.totalQuestions || "N/A"}</td>
//                 <td
//                   className={`p-2 font-bold ${
//                     percent >= 50 ? "text-green-400" : "text-red-400"
//                   }`}
//                 >
//                   {percent}
//                 </td>
//                 <td className="p-2 text-gray-400">{date}</td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default SeeQuiz;
