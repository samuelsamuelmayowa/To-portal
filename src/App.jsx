import React from "react";
import "./lib/mobileProgressBridge";
import { CartItemProvider } from "./context/CartItemContext";
import ErrorPage from "./components/errorPage";
const LazyHomePage = React.lazy(() => import("./pages/HomePage"));
const LazyCourses = React.lazy(() => import("./pages/Courses"));
const LazyAbout = React.lazy(() => import("./pages/AboutPage"));
const LazyCareer = React.lazy(() => import("./pages/CareerPageFAEK.jsx"));
const LazyNextxCareer = React.lazy(() => import("./pages/NextxCareerPage"));
const LazyCOURSE = React.lazy(() => import("./pages/COURSE"));
const LazyBlogPage = React.lazy(() => import("./pages/BlogPage"));
const LazySplunkOrientation = React.lazy(
  () => import("./pages/SplunkOrientation"),
);
// import LoginForm from "./pages/LoginForm";
// import AdminLoginForm from "./pages/AdminLoginForm";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import RouteSeo from "./components/RouteSeo";

import HomeLayout from "./layoutAuth/HomeLayout";
const LazyAuthLayout = React.lazy(() => import("./layoutAuth/AuthLayout"));
import Loader from "./components/Loader";
import { AnimatePresence } from "framer-motion";
// Heavy interactive tools load only when their route is opened.
import Commands from "./components/Commands";
import CourseAccessGate from "./components/CourseAccessGate";

const LazyPaperTrading = React.lazy(() => import("./pages/PaperTrading"));
const LazyAllCourses = React.lazy(() => import("./components/AllCourses"));
const LazyMobileEntry = React.lazy(() => import("./pages/MobileEntry"));
const LazyContactPage = React.lazy(() => import("./pages/ContactPage"));
const LazyConnectWithContractor = React.lazy(() => import("./pages/ConnectWithContractor"));
const LazyMyCourses = React.lazy(() => import("./pages/MyCourses"));
const LazyMentorship = React.lazy(() => import("./pages/Mentorship"));
const LazyLiveCourses = React.lazy(() => import("./pages/LiveCourses"));
const LazyCreateAccountForm = React.lazy(() => import("./pages/CreateAccountForm"));
const LazyOTPVerification = React.lazy(() => import("./pages/OTP_Verification"));
const LazyForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const LazyCreateNewPassword = React.lazy(() => import("./pages/CreateNewPassword"));
const LazyConfirmNewPassword = React.lazy(() => import("./pages/ConfirmNewPassword"));
const LazyMyLogin = React.lazy(() => import("./pages/mylogin"));
const LazyAdminLoginForm = React.lazy(() => import("./pages/AdminLoginForm"));
const LazyCheckOut = React.lazy(() => import("./pages/CheckOut"));
const LazySendLinks = React.lazy(() => import("./components/SendLinks"));
const LazySendMessages = React.lazy(() => import("./components/SendMessages"));
const LazyAdminLayout = React.lazy(() => import("./layoutAuth/AdminLayout"));
const LazyDashboard = React.lazy(() => import("./dashboard/components/Dashboard"));
const LazyAdminDashboard = React.lazy(() => import("./components/AdminDashboard"));
const LazyAdminViewCourses = React.lazy(() => import("./components/AdminViewCourses"));
const LazyAllStudents = React.lazy(() => import("./components/AllStudents"));
const LazyContacts = React.lazy(() => import("./components/Contacts"));
const LazyContractors = React.lazy(() => import("./components/Contractors"));
const LazyStudentCommentPage = React.lazy(() => import("./components/StudentCommentPage"));
const LazyMyProfile = React.lazy(() => import("./pages/MyProfile"));
const LazyPaymentPage = React.lazy(() => import("./pages/PaymentPage"));
const LazyQuizResults = React.lazy(() => import("./components/QuizResults"));
const LazyMainQuiz = React.lazy(() => import("./components/MainQuiz"));
const LazyStockDashboard = React.lazy(() => import("./components/StockPage"));
const LazyLinks = React.lazy(() => import("./components/Links"));
const LazySendPdf = React.lazy(() => import("./components/SendPdf"));
const LazyClassM = React.lazy(() => import("./components/ClassM"));
const LazySession = React.lazy(() => import("./components/Session"));
const LazyMaterials = React.lazy(() => import("./components/Materials"));
const LazyResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const LazySeeQuiz = React.lazy(() => import("./components/SeeQuiz"));
const LazyCancel = React.lazy(() => import("./pages/Cancel"));
const LazyStudentDashboard = React.lazy(() => import("./components/CheckC"));
const LazyStockPortal = React.lazy(() => import("./components/StockPortal"));
const LazyApage = React.lazy(() => import("./components/AAAA.jsx"));
const LazySplunkDictionary = React.lazy(() => import("./components/Dictionary"));
const LazySplunkCareerRoadmap = React.lazy(() => import("./components/SplunkCareerRoadmap"));
const LazyMarketOverview = React.lazy(() => import("./components/MarketOverview"));
const LazySplunkPracticeLab = React.lazy(() => import("./pages/SplunkPracticeLab"));
const LazySplunkStudio = React.lazy(() => import("./pages/SplunkStudio"));
const LazyQuotePage = React.lazy(() => import("./components/QuotePage"));
const LazyMarketOverviewAdvanced = React.lazy(() => import("./components/MarketOverviewAdvanced"));
const LazyHomeSkill = React.lazy(() => import("./pages/HomeSkill"));
const LazySkillLabWorkplace = React.lazy(() => import("./pages/skillab/Workplace"));
const LazyLabView = React.lazy(() => import("./pages/skillab/LabView"));
const LazyProfile = React.lazy(() => import("./pages/skillab/Profile"));
const LazyTSkillLabLogin = React.lazy(() => import("./pages/skillab/TSkillLabLogin"));
const LazyChatComponent = React.lazy(() => import("./components/ChatComponent"));
const LazyCourseTabContent = React.lazy(() => import("./components/CourseTabContent"));
const LazyStudentAccess = React.lazy(() => import("./components/StudentAccess"));
const LazyAdminExpenses = React.lazy(() => import("./components/AdminExpenses"));
const LazySplunkLab = React.lazy(() => import("./pages/SplunkLab"));
const LazyStockQuiz = React.lazy(() => import("./components/StockQuiz.jsx"));

