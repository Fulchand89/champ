import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import legalReducer from './legal/legalSlice';
import analyticsReducer from './analytics/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    legal: legalReducer,
    analytics: analyticsReducer,
  },
});

export default store;
