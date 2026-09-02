import React, { useEffect, useState } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import legalService from '../../api/services/legalService';
import { Headphones, Phone, Mail, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const PublicSupportContact = () => {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let isMounted = true;
    legalService
      .getPublicSupportContact()
      .then((res) => {
        if (isMounted) {
          setContact(res.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Your message has been sent! Our support team will get back to you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* Hero Header */}
      <div className="relative pt-36 pb-16 bg-gradient-to-b from-[#0b0c16] via-[#100713] to-[#090b15] border-b border-gray-900 flex flex-col items-center text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Headphones className="w-4 h-4" /> 24/7 Help Desk
        </div>
        <h1 className="text-3xl sm:text-5xl font-black mb-4 text-white">
          Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Support</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          Have questions about Contests, scoring, wallet deposits, or withdrawals? We are here to help.
        </p>
      </div>

      {/* Content Grid */}
      <div className="w-[calc(100%-32px)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-500" />
              Get In Touch
            </h2>
            <p className="text-sm text-white/60 mb-6">
              Reach out to our customer happiness squad through any of the verified channels below.
            </p>

            {/* Phone Card */}
            <div className="bg-[#0f111d] rounded-2xl border border-white/10 p-6 flex items-start gap-4 transition-all hover:border-red-500/30">
              <div className="w-12 h-12 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-base font-bold text-white">
                  {contact?.phoneHeaderTitle || 'Call Support'}
                </h3>
                <p className="text-xs text-white/50">
                  {contact?.phoneHeaderSubtitle || 'Talk directly to our operations team'}
                </p>
                <div className="pt-2 space-y-1">
                  {contact?.phones && contact.phones.length > 0 ? (
                    contact.phones.map((phone, idx) => (
                      <a
                        key={idx}
                        href={`tel:${phone}`}
                        className="block text-sm font-semibold text-red-400 hover:underline"
                      >
                        {phone}
                      </a>
                    ))
                  ) : (
                    <span className="text-sm font-semibold text-red-400">
                      {contact?.helplineNumber || '+91 98765 43210'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-[#0f111d] rounded-2xl border border-white/10 p-6 flex items-start gap-4 transition-all hover:border-blue-500/30">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-base font-bold text-white">
                  {contact?.emailTitle || 'Send Us an Email'}
                </h3>
                <p className="text-xs text-white/50">
                  {contact?.emailSubtitle || 'Average response time: under 2 hours'}
                </p>
                <div className="pt-2">
                  <a
                    href={`mailto:${contact?.emailAddress || contact?.supportEmail || 'support@knowchamp.com'}`}
                    className="text-sm font-semibold text-blue-400 hover:underline break-all"
                  >
                    {contact?.emailAddress || contact?.supportEmail || 'support@knowchamp.com'}
                  </a>
                </div>
              </div>
            </div>

            {/* Office & Hours */}
            <div className="bg-[#0f111d] rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Registered Office</h4>
                  <p className="text-xs text-white/60 mt-1">
                    {contact?.officeAddress || '102, Innovation Hub, Tech City, Bangalore, India'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-2 border-t border-white/5">
                <Clock className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Working Hours</h4>
                  <p className="text-xs text-white/60 mt-1">
                    {contact?.workingHours || 'Mon - Sat: 9:00 AM to 6:00 PM'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Send Message Form */}
          <div className="lg:col-span-7 bg-[#0f111d] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-1">Send a Message</h2>
            <p className="text-xs text-white/50 mb-6">Fill out the quick form below and we will respond via email.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-2">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Withdrawal issue / Contest inquiry"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">
                  Message Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your query or problem in detail..."
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending Message...' : 'Submit Message'}
              </button>
            </form>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PublicSupportContact;
