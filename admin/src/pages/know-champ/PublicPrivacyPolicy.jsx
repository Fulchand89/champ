import React, { useEffect, useState } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import legalService from '../../api/services/legalService';
import { ShieldCheck, UserCheck, Trophy } from 'lucide-react';

const PublicPrivacyPolicy = () => {
  const [activeType, setActiveType] = useState('customer');
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    legalService
      .getPublicPrivacy(activeType)
      .then((res) => {
        if (isMounted) {
          setPolicy(res.data);
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
  }, [activeType]);

  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* Hero Header */}
      <div className="relative pt-36 pb-16 bg-gradient-to-b from-[#0b0c16] via-[#100713] to-[#090b15] border-b border-gray-900 flex flex-col items-center text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-4 h-4" /> Legal &amp; Compliance
        </div>
        <h1 className="text-3xl sm:text-5xl font-black mb-4 text-white">
          Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Policy</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          Learn how KnowChamp collects, utilizes, and protects your personal and gameplay information.
        </p>

        {/* Tab switcher */}
        <div className="mt-8 inline-flex p-1 rounded-xl bg-white/5 border border-white/10 max-w-full overflow-x-auto">
          <button
            onClick={() => setActiveType('customer')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeType === 'customer'
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            Player &amp; User Policy
          </button>
          <button
            onClick={() => setActiveType('driver')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeType === 'driver'
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            Quiz Host &amp; Organizer Policy
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-[calc(100%-32px)] max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 min-w-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/50 text-sm">Loading Privacy Policy...</p>
          </div>
        ) : policy?.content ? (
          <div className="bg-[#0f111d] rounded-2xl border border-white/10 p-6 sm:p-10 shadow-2xl space-y-6 overflow-hidden max-w-full">
            <div className="flex flex-wrap items-center justify-between pb-6 border-b border-white/10 gap-3">
              <span className="text-xs font-semibold text-white/50">
                Version: <strong className="text-white">{policy.version || 'v1.0.0'}</strong>
              </span>
              <span className="text-xs font-semibold text-white/50">
                Last Updated:{' '}
                <strong className="text-white">
                  {policy.publishedAt ? new Date(policy.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}
                </strong>
              </span>
            </div>

            <div
              className="prose prose-invert max-w-none text-white/80 leading-relaxed space-y-4 break-words [overflow-wrap:anywhere] [word-break:break-word] overflow-hidden [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-6 [&>h2]:mb-2 [&>h2]:break-words [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-white [&>h3]:break-words [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>li]:break-words [&>p]:text-sm sm:[&>p]:text-base [&>p]:break-words [&>p]:leading-relaxed [&_a]:text-red-400 [&_a]:underline [&_a]:break-all [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:break-words"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          </div>
        ) : (
          <div className="text-center py-20 bg-[#0f111d] rounded-2xl border border-white/10 p-8">
            <p className="text-white/60 text-sm">Privacy policy content will be published soon.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PublicPrivacyPolicy;
