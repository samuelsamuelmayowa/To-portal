import { useState, useEffect } from "react";
import DashboardDropdown from "./Dropdown";

const ClassM = () => {
  const [assignment, setAssignment] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const e = localStorage.getItem("user") || "";
    setUserEmail(e);
  });
  useEffect(() => {
    // Example assignment data
    const data = {
      title: "Splunk Assignment",
      description:
        "Read all the documents below carefully and complete the required tasks.",
      docs: [
        // {
        //   id: 1,
        //   title: "Assignment Instructions",
        //   url: "https://drive.google.com/file/d/1bf5cRkcEC3yDJ5MnzpRKDpRLhRhdUH90/preview",
        //   dueDate: "2025-11-08",
        // },
        // {
        //   id: 2,
        //   title: "Sample Log Files",
        //   url: "https://drive.google.com/file/d/1swg7fD7Q6DEO_E8PQZTIiPCrNtikWlSK/preview",
        //   dueDate: "2025-11-09",
        // },
        // {
        //   id: 3,
        //   title: "Submission Template",
        //   url: "https://drive.google.com/file/d/1zExampleTemplate123/preview",
        //   dueDate: "2025-11-10",
        // },
        {
          id: 4,
          title: "Splunk class 4 Assignment",
          url: "https://docs.google.com/presentation/d/1QH0-bN_phVwY5MGVPOcOnbAC9HmKuShL/preview",
          dueDate: "2025-11-8",
        },
        {
          id: 5,
          title: "Splunk class 3 Assignment",
          url: " https://drive.google.com/file/d/179_DKTqGoGjBrszOPRCJqGu3VFlXUbXe/preview",
          dueDate: "2025-11-10",
        },
      ],
    };

    setAssignment(data);
    setSelectedDoc(data.docs[0]);
  }, []);

  if (!assignment) return <p>Loading assignment...</p>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 space-y-6">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              To-Analytics Learning Portal
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Professional Splunk Bootcamp Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {userEmail}
            </div>

            {/* Remove if not imported */}
            {DashboardDropdown && <DashboardDropdown />}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-1 rounded-lg text-sm 
            bg-gray-100 text-gray-800 
            dark:bg-gray-800 dark:text-white
            border border-gray-300 dark:border-gray-700
            hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </div>

      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Assignment
      </h1>

      {/* ASSIGNMENT CARD */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">
          {assignment?.title || "No Assignment Selected"}
        </h2>

        <p className="text-gray-700 dark:text-gray-400">
          {assignment?.description || "No description available"}
        </p>

        {/* DOCUMENT BUTTONS */}
        <div className="flex flex-wrap gap-3 pt-2">
          {assignment?.docs?.length ? (
            assignment.docs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                  selectedDoc?.id === doc.id
                    ? "bg-gray-800 text-white dark:bg-white dark:text-black"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {doc.title}
              </button>
            ))
          ) : (
            <p className="text-gray-500">No documents available.</p>
          )}
        </div>

        {/* DOCUMENT VIEWER */}
        <div className="w-full h-[550px] mt-4 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
          {selectedDoc ? (
            <iframe
              src={selectedDoc.url}
              title={selectedDoc.title}
              className="w-full h-full bg-white dark:bg-gray-950"
              frameBorder="0"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a document to preview
            </div>
          )}
        </div>

        {/* DOCUMENT DETAILS */}
        {selectedDoc && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              <strong>Document:</strong> {selectedDoc.title}
            </p>

            <p>
              <strong>Due Date:</strong> {selectedDoc.dueDate}
            </p>

            <p>
              <strong>Open in new tab:</strong>{" "}
              <a
                href={selectedDoc.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 underline break-words"
              >
                {selectedDoc.url}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // return (
  //   <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
  //   {/* <DashboardDropdown/> */}
  //    <div className="max-w-7xl mx-auto mb-6">
  //           <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow flex items-center justify-between">
  //             {/* LEFT SIDE - TITLE */}
  //             <div>
  //               <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
  //                 To-Analytics Learning Portal
  //               </h1>
  //               <p className="text-sm text-gray-500 dark:text-gray-400">
  //                 Professional Splunk Bootcamp Dashboard
  //               </p>
  //             </div>

  //             {/* RIGHT SIDE - ACTIONS */}
  //             <div className="flex items-center gap-4">
  //               {/* User Email */}
  //               <div className="text-sm text-gray-600 dark:text-gray-300">
  //                 {userEmail}
  //               </div>

  //               {/* Profile Button */}
  //               {/* <button
  //                 onClick={() => setProfileOpen(true)}
  //                 className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
  //               >
  //                 My Profile
  //               </button> */}

  //   <DashboardDropdown/>
  //               {/* Dark Mode Toggle */}
  //               <button
  //                 onClick={() => setDarkMode(!darkMode)}
  //                 className="px-3 py-1 rounded text-sm
  //           bg-gray-200 text-gray-800
  //           dark:bg-gray-800 dark:text-white
  //           hover:opacity-90 transition"
  //               >
  //                 {darkMode ? "Light Mode" : "Dark Mode"}
  //               </button>
  //             </div>
  //           </div>
  //         </div>

  //     <h1 className="text-2xl font-bold text-gray-800">📝 Assignment</h1>

  //     <div className="bg-white shadow-md rounded-2xl p-6">
  //       <h2 className="text-xl font-semibold text-gray-800 mb-2">
  //         {assignment.title}
  //       </h2>
  //       <p className="text-gray-700 mb-3">{assignment.description}</p>

  //       {/* === MULTIPLE PDF BUTTONS === */}
  //       <div className="flex flex-wrap gap-3 mb-4">
  //         {assignment.docs.map((doc) => (
  //           <button
  //             key={doc.id}
  //             onClick={() => setSelectedDoc(doc)}
  //             className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
  //               selectedDoc?.id === doc.id
  //                 ? "bg-blue-600 text-white shadow"
  //                 : "bg-gray-100 hover:bg-gray-200"
  //             }`}
  //           >
  //             {doc.title}
  //           </button>
  //         ))}
  //       </div>

  //       {/* === PDF VIEWER === */}
  //       <div className="w-full h-[600px] rounded-xl overflow-hidden border">
  //         {selectedDoc && (
  //           <iframe
  //             src={selectedDoc.url}
  //             title={selectedDoc.title}
  //             className="w-full h-full"
  //             frameBorder="0"
  //             allowFullScreen
  //           ></iframe>
  //         )}
  //       </div>

  //       {/* === DETAILS BELOW VIEWER === */}
  //       {selectedDoc && (
  //         <div className="mt-3 text-sm text-gray-600 space-y-1">
  //           <p>
  //             <span className="font-semibold">Document:</span>{" "}
  //             {selectedDoc.title}
  //           </p>
  //           <p>
  //             <span className="font-semibold">Due Date:</span>{" "}
  //             {selectedDoc.dueDate}
  //           </p>
  //           <p>
  //             <span className="font-semibold">Open in new tab:</span>{" "}
  //             <a
  //               href={selectedDoc.url}
  //               target="_blank"
  //               rel="noopener noreferrer"
  //               className="text-blue-600 underline break-words"
  //             >
  //               {selectedDoc.url}
  //             </a>
  //           </p>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
};

export default ClassM;

// import { useEffect, useState } from "react";
// import { NavLink } from "react-router-dom";

// const ClassM = () => {
//   const allowedEmails = [
//     "samuelsamuelmayowa@gmail.com",
//     "adenusitimi@gmail.com",
//     "oluwaferanmiolulana@gmail.com",
//     "oluwaferanmi.olulana@gmail.com",
//     "tomideolulana@gmail.com",
//     "lybertyudochuu@gmail.com",
//     "yinkalola51@gmail.com",
//     "randommayowa@gmail.com",
//     "toanalyticsllc@gmail.com",
//     "kevwe_oberiko@yahoo.com",
//     "denisgsam@gmail.com",
//     "fpasamuelmayowa51@gmail.com",
//     "oluwatiroyeamoye@gmail.com",
//     "trbanjo@gmail.com",
//     "emanfrimpong@gmail.com",
//     "dipeoluolatunji@gmail.com",
//   ];

//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userEmail, setUserEmail] = useState("");
//   const [isAllowed, setIsAllowed] = useState(false);

//   useEffect(() => {
//     const email = localStorage.getItem("user");
//     setUserEmail(email);

//     if (email) {
//       const normalized = email.toLowerCase();
//       const allowed = allowedEmails.map((e) => e.toLowerCase());
//       setIsAllowed(allowed.includes(normalized));
//     }
//   }, []);

//   useEffect(() => {
//     if (isAllowed) {
//       fetch("https://to-backendapi-v1.vercel.app/api/all/assignment")
//         .then((res) => res.json())
//         .then((data) => {
//           if (data?.data) {
//             const sorted = [...data.data].sort(
//               (a, b) =>
//                 new Date(b.createdAt || b.date) -
//                 new Date(a.createdAt || a.date)
//             );
//             setAssignments(sorted);
//           }
//           setLoading(false);
//         })
//         .catch((err) => {
//           console.error("Error fetching assignments:", err);
//           setLoading(false);
//         });
//     } else {
//       setLoading(false);
//     }
//   }, [isAllowed]);

//   if (loading)
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-50">
//         <div className="text-lg font-medium text-gray-700 animate-pulse">
//           Loading assignments...
//         </div>
//       </div>
//     );

//   if (!isAllowed)
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center">
//         <h1 className="text-3xl font-bold text-red-600 mb-3">
//           Access Denied 🚫
//         </h1>
//         <p className="text-gray-700 text-lg">
//           Only authorized To-Analytics members can view this page.
//         </p>
//         {userEmail ? (
//           <p className="mt-4 text-sm text-gray-500">
//             Your email: <span className="font-medium">{userEmail}</span>
//           </p>
//         ) : (
//           <p className="mt-4 text-sm text-gray-500">
//             Please log in to access the content.
//           </p>
//         )}
//       </div>
//     );

//   // Sort and Split
//   const sortedAssignments = [...assignments].sort(
//     (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
//   );
//   const recentAssignments = sortedAssignments.slice(0, 2);
//   const pastAssignments = sortedAssignments.slice(2);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-6">
//       <div className="max-w-6xl mx-auto space-y-20">
//         {/* HEADER */}
//         <div className="text-center space-y-3">
//           <h2 className="text-4xl font-extrabold text-gray-800">
//             📚 Class Assignments
//           </h2>
//           <p className="text-gray-600 text-lg">
//             View your latest and previous assignments from To-Analytics
//             instructors.
//           </p>
//         </div>

//         {/* NAVIGATION */}
//         <div className="flex justify-center flex-wrap gap-6 text-base font-medium">
//           <NavLink
//             to="/dashboard"
//             className={({ isActive }) =>
//               `transition ${
//                 isActive
//                   ? "text-blue-900 border-b-2 border-blue-800 pb-1"
//                   : "text-blue-600 hover:text-blue-800"
//               }`
//             }
//           >
//             {/* Dashboard */}
//           </NavLink>
//           <NavLink
//             to="/class"
//             className={({ isActive }) =>
//               `transition ${
//                 isActive
//                   ? "text-blue-900 border-b-2 border-blue-800 pb-1"
//                   : "text-blue-600 hover:text-blue-800"
//               }`
//             }
//           >
//             {/* Classes */}
//           </NavLink>
//           <NavLink
//             to="/assignments"
//             className={({ isActive }) =>
//               `transition ${
//                 isActive
//                   ? "text-blue-900 border-b-2 border-blue-800 pb-1"
//                   : "text-blue-600 hover:text-blue-800"
//               }`
//             }
//           >
//             {/* Assignments */}
//           </NavLink>
//         </div>

//         {/* 📝 RECENT ASSIGNMENTS */}
//         <section className="space-y-10">
//           <div>
//             <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-8">
//               📝 Recent Assignments
//               <span className="text-sm font-normal text-gray-500">(latest 2)</span>
//             </h3>
//             {recentAssignments.length === 0 ? (
//               <p className="text-gray-500 italic">No recent assignments found.</p>
//             ) : (
//               <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-10">
//                 {recentAssignments.map((assignment) => (
//                   <div
//                     key={assignment._id}
//                     className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
//                   >
//                     {assignment.imageurl && (
//                       <img
//                         src={assignment.imageurl}
//                         alt="Assignment"
//                         className="w-full h-56 object-cover"
//                       />
//                     )}
//                     <div className="p-8 space-y-5">
//                       <h4 className="font-semibold text-2xl text-gray-800">
//                         {assignment.name || "TO Instructor"}
//                       </h4>
//                       <p className="text-sm text-gray-500">
//                         📅 {new Date(assignment.date).toLocaleString()}
//                       </p>
//                       <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
//                         {assignment.message || assignment.description}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </section>

//         {/* 📘 PAST ASSIGNMENTS */}
//         <section className="space-y-10">
//           <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
//             📘 Past Assignments
//           </h3>
//           {pastAssignments.length === 0 ? (
//             <p className="text-gray-500 italic">No past assignments found.</p>
//           ) : (
//             <div className="space-y-10">
//               {pastAssignments.map((assignment) => (
//                 <div
//                   key={assignment._id}
//                   className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-10 space-y-6"
//                 >
//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3">
//                     <h4 className="font-semibold text-2xl text-gray-800">
//                       {assignment.name || "TO Instructor"}
//                     </h4>
//                     <p className="text-sm text-gray-500">
//                       📅 {new Date(assignment.date).toLocaleString()}
//                     </p>
//                   </div>
//                   <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
//                     {assignment.message || assignment.description}
//                   </p>
//                   {assignment.imageurl && (
//                     <div className="pt-3">
//                       <img
//                         src={assignment.imageurl}
//                         alt="Assignment"
//                         className="w-full rounded-lg object-cover shadow-sm"
//                       />
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// };

// export default ClassM;

// import { useEffect, useState } from "react";
// import Quiz from "./Quiz";
// import { NavLink } from "react-router-dom";

// const ClassM = () => {
//   const api = import.meta.env.VITE_HOME_OO;
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedQuiz, setSelectedQuiz] = useState("");
//   const [quizData, setQuizData] = useState(null);

