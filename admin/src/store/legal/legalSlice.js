import { createSlice } from '@reduxjs/toolkit';
import {
  fetchTermsConditions,
  publishTermsConditions,
  toggleTermsStatus,
  restoreTermsVersion,
  fetchPrivacyPolicies,
  publishPrivacyPolicy,
  togglePrivacyStatus,
  restorePrivacyVersion,
  fetchRefundPolicies,
  publishRefundPolicy,
  toggleRefundStatus,
  restoreRefundVersion,
  fetchSupportContact,
  updateSupportContact,
} from './legalThunk';

const initialState = {
  terms: {
    customer: { active: null, history: [] },
    driver: { active: null, history: [] },
    loading: false,
    publishing: false,
    error: null,
  },
  privacy: {
    customer: { active: null, history: [] },
    driver: { active: null, history: [] },
    loading: false,
    publishing: false,
    error: null,
  },
  refund: {
    customer: { active: null, history: [] },
    driver: { active: null, history: [] },
    loading: false,
    publishing: false,
    error: null,
  },
  supportContact: {
    data: null,
    loading: false,
    updating: false,
    error: null,
  },
};

const legalSlice = createSlice({
  name: 'legal',
  initialState,
  reducers: {
    clearLegalError: (state) => {
      state.terms.error = null;
      state.privacy.error = null;
      state.refund.error = null;
      state.supportContact.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH TERMS
      .addCase(fetchTermsConditions.pending, (state) => {
        state.terms.loading = true;
        state.terms.error = null;
      })
      .addCase(fetchTermsConditions.fulfilled, (state, action) => {
        state.terms.loading = false;
        const { type, data } = action.payload || {};
        if (data && state.terms[type]) {
          state.terms[type].active = data.active;
          state.terms[type].history = data.history || [];
        }
      })
      .addCase(fetchTermsConditions.rejected, (state, action) => {
        state.terms.loading = false;
        state.terms.error = action.payload?.message || 'Failed to load terms';
      })
      // PUBLISH TERMS
      .addCase(publishTermsConditions.pending, (state) => {
        state.terms.publishing = true;
      })
      .addCase(publishTermsConditions.fulfilled, (state, action) => {
        state.terms.publishing = false;
        const { type, data } = action.payload || {};
        if (data && state.terms[type]) {
          state.terms[type].active = data;
          state.terms[type].history = [
            data,
            ...state.terms[type].history.map((h) => ({ ...h, isActive: false, status: 'Archived' })),
          ];
        }
      })
      .addCase(publishTermsConditions.rejected, (state, action) => {
        state.terms.publishing = false;
        state.terms.error = action.payload?.message || 'Failed to publish terms';
      })
      // TOGGLE / RESTORE TERMS
      .addCase(toggleTermsStatus.fulfilled, (state, action) => {
        const { type, data } = action.payload || {};
        if (data && state.terms[type]) {
          state.terms[type].active = data.active;
          state.terms[type].history = data.history || [];
        }
      })
      .addCase(restoreTermsVersion.fulfilled, (state, action) => {
        const { type, data } = action.payload || {};
        if (data && state.terms[type]) {
          state.terms[type].active = data.active;
          state.terms[type].history = data.history || [];
        }
      })

      // FETCH PRIVACY
      .addCase(fetchPrivacyPolicies.pending, (state) => {
        state.privacy.loading = true;
        state.privacy.error = null;
      })
      .addCase(fetchPrivacyPolicies.fulfilled, (state, action) => {
        state.privacy.loading = false;
        const { type, data } = action.payload || {};
        if (data && state.privacy[type]) {
          state.privacy[type].active = data.active;
          state.privacy[type].history = data.history || [];
        }
      })
      .addCase(fetchPrivacyPolicies.rejected, (state, action) => {
        state.privacy.loading = false;
        state.privacy.error = action.payload?.message || 'Failed to load privacy policy';
      })
      // PUBLISH PRIVACY
      .addCase(publishPrivacyPolicy.pending, (state) => {
        state.privacy.publishing = true;
      })
      .addCase(publishPrivacyPolicy.fulfilled, (state, action) => {
        state.privacy.publishing = false;
        const { type, data } = action.payload || {};
        if (data && state.privacy[type]) {
          state.privacy[type].active = data;
          state.privacy[type].history = [
            data,
            ...state.privacy[type].history.map((h) => ({ ...h, isActive: false, status: 'Archived' })),
          ];
        }
      })
      .addCase(publishPrivacyPolicy.rejected, (state, action) => {
        state.privacy.publishing = false;
        state.privacy.error = action.payload?.message || 'Failed to publish privacy policy';
      })
      // TOGGLE / RESTORE PRIVACY
      .addCase(togglePrivacyStatus.fulfilled, (state, action) => {
        const { type, data } = action.payload || {};
        if (data && state.privacy[type]) {
          state.privacy[type].active = data.active;
          state.privacy[type].history = data.history || [];
        }
      })
      .addCase(restorePrivacyVersion.fulfilled, (state, action) => {
        const { type, data } = action.payload || {};
        if (data && state.privacy[type]) {
          state.privacy[type].active = data.active;
          state.privacy[type].history = data.history || [];
        }
      })

      // FETCH REFUND
      .addCase(fetchRefundPolicies.pending, (state) => {
        state.refund.loading = true;
        state.refund.error = null;
      })
      .addCase(fetchRefundPolicies.fulfilled, (state, action) => {
        state.refund.loading = false;
        const { type, data } = action.payload || {};
        if (data && state.refund[type]) {
          state.refund[type].active = data.active;
          state.refund[type].history = data.history || [];
        }
      })
      .addCase(fetchRefundPolicies.rejected, (state, action) => {
        state.refund.loading = false;
        state.refund.error = action.payload?.message || 'Failed to load refund policy';
      })
      // PUBLISH REFUND
      .addCase(publishRefundPolicy.pending, (state) => {
        state.refund.publishing = true;
      })
      .addCase(publishRefundPolicy.fulfilled, (state, action) => {
        state.refund.publishing = false;
        const { type, data } = action.payload || {};
        if (data && state.refund[type]) {
          state.refund[type].active = data;
          state.refund[type].history = [
            data,
            ...state.refund[type].history.map((h) => ({ ...h, isActive: false, status: 'Archived' })),
          ];
        }
      })
      .addCase(publishRefundPolicy.rejected, (state, action) => {
        state.refund.publishing = false;
        state.refund.error = action.payload?.message || 'Failed to publish refund policy';
      })
      // TOGGLE / RESTORE REFUND
      .addCase(toggleRefundStatus.fulfilled, (state, action) => {
        const { type, data } = action.payload || {};
        if (data && state.refund[type]) {
          state.refund[type].active = data.active;
          state.refund[type].history = data.history || [];
        }
      })
      .addCase(restoreRefundVersion.fulfilled, (state, action) => {
        const { type, data } = action.payload || {};
        if (data && state.refund[type]) {
          state.refund[type].active = data.active;
          state.refund[type].history = data.history || [];
        }
      })

      // SUPPORT CONTACT
      .addCase(fetchSupportContact.pending, (state) => {
        state.supportContact.loading = true;
        state.supportContact.error = null;
      })
      .addCase(fetchSupportContact.fulfilled, (state, action) => {
        state.supportContact.loading = false;
        state.supportContact.data = action.payload?.data || null;
      })
      .addCase(fetchSupportContact.rejected, (state, action) => {
        state.supportContact.loading = false;
        state.supportContact.error = action.payload?.message || 'Failed to fetch support contact';
      })
      .addCase(updateSupportContact.pending, (state) => {
        state.supportContact.updating = true;
        state.supportContact.error = null;
      })
      .addCase(updateSupportContact.fulfilled, (state, action) => {
        state.supportContact.updating = false;
        state.supportContact.data = action.payload?.data || null;
      })
      .addCase(updateSupportContact.rejected, (state, action) => {
        state.supportContact.updating = false;
        state.supportContact.error = action.payload?.message || 'Failed to update support contact';
      });
  },
});

export const { clearLegalError } = legalSlice.actions;
export default legalSlice.reducer;
