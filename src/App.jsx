import React from "react";
import { CartItemProvider } from "./context/CartItemContext";
import ErrorPage from "./components/errorPage";
import AllCourses from "./components/AllCourses";
const LazyHomePage = React.lazy(() => import("./pages/HomePage"));
const LazyCourses = React.lazy(() => import("./pages/Courses"));
const LazyAbout = React.lazy(() => import("./pages/AboutPage"));
const LazyCareer = React.lazy(() => import("./pages/CareerPage"));
const LazyCOURSE = React.lazy(() => import("./pages/COURSE"));
const LazyBlogPage = React.lazy(() => import("./pages/BlogPage"));
import ContactPage from "./pages/ContactPage";
import ConnectWithContractor from "./pages/ConnectWithContractor";
import MyCourses from "./pages/MyCourses";
import Mentorship from "./pages/Mentorship";
const LazyMentorship = React.lazy(() => import("./pages/Mentorship"));
import LiveCourses from "./pages/LiveCourses";
import CreateAccountForm from "./pages/CreateAccountForm";
import OTP_Verification from "./pages/OTP_Verification";
import ForgotPassword from "./pages/ForgotPassword";
import CreateNewPassword from "./pages/CreateNewPassword";
import ConfirmNewPassword from "./pages/ConfirmNewPassword";
import LoginForm from "./pages/LoginForm";
import AdminLoginForm from "./pages/AdminLoginForm";
import CheckOut from "./pages/CheckOut";
import SendLinks from "./components/SendLinks";
import SendMessages from "./components/SendMessages";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import HomeLayout from "./layoutAuth/HomeLayout";
import AdminLayout from "./layoutAuth/AdminLayout";
const LazyAuthLayout = React.lazy(() => import("./layoutAuth/AuthLayout"));
import Dashboard from "./dashboard/components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import AdminViewCourses from "./components/AdminViewCourses";
import AllStudents from "./components/AllStudents";
import Contacts from "./components/Contacts";
import Contractors from "./components/Contractors";
import StudentCommentPage from "./components/StudentCommentPage";
import MyProfile from "./pages/MyProfile";
import PaymentPage from "./pages/PaymentPage";
import Loader from "./components/Loader";
import Links from "./components/Links";
import { AnimatePresence } from "framer-motion";
import SendPdf from "./components/SendPdf";
import ClassM from "./components/ClassM";
import Session from "./components/Session";
import Materials from "./components/Materials";
import ResetPassword from "./pages/ResetPassword";
import SplunkQuiz from "./components/Quiz";
import QuizResults from "./components/QuizResults";
import MainQuiz from "./components/MainQuiz";
import SeeQuiz from "./components/SeeQuiz";
import Cancel from "./pages/Cancel";
import StudentDashboard from "./components/CheckC";
import StockDashboard from "./components/StockPage";
import StockPortal from "./components/StockPortal";
import Commands from "./components/Commands";
import SplunkDictionary from "./components/Dictionary";
import StockCard from "./StockPublic";
import MassiveStockDashboard from "./StockPublic";
import SplunkCareerRoadmap from "./components/SplunkCareerRoadmap";

// 🟣 GLOBAL THEME HELPER
function applySavedTheme() {
  const saved = localStorage.getItem("theme") || "light";
  document.documentElement.classList.toggle("dark", saved === "dark");
}

applySavedTheme();

