import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  FaCalendarAlt,
  FaCheckCircle,
  FaCloud,
  FaEdit,
  FaExclamationTriangle,
  FaGlobe,
  FaMoneyBillWave,
  FaPlus,
  FaSearch,
  FaServer,
  FaTimes,
  FaTrash,
  FaUserTie,
  FaVideo,
} from "react-icons/fa";

const STORAGE_KEY = "to-admin-operating-expenses";

const initialExpenses = [
  {
    id: "massive-stock-api",
    name: "Stock Market API",
    provider: "Massive.com",
    category: "API / Data",
    amount: 29,
    currency: "USD",
    billingCycle: "monthly",
    status: "active",
    renewalDate: "",
    notes: "Stock market data used inside the TO application.",
  },
  {
    id: "video-storage",
    name: "Video Storage",
    provider: "Vildine",
    category: "Storage",
    amount: 72,
    currency: "USD",
    billingCycle: "yearly",
    status: "active",
    renewalDate: "",
    notes: "Annual video storage cost.",
  },
  {
    id: "domain",
    name: "TO Domain",
    provider: "Domain Provider",
    category: "Domain",
    amount: 50000,
    currency: "NGN",
    billingCycle: "yearly",
    status: "active",
    renewalDate: "",
    notes:
      "Domain expires this month, August 2026. Add the exact renewal date when confirmed.",
  },
  {
    id: "frontend-hosting",
    name: "Frontend Hosting",
    provider: "Current Hosting Provider",
    category: "Hosting",
    amount: 0,
    currency: "USD",
    billingCycle: "free",
    status: "free",
    renewalDate: "",
    notes: "Frontend hosting is currently free.",
  },
  {
    id: "render-backend",
    name: "Backend Hosting",
    provider: "Render",
    category: "Hosting",
    amount: 25,
    currency: "USD",
    billingCycle: "monthly",
    status: "active",
    renewalDate: "",
    notes: "Render backend hosting.",
  },
  {
    id: "vimeo",
    name: "Video Platform",
    provider: "Vimeo Standard",
    category: "Video",
    amount: 25,
    currency: "USD",
    billingCycle: "monthly",
    status: "active",
    renewalDate: "",
    notes: "Standard Vimeo subscription.",
  },
  {
    id: "instructor",
    name: "Instructor",
    provider: "To be confirmed",
    category: "Staff / Teaching",
    amount: "",
    currency: "NGN",
    billingCycle: "unknown",
    status: "unknown",
    renewalDate: "",
    notes:
      "Cost of bringing in an instructor to teach students has not been confirmed.",
  },
  {
    id: "zoom",
    name: "Zoom",
    provider: "Zoom",
    category: "Communication",
    amount: "",
    currency: "USD",
    billingCycle: "unknown",
    status: "unknown",
    renewalDate: "",
    notes: "Zoom plan and price still need to be confirmed.",
  },
];

const emptyForm = {
  name: "",
  provider: "",
  category: "Other",
  amount: "",
  currency: "USD",
  billingCycle: "monthly",
  status: "active",
  renewalDate: "",
  notes: "",
};

const categories = [
  "API / Data",
  "Hosting",
  "Storage",
  "Domain",
  "Video",
  "Communication",
  "Staff / Teaching",
  "Marketing",
  "Software",
  "Other",
];

const billingOptions = [
  {
    value: "monthly",
    label: "Monthly",
  },
  {
    value: "yearly",
    label: "Yearly",
  },
  {
    value: "one-time",
    label: "One-time",
  },
  {
    value: "free",
    label: "Free",
  },
  {
    value: "unknown",
    label: "Unknown",
  },
];

function loadExpenses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return initialExpenses;
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : initialExpenses;
  } catch {
    return initialExpenses;
  }
}

function formatMoney(amount, currency = "USD") {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "Not set";
  }

  return new Intl.NumberFormat(
    currency === "NGN" ? "en-NG" : "en-US",
    {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "NGN" ? 0 : 2,
    },
  ).format(numericAmount);
}

