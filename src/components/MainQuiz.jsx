import { useEffect, useState } from "react";
import Quiz from "./Quiz";
import { NavLink } from "react-router-dom";
import { FiBookOpen, FiLock, FiLoader } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import DashboardDropdown from "./Dropdown";

const MainQuiz = () => {
  const api = import.meta.env.VITE_HOME_OO;

  const allowedEmails = [
    "basseyvera018@gmail.com",
    "codeverseprogramming23@gmail.com",
    "ooolajuyigbe@gmail.com",
    "fadeleolutola@gmail.com",
    "jahdek76@gmail.com",
    "samuelsamuelmayowa@gmail.com",
    "oluwaferanmiolulana@gmail.com",
    "adenusitimi@gmail.com",
    "Adenusi.timi@gmail.com",
    "tomideolulana@gmail.com",
    "yinkalola51@gmail.com",
    "toanalyticsllc@gmail.com",
    "kevwe_oberiko@yahoo.com",
    "lybertyudochuu@gmail.com",
    "denisgsam@gmail.com",
    "oluwaferanmi.olulana@gmail.com",
    "fpasamuelmayowa51@gmail.com",
    "oluwatiroyeamoye@gmail.com",
    "trbanjo@gmail.com",
    "emanfrimpong@gmail.com",
    "oluwaferanmiolulana@gmail.com",
    "randommayowa@gmail.com",
    "dipeoluolatunji@gmail.com",
    "lybertyudochuu@gmail.com",
  ];

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [quizData, setQuizData] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [isAllowed, setIsAllowed] = useState(false);
 const [darkMode, setDarkMode] = useState(false);
 useEffect(() => {
  document.documentElement.classList.toggle("dark", darkMode);
}, [darkMode]);
  // ✅ Load user email from localStorage
  useEffect(() => {
    const email = localStorage.getItem("user");
    setUserEmail(email);

    if (email) {
      const normalized = email.toLowerCase();
      const allowed = allowedEmails.map((e) => e.toLowerCase());
      setIsAllowed(allowed.includes(normalized));
    }
  }, []);

  // ✅ Fetch assignments
  useEffect(() => {
    if (isAllowed) {
      fetch("https://to-backendapi-v1.onrender.com/api/assignment")
        .then((res) => res.json())
        .then((data) => {
          setAssignments(data.data || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching assignments:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isAllowed]);

  // ✅ Load specific quiz
  const loadQuiz = async (quizName) => {
    if (!quizName) return;
    setSelectedQuiz(quizName);
    try {
      const res = await fetch(`${api}/api/quiz/${quizName}`);
      const data = await res.json();
      setQuizData(data);
    } catch (err) {
      console.error("Error loading quiz:", err);
    }
  };

  // 🌀 Loading Animation
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100">
        <FiLoader className="animate-spin text-blue-500 text-6xl mb-4" />
        <h2 className="text-lg font-semibold text-gray-600 animate-pulse">
          Loading your quiz center...
        </h2>
      </div>
    );
  }

  // 🚫 Access Denied
  if (!isAllowed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-red-50 text-center px-6"
      >
        <FiLock className="text-red-500 text-7xl mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold text-red-600 mb-2">
          Access Denied 🚫
        </h1>
        <p className="text-gray-700 text-lg mb-4 max-w-md">
          Only verified <span className="font-semibold">To-Analytics</span>{" "}
          members have access to the Splunk Quiz Center.
        </p>
        {userEmail ? (
          <p className="text-sm text-gray-500">
            Your email: <span className="font-medium">{userEmail}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Please log in with your authorized account.
          </p>
        )}
        <NavLink
          to="/"
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 hover:scale-[1.03] transition-all duration-300"
        >
          Go Back Home
        </NavLink>
      </motion.div>
    );
  }

  // 🎯 Main Content
  return (
  <div className="min-h-screen bg-white dark:bg-gray-950 py-16 px-8 text-gray-900 dark:text-gray-100">

    {/* HEADER */}
    <div className="max-w-7xl mx-auto mb-10 px-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Quiz Results
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View all your past test performances
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {userEmail}
          </div>

          <DashboardDropdown />

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded-lg text-sm 
            bg-gray-100 text-gray-800 
            dark:bg-gray-800 dark:text-white
            border border-gray-300 dark:border-gray-700
            hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

      </div>
    </div>

    {/* TITLE */}
    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-4xl font-extrabold mb-10 text-gray-900 dark:text-white text-center"
    >
      <FiBookOpen className="inline-block mb-1 mr-3 text-blue-600" />
      Splunk Quiz Center
    </motion.h2>

    {/* MAIN LAYOUT */}
    <div className="grid md:grid-cols-5 gap-10 max-w-7xl mx-auto">

      {/* LEFT: QUIZ SELECTOR */}
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow"
      >
        <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
          Select Your Quiz
        </h3>

        <select
          value={selectedQuiz}
          onChange={(e) => loadQuiz(e.target.value)}
          className="p-3 w-full border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
        >
          <option value="">-- Choose a Quiz --</option>
          <option value="T.O Analytics Splunk Class 1 Quiz">Splunk Class 1 Quiz</option>
          <option value="T.O Analytics Splunk Class 2 Quiz">Splunk Class 2 Quiz</option>
          <option value="T.O Analytics Splunk Class 3 Quiz">Splunk Class 3 Quiz</option>
          <option value="T.O Analytics Splunk Class 4 Quiz">Splunk Class 4 Quiz</option>
          <option value="T.O. Analytics – Splunk Class 5 Quiz">Splunk Class 5 Quiz</option>
          <option value="T.O Analytics – Splunk Class 6 Quiz">Splunk Class 6 Quiz</option>
          <option value="T.O Analytics Power User Exam Quiz">Power User Exam</option>
          <option value="T.O Analytics Splunk Admin Exam Quiz">Admin Exam</option>
        </select>

        {selectedQuiz && (
          <div className="mt-6 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Currently Selected:
            </p>
            <h4 className="font-semibold text-blue-600 mt-1">
              {selectedQuiz}
            </h4>
          </div>
        )}
      </motion.div>

      {/* RIGHT: QUIZ DISPLAY */}
      <AnimatePresence>
        {quizData && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="col-span-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8"
          >
            <Quiz data={quizData} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* FOOTER */}
    <div className="mt-16 text-center text-gray-400 text-sm">
      <p>
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-blue-600">T.O Analytics</span> —
        Empowering Learners with Data Mastery.
      </p>
    </div>

  </div>
);

//   return (
//     <div className="min-h-screen bg-gradient-to-br f to-purple-50 py-16 px-8">
//       <div className="mb-10 mt-8">
//         {" "}
//          {/* HEADER */}
//             <div className="max-w-7xl mx-auto mb-6 px-4">
//               <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow flex items-center justify-between">
        
//                 <div>
//                   <h1 className="text-2xl font-bold">
//                     Quiz Results
//                   </h1>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     View all your past test performances
//                   </p>
//                 </div>
        
//                 <div className="flex items-center gap-4">
//                   <div className="text-sm text-gray-600 dark:text-gray-300">
//                     {userEmail}
//                   </div>
        
//                   <DashboardDropdown />
        
//                   <button
//                     onClick={() => setDarkMode(!darkMode)}
//                     className="px-3 py-1 rounded text-sm 
//                     bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-white"
//                   >
//                     {darkMode ? "Light" : "Dark"}
//                   </button>
//                 </div>
        
//               </div>
//             </div>
        
//         {/* <DashboardDropdown /> */}
//       </div>
//       {/* Header */}
//       <motion.h2
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="text-5xl font-extrabold text-left mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 drop-shadow-sm"
//       >
//         <FiBookOpen className="inline-block mb-1 mr-3 text-indigo-600" />
//         Splunk Quiz Center
//       </motion.h2>

//       {/* Layout */}
//       <div className="grid md:grid-cols-5 gap-10 items-start">
//         {/* Left Side - Quiz Title */}
//         <motion.div
//           initial={{ x: -30, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ duration: 0.5 }}
//           className="col-span-2 bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-100"
//         >
//           <h3 className="text-xl font-semibold text-gray-700 mb-3">
//             Select Your Quiz
//           </h3>
//           <select
//             value={selectedQuiz}
//             onChange={(e) => loadQuiz(e.target.value)}
//             className="p-3 w-full border border-gray-300 rounded-xl text-gray-700 font-medium focus:ring-4 focus:ring-blue-400/40 focus:border-blue-500 bg-white shadow-inner transition-all duration-300"
//           >
//             <option value="">-- Choose a Quiz --</option>
//             <option value="T.O Analytics Splunk Class 1 Quiz">
//               T.O Analytics Splunk Class 1 Quiz
//             </option>
//             <option value="T.O Analytics Splunk Class 2 Quiz">
//               T.O Analytics Splunk Class 2 Quiz
//             </option>

//             <option value="T.O Analytics Splunk Class 3 Quiz">
//               T.O Analytics Splunk Class 3 Quiz
//             </option>

//             <option value="T.O Analytics Splunk Class 4 Quiz">
//               T.O Analytics Splunk Class 4 Quiz
//             </option>
// {/* T.O Analytics – Splunk Class 5 Quiz */}
//             <option value="T.O. Analytics – Splunk Class 5 Quiz">
//               T.O. Analytics Splunk Class 5 Quiz
//             </option>

           
//   <option value="T.O Analytics – Splunk Class 6 Quiz">
//                T.O Analytics – Splunk Class 6 Quiz
//             </option>
//             <option value="T.O Analytics Power User Exam Quiz">
//               T.O Analytics Power User Exam Quiz
//             </option>
//             <option value="T.O Analytics Splunk Admin Exam Quiz">
//               T.O Analytics Splunk Admin Exam Quiz
//             </option>
//           </select>

//           {selectedQuiz && (
//             <motion.div
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mt-6 bg-gradient-to-r from-indigo-100 to-blue-50 p-4 rounded-xl shadow-inner border border-blue-100"
//             >
//               <p className="text-sm text-gray-600">Currently Selected:</p>
//               <h4 className="font-semibold text-indigo-600 mt-1">
//                 {selectedQuiz}
//               </h4>
//             </motion.div>
//           )}
//         </motion.div>

//         {/* Center - Quiz Content */}
//         <AnimatePresence>
//           {quizData && (
//             <motion.div
//               key="quiz"
//               initial={{ opacity: 0, y: 40 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: 20 }}
//               transition={{ duration: 0.6 }}
//               className="col-span-3 bg-white/80 backdrop-blur-lg rounded-3xl border border-gray-200 shadow-2xl p-8 hover:shadow-indigo-200 transition-all duration-500"
//             >
//               <Quiz data={quizData} />
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Footer */}
//       <div className="mt-16 text-center text-gray-400 text-sm">
//         <p>
//           © {new Date().getFullYear()}{" "}
//           <span className="font-semibold text-blue-500">T.O Analytics</span> —
//           Empowering Learners with Data Mastery.
//         </p>
//       </div>
//     </div>
//   );
};

