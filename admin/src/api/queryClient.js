import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache to prevent redundant API calls
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default queryClient;
