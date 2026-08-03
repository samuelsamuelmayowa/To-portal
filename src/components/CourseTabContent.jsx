import { useOutletContext } from "react-router-dom";
import { FaBookOpen, FaFileAlt, FaSearch } from "react-icons/fa";

const statusInformation = {
  all: {
    title: "All courses",
    description: "Every course will appear in this section.",
    emptyTitle: "No courses available",
    emptyDescription:
      "Upload your first course to begin building the learning catalogue.",
    icon: FaBookOpen,
  },
  published: {
    title: "Published courses",
    description: "Courses currently visible to students.",
    emptyTitle: "No published courses",
    emptyDescription:
      "Publish a draft course and it will appear in this section.",
    icon: FaBookOpen,
  },
  draft: {
    title: "Draft courses",
    description: "Unpublished courses currently being prepared.",
    emptyTitle: "No draft courses",
    emptyDescription:
      "New unpublished courses will remain here until they are published.",
    icon: FaFileAlt,
  },
};

const CourseTabContent = ({ status = "all" }) => {
  const outletContext = useOutletContext() || {};
  const courseSearch = outletContext.courseSearch || "";

  const information = statusInformation[status] || statusInformation.all;
  const Icon = information.icon;

  /*
    Replace this empty section with your real course cards after connecting
    the course API.

    You can filter the course array using courseSearch from Outlet context.
  */

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">
            {information.title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {information.description}
          </p>
        </div>

        {courseSearch && (
          <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600">
            <FaSearch size={11} />
            Searching for “{courseSearch}”
          </div>
        )}
      </div>

      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
          <Icon size={25} />
        </div>

        <h3 className="mt-5 text-lg font-black text-slate-900">
          {information.emptyTitle}
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          {information.emptyDescription}
        </p>
      </div>
    </div>
  );
};

export default CourseTabContent;