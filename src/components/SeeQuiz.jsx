import React, { useEffect, useState } from "react";

const SeeQuiz = () => {
  const api = import.meta.env.VITE_HOME_OO;

  // ✅ Admin email
  const adminEmails = ["admin@gmail.com"];

  // ✅ Simulate the current logged-in user
  const storedUser = "admin@gmail.com";
  const userEmail = storedUser.toLowerCase();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      const isAdmin = adminEmails.includes(userEmail);

      if (!isAdmin) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      try {
        const endpoint = `${api}/api/all-scores`;
        const res = await fetch(endpoint);
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.warn("Expected array but got:", data);
          setResults([]);
          return;
        }

        // sort newest first
        setResults(data.reverse());
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [api, userEmail]);

  if (loading)
    return <div className="text-center text-white p-4">Loading quiz scores...</div>;

  if (accessDenied)
    return (
      <div className="text-center text-white p-8 bg-red-900 rounded-lg mt-10 max-w-lg mx-auto shadow-lg">
        <h2 className="text-2xl font-bold mb-3">Access Denied ❌</h2>
        <p>Only admin can view all quiz results.</p>
      </div>
    );

  if (!results.length)
    return (
      <div className="text-center text-white p-6 bg-gray-900 rounded-lg">
        <h2 className="text-xl font-bold mb-2">  No Quiz Results Found  </h2>
        <p>No quiz data yet.</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg max-w-5xl mx-auto mt-20 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-400">
        All Students’ Quiz Results 📊
      </h2>

      <table className="w-full border-collapse text-sm sm:text-base">
        <thead>
          <tr className="bg-gray-800 text-left text-indigo-300 uppercase">
            <th className="p-2 border-b border-gray-700">#</th>
            <th className="p-2 border-b border-gray-700">Student</th>
            <th className="p-2 border-b border-gray-700">Test Name</th>
            <th className="p-2 border-b border-gray-700">Score</th>
            <th className="p-2 border-b border-gray-700">Total</th>
            <th className="p-2 border-b border-gray-700">Percentage</th>
            <th className="p-2 border-b border-gray-700">Date Taken</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, index) => {
            const date = r.dateTaken
              ? new Date(r.dateTaken).toLocaleString()
              : "N/A";
            const percent = r.totalQuestions
              ? ((r.score / r.totalQuestions) * 100).toFixed(1)
              : "0.0";

            return (
              <tr
                key={index}
                className="hover:bg-gray-800 transition-colors border-b border-gray-700"
              >
                <td className="p-2">{index + 1}</td>
                <td className="p-2 font-semibold text-gray-200">
                  {r.username || "Unknown"}
                </td>
                <td className="p-2">{r.testName || "Untitled Test"}</td>
                <td className="p-2 font-bold">{r.score}</td>
                <td className="p-2">{r.totalQuestions || "N/A"}</td>
                <td
                  className={`p-2 font-bold ${
                    percent >= 50 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {percent}
                </td>
                <td className="p-2 text-gray-400">{date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SeeQuiz;
