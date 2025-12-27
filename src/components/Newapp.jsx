
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const NewFeaturePopup = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    //Fixed key mismatch ("sFeature" vs "seFeature")
    const hasSeen = localStorage.getItem("newFeatueSe");
    if (!hasSeen) {
      setTimeout(() => setShow(true), 800); // delay for subtle effect
      localStorage.setItem("newFeatueSeen", "true");
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="popup"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Popup Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl p-8 max-w-sm w-[90%] border border-purple-500/20"
          >
            {/* Glow Ring */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 opacity-20 blur-lg" />

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="bg-purple-600/10 p-3 rounded-full"
                >
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </motion.div>
              </div>

              <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                🎉 New Feature!
              </h2>

          <p className="text-gray-300 text-center leading-relaxed mb-6">
  OUR SPLUNK LAB JUST GOT BETTER   <span className="text-blue-400 font-semibold"></span>{" "}
  <span className="text-purple-400 font-semibold"></span>.
</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShow(false)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-purple-500/20 transition"
              >
                Got it!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewFeaturePopup;

// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// const NewFeaturePopup = () => {
//   const [show, setShow] = useState(false);

//   useEffect(() => {
//     const hasSeen = localStorage.getItem("seFeature");
//     if (!hasSeen) {
//       // Show popup only for first-time visitors
//       setShow(true);
//       localStorage.setItem("sFeature", "true");
//     }
//   }, []);

//   return (
//     <AnimatePresence>
//       {show && (
//         <motion.div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           <motion.div
//             className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-[90%] text-center"
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.8, opacity: 0 }}
//             transition={{ type: "spring", stiffness: 200, damping: 15 }}
//           >
//             <h2 className="text-2xl font-bold text-gray-800 mb-3">
//               {/* 🎉 New Feature Available! */}
//             </h2>

//             <p className="text-gray-600 mb-6">
//               You can now{" "}
//               <span className="font-semibold text-blue-600">
//                 check for on the carrer page for job Opportunities
//               </span>{" "}
//               directly after taking a Quiz 
//             </p>

//             <button
//               onClick={() => setShow(false)}
//               className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
//             >
//               Got it!
//             </button>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default NewFeaturePopup;

// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// const NewFeaturePopup = () => {
//   const [show, setShow] = useState(false);

//   useEffect(() => {
//     const hasSeen = localStorage.getItem("seenNFeature");
//     if (!hasSeen) {
//       // Show popup for first-time visitors
//       setShow(true);
//       localStorage.setItem("seenNFeature", "true");
//     }
//   }, []);

//   return (
//     <AnimatePresence>
//       {show && (
//         <motion.div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           <motion.div
//             className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-[90%] text-center"
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.8, opacity: 0 }}
//             transition={{ type: "spring", stiffness: 200, damping: 15 }}
//           >
//             <h2 className="text-2xl font-bold text-gray-800 mb-3">
//               🎉 New Feature Available!
//             </h2>
//             <p className="text-gray-600 mb-6">
//               You can now Download your Exam after taking it {" "}
//               <span className="font-semibold text-blue-600">
//                 class schedule
//               </span>{" "}
//               inside your dashboard.
//             </p>
//             <button
//               onClick={() => setShow(false)}
//               className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
//             >
//               Got it!
//             </button>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default NewFeaturePopup;

// import { useEffect, useState } from "react";

// const NewFeaturePopup = () => {
//   const [show, setShow] = useState(false);

//   useEffect(() => {
//     const seen = localStorage.getItem("seenNewNotesFeature");
//     if (!seen) {
//       setShow(true);
//       localStorage.setItem("seenNewNotesFeature", "true");
//     }
//   }, []);

//   if (!show) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
//       <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm text-center">
//         <h2 className="text-2xl font-semibold mb-2">🎉 New Feature!</h2>
//         <p className="text-gray-600 mb-4">
//           You can now <b>take notes</b> directly while watching your classes.
//           Your notes will be saved automatically!
//         </p>
//         <button
//           onClick={() => setShow(false)}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//         >
//           Got it
//         </button>
//       </div>
//     </div>
//   );
// };

// export default NewFeaturePopup;
