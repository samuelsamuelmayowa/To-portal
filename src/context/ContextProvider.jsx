// import { createContext, useContext, useState, useEffect } from "react";
// import PropTypes from "prop-types";

// const StateContext = createContext({
//   user: null,
//   token: null,
//   setUser: () => {},
//   setToken: () => {},
//   isDesktop: false,
//   setIsDesktop: () => {},
//   theme: "system",
//   setTheme: () => {},
// });

// export const ContextProvider = ({
//   children,
//   defaultTheme = "system",
//   storageKey = "vite-ui-theme",
// }) => {
//   const [user, setUser] = useState({});
//   const [token, _setToken] = useState(() => localStorage.getItem("ACCESS_TOKEN") || "");
//   const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
//   const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) || defaultTheme);

//   // 🧠 Theme Handler
//   useEffect(() => {
//     const root = window.document.documentElement;
//     root.classList.remove("light", "dark");

//     if (theme === "system") {
//       const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
//         ? "dark"
//         : "light";
//       root.classList.add(systemTheme);
//     } else {
//       root.classList.add(theme);
//     }
//   }, [theme]);

//   // 💾 Token setter
//   const setToken = (token) => {
//     _setToken(token);
//     if (token) {
//       localStorage.setItem("ACCESS_TOKEN", token);
//     } else {
//       localStorage.removeItem("ACCESS_TOKEN");
//     }
//   };

//   // 🖥 Responsive screen watcher
//   useEffect(() => {
//     const handleResize = () => {
//       setIsDesktop(window.innerWidth > 1024);
//     };
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <StateContext.Provider
//       value={{
//         user,
//         token,
//         setUser,
//         setToken,
//         isDesktop,
//         setIsDesktop,
//         theme,
//         setTheme: (t) => {
//           localStorage.setItem(storageKey, t);
//           setTheme(t);
//         },
//       }}
//     >
//       {children}
//     </StateContext.Provider>
//   );
// };

// ContextProvider.propTypes = {
//   children: PropTypes.node,
//   defaultTheme: PropTypes.string,
//   storageKey: PropTypes.string,
// };

// export const useStateContext = () => useContext(StateContext);


import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const StateContext = createContext({
    user: null,
    token: null,
    setUser: () => { },
    setToken: () => { },
    FullScreen: null,
    setFullScreen: () => { }
});

export const ContextProvider = ({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    ...props

}) => {
    const [user, setUser] = useState({});
    const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
    const [FullScreen, setFullScreen] = useState(false);
    const [theme, setTheme] = useState(
        () => (localStorage.getItem(storageKey)) || defaultTheme
    )

    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
            return
        }

        root.classList.add(theme)
    }, [theme])

    const VALUE = {
        theme,
        setTheme: (theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
    }
    const setToken = (token) => {
        _setToken(token)
        if (token) {
            localStorage.setItem("ACCESS_TOKEN", token);
        } else {
            localStorage.removeItem("ACCESS_TOKEN")
        }
    }
    useEffect(() => {
        const handleResize = () => {
            const size = window.innerWidth;
            size > 1024 ? setFullScreen(true) : setFullScreen(false)
        }
        handleResize()

        window.addEventListener("resize", handleResize)

        return () => window.removeEventListener("resize", handleResize)
    }, [FullScreen])
    return (
        <StateContext.Provider {...props} value={{
            user,
            token,
            setUser,
            setToken,
            FullScreen,
            ...VALUE
        }}>
            {children}
        </StateContext.Provider>
    )
}

ContextProvider.propTypes = {
    children: PropTypes.node,
    defaultTheme: PropTypes.string,
    storageKey: PropTypes.string
};

export const useStateContext = () => useContext(StateContext)