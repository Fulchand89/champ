import { createSlice } from '@reduxjs/toolkit';
import { fetchAnalyticsReportsThunk } from './analyticsThunk';

const initialState = {
  analyticsData: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsReportsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsReportsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.analyticsData = action.payload?.data || null;
      })
      .addCase(fetchAnalyticsReportsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch analytics data';
      });
  },
});

export const { clearAnalyticsError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