function lazyPage(Page, props = {}) {
  return (
    <React.Suspense fallback={<Loader />}>
      <Page {...props} />
    </React.Suspense>
  );
}
// 🟣 GLOBAL THEME HELPER
function applySavedTheme() {
  const saved = localStorage.getItem("theme") || "light";
  document.documentElement.classList.toggle("dark", saved === "dark");
}

applySavedTheme();

// 🟣 ROUTES
function AppRouteLayout() {
  return (
    <>
      <Outlet />
      <RouteSeo />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <AppRouteLayout />,
    children: [
      { path: "/mobile-entry", element: lazyPage(LazyMobileEntry) },
      {
        path: "/",
        element: <HomeLayout />,
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: (
              <React.Suspense fallback={<Loader />}>
                <LazyHomePage />
              </React.Suspense>
            ),
          },
          {
            path: "/cancel",
            element: lazyPage(LazyCancel),
          },

          {
            path: "/chat",
            element: lazyPage(LazyChatComponent),
          },

          {
            path: "stockmarkert",
            element: <CourseAccessGate courseId="stock-options">{lazyPage(LazyMarketOverviewAdvanced)}</CourseAccessGate>,
          },
          {
            path: "ad",
            element: <CourseAccessGate courseId="stock-options">{lazyPage(LazyMarketOverviewAdvanced)}</CourseAccessGate>,
          },
          {
            path: "/quote",
            element: lazyPage(LazyQuotePage),
          },
          {
            path: "/trading-simulator",
            element: (
              <React.Suspense fallback={<Loader />}>
                <LazyPaperTrading />
              </React.Suspense>
            ),
          },

          {
            path: "/courses",
            element: (
              <React.Suspense fallback={<Loader />}>
                <LazyCourses />
              </React.Suspense>
            ),

            children: [
              {
                index: true,
                element: lazyPage(LazyAllCourses),
              },
              {
                path: ":course",
                element: (
                  <React.Suspense fallback={<Loader />}>
                    <LazyCOURSE />
                  </React.Suspense>
                ),
              },
            ],
          },

          {
            path: "/splunk-orientation",
            element: (
              <React.Suspense fallback={<Loader />}>
                <LazySplunkOrientation />
              </React.Suspense>
            ),
          },
          {
            path: "/about",
            element: (
              <React.Suspense fallback={<Loader />}>
                <LazyAbout />
              </React.Suspense>
            ),
          },

          {
            path: "/toskillab",
            element: lazyPage(LazyHomeSkill),
          },

          {
            path: "/toskillab/workplace",
            element: lazyPage(LazySkillLabWorkplace),
          },
          {
            path: "/toskillab/lab",
            element: lazyPage(LazySplunkLab),
          },

          {
            path: "/mylab",
            element: lazyPage(LazySplunkPracticeLab),
          },

          {
            path: "/sessions",
            element: lazyPage(LazySession),
          },

          {
            path: "/career",
            element: (
              <React.Suspense fallback={<Loader />}>
                <LazyCareer />
              </React.Suspense>
            ),
          },
          {
            path: "/carrerpage",
            element: (
              <React.Suspense fallback={<Loader />}>
                <LazyNextxCareer />
              </React.Suspense>
            ),
          },
          {
            path: "/blog",
            element: (
              <React.Suspense fallback={<Loader />}>
                <LazyBlogPage />
              </React.Suspense>
            ),
          },

          {
            path: "/contact",
            element: lazyPage(LazyContactPage),
          },
          {
            path: "/checkout",
            element: lazyPage(LazyCheckOut),
          },
          {
            path: "/mentorship",
            element: (
              <React.Suspense fallback={<Loader />}>
                <LazyMentorship />
              </React.Suspense>
            ),
          },
          {
            path: "/liveCourses",
            element: lazyPage(LazyLiveCourses),
          },
          { path: "/commands", element: <CourseAccessGate courseId="splunk"><Commands /></CourseAccessGate> },
          { path: "/dictionary", element: <CourseAccessGate courseId="splunk">{lazyPage(LazySplunkDictionary)}</CourseAccessGate> },
          {
            path: "/result",
            element: lazyPage(LazyQuizResults),
          },
          {
            path: "/quiz",
            element: lazyPage(LazyMainQuiz),
          },
          {
            path: "/myProfile",
            element: lazyPage(LazyMyProfile),
          },
        ],
      },

      {
        path: "/admininfo",
        element: lazyPage(LazyAdminLoginForm),
      },

      {
        path: "/createAccount",
        element: lazyPage(LazyCreateAccountForm),
      },
      {
        path: "/login",
        element: lazyPage(LazyMyLogin),
      },
      {
        path: "/aaaa",
        element: lazyPage(LazyApage),
      },

      {
        path: "/toskillab",
        element: lazyPage(LazyHomeSkill),
      },

      {
        path: "/labview",
        element: lazyPage(LazyLabView),
      },

      {
        path: "/profile",
        element: lazyPage(LazyProfile),
      },

      {
        path: "/loginskill",
        element: lazyPage(LazyTSkillLabLogin),
      },

      {
        path: "/forgotPassword",
        element: lazyPage(LazyForgotPassword),
      },

      {
        path: "/reset-password/:token", // there was //
        element: lazyPage(LazyResetPassword),
      },
      {
        path: "/OTP",
        element: lazyPage(LazyOTPVerification),
      },

      {
        path: "/lab",
        element: lazyPage(LazySplunkStudio),
      },
      { path: "/splunk-studio", element: <CourseAccessGate courseId="splunk">{lazyPage(LazySplunkStudio)}</CourseAccessGate> },
      {
        path: "/createNewPassword",
        element: lazyPage(LazyCreateNewPassword),
      },
      {
        path: "/confirmNewPassword",
        element: lazyPage(LazyConfirmNewPassword),
      },
      {
        path: "/partner",
        element: lazyPage(LazyConnectWithContractor),
      },

      // DASHBOARD
      {
        path: "/dashboard",
        element: (
          <React.Suspense fallback={<Loader />}>
            <LazyAuthLayout />
          </React.Suspense>
        ),
        children: [
          { index: true, element: lazyPage(LazyMyCourses) },
          { path: "checkout", element: lazyPage(LazyCheckOut) },
          { path: "quiz", element: lazyPage(LazyMainQuiz) },
          { path: "dictionary", element: <CourseAccessGate courseId="splunk">{lazyPage(LazySplunkDictionary)}</CourseAccessGate> },
          { path: "classmaterials", element: <CourseAccessGate courseId="splunk">{lazyPage(LazyClassM)}</CourseAccessGate> },
          { path: "myCourses", element: lazyPage(LazyMyCourses) },
          { path: "mentorship", element: lazyPage(LazyMentorship) },
          { path: "comment", element: lazyPage(LazyStudentCommentPage) },
          { path: "links", element: lazyPage(LazyLinks) },
          { path: "commands", element: <CourseAccessGate courseId="splunk"><Commands /></CourseAccessGate> },
          { path: "materials", element: lazyPage(LazyMaterials) },
          { path: "stockside", element: <CourseAccessGate courseId="stock-options">{lazyPage(LazyStockDashboard)}</CourseAccessGate> },
          { path: "result", element: lazyPage(LazyQuizResults) },
          { path: "stockportal", element: lazyPage(LazyStockPortal) },
          {
            path: "stock-quiz",
            element: lazyPage(LazyStockQuiz),
          },

          {
            path: "stockmarkert",
            element: <CourseAccessGate courseId="stock-options">{lazyPage(LazyMarketOverviewAdvanced)}</CourseAccessGate>,
          },
          {
            path: "stock",
            // Temporarily hide the Massive Stock Dashboard page.
            element: null,
          },
          {
            path: "map",
            element: <CourseAccessGate courseId="splunk">{lazyPage(LazySplunkCareerRoadmap)}</CourseAccessGate>,
          },
          { path: "takequiz", element: lazyPage(LazyMainQuiz) },
          { path: "check", element: lazyPage(LazyStudentDashboard) },
          { path: "makePayment", element: lazyPage(LazyPaymentPage) },
          { path: "overview", element: <CourseAccessGate courseId="stock-options">{lazyPage(LazyMarketOverview)}</CourseAccessGate> },
          { path: "splunk-studio", element: <CourseAccessGate courseId="splunk">{lazyPage(LazySplunkStudio)}</CourseAccessGate> },
          { path: "lab", element: <CourseAccessGate courseId="splunk">{lazyPage(LazySplunkStudio)}</CourseAccessGate> },

          { path: "/dashboard/post", element: lazyPage(LazyDashboard) },
        ],
      },

      // ADMIN DASHBOARD
      {
        path: "/ADMIN-DASHBOARD",
        element: lazyPage(LazyAdminLayout),
        children: [
          {
            index: true,
            element: lazyPage(LazyAdminDashboard),
          },

          {
            path: "viewcourses",
            element: lazyPage(LazyAdminViewCourses),
            children: [
              {
                index: true,
                element: lazyPage(LazyCourseTabContent, { status: "all" }),
              },
              {
                path: "published",
                element: lazyPage(LazyCourseTabContent, { status: "published" }),
              },
              {
                path: "draft",
                element: lazyPage(LazyCourseTabContent, { status: "draft" }),
              },
            ],
          },

          {
            path: "allStudents",
            element: lazyPage(LazyAllStudents),
          },

          {
            path: "expenses",
            element: lazyPage(LazyAdminExpenses),
          },

          {
            path: "student-access",
            element: lazyPage(LazyStudentAccess),
          },

          {
            path: "contacts",
            element: lazyPage(LazyContacts),
          },
          {
            path: "studentresults",
            element: lazyPage(LazySeeQuiz),
          },
          {
            path: "contractors",
            element: lazyPage(LazyContractors),
          },
          {
            path: "send-links",
            element: lazyPage(LazySendLinks),
          },
          {
            path: "send-pdf",
            element: lazyPage(LazySendPdf),
          },
          {
            path: "send-messages",
            element: lazyPage(LazySendMessages),
          },
        ],
      },
    ],
  },
]);