// 🟣 ROUTES
const router = createBrowserRouter([
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
        element: <Cancel />,
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
            element: <AllCourses />,
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
        path: "/about",
        element: (
          <React.Suspense fallback={<Loader />}>
            <LazyAbout />
          </React.Suspense>
        ),
      },
      {
        path: "/sessions",
        element: <Session />,
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
        path: "/blog",
        element: (
          <React.Suspense fallback={<Loader />}>
            <LazyBlogPage />
          </React.Suspense>
        ),
      },

      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/checkout",
        element: <CheckOut />,
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
        element: <LiveCourses />,
      },
      { path: "/commands", element: <Commands /> },
      { path: "/dictionary", element: <SplunkDictionary /> },
      {
        path: "/result",
        element: <QuizResults />,
      },
      {
        path: "/quiz",
        element: <SplunkQuiz />,
      },
      {
        path: "/myProfile",
        element: <MyProfile />,
      },
    ],
  },

  {
    path: "/admininfo",
    element: <AdminLoginForm />,
  },

  {
    path: "/createAccount",
    element: <CreateAccountForm />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/forgotPassword",
    element: <ForgotPassword />,
  },
  {
    path: "//reset-password/:token",
    element: <ResetPassword />,
  },
  {
    path: "/OTP",
    element: <OTP_Verification />,
  },
  {
    path: "/createNewPassword",
    element: <CreateNewPassword />,
  },
  {
    path: "/confirmNewPassword",
    element: <ConfirmNewPassword />,
  },
  {
    path: "/partner",
    element: <ConnectWithContractor />,
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
      { index: true, element: <MyCourses /> },
      { path: "checkout", element: <CheckOut /> },
      { path: "quiz", element: <SplunkQuiz /> },
      { path: "dictionary", element: <SplunkDictionary /> },
      { path: "classmaterials", element: <ClassM /> },
      { path: "myCourses", element: <MyCourses /> },
      { path: "mentorship", element: <Mentorship /> },
      { path: "comment", element: <StudentCommentPage /> },
      { path: "links", element: <Links /> },
      { path: "commands", element: <Commands /> },
      { path: "materials", element: <Materials /> },
      { path: "stockside", element: <StockDashboard /> },
      { path: "result", element: <QuizResults /> },
      { path: "stockportal", element: <StockPortal /> },
      {
        path: "stock",
        element: <MassiveStockDashboard />,
      },
      {
        path: "map",
        element: <SplunkCareerRoadmap />,
      },
      { path: "takequiz", element: <MainQuiz /> },
      { path: "check", element: <StudentDashboard /> },
      { path: "makePayment", element: <PaymentPage /> },
      { path: "/dashboard/post", element: <Dashboard /> },
    ],
  },

  // ADMIN DASHBOARD
  {
    path: "/ADMIN-DASHBOARD",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },

      {
        path: "viewcourses",
        element: <AdminViewCourses />,
        children: [
          {
            index: true,
            element: (
              <h1 className="text-center font-bold md:text-4xl">ALL COURSES</h1>
            ),
          },
          {
            path: "published",
            element: (
              <h1 className="text-center font-bold md:text-4xl">PUBLISHED</h1>
            ),
          },
          {
            path: "draft",
            element: (
              <h1 className="text-center font-bold md:text-4xl">DRAFT</h1>
            ),
          },
        ],
      },

      { path: "allStudents", element: <AllStudents /> },
      { path: "contacts", element: <Contacts /> },
      { path: "studentresults", element: <SeeQuiz /> },
      { path: "contractors", element: <Contractors /> },
      { path: "send-links", element: <SendLinks /> },
      { path: "send-pdf", element: <SendPdf /> },
      { path: "send-messages", element: <SendMessages /> },
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
// import { CartItemProvider } from "./context/CartItemContext";
// import ErrorPage from "./components/errorPage";
// import AllCourses from "./components/AllCourses";
// const LazyHomePage = React.lazy(() => import("./pages/HomePage"));
// const LazyCourses = React.lazy(() => import("./pages/Courses"));
// const LazyAbout = React.lazy(() => import("./pages/AboutPage"));
// const LazyCareer = React.lazy(() => import("./pages/CareerPage"));
// const LazyCOURSE = React.lazy(() => import("./pages/COURSE"));
// const LazyBlogPage = React.lazy(() => import("./pages/BlogPage"));
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
// import LoginForm from "./pages/LoginForm";
// import AdminLoginForm from "./pages/AdminLoginForm";
// import CheckOut from "./pages/CheckOut";
// import SendLinks from "./components/SendLinks";
// import SendMessages from "./components/SendMessages";
// // import { Route, Switch, useLocation } from "react-router-dom";
// import { createBrowserRouter, RouterProvider } from "react-router-dom";

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

// // import DashboardCourses from "./dashboard/components/DashboardCourses";
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

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <HomeLayout />,
//     errorElement: <ErrorPage />,
//     children: [
//       {
//         index: true,
//         element: (
//           <React.Suspense fallback={<Loader />}>
//             <LazyHomePage />
//           </React.Suspense>
//         ),
//       },
//       {
//          path: "/cancel",
//         element: <Cancel/>,

//       },

//       {
//         path: "/courses",
//         element: (
//           <React.Suspense fallback={<Loader />}>
//             <LazyCourses />
//           </React.Suspense>
//         ),
//         children: [
//           {
//             index: true,
//             element: <AllCourses />,
//           },
//           {
//             path: ":course",
//             element: (
//               <React.Suspense fallback={<Loader />}>
//                 <LazyCOURSE />
//               </React.Suspense>
//             ),
//           },
//         ],
//       },
//       {
//         path: "/about",
//         element: (
//           <React.Suspense fallback={<Loader />}>
//             <LazyAbout />
//           </React.Suspense>
//         ),
//       },
//       {
//         path: "/sessions",
//         element: <Session />,
//       },

//       {
//         path: "/career",
//         element: (
//           <React.Suspense fallback={<Loader />}>
//             <LazyCareer />
//           </React.Suspense>
//         ),
//       },
//       {
//         path: "/blog",
//         element: (
//           <React.Suspense fallback={<Loader />}>
//             <LazyBlogPage />
//           </React.Suspense>
//         ),
//       },

