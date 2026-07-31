import { useState, useCallback } from "react";

export const useApi = <T, Args extends any[]>(
  apiFunc: (...args: Args) => Promise<T>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunc(...args);
        setData(result);
        return result;
      } catch (err: any) {
        const errMsg = err.response?.data?.detail || err.message || "An error occurred";
        setError(errMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  return { data, loading, error, request, setData };
};

export default useApi;
