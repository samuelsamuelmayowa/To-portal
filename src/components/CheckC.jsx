import { useEffect, useState } from "react";
import ClassCalendar from "./Days";
import DashboardDropdown from "./Dropdown";



export default function StudentDashboard() {
   const allowedEmails = [
    "basseyvera018@gmail.com",
    "codeverseprogramming23@gmail.com",
    "ooolajuyigbe@gmail.com",
    "fadeleolutola@gmail.com",
    "jahdek76@gmail.com",
    "samuelsamuelmayowa@gmail.com",
    "oluwaferanmiolulana@gmail.com",
    "adenusitimi@gmail.com",
    "Adenusi.timi@gmail.com",
    "tomideolulana@gmail.com",
    "yinkalola51@gmail.com",
    "toanalyticsllc@gmail.com",
    "kevwe_oberiko@yahoo.com",
    "lybertyudochuu@gmail.com",
    "denisgsam@gmail.com",
    "oluwaferanmi.olulana@gmail.com",
    "fpasamuelmayowa51@gmail.com",
    "oluwatiroyeamoye@gmail.com",
    "trbanjo@gmail.com",
    "emanfrimpong@gmail.com",
    "oluwaferanmiolulana@gmail.com",
    "randommayowa@gmail.com",
    "dipeoluolatunji@gmail.com",
    "lybertyudochuu@gmail.com",
  ];
   const [isAllowed, setIsAllowed] = useState(false);
   const [userEmail, setUserEmail] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    useEffect(() => {
     document.documentElement.classList.toggle("dark", darkMode);
   }, [darkMode]);
    useEffect(() => {
       const email = localStorage.getItem("user");
       setUserEmail(email);
   
       if (email) {
         const normalized = email.toLowerCase();
         const allowed = allowedEmails.map((e) => e.toLowerCase());
         setIsAllowed(allowed.includes(normalized));
       }
     }, []);
  return (
    <div className="p-6">
          {/* <DashboardDropdown/> */}
            <div className="max-w-7xl mx-auto mb-10 px-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow flex items-center justify-between">
          
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Quiz Results
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      View all your past test performances
                    </p>
                  </div>
          
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {userEmail}
                    </div>
          
                    <DashboardDropdown />
          
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
          <br/>
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Class Schedule
      </h1>
      <ClassCalendar />
    </div>
  );
}