export default MainQuiz;

// ................ was using this one below /
// import { useEffect, useState } from "react";
// import Quiz from "./Quiz";
// import { NavLink } from "react-router-dom";
// import { FiBookOpen, FiLock, FiLoader } from "react-icons/fi";

// const MainQuiz = () => {
//   const api = import.meta.env.VITE_HOME_OO;

//   const allowedEmails = [
//     "samuelsamuelmayowa@gmail.com",
//     "oluwaferanmiolulana@gmail.com",
//     "adenusitimi@gmail.com",
//     "Adenusi.timi@gmail.com",
//     "tomideolulana@gmail.com",
//     "yinkalola51@gmail.com",
//     "toanalyticsllc@gmail.com",
//     "kevwe_oberiko@yahoo.com",
//     "lybertyudochuu@gmail.com",
//     "denisgsam@gmail.com",
//     "oluwaferanmi.olulana@gmail.com",
//     "fpasamuelmayowa51@gmail.com",
//     "oluwatiroyeamoye@gmail.com",
//     "trbanjo@gmail.com",
//     "emanfrimpong@gmail.com",
//     "oluwaferanmiolulana@gmail.com",
//     "randommayowa@gmail.com",
//     "dipeoluolatunji@gmail.com",
//     "lybertyudochuu@gmail.com",
//   ];