// 🟪 FINAL APP WITH GLOBAL DARK WRAPPER
function App() {
  return (
    <CartItemProvider>
      <div className="">
        <AnimatePresence>
          <RouterProvider router={router} />
        </AnimatePresence>
      </div>
    </CartItemProvider>
  );
}

export default App;


// import React from "react";
// import MobileEntry from "./pages/MobileEntry";
// import "./lib/mobileProgressBridge";
// import { CartItemProvider } from "./context/CartItemContext";
// import ErrorPage from "./components/errorPage";
// import AllCourses from "./components/AllCourses";
// const LazyHomePage = React.lazy(() => import("./pages/HomePage"));
// const LazyCourses = React.lazy(() => import("./pages/Courses"));
// const LazyAbout = React.lazy(() => import("./pages/AboutPage"));
// const LazyCareer = React.lazy(() => import("./pages/CareerPageFAEK.jsx"));
// const LazyNextxCareer = React.lazy(() => import("./pages/NextxCareerPage"));
// const LazyCOURSE = React.lazy(() => import("./pages/COURSE"));
// const LazyBlogPage = React.lazy(() => import("./pages/BlogPage"));
// const LazySplunkOrientation = React.lazy(
//   () => import("./pages/SplunkOrientation"),
// );
// import ContactPage from "./pages/ContactPage";
// import ConnectWithContractor from "./pages/ConnectWithContractor";
// import MyCourses from "./pages/MyCourses";
// import Mentorship from "./pages/Mentorship";
// const LazyMentorship = React.lazy(() => import("./pages/Mentorship"));
// import LiveCourses from "./pages/LiveCourses";
// import CreateAccountForm from "./pages/CreateAccountForm";
// import OTP_Verification from "./pages/OTP_Verification";
// import ForgotPassword from "./pages/ForgotPassword";
// import CreateNewPassword from "./pages/CreateNewPassword";
// import ConfirmNewPassword from "./pages/ConfirmNewPassword";
// // import LoginForm from "./pages/LoginForm";
// // import AdminLoginForm from "./pages/AdminLoginForm";
// import MyLogin from "./pages/mylogin";
// import AdminLoginForm from "./pages/AdminLoginForm";
// import CheckOut from "./pages/CheckOut";
// import SendLinks from "./components/SendLinks";
// import SendMessages from "./components/SendMessages";
// import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
// import RouteSeo from "./components/RouteSeo";

