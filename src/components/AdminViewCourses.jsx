import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { FaBookOpen, FaPlus, FaSearch } from "react-icons/fa";

const courseTabs = [
  {
    name: "All Courses",
    path: "/ADMIN-DASHBOARD/viewcourses",
    end: true,
  },
  {
    name: "Published",
    path: "/ADMIN-DASHBOARD/viewcourses/published",
  },
  {
    name: "Drafts",
    path: "/ADMIN-DASHBOARD/viewcourses/draft",
  },
];

const AdminViewCourses = () => {
  const [courseSearch, setCourseSearch] = useState("");

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FaBookOpen size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              Course management
            </h1>

            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
              Create, organize and manage all published and unpublished
              learning content.
            </p>
          </div>
        </div>

        {/* Keep /gg if it is your current upload page.
            Change this route when you create a proper upload-course route. */}
        {/* <NavLink
          to="/gg"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
        >
          <FaPlus size={13} />
          Upload course
        </NavLink> */}
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="overflow-x-auto">
              <nav className="flex min-w-max gap-1 rounded-xl bg-slate-100 p-1">
                {courseTabs.map((tab) => (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    end={tab.end}
                    className={({ isActive }) =>
                      [
                        "rounded-lg px-4 py-2.5 text-sm font-bold transition",
                        isActive
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900",
                      ].join(" ")
                    }
                  >
                    {tab.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <FaSearch
                size={14}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={courseSearch}
                onChange={(event) => setCourseSearch(event.target.value)}
                placeholder="Search course name"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <Outlet context={{ courseSearch }} />
        </div>
      </section>
    </div>
  );
};

export default AdminViewCourses;