//       {
//         path: "/contact",
//         element: <ContactPage />,
//       },
//       {
//         path: "/checkout",
//         element: <CheckOut />,
//       },
//       {
//         path: "/mentorship",
//         element: (
//           <React.Suspense fallback={<Loader />}>
//             <LazyMentorship />
//           </React.Suspense>
//         ),
//       },
//       {
//         path: "/liveCourses",
//         element: <LiveCourses />,
//       },
//       {
//         path: "/result",
//         element: <QuizResults />,
//       },
//       {
//         path: "/quiz",
//         element: <SplunkQuiz />,
//       },
//       {
//         path: "/myProfile",
//         element: <MyProfile />,
//       },
//     ],
//   },
//   {
//     path: "/admininfo",
//     element: <AdminLoginForm />,
//   },

//   {
//     path: "/createAccount",
//     element: <CreateAccountForm />,
//   },
//   {
//     path: "/login",
//     element: <LoginForm />,
//   },
//   {
//     path: "/forgotPassword",
//     element: <ForgotPassword />,
//   },
//   {
//     path: "//reset-password/:token",
//     element: <ResetPassword />,
//   },
//   {
//     path: "/OTP",
//     element: <OTP_Verification />,
//   },
//   {
//     path: "/createNewPassword",
//     element: <CreateNewPassword />,
//   },
//   {
//     path: "/confirmNewPassword",
//     element: <ConfirmNewPassword />,
//   },
//   {
//     path: "/partner",
//     element: <ConnectWithContractor />,
//   },

//   {
//     path: "/dashboard",
//     element: (
//       <React.Suspense fallback={<Loader />}>
//         <LazyAuthLayout />
//       </React.Suspense>
//     ),
//     children: [
//       {
//         index: true,
//         element: <MyCourses />,
//       },
//       {
//         path: "checkout",
//         element: <CheckOut />,
//       },
//       {
//         path: "quiz",
//         element: <SplunkQuiz />,
//       },

//       {
//         path: "classmaterials",
//         element: <ClassM />,
//       },

//       {
//         path: "myCourses",
//         element: <MyCourses />,
//       },
//       {
//         path: "mentorship",
//         element: <Mentorship />,
//       },
//       {
//         path: "comment",
//         element: <StudentCommentPage />,
//       },
//       {
//         path: "links",
//         element: <Links />,
//         // <h1 className="min-h-screen flex justify-center items-center font-bold text-3xl">LINKS PAGE</h1>
//       },
//       {
//         path: "materials",
//         element: <Materials />,
//       },
//        {
//         path: "stockside",
//         element: <StockDashboard />,
//       },

//       {
//         path: "stockportal",
//         element: <StockPortal />,
//       },
//       {
//         path: "takequiz",
//         element: <MainQuiz />,
//       },
//        {
//         path: "check",
//         element: <StudentDashboard />,
//       },
//       {
//         path: "makePayment",
//         element: <PaymentPage />,
//       },
//       {
//         path: "/dashboard/post",
//         element: <Dashboard />,
//       },
//     ],
//   },
//   {
//     path: "/ADMIN-DASHBOARD",
//     element: <AdminLayout />,
//     children: [
//       {
//         index: true,
//         element: <AdminDashboard />,
//       },
//       {
//         path: "viewcourses",
//         element: <AdminViewCourses />,
//         children: [
//           {
//             index: true,
//             element: (
//               <h1 className="text-center font-bold md:text-4xl">ALL COURSES</h1>
//             ),
//           },
//           {
//             path: "published",
//             element: (
//               <h1 className="text-center font-bold md:text-4xl">PUBLISHED</h1>
//             ),
//           },
//           {
//             path: "draft",
//             element: (
//               <h1 className="text-center font-bold md:text-4xl">DRAFT</h1>
//             ),
//           },
//         ],
//       },
//       {
//         path: "allStudents",
//         element: <AllStudents />,
//       },
//       {
//         path: "contacts",
//         element: <Contacts />,
//       },
//        {
//         path: "studentresults",
//         element: <SeeQuiz />,
//       },
//       {
//         path: "contractors",
//         element: <Contractors />,
//       },
//       {
//         path: "send-links",
//         element: <SendLinks />,
//       },
//       {
//         path: "send-pdf",
//         element: <SendPdf />,
//       },
//       {
//         path: "send-messages",
//         element: <SendMessages />,
//       },
//     ],
//   },
// ]);

// function App() {
//   return (
//     <CartItemProvider>
//       <AnimatePresence>
//         <RouterProvider router={router} />
//       </AnimatePresence>
//     </CartItemProvider>
//   );
// }

// export default App;