// import HomeLayout from "./layoutAuth/HomeLayout";
// import AdminLayout from "./layoutAuth/AdminLayout";
// const LazyAuthLayout = React.lazy(() => import("./layoutAuth/AuthLayout"));
// import Dashboard from "./dashboard/components/Dashboard";
// import AdminDashboard from "./components/AdminDashboard";
// import AdminViewCourses from "./components/AdminViewCourses";
// import AllStudents from "./components/AllStudents";
// import Contacts from "./components/Contacts";
// import Contractors from "./components/Contractors";
// import StudentCommentPage from "./components/StudentCommentPage";
// import MyProfile from "./pages/MyProfile";
// import PaymentPage from "./pages/PaymentPage";
// import Loader from "./components/Loader";
// import Links from "./components/Links";
// import { AnimatePresence } from "framer-motion";
// import SendPdf from "./components/SendPdf";
// import ClassM from "./components/ClassM";
// import Session from "./components/Session";
// import Materials from "./components/Materials";
// import ResetPassword from "./pages/ResetPassword";
// import SplunkQuiz from "./components/Quiz";
// import QuizResults from "./components/QuizResults";
// import MainQuiz from "./components/MainQuiz";
// import SeeQuiz from "./components/SeeQuiz";
// import Cancel from "./pages/Cancel";
// import StudentDashboard from "./components/CheckC";
// import StockDashboard from "./components/StockPage";
// import StockPortal from "./components/StockPortal";
// import Apage from "./components/AAAA.jsx";
// import Commands from "./components/Commands";
// import SplunkDictionary from "./components/Dictionary";
// import StockCard from "./StockPublic";
// import MassiveStockDashboard from "./StockPublic";
// import SplunkCareerRoadmap from "./components/SplunkCareerRoadmap";
// import MarketOverview from "./components/MarketOverview";
// import SplunkPracticeLab from "./pages/SplunkPracticeLab";
// import SplunkStudio from "./pages/SplunkStudio";
// import QuotePage from "./components/QuotePage";
// import MarketOverviewAdvanced from "./components/MarketOverviewAdvanced";
// import Home from "./pages/HomeSkill";
// import LabView from "./pages/skillab/LabView";
// import Profile from "./pages/skillab/Profile";
// // import TSkillLabLogin from "./pages/skillab/TSkillLabLogin";
// import TSkillLabLogin from "./pages/skillab/TSkillLabLogin";
// import ChatComponent from "./components/ChatComponent";
// import CourseTabContent from "./components/CourseTabContent";
// import AdminExpenses from "./components/AdminExpenses";
// import SplunkLab from "./pages/SplunkLab";
// import StockQuiz from "./components/StockQuiz.jsx";

