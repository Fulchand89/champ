import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Link as LinkIcon,
  Save,
  RotateCcw,
  ExternalLink,
  Sparkles,
  Globe,
} from 'lucide-react';
import cmsService from '../../api/services/cmsService';

// Module-level cache — persists for the entire browser session
let _excellenceLeagueCache = null;

const DEFAULT_DATA = {
  title: 'Excellence League',
  subtitle: 'Access the official Excellence League platform.',
  linkUrl: 'https://knowchamp.com/excellence-league',
  buttonText: 'Visit Excellence League',
};

const ManageExcellenceLeague = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [heroTitle, setHeroTitle] = useState(DEFAULT_DATA.title);
  const [heroSubtitle, setHeroSubtitle] = useState(DEFAULT_DATA.subtitle);
  const [linkUrl, setLinkUrl] = useState(DEFAULT_DATA.linkUrl);
  const [buttonText, setButtonText] = useState(DEFAULT_DATA.buttonText);

  // Populate state from data object
  const applyData = (data) => {
    if (!data) return;
    setHeroTitle(data.hero?.title || DEFAULT_DATA.title);
    setHeroSubtitle(data.hero?.subtitle || DEFAULT_DATA.subtitle);
    setLinkUrl(data.linkUrl || DEFAULT_DATA.linkUrl);
    setButtonText(data.buttonText || DEFAULT_DATA.buttonText);
  };

  // Fetch data
  const fetchData = async (showSpinner = true) => {
    if (_excellenceLeagueCache) {
      applyData(_excellenceLeagueCache);
      setLoading(false);
      try {
        const res = await cmsService.getAdminExcellenceLeague();
        if (res?.success && res.data) {
          _excellenceLeagueCache = res.data;
          applyData(res.data);
        }
      } catch (_) {}
      return;
    }
    if (showSpinner) setLoading(true);
    try {
      const res = await cmsService.getAdminExcellenceLeague();
      if (res?.success && res.data) {
        _excellenceLeagueCache = res.data;
        applyData(res.data);
      }
    } catch (err) {
      console.error('Error fetching Excellence League CMS:', err);
      toast.error('Failed to load Excellence League content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save changes
  const handleSave = async () => {
    if (!linkUrl.trim()) {
      toast.error('Please provide a valid link URL');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: heroTitle,
        subtitle: heroSubtitle,
        linkUrl: linkUrl.trim(),
        buttonText: buttonText.trim() || 'Visit Excellence League',
      };

      const res = await cmsService.updateAdminExcellenceLeague(payload);
      if (res?.success) {
        toast.success('Excellence League link updated successfully!');
        if (res.data) {
          _excellenceLeagueCache = res.data;
          applyData(res.data);
        }
      } else {
        toast.error(res?.message || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving Excellence League CMS:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'An error occurred while saving';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f1117] p-6 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/10 border border-red-500/30 rounded-xl text-red-400">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Manage Excellence League Link</h1>
            <p className="text-xs text-gray-400">Configure title, description, and target link for Excellence League</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/excellence-league"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 text-gray-400" />
            View Public Page
            <ExternalLink className="w-3 h-3 text-gray-400 ml-0.5" />
          </a>
          <button
            onClick={() => fetchData(true)}
            disabled={loading || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 transition-all duration-200 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-red-500/35 active:translate-y-0 active:scale-[0.97] text-white text-xs font-bold disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0f1117] rounded-2xl border border-white/10 space-y-3">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400">Loading Excellence League Settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Settings */}
          <div className="bg-[#0f1117] p-6 rounded-2xl border border-white/10 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Excellence League Link Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Page Title</label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Excellence League"
                  className="w-full px-4 py-2.5 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Subtitle / Description</label>
                <textarea
                  rows="3"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Access the official Excellence League platform..."
                  className="w-full px-4 py-2.5 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Excellence League Link (URL)</label>
                <div className="relative">
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com/excellence-league"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 font-mono"
                  />
                  <LinkIcon className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Users clicking the Excellence League link will be directed to this URL.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Button Label</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Visit Excellence League"
                  className="w-full px-4 py-2.5 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-[#0f1117] p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-6">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Live Preview on Website
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Live View
                </span>
              </div>

              <div className="relative p-8 rounded-2xl bg-gradient-to-b from-[#161a23] to-[#0a0c12] border border-white/10 text-center space-y-6 overflow-hidden">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {heroTitle || 'Excellence League'}
                </h3>

                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  {heroSubtitle || 'Access the official Excellence League platform.'}
                </p>

                <div className="pt-2">
                  <a
                    href={linkUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.preventDefault()}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-xs shadow-lg shadow-red-500/25 hover:brightness-110 transition-all cursor-pointer"
                  >
                    <span>{buttonText || 'Visit Excellence League'}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-4 border-t border-white/5 text-[11px] text-gray-500 font-mono break-all">
                  Target URL: {linkUrl || 'Not configured'}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 text-center italic mt-4">
              All other data and sections have been removed. Clicking save will publish this link to both admin and public site.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExcellenceLeague;
