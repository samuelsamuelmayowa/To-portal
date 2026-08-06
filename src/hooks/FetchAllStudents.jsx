import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useStateContext } from "../context/ContextProvider";

const API_BASE = String(
  import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_HOME_OO ||
    "",
).replace(/\/$/, "");

function resolveToken(token) {
  if (typeof token === "string") {
    return token;
  }

  return (
    token?.token ||
    token?.accessToken ||
    token?.idToken ||
    ""
  );
}

const FetchAllStudents = () => {
  const { token } = useStateContext();

  const [data, setData] = useState({
    data: {
      response: [],
      total: 0,
    },
  });

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState(null);

  const fetchStudents = useCallback(
    async () => {
      const authToken = resolveToken(token);

      if (!API_BASE) {
        setError(
          new Error(
            "The Render backend URL is missing.",
          ),
        );

        setIsLoading(false);
        return;
      }

      if (!authToken) {
        setError(
          new Error(
            "Your administrator login token is missing.",
          ),
        );

        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://to-backendapi-v1.onrender.com/api/admin/students?limit=500`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          },
        );

        let result = null;

        try {
          result = await response.json();
        } catch {
          result = null;
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load students.",
          );
        }

        setData({
          data: {
            response: Array.isArray(
              result?.response,
            )
              ? result.response
              : [],
            total:
              Number(result?.total) || 0,
          },
        });
      } catch (requestError) {
        console.error(
          "Failed to fetch all students:",
          requestError,
        );

        setError(requestError);

        setData({
          data: {
            response: [],
            total: 0,
          },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStudents,
  };
};

export default FetchAllStudents;
// import axios from 'axios'
// import {
//     useQuery,
// } from '@tanstack/react-query';


// const FetchAllStudents = () => {
//   return useQuery({
//     queryKey: ["students"],
//     queryFn: ()=> axios.get("https://to-backendapi-v1.onrender.com/api/show")
//   })
  
// }

// export default FetchAllStudents