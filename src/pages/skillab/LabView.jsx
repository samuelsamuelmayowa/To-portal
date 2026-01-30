import { useState } from "react";
import CodeEditor from "./CodeEditor";
import { Button } from "../ui/Button";

const vulnerableCode = `// ❌ Vulnerable Login API (READ ONLY)
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

const starterFixCode = `// ✅ Rewrite this login endpoint securely
// - Prevent user enumeration
// - Use hashed passwords
// - Secure JWT handling
// - Explain your decisions below

app.post("/login", async (req, res) => {

});
`;

export default function LabView() {
  const [fixedCode, setFixedCode] = useState(starterFixCode);
  const [explanation, setExplanation] = useState("");

  const handleSubmit = () => {
    console.log({
      fixedCode,
      explanation,
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-white">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Secure Login API</h1>
          <span className="rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-400">
            Web API Security
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-white/70">
          Review the vulnerable Node.js login API below. Identify the security issues,
          rewrite the endpoint using best practices, and explain why your fixes matter.
        </p>
      </div>

      {/* Editors */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CodeEditor
          title="Vulnerable Login API (Audit Mode)"
          language="javascript"
          value={vulnerableCode}
          readOnly
          height="360px"
        />

        <CodeEditor
          title="Your Secure Implementation"
          language="javascript"
          value={fixedCode}
          onChange={setFixedCode}
          height="360px"
          onReset={() => setFixedCode(starterFixCode)}
        />
      </div>

      {/* Explanation */}
      <div className="mt-6">
        <label className="text-sm font-semibold text-white">
          Explain the vulnerabilities and your fixes
        </label>
        <p className="mt-1 text-xs text-white/60">
          Explain what was wrong, how it could be abused, and why your solution is safer.
        </p>

        <textarea
          className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-white placeholder:text-white/40"
          rows={6}
          placeholder="Example: The original code leaks user existence via error messages..."
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </div>

      {/* Submit */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs text-white/50">
          This lab tests secure authentication, error handling, and API hardening.
        </p>
        <Button onClick={handleSubmit}>
          Submit Secure Solution
        </Button>
      </div>
    </div>
  );
}


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
