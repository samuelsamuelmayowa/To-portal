import { useState, useEffect, useContext } from "react";
import React from "react";
import { Link, Navigate } from "react-router-dom";
import { ReactDOM } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";

const api = import.meta.env.VITE_BACKEND_PAY;
import CartItemContext from "../context/CartItemContext";
import { useStateContext } from "../context/ContextProvider";
import { useThirdPartyCookieCheck } from "../useThirdPartyCookieCheck";
import { useCookies } from "react-cookie";

const PaymentPage = () => {
  const [cookies, setCookie] = useCookies(["paypal"]);
  function onChange(newName) {
    setCookie("paypal", newName);
    // console.log(cookies);
  }
  useEffect(() => {
    document.cookie =
      "myCookie=paypal;domain=www.to-analytics.com;  SameSite=None; Secure";
    onChange();
  }, []);
  // document.cookie = "myCookie=value; SameSite=Lax";
  const status = useThirdPartyCookieCheck();
  const { token } = useStateContext();
  const { cartItem, setCartItem } = useContext(CartItemContext);
  const studentName = window.localStorage.getItem("user");
  const [message, setMessage] = useState("");
  const [totalcart, setTotalCart] = useState([]);
  var totalcartitem = 110;
  let totalFinalPayment;
  let courseName;
  let orderDetail = [];
  // const checkoutfunction = () => {
  //   // when users trys to pay only one course it works
  //   if (cartItem.length === 1) {
  //     const singleCourse = cartItem[0];
  //     totalFinalPayment = singleCourse.price;
  //     courseName = singleCourse.courseName;
  //     orderDetail.push({
  //       courseName,
  //       totalFinalPayment,
  //       completelyPaid: false,
  //       isPending: true,
  //     });
  //     console.log("only one course " + courseName + totalFinalPayment);
  //     alert(
  //       `${studentName} is trying to buy ${cartItem.length} ${courseName} courses with a total of $${totalFinalPayment}.`
  //     );
  //     const data = {
  //       studentName: studentName,
  //       courseName: courseName,
  //       price: totalFinalPayment,
  //     };
  //     axios
  //       .post(`${api}order`, data)
  //       .then((res) => {
  //         if (res.status === 200 || res.status === 201) {
  //           alert("working welll");
  //         }
  //       })
  //       .catch((err) => console.log(err.message));
  //   } else if (cartItem.length > 1) {
  //     totalFinalPayment = cartItem.reduce((acc, cur) => acc + cur.price, 0);
  //     const allCourses = cartItem.map((course) => course.courseName);
  //     if (cartItem.length <= 3) {
  //       courseName = cartItem
  //         .map((course) => course.courseName || course.name)
  //         .join(", ");
  //     } else {
  //       const firstCourses = cartItem
  //         .slice(0, cartItem.length - 1)
  //         .map((course) => course.courseName || course.name)
  //         .join(", ");
  //       const lastCourse =
  //         cartItem[cartItem.length - 1].courseName ||
  //         cartItem[cartItem.length - 1].name;
  //       courseName = `${firstCourses} and ${lastCourse}`;
  //     }
  //     alert(
  //       `${studentName} is trying to buy ${courseName} courses with a total of $${totalFinalPayment}.`
  //     );
  //     const data = {
  //       studentName: studentName,
  //       courseName: courseName,
  //       price: totalFinalPayment,
  //     };
  //     const cart = [
  //       {
  //         studentName: studentName,
  //         courseName: courseName,
  //         price: totalFinalPayment,
  //       },
  //     ];
  //     axios
  //       .post(`${api}order`, data)
  //       .then((res) => {
  //         if (res.status === 200 || res.status === 201) {
  //           alert("working welll");
  //         }
  //       })
  //       .catch((err) => console.log(err.message));
  //     console.log("more than one course" + cartItem);
  //   }

  //   // when users trys to pay many course at once it still works
  //   // const totalcart = cartItem.reduce((acc, value) => {
  //   //   return acc + value.price
  //   // }, 0)

  //   // console.log(totalcart)
  // };

  const initialOptions = {
    "client-id": import.meta.env.VITE_clientId,
    "enable-funding": "paylater,venmo,card",
    "disable-funding": "",
    "data-sdk-integration-source": "integrationbuilder_sc",
  };

  const handleSetCookie = () => {
    setCookie("paypal", "paypal", {
      // path: "/",
      // expires: new Date(2029, 11, 26, 12, 30, 0, 0),
      // maxAge: "1000",
      // path: "https://www.paypal.com/",
      // secure: true,
      // sameSite: "none",
      // domain: "https://www.paypal.com/",
      // httpOnly: true,
      // domain: "www.paypal.com",
      // sameSite: "None",
      // secure: true,
    });
    console.log(cookies);
  };
  if (!token) return <Navigate to="/" />;
  return (
    <section className="min-h-screen payment-page">
      <div className="p-2 md:p-10">
        <form action="" target="paypal"></form>
        <button>
          {/* <link href="https://py.pl/4uHV0Hd3Ctx">Buynow</link> */}
        </button>

        <Link to={"https://py.pl/4uHV0Hd3Ctx"}>Buy now</Link>
        <div>
          <h1 className="font-bold md:text-2xl">Checkout</h1>
          <p className="my-2 text-slate-500 uppercase">billing Address</p>
        </div>
        <h1 className="font-bold md:text-lg my-2">PAYMENT METHOD</h1>
        {/* <button onClick={handleSetCookie}>Set Cookie</button> */}
        {/* <h2>Third-Party Cookies enabled? {status ? "Yes" : "No"}</h2> */}
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            style={{
              shape: "rect",
              layout: "vertical",
            }}
            createOrder={async () => {
              // when users trys to pay only one course it works
              if (cartItem.length === 1) {
                const singleCourse = cartItem[0];
                totalFinalPayment = singleCourse.price;
                courseName = singleCourse.courseName;
                orderDetail.push({
                  courseName,
                  totalFinalPayment,
                  completelyPaid: false,
                  isPending: true,
                });
                // console.log(
                //   "only one course " + courseName + totalFinalPayment
                // );
                // alert(
                //   `${studentName} is trying to buy ${cartItem.length} ${courseName} courses with a total of $${totalFinalPayment}.`
                // );
              } else if (cartItem.length > 1) {
                totalFinalPayment = cartItem.reduce(
                  (acc, cur) => acc + cur.price,
                0
                );
                const allCourses = cartItem.map((course) => course.courseName);
                if (cartItem.length <= 3) {
                  courseName = cartItem
                    .map((course) => course.courseName || course.name)
                    .join(", ");
                } else {
                  const firstCourses = cartItem
                    .slice(0, cartItem.length - 1)
                    .map((course) => course.courseName || course.name)
                    .join(", ");
                  const lastCourse =
                    cartItem[cartItem.length - 1].courseName ||
                    cartItem[cartItem.length - 1].name;
                  courseName = `${firstCourses} and ${lastCourse}`;
                }
                // alert(
                //   `${studentName} is trying to buy ${courseName} courses with a total of $${totalFinalPayment}.`
                // );

                // console.log("more than one course" + cartItem);
              }

              try {
                const response = await fetch(`${api}orders`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  // use the "body" param to optionally pass additional order information
                  // like product ids and quantities
                  body: JSON.stringify({
                    cart: [
                      {
                        studentName: studentName,
                        courseName: courseName,
                        price: totalFinalPayment,
                        id: "YOUR_PRODUCT_ID",
                        quantity: "YOUR_PRODUCT_QUANTITY",
                      },
                    ],
                  }),
                });
                const orderData = await response.json();
                if (orderData.id) {
                  return orderData.id;
                } else {
                  const errorDetail = orderData?.details?.[0];
                  const errorMessage = errorDetail
                    ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                    : JSON.stringify(orderData);
                  throw new Error(errorMessage);
                }
              } catch (error) {
                console.error(error);
                setMessage(`Could not initiate PayPal Checkout...${error}`);
              }
            }}
            onApprove={async (data, actions) => {
              try {
                const response = await fetch(
                  `${api}/orders/${data.orderID}/capture`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                const orderData = await response.json();
                alert("Payment Successfully")
                // clear the cart away to be empty
                localStorage.removeItem("COURSE-CART");
                // Three cases to handle:
                //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                //   (2) Other non-recoverable errors -> Show a failure message
                //   (3) Successful transaction -> Show confirmation or thank you message
                const errorDetail = orderData?.details?.[0];
                if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                  // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                  // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                  return actions.restart();
                } else if (errorDetail) {
                  // (2) Other non-recoverable errors -> Show a failure message
                  throw new Error(
                    `${errorDetail.description} (${orderData.debug_id})`
                  );
                } else {
                  // (3) Successful transaction -> Show confirmation or thank you message
                  // Or go to another URL:  actions.redirect('thank_you.html');
                  const transaction =
                    orderData.purchase_units[0].payments.captures[0];
                  setMessage(
                    `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`
                  );
                  console.log(
                    "Capture result",
                    orderData,
                    JSON.stringify(orderData, null, 2)
                  );
                }
              } catch (error) {
                console.error(error);
                setMessage(
                  `Sorry, your transaction could not be processed...${error}`
                );
              }
            }}
          />
        </PayPalScriptProvider>

        {cookies.name && <h1>Hello {cookies.name}!</h1>}
        <Message content={message} />

        <h1 className="font-black md:text-lg my-3">Order Details</h1>
        <div className="md:col-span-2">
          {cartItem.map((item) => (
            <div key={item.id} className="py-4 px-2">
              <div className="flex items-start gap-2 md:gap-6">
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
                <div className="flex-1">
                  <p className="font-black">{item.courseName || item.name}</p>
                  <p className="text-xs">{item.intro}</p>
                  <p className="text-xs font-medium line-clamp-1">
                    {item.description}
                  </p>
                </div>
                <div>
                  <p className="font-black">${item.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-2 md:p-10">
        <h1 className="font-bold md:text-xl">Summary</h1>
        <div className="flex items-center justify-between my-5">
          <p className="font-bold md:text-md">Original Price</p>
          <p>
            $
            {cartItem
              .map((price) => price.price)
              .reduce((acc, cur) => acc + cur, 0)}
          </p>
        </div>
        <div className="flex items-center justify-between my-5">
          <p className="font-bold md:text-md">Total</p>
          <p className="font-black md:text-lg">
            $
            {cartItem
              .map((price) => price.price)
              .reduce((acc, cur) => acc + cur, 0)}
          </p>
        </div>
        <div>
          <button
            // onClick={checkoutfunction}
            className="duration-300 bg-BLUE hover:bg-white border-2 border-BLUE hover:text-BLUE w-full text-white font-bold py-3 rounded-xl"
          >
            COMPLETE CHECKOUT
          </button>
        </div>
      </div>
    </section>
  );
};
export default PaymentPage;

function Message({ content }) {
  return <p>{content}</p>;
}