// const LazyPaperTrading = React.lazy(() => import("./pages/PaperTrading"));
// // 🟣 GLOBAL THEME HELPER
// function applySavedTheme() {
//   const saved = localStorage.getItem("theme") || "light";
//   document.documentElement.classList.toggle("dark", saved === "dark");
// }

// applySavedTheme();

// // 🟣 ROUTES
// function AppRouteLayout() {
//   return (
//     <>
//       <Outlet />
//       <RouteSeo />
//     </>
//   );
// }

// const router = createBrowserRouter([
//   {
//     element: <AppRouteLayout />,
//     children: [
//       { path: "/mobile-entry", element: <MobileEntry /> },
//       {
//         path: "/",
//         element: <HomeLayout />,
//         errorElement: <ErrorPage />,
//         children: [
//           {
//             index: true,
//             element: (
//               <React.Suspense fallback={<Loader />}>
//                 <LazyHomePage />
//               </React.Suspense>
//             ),
//           },
//           {
//             path: "/cancel",
//             element: <Cancel />,
//           },

//           {
//             path: "/chat",
//             element: <ChatComponent />,
//           },

//           {
//             path: "stockmarkert",
//             element: <MarketOverviewAdvanced />,
//           },
//           {
//             path: "ad",
//             element: <MarketOverviewAdvanced />,
//           },
//           {
//             path: "/quote",
//             element: <QuotePage />,
//           },
//           {
//             path: "/trading-simulator",
//             element: (
//               <React.Suspense fallback={<Loader />}>
//                 <LazyPaperTrading />
//               </React.Suspense>
//             ),
//           },