function getMonthlyEquivalent(expense) {
  const amount = Number(expense.amount);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  if (expense.billingCycle === "monthly") {
    return amount;
  }

  if (expense.billingCycle === "yearly") {
    return amount / 12;
  }

  return 0;
}

function getAnnualEquivalent(expense) {
  const amount = Number(expense.amount);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  if (expense.billingCycle === "monthly") {
    return amount * 12;
  }

  if (expense.billingCycle === "yearly") {
    return amount;
  }

  if (expense.billingCycle === "one-time") {
    return amount;
  }

  return 0;
}

function getExpenseIcon(category) {
  switch (category) {
    case "Hosting":
      return FaServer;

    case "Storage":
      return FaCloud;

    case "Domain":
      return FaGlobe;

    case "Video":
      return FaVideo;

    case "Communication":
      return FaVideo;

    case "Staff / Teaching":
      return FaUserTie;

    default:
      return FaMoneyBillWave;
  }
}

function BillingBadge({ cycle }) {
  const styles = {
    monthly: "bg-blue-50 text-blue-700 border-blue-100",
    yearly: "bg-purple-50 text-purple-700 border-purple-100",
    "one-time": "bg-amber-50 text-amber-700 border-amber-100",
    free: "bg-emerald-50 text-emerald-700 border-emerald-100",
    unknown: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const labels = {
    monthly: "Monthly",
    yearly: "Yearly",
    "one-time": "One-time",
    free: "Free",
    unknown: "Cost not set",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${
        styles[cycle] || styles.unknown
      }`}
    >
      {labels[cycle] || cycle}
    </span>
  );
}

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState(loadExpenses);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const saveExpenses = (nextExpenses) => {
    setExpenses(nextExpenses);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nextExpenses),
      );
    } catch (error) {
      console.error("Unable to save expenses:", error);
    }
  };

  const summary = useMemo(() => {
    const result = {
      monthlyUSD: 0,
      monthlyNGN: 0,
      yearlyUSD: 0,
      yearlyNGN: 0,
      unknown: 0,
      free: 0,
      active: 0,
    };

    expenses.forEach((expense) => {
      if (
        expense.billingCycle === "unknown" ||
        expense.status === "unknown"
      ) {
        result.unknown += 1;
        return;
      }

      if (
        expense.billingCycle === "free" ||
        expense.status === "free"
      ) {
        result.free += 1;
        return;
      }

      result.active += 1;

      const monthly = getMonthlyEquivalent(expense);
      const yearly = getAnnualEquivalent(expense);

      if (expense.currency === "NGN") {
        result.monthlyNGN += monthly;
        result.yearlyNGN += yearly;
      } else {
        result.monthlyUSD += monthly;
        result.yearlyUSD += yearly;
      }
    });

    return result;
  }, [expenses]);

  const visibleExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        !query ||
        expense.name.toLowerCase().includes(query) ||
        expense.provider.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query) ||
        expense.notes.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        expense.billingCycle === filter ||
        expense.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [expenses, filter, search]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingId(expense.id);

    setForm({
      name: expense.name,
      provider: expense.provider,
      category: expense.category,
      amount: expense.amount,
      currency: expense.currency,
      billingCycle: expense.billingCycle,
      status: expense.status,
      renewalDate: expense.renewalDate || "",
      notes: expense.notes || "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const updateForm = (field, value) => {
    setForm((previous) => {
      const next = {
        ...previous,
        [field]: value,
      };

      if (field === "billingCycle") {
        if (value === "free") {
          next.amount = 0;
          next.status = "free";
        }

        if (value === "unknown") {
          next.amount = "";
          next.status = "unknown";
        }

        if (
          value !== "free" &&
          value !== "unknown" &&
          (previous.status === "free" ||
            previous.status === "unknown")
        ) {
          next.status = "active";
        }
      }

      return next;
    });
  };

  const submitExpense = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    const normalizedExpense = {
      ...form,
      name: form.name.trim(),
      provider:
        form.provider.trim() || "Not specified",
      notes: form.notes.trim(),
      amount:
        form.billingCycle === "unknown"
          ? ""
          : Number(form.amount || 0),
    };

    if (editingId) {
      saveExpenses(
        expenses.map((expense) =>
          expense.id === editingId
            ? {
                ...expense,
                ...normalizedExpense,
              }
            : expense,
        ),
      );
    } else {
      saveExpenses([
        {
          ...normalizedExpense,
          id: `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
        },
        ...expenses,
      ]);
    }

    closeModal();
  };

  const deleteExpense = (expense) => {
    const approved = window.confirm(
      `Delete "${expense.name}" from the expense tracker?`,
    );

    if (!approved) {
      return;
    }

    saveExpenses(
      expenses.filter(
        (item) => item.id !== expense.id,
      ),
    );
  };

  const resetExpenses = () => {
    const approved = window.confirm(
      "Reset the expense tracker back to the original TO expense list?",
    );

    if (!approved) {
      return;
    }

    saveExpenses(initialExpenses);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* HERO */}
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
        <div className="relative px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-indigo-200">
                <FaMoneyBillWave />
                Operations & Finance
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                TO Expense Tracker
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Track subscriptions, hosting,
                infrastructure, instructors,
                software and other operating
                costs required to run the TO
                platform.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 text-sm font-black text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400"
            >
              <FaPlus size={14} />
              Add Expense
            </button>
          </div>
        </div>
      </section>

      {/* SUMMARY */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Monthly running cost
              </p>

              <p className="mt-3 text-2xl font-black text-slate-950">
                {formatMoney(
                  summary.monthlyUSD,
                  "USD",
                )}
              </p>

              <p className="mt-1 text-sm font-bold text-slate-500">
                {formatMoney(
                  summary.monthlyNGN,
                  "NGN",
                )}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FaMoneyBillWave />
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-400">
            Monthly subscriptions plus the
            monthly equivalent of annual costs.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Annual estimate
              </p>

              <p className="mt-3 text-2xl font-black text-slate-950">
                {formatMoney(
                  summary.yearlyUSD,
                  "USD",
                )}
              </p>

              <p className="mt-1 text-sm font-bold text-slate-500">
                {formatMoney(
                  summary.yearlyNGN,
                  "NGN",
                )}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FaCalendarAlt />
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-400">
            Known costs only. Unknown expenses
            are excluded.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active expenses
              </p>

              <p className="mt-3 text-3xl font-black text-slate-950">
                {summary.active}
              </p>

              <p className="mt-1 text-sm font-semibold text-emerald-600">
                {summary.free} free service
                {summary.free === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FaCheckCircle />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Needs pricing
              </p>

              <p className="mt-3 text-3xl font-black text-slate-950">
                {summary.unknown}
              </p>

              <p className="mt-1 text-sm font-semibold text-amber-700">
                Cost not confirmed
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
              <FaExclamationTriangle />
            </div>
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <FaSearch
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search expense, provider or category"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="all">All expenses</option>
            <option value="monthly">
              Monthly
            </option>
            <option value="yearly">Yearly</option>
            <option value="one-time">
              One-time
            </option>
            <option value="free">Free</option>
            <option value="unknown">
              Cost not set
            </option>
          </select>

          <button
            type="button"
            onClick={resetExpenses}
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Reset starter data
          </button>
        </div>
      </section>

      {/* EXPENSE LIST */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Operating expenses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {visibleExpenses.length} expense
                {visibleExpenses.length === 1
                  ? ""
                  : "s"}{" "}
                shown
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <FaPlus size={12} />
              <span className="hidden sm:inline">
                New expense
              </span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {visibleExpenses.map((expense) => {
            const Icon = getExpenseIcon(
              expense.category,
            );

            const isUnknown =
              expense.billingCycle === "unknown";

            const isFree =
              expense.billingCycle === "free";

            return (
              <motion.div
                layout
                key={expense.id}
                className="p-5 transition hover:bg-slate-50/70 sm:p-6"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-950">
                          {expense.name}
                        </h3>

                        <BillingBadge
                          cycle={
                            expense.billingCycle
                          }
                        />
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {expense.provider}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-400">
                        <span>
                          {expense.category}
                        </span>

                        {expense.renewalDate && (
                          <span className="inline-flex items-center gap-1.5">
                            <FaCalendarAlt />
                            Renewal:{" "}
                            {new Date(
                              `${expense.renewalDate}T00:00:00`,
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {expense.notes && (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                          {expense.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 xl:min-w-[360px] xl:justify-end xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                    <div className="min-w-[130px] xl:text-right">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Cost
                      </p>

                      <p
                        className={`mt-1 text-xl font-black ${
                          isUnknown
                            ? "text-amber-600"
                            : isFree
                              ? "text-emerald-600"
                              : "text-slate-950"
                        }`}
                      >
                        {isUnknown
                          ? "Not set"
                          : isFree
                            ? "Free"
                            : formatMoney(
                                expense.amount,
                                expense.currency,
                              )}
                      </p>

                      {!isUnknown &&
                        !isFree && (
                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            per{" "}
                            {expense.billingCycle ===
                            "one-time"
                              ? "purchase"
                              : expense.billingCycle}
                          </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(expense)
                        }
                        aria-label={`Edit ${expense.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600"
                      >
                        <FaEdit size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteExpense(expense)
                        }
                        aria-label={`Delete ${expense.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                      >
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {visibleExpenses.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FaSearch size={20} />
              </div>

              <h3 className="mt-4 font-black text-slate-900">
                No expenses found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing the search or
                filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <p className="text-sm font-bold text-indigo-900">
          Current storage mode
        </p>

        <p className="mt-1 text-sm leading-6 text-indigo-700">
          Changes are saved in this browser
          using localStorage. Later, this can be
          connected to your backend so every
          administrator sees the same expense
          records.
        </p>
      </section>

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Close expense form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
                y: 15,
              }}
              className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                    Expense manager
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {editingId
                      ? "Edit Expense"
                      : "Add New Expense"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  <FaTimes />
                </button>
              </div>

              <form
                onSubmit={submitExpense}
                className="space-y-5 p-5 sm:p-7"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Expense name *
                    </span>

                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(event) =>
                        updateForm(
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. Email service"
                      className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Provider
                    </span>

                    <input
                      type="text"
                      value={form.provider}
                      onChange={(event) =>
                        updateForm(
                          "provider",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. Render"
                      className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Category
                    </span>

                    <select
                      value={form.category}
                      onChange={(event) =>
                        updateForm(
                          "category",
                          event.target.value,
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      {categories.map(
                        (category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Billing cycle
                    </span>

                    <select
                      value={
                        form.billingCycle
                      }
                      onChange={(event) =>
                        updateForm(
                          "billingCycle",
                          event.target.value,
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      {billingOptions.map(
                        (option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Currency
                    </span>

                    <select
                      value={form.currency}
                      onChange={(event) =>
                        updateForm(
                          "currency",
                          event.target.value,
                        )
                      }
                      disabled={
                        form.billingCycle ===
                        "free"
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:bg-slate-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="USD">
                        USD — US Dollar
                      </option>

                      <option value="NGN">
                        NGN — Nigerian Naira
                      </option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Amount
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.amount}
                      disabled={
                        form.billingCycle ===
                          "unknown" ||
                        form.billingCycle ===
                          "free"
                      }
                      onChange={(event) =>
                        updateForm(
                          "amount",
                          event.target.value,
                        )
                      }
                      placeholder="0.00"
                      className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none disabled:bg-slate-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Renewal / expiry date
                    </span>

                    <input
                      type="date"
                      value={form.renewalDate}
                      onChange={(event) =>
                        updateForm(
                          "renewalDate",
                          event.target.value,
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Notes
                  </span>

                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(event) =>
                      updateForm(
                        "notes",
                        event.target.value,
                      )
                    }
                    placeholder="Add any important information about this expense..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="h-11 rounded-xl bg-indigo-500 px-6 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-600"
                  >
                    {editingId
                      ? "Save Changes"
                      : "Add Expense"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminExpenses;