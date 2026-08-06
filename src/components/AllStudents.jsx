import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaDatabase,
  FaDownload,
  FaEnvelope,
  FaExclamationTriangle,
  FaGoogle,
  FaIdBadge,
  FaSearch,
  FaSyncAlt,
  FaUserGraduate,
  FaUsers,
} from "react-icons/fa";

import FetchAllStudents from "../hooks/FetchAllStudents";

const PAGE_SIZE = 10;

function getStudentName(student) {
  return (
    student?.name ||
    student?.fullName ||
    student?.displayName ||
    student?.username ||
    "Unnamed student"
  );
}

function getStudentEmail(student) {
  return (
    student?.email ||
    student?.userEmail ||
    "No email available"
  );
}

function getStudentProvider(student) {
  const provider = String(
    student?.provider ||
      student?.authProvider ||
      "",
  )
    .trim()
    .toLowerCase();

  if (provider) {
    return provider;
  }

  if (
    student?.firebaseUid ||
    student?.googleId
  ) {
    return "google";
  }

  return "email";
}

function getStudentDate(student) {
  return (
    student?.createdAt ||
    student?.date ||
    student?.updatedAt ||
    null
  );
}

function getStudentId(student) {
  return (
    student?._id ||
    student?.id ||
    student?.uid ||
    ""
  );
}

function formatDate(value) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isStudentFromCurrentMonth(
  student,
) {
  const value = getStudentDate(student);

  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() ===
      today.getFullYear()
  );
}

