import api from './api';

class LegalService {
  // ── Terms & Conditions APIs ──
  async getTermsConditions(type = 'customer') {
    const response = await api.get('/admin/legal/terms', {
      params: { type },
    });
    return response.data;
  }

  async publishTermsConditions({ type = 'customer', content }) {
    const response = await api.post('/admin/legal/terms', {
      type,
      content,
    });
    return response.data;
  }

  async toggleTermsStatus(id) {
    const response = await api.put(`/admin/legal/terms/${id}/toggle`);
    return response.data;
  }

  async restoreTermsVersion(id) {
    const response = await api.put(`/admin/legal/terms/${id}/restore`);
    return response.data;
  }

  // ── Privacy Policy APIs ──
  async getPrivacyPolicies(type = 'customer') {
    const response = await api.get('/admin/legal/privacy', {
      params: { type },
    });
    return response.data;
  }

  async publishPrivacyPolicy({ type = 'customer', content }) {
    const response = await api.post('/admin/legal/privacy', {
      type,
      content,
    });
    return response.data;
  }

  async togglePrivacyStatus(id) {
    const response = await api.put(`/admin/legal/privacy/${id}/toggle`);
    return response.data;
  }

  async restorePrivacyVersion(id) {
    const response = await api.put(`/admin/legal/privacy/${id}/restore`);
    return response.data;
  }

  // ── Refund Policy APIs ──
  async getRefundPolicies(type = 'customer') {
    const response = await api.get('/admin/legal/refund', {
      params: { type },
    });
    return response.data;
  }

  async publishRefundPolicy({ type = 'customer', content }) {
    const response = await api.post('/admin/legal/refund', {
      type,
      content,
    });
    return response.data;
  }

  async toggleRefundStatus(id) {
    const response = await api.put(`/admin/legal/refund/${id}/toggle`);
    return response.data;
  }

  async restoreRefundVersion(id) {
    const response = await api.put(`/admin/legal/refund/${id}/restore`);
    return response.data;
  }

  // ── Support Contact APIs ──
  async getSupportContact() {
    const response = await api.get('/admin/support-contact');
    return response.data;
  }

  async updateSupportContact(data) {
    const response = await api.put('/admin/support-contact', data);
    return response.data;
  }

  // ── Public Unauthenticated APIs ──
  async getPublicTerms(type = 'customer') {
    const response = await api.get('/public/terms', {
      params: { type },
    });
    return response.data;
  }

  async getPublicPrivacy(type = 'customer') {
    const response = await api.get('/public/privacy', {
      params: { type },
    });
    return response.data;
  }

  async getPublicRefund(type = 'customer') {
    const response = await api.get('/public/refund', {
      params: { type },
    });
    return response.data;
  }

  async getPublicSupportContact() {
    const response = await api.get('/public/support-contact');
    return response.data;
  }
}

export default new LegalService();
