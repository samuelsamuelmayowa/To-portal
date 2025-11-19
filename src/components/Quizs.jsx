import React, { useState } from "react";

const SplunkQuizs = () => {
  const rawUser = localStorage.getItem("user");
  let user = null;
  try {
    user = JSON.parse(rawUser);
  } catch {
    user = { email: rawUser };
  }
  const userEmail = user?.email || "Anonymous";

  const questions = [
    {
      id: 1,
      question: "What is Splunk primarily used for?",
      options: [
        "Video editing",
        "Data collection and analytics from machine data",
        "Word processing",
        "Network cabling",
      ],
      correct: "Data collection and analytics from machine data",
    },
    {
      id: 2,
      question: "Which of the following are key components of Splunk?",
      options: [
        "Data collection, indexing, searching, and reporting",
        "Encryption, decryption, scanning, and monitoring",
        "Writing, compiling, and debugging",
        "Only data ingestion",
      ],
      correct: "Data collection, indexing, searching, and reporting",
    },
    {
      id: 3,
      question: "Splunk can analyze data from which of the following sources?",
      options: [
        "Logs, events, and metrics",
        "Emails and text messages",
        "PDF documents only",
        "None of the above",
      ],
      correct: "Logs, events, and metrics",
    },
    {
      id: 4,
      question: "What does SIEM stand for?",
      correct: "Security Information and Event Management",
    },
    {
      id: 5,
      question: "Name two core functions of Splunk SIEM.",
      correct: "Detection and Response",
    },
    {
      id: 6,
      question: "Which Splunk product provides SIEM capabilities?",
      options: [
        "Splunk Enterprise Security",
        "Splunk Cloud Monitor",
        "Splunk Universal Forwarder",
        "Splunk Dashboard Studio",
      ],
      correct: "Splunk Enterprise Security",
    },
    {
      id: 7,
      question:
        "True or False: Splunk SIEM uses correlation searches and threat intelligence to detect security events.",
      correct: "True",
    },
    {
      id: 8,
      question: "Who commonly uses Splunk SIEM?",
      options: [
        "SOC Analysts",
        "Security Engineers",
        "Compliance Teams",
        "Web Designers",
      ],
      correct: ["SOC Analysts", "Security Engineers", "Compliance Teams"],
    },
    {
      id: 9,
      question: "List two Splunk certifications required for advanced users.",
      correct: "Splunk Certified Power User, Splunk Certified Admin",
    },
    {
      id: 10,
      question:
        "What is the average salary range for a Splunk Architect or Developer?",
      correct: "$120,000 - $180,000",
    },
    {
      id: 11,
      question:
        "True or False: Splunk Certified Cybersecurity Defense Analyst is a valid certification.",
      correct: "True",
    },
    {
      id: 12,
      question: "What is the purpose of a Splunk Dashboard?",
      correct: "To visualize and monitor key data metrics",
    },
    {
      id: 13,
      question:
        "Match the visualization type with its use: Pie Chart, Line Chart, Single Value",
      correct:
        "Pie Chart → distribution; Line Chart → trends; Single Value → key metrics",
    },
    {
      id: 14,
      question:
        "What does the following SPL query return? index=main | stats count by src_ip | sort -count | head 10",
      options: [
        "Top 10 source IPs by event count",
        "Failed logins",
        "Average response time",
        "Top 10 users by response",
      ],
      correct: "Top 10 source IPs by event count",
    },
    {
      id: 15,
      question:
        "What is the main difference between Classic Dashboard and Dashboard Studio?",
      correct:
        "Dashboard Studio offers modern, customizable, and flexible visualizations",
    },
    {
      id: 16,
      question: "What are the two main types of Splunk Clusters?",
      correct: "Indexer Cluster and Search Head Cluster",
    },
    {
      id: 17,
      question: "Define Replication Factor (RF) and Search Factor (SF).",
      correct: "RF is copies of data; SF is copies of searchable data",
    },
    {
      id: 18,
      question: "What is a Splunk Forwarder used for?",
      correct: "To collect and send data to the indexer",
    },
    {
      id: 19,
      question:
        "Differentiate between a Universal Forwarder and a Heavy Forwarder.",
      correct: "UF sends raw data; HF can parse and filter data",
    },
    {
      id: 20,
      question:
        "What is the main function of the Monitoring Console in Splunk?",
      correct: "To monitor health and performance of Splunk components",
    },
    {
      id: 21,
      question: "List two advantages of using Splunk SIEM.",
      correct: "Real-time monitoring and advanced analytics",
    },
    {
      id: 22,
      question: "List two challenges of using Splunk SIEM.",
      correct: "High cost and complexity",
    },
    {
      id: 23,
      question:
        "True or False: Splunk SIEM is easy to set up and requires no training.",
      correct: "False",
    },
    {
      id: 24,
      question:
        "Mention one emerging technology trend in the future of Splunk SIEM.",
      correct: "AI-driven security automation",
    },
    {
      id: 25,
      question: "What does RBA stand for in the context of Splunk SIEM?",
      correct: "Risk-Based Alerting",
    },
    {
      id: 26,
      question:
        "According to the slides, Splunk is a leader in which Gartner report?",
      correct: "Security Information and Event Management Magic Quadrant",
    },
    {
      id: 27,
      question:
        "Summarize in one sentence why Splunk SIEM is important for organizations.",
      correct:
        "It helps organizations detect, analyze, and respond to security threats efficiently.",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [current]: answer });
  };

  const next = () => {
    if (current < questions.length - 1) setCurrent(current + 1);
    else finish();
  };

  const finish = async () => {
    // let total = 0;
    // questions.forEach((q, i) => {
    //   const userAnswer = Array.isArray(answers[i]) ? answers[i] : [answers[i]];
    //   const correctAnswer = Array.isArray(q.correct) ? q.correct : [q.correct];

    //   if (userAnswer.sort().join("") === correctAnswer.sort().join("")) {
    //     score++;
    //   }
    // });

    // // questions.forEach((q, i) => {
    // //   if (Array.isArray(q.correct)) {
    // //     if (JSON.stringify(answers[i]?.sort()) === JSON.stringify(q.correct.sort())) total++;
    // //   } else if (
    // //     answers[i] &&
    // //     q.correct.toString().toLowerCase().trim() === answers[i].toString().toLowerCase().trim()
    // //   ) {
    // //     total++;
    // //   }
    // // });
    // setScore(total);
    let total = 0;

    questions.forEach((q, i) => {
      const userAnswer = Array.isArray(answers[i]) ? answers[i] : [answers[i]];
      const correctAnswer = Array.isArray(q.correct) ? q.correct : [q.correct];

      if (userAnswer.sort().join("") === correctAnswer.sort().join("")) {
        total++;
      }
    });

    setScore(total);

    // Save to backend
    // await fetch("http://localhost:8000/api/save", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //      username:userEmail,
    //     score: total,
    //     totalQuestions: questions.length,
    //   }),
    // });
    await fetch("https://to-backendapi-v1.vercel.app/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: userEmail, // ✅ from localStorage auth
        testName: "Splunk SIEM Day 1 Quiz", // ✅ required by backend
        score: total, // ✅ your computed score
        totalQuestions: questions.length,
      }),
    });
  };

  const q = questions[current];

  if (score !== null)
    return (
      <div className="p-6 text-center bg-gray-900 rounded-lg text-white  mt-10 mb-6">
        <h1 className="text-2xl font-bold mb-3">Quiz Complete 🎉</h1>
        <p>
          {userEmail}, your score: <b>{score}</b> / {questions.length}
        </p>
      </div>
    );

  return (
    <>
      <div className="p-12 bg-gray-900 text-white rounded-lg max-w-2xl mx-auto  mt-12 mb-6">
        {/* <h1 class="text-2xl font-bold text-red-600 uppercase text-center mt-6  ">
          HEADS UP! YOU WON'T BE ABLE TO GO BACK ONCE YOU START THE QUIZ.
        </h1> */}

        <h2 className="text-xl mb-2">
          Question {current + 1} of {questions.length}
        </h2>
        <p className="font-semibold mb-4">{q.question}</p>

        {q.options ? (
          q.options.map((opt) => (
            <button
              key={opt}
              className={`block w-full text-left p-2 my-2 rounded ${
                answers[current] === opt ? "bg-blue-600" : "bg-gray-700"
              }`}
              onClick={() => handleAnswer(opt)}
            >
              {opt}
            </button>
          ))
        ) : (
          <input
            type="text"
            className="w-full p-2 bg-gray-700 rounded mb-3"
            placeholder="Type your answer..."
            value={answers[current] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
          />
        )}

        <button onClick={next} className="bg-green-600 px-4 py-2 rounded mt-2">
          {current === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </>
  );
};

export default SplunkQuizs;
