import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { FaClock, FaCreditCard, FaLaptop, FaCheckCircle } from "react-icons/fa";
import { FaCalendarDays } from "react-icons/fa6";
import CartItemContext from "../context/CartItemContext";
import { useStateContext } from "../context/ContextProvider";

const Mentorship = () => {
  const { FullScreen } = useStateContext();
  const { cartItem, setCartItem } = useContext(CartItemContext);
  const navigate = useNavigate();
  const [mentorship, setMentorship] = useState(false);

  const addToCart = (id, name, price) => {
    if (!cartItem.some((item) => item.id === id)) {
      toast.success(`${name} successfully added to cart`);
      setCartItem((prev) => [...prev, { id, name, price }]);
    } else {
      toast.error("Already in the cart");
      setTimeout(() => {
        navigate("/checkout");
      }, 2500);
    }
  };

  useEffect(() => {
    localStorage.setItem("COURSE-CART", JSON.stringify(cartItem));
  }, [cartItem]);

  return (
    <>
      <section className="bg-BLUE text-white text-center pt-48 py-24 px-4 md:px-10">
        <h1 className="font-bold text-3xl md:text-5xl mb-4">
          Break into Cybersecurity/Splunk in 14 Weeks with 1-on-1 Mentorship
        </h1>
        <p className="max-w-2xl mx-auto text-sm md:text-lg">
          Hands-on 1-on-1 mentorship, labs, resume + LinkedIn prep, and interview
          coaching designed for beginners and career-changers.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => addToCart(111, "Standard Mentorship", 500)}
            className="bg-white text-BLUE font-bold px-6 py-3 rounded-lg hover:bg-gray-200"
          >
            Apply for Mentorship
          </button>
          <a
            href="#pricing"
            className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-BLUE font-bold"
          >
            View Curriculum & Pricing
          </a>
        </div>
        <div className="flex justify-center gap-6 mt-10 text-sm opacity-90">
          <p>Trained 200+ learners</p>
          <p>5+ years mentoring</p>
          <p>Avg time to offer: 8–12 weeks</p>
        </div>
      </section>

      {/* Offer Definition */}
      <section className="p-4 md:p-10 text-center">
        <h2 className="text-2xl md:text-4xl font-bold mb-6">
          What You’ll Get
        </h2>
        <ul className="text-left max-w-2xl mx-auto space-y-3 text-gray-700">
          {[
            "Weekly 1:1 mentorship sessions (Zoom)",
            "Splunk & cybersecurity labs with Git repo access",
            "Resume + LinkedIn overhaul",
            "Mock interviews (behavioral + technical)",
            "Asynchronous mentor support via Slack/Discord (48-hr response)",
            "Job search playbook + referral guidance",
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <FaCheckCircle className="text-BLUE" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Process Section */}
      <section className="bg-gray-100 py-16 px-4 md:px-10">
        <h2 className="text-center text-2xl md:text-4xl font-bold mb-10">
          How It Works
        </h2>
        <div className="grid md:grid-cols-6 grid-cols-2 gap-6 text-center text-sm md:text-base font-medium">
          {[
            "Apply",
            "Free Intro Call",
            "Skills Baseline",
            "Customized Plan",
            "Weekly Sessions",
            "Interview & Offer",
          ].map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <span className="text-BLUE font-bold text-lg mb-2">
                {idx + 1}.
              </span>
              {step}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="p-4 md:p-10 text-center">
        <h2 className="text-2xl md:text-4xl font-bold mb-8">Success Stories</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              quote:
                "Landed a SOC Analyst role in just 7 weeks — coming from customer service!",
              name: "K.O.",
              title: "SOC Analyst",
            },
            {
              quote:
                "The mentorship helped me break into Splunk Admin role with confidence.",
              name: "V.D.",
              title: "Splunk Admin",
            },
            {
              quote:
                "From zero IT experience to job-ready in 5 weeks. The labs and 1:1 sessions were game-changers.",
              name: "M.A.",
              title: "Cybersecurity Analyst",
            },
          ].map((t, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md"
            >
              <p className="italic mb-4">“{t.quote}”</p>
              <p className="font-bold">{t.name}</p>
              <p className="text-sm text-gray-600">{t.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-BLUE text-white py-16 px-4 md:px-10">
        <h2 className="text-center text-2xl md:text-4xl font-bold mb-10">
          Pricing & Plans
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              id: 110,
              name: "Starter",
              price: 300,
              duration: "4 Weeks",
              includes: [
                "Basic mentorship + resume help",
                "2 mock interviews",
                "Access to community chat",
              ],
            },
            {
              id: 111,
              name: "Standard",
              price: 500,
              duration: "5 Weeks",
              includes: [
                "Full mentorship + labs",
                "Resume + LinkedIn review",
                "Weekly 1:1 calls + Slack support",
              ],
            },
            {
              id: 112,
              name: "Pro / Placement",
              price: 750,
              duration: "8 Weeks",
              includes: [
                "Ongoing support until job offer",
                "Advanced Splunk projects",
                "Job referral + interview prep",
              ],
            },
          ].map((plan) => (
            <div
              key={plan.id}
              className="bg-white text-BLUE rounded-2xl p-6 shadow-md flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-3">{plan.duration}</p>
                <p className="text-3xl font-extrabold mb-4">${plan.price}</p>
                <ul className="text-sm space-y-2 mb-6">
                  {plan.includes.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <FaCheckCircle className="text-BLUE" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => addToCart(plan.id, plan.name, plan.price)}
                className="mt-auto bg-BLUE text-white border-2 border-BLUE hover:bg-white hover:text-BLUE font-bold px-4 py-2 rounded-lg"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="p-4 md:p-10 bg-gray-100">
        <h2 className="text-center text-2xl md:text-4xl font-bold mb-8">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-6 text-gray-700 text-sm md:text-base">
          <div>
            <h4 className="font-semibold">
              How long until I’m job-ready?
            </h4>
            <p>Most mentees become job-ready within 8–12 weeks depending on prior experience.</p>
          </div>
          <div>
            <h4 className="font-semibold">
              What if I miss a session?
            </h4>
            <p>You can reschedule or receive a bonus asynchronous review that week.</p>
          </div>
          <div>
            <h4 className="font-semibold">
              Do you help with Splunk certifications?
            </h4>
            <p>Yes! We provide certification guidance and practice labs.</p>
          </div>
          <div>
            <h4 className="font-semibold">
              I’m new to IT — am I eligible?
            </h4>
            <p>Absolutely. The mentorship is beginner-friendly and personalized to your pace.</p>
          </div>
          <div>
            <h4 className="font-semibold">
              Do you offer refunds?
            </h4>
            <p>Yes, we offer deferral or partial refund options if mentorship is canceled early.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-16">
        <h2 className="text-2xl md:text-4xl font-bold mb-4">
          Ready to Start Your Cybersecurity Career?
        </h2>
        <button
          onClick={() => addToCart(111, "Standard Mentorship", 500)}
          className="bg-BLUE text-white font-bold px-6 py-3 rounded-lg hover:bg-white hover:text-BLUE border-2 border-BLUE"
        >
          Apply for Mentorship
        </button>
      </section>

      <Toaster position="top-center" />
    </>
  );
};

export default Mentorship;
