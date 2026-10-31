/**
 * T.O. ANALYTICS — APPROVED SPLUNK STUDENT EMAILS
 *
 * ADD A NEW STUDENT: add their email as a quoted string in the list below.
 * REMOVE ACCESS: remove their email, then rebuild and redeploy the frontend.
 * Previous and 2026 students use the SAME current Splunk dashboard.
 *
 * NOTE: This is FRONTEND VISIBILITY ONLY, matching the previous site setup.
 * Browser localStorage and bundled JavaScript can be edited by visitors.
 * Protect actual premium content with server-verified login and enrollment.
 */
export const SPLUNK_STUDENT_EMAILS = new Set([
  "sammmyayo@gmail.com",
  "kewizle.k@gmail.com",
  "kewizlek@gmail.com",
  // "davidayeni63@gmail.com",
  "pamelaabina24@gmail.com",
  "adesh25416@gmail.com",
  // "basseyvera018@gmail.com",
  // "codeverseprogramming23@gmail.com",
  // "fadeleolutola@gmail.com",
  // "ooolajuyigbe@gmail.com",
  // "jahdek76@gmail.com",
  "oluwaferanmiolulana@gmail.com",
  "tomideolulana@gmail.com",
  "toanalyticsllc@gmail.com",
  // "lybertyudochuu@gmail.com",
  // "kevwe_oberiko@yahoo.com",
  "denisgsam@gmail.com",
  "oluwaferanmi.olulana@gmail.com",
  "fpasamuelmayowa51@gmail.com",
  "randommayowa@gmail.com",
  "oluwatiroyeamoye@gmail.com",
  "adenusitimi@gmail.com",
  "trbanjo@gmail.com",
  "emanfrimpong@gmail.com",
  "dipeoluolatunji@gmail.com",
  "yinkalola51@gmail.com",
  "adeoyeifeoluwa@gmail.com",
  "toluolubambi@gmail.com",
   "Adeoyeifeoluwa@gmail.com",
  "spheremessage@gmail.com",
  "toluolubambi@gmail.com"

  // "newstudent@example.com", // <-- ADD STUDENT EMAIL ABOVE THIS LINE
]);

export function normalizeStudentEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function readSignedInStudentEmail() {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.localStorage.getItem("user") || "";
    if (!raw) return "";
    try {
      const value = JSON.parse(raw);
      return normalizeStudentEmail(typeof value === "string" ? value : value?.email);
    } catch {
      return normalizeStudentEmail(raw);
    }
  } catch {
    return "";
  }
}

export function isSplunkEmailApproved(email) {
  return Boolean(email) && SPLUNK_STUDENT_EMAILS.has(normalizeStudentEmail(email));
}
