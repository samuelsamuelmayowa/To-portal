import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiLoader,
  FiRefreshCw,
} from "react-icons/fi";

// import { supabase } from "./supabaseClient";
import { supabase } from "../supabaseClient";
function readStudentEmail() {
  const raw = localStorage.getItem("user");
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw);
    return String(parsed?.email || "").trim().toLowerCase();
  } catch {
    return String(raw).trim().toLowerCase();
  }
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  return `${String(minutes).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

const card =
  "rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950";

export default function StockQuiz() {
  const [catalog, setCatalog] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [error, setError] = useState("");
  const studentEmail = useMemo(readStudentEmail, []);

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      const { data, error: requestError } = await supabase.rpc(
        "list_published_stock_quizzes",
      );
      if (requestError) setError(requestError.message);
      else setCatalog(data || []);
      setLoading(false);
    }
    loadCatalog();
  }, []);

  const openQuiz = async (slug) => {
    setLoading(true);
    setError("");
    setResult(null);
    setAnswers({});
    setCurrent(0);

    const { data, error: requestError } = await supabase.rpc(
      "get_published_stock_quiz",
      { p_slug: slug },
    );

    if (requestError || !data) {
      setError(requestError?.message || "Quiz not found.");
    } else {
      setQuiz(data);
      setRemaining(Number(data.duration_minutes || 30) * 60);
    }
    setLoading(false);
  };

  const submitQuiz = useCallback(async () => {
    if (!quiz || submitting || result) return;
    if (!studentEmail) {
      setError("Your student email could not be found. Sign in again before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    const { data, error: requestError } = await supabase.rpc(
      "submit_stock_quiz",
      {
        p_quiz_id: quiz.id,
        p_student_email: studentEmail,
        p_answers: answers,
      },
    );

    if (requestError) {
      setError(requestError.message);
    } else {
      setResult(data);
      setEmailStatus("sending");

      const { error: emailError } = await supabase.functions.invoke(
        "send-stock-quiz-result",
        { body: { attemptId: data.attempt_id } },
      );

      setEmailStatus(emailError ? "failed" : "sent");
    }
    setSubmitting(false);
  }, [answers, quiz, result, studentEmail, submitting]);

  useEffect(() => {
    if (!quiz || result || submitting) return undefined;
    if (remaining <= 0) {
      submitQuiz();
      return undefined;
    }
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [quiz, remaining, result, submitQuiz, submitting]);

  const questions = quiz?.questions || [];
  const question = questions[current];
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
          <FiLoader className="animate-spin" /> Loading Stock Quiz...
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl">
          <NavLink to="/dashboard/stockportal" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <FiArrowLeft /> Back to Stock Portal
          </NavLink>
          <div className="mt-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">T.O. Analytics</p>
            <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">Stock & Options Quiz Center</h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
              Choose an assessment. All platform exercises use educational examples and paper trading only.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
              <FiAlertCircle className="mt-1 shrink-0" /> {error}
            </div>
          )}

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {catalog.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                onClick={() => openQuiz(item.slug)}
                className={`${card} p-6 text-left transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg`}
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-600">
                  <span>{item.question_count} questions</span>
                  <span>{item.duration_minutes} min</span>
                </div>
                <h2 className="mt-5 text-xl font-black text-slate-950 dark:text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                <p className="mt-5 text-sm font-semibold text-slate-500">Pass mark: {item.passing_score}%</p>
              </motion.button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (result) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl">
          <section className={`${card} overflow-hidden`}>
            <div className={`p-8 text-white ${result.passed ? "bg-emerald-600" : "bg-amber-600"}`}>
              <FiCheckCircle className="text-4xl" />
              <h1 className="mt-4 text-3xl font-black">{result.passed ? "Assessment passed" : "Assessment completed"}</h1>
              <p className="mt-2 text-lg">You scored {result.score}/{result.total_questions} ({result.percentage}%).</p>
              <p className="mt-3 text-sm font-semibold text-white/90">
                {emailStatus === "sending" && "Sending your result email..."}
                {emailStatus === "sent" && `Result emailed to ${studentEmail}.`}
                {emailStatus === "failed" && "Your result was saved, but the email could not be sent."}
              </p>
            </div>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">Answer review</h2>
              <div className="mt-5 space-y-4">
                {(result.review || []).map((item, index) => (
                  <article key={item.question_id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white">{index + 1}. {item.question}</p>
                    <p className={`mt-2 text-sm font-semibold ${item.is_correct ? "text-emerald-600" : "text-rose-600"}`}>
                      {item.is_correct ? "Correct" : `Correct answer: ${item.correct_answer}`}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.explanation}</p>
                  </article>
                ))}
              </div>
              <button
                onClick={() => { setQuiz(null); setResult(null); setAnswers({}); }}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white dark:bg-white dark:text-slate-950"
              >
                <FiRefreshCw /> Return to quiz center
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className={`${card} flex flex-wrap items-center justify-between gap-4 p-5`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Stock assessment</p>
            <h1 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{quiz.title}</h1>
          </div>
          <div className={`flex items-center gap-2 rounded-xl px-4 py-2 font-black ${remaining < 300 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-white"}`}>
            <FiClock /> {formatTime(remaining)}
          </div>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
          <section className={`${card} p-6 md:p-8`}>
            <div className="flex justify-between text-sm font-semibold text-slate-500">
              <span>Question {current + 1} of {questions.length}</span>
              <span>{answeredCount} answered</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
            </div>

            <h2 className="mt-8 text-2xl font-black leading-9 text-slate-950 dark:text-white">{question.question}</h2>
            <div className="mt-6 space-y-3">
              {question.options.map((option) => {
                const selected = answers[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: option.id }))}
                    className={`w-full rounded-2xl border p-4 text-left font-semibold transition ${selected ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-100" : "border-slate-200 text-slate-700 hover:border-slate-400 dark:border-slate-800 dark:text-slate-200"}`}
                  >
                    {option.option_text}
                  </button>
                );
              })}
            </div>

            {error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}

            <div className="mt-8 flex items-center justify-between">
              <button disabled={current === 0} onClick={() => setCurrent((value) => value - 1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold disabled:opacity-40 dark:border-slate-700 dark:text-white">
                <FiArrowLeft /> Previous
              </button>
              {current < questions.length - 1 ? (
                <button onClick={() => setCurrent((value) => value + 1)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white">
                  Next <FiArrowRight />
                </button>
              ) : (
                <button disabled={submitting} onClick={submitQuiz} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950">
                  {submitting ? <FiLoader className="animate-spin" /> : <FiCheckCircle />} Submit quiz
                </button>
              )}
            </div>
          </section>

          <aside className={`${card} h-fit p-5`}>
            <h3 className="font-black text-slate-950 dark:text-white">Question navigator</h3>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {questions.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrent(index)}
                  className={`aspect-square rounded-lg text-sm font-bold ${index === current ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : answers[item.id] ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button disabled={submitting} onClick={submitQuiz} className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white disabled:opacity-60">
              Finish assessment
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

// import { useCallback, useEffect, useMemo, useState } from "react";
// import { NavLink } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   FiAlertCircle,
//   FiArrowLeft,
//   FiArrowRight,
//   FiCheckCircle,
//   FiClock,
//   FiLoader,
//   FiRefreshCw,
// } from "react-icons/fi";

// // import { supabase } from "./supabaseClient";
// import { supabase } from "../supabaseClient";

// function readStudentEmail() {
//   const raw = localStorage.getItem("user");
//   if (!raw) return "";

//   try {
//     const parsed = JSON.parse(raw);
//     return String(parsed?.email || "").trim().toLowerCase();
//   } catch {
//     return String(raw).trim().toLowerCase();
//   }
// }

// function formatTime(seconds) {
//   const safe = Math.max(0, seconds);
//   const minutes = Math.floor(safe / 60);
//   return `${String(minutes).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
// }

// const card =
//   "rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950";

// export default function StockQuiz() {
//   const [catalog, setCatalog] = useState([]);
//   const [quiz, setQuiz] = useState(null);
//   const [answers, setAnswers] = useState({});
//   const [current, setCurrent] = useState(0);
//   const [remaining, setRemaining] = useState(0);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const studentEmail = useMemo(readStudentEmail, []);

//   useEffect(() => {
//     async function loadCatalog() {
//       setLoading(true);
//       const { data, error: requestError } = await supabase.rpc(
//         "list_published_stock_quizzes",
//       );
//       if (requestError) setError(requestError.message);
//       else setCatalog(data || []);
//       setLoading(false);
//     }
//     loadCatalog();
//   }, []);

//   const openQuiz = async (slug) => {
//     setLoading(true);
//     setError("");
//     setResult(null);
//     setAnswers({});
//     setCurrent(0);

//     const { data, error: requestError } = await supabase.rpc(
//       "get_published_stock_quiz",
//       { p_slug: slug },
//     );

//     if (requestError || !data) {
//       setError(requestError?.message || "Quiz not found.");
//     } else {
//       setQuiz(data);
//       setRemaining(Number(data.duration_minutes || 30) * 60);
//     }
//     setLoading(false);
//   };

//   const submitQuiz = useCallback(async () => {
//     if (!quiz || submitting || result) return;
//     if (!studentEmail) {
//       setError("Your student email could not be found. Sign in again before submitting.");
//       return;
//     }

//     setSubmitting(true);
//     setError("");
//     const { data, error: requestError } = await supabase.rpc(
//       "submit_stock_quiz",
//       {
//         p_quiz_id: quiz.id,
//         p_student_email: studentEmail,
//         p_answers: answers,
//       },
//     );

//     if (requestError) setError(requestError.message);
//     else setResult(data);
//     setSubmitting(false);
//   }, [answers, quiz, result, studentEmail, submitting]);

//   useEffect(() => {
//     if (!quiz || result || submitting) return undefined;
//     if (remaining <= 0) {
//       submitQuiz();
//       return undefined;
//     }
//     const timer = window.setInterval(() => {
//       setRemaining((value) => Math.max(0, value - 1));
//     }, 1000);
//     return () => window.clearInterval(timer);
//   }, [quiz, remaining, result, submitQuiz, submitting]);

//   const questions = quiz?.questions || [];
//   const question = questions[current];
//   const answeredCount = Object.keys(answers).length;

//   if (loading) {
//     return (
//       <div className="grid min-h-[70vh] place-items-center bg-slate-50 dark:bg-slate-900">
//         <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
//           <FiLoader className="animate-spin" /> Loading Stock Quiz...
//         </div>
//       </div>
//     );
//   }

//   if (!quiz) {
//     return (
//       <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-900">
//         <div className="mx-auto max-w-5xl">
//           <NavLink to="/dashboard/stockportal" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
//             <FiArrowLeft /> Back to Stock Portal
//           </NavLink>
//           <div className="mt-6">
//             <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">T.O. Analytics</p>
//             <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">Stock & Options Quiz Center</h1>
//             <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
//               Choose an assessment. All platform exercises use educational examples and paper trading only.
//             </p>
//           </div>

//           {error && (
//             <div className="mt-6 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
//               <FiAlertCircle className="mt-1 shrink-0" /> {error}
//             </div>
//           )}

//           <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
//             {catalog.map((item, index) => (
//               <motion.button
//                 key={item.id}
//                 initial={{ opacity: 0, y: 12 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.06 }}
//                 onClick={() => openQuiz(item.slug)}
//                 className={`${card} p-6 text-left transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg`}
//               >
//                 <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-600">
//                   <span>{item.question_count} questions</span>
//                   <span>{item.duration_minutes} min</span>
//                 </div>
//                 <h2 className="mt-5 text-xl font-black text-slate-950 dark:text-white">{item.title}</h2>
//                 <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
//                 <p className="mt-5 text-sm font-semibold text-slate-500">Pass mark: {item.passing_score}%</p>
//               </motion.button>
//             ))}
//           </div>
//         </div>
//       </main>
//     );
//   }

//   if (result) {
//     return (
//       <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-900">
//         <div className="mx-auto max-w-4xl">
//           <section className={`${card} overflow-hidden`}>
//             <div className={`p-8 text-white ${result.passed ? "bg-emerald-600" : "bg-amber-600"}`}>
//               <FiCheckCircle className="text-4xl" />
//               <h1 className="mt-4 text-3xl font-black">{result.passed ? "Assessment passed" : "Assessment completed"}</h1>
//               <p className="mt-2 text-lg">You scored {result.score}/{result.total_questions} ({result.percentage}%).</p>
//             </div>
//             <div className="p-6 md:p-8">
//               <h2 className="text-xl font-black text-slate-950 dark:text-white">Answer review</h2>
//               <div className="mt-5 space-y-4">
//                 {(result.review || []).map((item, index) => (
//                   <article key={item.question_id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
//                     <p className="font-bold text-slate-900 dark:text-white">{index + 1}. {item.question}</p>
//                     <p className={`mt-2 text-sm font-semibold ${item.is_correct ? "text-emerald-600" : "text-rose-600"}`}>
//                       {item.is_correct ? "Correct" : `Correct answer: ${item.correct_answer}`}
//                     </p>
//                     <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.explanation}</p>
//                   </article>
//                 ))}
//               </div>
//               <button
//                 onClick={() => { setQuiz(null); setResult(null); setAnswers({}); }}
//                 className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white dark:bg-white dark:text-slate-950"
//               >
//                 <FiRefreshCw /> Return to quiz center
//               </button>
//             </div>
//           </section>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-900">
//       <div className="mx-auto max-w-6xl">
//         <header className={`${card} flex flex-wrap items-center justify-between gap-4 p-5`}>
//           <div>
//             <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Stock assessment</p>
//             <h1 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{quiz.title}</h1>
//           </div>
//           <div className={`flex items-center gap-2 rounded-xl px-4 py-2 font-black ${remaining < 300 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-white"}`}>
//             <FiClock /> {formatTime(remaining)}
//           </div>
//         </header>

//         <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
//           <section className={`${card} p-6 md:p-8`}>
//             <div className="flex justify-between text-sm font-semibold text-slate-500">
//               <span>Question {current + 1} of {questions.length}</span>
//               <span>{answeredCount} answered</span>
//             </div>
//             <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
//               <div className="h-full bg-emerald-500 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
//             </div>

//             <h2 className="mt-8 text-2xl font-black leading-9 text-slate-950 dark:text-white">{question.question}</h2>
//             <div className="mt-6 space-y-3">
//               {question.options.map((option) => {
//                 const selected = answers[question.id] === option.id;
//                 return (
//                   <button
//                     key={option.id}
//                     onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: option.id }))}
//                     className={`w-full rounded-2xl border p-4 text-left font-semibold transition ${selected ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-100" : "border-slate-200 text-slate-700 hover:border-slate-400 dark:border-slate-800 dark:text-slate-200"}`}
//                   >
//                     {option.option_text}
//                   </button>
//                 );
//               })}
//             </div>

//             {error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}

//             <div className="mt-8 flex items-center justify-between">
//               <button disabled={current === 0} onClick={() => setCurrent((value) => value - 1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold disabled:opacity-40 dark:border-slate-700 dark:text-white">
//                 <FiArrowLeft /> Previous
//               </button>
//               {current < questions.length - 1 ? (
//                 <button onClick={() => setCurrent((value) => value + 1)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white">
//                   Next <FiArrowRight />
//                 </button>
//               ) : (
//                 <button disabled={submitting} onClick={submitQuiz} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950">
//                   {submitting ? <FiLoader className="animate-spin" /> : <FiCheckCircle />} Submit quiz
//                 </button>
//               )}
//             </div>
//           </section>

//           <aside className={`${card} h-fit p-5`}>
//             <h3 className="font-black text-slate-950 dark:text-white">Question navigator</h3>
//             <div className="mt-4 grid grid-cols-5 gap-2">
//               {questions.map((item, index) => (
//                 <button
//                   key={item.id}
//                   onClick={() => setCurrent(index)}
//                   className={`aspect-square rounded-lg text-sm font-bold ${index === current ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : answers[item.id] ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
//                 >
//                   {index + 1}
//                 </button>
//               ))}
//             </div>
//             <button disabled={submitting} onClick={submitQuiz} className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white disabled:opacity-60">
//               Finish assessment
//             </button>
//           </aside>
//         </div>
//       </div>
//     </main>
//   );
// }
