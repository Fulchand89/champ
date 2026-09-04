import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Globe,
  ListOrdered,
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import cmsService from '../../api/services/cmsService';
import ConfirmModal from '../../components/common/ConfirmModal';

const AVAILABLE_ICONS = [
  { value: 'Download', label: 'Download — Install / Download' },
  { value: 'UserCheck', label: 'UserCheck — Register / Account' },
  { value: 'Wallet', label: 'Wallet — Payments / Money' },
  { value: 'PlayCircle', label: 'PlayCircle — Play / Contest' },
  { value: 'Trophy', label: 'Trophy — Win / Achievement' },
  { value: 'ShieldCheck', label: 'ShieldCheck — Security / Trust' },
  { value: 'Star', label: 'Star — Excellence / Rating' },
  { value: 'Zap', label: 'Zap — Speed / Live' },
  { value: 'BookOpen', label: 'BookOpen — Learning / Knowledge' },
  { value: 'Gift', label: 'Gift — Rewards / Prizes' },
  { value: 'Smartphone', label: 'Smartphone — Mobile / App' },
  { value: 'CheckCircle', label: 'CheckCircle — Verified / Done' },
  { value: 'Users', label: 'Users — Community / Players' },
  { value: 'BarChart2', label: 'BarChart2 — Stats / Analytics' },
  { value: 'CreditCard', label: 'CreditCard — Payment / Card' },
  { value: 'ArrowRight', label: 'ArrowRight — Next / Continue' },
  { value: 'Lock', label: 'Lock — Security / Privacy' },
  { value: 'Headphones', label: 'Headphones — Support / Help' },
];

const TABS = [
  { id: 'hero', label: 'Hero Section', icon: Globe },
  { id: 'steps', label: 'Steps', icon: ListOrdered },
  { id: 'callout', label: 'Callout Banner', icon: Megaphone },
];

const inputClass = 'block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]';
const labelClass = 'block text-xs font-bold text-gray-300 mb-1.5';

