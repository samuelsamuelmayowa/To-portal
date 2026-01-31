import { useState } from "react";

const ROLES = [
  {
    key: "pentesting",
    title: "Pentesting",
    interviews: [
      "Web & API vulnerability testing",
      "Exploit explanation",
      "Security reporting",
    ],
    salary: "$60k – $120k",
  },
  {
    key: "backend",
    title: "Backend Engineer",
    interviews: [
      "Secure login & authentication",
      "API design & debugging",
      "Code review",
    ],
    salary: "$55k – $110k",
  },
  {
    key: "soc",
    title: "SOC Analyst",
    interviews: [
      "Log analysis",
      "Incident response scenarios",
      "Alert triage",
    ],
    salary: "$45k – $90k",
  },
  {
    key: "splunk",
    title: "Splunk Engineer",
    interviews: [
      "SPL queries",
      "Dashboards & alerts",
      "Threat detection",
    ],
    salary: "$70k – $140k",
  },
];

export default function Profile() {
  const [selectedRoles, setSelectedRoles] = useState(["pentesting"]);

  const toggleRole = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold">My SkillLab Profile</h1>
          <p className="mt-2 text-sm text-gray-300">
            Choose your focus and see the interviews you’re preparing for.
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-12">
          <h2 className="mb-4 text-lg font-semibold">My Niche</h2>
          <div className="flex flex-wrap gap-3">
            {ROLES.map((role) => {
              const active = selectedRoles.includes(role.key);
              return (
                <button
                  key={role.key}
                  onClick={() => toggleRole(role.key)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition
                    ${
                      active
                        ? "bg-white text-black"
                        : "border border-white bg-black text-white hover:bg-white hover:text-black"
                    }`}
                >
                  {role.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Role Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {ROLES.filter((r) => selectedRoles.includes(r.key)).map((role) => (
            <div
              key={role.key}
              className="rounded-2xl border border-white bg-black p-6"
            >
              <h3 className="text-lg font-bold">{role.title}</h3>

              <div className="mt-4">
                <p className="text-sm font-semibold">Interview Focus</p>
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-300">
                  {role.interviews.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold">Typical Salary Range</p>
                <p className="mt-1 text-sm text-gray-300">{role.salary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
