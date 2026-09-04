import { useState, Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/admin/Sidebar'
import Header from '../components/admin/Header'
import userService from '../api/services/userService'
import { contestService } from '../api/services/contestService'
import { categoryService } from '../api/services/categoryService'
import { subjectService } from '../api/services/subjectService'
import { topicService } from '../api/services/topicService'
import { transactionService } from '../api/services/transactionService'
import { withdrawalService } from '../api/services/withdrawalService'
import { cmsService } from '../api/services/cmsService'
import { faqService } from '../api/services/faqService'
import { featureService } from '../api/services/featureService'
import { systemSettingsService } from '../api/services/systemSettingsService'
import legalService from '../api/services/legalService'

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768)
  const location = useLocation()

  // Silent background pre-fetch for instant section loading across the entire admin panel
  useEffect(() => {
    const prefetchAdminData = async () => {
      try {
        userService.getUsers().catch(() => {});
        contestService.getContests().catch(() => {});
        categoryService.getCategories().catch(() => {});
        subjectService.getSubjects().catch(() => {});
        topicService.getTopics().catch(() => {});
        transactionService.getTransactions().catch(() => {});
        withdrawalService.getWithdrawals().catch(() => {});
        cmsService.getPublicLeaderboard().catch(() => {});
        cmsService.getPublicExcellenceLeague().catch(() => {});
        cmsService.getPublicHowItWorks().catch(() => {});
        faqService.getFAQs().catch(() => {});
        featureService.getFeatures().catch(() => {});
        systemSettingsService.getSettings().catch(() => {});
        legalService.getTermsConditions().catch(() => {});
        legalService.getPrivacyPolicies().catch(() => {});
      } catch (_) {}
    };
    prefetchAdminData();
  }, []);

  // Auto collapse/expand sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true)
      } else {
        setCollapsed(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  let pageTitle = "Dashboard";
  const path = location.pathname;
  if (path.includes('/users')) pageTitle = "User Management";
  else if (path.includes('/quiz')) pageTitle = "Quiz Management";
  else if (path.includes('/contests')) pageTitle = "Contest Management";
  else if (path.includes('/deposits')) pageTitle = "Wallet";
  else if (path.includes('/withdrawals')) pageTitle = "Wallet";
  else if (path.includes('/transactions')) pageTitle = "Transactions";
  else if (path.includes('/reports')) pageTitle = "Reports & Analytics";
  else if (path.includes('/features') || path.includes('/faq') || path.includes('/cms') || path.includes('/privacy-policy') || path.includes('/terms-conditions') || path.includes('/refund-policy') || path.includes('/support-contact')) pageTitle = "Content & Support";
  else if (path.includes('/settings') || path.includes('/profile')) pageTitle = "Settings";

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1117]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0f1117]">
        <Header 
          title={pageTitle}
          collapsed={collapsed}
          onMenuClick={() => setCollapsed(c => !c)}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 admin-portal-main no-scrollbar">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="w-8 h-8 border-4 border-[#E94B4B] border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>

        <footer className="text-center text-xs text-gray-500 py-3 border-t border-white/10 bg-[#0f1117] space-y-1">
          <p>© {new Date().getFullYear()} KnowChamp. All rights reserved.</p>
          <p className="text-[11px] text-gray-500">
            <a
              href="https://www.zigisa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-gray-500 hover:text-gray-300 transition-colors"
            >
              Powered by <span className="text-gray-400 font-medium">Zigisa Consultancy Services Private Limited</span>
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default AdminLayout