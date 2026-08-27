const fs = require('fs');
const path = require('path');
const asyncHandler = require('../shared/utils/asyncHandler');
const { getIO } = require('../config/socket');

const legalFilePath = path.join(__dirname, '../database/legal.json');
const supportContactFilePath = path.join(__dirname, '../database/support_contact.json');

// Helper to read JSON files safely
const readJsonFile = (filePath, defaultData = {}) => {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultData;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return defaultData;
  }
};

// Helper to write JSON files safely
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════════
// 1. TERMS & CONDITIONS CONTROLLERS
// ═══════════════════════════════════════════════════════════════════

const getTerms = asyncHandler(async (req, res) => {
  const type = req.query.type || 'customer';
  const legalData = readJsonFile(legalFilePath, { terms: {} });
  const categoryData = legalData.terms?.[type] || { active: null, history: [] };

  res.status(200).json({
    success: true,
    message: 'Terms fetched successfully',
    data: categoryData
  });
});

const publishTerms = asyncHandler(async (req, res) => {
  const { type = 'customer', content } = req.body;
  if (!content) {
    return res.status(400).json({ success: false, message: 'Content is required' });
  }

  const legalData = readJsonFile(legalFilePath, { terms: {}, privacy: {}, refund: {} });
  if (!legalData.terms) legalData.terms = {};
  if (!legalData.terms[type]) legalData.terms[type] = { active: null, history: [] };

  const history = legalData.terms[type].history || [];
  const nextId = history.length > 0 ? Math.max(...history.map(h => h.id || 0)) + 1 : 1;
  const version = `v1.0.${nextId}`;

  // Archive previous versions
  history.forEach(h => {
    h.isActive = false;
    h.status = 'Archived';
  });

  const newTerms = {
    id: nextId,
    version,
    content,
    isActive: true,
    status: 'Active',
    publishedAt: new Date().toISOString(),
    publishedBy: req.user?.name || 'System Admin'
  };

  history.unshift(newTerms);
  legalData.terms[type] = {
    active: newTerms,
    history
  };

  writeJsonFile(legalFilePath, legalData);

  try {
    const io = getIO();
    io.emit('legal_policy_updated', { category: 'terms', type, active: newTerms });
  } catch (err) {
    // Socket not active or initialized
  }

  res.status(200).json({
    success: true,
    message: 'Terms published successfully',
    data: newTerms
  });
});

const toggleTermsStatus = asyncHandler(async (req, res) => {
  const numericId = parseInt(req.params.id, 10);
  const legalData = readJsonFile(legalFilePath, { terms: {} });

  for (const type of ['customer', 'driver']) {
    const history = legalData.terms?.[type]?.history || [];
    const item = history.find(h => h.id === numericId);
    if (item) {
      item.isActive = !item.isActive;
      item.status = item.isActive ? 'Active' : 'Draft';

      if (item.isActive) {
        history.forEach(h => {
          if (h.id !== numericId) {
            h.isActive = false;
            h.status = 'Archived';
          }
        });
        legalData.terms[type].active = item;
      } else {
        if (legalData.terms[type].active?.id === numericId) {
          legalData.terms[type].active = null;
        }
      }

      writeJsonFile(legalFilePath, legalData);

      return res.status(200).json({
        success: true,
        message: 'Terms status toggled successfully',
        data: {
          active: legalData.terms[type].active,
          history
        }
      });
    }
  }

  res.status(404).json({ success: false, message: 'Version not found' });
});

const restoreTermsVersion = asyncHandler(async (req, res) => {
  const numericId = parseInt(req.params.id, 10);
  const legalData = readJsonFile(legalFilePath, { terms: {} });

  for (const type of ['customer', 'driver']) {
    const history = legalData.terms?.[type]?.history || [];
    const item = history.find(h => h.id === numericId);
    if (item) {
      history.forEach(h => {
        h.isActive = false;
        h.status = 'Archived';
      });

      item.isActive = true;
      item.status = 'Active';
      legalData.terms[type].active = item;

      writeJsonFile(legalFilePath, legalData);

      return res.status(200).json({
        success: true,
        message: 'Version restored successfully',
        data: {
          active: item,
          history
        }
      });
    }
  }

  res.status(404).json({ success: false, message: 'Version not found' });
});