//   useEffect(() => {
//     fetch("https://to-backendapi-v1.vercel.app/api/assignment")
//       .then((res) => res.json())
//       .then((data) => {
//         setAssignments(data.data || []);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching assignments:", err);
//         setLoading(false);
//       });
//   }, []);

//   const loadQuiz = async (quizName) => {
//     setSelectedQuiz(quizName);
//     try {
//       const res = await fetch(`${api}/api/quiz/${quizName}`);
//       const data = await res.json();
//       setQuizData(data);
//     } catch (err) {
//       console.error("Error loading quiz:", err);
//     }
//   };

//   if (loading)
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-50">
//         <div className="text-lg font-medium text-gray-700 animate-pulse">
//           Loading assignments...
//         </div>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4">
//       <div className="max-w-5xl mx-auto">
//         {/* Page Title */}
//         <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
//           📚 Class Assignments & Quizzes
//         </h2>

//         {/* Quiz Selector */}
//         <div className="bg-white shadow-md rounded-2xl p-6 mb-8">
//           <label className="block text-lg font-semibold text-gray-700 mb-3">
//             Select a Quiz:
//           </label>
//           <select
//             value={selectedQuiz}
//             onChange={(e) => loadQuiz(e.target.value)}
//             className="p-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
//           >
//             <option value="">-- Choose a Quiz --</option>
//             <option value="Splunk 1 Quiz">Splunk Quiz 1</option>
//             <option value="Splunk 2 Quiz">Splunk Quiz 2</option>
//             <option value="splunk3">Splunk Quiz 3</option>
//           </select>
//         </div>

