import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaLock } from "react-icons/fa6";
import { useStateContext } from "../context/ContextProvider";
import { cookieAuthApi } from "../lib/cookieAuth";

export default function CourseAccessGate({ courseId, children }) {
  const { token, authLoading } = useStateContext();
  const [access, setAccess] = useState({ loading: true, allowed: false });

  useEffect(() => {
    if (authLoading) return undefined;
    if (!token) {
      setAccess({ loading: false, allowed: false });
      return undefined;
    }
    let active = true;
    cookieAuthApi.post("/api/check-student-access", { courseId })
      .then(({ data }) => {
        if (active) setAccess({ loading: false, allowed: data?.allowed === true });
      })
      .catch(() => {
        if (active) setAccess({ loading: false, allowed: false });
      });
    return () => { active = false; };
  }, [authLoading, courseId, token]);

  if (authLoading || access.loading) {
    return <main className="flex min-h-[55vh] items-center justify-center bg-slate-50" aria-busy="true"><span className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" /></main>;
  }
  if (!access.allowed) {
    return (
      <main className="flex min-h-[55vh] items-center justify-center bg-slate-50 px-4 py-12">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><FaLock /></div>
          <h1 className="mt-5 text-2xl font-black text-slate-950">Course access not assigned</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Your administrator controls access to this course. Ask them to assign it to your account.</p>
          <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"><FaBookOpen /> Back to My Courses</Link>
        </section>
      </main>
    );
  }
  return children;
}