// ═══════════════════════════════════════════════════════════════════
// 2. PRIVACY POLICY CONTROLLERS
// ═══════════════════════════════════════════════════════════════════

const getPrivacy = asyncHandler(async (req, res) => {
  const type = req.query.type || 'customer';
  const legalData = readJsonFile(legalFilePath, { privacy: {} });
  const categoryData = legalData.privacy?.[type] || { active: null, history: [] };

  res.status(200).json({
    success: true,
    message: 'Privacy policies fetched successfully',
    data: categoryData
  });
});

const publishPrivacy = asyncHandler(async (req, res) => {
  const { type = 'customer', content } = req.body;
  if (!content) {
    return res.status(400).json({ success: false, message: 'Content is required' });
  }

  const legalData = readJsonFile(legalFilePath, { terms: {}, privacy: {}, refund: {} });
  if (!legalData.privacy) legalData.privacy = {};
  if (!legalData.privacy[type]) legalData.privacy[type] = { active: null, history: [] };

  const history = legalData.privacy[type].history || [];
  const nextId = history.length > 0 ? Math.max(...history.map(h => h.id || 0)) + 1 : 1;
  const version = `v1.0.${nextId}`;

  // Archive previous versions
  history.forEach(h => {
    h.isActive = false;
    h.status = 'Archived';
  });

  const newPolicy = {
    id: nextId,
    version,
    content,
    isActive: true,
    status: 'Active',
    publishedAt: new Date().toISOString(),
    publishedBy: req.user?.name || 'System Admin'
  };

  history.unshift(newPolicy);
  legalData.privacy[type] = {
    active: newPolicy,
    history
  };

  writeJsonFile(legalFilePath, legalData);

  try {
    const io = getIO();
    io.emit('legal_policy_updated', { category: 'privacy', type, active: newPolicy });
  } catch (err) {
    // Socket not active or initialized
  }

  res.status(200).json({
    success: true,
    message: 'Privacy policy published successfully',
    data: newPolicy
  });
});

const togglePrivacyStatus = asyncHandler(async (req, res) => {
  const numericId = parseInt(req.params.id, 10);
  const legalData = readJsonFile(legalFilePath, { privacy: {} });

  for (const type of ['customer', 'driver']) {
    const history = legalData.privacy?.[type]?.history || [];
    const item = history.find(h => h.id === numericId);
    if (item) {
      item.isActive = !item.isActive;
      item.status = item.isActive ? 'Active' : 'Draft';

      if (item.isActive) {
        history.forEach(h => {
          if (h.id !== numericId) {
            h.isActive = false;
            h.status = 'Archived';
          }
        });
        legalData.privacy[type].active = item;
      } else {
        if (legalData.privacy[type].active?.id === numericId) {
          legalData.privacy[type].active = null;
        }
      }

      writeJsonFile(legalFilePath, legalData);

      return res.status(200).json({
        success: true,
        message: 'Privacy policy status toggled successfully',
        data: {
          active: legalData.privacy[type].active,
          history
        }
      });
    }
  }

  res.status(404).json({ success: false, message: 'Version not found' });
});

const restorePrivacyVersion = asyncHandler(async (req, res) => {
  const numericId = parseInt(req.params.id, 10);
  const legalData = readJsonFile(legalFilePath, { privacy: {} });

  for (const type of ['customer', 'driver']) {
    const history = legalData.privacy?.[type]?.history || [];
    const item = history.find(h => h.id === numericId);
    if (item) {
      history.forEach(h => {
        h.isActive = false;
        h.status = 'Archived';
      });

      item.isActive = true;
      item.status = 'Active';
      legalData.privacy[type].active = item;

      writeJsonFile(legalFilePath, legalData);

      return res.status(200).json({
        success: true,
        message: 'Version restored successfully',
        data: {
          active: item,
          history
        }
      });
    }
  }

  res.status(404).json({ success: false, message: 'Version not found' });
});