//         {/* Quiz Section */}
//         {quizData && (
//           <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
//             <Quiz data={quizData} />
//           </div>
//         )}

//         {/* Assignments Section */}
//         <div className="mt-10">
//           <h3 className="text-2xl font-bold text-gray-800 mb-6">
//             📝 Recent Assignments
//           </h3>

//           <ul className="space-y-6">
//             {assignments.map((assignment) => (
//               <li
//                 key={assignment._id}
//                 className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
//               >
//                 <h4 className="font-semibold text-xl text-gray-800 mb-2">
//                   {assignment.name || "TO INSTRUCTOR"}
//                 </h4>
//                 <p className="text-gray-700 font-medium mb-3">
//                   {assignment.message || assignment.description}
//                 </p>

//                 {assignment.imageurl && (
//                   <img
//                     src={assignment.imageurl}
//                     alt="Assignment"
//                     className="mt-3 w-full max-h-80 object-cover rounded-lg shadow-sm"
//                   />
//                 )}

//                 <p className="text-sm text-gray-500 mt-4">
//                   📅 {new Date(assignment.date).toLocaleString()}
//                 </p>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClassM;

// // export default ClassM;

// // import { useEffect, useState } from "react";

// // const ClassM = () => {
// //   const [files, setFiles] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     fetch("https://to-backendapi-v1.vercel.app/api/files") // 🔹 Your backend API
// //       .then((res) => res.json())
// //       .then((data) => {
// //         setFiles(data);
// //         setLoading(false);
// //       })
// //       .catch((err) => {
// //         console.error("Error fetching files:", err);
// //         setLoading(false);
// //       });
// //   }, []);