//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedQuiz, setSelectedQuiz] = useState("");
//   const [quizData, setQuizData] = useState(null);
//   const [userEmail, setUserEmail] = useState("");
//   const [isAllowed, setIsAllowed] = useState(false);

//   // ✅ Load user email from localStorage and verify access
//   useEffect(() => {
//     const email = localStorage.getItem("user");
//     setUserEmail(email);

//     if (email) {
//       const normalized = email.toLowerCase();
//       const allowed = allowedEmails.map((e) => e.toLowerCase());
//       setIsAllowed(allowed.includes(normalized));
//     }
//   }, []);

//   // ✅ Fetch assignments only if user is allowed
//   useEffect(() => {
//     if (isAllowed) {
//       fetch("https://to-backendapi-v1.onrender.com/api/assignment")
//         .then((res) => res.json())
//         .then((data) => {
//           setAssignments(data.data || []);
//           setLoading(false);
//         })
//         .catch((err) => {
//           console.error("Error fetching assignments:", err);
//           setLoading(false);
//         });
//     } else {
//       setLoading(false);
//     }
//   }, [isAllowed]);

//   // ✅ Load a specific quiz
//   const loadQuiz = async (quizName) => {
//     setSelectedQuiz(quizName);
//     try {
//       const res = await fetch(`${api}/api/quiz/${quizName}`);
//       const data = await res.json();
//       setQuizData(data);
//     } catch (err) {
//       console.error("Error loading quiz:", err);
//     }
//   };