// ═══════════════════════════════════════════════════════════════════
// 3. REFUND POLICY CONTROLLERS
// ═══════════════════════════════════════════════════════════════════

const getRefund = asyncHandler(async (req, res) => {
  const type = req.query.type || 'customer';
  const legalData = readJsonFile(legalFilePath, { refund: {} });
  const categoryData = legalData.refund?.[type] || { active: null, history: [] };

  res.status(200).json({
    success: true,
    message: 'Refund policies fetched successfully',
    data: categoryData
  });
});

const publishRefund = asyncHandler(async (req, res) => {
  const { type = 'customer', content } = req.body;
  if (!content) {
    return res.status(400).json({ success: false, message: 'Content is required' });
  }

  const legalData = readJsonFile(legalFilePath, { terms: {}, privacy: {}, refund: {} });
  if (!legalData.refund) legalData.refund = {};
  if (!legalData.refund[type]) legalData.refund[type] = { active: null, history: [] };

  const history = legalData.refund[type].history || [];
  const nextId = history.length > 0 ? Math.max(...history.map(h => h.id || 0)) + 1 : 1;
  const version = `v1.0.${nextId}`;

  // Archive previous versions
  history.forEach(h => {
    h.isActive = false;
    h.status = 'Archived';
  });

  const newPolicy = {
    id: nextId,
    version,
    content,
    isActive: true,
    status: 'Active',
    publishedAt: new Date().toISOString(),
    publishedBy: req.user?.name || 'System Admin'
  };

  history.unshift(newPolicy);
  legalData.refund[type] = {
    active: newPolicy,
    history
  };

  writeJsonFile(legalFilePath, legalData);

  try {
    const io = getIO();
    io.emit('legal_policy_updated', { category: 'refund', type, active: newPolicy });
  } catch (err) {
    // Socket not active or initialized
  }

  res.status(200).json({
    success: true,
    message: 'Refund policy published successfully',
    data: newPolicy
  });
});

const toggleRefundStatus = asyncHandler(async (req, res) => {
  const numericId = parseInt(req.params.id, 10);
  const legalData = readJsonFile(legalFilePath, { refund: {} });

  for (const type of ['customer', 'driver']) {
    const history = legalData.refund?.[type]?.history || [];
    const item = history.find(h => h.id === numericId);
    if (item) {
      item.isActive = !item.isActive;
      item.status = item.isActive ? 'Active' : 'Draft';

      if (item.isActive) {
        history.forEach(h => {
          if (h.id !== numericId) {
            h.isActive = false;
            h.status = 'Archived';
          }
        });
        legalData.refund[type].active = item;
      } else {
        if (legalData.refund[type].active?.id === numericId) {
          legalData.refund[type].active = null;
        }
      }

      writeJsonFile(legalFilePath, legalData);

      return res.status(200).json({
        success: true,
        message: 'Refund policy status toggled successfully',
        data: {
          active: legalData.refund[type].active,
          history
        }
      });
    }
  }

  res.status(404).json({ success: false, message: 'Version not found' });
});

const restoreRefundVersion = asyncHandler(async (req, res) => {
  const numericId = parseInt(req.params.id, 10);
  const legalData = readJsonFile(legalFilePath, { refund: {} });

  for (const type of ['customer', 'driver']) {
    const history = legalData.refund?.[type]?.history || [];
    const item = history.find(h => h.id === numericId);
    if (item) {
      history.forEach(h => {
        h.isActive = false;
        h.status = 'Archived';
      });

      item.isActive = true;
      item.status = 'Active';
      legalData.refund[type].active = item;

      writeJsonFile(legalFilePath, legalData);

      return res.status(200).json({
        success: true,
        message: 'Version restored successfully',
        data: {
          active: item,
          history
        }
      });
    }
  }

  res.status(404).json({ success: false, message: 'Version not found' });
});

