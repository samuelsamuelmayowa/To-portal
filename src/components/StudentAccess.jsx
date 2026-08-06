import { useEffect, useMemo, useState } from "react";

import {
  FaBookOpen,
  FaCalendarAlt,
  FaCheck,
  FaEnvelope,
  FaExclamationTriangle,
  FaPen,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaSpinner,
  FaSyncAlt,
  FaTrash,
  FaUserCheck,
  FaUserClock,
  FaUserGraduate,
  FaUserSlash,
  FaUsers,
  FaXmark,
} from "react-icons/fa";

const INITIAL_FORM = {
  full_name: "",
  email: "",
  course_id: "splunk",
  status: "active",
  expires_at: "",
};

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Active",
  },
  {
    value: "suspended",
    label: "Suspended",
  },
  {
    value: "revoked",
    label: "Revoked",
  },
];

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function formatDate(value) {
  if (!value) return "No expiry";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

function isAccessExpired(student) {
  if (!student?.expires_at) return false;

  const expiryTime = new Date(student.expires_at).getTime();

  return Number.isFinite(expiryTime) && expiryTime < Date.now();
}

async function readJsonResponse(response) {
  let result = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(
      result?.error ||
        result?.message ||
        "The request could not be completed.",
    );
  }

  return result;
}

function StatusBadge({ student }) {
  const expired = isAccessExpired(student);

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
        <FaUserClock size={11} />
        Expired
      </span>
    );
  }

  if (student.status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
        <FaUserCheck size={11} />
        Active
      </span>
    );
  }

  if (student.status === "suspended") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700 ring-1 ring-inset ring-orange-200">
        <FaUserClock size={11} />
        Suspended
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-200">
      <FaUserSlash size={11} />
      Revoked
    </span>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters, onClearFilters }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
        <FaUserGraduate size={27} />
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">
        {hasFilters ? "No students matched" : "No access records yet"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try changing your search text or selected status filter."
          : "Add your first student to give them access to the learning portal."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-600"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

const StudentAccess = () => {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);

  const [editingId, setEditingId] = useState(null);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [actionId, setActionId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.status === "active" && !isAccessExpired(student),
      ).length,
    [students],
  );

  const suspendedStudents = useMemo(
    () =>
      students.filter((student) => student.status === "suspended").length,
    [students],
  );

  const expiredStudents = useMemo(
    () => students.filter(isAccessExpired).length,
    [students],
  );

  const filteredStudents = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    return students.filter((student) => {
      const expired = isAccessExpired(student);

      const matchesSearch =
        !search ||
        student.full_name?.toLowerCase().includes(search) ||
        student.email?.toLowerCase().includes(search) ||
        student.course_id?.toLowerCase().includes(search);

      let matchesStatus = true;

      if (statusFilter === "expired") {
        matchesStatus = expired;
      } else if (statusFilter !== "all") {
        matchesStatus =
          student.status === statusFilter && !expired;
      }

      return matchesSearch && matchesStatus;
    });
  }, [students, searchValue, statusFilter]);

  const hasFilters =
    searchValue.trim().length > 0 || statusFilter !== "all";

  async function fetchStudents({ silent = false } = {}) {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    try {
      const response = await fetch("/api/student-access", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await readJsonResponse(response);

      const records = Array.isArray(result)
        ? result
        : Array.isArray(result?.students)
          ? result.students
          : [];

      setStudents(records);
    } catch (error) {
      console.error("Failed to load student access records:", error);

      setErrorMessage(
        error.message ||
          "Student access records could not be loaded.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  function updateFormField(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function clearMessages() {
    setErrorMessage("");
    setSuccessMessage("");
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingId(null);
    clearMessages();
  }

  function handleEdit(student) {
    clearMessages();

    setEditingId(student.id);

    setForm({
      full_name: student.full_name || "",
      email: student.email || "",
      course_id: student.course_id || "splunk",
      status: student.status || "active",
      expires_at: toDateTimeLocal(student.expires_at),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearMessages();

    const normalizedEmail = normalizeEmail(form.email);
    const fullName = form.full_name.trim();

    if (!normalizedEmail) {
      setErrorMessage("Enter the student's email address.");
      return;
    }

    if (!normalizedEmail.includes("@")) {
      setErrorMessage("Enter a valid student email address.");
      return;
    }

    if (!fullName) {
      setErrorMessage("Enter the student's full name.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        full_name: fullName,
        email: normalizedEmail,
        course_id: form.course_id.trim().toLowerCase(),
        status: form.status,
        expires_at: form.expires_at
          ? new Date(form.expires_at).toISOString()
          : null,
      };

      if (editingId) {
        payload.id = editingId;
      }

      const response = await fetch("/api/student-access", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await readJsonResponse(response);

      const savedStudent = result?.student || result?.data;

      if (savedStudent?.id) {
        setStudents((currentStudents) => {
          if (editingId) {
            return currentStudents.map((student) =>
              student.id === savedStudent.id
                ? savedStudent
                : student,
            );
          }

          return [savedStudent, ...currentStudents];
        });
      } else {
        await fetchStudents({
          silent: true,
        });
      }

      setSuccessMessage(
        editingId
          ? "Student access was updated successfully."
          : "Student access was granted successfully.",
      );

      setForm(INITIAL_FORM);
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save student access:", error);

      setErrorMessage(
        error.message ||
          "The student access record could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(student, nextStatus) {
    clearMessages();
    setActionId(student.id);

    try {
      const response = await fetch("/api/student-access", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: student.id,
          status: nextStatus,
        }),
      });

      const result = await readJsonResponse(response);

      const updatedStudent = result?.student || result?.data;

      setStudents((currentStudents) =>
        currentStudents.map((currentStudent) =>
          currentStudent.id === student.id
            ? updatedStudent || {
                ...currentStudent,
                status: nextStatus,
              }
            : currentStudent,
        ),
      );

      setSuccessMessage(
        `Student access changed to ${nextStatus}.`,
      );
    } catch (error) {
      console.error("Failed to change access status:", error);

      setErrorMessage(
        error.message ||
          "The student's access status could not be changed.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(student) {
    const confirmed = window.confirm(
      `Delete access for ${student.email}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    clearMessages();
    setDeletingId(student.id);

    try {
      const response = await fetch(
        `/api/student-access?id=${encodeURIComponent(student.id)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        },
      );

      await readJsonResponse(response);

      setStudents((currentStudents) =>
        currentStudents.filter(
          (currentStudent) => currentStudent.id !== student.id,
        ),
      );

      if (editingId === student.id) {
        setForm(INITIAL_FORM);
        setEditingId(null);
      }

      setSuccessMessage("Student access record was deleted.");
    } catch (error) {
      console.error("Failed to delete student access:", error);

      setErrorMessage(
        error.message ||
          "The student access record could not be deleted.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function clearFilters() {
    setSearchValue("");
    setStatusFilter("all");
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-28 right-40 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200">
              <FaShieldAlt size={12} />
              Portal permissions
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Student Access Management
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Approve students, manage course permissions, suspend accounts,
              set expiry dates, and remove access from one secure workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchStudents({
                silent: true,
              })
            }
            disabled={refreshing}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaSyncAlt
              size={13}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh records"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total students"
          value={loading ? "—" : students.length}
          description="All portal access records"
          icon={FaUsers}
          iconClassName="bg-indigo-50 text-indigo-600"
        />

        <SummaryCard
          title="Active access"
          value={loading ? "—" : activeStudents}
          description="Students allowed into portal"
          icon={FaUserCheck}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          title="Suspended"
          value={loading ? "—" : suspendedStudents}
          description="Temporarily blocked accounts"
          icon={FaUserSlash}
          iconClassName="bg-orange-50 text-orange-600"
        />

        <SummaryCard
          title="Expired"
          value={loading ? "—" : expiredStudents}
          description="Access date has passed"
          icon={FaUserClock}
          iconClassName="bg-amber-50 text-amber-600"
        />
      </section>

      {(errorMessage || successMessage) && (
        <section>
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
              <FaExclamationTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div className="min-w-0 flex-1">
                <p className="font-bold">Something went wrong</p>
                <p className="mt-1 text-sm leading-6">
                  {errorMessage}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close error"
                onClick={() => setErrorMessage("")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-100"
              >
                <FaXmark />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
              <FaCheck
                size={17}
                className="mt-0.5 shrink-0"
              />

              <div className="min-w-0 flex-1">
                <p className="font-bold">Completed successfully</p>
                <p className="mt-1 text-sm leading-6">
                  {successMessage}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close success message"
                onClick={() => setSuccessMessage("")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-100"
              >
                <FaXmark />
              </button>
            </div>
          )}
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:sticky xl:top-28">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                {editingId ? "Update record" : "New permission"}
              </p>

              <h2 className="mt-2 text-xl font-black text-slate-950">
                {editingId
                  ? "Edit student access"
                  : "Grant student access"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add the exact email the student uses when logging in.
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              {editingId ? <FaPen /> : <FaPlus />}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="full_name"
                className="text-sm font-bold text-slate-700"
              >
                Student full name
              </label>

              <div className="relative mt-2">
                <FaUserGraduate
                  size={15}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={updateFormField}
                  placeholder="Samuel Mayowa"
                  autoComplete="name"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm font-bold text-slate-700"
              >
                Login email
              </label>

              <div className="relative mt-2">
                <FaEnvelope
                  size={14}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateFormField}
                  placeholder="student@example.com"
                  autoComplete="email"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                The email is automatically saved in lowercase.
              </p>
            </div>

            <div>
              <label
                htmlFor="course_id"
                className="text-sm font-bold text-slate-700"
              >
                Course
              </label>

              <div className="relative mt-2">
                <FaBookOpen
                  size={14}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  id="course_id"
                  name="course_id"
                  value={form.course_id}
                  onChange={updateFormField}
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="splunk">Splunk Training</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="status"
                className="text-sm font-bold text-slate-700"
              >
                Access status
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={updateFormField}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="expires_at"
                className="text-sm font-bold text-slate-700"
              >
                Expiry date
              </label>

              <div className="relative mt-2">
                <FaCalendarAlt
                  size={14}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="expires_at"
                  name="expires_at"
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={updateFormField}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Leave empty when access should not expire.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : editingId ? (
                  <>
                    <FaCheck />
                    Save changes
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Grant access
                  </>
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                >
                  <FaXmark />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </aside>

        <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Student access records
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review and manage all learning-portal permissions.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 sm:w-72">
                  <FaSearch
                    size={14}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={searchValue}
                    onChange={(event) =>
                      setSearchValue(event.target.value)
                    }
                    placeholder="Search name or email"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="revoked">Revoked</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-96 flex-col items-center justify-center gap-4">
              <FaSpinner
                size={28}
                className="animate-spin text-indigo-600"
              />

              <div className="text-center">
                <p className="font-bold text-slate-800">
                  Loading students
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Retrieving access records...
                </p>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <EmptyState
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Student
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Course
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Expiry
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Added
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => {
                    const busy =
                      actionId === student.id ||
                      deletingId === student.id;

                    return (
                      <tr
                        key={student.id}
                        className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-black uppercase text-white">
                              {(student.full_name ||
                                student.email ||
                                "S")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-56 truncate text-sm font-bold text-slate-900">
                                {student.full_name || "Unnamed student"}
                              </p>

                              <p className="mt-1 max-w-64 truncate text-xs font-medium text-slate-500">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold capitalize text-indigo-700">
                            <FaBookOpen size={11} />
                            {student.course_id || "splunk"}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge student={student} />
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-semibold text-slate-700">
                            {formatDate(student.expires_at)}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-semibold text-slate-700">
                            {formatDate(student.created_at)}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              aria-label={`Change access status for ${student.email}`}
                              value={student.status}
                              disabled={busy}
                              onChange={(event) =>
                                handleStatusChange(
                                  student,
                                  event.target.value,
                                )
                              }
                              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:opacity-50"
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              aria-label={`Edit ${student.email}`}
                              onClick={() => handleEdit(student)}
                              disabled={busy}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
                            >
                              <FaPen size={12} />
                            </button>

                            <button
                              type="button"
                              aria-label={`Delete ${student.email}`}
                              onClick={() => handleDelete(student)}
                              disabled={busy}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              {deletingId === student.id ? (
                                <FaSpinner
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <FaTrash size={12} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredStudents.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p>
                Showing {filteredStudents.length} of {students.length} records
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-fit font-bold text-indigo-600 transition hover:text-indigo-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentAccess;