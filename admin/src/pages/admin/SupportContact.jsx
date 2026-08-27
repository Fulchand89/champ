import React, { useState, useEffect } from 'react';
import { Phone, Mail, Plus, Trash2, Save, Headphones, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSupportContact } from '../../hooks/useLegalPolicies';

const SupportContact = () => {
  const { contact, loading, isUpdating, updateContact } = useSupportContact();

  const [phoneHeaderTitle, setPhoneHeaderTitle] = useState('Call Support');
  const [phoneHeaderSubtitle, setPhoneHeaderSubtitle] = useState('Talk to our KnowChamp support team');
  const [emailTitle, setEmailTitle] = useState('Send us an Email');
  const [emailSubtitle, setEmailSubtitle] = useState('We usually reply within a few hours');
  const [emailAddress, setEmailAddress] = useState('support@knowchamp.com');
  const [phones, setPhones] = useState(['+91 98765 43210']);
  const [newPhoneInput, setNewPhoneInput] = useState('');

  useEffect(() => {
    if (contact) {
      if (contact.phoneHeaderTitle) setPhoneHeaderTitle(contact.phoneHeaderTitle);
      if (contact.phoneHeaderSubtitle) setPhoneHeaderSubtitle(contact.phoneHeaderSubtitle);
      if (contact.emailTitle) setEmailTitle(contact.emailTitle);
      if (contact.emailSubtitle) setEmailSubtitle(contact.emailSubtitle);
      if (contact.emailAddress) setEmailAddress(contact.emailAddress);
      if (contact.phones && Array.isArray(contact.phones) && contact.phones.length > 0) {
        setPhones(contact.phones);
      }
    }
  }, [contact]);

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^(\+?\d{1,4}[-.\\s]?)?(\(?\d{3,5}\)?[-.\\s]?)?[\d-.\\s]{6,15}$/;
    return phoneRegex.test(number.trim());
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleAddPhone = () => {
    const trimmedPhone = newPhoneInput.trim();
    if (!trimmedPhone) { toast.error('Please enter a phone number'); return; }
    if (!validatePhoneNumber(trimmedPhone)) { toast.error('Please enter a valid phone number'); return; }
    if (phones.includes(trimmedPhone)) { toast.error('This phone number is already added'); return; }
    setPhones([...phones, trimmedPhone]);
    setNewPhoneInput('');
    toast.success('Phone number added');
  };

  const handleRemovePhone = (index) => {
    if (phones.length <= 1) { toast.error('At least one support phone number is required'); return; }
    setPhones(phones.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    if (!phoneHeaderTitle.trim()) { toast.error('Phone header title is required'); return; }
    if (!emailTitle.trim()) { toast.error('Email title is required'); return; }
    if (!emailAddress.trim() || !validateEmail(emailAddress)) { toast.error('Please enter a valid email address'); return; }
    if (phones.length === 0) { toast.error('At least one support phone number is required'); return; }
    try {
      await updateContact({
        phoneHeaderTitle: phoneHeaderTitle.trim(),
        phoneHeaderSubtitle: phoneHeaderSubtitle.trim(),
        emailTitle: emailTitle.trim(),
        emailSubtitle: emailSubtitle.trim(),
        emailAddress: emailAddress.trim(),
        phones,
      });
      toast.success('Support contact settings saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update support contact settings');
    }
  };

  // Render immediately with initial default/cached values, update seamlessly via useEffect

  return (
    <div className="space-y-5 w-full">

      {/* ── Page Header ── */}
      <div className="bg-[#0f1117] rounded-2xl border border-white/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E94B4B]/15 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5 text-[#E94B4B]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Support Contact Management</h1>
            <p className="text-[11px] text-white/50 mt-0.5">
              Configure KnowChamp helpdesk phone numbers, support email, and app help screen headings.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-white rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-60 cursor-pointer hover:opacity-90"
          style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
        >
          <Save className="w-4 h-4" />
          {isUpdating ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* ── Phone Support Card ── */}
      <div className="bg-[#0f1117] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E94B4B]/15 flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-[#E94B4B]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Phone Support Configuration</h2>
            <p className="text-[11px] text-white/45 mt-0.5">Configure phone call options displayed in the KnowChamp user app</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Title & Subtitle inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">Phone Header Title <span className="text-[#E94B4B]">*</span></label>
              <input
                type="text"
                value={phoneHeaderTitle}
                onChange={(e) => setPhoneHeaderTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                placeholder="e.g. Call Support"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">Phone Header Subtitle</label>
              <input
                type="text"
                value={phoneHeaderSubtitle}
                onChange={(e) => setPhoneHeaderSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                placeholder="e.g. Talk to our KnowChamp support team"
              />
            </div>
          </div>

          {/* Phone Numbers List */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-3">
              Support Phone Numbers
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E94B4B]/15 text-[#E94B4B] border border-[#E94B4B]/20">
                {phones.length} added
              </span>
            </label>

            <div className="space-y-2 mb-3">
              {phones.map((phoneNum, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/8 bg-white/4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[#E94B4B]/15 text-[#E94B4B] flex items-center justify-center font-bold text-[11px] shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-semibold text-white break-all">{phoneNum}</span>
                  </div>
                  <button
                    onClick={() => handleRemovePhone(idx)}
                    className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Phone Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPhoneInput}
                onChange={(e) => setNewPhoneInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPhone()}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] transition-all"
                placeholder="e.g. +91 98765 43210"
              />
              <button
                onClick={handleAddPhone}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white/8 hover:bg-white/12 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Email Support Card ── */}
      <div className="bg-[#0f1117] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Email Support Configuration</h2>
            <p className="text-[11px] text-white/45 mt-0.5">Configure support email headings and destination mailbox</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">Email Title <span className="text-[#E94B4B]">*</span></label>
              <input
                type="text"
                value={emailTitle}
                onChange={(e) => setEmailTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                placeholder="e.g. Send us an Email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">Email Subtitle</label>
              <input
                type="text"
                value={emailSubtitle}
                onChange={(e) => setEmailSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                placeholder="e.g. We usually reply within a few hours"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2">Official Support Email Address <span className="text-[#E94B4B]">*</span></label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
              placeholder="e.g. support@knowchamp.com"
            />
          </div>
        </div>
      </div>

      {/* ── Live Preview Card ── */}
      <div className="bg-[#0f1117] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-white/40" />
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Live Preview — How users will see it</span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/4 border border-white/8 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#E94B4B]/15 flex items-center justify-center">
                <Phone className="w-4 h-4 text-[#E94B4B]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{phoneHeaderTitle || 'Call Support'}</p>
                <p className="text-[11px] text-white/45">{phoneHeaderSubtitle || '—'}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {phones.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-white/70 break-all">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/4 border border-white/8 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/15 flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{emailTitle || 'Send us an Email'}</p>
                <p className="text-[11px] text-white/45">{emailSubtitle || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70 break-all">
              <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              {emailAddress || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Info note ── */}
      <div className="flex items-center gap-3 bg-[#0f1117] rounded-xl border border-white/10 p-4">
        <AlertCircle className="w-4 h-4 text-white/30 shrink-0" />
        <p className="text-[11px] text-white/40 leading-relaxed">
          Support contact changes are reflected in the KnowChamp user app immediately after saving. Ensure phone numbers are in valid international format (+91 XXXXX XXXXX).
        </p>
      </div>
    </div>
  );
};

export default SupportContact;
