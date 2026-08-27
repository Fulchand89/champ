import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { fetchAnalyticsReportsThunk } from '../store/analytics/analyticsThunk';

/**
 * Custom TanStack Query hook for Analytics & Reports
 * Syncs with Redux Store via Thunk
 */
export const useAnalyticsReports = (params = {}) => {
  const dispatch = useDispatch();

  const queryInfo = useQuery({
    queryKey: ['admin-analytics-reports', params],
    queryFn: async () => {
      const result = await dispatch(fetchAnalyticsReportsThunk(params)).unwrap();
      return result;
    },
    staleTime: 10 * 60 * 1000,      // 10 min — don't re-fetch on every visit
    gcTime: 30 * 60 * 1000,         // 30 min — keep cache alive longer
    placeholderData: (prev) => prev, // show previous data while refetching
    refetchOnMount: false,           // don't re-fetch if cache is fresh
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const analyticsData = queryInfo.data?.data || null;

  return {
    ...queryInfo,
    analyticsData,
    refetchAnalytics: queryInfo.refetch,
  };
};
