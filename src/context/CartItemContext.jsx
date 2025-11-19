import { createContext, useState, useEffect } from "react";
import COURSES from "../coursesAPI/api";
import { toast } from "sonner";
import { useStateContext } from "./ContextProvider";

const CartItemContext = createContext({});

export const CartItemProvider = ({ children }) => {
    const { token } = useStateContext();
    const [cartItem, setCartItem] = useState(() => {
        if (localStorage.getItem("COURSE-CART"))
            return JSON.parse(localStorage.getItem("COURSE-CART")) || [];
    });
    const addToCart = (data) => {
        if (!cartItem.some((item) => item.id === data.id)) {
            toast.success(`Successfully added to cart`);
            setCartItem((prev) => [...prev, data]);
        }
    }

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem("COURSE-CART")) || [];
        setCartItem(items);
    }, [])

    return (
        <CartItemContext.Provider
            value={{
                COURSES,
                token,
                cartItem,
                addToCart,
                setCartItem,
            }}
        >
            {children}
        </CartItemContext.Provider>
    );
};


export default CartItemContext;