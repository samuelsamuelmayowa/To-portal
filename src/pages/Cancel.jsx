// src/pages/Cancel.jsx
import { Link } from "react-router-dom";

const Cancel = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Cancelled ❌</h1>
      <p className="text-gray-600 mb-6">
        Your payment was not completed. You can try again or continue browsing.
      </p>
      <Link
        to="/checkout"
        className="bg-BLUE text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Go Back to Checkout
      </Link>
    </div>
  );
};

export default Cancel;
