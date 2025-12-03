import PropTypes from "prop-types";
import { MdCall } from "react-icons/md";
import { IoMdMail } from "react-icons/io";
import { FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa";
import { useStateContext } from "../context/ContextProvider";
import { NavLink } from "react-router-dom";
const Footer = ({ black }) => {
  const { token } = useStateContext();
  return (
    <footer className={`${black} border-t border-gray-300 dark:border-gray-700`}>
      <div className="max-w-7xl mx-auto w-full px-6 md:px-10 lg:px-20 py-12">
        {/* MAIN GRID */}
        <div className="grid gap-10 md:grid-cols-3 items-start">
          {/* CALL */}
          <div className="space-y-3 text-center md:text-left">
            {/* <h1 className="text-xl font-bold text-white flex justify-center md:justify-start items-center gap-2"> */}
              {/* <MdCall size={24} className="hover:animate-bounce" /> CALL */}
            {/* </h1> */}
            <a
              href="tel:443-768-8416"
              className="block font-bold text-lg md:text-2xl hover:text-BLUE duration-300"
            >
              {/* 443-768-8416 */}
            </a>
            {/* <p className="font-light text-sm md:text-base">Get instant response</p> */}
          </div>

          {/* EMAIL */}
          <div className="space-y-3  md:text-left">
            <h1 className="text-xl font-bold text-white flex justify-center md:justify-start items-center gap-2">
              <IoMdMail size={24} className="hover:animate-bounce" /> EMAIL
            </h1>
            <a
              href="mailto:t.oanalyticsllc@gmail.com"
              className="block font-bold text-md md:text-xl hover:text-BLUE duration-300"
            >
              t.oanalyticsllc@gmail.com
            </a>
            <p className="font-light text-sm md:text-base">
              Get response within 24 hours
            </p>
          </div>

          {/* USEFUL LINKS (Right-Aligned) */}
          {token && (
            <div className="space-y-3 text-center md:text-right">
              <h1 className="font-bold text-xl mb-2">Useful Links</h1>
              <ul className="space-y-1">
                {[
                  { name: "About", to: "/about" },
                  { name: "Blog", to: "/blog" },
                  { name: "Contact", to: "/contact" },
                  { name: "Career", to: "/career" },
                
                ].map((link) => (
                  <li key={link.name}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `inline-block transition-transform duration-300 hover:text-BLUE ${
                          isActive
                            ? "font-black text-BLUE scale-110"
                            : "scale-100 text-gray-700 dark:text-gray-300"
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className="border-t border-gray-300 dark:border-gray-700 my-8"></div>

        {/* SOCIAL + COPYRIGHT */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-center text-xs md:text-sm font-medium tracking-wide">
            <span className="font-light text-lg md:text-2xl align-middle">&copy;</span>{" "}
            T.O Analytics {new Date().getFullYear()}, All Rights Reserved
          </p>

          <div className="flex gap-5 text-gray-600 dark:text-gray-400 text-xl">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-BLUE transition-colors duration-300"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-BLUE transition-colors duration-300"
            >
              <FaTwitter />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-BLUE transition-colors duration-300"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  black: PropTypes.string,
};

export default Footer;




// import PropTypes from 'prop-types';
// import { MdCall } from "react-icons/md";
// import { IoMdMail } from "react-icons/io"

// import { useStateContext } from '../context/ContextProvider';
// import { NavLink } from 'react-router-dom';


// const Footer = ({black}) => {
//     const { token } = useStateContext();
//   return (
//     <footer className={`${black}`}>
//         <div className="p-2 md:px-10 py-10 md:py-8 flex items-center lg:items-start flex-col gap-10 md:flex-row md:justify-between">
//             <div className="group text-center md:leading-8 leading-6">
//                 <h1 className="md:text-xl text-BLUE font-bold flex justify-center gap-2 items-center"> <MdCall size={30} className='group-hover:animate-bounce' />CALL</h1>
//                 <a href="tel:443-768-8416">
//                     <p className="font-black text-md md:text-2xl duration-300 hover:text-BLUE">443-768-8416</p>
//                 </a>
//                 <p className="font-light text-sm md:text-base">Get instant response</p>
//             </div>
//             <div className="group text-center md:leading-8 leading-6">
//                 <h1 className="md:text-xl text-BLUE font-bold flex justify-center gap-2 items-center"><IoMdMail size={30} className='group-hover:animate-bounce' /> EMAIL</h1>
//                 <a href="mailto:t.oanalyticsllc@gmail.com">
//                     <p className="font-black text-md md:text-xl duration-300 hover:text-BLUE">t.oanalyticsllc@gmail.com</p>
//                 </a>
//                 <p className="font-light text-sm md:text-base">Get response within 24 hours</p>
//             </div>
//             {token && 
//             <div className='text-center lg:text-left'>
//                 <h1 className='font-bold'>Useful Links</h1>
//                 <ul>
//                     <li>
//                         <NavLink className={({isActive})=> isActive ? "font-black text-BLUE scale-110" : "scale-100 hover:text-BLUE"} to="/about">About</NavLink>
//                     </li>
//                     <li>
//                         <NavLink className={({isActive})=> isActive ? "font-black text-BLUE scale-110" : "scale-100 hover:text-BLUE"} to="/blog">Blog</NavLink>
//                     </li>
//                     <li>
//                         <NavLink className={({isActive})=> isActive ? "font-black text-BLUE scale-110" : "scale-100 hover:text-BLUE"} to="/contact">Contact</NavLink>
//                     </li>
//                     <li>
//                         <NavLink to="/career" className={({isActive})=> isActive ? "font-black text-BLUE scale-110" : "scale-100 hover:text-BLUE"}>Career</NavLink>
//                     </li>
//                     <li>
//                         <NavLink to="/partner" className={({isActive})=> isActive ? "font-black text-BLUE scale-110" : "scale-100 hover:text-BLUE"}>Partners</NavLink>
//                     </li>
//                 </ul>
//             </div>
//             }
//         </div>
//         <div className="">
//             <p className="flex items-center justify-center gap-2 text-center text-xs md:text-base font-medium tracking-wide"><span className="font-extralight text-xl md:text-3xl">&copy;</span> T.O Analytics {(new Date()).getFullYear()}, All Rights Reserved</p>
//         </div>
//     </footer>
//   )
// }

// Footer.propTypes = {
//     black: PropTypes.string,
// };

// export default Footer;