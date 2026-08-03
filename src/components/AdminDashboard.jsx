import { Link } from "react-router-dom";

import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarAlt,
  FaDatabase,
  FaLink,
  FaUsers,
} from "react-icons/fa";

import StudentTable from "./StudentTable";
import FetchAllStudents from "../hooks/FetchAllStudents";

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
}) => {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs font-medium text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { data, isLoading } = FetchAllStudents();

  const students = Array.isArray(data?.data?.response)
    ? data.data.response
    : [];

  // Replace this with your real courses API when available.
  const totalCourses = 8;

  const currentDate = new Date();

  const studentsThisMonth = students.filter((student) => {
    if (!student?.date) return false;

    const studentDate = new Date(student.date);

    if (Number.isNaN(studentDate.getTime())) return false;

    return (
      studentDate.getMonth() === currentDate.getMonth() &&
      studentDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  const totalProviders = new Set(
    students.map((student) => student?.provider).filter(Boolean)
  ).size;

  const studentCount = isLoading ? "—" : students.length;
  const monthlyCount = isLoading ? "—" : studentsThisMonth;
  const providerCount = isLoading ? "—" : totalProviders;

  const quickActions = [
    {
      title: "Manage courses",
      description: "Review published and draft courses.",
      path: "/ADMIN-DASHBOARD/viewcourses",
      icon: FaBookOpen,
    },
    {
      title: "View students",
      description: "Open the complete student directory.",
      path: "/ADMIN-DASHBOARD/allStudents",
      icon: FaUsers,
    },
    {
      title: "Send learning link",
      description: "Share online classes and useful resources.",
      path: "/ADMIN-DASHBOARD/send-links",
      icon: FaLink,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-24 right-36 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-200">
              Administration center
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Welcome back, Vera.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Monitor students, organize courses, review test results and manage
              learning activities from one workspace.
            </p>
          </div>

          <Link
            to="/ADMIN-DASHBOARD/viewcourses"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            Manage courses
            <FaArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total students"
          value={studentCount}
          description="Registered student accounts"
          icon={FaUsers}
          iconClassName="bg-indigo-50 text-indigo-600"
        />

        <StatCard
          title="Total courses"
          value={totalCourses}
          description="Courses currently available"
          icon={FaBookOpen}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="New this month"
          value={monthlyCount}
          description="Students registered this month"
          icon={FaCalendarAlt}
          iconClassName="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Login providers"
          value={providerCount}
          description="Unique account providers"
          icon={FaDatabase}
          iconClassName="bg-purple-50 text-purple-600"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Recent students */}
        <div className="min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Registered students
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recently registered student accounts.
              </p>
            </div>

            <Link
              to="/ADMIN-DASHBOARD/allStudents"
              className="hidden items-center gap-2 text-sm font-bold text-indigo-600 transition hover:text-indigo-800 sm:flex"
            >
              View all
              <FaArrowRight size={12} />
            </Link>
          </div>

          <div className="p-4 sm:p-6">
            <StudentTable pageSize={6} showSearch={false} />
          </div>
        </div>

        {/* Quick actions */}
        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Quick actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Common administrative tasks.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/60"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-indigo-100 group-hover:text-indigo-600">
                    <Icon size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      {action.title}
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      {action.description}
                    </p>
                  </div>

                  <FaArrowRight
                    size={12}
                    className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600"
                  />
                </Link>
              );
            })}
          </div>
        </aside>
      </section>
    </div>
  );
};

export default AdminDashboard;
// import { FaUserCheck } from "react-icons/fa6";
// import { BsTruck } from "react-icons/bs";
// import StudentTable from "./StudentTable";
// import FetchAllStudents from "../hooks/FetchAllStudents";

// const AdminDashboard = () => {
//     const {data} = FetchAllStudents()
//     console.log(data)
//     return (
//         <>
//             <div className="">
//                 <div className="md:p-5 p-2">
//                     <div className="flex flex-wrap md:justify-start items-center gap-2">
//                         <div className="flex items-center gap-2 md:gap-5 md:p-3 p-1 bg-grayBG rounded-md">
//                             <div className="">
//                                 <FaUserCheck size={30} />
//                             </div>
//                             <div className="text-center">
//                                 <p className="text-xs md:text-base">Total User</p>
//                                 <p className="font-bold">{data?.data?.response.length || "00"}</p>
//                             </div>
//                         </div>
//                         <div className="flex items-center gap-2 md:gap-5 md:p-3 p-1 bg-grayBG rounded-md">
//                             <div className="">
//                                 <BsTruck size={30} />
//                             </div>
//                             <div className="text-center">
//                                 <p className="text-xs md:text-base">Total Course</p>
//                                 <p className="font-bold">8</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className="my-5 md:my-0 px-2 md:px-5 md:flex items-start md:gap-6">
//                 <div className="flex-1 md:p-5 md:min-h-[275px] bg-grayBG rounded-md mb-5 md:mb-0">
//                     <h1 className="font-bold text-base md:text-xl md:mb-5 p-2">Registered Students</h1>
//                     <StudentTable />
//                 </div>
//             </div>
//         </>

//     )
// }

// export default AdminDashboard