//   // 🕐 Loading Screen
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
//         <FiLoader className="animate-spin text-BLUE text-5xl mb-4" />
//         <h2 className="text-lg font-semibold text-gray-600">
//           Loading your content...
//         </h2>
//       </div>
//     );
//   }

//   // 🚫 If user not allowed, block access
//   if (!isAllowed) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-red-50 text-center px-6">
//         <FiLock className="text-red-500 text-6xl mb-4 animate-bounce" />
//         <h1 className="text-3xl font-bold text-red-600 mb-2">
//           Access Denied 🚫
//         </h1>
//         <p className="text-gray-700 text-lg mb-4">
//           Only authorized To-Analytics members can view this page.
//         </p>
//         {userEmail ? (
//           <p className="text-sm text-gray-500">
//             Your email: <span className="font-medium">{userEmail}</span>
//           </p>
//         ) : (
//           <p className="text-sm text-gray-500">
//             Please log in to access the content.
//           </p>
//         )}
//         <NavLink
//           to="/"
//           className="mt-6 px-6 py-3 bg-BLUE text-white rounded-xl shadow-md hover:bg-PURPLE transition-all duration-300"
//         >
//           Go Back Home
//         </NavLink>
//       </div>
//     );
//   }

//   // ✅ Main Content
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 py-12 px-6">
//       <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-PURPLE to-BLUE mb-10">
//         <FiBookOpen className="inline-block mb-1 mr-2" />
//         Splunk Quiz Center
//       </h2>

//       {/* Quiz Selector */}
//       <div className="max-w-xl mx-auto bg-white/70 backdrop-blur-lg shadow-xl border border-gray-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl">
//         <label className="block text-lg font-semibold text-gray-700 mb-3">
//           Select a Quiz:
//         </label>
//         <select
//           value={selectedQuiz}
//           onChange={(e) => loadQuiz(e.target.value)}
//           className="p-3 w-full border border-gray-300 rounded-xl focus:ring-4 focus:ring-BLUE/50 focus:border-BLUE transition duration-300 text-gray-700 font-medium bg-white"
//         >
//           <option value="">-- Choose a Quiz --</option>
//           <option value="T.O Analytics Splunk Class 1 Quiz">
//             T.O Analytics Splunk Class 1 Quiz
//           </option>
//           <option value="T.O Analytics Splunk Class 2 Quiz">
//             T.O Analytics Splunk Class 2 Quiz
//           </option>
//           <option value="T.O Analytics Power User Exam Quiz">
//             T.O Analytics Power User Exam Quiz
//           </option>

//             <option value="T.O Analytics Splunk Admin Exam Quiz">
//           T.O Analytics Splunk Admin Exam Quiz
//           </option>

//         </select>
//       </div>

//       {/* Quiz Section */}
//       {quizData && (
//         <div className="max-w-3xl mx-auto mt-10 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-3xl shadow-lg p-8 transition-all duration-300 hover:shadow-2xl animate-fadeIn">
//           <Quiz data={quizData} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default MainQuiz;

// import { useEffect, useState } from "react";
// import Quiz from "./Quiz";
// import { NavLink } from "react-router-dom";

// const MainQuiz = () => {
//   const api = import.meta.env.VITE_HOME_OO;

//   const allowedEmails = [
//     // "oluwaferanmi.olulana@gmail.com",
//     "oluwaferanmiolulana@gmail.com",
//     "adenusitimi@gmail.com",
//     "Adenusi.timi@gmail.com",
//     "tomideolulana@gmail.com",
//     "yinkalola51@gmail.com",
//     "toanalyticsllc@gmail.com",
//     "kevwe_oberiko@yahoo.com",
//     "lybertyudochuu@gmail.com",
//     "denisgsam@gmail.com",
//     "oluwaferanmi.olulana@gmail.com",
//     "fpasamuelmayowa51@gmail.com",
//     "oluwatiroyeamoye@gmail.com",
//     "trbanjo@gmail.com",
//     "emanfrimpong@gmail.com",
//     "oluwaferanmiolulana@gmail.com",
//     "randommayowa@gmail.com",
//   "dipeoluolatunji@gmail.com",
//     "lybertyudochuu@gmail.com",
//   ];

//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedQuiz, setSelectedQuiz] = useState("");
//   const [quizData, setQuizData] = useState(null);
//   const [userEmail, setUserEmail] = useState("");
//   const [isAllowed, setIsAllowed] = useState(false);

//   // ✅ Load user email from localStorage and verify access
//   useEffect(() => {
//     const email = localStorage.getItem("user");
//     setUserEmail(email);

//     if (email) {
//       const normalized = email.toLowerCase();
//       const allowed = allowedEmails.map((e) => e.toLowerCase());
//       setIsAllowed(allowed.includes(normalized));
//     }
//   }, []);

//   // ✅ Fetch assignments only if user is allowed
//   useEffect(() => {
//     if (isAllowed) {
//       fetch("https://to-backendapi-v1.vercel.app/api/assignment")
//         .then((res) => res.json())
//         .then((data) => {
//           setAssignments(data.data || []);
//           setLoading(false);
//         })
//         .catch((err) => {
//           console.error("Error fetching assignments:", err);
//           setLoading(false);
//         });
//     } else {
//       setLoading(false);
//     }
//   }, [isAllowed]);

//   // ✅ Load a specific quiz
//   const loadQuiz = async (quizName) => {
//     setSelectedQuiz(quizName);
//     try {
//       const res = await fetch(`${api}/api/quiz/${quizName}`);
//       const data = await res.json();
//       setQuizData(data);
//     } catch (err) {
//       console.error("Error loading quiz:", err);
//     }
//   };

//   // 🕐 Loading state

//   // 🚫 If user not allowed, block access
//   if (!isAllowed) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
//         <h1 className="text-3xl font-bold text-red-600 mb-3">
//           Access Denied 🚫
//         </h1>
//         <p className="text-gray-700 text-lg">
//           Only authorized To-Analytics members can view this page.
//         </p>
//         {userEmail ? (
//           <p className="mt-4 text-sm text-gray-500">
//             Your email: <span className="font-medium">{userEmail}</span>
//           </p>
//         ) : (
//           <p className="mt-4 text-sm text-gray-500">
//             Please log in to access the content.
//           </p>
//         )}
//       </div>
//     );
//   }

//   return (
//     <>
//       <div>
//         <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
//           📚 Splunk Quiz
//         </h2>

//         {/* Quiz Selector */}
//         <div className="bg-white shadow-md rounded-2xl p-6 mb-8">
//           <label className="block text-lg font-semibold text-gray-700 mb-3">
//             Select a Quiz:
//           </label>
//           <select
//             value={selectedQuiz}
//             onChange={(e) => loadQuiz(e.target.value)}
//             className="p-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
//           >
//             <option value="">-- Choose a Quiz --</option>
//             <option value="T.O Analytics Splunk Quiz 1">T.O Analytics Splunk  Quiz 1</option>
//             <option value="T.O Analytics Splunk Quiz 2">T.O Analytics Splunk  Quiz 2</option>
//             {/* <option value="splunk3">Splunk Quiz 3</option> */}
//           </select>
//         </div>

//         {/* Quiz Section */}
//         {quizData && (
//           <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
//             <Quiz data={quizData} />
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default MainQuiz;