//           {
//             path: "/courses",
//             element: (
//               <React.Suspense fallback={<Loader />}>
//                 <LazyCourses />
//               </React.Suspense>
//             ),

//             children: [
//               {
//                 index: true,
//                 element: <AllCourses />,
//               },
//               {
//                 path: ":course",
//                 element: (
//                   <React.Suspense fallback={<Loader />}>
//                     <LazyCOURSE />
//                   </React.Suspense>
//                 ),
//               },
//             ],
//           },

//           {
//             path: "/splunk-orientation",
//             element: (
//               <React.Suspense fallback={<Loader />}>
//                 <LazySplunkOrientation />
//               </React.Suspense>
//             ),
//           },
//           {
//             path: "/about",
//             element: (
//               <React.Suspense fallback={<Loader />}>
//                 <LazyAbout />
//               </React.Suspense>
//             ),
//           },

//           {
//             path: "/toskillab",
//             element: <Home />,
//           },

//           {
//             path: "/toskillab/lab",
//             element: <SplunkLab />,
//           },

//           {
//             path: "/mylab",
//             element: (
//               <React.Suspense fallback={<Loader />}>
//                 <SplunkPracticeLab />
//               </React.Suspense>
//             ),
//           },

//           {
//             path: "/sessions",
//             element: <Session />,
//           },

//           {
//             path: "/career",
//             element: (
//               <React.Suspense fallback={<Loader />}>
//                 <LazyCareer />
//               </React.Suspense>
//             ),
//           },
//           {
//             path: "/carrerpage",
//             element: (
//               <React.Suspense fallback={<Loader />}>
//                 <LazyNextxCareer />
//               </React.Suspense>
//             ),
//           },
//           {
//             path: "/blog",
//             element: (
//               <React.Suspense fallback={<Loader />}>
//                 <LazyBlogPage />
//               </React.Suspense>
//             ),
//           },

//           {
//             path: "/contact",
//             element: <ContactPage />,
//           },
//           {
//             path: "/checkout",
//             element: <CheckOut />,
//           },
//           {
//             path: "/mentorship",
//             element: (
//               <React.Suspense fallback={<Loader />}>
//                 <LazyMentorship />
//               </React.Suspense>
//             ),
//           },
//           {
//             path: "/liveCourses",
//             element: <LiveCourses />,
//           },
//           { path: "/commands", element: <Commands /> },
//           { path: "/dictionary", element: <SplunkDictionary /> },
//           {
//             path: "/result",
//             element: <QuizResults />,
//           },
//           {
//             path: "/quiz",
//             element: <SplunkQuiz />,
//           },
//           {
//             path: "/myProfile",
//             element: <MyProfile />,
//           },
//         ],
//       },

//       {
//         path: "/admininfo",
//         element: <AdminLoginForm />,
//       },

//       {
//         path: "/createAccount",
//         element: <CreateAccountForm />,
//       },
//       {
//         path: "/login",
//         element: <MyLogin />,
//       },
//       {
//         path: "/aaaa",
//         element: <Apage />,
//       },

//       {
//         path: "/toskillab",
//         element: <Home />,
//       },

//       {
//         path: "/labview",
//         element: <LabView />,
//       },

