import { useEffect, useMemo, useState } from "react";

import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";

import Loader from "./Loader";
import ServerErrorPage from "./ServerErrorPage";
import FetchAllStudents from "../hooks/FetchAllStudents";

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getInitials = (name) => {
  if (!name) return "ST";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const StudentTable = ({
  pageSize = 10,
  showSearch = true,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading, error } = FetchAllStudents();

  const students = Array.isArray(data?.data?.response)
    ? data.data.response
    : [];

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return students;
    }

    return students.filter((student) => {
      const searchableText = [
        student?.name,
        student?.email,
        student?.provider,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [searchValue, students]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / pageSize)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const firstStudentIndex = (currentPage - 1) * pageSize;
  const lastStudentIndex = firstStudentIndex + pageSize;

  const paginatedStudents = filteredStudents.slice(
    firstStudentIndex,
    lastStudentIndex
  );

  const visiblePageNumbers = useMemo(() => {
    const maximumVisiblePages = 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maximumVisiblePages / 2)
    );

    let endPage = Math.min(
      totalPages,
      startPage + maximumVisiblePages - 1
    );

    if (endPage - startPage + 1 < maximumVisiblePages) {
      startPage = Math.max(
        1,
        endPage - maximumVisiblePages + 1
      );
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
    );
  }, [currentPage, totalPages]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-bold text-red-700">
          Unable to load students
        </p>

        <p className="mt-1 text-sm text-red-500">
          {error.message || "Please try again later."}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <Loader />;
  }

  if (data?.status === 500) {
    return <ServerErrorPage />;
  }

  return (
    <div>
      {showSearch && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <FaSearch
              size={14}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search student, email or provider"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <p className="text-sm font-semibold text-slate-500">
            {filteredStudents.length}{" "}
            {filteredStudents.length === 1 ? "student" : "students"}
          </p>
        </div>
      )}

      {paginatedStudents.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white font-black text-indigo-600 shadow-sm">
            0
          </div>

          <h3 className="mt-4 font-black text-slate-900">
            No students found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or wait for new registrations.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
            <table className="min-w-[760px] w-full border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                    Student
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                    Email
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                    Provider
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                    Registration date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedStudents.map((student, index) => {
                  const studentKey =
                    student?.id ||
                    student?._id ||
                    `${student?.email}-${student?.date}-${index}`;

                  return (
                    <tr
                      key={studentKey}
                      className="transition hover:bg-indigo-50/40"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-black text-indigo-700">
                            {getInitials(student?.name)}
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {student?.name || "Unnamed student"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Student account
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm font-medium text-slate-600">
                        {student?.email || "Not available"}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">
                          {student?.provider || "Unknown"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm font-medium text-slate-500">
                        {formatDate(student?.date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile student cards */}
          <div className="space-y-3 md:hidden">
            {paginatedStudents.map((student, index) => {
              const studentKey =
                student?.id ||
                student?._id ||
                `${student?.email}-${student?.date}-${index}`;

              return (
                <article
                  key={studentKey}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-black text-indigo-700">
                      {getInitials(student?.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-slate-900">
                        {student?.name || "Unnamed student"}
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {student?.email || "No email address"}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold capitalize text-emerald-700">
                      {student?.provider || "Unknown"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <span className="font-semibold text-slate-400">
                      Registered
                    </span>

                    <span className="font-bold text-slate-700">
                      {formatDate(student?.date)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {filteredStudents.length > 0 && (
        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm font-semibold text-slate-500 sm:text-left">
            Showing {firstStudentIndex + 1}–
            {Math.min(lastStudentIndex, filteredStudents.length)} of{" "}
            {filteredStudents.length}
          </p>

          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setCurrentPage((previousPage) =>
                  Math.max(1, previousPage - 1)
                )
              }
              disabled={currentPage === 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronLeft size={12} />
            </button>

            {visiblePageNumbers.map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={[
                  "flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-bold transition",
                  currentPage === pageNumber
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600",
                ].join(" ")}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((previousPage) =>
                  Math.min(totalPages, previousPage + 1)
                )
              }
              disabled={currentPage === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;

// import Loader from "./Loader"
// import { useState } from 'react';
// import FetchAllStudents from '../hooks/FetchAllStudents';
// import { Splide, SplideSlide } from '@splidejs/react-splide';
// import ServerErrorPage from "./ServerErrorPage";
// import { IoEyeSharp } from "react-icons/io5";
// import { FaTrash } from "react-icons/fa"
// import '@splidejs/react-splide/css';
// import moment from "moment";

// const StudentTable = () => {
//     const [currentPage, setCurrentPage] = useState(1)
//     const [postsPerPage] = useState(10)
//     const { data, isLoading, error } = FetchAllStudents()

//     if (error) return <p className='text-center text-red-500 md:text-3xl font-black'>{error.message}</p>
//     if (isLoading) return <Loader />
//     if (data?.status === 500) return <ServerErrorPage />

//     const lastPostIndex = currentPage * postsPerPage
//     const firstPostIndex = lastPostIndex - postsPerPage
//     const paginatedData = data?.data?.response?.slice(firstPostIndex, lastPostIndex)
//     const length = data?.data?.response?.length || 1

//     const pageNumber = []
//     for (let i = 1; i <= Math.ceil((length) / postsPerPage); i++) {
//         pageNumber.push(i)
//     }

//     return (
//         <div className="">
//             <table className='dashboard table-auto w-full'>
//                 <thead className=''>
//                     <tr className='font-black text-left'>
//                         <th className='text-sm md:text-base tracking-wide p-1 md:p-2'>Registration Date</th>
//                         <th className='text-sm md:text-base tracking-wide p-1 md:p-2'>Student Name</th>
//                         <th className='text-sm md:text-base tracking-wide p-1 md:p-2 hidden md:block'>Email Address</th>
//                         <th className='text-sm md:text-base tracking-wide p-1 md:p-2'>Provider</th>
//                     </tr>
//                 </thead>
//                 <tbody className='tbody'>
//                     {paginatedData?.map((info, index) => (
//                         <tr key={index} className=''>
//                             <td data-cell="Registration Date" className='text-[13px] leading-7 md:text-sm font-medium  p-1 md:p-2'>   {moment(info.date)
//                                 .utc()
//                                 .format("YYYY-MM-DD")}</td>
//                             <td data-cell="Student Name" className='text-[13px] leading-7 md:text-sm font-medium  p-1 md:p-2'>{info.name}</td>
//                             <td data-cell="Email Address" className='text-[13px] leading-7 md:text-sm font-medium  p-1 hidden md:block md:p-2'>{info.email}</td>

//                             <td data-cell="Provider" className='text-[13px] leading-7 md:text-sm font-medium  p-1 md:p-2'>{info.provider}</td>
                            
//                             {/* <td className='text-[13px] leading-7 md:text-sm font-medium  p-1 md:p-2'><IoEyeSharp size={20} /></td>
//                             <td className='text-[13px] leading-7 md:text-sm font-medium  p-1 md:p-2'><FaTrash size={20} /></td> */}
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//             <div>
//                 {!data && <h3 className="font-bold text-center md:text-3xl">No Data Available.</h3>}
//             </div>
//             <div className='relative text-sm text-center my-2 md:my-4 font-bold tracking-wider group'>
//                 {pageNumber.length > 0 && <p>{currentPage} 0f {pageNumber.length} {pageNumber.length > 1 ? "pages" : "page" }</p>}
//                 <div className="my-2 md:my-5">
//                     <Splide options={{
//                         drag: "free",
//                         pagination: false,
//                         perPage: 5,
//                         perMove: 3,
//                         gap: "20px",
//                         focus : 'center',
//                         trimSpace: false,
//                         arrows: pageNumber.length > 1 ? true : false,
//                         breakpoints: {
//                             768: {
//                               perPage: 4,
//                               perMove: 2,
//                               gap: "10px",
//                               focus: "none",
//                               trimSpace: pageNumber.length > 1 && true,
//                             },
//                         }
//                     }} className="">
//                         {pageNumber.map((num) => (
//                             <SplideSlide key={num}><button onClick={() => setCurrentPage(num)} key={num} className={`${currentPage === num && "bg-BLUE text-white px-3 py-2 rounded-md"} px-3 py-2 text-sm md:text-base font-bold`}>{num}</button></SplideSlide>
//                         ))}
//                     </Splide>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default StudentTable