// //   if (loading) {
// //     return <p className="p-6 text-center">Loading files...</p>;
// //   }

// //   return (
// //     <>
// //       <div className="p-6">
// //         <h2 className="text-xl font-bold mb-4">Available Files</h2>

// //         {files.length === 0 ? (
// //           <p>No files uploaded yet.</p>
// //         ) : (
// //           <ul className="space-y-4">
// //             {files.map((file) => (
// //               <li key={file._id} className="border p-4 rounded-lg shadow">
// //                 <h3 className="font-semibold">{file.title}</h3>

// //                 {/* View PDF directly */}
// //                 {file.fileType === "pdf" && (
// //                   <iframe
// //                     src={`https://to-backendapi-v1.vercel.app${file.fileUrl}`}
// //                     width="100%"
// //                     height="400"
// //                     title={file.title}
// //                   ></iframe>
// //                 )}

// //                 {/* View PPT via Google Docs Viewer */}
// //                 {file.fileType === "ppt" || file.fileType === "pptx" ? (
// //                   <iframe
// //                     src={`https://docs.google.com/viewer?url=https://to-backendapi-v1.vercel.app${file.fileUrl}&embedded=true`}
// //                     width="100%"
// //                     height="400"
// //                     title={file.title}
// //                   ></iframe>
// //                 ) : null}

// //                 {/* Download Link */}
// //                 <a
// //                   href={`https://to-backendapi-v1.vercel.app${file.fileUrl}`}
// //                   target="_blank"
// //                   rel="noopener noreferrer"
// //                   className="text-blue-600 hover:underline block mt-2"
// //                 >
// //                 Please Download your Material
// //                 </a>
// //               </li>
// //             ))}
// //           </ul>
// //         )}
// //       </div>
// //     </>
// //   );
// // };