//       {
//         path: "/profile",
//         element: <Profile />,
//       },

//       {
//         path: "/loginskill",
//         element: <TSkillLabLogin />,
//       },

//       {
//         path: "/forgotPassword",
//         element: <ForgotPassword />,
//       },

//       {
//         path: "/reset-password/:token", // there was //
//         element: <ResetPassword />,
//       },
//       {
//         path: "/OTP",
//         element: <OTP_Verification />,
//       },

//       {
//         path: "/lab",
//         element: <SplunkStudio />,
//       },
//       { path: "/splunk-studio", element: <SplunkStudio /> },
//       {
//         path: "/createNewPassword",
//         element: <CreateNewPassword />,
//       },
//       {
//         path: "/confirmNewPassword",
//         element: <ConfirmNewPassword />,
//       },
//       {
//         path: "/partner",
//         element: <ConnectWithContractor />,
//       },

//       // DASHBOARD
//       {
//         path: "/dashboard",
//         element: (
//           <React.Suspense fallback={<Loader />}>
//             <LazyAuthLayout />
//           </React.Suspense>
//         ),
//         children: [
//           { index: true, element: <MyCourses /> },
//           { path: "checkout", element: <CheckOut /> },
//           { path: "quiz", element: <SplunkQuiz /> },
//           { path: "dictionary", element: <SplunkDictionary /> },
//           { path: "classmaterials", element: <ClassM /> },
//           { path: "myCourses", element: <MyCourses /> },
//           { path: "mentorship", element: <Mentorship /> },
//           { path: "comment", element: <StudentCommentPage /> },
//           { path: "links", element: <Links /> },
//           { path: "commands", element: <Commands /> },
//           { path: "materials", element: <Materials /> },
//           { path: "stockside", element: <StockDashboard /> },
//           { path: "result", element: <QuizResults /> },
//           { path: "stockportal", element: <StockPortal /> },
//           {
//             path: "stock-quiz",
//             element: <StockQuiz />,
//           },

//           {
//             path: "stockmarkert",
//             element: <MarketOverviewAdvanced />,
//           },
//           {
//             path: "stock",
//             // Temporarily hide the Massive Stock Dashboard page.
//             element: null,
//           },
//           {
//             path: "map",
//             element: <SplunkCareerRoadmap />,
//           },
//           { path: "takequiz", element: <MainQuiz /> },
//           { path: "check", element: <StudentDashboard /> },
//           { path: "makePayment", element: <PaymentPage /> },
//           { path: "overview", element: <MarketOverview /> },
//           { path: "splunk-studio", element: <SplunkStudio /> },
//           { path: "lab", element: <SplunkStudio /> },

//           { path: "/dashboard/post", element: <Dashboard /> },
//         ],
//       },

//       // ADMIN DASHBOARD
//       {
//         path: "/ADMIN-DASHBOARD",
//         element: <AdminLayout />,
//         children: [
//           {
//             index: true,
//             element: <AdminDashboard />,
//           },

//           {
//             path: "viewcourses",
//             element: <AdminViewCourses />,
//             children: [
//               {
//                 index: true,
//                 element: <CourseTabContent status="all" />,
//               },
//               {
//                 path: "published",
//                 element: <CourseTabContent status="published" />,
//               },
//               {
//                 path: "draft",
//                 element: <CourseTabContent status="draft" />,
//               },
//             ],
//           },

//           {
//             path: "allStudents",
//             element: <AllStudents />,
//           },

//           {
//             path: "expenses",
//             element: <AdminExpenses />,
//           },

//           {
//             path: "contacts",
//             element: <Contacts />,
//           },
//           {
//             path: "studentresults",
//             element: <SeeQuiz />,
//           },
//           {
//             path: "contractors",
//             element: <Contractors />,
//           },
//           {
//             path: "send-links",
//             element: <SendLinks />,
//           },
//           {
//             path: "send-pdf",
//             element: <SendPdf />,
//           },
//           {
//             path: "send-messages",
//             element: <SendMessages />,
//           },
//         ],
//       },
//     ],
//   },
// ]);

// // 🟪 FINAL APP WITH GLOBAL DARK WRAPPER
// function App() {
//   return (
//     <CartItemProvider>
//       <div className="">
//         <AnimatePresence>
//           <RouterProvider router={router} />
//         </AnimatePresence>
//       </div>
//     </CartItemProvider>
//   );
// }

// export default App;
