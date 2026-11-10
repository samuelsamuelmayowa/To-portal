import { useEffect, useMemo, useState } from "react";
import { FaCheck, FaGraduationCap, FaSearch, FaSpinner, FaUsers } from "react-icons/fa";
import { cookieAuthApi } from "../lib/cookieAuth";

function formatDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en-NG", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function ResourceCard({ resource, checked, onChange }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${checked ? "border-indigo-300 bg-indigo-50/70" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-slate-900">{resource.title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {resource.type === "course" ? "Course materials and classroom" : "Assessment and quiz results"}
        </span>
      </span>
      {checked && <FaCheck className="mt-1 shrink-0 text-indigo-600" aria-hidden="true" />}
    </label>
  );
}

export default function StudentAccess() {
  const [students, setStudents] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedResourceIds, setSelectedResourceIds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAccess = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await cookieAuthApi.get("/api/admin/student-access");
      const nextStudents = Array.isArray(data?.students) ? data.students : [];
      setStudents(nextStudents);
      setResources(Array.isArray(data?.resources) ? data.resources : []);
      setSelectedEmail((current) => current || nextStudents[0]?.email || "");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Student access could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAccess(); }, []);

  const selectedStudent = students.find((student) => student.email === selectedEmail) || null;
  const selectedSavedResources = selectedStudent?.resourceIds || [];
  const isDirty = [...new Set([...selectedResourceIds, ...selectedSavedResources])]
    .some((resourceId) => selectedResourceIds.includes(resourceId) !== selectedSavedResources.includes(resourceId));

  useEffect(() => {
    setSelectedResourceIds(selectedStudent?.resourceIds || []);
    setNotice("");
  }, [selectedEmail]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => `${student.name} ${student.email}`.toLowerCase().includes(query));
  }, [students, search]);

  const canAddEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(search.trim());
  const addEmailStudent = () => {
    const email = search.trim().toLowerCase();
    if (!canAddEmail) return;
    const existing = students.find((student) => student.email === email);
    if (existing) {
      setSelectedEmail(email);
    } else {
      setStudents((current) => [...current, {
        id: `pending:${email}`,
        name: email,
        email,
        provider: "pre-registration assignment",
        createdAt: null,
        resourceIds: [],
      }]);
      setSelectedEmail(email);
    }
    setSearch("");
    setError("");
  };

  const assignedStudentCount = students.filter((student) => student.resourceIds?.length).length;
  const assignmentCount = students.reduce((total, student) => total + (student.resourceIds?.length || 0), 0);

  const toggleResource = (resourceId) => {
    setNotice("");
    setSelectedResourceIds((current) => current.includes(resourceId)
      ? current.filter((id) => id !== resourceId)
      : [...current, resourceId]);
  };

  const saveAccess = async () => {
    if (!selectedStudent || saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const { data } = await cookieAuthApi.put("/api/admin/student-access", {
        email: selectedStudent.email,
        resourceIds: selectedResourceIds,
      });
      const savedIds = data?.access?.resourceIds || selectedResourceIds;
      setStudents((current) => current.map((student) => student.email === selectedStudent.email
        ? { ...student, resourceIds: savedIds }
        : student));
      setSelectedResourceIds(savedIds);
      setNotice(selectedStudent.provider === "pre-registration assignment"
        ? "Access saved. It will be ready when the student signs in with this email."
        : "Access saved. The student can use the selected courses and quizzes now.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Access could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const courseResources = resources.filter((resource) => resource.type === "course");
  const quizResources = resources.filter((resource) => resource.type === "quiz");

  return (
    <main className="space-y-6">
      <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Learning permissions</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Student course & quiz access</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Choose an existing student or enter an email, select the courses and quizzes they can open, then save.
            </p>
          </div>
          <button
            type="button"
            onClick={loadAccess}
            disabled={loading}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15 disabled:opacity-60"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaUsers />}
            Refresh students
          </button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-semibold text-slate-400">Student accounts & assignments</p><p className="mt-1 text-2xl font-black">{students.length}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-semibold text-slate-400">Students with access</p><p className="mt-1 text-2xl font-black">{assignedStudentCount}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-semibold text-slate-400">Active assignments</p><p className="mt-1 text-2xl font-black">{assignmentCount}</p></div>
        </div>
      </header>

      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      {notice && <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</div>}

      <section className="grid gap-5 xl:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-black text-slate-950">Find or add a student</h2>
            <div className="relative mt-4">
              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            {canAddEmail && !students.some((student) => student.email === search.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={addEmailStudent}
                className="mt-3 w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-left text-sm font-bold text-indigo-800 transition hover:bg-indigo-100"
              >
                Assign access to {search.trim().toLowerCase()}
                <span className="mt-1 block text-xs font-medium text-indigo-600">You can assign access before the student’s first sign-in.</span>
              </button>
            )}
          </div>
          <div className="max-h-[620px] overflow-y-auto p-3">
            {loading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-slate-500"><FaSpinner className="animate-spin" /> Loading students</div>
            ) : filteredStudents.length ? filteredStudents.map((student) => {
              const selected = student.email === selectedEmail;
              return (
                <button
                  type="button"
                  key={student.id || student.email}
                  onClick={() => setSelectedEmail(student.email)}
                  className={`mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${selected ? "bg-indigo-50 ring-1 ring-indigo-200" : "hover:bg-slate-50"}`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black uppercase text-white ${selected ? "bg-indigo-600" : "bg-slate-400"}`}><FaGraduationCap /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-900">{student.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{student.email}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{student.resourceIds?.length || 0}</span>
                </button>
              );
            }) : <p className="px-3 py-8 text-center text-sm text-slate-500">No students match this search. Enter a valid email above to create an assignment.</p>}
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {selectedStudent ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-600">Access for</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">{selectedStudent.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{selectedStudent.email} · Joined {formatDate(selectedStudent.createdAt)}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold capitalize text-slate-600">{selectedStudent.provider || "student account"}</span>
              </div>

              <div className="mt-6 space-y-7">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Courses</h3><span className="text-xs font-semibold text-slate-400">{courseResources.length} available</span></div>
                  <div className="grid gap-3 md:grid-cols-2">{courseResources.map((resource) => <ResourceCard key={resource.id} resource={resource} checked={selectedResourceIds.includes(resource.id)} onChange={() => toggleResource(resource.id)} />)}</div>
                </div>
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Quizzes</h3><span className="text-xs font-semibold text-slate-400">{quizResources.length} available</span></div>
                  <div className="grid gap-3 md:grid-cols-2">{quizResources.map((resource) => <ResourceCard key={resource.id} resource={resource} checked={selectedResourceIds.includes(resource.id)} onChange={() => toggleResource(resource.id)} />)}</div>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <p className="text-xs leading-5 text-slate-500">Unchecking a resource revokes access when you save.</p>
                <button
                  type="button"
                  onClick={saveAccess}
                  disabled={!isDirty || saving}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? <><FaSpinner className="animate-spin" /> Saving access…</> : <><FaCheck /> Save access</>}
                </button>
              </div>
            </>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
              <FaUsers className="text-3xl text-slate-300" />
              <h2 className="mt-4 text-lg font-black text-slate-900">Select or add a student</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Their course and quiz permissions will appear here.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