const ManageHowItWorks = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  const [heroTitle, setHeroTitle] = useState('How It');
  const [heroHighlight, setHeroHighlight] = useState('Works');
  const [heroSubtitle, setHeroSubtitle] = useState('');

  const [steps, setSteps] = useState([]);

  const [calloutTitle, setCalloutTitle] = useState('');
  const [calloutDesc, setCalloutDesc] = useState('');
  const [bulletPoints, setBulletPoints] = useState(['']);
  const [ctaText, setCtaText] = useState('Start Playing Now');
  const [ctaLink, setCtaLink] = useState('/contests');

  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [stepForm, setStepForm] = useState({ stepNumber: '', icon: 'Download', title: '', description: '', displayOrder: 1 });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getAdminHowItWorks();
      if (res?.success && res.data) {
        const d = res.data;
        setHeroTitle(d.hero?.title || 'How It');
        setHeroHighlight(d.hero?.titleHighlight || 'Works');
        setHeroSubtitle(d.hero?.subtitle || '');
        setSteps(Array.isArray(d.steps) ? [...d.steps].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) : []);
        setCalloutTitle(d.callout?.title || '');
        setCalloutDesc(d.callout?.description || '');
        setBulletPoints(Array.isArray(d.callout?.bulletPoints) && d.callout.bulletPoints.length > 0 ? d.callout.bulletPoints : ['']);
        setCtaText(d.callout?.ctaText || 'Start Playing Now');
        setCtaLink(d.callout?.ctaLink || '/contests');
      }
    } catch (err) {
      console.error('Error fetching How It Works CMS:', err);
      toast.error('Failed to load How It Works CMS content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        hero: { title: heroTitle.trim(), titleHighlight: heroHighlight.trim(), subtitle: heroSubtitle.trim() },
        steps: steps.map((s, idx) => ({ ...s, displayOrder: s.displayOrder ?? idx + 1 })),
        callout: {
          title: calloutTitle.trim(),
          description: calloutDesc.trim(),
          bulletPoints: bulletPoints.filter((b) => b.trim() !== ''),
          ctaText: ctaText.trim(),
          ctaLink: ctaLink.trim(),
        },
      };
      const res = await cmsService.updateAdminHowItWorks(payload);
      if (res?.success) {
        toast.success('How It Works CMS content saved successfully!');
        if (res.data) {
          const d = res.data;
          if (d.hero) { setHeroTitle(d.hero.title || 'How It'); setHeroHighlight(d.hero.titleHighlight || 'Works'); setHeroSubtitle(d.hero.subtitle || ''); }
          if (Array.isArray(d.steps)) setSteps([...d.steps].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
          if (d.callout) { setCalloutTitle(d.callout.title || ''); setCalloutDesc(d.callout.description || ''); setBulletPoints(d.callout.bulletPoints?.length ? d.callout.bulletPoints : ['']); setCtaText(d.callout.ctaText || 'Start Playing Now'); setCtaLink(d.callout.ctaLink || '/contests'); }
        }
      } else {
        toast.error(res?.message || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving How It Works CMS:', err);
      toast.error(err?.response?.data?.message || err?.message || 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const openAddStep = () => {
    setEditingStep(null);
    setStepForm({ stepNumber: String(steps.length + 1).padStart(2, '0'), icon: 'Download', title: '', description: '', displayOrder: steps.length + 1 });
    setStepModalOpen(true);
  };

  const openEditStep = (step) => {
    setEditingStep(step);
    setStepForm({ stepNumber: step.stepNumber || '', icon: step.icon || 'Download', title: step.title || '', description: step.description || '', displayOrder: step.displayOrder ?? 1 });
    setStepModalOpen(true);
  };

  const handleStepSubmit = (e) => {
    e.preventDefault();
    if (!stepForm.title.trim()) { toast.error('Step title is required'); return; }
    if (editingStep) {
      setSteps((prev) => prev.map((s) => s.id === editingStep.id ? { ...s, ...stepForm, displayOrder: Number(stepForm.displayOrder) || s.displayOrder } : s));
      toast.success('Step updated — click Save All to persist');
    } else {
      setSteps((prev) => [...prev, { ...stepForm, id: Date.now(), displayOrder: Number(stepForm.displayOrder) || prev.length + 1 }]);
      toast.success('Step added — click Save All to persist');
    }
    setStepModalOpen(false);
  };

  const openDeleteStep = (step) => { setStepToDelete(step); setDeleteModalOpen(true); };

  const handleConfirmDelete = async () => {
    if (!stepToDelete) return;
    setDeleting(true);
    try {
      setSteps((prev) => prev.filter((s) => s.id !== stepToDelete.id));
      toast.success('Step removed — click Save All to persist');
      setDeleteModalOpen(false);
      setStepToDelete(null);
    } finally { setDeleting(false); }
  };

  const moveStep = (idx, direction) => {
    setSteps((prev) => {
      const arr = [...prev];
      const swapIdx = idx + direction;
      if (swapIdx < 0 || swapIdx >= arr.length) return arr;
      [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
      return arr.map((s, i) => ({ ...s, displayOrder: i + 1 }));
    });
  };

  const addBullet = () => setBulletPoints((prev) => [...prev, '']);
  const removeBullet = (idx) => setBulletPoints((prev) => prev.filter((_, i) => i !== idx));
  const updateBullet = (idx, val) => setBulletPoints((prev) => prev.map((b, i) => (i === idx ? val : b)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#E94B4B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">How It Works CMS</h1>
          <p className="text-xs text-gray-400 mt-1">Manage all content on the public How It Works page — steps, hero, and callout banner.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-sm font-semibold transition-all cursor-pointer">
            <RotateCcw size={15} /> Refresh
          </button>
          <button onClick={handleSaveAll} disabled={saving} className="flex items-center gap-2 px-5 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90 disabled:opacity-60" style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save All Changes'}
          </button>
        </div>
      </div>

      <div className="bg-[#0f1117] border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all cursor-pointer ${activeTab === tab.id ? 'text-[#E94B4B] border-b-2 border-[#E94B4B] bg-[#E94B4B]/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'hero' && (
            <div className="space-y-5 max-w-2xl">
              <p className="text-xs text-gray-500">These fields control the heading and subtitle shown at the top of the public How It Works page.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Page Title</label>
                  <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="e.g. How It" className={inputClass} />
                  <p className="text-[11px] text-gray-500 mt-1">Plain text portion of the heading</p>
                </div>
                <div>
                  <label className={labelClass}>Highlighted Word</label>
                  <input type="text" value={heroHighlight} onChange={(e) => setHeroHighlight(e.target.value)} placeholder="e.g. Works" className={inputClass} />
                  <p className="text-[11px] text-gray-500 mt-1">Displayed in red gradient</p>
                </div>
              </div>
              <div>
                <label className={labelClass}>Hero Subtitle</label>
                <textarea rows="3" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Enter the subtitle displayed below the heading…" className={inputClass} />
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0c16] p-5">
                <p className="text-[11px] text-gray-500 mb-3 uppercase tracking-wider font-semibold">Live Preview</p>
                <h1 className="text-2xl font-black text-white">
                  {heroTitle || 'How It'}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">{heroHighlight || 'Works'}</span>
                </h1>
                <p className="text-gray-400 text-sm mt-2 max-w-md">{heroSubtitle}</p>
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Manage the step-by-step cards shown on the page. Use the arrows to reorder. Changes are staged locally — click <strong className="text-gray-300">Save All Changes</strong> to persist.</p>
                <button onClick={openAddStep} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90 shrink-0" style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}>
                  <Plus size={15} /> Add Step
                </button>
              </div>

              {steps.length === 0 ? (
                <div className="text-center py-16 text-gray-500 text-sm">No steps yet. Click <strong>Add Step</strong> to create the first one.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-16">Step</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">Icon</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">Order</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {steps.map((step, idx) => (
                        <tr key={step.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">{idx + 1}</td>
                          <td className="px-4 py-3"><span className="text-xs font-black text-red-500/60 font-mono tracking-widest">{step.stepNumber}</span></td>
                          <td className="px-4 py-3 text-gray-300 font-mono text-xs">{step.icon}</td>
                          <td className="px-4 py-3 font-semibold text-white">{step.title}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">{step.description}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer" title="Move Up"><ChevronUp size={15} /></button>
                              <button onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer" title="Move Down"><ChevronDown size={15} /></button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => openEditStep(step)} className="p-1 text-gray-400 hover:text-white rounded transition-colors cursor-pointer" title="Edit"><Edit2 size={15} /></button>
                              <button onClick={() => openDeleteStep(step)} className="p-1 text-red-500/70 hover:text-red-500 rounded transition-colors cursor-pointer" title="Delete"><Trash2 size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'callout' && (
            <div className="space-y-5 max-w-2xl">
              <p className="text-xs text-gray-500">Manage the "Rules & Fair Play" banner section at the bottom of the page.</p>
              <div>
                <label className={labelClass}>Banner Title</label>
                <input type="text" value={calloutTitle} onChange={(e) => setCalloutTitle(e.target.value)} placeholder="e.g. Rules & Fair Play Guidelines" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea rows="4" value={calloutDesc} onChange={(e) => setCalloutDesc(e.target.value)} placeholder="Enter the body text for the callout banner…" className={inputClass} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass + ' mb-0'}>Bullet Points</label>
                  <button type="button" onClick={addBullet} className="flex items-center gap-1 text-xs text-[#E94B4B] hover:text-red-400 cursor-pointer transition-colors font-semibold"><Plus size={13} /> Add Point</button>
                </div>
                <div className="space-y-2">
                  {bulletPoints.map((bp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-red-500 font-bold text-sm">✔</span>
                      <input type="text" value={bp} onChange={(e) => updateBullet(idx, e.target.value)} placeholder={`Bullet point ${idx + 1}…`} className={inputClass + ' flex-1'} />
                      <button type="button" onClick={() => removeBullet(idx)} disabled={bulletPoints.length === 1} className="p-1 text-red-500/60 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"><X size={15} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>CTA Button Text</label>
                  <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="e.g. Start Playing Now" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>CTA Button Link</label>
                  <input type="text" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="e.g. /contests" className={inputClass} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {stepModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 shrink-0">
              <h2 className="text-lg font-bold text-white">{editingStep ? 'Edit Step' : 'Add New Step'}</h2>
              <button onClick={() => setStepModalOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleStepSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Step Number Badge</label>
                  <input type="text" value={stepForm.stepNumber} onChange={(e) => setStepForm((f) => ({ ...f, stepNumber: e.target.value }))} placeholder="e.g. 01" maxLength={4} className={inputClass} />
                  <p className="text-[11px] text-gray-500 mt-1">Shown as a faded badge</p>
                </div>
                <div>
                  <label className={labelClass}>Display Order</label>
                  <input type="number" min="1" value={stepForm.displayOrder} onChange={(e) => setStepForm((f) => ({ ...f, displayOrder: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Icon</label>
                <select value={stepForm.icon} onChange={(e) => setStepForm((f) => ({ ...f, icon: e.target.value }))} className={inputClass}>
                  {AVAILABLE_ICONS.map((ic) => (<option key={ic.value} value={ic.value}>{ic.label}</option>))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Step Title</label>
                <input required type="text" value={stepForm.title} onChange={(e) => setStepForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Download & Install" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea required rows="3" value={stepForm.description} onChange={(e) => setStepForm((f) => ({ ...f, description: e.target.value }))} placeholder="Enter a short description of this step…" className={inputClass} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setStepModalOpen(false)} className="px-4 py-2 border border-gray-600 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90" style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}>{editingStep ? 'Update Step' : 'Add Step'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { if (!deleting) { setDeleteModalOpen(false); setStepToDelete(null); } }}
        onConfirm={handleConfirmDelete}
        title="Delete Step?"
        message={`Are you sure you want to delete "${stepToDelete?.title || 'this step'}"?\nThis will be removed when you Save All Changes.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default ManageHowItWorks;
