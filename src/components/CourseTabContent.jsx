import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import {
  FaBookOpen,
  FaLayerGroup,
  FaListCheck,
} from "react-icons/fa6";

import courses from "../../src/coursesAPI/api"
// "../coursesAPI/api";
// Example only. Change "../data/courses" to your actual course file path.

const tabInformation = {
  all: {
    title: "All Courses",
    description: "View and manage every course on the platform.",
    icon: FaLayerGroup,
  },

  published: {
    title: "Published Courses",
    description: "Courses currently available to students.",
    icon: FaBookOpen,
  },

  draft: {
    title: "Draft Courses",
    description: "Courses that have not been published yet.",
    icon: FaListCheck,
  },
};

const formatPrice = (price) => {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "Not set";
  }

  return numericPrice.toLocaleString();
};

const CourseTabContent = ({ status = "all" }) => {
  const { courseSearch = "" } = useOutletContext() || {};

  const currentTab = tabInformation[status] || tabInformation.all;
  const TabIcon = currentTab.icon;

  const filteredCourses = useMemo(() => {
    const searchText = courseSearch.trim().toLowerCase();

    return courses.filter((course) => {
      /*
       * Your current courses do not have a status property.
       * Existing courses are therefore treated as published.
       */
      const courseStatus = (
        course.status || "published"
      ).toLowerCase();

      const matchesTab =
        status === "all" || courseStatus === status;

      const matchesSearch =
        !searchText ||
        [
          course.courseName,
          course.intro,
          course.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchText);

      return matchesTab && matchesSearch;
    });
  }, [courseSearch, status]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <TabIcon size={18} />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-950">
              {currentTab.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {currentTab.description}
            </p>
          </div>
        </div>

        <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
          {filteredCourses.length}{" "}
          {filteredCourses.length === 1 ? "course" : "courses"}
        </span>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <TabIcon size={25} />
          </div>

          <h3 className="mt-5 text-lg font-black text-slate-900">
            No courses found
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            {courseSearch
              ? `No course matches “${courseSearch}”. Try another search.`
              : status === "draft"
                ? "You currently have no draft courses."
                : "No courses are available in this section."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredCourses.map((course) => {
            const courseStatus = (
              course.status || "published"
            ).toLowerCase();

            const topicsCount = Array.isArray(course.whatToLearn)
              ? course.whatToLearn.length
              : 0;

            return (
              <article
                key={course.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={course.image}
                    alt={course.courseName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  <span
                    className={[
                      "absolute right-3 top-3 rounded-full px-3 py-1.5 text-[11px] font-black capitalize backdrop-blur-md",
                      courseStatus === "published"
                        ? "bg-emerald-500/90 text-white"
                        : "bg-amber-400/90 text-amber-950",
                    ].join(" ")}
                  >
                    {courseStatus}
                  </span>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                      Online course
                    </p>

                    <h3 className="mt-1 text-xl font-black text-white">
                      {course.courseName}
                    </h3>
                  </div>
                </div>

                <div className="p-5">
                  <p className="font-bold text-slate-900">
                    {course.intro}
                  </p>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                    {course.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        Topics
                      </p>

                      <p className="mt-1 text-sm font-black text-slate-800">
                        {topicsCount} learning topics
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-400">
                        Price
                      </p>

                      <p className="mt-1 text-lg font-black text-indigo-600">
                        {formatPrice(course.price)}
                      </p>
                    </div>
                  </div>

                  {Array.isArray(course.whatToLearn) &&
                    course.whatToLearn.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
                          Course content
                        </p>

                        <ul className="space-y-2">
                          {course.whatToLearn
                            .slice(0, 3)
                            .map((topic, index) => (
                              <li
                                key={`${course.id}-${index}`}
                                className="flex items-start gap-2 text-sm text-slate-600"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

                                <span className="line-clamp-1">
                                  {topic}
                                </span>
                              </li>
                            ))}
                        </ul>

                        {course.whatToLearn.length > 3 && (
                          <p className="mt-3 text-xs font-bold text-indigo-600">
                            +{course.whatToLearn.length - 3} more topics
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseTabContent;
// import { useOutletContext } from "react-router-dom";
// import { FaBookOpen, FaFileAlt, FaSearch } from "react-icons/fa";

// const statusInformation = {
//   all: {
//     title: "All courses",
//     description: "Every course will appear in this section.",
//     emptyTitle: "No courses available",
//     emptyDescription:
//       "Upload your first course to begin building the learning catalogue.",
//     icon: FaBookOpen,
//   },
//   published: {
//     title: "Published courses",
//     description: "Courses currently visible to students.",
//     emptyTitle: "No published courses",
//     emptyDescription:
//       "Publish a draft course and it will appear in this section.",
//     icon: FaBookOpen,
//   },
//   draft: {
//     title: "Draft courses",
//     description: "Unpublished courses currently being prepared.",
//     emptyTitle: "No draft courses",
//     emptyDescription:
//       "New unpublished courses will remain here until they are published.",
//     icon: FaFileAlt,
//   },
// };

// const CourseTabContent = ({ status = "all" }) => {
//   const outletContext = useOutletContext() || {};
//   const courseSearch = outletContext.courseSearch || "";

//   const information = statusInformation[status] || statusInformation.all;
//   const Icon = information.icon;

//   /*
//     Replace this empty section with your real course cards after connecting
//     the course API.

//     You can filter the course array using courseSearch from Outlet context.
//   */

//   return (
//     <div>
//       <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h2 className="text-lg font-black text-slate-950">
//             {information.title}
//           </h2>

//           <p className="mt-1 text-sm text-slate-500">
//             {information.description}
//           </p>
//         </div>

//         {courseSearch && (
//           <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600">
//             <FaSearch size={11} />
//             Searching for “{courseSearch}”
//           </div>
//         )}
//       </div>

//       <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
//         <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
//           <Icon size={25} />
//         </div>

//         <h3 className="mt-5 text-lg font-black text-slate-900">
//           {information.emptyTitle}
//         </h3>

//         <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
//           {information.emptyDescription}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default CourseTabContent;