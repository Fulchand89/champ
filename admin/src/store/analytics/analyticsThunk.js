import { createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../api/services/analyticsService';

/**
 * Thunk to fetch analytics reports data
 */
export const fetchAnalyticsReportsThunk = createAsyncThunk(
  'analytics/fetchReports',
  async (params, { rejectWithValue }) => {
    try {
      const data = await analyticsService.getAnalyticsReports(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);
