import { createAsyncThunk } from '@reduxjs/toolkit';
import legalService from '../../api/services/legalService';

// Terms & Conditions Thunks
export const fetchTermsConditions = createAsyncThunk(
  'legal/fetchTermsConditions',
  async (type = 'customer', { rejectWithValue }) => {
    try {
      const data = await legalService.getTermsConditions(type);
      return { type, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch terms & conditions' }
      );
    }
  }
);

export const publishTermsConditions = createAsyncThunk(
  'legal/publishTermsConditions',
  async ({ type, content }, { rejectWithValue }) => {
    try {
      const data = await legalService.publishTermsConditions({ type, content });
      return { type, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to publish terms & conditions' }
      );
    }
  }
);

export const toggleTermsStatus = createAsyncThunk(
  'legal/toggleTermsStatus',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      const data = await legalService.toggleTermsStatus(id);
      return { type, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to toggle terms status' }
      );
    }
  }
);

export const restoreTermsVersion = createAsyncThunk(
  'legal/restoreTermsVersion',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      const data = await legalService.restoreTermsVersion(id);
      return { type, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to restore terms version' }
      );
    }
  }
);

// Privacy Policy Thunks
export const fetchPrivacyPolicies = createAsyncThunk(
  'legal/fetchPrivacyPolicies',
  async (type = 'customer', { rejectWithValue }) => {
    try {
      const data = await legalService.getPrivacyPolicies(type);
      return { type, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch privacy policies' }
      );
    }
  }
);

export const publishPrivacyPolicy = createAsyncThunk(
  'legal/publishPrivacyPolicy',
  async ({ type, content }, { rejectWithValue }) => {
    try {
      const data = await legalService.publishPrivacyPolicy({ type, content });
      return { type, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to publish privacy policy' }
      );
    }
  }
);

export const togglePrivacyStatus = createAsyncThunk(
  'legal/togglePrivacyStatus',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      const data = await legalService.togglePrivacyStatus(id);
      return { type, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to toggle privacy status' }
      );
    }
  }
);

export const restorePrivacyVersion = createAsyncThunk(
  'legal/restorePrivacyVersion',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      const data = await legalService.restorePrivacyVersion(id);
      return { type, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to restore privacy version' }
      );
    }
  }
);

// Refund Policy Thunks
export const fetchRefundPolicies = createAsyncThunk(
  'legal/fetchRefundPolicies',
  async (type = 'customer', { rejectWithValue }) => {
    try {
      const data = await legalService.getRefundPolicies(type);
      return { type, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch refund policies' }
      );
    }
  }
);

export const publishRefundPolicy = createAsyncThunk(
  'legal/publishRefundPolicy',
  async ({ type, content }, { rejectWithValue }) => {
    try {
      const data = await legalService.publishRefundPolicy({ type, content });
      return { type, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to publish refund policy' }
      );
    }
  }
);

export const toggleRefundStatus = createAsyncThunk(
  'legal/toggleRefundStatus',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      const data = await legalService.toggleRefundStatus(id);
      return { type, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to toggle refund status' }
      );
    }
  }
);

export const restoreRefundVersion = createAsyncThunk(
  'legal/restoreRefundVersion',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      const data = await legalService.restoreRefundVersion(id);
      return { type, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to restore refund version' }
      );
    }
  }
);

// Support Contact Thunks
export const fetchSupportContact = createAsyncThunk(
  'legal/fetchSupportContact',
  async (_, { rejectWithValue }) => {
    try {
      const data = await legalService.getSupportContact();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch support contact details' }
      );
    }
  }
);

export const updateSupportContact = createAsyncThunk(
  'legal/updateSupportContact',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await legalService.updateSupportContact(payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update support contact details' }
      );
    }
  }
);

