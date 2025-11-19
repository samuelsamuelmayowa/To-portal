import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import CartItemContext from "../context/CartItemContext";
import { useStateContext } from "../context/ContextProvider";
import { Toaster, toast } from "sonner";
import { FaCheck, FaExclamation } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";


const CheckOut = () => {
   const api = import.meta.env.VITE_HOME_OO 
  // const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  const { cartItem, setCartItem } = useContext(CartItemContext);
  const { token } = useStateContext();
  const navigate = useNavigate();

  // Handle Stripe Checkout
const handleStripeCheckout = async () => {
  try {
    const response = await axios.post(
      `${api}/api/payment/create-checkout-session`,
      {
        items: cartItem.map((item) => ({
          name: item.courseName || item.name,
          price: item.price,
          quantity: 1,
        })),
      }
    );

    // ✅ Stripe now returns the redirect URL
    window.location.href = response.data.url;
  } catch (error) {
    console.error("Error creating checkout session:", error, error.message
      
    );
    toast.error("Payment initialization failed. Please try again.");
  }
};


  const checkOut = () => {
    if (!token) {
      toast.error("You have to Login First", {
        cancel: { label: <FaXmark /> },
        duration: 4000,
        icon: <FaExclamation color="red" />,
      });
      setTimeout(() => {
        navigate("/login");
      }, 4000);
      return;
    }

    if (cartItem.length === 0) {
      toast.error("Oops, Your cart is empty", {
        cancel: { label: <FaXmark /> },
        duration: 4000,
        icon: <FaExclamation color="red" />,
      });
      toast("Would you like to buy a course?", {
        action: {
          label: <FaCheck color="green" />,
          onClick: () => navigate("/courses"),
        },
        cancel: { label: <FaXmark color="red" /> },
        classNames: { actionButton: "bg-slate-300" },
      });
      return;
    }

    // ✅ If logged in and cart not empty → start Stripe checkout
    handleStripeCheckout();
  };

  const removeCourse = (id) => {
    const updatedCart = cartItem.filter((item) => item.id !== id);
    setCartItem(updatedCart);
    localStorage.setItem("COURSE-CART", JSON.stringify(updatedCart));
  };

  const total = cartItem
    .map((p) => p.price)
    .reduce((acc, cur) => acc + cur, 0);

  return (
    <div className="min-h-screen md:px-10 px-2 pt-24 pb-20">
      <h1 className="text-xl md:text-4xl font-black">SHOPPING CART</h1>
    <div>
  <p className="font-semibold text-md flex items-end gap-1 my-3">
    <span className="font-black text-xl">{cartItem.length}</span>
    {cartItem.length > 1 ? "COURSES" : "COURSE"} in cart
  </p>
</div>


      <section className="grid md:grid-cols-3 grid-cols-1 gap-10">
        <div className="cart-items md:col-span-2">
          {cartItem.length > 0 ? (
            cartItem.map((item) => (
              <div key={item.id} className="py-4 px-2">
                <div className="flex items-center gap-2 md:gap-4">
                  <div>
                    {item.image ? (
                      <img
                        src={item.image}
                        className="w-12 aspect-square object-cover rounded-md"
                        alt=""
                      />
                    ) : (
                      <div className="w-12 aspect-square bg-BLUE rounded-md"></div>
                    )}
                  </div>
                  <div className="md:flex-[5]">
                    <p className="text-sm md:text-base font-black">
                      {item.courseName || item.name}
                    </p>
                    <p className="text-xs">{item.intro}</p>
                    <p className="text-xs font-medium line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex gap-2 md:gap-4 md:flex-1">
                    <button
                      onClick={() => removeCourse(item.id)}
                      className="font-bold text-xs text-BLUE"
                    >
                      REMOVE
                    </button>
                    <p className="font-black">${item.price}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <h1 className="col-span-3 flex justify-center items-center font-bold text-base md:text-xl">
              NO ITEM IN YOUR CART
            </h1>
          )}
        </div>

        <div className="mb-3">
          <div className="my-8">
            <h1 className="text-slate-600 text-sm font-bold">TOTAL:</h1>
            <p className="font-black text-2xl">${total}</p>
          </div>
          <button
            onClick={checkOut}
            className="duration-300 bg-BLUE hover:bg-white border-2 border-BLUE hover:text-BLUE w-full text-white font-bold py-3 rounded-xl"
          >
            CHECKOUT
          </button>
        </div>
      </section>
      <Toaster position="top-center" />
    </div>
  );
};

export default CheckOut;



// import { useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import CartItemContext from "../context/CartItemContext";
// import { useStateContext } from "../context/ContextProvider";
// import { Toaster, toast } from "sonner";
// import { FaCheck, FaExclamation } from "react-icons/fa";
// import { FaXmark } from "react-icons/fa6";
// import axios from "axios";
// import { loadStripe } from "@stripe/stripe-js";
// // ⚡ Stripe public key (replace with yours)

// const CheckOut = () => {
//   const { cartItem, setCartItem } = useContext(CartItemContext);
//   const { token, user } = useStateContext(); // assuming you have user info
//   const navigate = useNavigate();

//   const checkOut = async () => {
//     // 🚫 1. User not logged in
//     if (!token) {
//       toast.error("You have to Login First", {
//         cancel: { label: <FaXmark /> },
//         duration: 4000,
//         icon: <FaExclamation color="red" />,
//       });
//       setTimeout(() => navigate("/login"), 3000);
//       return;
//     }

//     // 🚫 2. Empty cart
//     if (cartItem.length === 0) {
//       toast.error("Oops, Your cart is empty", {
//         cancel: { label: <FaXmark /> },
//         duration: 4000,
//         icon: <FaExclamation color="red" />,
//       });
//       toast("Would you like to buy a course?", {
//         action: {
//           label: <FaCheck color="green" />,
//           onClick: () => navigate("/courses"),
//         },
//         cancel: { label: <FaXmark color="red" /> },
//         classNames: { actionButton: "bg-slate-300" },
//       });
//       return;
//     }

//     // ✅ 3. Proceed with Stripe Checkout
//     try {
//       const stripe = await stripePromise;
//       const { data } = await axios.post("http://localhost:5000/create-checkout-session", {
//         cartItems: cartItem,
//         email: user?.email || "guest@example.com",
//         token,
//       });

//       if (data.url) {
//         // Redirect user to Stripe Checkout
//         window.location.href = data.url;
//       } else {
//         toast.error("Unable to start payment. Please try again.");
//       }
//     } catch (error) {
//       console.error("Checkout error:", error);
//       toast.error("Payment setup failed. Please try again.");
//     }
//   };

//   // 🗑 Remove a course from cart
//   const removeCourse = (id) => {
//     const updatedCart = cartItem.filter((item) => item.id !== id);
//     setCartItem(updatedCart);
//     localStorage.setItem("COURSE-CART", JSON.stringify(updatedCart));
//   };

//   // 💲 Total
//   const total = cartItem
//     .map((item) => Number(item.price))
//     .reduce((acc, cur) => acc + cur, 0);

//   return (
//     <div className="min-h-screen md:px-10 px-2 pt-24 pb-20">
//       <h1 className="text-xl md:text-4xl font-black">SHOPPING CART</h1>

//       <div>
//         <p className="font-semibold text-md flex items-end gap-1 my-3">
//           <p className="font-black text-xl">{cartItem.length}</p>{" "}
//           {cartItem.length > 1 ? "COURSES" : "COURSE"} in cart
//         </p>
//       </div>

//       <section className="grid md:grid-cols-3 grid-cols-1 gap-10">
//         {/* 🛒 Cart Items */}
//         <div className="cart-items md:col-span-2">
//           {cartItem.length > 0 ? (
//             cartItem.map((item) => (
//               <div key={item.id} className="py-4 px-2 border-b border-gray-200">
//                 <div className="flex items-center gap-2 md:gap-4">
//                   <div>
//                     {item.image ? (
//                       <img
//                         src={item.image}
//                         className="w-12 aspect-square object-cover rounded-md"
//                         alt=""
//                       />
//                     ) : (
//                       <div className="w-12 aspect-square bg-BLUE rounded-md" />
//                     )}
//                   </div>
//                   <div className="md:flex-[5]">
//                     <p className="text-sm md:text-base font-black">
//                       {item.courseName || item.name}
//                     </p>
//                     <p className="text-xs">{item.intro}</p>
//                     <p className="text-xs font-medium line-clamp-1">
//                       {item.description}
//                     </p>
//                   </div>
//                   <div className="flex gap-2 md:gap-4 md:flex-1 items-center">
//                     <button
//                       onClick={() => removeCourse(item.id)}
//                       className="font-bold text-xs text-BLUE"
//                     >
//                       REMOVE
//                     </button>
//                     <p className="font-black">${item.price}</p>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <h1 className="col-span-3 flex justify-center items-center font-bold text-base md:text-xl">
//               NO ITEM IN YOUR CART
//             </h1>
//           )}
//         </div>

//         {/* 💰 Checkout Summary */}
//         <div className="mb-3">
//           <div className="my-8">
//             <h1 className="text-slate-600 text-sm font-bold">TOTAL:</h1>
//             <p className="font-black text-2xl">${total}</p>
//           </div>
//           <button
//             onClick={checkOut}
//             className="duration-300 bg-BLUE hover:bg-white border-2 border-BLUE hover:text-BLUE w-full text-white font-bold py-3 rounded-xl"
//           >
//             CHECKOUT
//           </button>
//         </div>
//       </section>

//       <Toaster position="top-center" />
//     </div>
//   );
// };

// export default CheckOut;
 



// import { useContext } from "react";
// import { useNavigate } from "react-router-dom"
// import CartItemContext from "../context/CartItemContext";
// import { useStateContext } from "../context/ContextProvider";
// import { Toaster, toast } from 'sonner';
// import { FaCheck, FaExclamation } from "react-icons/fa";
// import { FaXmark } from "react-icons/fa6";

// const CheckOut = () => {
//   const { cartItem, setCartItem } = useContext(CartItemContext);
//   const { token } = useStateContext();
//   const navigate = useNavigate();
//   const checkOut = ()=> {
//     if (!token) {
//       toast.error("You have to Login First", {
//         cancel: {
//           label: <FaXmark />,
//         },
//         duration: 4000,
//         icon: <FaExclamation color="red" />,
//       })
//       setTimeout(() => {
//         navigate("/login")
//       }, 5000);
//     }
//     if (cartItem.length === 0) {
//       toast.error("Oops, Your cart is empty", {
//         cancel: {
//           label: <FaXmark />,
//         },
//         duration: 4000,
//         icon: <FaExclamation color="red" />,
//       })
//       toast('Would you like to buy a course', {
//         action: {
//           label: <FaCheck color="green" />,
//           onClick: ()=> navigate("/courses")
//         },
//         cancel: {
//           label: <FaXmark color="red" />,
//         },
//         classNames: {
//           actionButton: 'bg-slate-300',
//         },
//       });
//     }
//     if (token) {
//       navigate("/dashboard/makePayment")
//     }
//   }
//   const removeCourse = (id) => {
//     const updatedCart = cartItem.filter((item) => item.id !== id);
//     setCartItem(updatedCart);
//     localStorage.setItem("COURSE-CART", JSON.stringify(updatedCart));
//   };
    
//   return (
//     <div className="min-h-screen md:px-10 px-2 pt-24 pb-20">
//       <h1 className="text-xl md:text-4xl font-black">SHOPPING CART</h1>
//       <div>
//         <p className="font-semibold text-md flex items-end gap-1 my-3"><p className="font-black text-xl">{cartItem.length}</p> {cartItem.length > 1 ? "COURSES" : "COURSE"} in cart </p>
//       </div>
//       <section className="grid md:grid-cols-3 grid-cols-1 gap-10">
//         <div className="cart-items md:col-span-2">
//           {cartItem.length > 0 ? cartItem.map((item)=> (
//             <div key={item.id} className="py-4 px-2">
//               <div className="flex items-center gap-2 md:gap-4">
//                 <div>
//                   {item.image ? <img src={item.image} className="w-12 aspect-square object-cover rounded-md" alt="" /> : (<div className="w-12 aspect-square bg-BLUE rounded-md"></div>)}
//                 </div>
//                 <div className="md:flex-[5]">
//                   <p className="text-sm md:text-base font-black">{item.courseName || item.name}</p>
//                   <p className="text-xs">{item.intro}</p>
//                   <p className="text-xs font-medium line-clamp-1">{item.description}</p>
//                 </div>
//                 <div className="flex gap-2 md:gap-4 md:flex-1">
//                   <button onClick={()=> removeCourse(item.id)} className="font-bold text-xs text-BLUE">REMOVE</button>
//                   <p className="font-black">${item.price}</p>
//                 </div>
//               </div>
//             </div>
//           )) : <h1 className="col-span-3 flex justify-center items-center font-bold text-base md:text-xl">NO ITEM IN YOUR CART</h1>}
//         </div>
//         <div className="mb-3">
//           <div className="my-8">
//             <h1 className="text-slate-600 text-sm font-bold">TOTAL:</h1>
//             <p className="font-black text-2xl">${cartItem.map((price)=> price.price).reduce((acc, cur)=> acc + cur , 0)}</p>
//           </div>
//           <button onClick={checkOut} className="duration-300 bg-BLUE hover:bg-white border-2 border-BLUE hover:text-BLUE w-full text-white font-bold py-3 rounded-xl">CHECKOUT</button>
//         </div>
//       </section>
//       <Toaster position="top-center" />
//     </div>
//   )
// }

// export default CheckOut