import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaSearch, FaSpinner, FaSyncAlt, FaTimesCircle } from "react-icons/fa";
import { cookieAuthApi } from "../lib/cookieAuth";

const formatDate = (value) => {
  if (!value) return "Not signed in yet";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-NG", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

export default function StudentAccessOverview() {
  const [students, setStudents] = useState([]);
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [accessFilter, setAccessFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAccess = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await cookieAuthApi.get("/api/admin/student-access");
      setStudents(Array.isArray(data?.students) ? data.students : []);
      setResources(Array.isArray(data?.resources) ? data.resources : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Student access could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAccess(); }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch = !query || `${student.name} ${student.email}`.toLowerCase().includes(query);
      const hasAccess = (student.resourceIds || []).length > 0;
      const matchesAccess = accessFilter === "all" || (accessFilter === "granted" ? hasAccess : !hasAccess);
      return matchesSearch && matchesAccess;
    });
  }, [students, search, accessFilter]);

  const resourceTitles = new Map(resources.map(({ id, title }) => [id, title]));
  const withAccessCount = students.filter((student) => student.resourceIds?.length > 0).length;
  const pendingCount = students.filter((student) => student.provider === "pre-registration assignment").length;

  return (
    <main className="space-y-6">
      <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <Link to="/ADMIN-DASHBOARD/student-access" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-200 transition hover:text-white"><FaArrowLeft aria-hidden="true" /> Manage access</Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Learning permissions</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Student access overview</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">See which courses and quizzes are assigned to each student account or pre-registration email.</p>
          </div>
          <button type="button" onClick={loadAccess} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15 disabled:opacity-60">
            {loading ? <FaSpinner className="animate-spin" /> : <FaSyncAlt />} Refresh list
          </button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-semibold text-slate-400">Students & assignments</p><p className="mt-1 text-2xl font-black">{students.length}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-semibold text-slate-400">With assigned access</p><p className="mt-1 text-2xl font-black">{withAccessCount}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-semibold text-slate-400">Pre-registration assignments</p><p className="mt-1 text-2xl font-black">{pendingCount}</p></div>
        </div>
      </header>

      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full sm:max-w-sm">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student name or email" aria-label="Search student access list" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">Access status
            <select value={accessFilter} onChange={(event) => setAccessFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100">
              <option value="all">All students</option><option value="granted">Has access</option><option value="none">No access</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="flex min-h-52 items-center justify-center gap-2 text-sm font-semibold text-slate-500"><FaSpinner className="animate-spin" /> Loading student access…</div>
        ) : filteredStudents.length === 0 ? (
          <div className="px-6 py-14 text-center"><p className="font-bold text-slate-800">No students found</p><p className="mt-1 text-sm text-slate-500">Try a different search or access filter.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th scope="col" className="px-5 py-3 font-bold">Student</th><th scope="col" className="px-5 py-3 font-bold">Courses</th><th scope="col" className="px-5 py-3 font-bold">Quizzes</th><th scope="col" className="px-5 py-3 font-bold">Access</th><th scope="col" className="px-5 py-3 font-bold">Account</th><th scope="col" className="px-5 py-3 font-bold">Joined</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const ids = student.resourceIds || [];
                  const hasAccess = ids.length > 0;
                  const courses = ids.filter((id) => id.startsWith("course:"));
                  const quizzes = ids.filter((id) => id.startsWith("quiz:"));
                  const isPending = student.provider === "pre-registration assignment";
                  return (
                    <tr key={student.id || student.email} className="align-top transition hover:bg-slate-50/70">
                      <td className="px-5 py-4"><p className="font-bold text-slate-900">{student.name || "Unnamed student"}</p><p className="mt-1 text-xs text-slate-500">{student.email}</p></td>
                      <td className="px-5 py-4">{courses.length ? <div className="flex max-w-xs flex-wrap gap-1.5">{courses.map((id) => <span key={id} className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-800">{resourceTitles.get(id) || id}</span>)}</div> : <span className="text-slate-400">None</span>}</td>
                      <td className="px-5 py-4">{quizzes.length ? <div className="flex max-w-sm flex-wrap gap-1.5">{quizzes.map((id) => <span key={id} className="rounded-lg bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-800">{resourceTitles.get(id) || id}</span>)}</div> : <span className="text-slate-400">None</span>}</td>
                      <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${hasAccess ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{hasAccess ? <FaCheckCircle aria-hidden="true" /> : <FaTimesCircle aria-hidden="true" />}{hasAccess ? `${ids.length} assigned` : "No access"}</span></td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isPending ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-700"}`}>{isPending ? "Pre-registration" : "Registered"}</span></td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(student.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Showing {filteredStudents.length} of {students.length} students or assignments. Access reflects saved course and quiz assignments.</div>
      </section>
    </main>
  );
}
