import { useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

const useApi = () => {
  const { getToken } = useAuth();

  const call = useCallback(
    async (path, options = {}) => {
      const token = await getToken();
      const headers = new Headers(options.headers || {});

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has('Content-Type')
      ) {
        headers.set('Content-Type', 'application/json');
      }

      return fetch(path, {
        ...options,
        headers,
      });
    },
    [getToken]
  );

  return { call };
};

export default useApi;
