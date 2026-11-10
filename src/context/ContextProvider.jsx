import { createContext, useContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { cookieAuthApi } from "../lib/cookieAuth";

const StateContext = createContext({
    user: null,
    token: null,
    authLoading: true,
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
    const [user, setUser] = useState(null);
    const [token, _setToken] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const authRequestVersion = useRef(0);
    const [FullScreen, setFullScreen] = useState(false);
    const [theme, setTheme] = useState(
        () => (localStorage.getItem(storageKey)) || defaultTheme
    )

    useEffect(() => {
        try { localStorage.removeItem("ACCESS_TOKEN"); } catch { /* storage may be unavailable */ }
        const requestVersion = authRequestVersion.current;
        cookieAuthApi.get("/api/session", { headers: { "Cache-Control": "no-store" } })
            .then(({ data }) => {
                if (authRequestVersion.current !== requestVersion) return;
                _setToken(data?.authenticated === true);
                setUser(data?.authenticated === true ? data.user : null);
            })
            .catch(() => {
                if (authRequestVersion.current !== requestVersion) return;
                _setToken(false);
                setUser(null);
            })
            .finally(() => {
                if (authRequestVersion.current === requestVersion) setAuthLoading(false);
            });
    }, []);

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
    const setToken = (authenticated) => {
        authRequestVersion.current += 1;
        _setToken(Boolean(authenticated));
        setAuthLoading(false);
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
            authLoading,
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
