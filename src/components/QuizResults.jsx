import { useEffect, useState } from "react";

const QuizResults = () => {
  const api = import.meta.env.VITE_HOME_OO;
  const storedUser = localStorage.getItem("user");
  let userEmail = "";
 const [darkMode, setDarkMode] = useState(false);
  try {
    const parsed = JSON.parse(storedUser);
    userEmail = parsed?.email || parsed?.username || "";
  } catch {
    userEmail = storedUser || "";
  }

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`${api}/api/quiz/my-scores/${userEmail}`);
        const data = await res.json();
        console.log(data);

        if (!Array.isArray(data)) {
          console.warn("Expected an array but got:", data);
          setResults([]);
          return;
        }

        const userResults = data.filter(
          (r) => r.username?.toLowerCase() === userEmail.toLowerCase()
        );
        setResults(userResults.reverse());
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) fetchResults();
  }, [userEmail]);

  if (loading)
    return (
      <div className="text-center text-white p-4">
        Loading your past test scores...
      </div>
    );

  if (!results.length)
    return (
      <div className="text-center p-6 mt-20 min-h-screen md:pt-32">
        <h2 className="text-xl font-bold mb-2">No Quiz Attempts Found 😅</h2>
        <p>Take your first Splunk test to see your results here.</p>
      </div>
    );

  return (
    <>
         <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow flex items-center justify-between">
              {/* LEFT SIDE - TITLE */}
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  To-Analytics Learning Portal
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Professional Splunk Bootcamp Dashboard
                </p>
              </div>
    
              {/* RIGHT SIDE - ACTIONS */}
              <div className="flex items-center gap-4">
                {/* User Email */}
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {userEmail}
                </div>
    
                {/* Profile Button */}
                {/* <button
                  onClick={() => setProfileOpen(true)}
                  className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  My Profile
                </button> */}
    
    <DashboardDropdown/>
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="px-3 py-1 rounded text-sm 
            bg-gray-200 text-gray-800 
            dark:bg-gray-800 dark:text-white
            hover:opacity-90 transition"
                >
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
            </div>
          </div>
    
    
   
    <div className="p-6 bg-gray-900 text-white rounded-lg max-w-3xl mx-auto mt-20 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-400">
        Your Past Quiz Scores 🧠
      </h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800 text-left">
            <th className="p-2 border-b border-gray-700">#</th>
            <th className="p-2 border-b border-gray-700">Score</th>
            <th className="p-2 border-b border-gray-700">Test Name</th>
            <th className="p-2 border-b border-gray-700">Total Questions</th>
            <th className="p-2 border-b border-gray-700">Total</th>
            <th className="p-2 border-b border-gray-700">Date Taken</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, index) => {
            const testName = r.testName || "Untitled Test";
            const total = Number(r.totalQuestions) || 0;
            const score = Number(r.score) || 0;
            const date = r.dateTaken
              ? new Date(r.dateTaken).toLocaleString()
              : "N/A";

            return (
              <tr key={index} className="hover:bg-gray-800 transition-colors">
                <td className="p-2 border-b border-gray-700">{index + 1}</td>
                <td className="p-2 border-b border-gray-700">{score}</td>
                <td className="p-2 border-b border-gray-700">{testName}</td>
                <td className="p-2 border-b border-gray-700">{total}</td>
                <td className="p-2 border-b border-gray-700">
                  {score} / {total}
                </td>
                <td className="p-2 border-b border-gray-700">{date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
     </>
  );
};

export default QuizResults;


// import { useEffect, useState } from "react";

// const QuizResults = () => {
//   const api = import.meta.env.VITE_HOME_OO;
//   const storedUser = localStorage.getItem("user");
//   let userEmail = "";

//   try {
//     const parsed = JSON.parse(storedUser);
//     userEmail = parsed?.email || parsed?.username || "";
//   } catch {
//     userEmail = storedUser || "";
//   }

//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchResults = async () => {
//       try {
//         const res = await fetch(`${api}/api/quiz/my-scores/${userEmail}`);
//         const data = await res.json();
//         console.log(data);

//         if (!Array.isArray(data)) {
//           console.warn("Expected an array but got:", data);
//           setResults([]);
//           return;
//         }

//         // filter results by user email
//         const userResults = data.filter(
//           (r) => r.username?.toLowerCase() === userEmail.toLowerCase()
//         );
//         setResults(userResults.reverse()); // latest first
//       } catch (err) {
//         console.error("Error fetching results:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (userEmail) fetchResults();
//   }, [userEmail]);

//   if (loading)
//     return (
//       <div className="text-center text-white p-4">
//         Loading your past test scores...
//       </div>
//     );

//   if (!results.length)
//     return (
//       <div className="text-center p-6 mt-20 min-h-screen md:pt-32">
//         <h2 className="text-xl font-bold mb-2">No Quiz Attempts Found 😅</h2>
//         <p>Take your first Splunk test to see your results here.</p>
//       </div>
//     );

//   return (
//     <div className="p-6 bg-gray-900 text-white rounded-lg max-w-3xl mx-auto mt-20 shadow-xl">
//       <h2 className="text-2xl font-bold mb-6 text-center text-indigo-400">
//         Your Past Quiz Scores 🧠
//       </h2>

//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-gray-800 text-left">
//             <th className="p-2 border-b border-gray-700">#</th>
//             <th className="p-2 border-b border-gray-700">Date</th>
//             <th className="p-2 border-b border-gray-700">Score</th>
//             <th className="p-2 border-b border-gray-700">Total Questions</th>
//             <th className="p-2 border-b border-gray-700">Percentage</th>
//           </tr>
//         </thead>
//         <tbody>
//           {results.map((r, index) => {
//             const total = Number(r.totalQuestions) || 0;
//             const score = Number(r.score) || 0;
//             const percentNum = total > 0 ? (score / total) * 100 : 0;
//             const percent = percentNum.toFixed(1);
//             const date = r.dateTaken
//               ? new Date(r.dateTaken).toLocaleString()
//               : "N/A";

//             // ✅ Dynamic color thresholds
//             let colorClass = "text-red-400";
//             if (percentNum >= 70) colorClass = "text-green-400";
//             else if (percentNum >= 50) colorClass = "text-yellow-400";

//             return (
//               <tr key={index} className="hover:bg-gray-800 transition-colors">
//                 <td className="p-2 border-b border-gray-700">{index + 1}</td>
//                 <td className="p-2 border-b border-gray-700">{date}</td>
//                 <td className="p-2 border-b border-gray-700">{score}</td>
//                 <td className="p-2 border-b border-gray-700">{total}</td>
//                 <td
//                   className={`p-2 border-b border-gray-700 font-bold ${colorClass}`}
//                 >
//                   {percent}
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default QuizResults;





// const rawUser = localStorage.getItem("user");
  // let user = null;
  // try {
  //   user = JSON.parse(rawUser);
  // } catch {
  //   user = { email: rawUser };
  // }
  // const userEmail = user?.email || "";



  //   const handleSubmit = async () => {
//     let correctCount = 0;
//     const missed = [];

//     questions.forEach((q, index) => {
//       const userAnswer = answers[index];
//       const correctAnswers = Array.isArray(q.correct) ? q.correct : [q.correct];

//       if (correctAnswers.includes(userAnswer)) {
//         correctCount++;
//       } else {
//         missed.push({
//           question: q.question,
//           selected: userAnswer || "No answer",
//           correct: correctAnswers.join(", "),
//         });
//       }
//     });

//     const totalQuestions = questions.length;
//     const calculatedScore = Math.round((correctCount / totalQuestions) * 100);

//     setScore(calculatedScore);
//     setMissedQuestions(missed);
//     setSubmitted(true);

//     // ✅ Save result to backend
//     try {
//       await fetch("http://localhost:8000/api/quiz/save", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: userEmail,
//           testName: data.title || "Unknown Quiz",
//           score: calculatedScore,
//           totalQuestions,
//           missedQuestions: missed,
//         }),
//       });
//     } catch (err) {
//       console.error("Error saving quiz result:", err);
//     }
//   };