// ═══════════════════════════════════════════════════════════════════
// 4. SUPPORT CONTACT CONTROLLERS
// ═══════════════════════════════════════════════════════════════════

const getSupportContact = asyncHandler(async (req, res) => {
  const contact = readJsonFile(supportContactFilePath, {
    id: 1,
    phoneHeaderTitle: 'Call Support',
    phoneHeaderSubtitle: 'Talk to our KnowChamp support team',
    emailTitle: 'Send us an Email',
    emailSubtitle: 'We usually reply within a few hours',
    emailAddress: 'support@knowchamp.com',
    phones: ['+91 98765 43210'],
    supportEmail: 'support@knowchamp.com',
    helplineNumber: '+91 98765 43210',
    officeAddress: '102, Innovation Hub, Tech City, Bangalore, India',
    workingHours: 'Mon - Sat: 9:00 AM to 6:00 PM',
    updatedAt: new Date().toISOString()
  });

  res.status(200).json({
    success: true,
    message: 'Support contact details fetched successfully',
    data: contact
  });
});

const updateSupportContact = asyncHandler(async (req, res) => {
  const currentContact = readJsonFile(supportContactFilePath, {});
  const updates = req.body || {};

  if (updates.phoneHeaderTitle !== undefined) currentContact.phoneHeaderTitle = updates.phoneHeaderTitle;
  if (updates.phoneHeaderSubtitle !== undefined) currentContact.phoneHeaderSubtitle = updates.phoneHeaderSubtitle;
  if (updates.emailTitle !== undefined) currentContact.emailTitle = updates.emailTitle;
  if (updates.emailSubtitle !== undefined) currentContact.emailSubtitle = updates.emailSubtitle;
  if (updates.emailAddress !== undefined) {
    currentContact.emailAddress = updates.emailAddress;
    currentContact.supportEmail = updates.emailAddress;
  }
  if (updates.supportEmail !== undefined) {
    currentContact.supportEmail = updates.supportEmail;
    if (!updates.emailAddress) currentContact.emailAddress = updates.supportEmail;
  }
  if (updates.phones !== undefined && Array.isArray(updates.phones)) {
    currentContact.phones = updates.phones;
    if (updates.phones.length > 0) {
      currentContact.helplineNumber = updates.phones[0];
    }
  }
  if (updates.helplineNumber !== undefined) currentContact.helplineNumber = updates.helplineNumber;
  if (updates.officeAddress !== undefined) currentContact.officeAddress = updates.officeAddress;
  if (updates.workingHours !== undefined) currentContact.workingHours = updates.workingHours;

  currentContact.updatedAt = new Date().toISOString();

  writeJsonFile(supportContactFilePath, currentContact);

  try {
    const io = getIO();
    io.emit('support_contact_updated', currentContact);
  } catch (err) {
    // Socket not active or initialized
  }

  res.status(200).json({
    success: true,
    message: 'Support contact details updated successfully',
    data: currentContact
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. PUBLIC CONTENT CONTROLLERS (Unauthenticated)
// ═══════════════════════════════════════════════════════════════════

const getPublicPolicy = (category) => asyncHandler(async (req, res) => {
  const type = req.query.type || 'customer';
  const legalData = readJsonFile(legalFilePath, {});
  const categoryData = legalData[category]?.[type] || { active: null };

  res.status(200).json({
    success: true,
    data: categoryData.active || null
  });
});

module.exports = {
  getTerms,
  publishTerms,
  toggleTermsStatus,
  restoreTermsVersion,
  getPrivacy,
  publishPrivacy,
  togglePrivacyStatus,
  restorePrivacyVersion,
  getRefund,
  publishRefund,
  toggleRefundStatus,
  restoreRefundVersion,
  getSupportContact,
  updateSupportContact,
  getPublicPolicy,
};