function ProviderBadge({ provider }) {
  const normalized = String(
    provider || "email",
  ).toLowerCase();

  if (
    normalized.includes("google") ||
    normalized.includes("firebase")
  ) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold capitalize text-red-700 ring-1 ring-inset ring-red-200">
        <FaGoogle size={11} />
        Google
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold capitalize text-indigo-700 ring-1 ring-inset ring-indigo-200">
      <FaEnvelope size={11} />
      {normalized || "Email"}
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
          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

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

const AllStudents = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = FetchAllStudents();

  const students = useMemo(() => {
    return Array.isArray(
      data?.data?.response,
    )
      ? data.data.response
      : [];
  }, [data]);

  const [searchValue, setSearchValue] =
    useState("");

  const [providerFilter, setProviderFilter] =
    useState("all");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [refreshing, setRefreshing] =
    useState(false);

  const providers = useMemo(() => {
    return Array.from(
      new Set(
        students
          .map(getStudentProvider)
          .filter(Boolean),
      ),
    ).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    const search = searchValue
      .trim()
      .toLowerCase();

    return students.filter((student) => {
      const name = getStudentName(
        student,
      ).toLowerCase();

      const email = getStudentEmail(
        student,
      ).toLowerCase();

      const provider =
        getStudentProvider(student);

      const id = String(
        getStudentId(student),
      ).toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        email.includes(search) ||
        provider.includes(search) ||
        id.includes(search);

      const matchesProvider =
        providerFilter === "all" ||
        provider === providerFilter;

      return (
        matchesSearch &&
        matchesProvider
      );
    });
  }, [
    students,
    searchValue,
    providerFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredStudents.length / PAGE_SIZE,
    ),
  );

  const paginatedStudents = useMemo(() => {
    const start =
      (currentPage - 1) * PAGE_SIZE;

    return filteredStudents.slice(
      start,
      start + PAGE_SIZE,
    );
  }, [filteredStudents, currentPage]);

  const googleStudents = useMemo(() => {
    return students.filter((student) =>
      getStudentProvider(student).includes(
        "google",
      ),
    ).length;
  }, [students]);

  const newThisMonth = useMemo(() => {
    return students.filter(
      isStudentFromCurrentMonth,
    ).length;
  }, [students]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, providerFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function handleRefresh() {
    setRefreshing(true);

    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }

  function exportStudents() {
    if (!filteredStudents.length) {
      return;
    }

    const escapeCsv = (value) => {
      const stringValue = String(
        value ?? "",
      ).replace(/"/g, '""');

      return `"${stringValue}"`;
    };

    const rows = [
      [
        "Name",
        "Email",
        "Provider",
        "Registration Date",
        "Student ID",
      ],
      ...filteredStudents.map(
        (student) => [
          getStudentName(student),
          getStudentEmail(student),
          getStudentProvider(student),
          formatDate(
            getStudentDate(student),
          ),
          getStudentId(student),
        ],
      ),
    ];

    const csv = rows
      .map((row) =>
        row.map(escapeCsv).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      window.URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download = `to-analytics-students-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />

        <div className="absolute -bottom-28 right-36 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200">
              <FaUserGraduate size={12} />
              Student directory
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              All Registered Students
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              View every student registered
              through your Render backend,
              search accounts, filter login
              providers and export records.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSyncAlt
                size={13}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              onClick={exportStudents}
              disabled={
                !filteredStudents.length
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaDownload size={13} />
              Export CSV
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total students"
          value={
            isLoading
              ? "—"
              : students.length
          }
          description="Registered accounts"
          icon={FaUsers}
          iconClassName="bg-indigo-50 text-indigo-600"
        />

        <SummaryCard
          title="Google accounts"
          value={
            isLoading
              ? "—"
              : googleStudents
          }
          description="Firebase or Google login"
          icon={FaGoogle}
          iconClassName="bg-red-50 text-red-600"
        />

        <SummaryCard
          title="New this month"
          value={
            isLoading
              ? "—"
              : newThisMonth
          }
          description="Recent registrations"
          icon={FaCalendarAlt}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          title="Login providers"
          value={
            isLoading
              ? "—"
              : providers.length
          }
          description="Unique authentication types"
          icon={FaDatabase}
          iconClassName="bg-purple-50 text-purple-600"
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Student accounts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing registered users from
                your MongoDB database.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-80">
                <FaSearch
                  size={14}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) =>
                    setSearchValue(
                      event.target.value,
                    )
                  }
                  placeholder="Search name, email or ID"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <select
                value={providerFilter}
                onChange={(event) =>
                  setProviderFilter(
                    event.target.value,
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
                <option value="all">
                  All providers
                </option>

                {providers.map((provider) => (
                  <option
                    key={provider}
                    value={provider}
                  >
                    {provider}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
              <FaExclamationTriangle
                size={24}
              />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-950">
              Students could not be loaded
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error.message}
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-600"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-4">
            <FaSyncAlt
              size={27}
              className="animate-spin text-indigo-600"
            />

            <div className="text-center">
              <p className="font-bold text-slate-800">
                Loading students
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Connecting to your Render
                backend...
              </p>
            </div>
          </div>
        ) : paginatedStudents.length ===
          0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
              <FaUserGraduate size={27} />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-950">
              No students found
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              No registered student matches
              your current search and provider
              filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                setProviderFilter("all");
              }}
              className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-600"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Student
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Provider
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Joined
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                      Student ID
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedStudents.map(
                    (student, index) => {
                      const name =
                        getStudentName(
                          student,
                        );

                      const email =
                        getStudentEmail(
                          student,
                        );

                      const provider =
                        getStudentProvider(
                          student,
                        );

                      const studentId =
                        getStudentId(student);

                      return (
                        <tr
                          key={
                            studentId ||
                            `${email}-${index}`
                          }
                          className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-black uppercase text-white">
                                {name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-64 truncate text-sm font-bold text-slate-900">
                                  {name}
                                </p>

                                <p className="mt-1 flex max-w-72 items-center gap-2 truncate text-xs font-medium text-slate-500">
                                  <FaEnvelope
                                    size={10}
                                  />
                                  {email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <ProviderBadge
                              provider={
                                provider
                              }
                            />
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-sm font-semibold text-slate-700">
                              {formatDate(
                                getStudentDate(
                                  student,
                                ),
                              )}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex max-w-60 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                              <FaIdBadge
                                size={12}
                                className="shrink-0 text-slate-400"
                              />

                              <span className="truncate font-mono text-xs font-semibold text-slate-600">
                                {studentId ||
                                  "Unavailable"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs font-semibold text-slate-500">
                Showing{" "}
                {(currentPage - 1) *
                  PAGE_SIZE +
                  1}
                –
                {Math.min(
                  currentPage * PAGE_SIZE,
                  filteredStudents.length,
                )}{" "}
                of {filteredStudents.length}{" "}
                students
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(1, page - 1),
                    )
                  }
                  disabled={currentPage === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaChevronLeft size={12} />
                </button>

                <span className="min-w-24 text-center text-sm font-bold text-slate-700">
                  Page {currentPage} of{" "}
                  {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1,
                        ),
                    )
                  }
                  disabled={
                    currentPage === totalPages
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaChevronRight
                    size={12}
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AllStudents;