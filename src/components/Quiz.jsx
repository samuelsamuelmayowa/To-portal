import { useEffect, useState } from "react";
import jsPDF from "jspdf";
const Quiz = ({ data }) => {
  const api = import.meta.env.VITE_HOME_OO;
  const questions = data?.questions ?? [];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(() => {
    if (
      data?.title === "T.O Analytics Power User Exam Quiz" ||
      data?.title === "T.O Analytics Splunk Admin Exam Quiz"
    ) {
      return 120 * 60; // 2 hours in seconds
    }
    return 30 * 60; // default 30 minutes
  });

  useEffect(() => {
    if (
      data?.title === "T.O Analytics Power User Exam Quiz" ||
      data?.title === "T.O Analytics Splunk Admin Exam Quiz"
    ) {
      setTimeLeft(120 * 60); // 2 hours
    } else {
      setTimeLeft(30 * 60); // 30 minutes
    }
  }, [data?.title]);

  // const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [submitted, setSubmitted] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [notAllowed, setNotAllowed] = useState(false);
  // ✅ Get and parse user from localStorage
  const rawUser = localStorage.getItem("user");
  let user = null;
  try {
    user = JSON.parse(rawUser);
  } catch {
    user = { email: rawUser }; // fallback if stored as plain string
  }
  const userEmail = user?.email || "";
  // ✅ Allowed test-takers
  const allowedEmails = [
   "sammmyayo@gmail.com",
  "kewizle.k@gmail.com",
  "kewizlek@gmail.com",
  "pamelaabina24@gmail.com",
  "adesh25416@gmail.com",
  "oluwaferanmiolulana@gmail.com",
  "tomideolulana@gmail.com",
  "toanalyticsllc@gmail.com",
  "denisgsam@gmail.com",
  "oluwaferanmi.olulana@gmail.com",
  "fpasamuelmayowa51@gmail.com",
  "randommayowa@gmail.com",
  "oluwatiroyeamoye@gmail.com",
  "adenusitimi@gmail.com",
  "trbanjo@gmail.com",
  "emanfrimpong@gmail.com",
  "dipeoluolatunji@gmail.com",
  "yinkalola51@gmail.com",
  "adeoyeifeoluwa@gmail.com",
  "toluolubambi@gmail.com",
  "Adeoyeifeoluwa@gmail.com",
  "spheremessage@gmail.com",
  "toluolubambi@gmail.com",
  "adeoyeifeoluwa@ymail.com",
  "samuelsamuelmayowa@gmail.com",
  "adeoyeifeoluwa42@gmail.com",
  "tobijbello@gmail.com",
  "Tobijbello@gmail.com",
  "adeoyeifeoluwa@ymail.com",
  "toluolubambi@gmail.com"
  ];

  // 🛑 Block unauthorized users
  useEffect(() => {
    if (userEmail && !allowedEmails.includes(userEmail)) {
      setNotAllowed(true);
    }
  }, [userEmail]);
  //   useEffect(() => {
  //   // const q = questions[currentQuestion];
  //   const q = questions?.[currentQuestion];

  // if (!q) {
  //   return (
  //     <div className="p-6 text-center text-gray-600">
  //       Loading question…
  //     </div>
  //   );
  // }

  //   if (!q) return;

  //   setAnswers((prev) => {
  //     // MULTI question must always be an array
  //     if (q.multi && !Array.isArray(prev[currentQuestion])) {
  //       return { ...prev, [currentQuestion]: [] };
  //     }

  //     // SINGLE question must always be a string
  //     if (!q.multi && Array.isArray(prev[currentQuestion])) {
  //       return { ...prev, [currentQuestion]: "" };
  //     }

  //     return prev;
  //   });
  // }, [currentQuestion, questions]);

  useEffect(() => {
    if (!questions.length) return;

    const q = questions[currentQuestion];
    if (!q) return;

    setAnswers((prev) => {
      // multi must always be array
      if (q.multi && !Array.isArray(prev[currentQuestion])) {
        return { ...prev, [currentQuestion]: [] };
      }

      // single must always be string
      if (!q.multi && Array.isArray(prev[currentQuestion])) {
        return { ...prev, [currentQuestion]: "" };
      }

      return prev;
    });
  }, [currentQuestion, questions]);

  // const questions = data?.questions || [];
  // 🕒 Countdown Timer
  useEffect(() => {
    if (submitted || notAllowed) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, notAllowed]);

  //   const handleAnswerSelect = (questionIndex, option) => {
  //   const q = questions[questionIndex];

  //   setAnswers((prev) => {
  //     // MULTI-SELECT QUESTION
  //     if (q.multi) {
  //       const prevAnswers = prev[questionIndex] || [];
  //       return {
  //         ...prev,
  //         [questionIndex]: prevAnswers.includes(option)
  //           ? prevAnswers.filter((o) => o !== option)
  //           : [...prevAnswers, option],
  //       };
  //     }

  //     // SINGLE-SELECT QUESTION
  //     return {
  //       ...prev,
  //       [questionIndex]: option,
  //     };
  //   });
  // };

  // const handleAnswerSelect = (questionIndex, option) => {
  //   setAnswers((prev) => ({
  //     ...prev,
  //     [questionIndex]: option,
  //   }));
  // };
  // ✅ Submit logic with missed questions
  // const handleSubmit = async () => {
  //   let correctCount = 0;
  //   const missed = [];
  //   questions.forEach((q, index) => {
  //     const userAnswer = answers[index];
  //     const correctAnswers = Array.isArray(q.correct) ? q.correct : [q.correct];
  //     if (correctAnswers.includes(userAnswer)) {
  //       correctCount++;
  //     } else {
  //       missed.push({
  //         question: q.question,
  //         selected: userAnswer || "No answer",
  //         correct: correctAnswers.join(", "),
  //       });
  //     }
  //   });
  //   const totalQuestions = questions.length;
  //   const calculatedScore = Math.round((correctCount / totalQuestions) * 100);
  //   setScore(calculatedScore);
  //   setMissedQuestions(missed);
  //   setSubmitted(true);
  //   // ✅ Save result to backend
  //   try {
  //     const resultData = {
  //       username: userEmail,
  //       testName: data.title || "Unknown Quiz",
  //       score: calculatedScore,
  //       totalQuestions,
  //       missedQuestions: missed,
  //     };
  //     console.log("Submitting result:", resultData);
  //     const res = await fetch(`${api}/api/quiz/save`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(resultData),
  //     });

  //     if (!res.ok) {
  //       const errorText = await res.text();
  //       console.error("Save error:", errorText);
  //       alert("❌ Failed to save result. Check console for details.");
  //       return;
  //     }
  //     alert("✅ Quiz result saved successfully!");
  //   } catch (err) {
  //     console.error("Error saving quiz result:", err);
  //     alert("⚠️ An error occurred while saving your result.");
  //   }
  // };

  //   const handleAnswerSelect = (questionIndex, option) => {
  //   const q = questions[questionIndex];
  //   if (!q) return;

  //   setAnswers((prev) => {
  //     // MULTI
  //     if (q.multi === true) {
  //       const prevAnswers = Array.isArray(prev[questionIndex])
  //         ? prev[questionIndex]
  //         : [];

  //       return {
  //         ...prev,
  //         [questionIndex]: prevAnswers.includes(option)
  //           ? prevAnswers.filter((o) => o !== option)
  //           : [...prevAnswers, option],
  //       };
  //     }

  //     // SINGLE
  //     return {
  //       ...prev,
  //       [questionIndex]: option,
  //     };
  //   });
  // };

  const handleAnswerSelect = (questionIndex, option) => {
    const q = questions[questionIndex];
    if (!q) return;

    setAnswers((prev) => {
      if (q.multi === true) {
        const prevAnswers = Array.isArray(prev[questionIndex])
          ? prev[questionIndex]
          : [];

        return {
          ...prev,
          [questionIndex]: prevAnswers.includes(option)
            ? prevAnswers.filter((o) => o !== option)
            : [...prevAnswers, option],
        };
      }

      return {
        ...prev,
        [questionIndex]: option,
      };
    });
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    const missed = [];

    // questions.forEach((q, index) => {
    //   const userAnswer = answers[index];
    //   const correctAnswers = Array.isArray(q.correct) ? q.correct : [q.correct];

    //   if (correctAnswers.includes(userAnswer)) {
    //     correctCount++;
    //   } else {
    //     missed.push({
    //       question: q.question,
    //       selected: userAnswer || "No answer",
    //       correct: correctAnswers.join(", "),
    //     });
    //   }
    // });
    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      const correctAnswers = q.correct;

      let isCorrect = false;

      if (q.multi) {
        if (Array.isArray(userAnswer)) {
          isCorrect =
            userAnswer.length === correctAnswers.length &&
            correctAnswers.every((ans) => userAnswer.includes(ans));
        }
      } else {
        isCorrect = correctAnswers.includes(userAnswer);
      }

      if (isCorrect) {
        correctCount++;
      } else {
        missed.push({
          question: q.question,
          selected: userAnswer || "No answer",
          correct: correctAnswers.join(", "),
        });
      }
    });

    const totalQuestions = questions.length;
    // ✅ Now score = number of correct answers
    const calculatedScore = correctCount;

    setScore(calculatedScore);
    setMissedQuestions(missed);
    setSubmitted(true);

    // ✅ Save result to backend
    try {
      const resultData = {
        username: userEmail,
        testName: data.title || "Unknown Quiz",
        score: calculatedScore,
        totalQuestions,
        missedQuestions: missed,
      };

      console.log("Submitting result:", resultData);

      const res = await fetch(`${api}/api/quiz/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Save error:", errorText);
        alert("❌ Failed to save result. Check console for details.");
        return;
      }

      alert("✅ Quiz result saved successfully!");
    } catch (err) {
      console.error("Error saving quiz result:", err);
      alert("⚠️ An error occurred while saving your result.");
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1)
      setCurrentQuestion((prev) => prev + 1);
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion((prev) => prev - 1);
  };

  const isAnswered = () => {
    const q = questions[currentQuestion];
    const a = answers[currentQuestion];

    if (q.multi) return Array.isArray(a) && a.length > 0;
    return typeof a === "string" && a.length > 0;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Export a complete quiz review with safe text wrapping and page breaks.
  const handleDownloadReview = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 44;
    const contentWidth = pageWidth - marginX * 2;
    const bottomLimit = pageHeight - 58; // Reserve space for the page footer.
    let y = 59;

    const newPage = () => {
      doc.addPage();
      y = 54;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(40, 70, 145);
      doc.text("T.O Analytics Quiz Review (continued)", marginX, y);
      y += 23;
    };

    const ensureSpace = (height = 16) => {
      if (y + height > bottomLimit) newPage();
    };

    // Writes text one line at a time so content cannot run off the right
    // edge or disappear beyond the bottom of the page.
    const writeText = (
      value,
      {
        indent = 0,
        bold = false,
        size = 10,
        lineHeight = 14,
        spaceAfter = 0,
        color = [32, 41, 56],
      } = {},
    ) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const text = String(value ?? "");
      const lines = doc.splitTextToSize(text, contentWidth - indent);

      lines.forEach((line) => {
        ensureSpace(lineHeight);
        // A page break draws a continuation header. Restore this line's style.
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        doc.setTextColor(...color);
        doc.text(line, marginX + indent, y);
        y += lineHeight;
      });
      y += spaceAfter;
    };

    const displayAnswer = (answer) => {
      if (Array.isArray(answer)) {
        return answer.length ? answer.join("; ") : "No answer";
      }
      return answer === null || answer === undefined || answer === ""
        ? "No answer"
        : String(answer);
    };

    // Measure each question before printing it. A complete question that
    // fits on a page should never leave its result on the next page.
    const measuredTextHeight = (
      value,
      { indent = 0, bold = false, size = 10, lineHeight = 14, spaceAfter = 0 } = {},
    ) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(String(value ?? ""), contentWidth - indent);
      return lines.length * lineHeight + spaceAfter;
    };

    // Header and summary. These fields are wrapped as well.
    doc.setFillColor(33, 75, 170);
    doc.rect(0, 0, pageWidth, 9, "F");
    writeText("T.O Analytics Quiz Review", {
      bold: true,
      size: 18,
      lineHeight: 24,
      spaceAfter: 10,
      color: [27, 49, 100],
    });
    writeText(`Quiz: ${data?.title || "N/A"}`, { spaceAfter: 3 });
    writeText(`Student Email: ${userEmail || "N/A"}`, { spaceAfter: 3 });
    writeText(`Date: ${new Date().toLocaleString()}`, { spaceAfter: 3 });
    if (score !== null) {
      writeText(`Score: ${score} / ${questions.length}`, {
        bold: true,
        spaceAfter: 8,
      });
    }
    ensureSpace(15);
    doc.setDrawColor(209, 218, 232);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 20;

    questions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      const correctAnswers = Array.isArray(q.correct)
        ? q.correct
        : [q.correct];
      // Preserve the existing quiz scoring rules exactly.
      const isCorrect = q.multi
        ? Array.isArray(userAnswer) &&
          userAnswer.length === correctAnswers.length &&
          correctAnswers.every((ans) => userAnswer.includes(ans))
        : correctAnswers.includes(userAnswer);

      const questionEntries = [
        {
          value: `${idx + 1}. ${q.question}`,
          opts: { bold: true, size: 11, lineHeight: 16, spaceAfter: 4 },
        },
        {
          value: `Your Answer: ${displayAnswer(userAnswer)}`,
          opts: { indent: 10, lineHeight: 15, spaceAfter: 3 },
        },
        {
          value: `Correct Answer: ${displayAnswer(correctAnswers)}`,
          opts: { indent: 10, lineHeight: 15, spaceAfter: 3 },
        },
      ];
      if (q.reason) {
        questionEntries.push({
          value: `Reason: ${q.reason}`,
          opts: { indent: 10, lineHeight: 15, spaceAfter: 3 },
        });
      }
      // Avoid emoji here: the built-in jsPDF Helvetica font does not
      // reliably contain emoji glyphs.
      questionEntries.push({
        value: `Result: ${isCorrect ? "Correct" : "Missed"}`,
        opts: {
          indent: 10,
          bold: true,
          lineHeight: 15,
          spaceAfter: 8,
          color: isCorrect ? [27, 126, 80] : [190, 42, 50],
        },
      });

      const entryHeight = questionEntries.reduce(
        (total, entry) => total + measuredTextHeight(entry.value, entry.opts),
        0,
      );
      const freshPageCapacity = bottomLimit - 77;
      if (entryHeight <= freshPageCapacity && y + entryHeight > bottomLimit) {
        newPage();
      }
      // Extremely long blocks can still flow across pages, line by line.
      questionEntries.forEach((entry) => writeText(entry.value, entry.opts));
      if (y + 16 <= bottomLimit) {
        doc.setDrawColor(228, 233, 240);
        doc.line(marginX, y, pageWidth - marginX, y);
        y += 13;
      }
    });

    // Footer and total page count on every page.
    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setDrawColor(209, 218, 232);
      doc.line(marginX, pageHeight - 43, pageWidth - marginX, pageHeight - 43);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(108, 118, 135);
      doc.text("Generated by T.O Analytics Learning Portal", marginX, pageHeight - 28);
      doc.text(`Page ${page} of ${pageCount}`, pageWidth - marginX, pageHeight - 28, {
        align: "right",
      });
    }

    const safeFileName = (data?.title || "Quiz").replace(/[\\/:*?"<>|]/g, "-");
    doc.save(`${safeFileName}_Review.pdf`);
  };

  // 🛑 Not allowed to take the test
  if (notAllowed) {
    return (
      <div className="text-center py-20 text-red-600 font-bold text-xl bg-gray-100 rounded-lg shadow-md">
        🚫 You are not allowed to take this quiz.
        <br />
        Please contact your instructor for access.
      </div>
    );
  }

  if (!questions.length)
    return (
      <div className="text-center text-gray-600 py-10">
        No questions available for this quiz.
      </div>
    );

  if (submitted)
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          🎉 Quiz Submitted!
        </h2>
        <p className="text-lg font-semibold text-gray-800 mb-4">
          Your Score: <span className="text-blue-600">{score}</span>
        </p>

        <button
          onClick={() => setShowReview(!showReview)}
          className="px-5 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition mb-6"
        >
          {showReview ? "Hide Review" : "Review All Questions"}
        </button>

        {showReview && (
          <div className="text-left max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-3">Full Quiz Review</h3>
            <button
              onClick={handleDownloadReview}
              className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
            >
              ⬇ Download as PDF
            </button>
            {questions.map((q, idx) => {
              const userAnswer = answers[idx];
              const correctAnswers = Array.isArray(q.correct)
                ? q.correct
                : [q.correct];
              // const isCorrect = correctAnswers.includes(userAnswer);
              const isCorrect = q.multi
                ? Array.isArray(userAnswer) &&
                  userAnswer.length === correctAnswers.length &&
                  correctAnswers.every((ans) => userAnswer.includes(ans))
                : correctAnswers.includes(userAnswer);

              return (
                <div
                  key={idx}
                  className={`border p-3 mb-3 rounded-lg ${
                    isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <p
                    className={`font-semibold mb-2 ${
                      isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isCorrect ? "✅ Correct" : "❌ Missed"} — {q.question}
                  </p>

                  <p>
                    Your Answer:{" "}
                    <span
                      className={`${
                        isCorrect
                          ? "text-green-700 font-medium"
                          : "text-red-700 font-medium"
                      }`}
                    >
                      {Array.isArray(userAnswer)
                        ? userAnswer.join(", ")
                        : userAnswer || "No answer"}
                    </span>
                  </p>

                  <p>
                    Correct Answer:{" "}
                    <span className="text-blue-700 font-semibold">
                      {correctAnswers.join(", ")}
                    </span>
                  </p>

                  {q.reason && (
                    <p className="text-gray-700 mt-2">
                      <span className="font-semibold text-indigo-700">Reason:</span>{" "}
                      {q.reason}
                    </p>
                  )}
                </div>

                // <div
                //   key={idx}
                //   className={`border p-3 mb-3 rounded-lg ${
                //     isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                //   }`}
                // >
                //   {/* Question */}
                //   <p
                //     className={`font-semibold mb-2 ${
                //       isCorrect ? "text-green-600" : "text-red-600"
                //     }`}
                //   >
                //     {isCorrect ? "✅ Correct" : "❌ Missed"} — {q.question}
                //   </p>

                //   {/* Student’s Answer */}
                //   <p>
                //     Your Answer:{" "}
                //     <span
                //       className={`${
                //         isCorrect ? "text-green-700 font-medium" : "text-red-700 font-medium"
                //       }`}
                //     >
                //       {userAnswer || "No answer"}
                //     </span>
                //   </p>

                //   {/* Correct Answer */}
                //   <p>
                //     Correct Answer:{" "}
                //     <span className="text-blue-700 font-semibold">
                //       {correctAnswers.join(", ")}
                //     </span>
                //   </p>
                // </div>
              );
            })}
          </div>
        )}

        {/* {showReview && (
          <div className="text-left max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-3">Missed Questions Review</h3>
            {missedQuestions.map((item, idx) => (
              <div key={idx} className="border p-3 mb-3 rounded-lg bg-gray-50">
                <p className="font-semibold text-red-500">❌ {item.question}</p>
                <p>
                  Your Answer:{" "}
                  <span className="text-red-600">{item.selected}</span>
                </p>
                <p>
                  Correct Answer:{" "}
                  <span className="text-green-600">{item.correct}</span>
                </p>
              </div>
            ))}
          </div>
        )} */}
      </div>
    );

  // const q = questions[currentQuestion];
  // const q = questions?.[currentQuestion];
  const q = questions.length > 0 ? questions[currentQuestion] : null;

  if (!q) {
    return (
      <div className="p-6 text-center text-gray-600">Loading question…</div>
    );
  }

  // if (!q) {
  //   return (
  //     <div className="p-6 text-center text-gray-600">
  //       Loading question…
  //     </div>
  //   );
  // }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md text-gray-800">
      {/* Timer */}
      <pre className="bg-red-100 text-xs p-2 mb-2">
        {/* {JSON.stringify(q.multi , null, 2)} — {typeof q.multi} */}
      </pre>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{data.title}</h2>
        {/* <div
          className={`text-lg font-bold px-4 py-2 rounded-lg ${
            timeLeft < 300
              ? "bg-red-100 text-red-600"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          ⏳ {formatTime(timeLeft)}
        </div> */}
        <div
          className={`text-lg font-bold px-4 py-2 rounded-lg ${
            timeLeft < 300
              ? "bg-red-100 text-red-600"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          ⏳ {formatTime(timeLeft)}{" "}
          <span className="text-xs ml-2 text-gray-500">
            (
            {data?.title === "T.O Analytics Power User Exam Quiz" ||
              data?.title === "T.O Analytics Splunk Admin Exam Quiz"
                ? "2 hrs"
                : "30 min"}
            )
          </span>
        </div>
      </div>

      {/* Question */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Question {currentQuestion + 1} of {questions.length}
        </h3>
        <p className="text-gray-700 mb-6">{q.question}</p>
        {q && (
          <pre className="bg-gray-100 text-xs p-2 rounded mb-4">
            {JSON.stringify(answers[currentQuestion], null, 2)}
          </pre>
        )}

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((option, i) => {
            const isMulti = q.multi;
            // const selected = isMulti
            //   ? (answers[currentQuestion] || []).includes(option)
            //   : answers[currentQuestion] === option;
            const selected = isMulti
              ? Array.isArray(answers[currentQuestion]) &&
                answers[currentQuestion].includes(option)
              : answers[currentQuestion] === option;

            return (
              <label
                key={i}
                className={`block p-3 border rounded-lg cursor-pointer transition ${
                  selected
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "hover:bg-blue-50 border-gray-300"
                }`}
              >
                {/* <input
          type={isMulti ? "checkbox" : "radio"}
          name={`question-${currentQuestion}`}
          checked={selected}
          onChange={() => handleAnswerSelect(currentQuestion, option)}
          className="mr-2"
        /> */}
                <input
                  type={isMulti ? "checkbox" : "radio"}
                  name={isMulti ? undefined : `question-${currentQuestion}`}
                  checked={selected}
                  onChange={() => handleAnswerSelect(currentQuestion, option)}
                  className="mr-2"
                />

                {option}
              </label>
            );
          })}
        </div>

        {/* <div className="space-y-3">
          {q.options.map((option, i) => (
            <label
              key={i}
              className={`block p-3 border rounded-lg cursor-pointer transition ${
                answers[currentQuestion] === option
                  ? "bg-blue-600 border-blue-600"
                  : "hover:bg-blue-50 border-gray-300"
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value={option}
                checked={answers[currentQuestion] === option}
                onChange={() => handleAnswerSelect(currentQuestion, option)}
                className="hidden"
              />
              {option}
            </label>
          ))}
        </div> */}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className={`px-5 py-2 rounded-lg font-medium ${
            currentQuestion === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 hover:bg-gray-700 transition"
          }`}
        >
          ⬅ Prev
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={nextQuestion}
            //            disabled={!isAnswered()}
            // className={`px-5 py-2 rounded-lg ${
            //   !isAnswered()
            //     ? "bg-gray-300 cursor-not-allowed"
            //     : "bg-blue-600 hover:bg-blue-700"
            // }`}
            className="px-5 py-2 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Next ➡
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Submit ✅
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;

// import { useEffect, useState } from "react";
// import jsPDF from "jspdf";
// const Quiz = ({ data }) => {
//   const api = import.meta.env.VITE_HOME_OO;
//   const questions = data?.questions ?? [];
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [score, setScore] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(() => {
//     if (
//       data?.title === "T.O Analytics Power User Exam Quiz" ||
//       data?.title === "T.O Analytics Splunk Admin Exam Quiz"
//     ) {
//       return 120 * 60; // 2 hours in seconds
//     }
//     return 30 * 60; // default 30 minutes
//   });

//   useEffect(() => {
//     if (
//       data?.title === "T.O Analytics Power User Exam Quiz" ||
//       data?.title === "T.O Analytics Splunk Admin Exam Quiz"
//     ) {
//       setTimeLeft(120 * 60); // 2 hours
//     } else {
//       setTimeLeft(30 * 60); // 30 minutes
//     }
//   }, [data?.title]);

//   // const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
//   const [submitted, setSubmitted] = useState(false);
//   const [missedQuestions, setMissedQuestions] = useState([]);
//   const [showReview, setShowReview] = useState(false);
//   const [notAllowed, setNotAllowed] = useState(false);
//   // ✅ Get and parse user from localStorage
//   const rawUser = localStorage.getItem("user");
//   let user = null;
//   try {
//     user = JSON.parse(rawUser);
//   } catch {
//     user = { email: rawUser }; // fallback if stored as plain string
//   }
//   const userEmail = user?.email || "";
//   // ✅ Allowed test-takers
//   const allowedEmails = [
//    "sammmyayo@gmail.com",
//   "kewizle.k@gmail.com",
//   "kewizlek@gmail.com",
//   "pamelaabina24@gmail.com",
//   "adesh25416@gmail.com",
//   "oluwaferanmiolulana@gmail.com",
//   "tomideolulana@gmail.com",
//   "toanalyticsllc@gmail.com",
//   "denisgsam@gmail.com",
//   "oluwaferanmi.olulana@gmail.com",
//   "fpasamuelmayowa51@gmail.com",
//   "randommayowa@gmail.com",
//   "oluwatiroyeamoye@gmail.com",
//   "adenusitimi@gmail.com",
//   "trbanjo@gmail.com",
//   "emanfrimpong@gmail.com",
//   "dipeoluolatunji@gmail.com",
//   "yinkalola51@gmail.com",
//   "adeoyeifeoluwa@gmail.com",
//   "toluolubambi@gmail.com",
//   "Adeoyeifeoluwa@gmail.com",
//   "spheremessage@gmail.com",
//   "toluolubambi@gmail.com",
//   "adeoyeifeoluwa@ymail.com",
//   "samuelsamuelmayowa@gmail.com",
//   "adeoyeifeoluwa42@gmail.com",
//   "tobijbello@gmail.com",
//   "Tobijbello@gmail.com",
//   "adeoyeifeoluwa@ymail.com",
//   "toluolubambi@gmail.com"
//   ];

//   // 🛑 Block unauthorized users
//   useEffect(() => {
//     if (userEmail && !allowedEmails.includes(userEmail)) {
//       setNotAllowed(true);
//     }
//   }, [userEmail]);
//   //   useEffect(() => {
//   //   // const q = questions[currentQuestion];
//   //   const q = questions?.[currentQuestion];

//   // if (!q) {
//   //   return (
//   //     <div className="p-6 text-center text-gray-600">
//   //       Loading question…
//   //     </div>
//   //   );
//   // }

//   //   if (!q) return;

//   //   setAnswers((prev) => {
//   //     // MULTI question must always be an array
//   //     if (q.multi && !Array.isArray(prev[currentQuestion])) {
//   //       return { ...prev, [currentQuestion]: [] };
//   //     }

//   //     // SINGLE question must always be a string
//   //     if (!q.multi && Array.isArray(prev[currentQuestion])) {
//   //       return { ...prev, [currentQuestion]: "" };
//   //     }

//   //     return prev;
//   //   });
//   // }, [currentQuestion, questions]);

//   useEffect(() => {
//     if (!questions.length) return;

//     const q = questions[currentQuestion];
//     if (!q) return;

//     setAnswers((prev) => {
//       // multi must always be array
//       if (q.multi && !Array.isArray(prev[currentQuestion])) {
//         return { ...prev, [currentQuestion]: [] };
//       }

//       // single must always be string
//       if (!q.multi && Array.isArray(prev[currentQuestion])) {
//         return { ...prev, [currentQuestion]: "" };
//       }

//       return prev;
//     });
//   }, [currentQuestion, questions]);

//   // const questions = data?.questions || [];
//   // 🕒 Countdown Timer
//   useEffect(() => {
//     if (submitted || notAllowed) return;
//     if (timeLeft <= 0) {
//       handleSubmit();
//       return;
//     }
//     const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
//     return () => clearInterval(timer);
//   }, [timeLeft, submitted, notAllowed]);

//   //   const handleAnswerSelect = (questionIndex, option) => {
//   //   const q = questions[questionIndex];

//   //   setAnswers((prev) => {
//   //     // MULTI-SELECT QUESTION
//   //     if (q.multi) {
//   //       const prevAnswers = prev[questionIndex] || [];
//   //       return {
//   //         ...prev,
//   //         [questionIndex]: prevAnswers.includes(option)
//   //           ? prevAnswers.filter((o) => o !== option)
//   //           : [...prevAnswers, option],
//   //       };
//   //     }

//   //     // SINGLE-SELECT QUESTION
//   //     return {
//   //       ...prev,
//   //       [questionIndex]: option,
//   //     };
//   //   });
//   // };

//   // const handleAnswerSelect = (questionIndex, option) => {
//   //   setAnswers((prev) => ({
//   //     ...prev,
//   //     [questionIndex]: option,
//   //   }));
//   // };
//   // ✅ Submit logic with missed questions
//   // const handleSubmit = async () => {
//   //   let correctCount = 0;
//   //   const missed = [];
//   //   questions.forEach((q, index) => {
//   //     const userAnswer = answers[index];
//   //     const correctAnswers = Array.isArray(q.correct) ? q.correct : [q.correct];
//   //     if (correctAnswers.includes(userAnswer)) {
//   //       correctCount++;
//   //     } else {
//   //       missed.push({
//   //         question: q.question,
//   //         selected: userAnswer || "No answer",
//   //         correct: correctAnswers.join(", "),
//   //       });
//   //     }
//   //   });
//   //   const totalQuestions = questions.length;
//   //   const calculatedScore = Math.round((correctCount / totalQuestions) * 100);
//   //   setScore(calculatedScore);
//   //   setMissedQuestions(missed);
//   //   setSubmitted(true);
//   //   // ✅ Save result to backend
//   //   try {
//   //     const resultData = {
//   //       username: userEmail,
//   //       testName: data.title || "Unknown Quiz",
//   //       score: calculatedScore,
//   //       totalQuestions,
//   //       missedQuestions: missed,
//   //     };
//   //     console.log("Submitting result:", resultData);
//   //     const res = await fetch(`${api}/api/quiz/save`, {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify(resultData),
//   //     });

//   //     if (!res.ok) {
//   //       const errorText = await res.text();
//   //       console.error("Save error:", errorText);
//   //       alert("❌ Failed to save result. Check console for details.");
//   //       return;
//   //     }
//   //     alert("✅ Quiz result saved successfully!");
//   //   } catch (err) {
//   //     console.error("Error saving quiz result:", err);
//   //     alert("⚠️ An error occurred while saving your result.");
//   //   }
//   // };

//   //   const handleAnswerSelect = (questionIndex, option) => {
//   //   const q = questions[questionIndex];
//   //   if (!q) return;

//   //   setAnswers((prev) => {
//   //     // MULTI
//   //     if (q.multi === true) {
//   //       const prevAnswers = Array.isArray(prev[questionIndex])
//   //         ? prev[questionIndex]
//   //         : [];

//   //       return {
//   //         ...prev,
//   //         [questionIndex]: prevAnswers.includes(option)
//   //           ? prevAnswers.filter((o) => o !== option)
//   //           : [...prevAnswers, option],
//   //       };
//   //     }

//   //     // SINGLE
//   //     return {
//   //       ...prev,
//   //       [questionIndex]: option,
//   //     };
//   //   });
//   // };

//   const handleAnswerSelect = (questionIndex, option) => {
//     const q = questions[questionIndex];
//     if (!q) return;

//     setAnswers((prev) => {
//       if (q.multi === true) {
//         const prevAnswers = Array.isArray(prev[questionIndex])
//           ? prev[questionIndex]
//           : [];

//         return {
//           ...prev,
//           [questionIndex]: prevAnswers.includes(option)
//             ? prevAnswers.filter((o) => o !== option)
//             : [...prevAnswers, option],
//         };
//       }

//       return {
//         ...prev,
//         [questionIndex]: option,
//       };
//     });
//   };

//   const handleSubmit = async () => {
//     let correctCount = 0;
//     const missed = [];

//     // questions.forEach((q, index) => {
//     //   const userAnswer = answers[index];
//     //   const correctAnswers = Array.isArray(q.correct) ? q.correct : [q.correct];

//     //   if (correctAnswers.includes(userAnswer)) {
//     //     correctCount++;
//     //   } else {
//     //     missed.push({
//     //       question: q.question,
//     //       selected: userAnswer || "No answer",
//     //       correct: correctAnswers.join(", "),
//     //     });
//     //   }
//     // });
//     questions.forEach((q, index) => {
//       const userAnswer = answers[index];
//       const correctAnswers = q.correct;

//       let isCorrect = false;

//       if (q.multi) {
//         if (Array.isArray(userAnswer)) {
//           isCorrect =
//             userAnswer.length === correctAnswers.length &&
//             correctAnswers.every((ans) => userAnswer.includes(ans));
//         }
//       } else {
//         isCorrect = correctAnswers.includes(userAnswer);
//       }

//       if (isCorrect) {
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
//     // ✅ Now score = number of correct answers
//     const calculatedScore = correctCount;

//     setScore(calculatedScore);
//     setMissedQuestions(missed);
//     setSubmitted(true);

//     // ✅ Save result to backend
//     try {
//       const resultData = {
//         username: userEmail,
//         testName: data.title || "Unknown Quiz",
//         score: calculatedScore,
//         totalQuestions,
//         missedQuestions: missed,
//       };

//       console.log("Submitting result:", resultData);

//       const res = await fetch(`${api}/api/quiz/save`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(resultData),
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         console.error("Save error:", errorText);
//         alert("❌ Failed to save result. Check console for details.");
//         return;
//       }

//       alert("✅ Quiz result saved successfully!");
//     } catch (err) {
//       console.error("Error saving quiz result:", err);
//       alert("⚠️ An error occurred while saving your result.");
//     }
//   };

//   const nextQuestion = () => {
//     if (currentQuestion < questions.length - 1)
//       setCurrentQuestion((prev) => prev + 1);
//   };

//   const prevQuestion = () => {
//     if (currentQuestion > 0) setCurrentQuestion((prev) => prev - 1);
//   };

//   const isAnswered = () => {
//     const q = questions[currentQuestion];
//     const a = answers[currentQuestion];

//     if (q.multi) return Array.isArray(a) && a.length > 0;
//     return typeof a === "string" && a.length > 0;
//   };

//   const formatTime = (seconds) => {
//     const m = Math.floor(seconds / 60)
//       .toString()
//       .padStart(2, "0");
//     const s = (seconds % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   };

//   // Export a complete quiz review with safe text wrapping and page breaks.
//   const handleDownloadReview = () => {
//     const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const marginX = 44;
//     const contentWidth = pageWidth - marginX * 2;
//     const bottomLimit = pageHeight - 58; // Reserve space for the page footer.
//     let y = 59;

//     const newPage = () => {
//       doc.addPage();
//       y = 54;
//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(10);
//       doc.setTextColor(40, 70, 145);
//       doc.text("T.O Analytics Quiz Review (continued)", marginX, y);
//       y += 23;
//     };

//     const ensureSpace = (height = 16) => {
//       if (y + height > bottomLimit) newPage();
//     };

//     // Writes text one line at a time so content cannot run off the right
//     // edge or disappear beyond the bottom of the page.
//     const writeText = (
//       value,
//       {
//         indent = 0,
//         bold = false,
//         size = 10,
//         lineHeight = 14,
//         spaceAfter = 0,
//         color = [32, 41, 56],
//       } = {},
//     ) => {
//       doc.setFont("helvetica", bold ? "bold" : "normal");
//       doc.setFontSize(size);
//       doc.setTextColor(...color);
//       const text = String(value ?? "");
//       const lines = doc.splitTextToSize(text, contentWidth - indent);

//       lines.forEach((line) => {
//         ensureSpace(lineHeight);
//         // A page break draws a continuation header. Restore this line's style.
//         doc.setFont("helvetica", bold ? "bold" : "normal");
//         doc.setFontSize(size);
//         doc.setTextColor(...color);
//         doc.text(line, marginX + indent, y);
//         y += lineHeight;
//       });
//       y += spaceAfter;
//     };

//     const displayAnswer = (answer) => {
//       if (Array.isArray(answer)) {
//         return answer.length ? answer.join("; ") : "No answer";
//       }
//       return answer === null || answer === undefined || answer === ""
//         ? "No answer"
//         : String(answer);
//     };

//     // Header and summary. These fields are wrapped as well.
//     doc.setFillColor(33, 75, 170);
//     doc.rect(0, 0, pageWidth, 9, "F");
//     writeText("T.O Analytics Quiz Review", {
//       bold: true,
//       size: 18,
//       lineHeight: 24,
//       spaceAfter: 10,
//       color: [27, 49, 100],
//     });
//     writeText(`Quiz: ${data?.title || "N/A"}`, { spaceAfter: 3 });
//     writeText(`Student Email: ${userEmail || "N/A"}`, { spaceAfter: 3 });
//     writeText(`Date: ${new Date().toLocaleString()}`, { spaceAfter: 3 });
//     if (score !== null) {
//       writeText(`Score: ${score} / ${questions.length}`, {
//         bold: true,
//         spaceAfter: 8,
//       });
//     }
//     ensureSpace(15);
//     doc.setDrawColor(209, 218, 232);
//     doc.line(marginX, y, pageWidth - marginX, y);
//     y += 20;

//     questions.forEach((q, idx) => {
//       const userAnswer = answers[idx];
//       const correctAnswers = Array.isArray(q.correct)
//         ? q.correct
//         : [q.correct];
//       // Preserve the existing quiz scoring rules exactly.
//       const isCorrect = q.multi
//         ? Array.isArray(userAnswer) &&
//           userAnswer.length === correctAnswers.length &&
//           correctAnswers.every((ans) => userAnswer.includes(ans))
//         : correctAnswers.includes(userAnswer);

//       // Keep a question heading with at least some of its answer details.
//       ensureSpace(64);
//       writeText(`${idx + 1}. ${q.question}`, {
//         bold: true,
//         size: 11,
//         lineHeight: 16,
//         spaceAfter: 4,
//       });
//       writeText(`Your Answer: ${displayAnswer(userAnswer)}`, {
//         indent: 10,
//         lineHeight: 15,
//         spaceAfter: 3,
//       });
//       writeText(`Correct Answer: ${displayAnswer(correctAnswers)}`, {
//         indent: 10,
//         lineHeight: 15,
//         spaceAfter: 3,
//       });
//       if (q.reason) {
//         writeText(`Reason: ${q.reason}`, {
//           indent: 10,
//           lineHeight: 15,
//           spaceAfter: 3,
//         });
//       }
//       // Avoid emoji here: the built-in jsPDF Helvetica font does not
//       // reliably contain emoji glyphs.
//       writeText(`Result: ${isCorrect ? "Correct" : "Missed"}`, {
//         indent: 10,
//         bold: true,
//         lineHeight: 15,
//         spaceAfter: 8,
//         color: isCorrect ? [27, 126, 80] : [190, 42, 50],
//       });
//       if (y + 16 <= bottomLimit) {
//         doc.setDrawColor(228, 233, 240);
//         doc.line(marginX, y, pageWidth - marginX, y);
//         y += 13;
//       }
//     });

//     // Footer and total page count on every page.
//     const pageCount = doc.getNumberOfPages();
//     for (let page = 1; page <= pageCount; page += 1) {
//       doc.setPage(page);
//       doc.setDrawColor(209, 218, 232);
//       doc.line(marginX, pageHeight - 43, pageWidth - marginX, pageHeight - 43);
//       doc.setFont("helvetica", "normal");
//       doc.setFontSize(8);
//       doc.setTextColor(108, 118, 135);
//       doc.text("Generated by T.O Analytics Learning Portal", marginX, pageHeight - 28);
//       doc.text(`Page ${page} of ${pageCount}`, pageWidth - marginX, pageHeight - 28, {
//         align: "right",
//       });
//     }

//     const safeFileName = (data?.title || "Quiz").replace(/[\\/:*?"<>|]/g, "-");
//     doc.save(`${safeFileName}_Review.pdf`);
//   };

//   // 🛑 Not allowed to take the test
//   if (notAllowed) {
//     return (
//       <div className="text-center py-20 text-red-600 font-bold text-xl bg-gray-100 rounded-lg shadow-md">
//         🚫 You are not allowed to take this quiz.
//         <br />
//         Please contact your instructor for access.
//       </div>
//     );
//   }

//   if (!questions.length)
//     return (
//       <div className="text-center text-gray-600 py-10">
//         No questions available for this quiz.
//       </div>
//     );

//   if (submitted)
//     return (
//       <div className="text-center py-10">
//         <h2 className="text-2xl font-bold text-green-600 mb-4">
//           🎉 Quiz Submitted!
//         </h2>
//         <p className="text-lg font-semibold text-gray-800 mb-4">
//           Your Score: <span className="text-blue-600">{score}</span>
//         </p>

//         <button
//           onClick={() => setShowReview(!showReview)}
//           className="px-5 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition mb-6"
//         >
//           {showReview ? "Hide Review" : "Review All Questions"}
//         </button>

//         {showReview && (
//           <div className="text-left max-w-3xl mx-auto">
//             <h3 className="text-xl font-bold mb-3">Full Quiz Review</h3>
//             <button
//               onClick={handleDownloadReview}
//               className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
//             >
//               ⬇ Download as PDF
//             </button>
//             {questions.map((q, idx) => {
//               const userAnswer = answers[idx];
//               const correctAnswers = Array.isArray(q.correct)
//                 ? q.correct
//                 : [q.correct];
//               // const isCorrect = correctAnswers.includes(userAnswer);
//               const isCorrect = q.multi
//                 ? Array.isArray(userAnswer) &&
//                   userAnswer.length === correctAnswers.length &&
//                   correctAnswers.every((ans) => userAnswer.includes(ans))
//                 : correctAnswers.includes(userAnswer);

//               return (
//                 <div
//                   key={idx}
//                   className={`border p-3 mb-3 rounded-lg ${
//                     isCorrect
//                       ? "bg-green-50 border-green-200"
//                       : "bg-red-50 border-red-200"
//                   }`}
//                 >
//                   <p
//                     className={`font-semibold mb-2 ${
//                       isCorrect ? "text-green-600" : "text-red-600"
//                     }`}
//                   >
//                     {isCorrect ? "✅ Correct" : "❌ Missed"} — {q.question}
//                   </p>

//                   <p>
//                     Your Answer:{" "}
//                     <span
//                       className={`${
//                         isCorrect
//                           ? "text-green-700 font-medium"
//                           : "text-red-700 font-medium"
//                       }`}
//                     >
//                       {Array.isArray(userAnswer)
//                         ? userAnswer.join(", ")
//                         : userAnswer || "No answer"}
//                     </span>
//                   </p>

//                   <p>
//                     Correct Answer:{" "}
//                     <span className="text-blue-700 font-semibold">
//                       {correctAnswers.join(", ")}
//                     </span>
//                   </p>

//                   {q.reason && (
//                     <p className="text-gray-700 mt-2">
//                       <span className="font-semibold text-indigo-700">Reason:</span>{" "}
//                       {q.reason}
//                     </p>
//                   )}
//                 </div>

//                 // <div
//                 //   key={idx}
//                 //   className={`border p-3 mb-3 rounded-lg ${
//                 //     isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
//                 //   }`}
//                 // >
//                 //   {/* Question */}
//                 //   <p
//                 //     className={`font-semibold mb-2 ${
//                 //       isCorrect ? "text-green-600" : "text-red-600"
//                 //     }`}
//                 //   >
//                 //     {isCorrect ? "✅ Correct" : "❌ Missed"} — {q.question}
//                 //   </p>

//                 //   {/* Student’s Answer */}
//                 //   <p>
//                 //     Your Answer:{" "}
//                 //     <span
//                 //       className={`${
//                 //         isCorrect ? "text-green-700 font-medium" : "text-red-700 font-medium"
//                 //       }`}
//                 //     >
//                 //       {userAnswer || "No answer"}
//                 //     </span>
//                 //   </p>

//                 //   {/* Correct Answer */}
//                 //   <p>
//                 //     Correct Answer:{" "}
//                 //     <span className="text-blue-700 font-semibold">
//                 //       {correctAnswers.join(", ")}
//                 //     </span>
//                 //   </p>
//                 // </div>
//               );
//             })}
//           </div>
//         )}

//         {/* {showReview && (
//           <div className="text-left max-w-3xl mx-auto">
//             <h3 className="text-xl font-bold mb-3">Missed Questions Review</h3>
//             {missedQuestions.map((item, idx) => (
//               <div key={idx} className="border p-3 mb-3 rounded-lg bg-gray-50">
//                 <p className="font-semibold text-red-500">❌ {item.question}</p>
//                 <p>
//                   Your Answer:{" "}
//                   <span className="text-red-600">{item.selected}</span>
//                 </p>
//                 <p>
//                   Correct Answer:{" "}
//                   <span className="text-green-600">{item.correct}</span>
//                 </p>
//               </div>
//             ))}
//           </div>
//         )} */}
//       </div>
//     );

//   // const q = questions[currentQuestion];
//   // const q = questions?.[currentQuestion];
//   const q = questions.length > 0 ? questions[currentQuestion] : null;

//   if (!q) {
//     return (
//       <div className="p-6 text-center text-gray-600">Loading question…</div>
//     );
//   }

//   // if (!q) {
//   //   return (
//   //     <div className="p-6 text-center text-gray-600">
//   //       Loading question…
//   //     </div>
//   //   );
//   // }

//   return (
//     <div className="p-6 bg-white rounded-xl shadow-md text-gray-800">
//       {/* Timer */}
//       <pre className="bg-red-100 text-xs p-2 mb-2">
//         {/* {JSON.stringify(q.multi , null, 2)} — {typeof q.multi} */}
//       </pre>

//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-bold text-gray-800">{data.title}</h2>
//         {/* <div
//           className={`text-lg font-bold px-4 py-2 rounded-lg ${
//             timeLeft < 300
//               ? "bg-red-100 text-red-600"
//               : "bg-blue-100 text-blue-700"
//           }`}
//         >
//           ⏳ {formatTime(timeLeft)}
//         </div> */}
//         <div
//           className={`text-lg font-bold px-4 py-2 rounded-lg ${
//             timeLeft < 300
//               ? "bg-red-100 text-red-600"
//               : "bg-blue-100 text-blue-700"
//           }`}
//         >
//           ⏳ {formatTime(timeLeft)}{" "}
//           <span className="text-xs ml-2 text-gray-500">
//             (
//             {data?.title === "T.O Analytics Power User Exam Quiz" ||
//               data?.title === "T.O Analytics Splunk Admin Exam Quiz"
//                 ? "2 hrs"
//                 : "30 min"}
//             )
//           </span>
//         </div>
//       </div>

//       {/* Question */}
//       <div>
//         <h3 className="text-lg font-semibold mb-4">
//           Question {currentQuestion + 1} of {questions.length}
//         </h3>
//         <p className="text-gray-700 mb-6">{q.question}</p>
//         {q && (
//           <pre className="bg-gray-100 text-xs p-2 rounded mb-4">
//             {JSON.stringify(answers[currentQuestion], null, 2)}
//           </pre>
//         )}

//         {/* Options */}
//         <div className="space-y-3">
//           {q.options.map((option, i) => {
//             const isMulti = q.multi;
//             // const selected = isMulti
//             //   ? (answers[currentQuestion] || []).includes(option)
//             //   : answers[currentQuestion] === option;
//             const selected = isMulti
//               ? Array.isArray(answers[currentQuestion]) &&
//                 answers[currentQuestion].includes(option)
//               : answers[currentQuestion] === option;

//             return (
//               <label
//                 key={i}
//                 className={`block p-3 border rounded-lg cursor-pointer transition ${
//                   selected
//                     ? "bg-blue-600 border-blue-600 text-white"
//                     : "hover:bg-blue-50 border-gray-300"
//                 }`}
//               >
//                 {/* <input
//           type={isMulti ? "checkbox" : "radio"}
//           name={`question-${currentQuestion}`}
//           checked={selected}
//           onChange={() => handleAnswerSelect(currentQuestion, option)}
//           className="mr-2"
//         /> */}
//                 <input
//                   type={isMulti ? "checkbox" : "radio"}
//                   name={isMulti ? undefined : `question-${currentQuestion}`}
//                   checked={selected}
//                   onChange={() => handleAnswerSelect(currentQuestion, option)}
//                   className="mr-2"
//                 />

//                 {option}
//               </label>
//             );
//           })}
//         </div>

//         {/* <div className="space-y-3">
//           {q.options.map((option, i) => (
//             <label
//               key={i}
//               className={`block p-3 border rounded-lg cursor-pointer transition ${
//                 answers[currentQuestion] === option
//                   ? "bg-blue-600 border-blue-600"
//                   : "hover:bg-blue-50 border-gray-300"
//               }`}
//             >
//               <input
//                 type="radio"
//                 name={`question-${currentQuestion}`}
//                 value={option}
//                 checked={answers[currentQuestion] === option}
//                 onChange={() => handleAnswerSelect(currentQuestion, option)}
//                 className="hidden"
//               />
//               {option}
//             </label>
//           ))}
//         </div> */}
//       </div>

//       {/* Navigation */}
//       <div className="flex justify-between items-center mt-8">
//         <button
//           onClick={prevQuestion}
//           disabled={currentQuestion === 0}
//           className={`px-5 py-2 rounded-lg font-medium ${
//             currentQuestion === 0
//               ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//               : "bg-gray-800 hover:bg-gray-700 transition"
//           }`}
//         >
//           ⬅ Prev
//         </button>

//         {currentQuestion < questions.length - 1 ? (
//           <button
//             onClick={nextQuestion}
//             //            disabled={!isAnswered()}
//             // className={`px-5 py-2 rounded-lg ${
//             //   !isAnswered()
//             //     ? "bg-gray-300 cursor-not-allowed"
//             //     : "bg-blue-600 hover:bg-blue-700"
//             // }`}
//             className="px-5 py-2 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition"
//           >
//             Next ➡
//           </button>
//         ) : (
//           <button
//             onClick={handleSubmit}
//             className="px-6 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition"
//           >
//             Submit ✅
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Quiz;
