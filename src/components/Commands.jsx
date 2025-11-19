import { useState, useEffect } from "react";
import DashboardDropdown from "./Dropdown";

const Commands = () => {
  const [assignment, setAssignment] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    // Example assignment data
    const data = {
      title: "Splunk Commands",
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
        //   title: "Splunk ",
          url: "https://drive.google.com/file/d/1jAkmrbTWQApPg7qg43bBfAe4bEg8o0VT/preview",
        //   dueDate: "2025-11-8",
         
        },
        //   {
        //   id: 5,
        //   title: "Splunk class 3 Assignment",
        //   url: " https://drive.google.com/file/d/179_DKTqGoGjBrszOPRCJqGu3VFlXUbXe/preview",
        //   dueDate: "2025-11-10",
        // },
      ],
     

    };

    setAssignment(data);
    setSelectedDoc(data.docs[0]);
  }, []);

  if (!assignment) return <p>Loading assignment...</p>;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
    <DashboardDropdown/>

      <h1 className="text-2xl font-bold text-gray-800">📝 Assignment</h1>

      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {assignment.title}
        </h2>
        <p className="text-gray-700 mb-3">{assignment.description}</p>

        {/* === MULTIPLE PDF BUTTONS === */}
        <div className="flex flex-wrap gap-3 mb-4">
          {assignment.docs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedDoc?.id === doc.id
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {doc.title}
            </button>
          ))}
        </div>

        {/* === PDF VIEWER === */}
        <div className="w-full h-[600px] rounded-xl overflow-hidden border">
          {selectedDoc && (
            <iframe
              src={selectedDoc.url}
              title={selectedDoc.title}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          )}
        </div>

        {/* === DETAILS BELOW VIEWER === */}
        {selectedDoc && (
          <div className="mt-3 text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-semibold">Document:</span>{" "}
              {selectedDoc.title}
            </p>
            <p>
              <span className="font-semibold">Due Date:</span>{" "}
              {selectedDoc.dueDate}
            </p>
            <p>
              <span className="font-semibold">Open in new tab:</span>{" "}
              <a
                href={selectedDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-words"
              >
                {selectedDoc.url}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Commands



