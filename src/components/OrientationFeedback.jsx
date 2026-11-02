import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, MessageSquareText, Star, ShieldCheck } from "lucide-react";

// All feedback is persisted server-side. Do NOT use localStorage or an email
// supplied by the browser as proof of identity or as the source of ratings.
const API = "/api/orientation-feedback";

function authOptions() {
  let token = "";
  try { token = localStorage.getItem("ACCESS_TOKEN") || ""; } catch { /* no browser storage */ }
  return {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

function RatingStars({ selected, onChoose, disabled = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Choose a rating from one to five stars">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          disabled={disabled}
          onClick={() => onChoose(value)}
          onMouseEnter={() => setHovered(value)}
          onMouseLeave={() => setHovered(0)}
          onFocus={() => setHovered(value)}
          onBlur={() => setHovered(0)}
          aria-label={`${value} star${value !== 1 ? "s" : ""}`}
          aria-pressed={selected === value}
          className="rounded-xl p-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-110"
        >
          <Star
            size={34}
            strokeWidth={1.8}
            className={(hovered || selected) >= value ? "fill-amber-400 text-amber-500" : "fill-transparent text-slate-300"}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}

export default function OrientationFeedback() {
  const [summary, setSummary] = useState(null);
  const [canRate, setCanRate] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasPriorReview, setHasPriorReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadFeedback = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    const options = authOptions();
    try {
      const [summaryResult, ownResult] = await Promise.allSettled([
        fetch(API, { credentials: "include", signal }),
        fetch(`${API}/me`, { ...options, signal }),
      ]);

      if (summaryResult.status !== "fulfilled" || !summaryResult.value.ok) {
        throw new Error("The feedback service is not available yet.");
      }
      const summaryData = await summaryResult.value.json();
      setSummary(summaryData?.summary || { count: 0, average: null });

      if (ownResult.status === "fulfilled" && ownResult.value.ok) {
        const userData = await ownResult.value.json();
        setCanRate(true);
        if (userData?.review) {
          setRating(Number(userData.review.rating) || 0);
          setComment(String(userData.review.comment || ""));
          setHasPriorReview(true);
        }
      } else if (ownResult.status === "fulfilled" && ownResult.value.status === 401) {
        setCanRate(false);
      } else {
        setCanRate(false);
        setError("We couldn't verify your account. Please sign in again or try later.");
      }
    } catch (err) {
      if (signal?.aborted) return;
      setError(err?.message || "Unable to load orientation feedback.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadFeedback(controller.signal);
    if (window.location.hash === "#orientation-feedback") {
      // Direct links from email must land on the rating section in a React SPA.
      window.requestAnimationFrame(() =>
        document.getElementById("orientation-feedback")?.scrollIntoView({ behavior: "auto", block: "start" })
      );
    }
    return () => controller.abort();
  }, [loadFeedback]);

  async function submitRating(event) {
    event.preventDefault();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || saving) return;
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const options = authOptions();
      const response = await fetch(API, {
        ...options,
        method: "POST",
        headers: { ...options.headers, "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim().slice(0, 1000) }),
      });
      if (response.status === 401) {
        setCanRate(false);
        throw new Error("Your session has expired. Sign in again to submit your rating.");
      }
      if (!response.ok) throw new Error("Your rating couldn't be saved. Please try again.");
      const result = await response.json();
      setHasPriorReview(true);
      setSuccess("Thank you. Your feedback has been saved successfully.");
      if (result?.summary) setSummary(result.summary);
    } catch (err) {
      setError(err?.message || "Unable to save your feedback.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="orientation-feedback" className="scroll-mt-24 bg-[#f5f3ff] py-20 sm:py-24" aria-labelledby="orientation-feedback-title">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid gap-8 overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-[0_20px_70px_-45px_rgba(76,29,149,.4)] lg:grid-cols-[.9fr_1.1fr]">
          <div className="bg-[#251542] p-7 text-white sm:p-10 lg:p-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-violet-100">
              <MessageSquareText size={16} /> Orientation feedback
            </span>
            <h2 id="orientation-feedback-title" className="mt-7 text-3xl font-black tracking-tight sm:text-4xl">
              How was your Splunk orientation?
            </h2>
            <p className="mt-5 text-sm leading-7 text-violet-100/85 sm:text-base">
              If you attended our October 31 orientation, we'd value your honest rating. Your feedback helps us improve the learning experience for future students.
            </p>
            <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Community rating</p>
              {summary?.count > 0 ? (
                <>
                  <p className="mt-2 flex items-center gap-2 text-3xl font-black"><Star className="fill-amber-400 text-amber-400" size={26} /> {Number(summary.average).toFixed(1)} <span className="text-base font-medium text-violet-100">/ 5</span></p>
                  <p className="mt-2 text-xs text-violet-200">Based on {summary.count} student rating{summary.count === 1 ? "" : "s"}</p>
                </>
              ) : (
                <p className="mt-3 text-sm text-violet-100">{loading ? "Loading ratings…" : "No ratings yet. Be the first to share feedback."}</p>
              )}
            </div>
            <p className="mt-6 flex items-start gap-2 text-xs leading-6 text-violet-200">
              <ShieldCheck className="mt-0.5 shrink-0" size={16} /> Ratings are recorded against verified student accounts, and your written feedback is not published on this page.
            </p>
          </div>

          <div className="p-7 sm:p-10 lg:p-12">
            <p className="text-xs font-black uppercase tracking-[.2em] text-violet-700">Share your experience</p>
            <h3 className="mt-3 text-2xl font-black text-slate-950">Rate the orientation</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">Choose 1–5 stars. A written comment is optional. You can update your rating later.</p>
            {loading ? (
              <p role="status" className="mt-7 text-sm text-slate-500">Checking account access…</p>
            ) : canRate ? (
              <form className="mt-6 space-y-5" onSubmit={submitRating}>
                <RatingStars selected={rating} onChoose={setRating} disabled={saving} />
                <label htmlFor="orientation-rating-comment" className="block text-sm font-bold text-slate-800">Your feedback (optional)</label>
                <textarea
                  id="orientation-rating-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  disabled={saving}
                  placeholder="What worked well? What could we improve?"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200 disabled:opacity-50"
                />
                <button type="submit" disabled={saving || !rating} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50">
                  {saving ? "Saving…" : hasPriorReview ? "Update my rating" : "Submit my rating"} <CheckCircle2 size={17} />
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
                <p className="text-sm font-bold text-violet-950">Sign in to leave a rating</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Ratings are available to people with verified T.O Analytics accounts. If you attended, please sign in using your account.</p>
                <Link to="/login" className="mt-5 inline-flex rounded-xl bg-violet-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-violet-800">Sign in to rate <span className="ml-2">→</span></Link>
              </div>
            )}
            {success && <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{success}</p>}
            {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">{error}</p>}
            <p className="mt-5 text-xs leading-6 text-slate-500">Please share your own experience. Ratings are optional and do not affect course enrollment or access.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
