import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiBookOpen, FiLoader, FiLock } from "react-icons/fi";
import Quiz from "./Quiz";
import StockDashboardDropdown from "./StockDashboardDropdown";

const ALLOWED_EMAILS = [
  "kewizle.k@gmail.com",
  "kewizlek@gmail.com",
  "kevwe_oberiko@yahoo.com",
  "davidayeni63@gmail.com",
  "adesh25416@gmail.com",
  "basseyvera018@gmail.com",
  "codeverseprogramming23@gmail.com",
  "ooolajuyigbe@gmail.com",
  "fadeleolutola@gmail.com",
  "jahdek76@gmail.com",
  "samuelsamuelmayowa@gmail.com",
  "oluwaferanmiolulana@gmail.com",
  "adenusitimi@gmail.com",
  "tomideolulana@gmail.com",
  "yinkalola51@gmail.com",
  "toanalyticsllc@gmail.com",
  "lybertyudochuu@gmail.com",
  "denisgsam@gmail.com",
  "oluwaferanmi.olulana@gmail.com",
  "fpasamuelmayowa51@gmail.com",
  "oluwatiroyeamoye@gmail.com",
  "trbanjo@gmail.com",
  "emanfrimpong@gmail.com",
  "randommayowa@gmail.com",
  "dipeoluolatunji@gmail.com",
].map((email) => email.toLowerCase());

// These values must exactly match the quiz names stored in your backend.
const STOCK_QUIZZES = [
  {
    value: "T.O Analytics Stock Class 1 Quiz",
    label: "Class 1 — Stock Market Basics",
  },
  {
    value: "T.O Analytics Stock Class 2 Quiz",
    label: "Class 2 — Stocks, Shares and Exchanges",
  },
  {
    value: "T.O Analytics Stock Class 3 Quiz",
    label: "Class 3 — Options Trading Fundamentals",
  },
  {
    value: "T.O Analytics Stock Class 4 Quiz",
    label: "Class 4 — Calls, Puts and Strike Prices",
  },
  {
    value: "T.O Analytics Stock Class 5 Quiz",
    label: "Class 5 — Technical Analysis",
  },
  {
    value: "T.O Analytics Stock Class 6 Quiz",
    label: "Class 6 — Risk Management",
  },
  {
    value: "T.O Analytics Stock and Options Final Quiz",
    label: "Stock & Options Final Assessment",
  },
];

function getStoredEmail() {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) return "";

  try {
    const parsedUser = JSON.parse(storedUser);
    return String(parsedUser?.email || storedUser).trim().toLowerCase();
  } catch {
    return String(storedUser).trim().toLowerCase();
  }
}

const StockQuiz = () => {
  const api = import.meta.env.VITE_HOME_OO;

  const [loading, setLoading] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [quizData, setQuizData] = useState(null);
  const [quizError, setQuizError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isAllowed, setIsAllowed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [darkMode]);

  useEffect(() => {
    const email = getStoredEmail();

    setUserEmail(email);
    setIsAllowed(ALLOWED_EMAILS.includes(email));
    setLoading(false);
  }, []);

  const loadQuiz = async (quizName) => {
    setSelectedQuiz(quizName);
    setQuizData(null);
    setQuizError("");

    if (!quizName) return;

    if (!api) {
      setQuizError("The quiz API URL is not configured.");
      return;
    }

    setLoadingQuiz(true);

    try {
      const response = await fetch(
        `${api}/api/quiz/${encodeURIComponent(quizName)}`,
      );

      if (!response.ok) {
        throw new Error(`Quiz request failed with status ${response.status}.`);
      }

      const data = await response.json();
      setQuizData(data);
    } catch (error) {
      console.error("Error loading stock quiz:", error);
      setQuizError(
        "This stock quiz could not be loaded. Confirm that its name exists in the backend.",
      );
    } finally {
      setLoadingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-100">
        <FiLoader className="mb-4 animate-spin text-6xl text-emerald-600" />
        <h2 className="animate-pulse text-lg font-semibold text-gray-600">
          Loading your stock quiz center...
        </h2>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-red-50 px-6 text-center"
      >
        <FiLock className="mb-6 text-7xl text-red-500" />

        <h1 className="mb-2 text-3xl font-bold text-red-600">
          Access Denied
        </h1>

        <p className="mb-4 max-w-md text-lg text-gray-700">
          Only verified T.O Analytics members have access to the Stock &
          Options Quiz Center.
        </p>

        <p className="text-sm text-gray-500">
          {userEmail
            ? `Your email: ${userEmail}`
            : "Please log in with your authorized account."}
        </p>

        <NavLink
          to="/"
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-white shadow-lg transition hover:scale-[1.03] hover:bg-blue-700"
        >
          Go Back Home
        </NavLink>
      </motion.div>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-16 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:px-8">
      <header className="mx-auto mb-10 max-w-7xl">
        <div className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Stock Quiz Center
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Test your stock-market and options-trading knowledge.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {userEmail}
            </span>

            <StockDashboardDropdown />

            <button
              type="button"
              onClick={() => setDarkMode((currentMode) => !currentMode)}
              className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 transition hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </header>

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center text-4xl font-extrabold text-gray-900 dark:text-white"
      >
        <FiBookOpen className="mr-3 inline-block text-emerald-600" />
        Stock & Options Quiz Center
      </motion.h2>

      <section className="mx-auto grid max-w-7xl gap-10 md:grid-cols-5">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow dark:border-gray-800 dark:bg-gray-900 md:col-span-2"
        >
          <h3 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">
            Select Your Stock Quiz
          </h3>

          <select
            value={selectedQuiz}
            onChange={(event) => loadQuiz(event.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-700 outline-none transition focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">-- Choose a Stock Quiz --</option>

            {STOCK_QUIZZES.map((quiz) => (
              <option key={quiz.value} value={quiz.value}>
                {quiz.label}
              </option>
            ))}
          </select>

          {selectedQuiz && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Currently selected:
              </p>
              <h4 className="mt-1 font-semibold text-emerald-600">
                {selectedQuiz}
              </h4>
            </div>
          )}

          {quizError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              {quizError}
            </div>
          )}
        </motion.div>

        <div className="md:col-span-3">
          {loadingQuiz && (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <FiLoader className="animate-spin text-5xl text-emerald-600" />
            </div>
          )}

          <AnimatePresence mode="wait">
            {!loadingQuiz && quizData && (
              <motion.div
                key={selectedQuiz}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-800 shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
              >
                <Quiz data={quizData} />
              </motion.div>
            )}
          </AnimatePresence>

          {!loadingQuiz && !quizData && !quizError && (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              Select a stock quiz to begin.
            </div>
          )}
        </div>
      </section>

      <footer className="mt-16 text-center text-sm text-gray-400">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-emerald-600">T.O Analytics</span>
        {" — "}Building confident investors and traders.
      </footer>
    </main>
  );
};

export default StockQuiz;
