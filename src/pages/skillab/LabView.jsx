import { useState, useMemo } from "react";
import CodeEditor from "./CodeEditor";
import { Button } from "../ui/Button";

const vulnerableCode = `// ❌ Vulnerable Login API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Wrong password" });
  }

  const token = jwt.sign({ id: user.id }, "secret");

  res.json({ token });
});
`;

const starterFixCode = `// 🔐 Rewrite securely
app.post("/login", async (req, res) => {

});
`;

export default function BackendHardeningLab() {
  const [fixedCode, setFixedCode] = useState(starterFixCode);
  const [explanation, setExplanation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    let points = 0;
    if (fixedCode.includes("bcrypt")) points++;
    if (fixedCode.includes("process.env")) points++;
    if (fixedCode.toLowerCase().includes("invalid credentials")) points++;
    if (fixedCode.includes("expiresIn")) points++;
    if (fixedCode.includes("rateLimit") || fixedCode.includes("limiter"))
      points++;
    return points;
  }, [fixedCode]);

  const xpEarned = score * 20;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Secure Login Challenge
              </h1>

              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                🔥 Intermediate
              </span>
            </div>

            <p className="mt-2 text-gray-600">
              Harden a vulnerable authentication endpoint and defend against real-world attacks.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs text-gray-500">Reward</p>
            <p className="text-lg font-bold text-gray-900">+100 XP</p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Challenge Progress</span>
            <span>{score * 20}%</span>
          </div>
          <div className="mt-3 h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${score * 20}%` }}
            />
          </div>
        </div>

        {/* EXPLOIT CARD */}
        <div className="mb-8 rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-red-600">
            💀 Exploit Scenario
          </h3>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            An attacker can brute-force passwords, enumerate valid emails,
            and forge JWT tokens due to predictable secrets and lack of rate limiting.
          </p>
        </div>

        {/* CODE SECTION */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Vulnerable Code (Read Only)
            </h2>
            <CodeEditor
              language="javascript"
              value={vulnerableCode}
              readOnly
              height="420px"
            />
          </div>

          <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Your Secure Implementation
            </h2>
            <CodeEditor
              language="javascript"
              value={fixedCode}
              onChange={setFixedCode}
              height="420px"
            />
          </div>
        </div>

        {/* EXPLANATION */}
        <div className="mt-10 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">
            Security Explanation
          </h3>

          <textarea
            className="mt-4 w-full rounded-lg border border-gray-300 p-4 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            rows={6}
            placeholder="Explain the vulnerabilities and how your fix prevents them..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        </div>

        {/* SUBMIT */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSubmit}>
            Submit & Evaluate
          </Button>
        </div>

        {/* RESULT PANEL */}
        {submitted && (
          <div className="mt-10 rounded-xl border border-green-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-green-600">
              🔐 Evaluation Result
            </h3>

            <p className="mt-3 text-gray-700">
              Security Score:{" "}
              <span className="font-bold">{score} / 5</span>
            </p>

            <p className="mt-2 text-gray-700">
              XP Earned:{" "}
              <span className="font-bold text-purple-600">
                +{xpEarned} XP
              </span>
            </p>

            {score < 3 && (
              <p className="mt-3 text-sm text-red-600">
                ⚠ Critical weaknesses remain.
              </p>
            )}

            {score >= 3 && score < 5 && (
              <p className="mt-3 text-sm text-yellow-600">
                👍 Good improvements. More hardening needed.
              </p>
            )}

            {score === 5 && (
              <p className="mt-3 text-sm text-green-600">
                🚀 Excellent backend security awareness.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}


// import { useState } from "react";
// import CodeEditor from "./CodeEditor";
// import { Button } from "../ui/Button";

// const vulnerableCode = `// ❌ Vulnerable Login API (READ ONLY)
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ where: { email } });

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   if (user.password !== password) {
//     return res.status(401).json({ message: "Wrong password" });
//   }

//   const token = jwt.sign({ id: user.id }, "secret");

//   res.json({ token });
// });
// `;

// const starterFixCode = `// ✅ Rewrite this login endpoint securely
// // - Prevent user enumeration
// // - Use hashed passwords
// // - Secure JWT handling
// // - Explain your decisions below

// app.post("/login", async (req, res) => {

// });
// `;

// export default function LabView() {
//   const [fixedCode, setFixedCode] = useState(starterFixCode);
//   const [explanation, setExplanation] = useState("");

//   const handleSubmit = () => {
//     console.log({
//       fixedCode,
//       explanation,
//     });
//   };

//   return (
//     <div className="mx-auto max-w-6xl px-4 py-8 text-white">
//       {/* Header */}
//       <div className="mb-6">
//         <div className="flex items-center gap-3">
//           <h1 className="text-2xl font-bold">Secure Login API</h1>
//           <span className="rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-400">
//             Web API Security
//           </span>
//         </div>
//         <p className="mt-2 max-w-3xl text-white/70">
//           Review the vulnerable Node.js login API below. Identify the security issues,
//           rewrite the endpoint using best practices, and explain why your fixes matter.
//         </p>
//       </div>

//       {/* Editors */}
//       <div className="grid gap-6 lg:grid-cols-2">
//         <CodeEditor
//           title="Vulnerable Login API (Audit Mode)"
//           language="javascript"
//           value={vulnerableCode}
//           readOnly
//           height="360px"
//         />

//         <CodeEditor
//           title="Your Secure Implementation"
//           language="javascript"
//           value={fixedCode}
//           onChange={setFixedCode}
//           height="360px"
//           onReset={() => setFixedCode(starterFixCode)}
//         />
//       </div>

//       {/* Explanation */}
//       <div className="mt-6">
//         <label className="text-sm font-semibold text-white">
//           Explain the vulnerabilities and your fixes
//         </label>
//         <p className="mt-1 text-xs text-white/60">
//           Explain what was wrong, how it could be abused, and why your solution is safer.
//         </p>

//         <textarea
//           className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-white placeholder:text-white/40"
//           rows={6}
//           placeholder="Example: The original code leaks user existence via error messages..."
//           value={explanation}
//           onChange={(e) => setExplanation(e.target.value)}
//         />
//       </div>

//       {/* Submit */}
//       <div className="mt-8 flex items-center justify-between">
//         <p className="text-xs text-white/50">
//           This lab tests secure authentication, error handling, and API hardening.
//         </p>
//         <Button onClick={handleSubmit}>
//           Submit Secure Solution
//         </Button>
//       </div>
//     </div>
//   );
// }


// import { useState } from "react";
// import CodeEditor from "./CodeEditor";
// import { Button } from "../ui/Button";
// export default function LabView() {
//   const [code, setCode] = useState(`// Fix the vulnerability
// app.get("/orders/:id", auth, async (req, res) => {
//   const order = await Order.findByPk(req.params.id);
//   res.json(order);
// });`);

//   const [explanation, setExplanation] = useState("");

//   const handleSubmit = () => {
//     console.log({
//       code,
//       explanation,
//     });
//   };

//   return (
//     <div className="mx-auto max-w-5xl px-4 py-8 text-white">
//       <h1 className="text-2xl font-bold">Fix IDOR Vulnerability</h1>
//       <p className="mt-2 text-white/70">
//         Users can access other users’ orders by changing the ID. Fix it and explain why.
//       </p>

//       <div className="mt-6">
//         <CodeEditor
//           value={code}
//           onChange={setCode}
//           language="javascript"
//           height="350px"
//         />
//       </div>

//       <div className="mt-4">
//         <label className="text-sm font-semibold">Explain your fix</label>
//         <textarea
//           className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 p-3 text-sm"
//           rows={5}
//           value={explanation}
//           onChange={(e) => setExplanation(e.target.value)}
//         />
//       </div>

//       <div className="mt-6">
//         <Button onClick={handleSubmit}>
//           Submit Solution
//         </Button>
//       </div>
//     </div>
//   );
// }
