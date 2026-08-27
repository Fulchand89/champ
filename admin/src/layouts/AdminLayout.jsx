import { useState, Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/admin/Sidebar'
import Header from '../components/admin/Header'

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768)
  const location = useLocation()

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
  else if (path.includes('/transactions')) pageTitle = "Transaction Management";
  else if (path.includes('/withdrawals')) pageTitle = "Withdrawal Management";
  else if (path.includes('/reports')) pageTitle = "Reports & Analytics";

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

        <footer className="text-center text-xs text-gray-500 py-3 border-t border-white/10 bg-[#0f1117]">
          © {new Date().getFullYear()} KnowChamp. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

export default AdminLayout