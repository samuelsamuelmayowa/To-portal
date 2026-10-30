import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import CartItemContext from "../context/CartItemContext";
import { useStateContext } from "../context/ContextProvider";

// Must point to your backend (e.g. your Render service), not your frontend.
const API_URL = (import.meta.env.VITE_HOME_OO || "").replace(/\/+$/, "");

const formatPrice = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

export default function CheckOut() {
  const navigate = useNavigate();
  const { cartItem, setCartItem } = useContext(CartItemContext);
  const { token } = useStateContext();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const cart = Array.isArray(cartItem) ? cartItem : [];
  // Display only. The backend/Stripe Price IDs determine the actual amount.
  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const handleStripeCheckout = async () => {
    if (isCheckingOut) return;

    if (!token) {
      toast.error("Please log in before making payment.");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your shopping cart is empty.");
      return;
    }

    if (!API_URL) {
      toast.error("Payment service is not configured.");
      return;
    }

    const courseIds = cart.map((item) =>
      item.id == null ? "" : String(item.id).trim()
    );

    if (courseIds.some((id) => !id)) {
      toast.error("One of your courses has an invalid ID.");
      return;
    }

    if (new Set(courseIds).size !== courseIds.length) {
      toast.error("Please remove duplicate courses from your cart.");
      return;
    }

    setIsCheckingOut(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/api/payment/create-checkout-session`,
        { courseIds },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 20000,
        }
      );

      if (!data?.url || typeof data.url !== "string") {
        throw new Error("Stripe did not return a checkout URL.");
      }

      // Stripe's hosted checkout page.
      window.location.assign(data.url);
    } catch (error) {
      console.error("Stripe checkout error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to start payment. Please try again."
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const removeCourse = (id) => {
    if (isCheckingOut) return;
    const updatedCart = cart.filter((item) => item.id !== id);
    setCartItem(updatedCart);
    localStorage.setItem("COURSE-CART", JSON.stringify(updatedCart));
    toast.success("Course removed from cart.");
  };

  return (
    <div className="min-h-screen md:px-10 px-2 pt-24 pb-20">
      <h1 className="text-xl md:text-4xl font-black">SHOPPING CART</h1>
      <p className="font-semibold text-md flex items-end gap-1 my-3">
        <span className="font-black text-xl">{cart.length}</span>
        {cart.length === 1 ? "COURSE" : "COURSES"} in cart
      </p>

      <section className="grid md:grid-cols-3 grid-cols-1 gap-10">
        <div className="cart-items md:col-span-2">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.id} className="py-4 px-2 border-b border-gray-200">
                <div className="flex items-center gap-2 md:gap-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      className="w-12 aspect-square object-cover rounded-md"
                      alt={item.courseName || item.name || "Course"}
                    />
                  ) : (
                    <div className="w-12 aspect-square bg-BLUE rounded-md" />
                  )}

                  <div className="md:flex-[5] min-w-0">
                    <p className="text-sm md:text-base font-black">
                      {item.courseName || item.name}
                    </p>
                    {item.intro && <p className="text-xs">{item.intro}</p>}
                    {item.description && (
                      <p className="text-xs font-medium line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:flex-1 items-end md:items-center">
                    <button
                      type="button"
                      onClick={() => removeCourse(item.id)}
                      disabled={isCheckingOut}
                      className="font-bold text-xs text-BLUE disabled:opacity-50"
                    >
                      REMOVE
                    </button>
                    <p className="font-black whitespace-nowrap">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 flex flex-col items-center py-14 gap-5">
              <h2 className="font-bold text-base md:text-xl">NO ITEM IN YOUR CART</h2>
              <button
                type="button"
                onClick={() => navigate("/courses")}
                className="bg-BLUE text-white px-6 py-3 rounded-xl font-bold"
              >
                EXPLORE COURSES
              </button>
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className="my-8">
            <h2 className="text-slate-600 text-sm font-bold">ESTIMATED TOTAL:</h2>
            <p className="font-black text-2xl">{formatPrice(total)}</p>
            <p className="text-xs text-slate-500 mt-2">
              Final amount will be shown on Stripe Checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStripeCheckout}
            disabled={isCheckingOut || cart.length === 0}
            className="duration-300 bg-BLUE hover:bg-white border-2 border-BLUE hover:text-BLUE w-full text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckingOut ? "CONNECTING TO STRIPE..." : "PAY SECURELY WITH STRIPE"}
          </button>
          <p className="text-center text-xs text-slate-500 mt-3">
            Secure card payment powered by Stripe.
          </p>
        </div>
      </section>
      <Toaster position="top-center" richColors />
    </div>
  );
}
