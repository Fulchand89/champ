import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import images from '../../constants/images'
import { ICONS } from '../../constants/icons'
import { ROUTES } from '../../constants/routes'
import { THEME } from '../../theme'
import { systemSettingsService } from '../../api/services/systemSettingsService'
import { getImageUrl } from '../../utils/image'
import { initAdminSocket } from '../../api/services/adminSocketService'

const NAV = [
  { label: 'Dashboard', path: ROUTES.ADMIN.DASHBOARD, icon: 'Home' },
  {
    section: 'USER MANAGEMENT',
    items: [
      { label: 'Manage Users', path: ROUTES.ADMIN.MANAGE_USERS, icon: 'UserGroup' },
    ],
  },
  {
    section: 'QUIZ MANAGEMENT',
    items: [
      { label: 'Manage Quiz Categories', path: ROUTES.ADMIN.QUIZ_CATEGORIES, icon: 'ClipboardDocumentList' },
      { label: 'Manage Subjects', path: ROUTES.ADMIN.QUIZ_SUBJECTS, icon: 'DocumentText' },
      { label: 'Manage Topics', path: ROUTES.ADMIN.QUIZ_TOPICS, icon: 'DocumentText' },
      { label: 'Upload Questions', path: ROUTES.ADMIN.UPLOAD_QUESTIONS, icon: 'Sparkles' },
      { label: 'Manage Question Bank', path: ROUTES.ADMIN.QUESTION_BANK, icon: 'ClipboardDocumentList' },
    ],
  },
  {
    section: 'CONTEST MANAGEMENT',
    items: [
      { label: 'Create Contest', path: ROUTES.ADMIN.CREATE_CONTEST, icon: 'Sparkles' },
      { label: 'Schedule Contest', path: ROUTES.ADMIN.SCHEDULE_CONTEST, icon: 'Pending' },
      { label: 'Configure Entry Fee', path: ROUTES.ADMIN.CONFIGURE_ENTRY_FEE, icon: 'Revenue' },
      { label: 'Configure Prize Pool', path: ROUTES.ADMIN.CONFIGURE_PRIZE_POOL, icon: 'Gift' },
      { label: 'Monitor Live Contests', path: ROUTES.ADMIN.MONITOR_LIVE, icon: 'ChartBar' },
    ],
  },
  {
    section: 'WALLET',
    items: [
      { label: 'Deposits', path: ROUTES.ADMIN.DEPOSITS, icon: 'Deposits' },
      { label: 'Withdrawals', path: ROUTES.ADMIN.WITHDRAWALS, icon: 'Withdrawals' },
      { label: 'Transactions', path: ROUTES.ADMIN.TRANSACTIONS, icon: 'Transactions' },
    ],
  },
  {
    section: 'REPORTS & ANALYTICS',
    items: [
      { label: 'View Reports', path: ROUTES.ADMIN.VIEW_REPORTS, icon: 'Dashboard' },
    ],
  },
  {
    section: 'CONTENT & SUPPORT',
    items: [
      { label: 'Manage Features', path: ROUTES.ADMIN.MANAGE_FEATURES, icon: 'Sparkles' },
      { label: 'Manage FAQs', path: ROUTES.ADMIN.MANAGE_FAQ, icon: 'FAQ' },
      { label: 'Leaderboard CMS', path: ROUTES.ADMIN.MANAGE_LEADERBOARD, icon: 'Leaderboard' },
      { label: 'Excellence League CMS', path: ROUTES.ADMIN.MANAGE_EXCELLENCE_LEAGUE, icon: 'ExcellenceLeague' },
      { label: 'How It Works CMS', path: ROUTES.ADMIN.MANAGE_HOW_IT_WORKS, icon: 'Globe' },
      { label: 'Privacy Policy', path: ROUTES.ADMIN.PRIVACY_POLICY, icon: 'PrivacyPolicy' },
      { label: 'Terms & Conditions', path: ROUTES.ADMIN.TERMS_CONDITIONS, icon: 'TermsConditions' },
      { label: 'Refund Policy', path: ROUTES.ADMIN.REFUND_POLICY, icon: 'RefundPolicy' },

      { label: 'Contact Support', path: ROUTES.ADMIN.SUPPORT_CONTACT, icon: 'SupportContact' },
    ],
  },
  {
    section: 'SETTINGS',
    items: [
      { label: 'Settings', path: ROUTES.ADMIN.SETTINGS, icon: 'Settings' },
    ],
  },
]

/* ── Nav item ── */
function NavItem({ item, collapsed, onItemClick }) {
  const Icon = ICONS[item.icon]
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const navRef = useRef(null)

  const handleMouseEnter = () => {
    if (!collapsed) return
    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect()
      setTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 10
      })
      setShowTooltip(true)
    }
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  const location = useLocation()

  // Determine custom active state to handle query parameters
  const getIsActive = () => {
    if (item.path.includes('?')) {
      return location.pathname + location.search === item.path;
    }
    if (item.path === ROUTES.ADMIN.QUOTATIONS && (location.search.includes('status=Approved') || location.search.includes('status=Rejected'))) {
      return false;
    }
    if (item.path === ROUTES.ADMIN.DASHBOARD) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  }
  const active = getIsActive();

  return (
    <>
      <NavLink
        ref={navRef}
        to={item.path}
        end={item.path === ROUTES.ADMIN.DASHBOARD}
        onClick={onItemClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={item.label}
        className={() =>
          `flex items-center min-h-[40px] h-[40px] rounded-[10px] whitespace-nowrap transition-all duration-150 ease-in-out ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-3'
          } ${active
            ? `bg-[#0f1117] border border-white/10 ${THEME.classes.sidebarTextActive} font-semibold text-[13px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]`
            : 'bg-transparent text-white/90 font-medium text-[13px] hover:bg-white/10 hover:text-white'
          }`
        }
      >
        {() => (
          <>
            {Icon && (
              <Icon
                className={`w-[18px] h-[18px] shrink-0 stroke-[1.8] ${active ? THEME.classes.sidebarIconActive : 'text-white/80'
                  }`}
              />
            )}
            {!collapsed && (
              <span className="truncate leading-normal py-0.5">
                {item.label}
              </span>
            )}
          </>
        )}
      </NavLink>

      {/* Tooltip Portal */}
      {showTooltip &&
        createPortal(
          <div
            className="fixed z-[9999] px-2.5 py-1.5 bg-gray-900 text-white text-[12.5px] font-medium rounded-md shadow-xl pointer-events-none whitespace-nowrap"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: 'translateY(-50%)',
            }}
          >
            {item.label}
            {/* Tooltip Arrow */}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900" />
          </div>,
          document.body
        )}
    </>
  )
}

/* ── Sidebar ── */
export default function Sidebar({ collapsed, onToggle }) {
  const ChevronIcon = collapsed ? ICONS.ChevronRight : ICONS.ChevronLeft;
  const [logoUrl, setLogoUrl] = useState(images.logo);
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    // Fetch initial system setting logo
    const fetchLogo = async () => {
      try {
        const res = await systemSettingsService.getSettings();
        if (res?.data?.logoUrl) {
          setLogoUrl(getImageUrl(res.data.logoUrl));
        }
      } catch (err) {
        console.error('Error fetching sidebar logo:', err);
      }
    };
    fetchLogo();

    // Listen for real-time system setting update socket event
    const socket = initAdminSocket();
    const handleSettingsUpdate = (updatedSettings) => {
      if (updatedSettings?.logoUrl) {
        setLogoUrl(getImageUrl(updatedSettings.logoUrl));
      }
    };

    socket.on('system_settings_updated', handleSettingsUpdate);

    return () => {
      socket.off('system_settings_updated', handleSettingsUpdate);
    };
  }, []);

  const handleItemClick = () => {
    if (window.innerWidth < 768 && !collapsed) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900/50 z-40 backdrop-blur-sm transition-opacity" 
          onClick={onToggle}
        />
      )}

      <aside
        className={`h-screen ${THEME.classes.sidebarBg} flex flex-col transition-all duration-300 ease-in-out overflow-hidden shrink-0 z-50 fixed md:static top-0 left-0 ${
          collapsed 
            ? '-translate-x-full md:translate-x-0 md:w-[72px] md:min-w-[72px] w-[260px]' 
            : 'translate-x-0 w-[260px] min-w-[260px]'
        }`}
      >
        {/* ── Logo ── */}
        <div
          className={`shrink-0 flex items-center relative overflow-hidden transition-all duration-300 ${
            collapsed ? 'justify-center h-[64px] px-2' : 'justify-between pl-4 pr-3 h-[72px]'
          }`}
        >
          <div className="flex items-center gap-3">
            {logoLoading && (
              <div className={`absolute inset-0 bg-white/10 animate-pulse flex items-center ${collapsed ? 'justify-center' : 'justify-start pl-4'}`}>
                <div className={`${collapsed ? 'w-8 h-8' : 'w-[52px] h-[52px]'} bg-white/20 rounded-lg animate-pulse`} />
              </div>
            )}
            <img
              src={logoUrl || '/logo_knowchamp.png'}
              alt="KnowChamp"
              onLoad={() => setLogoLoading(false)}
              onError={(e) => {
                setLogoLoading(false);
                e.target.onerror = null;
                e.target.src = '/logo_knowchamp.png';
              }}
              className={`object-contain transition-all duration-300 ${
                collapsed ? 'w-8 h-8' : 'w-[52px] h-[52px]'
              } ${logoLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            />
          </div>
          {/* Mobile close button — only visible when sidebar is open on mobile */}
          {!collapsed && (
            <button
              onClick={onToggle}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>


        {/* ── Navigation ── */}
        <nav
          className={`flex-1 overflow-y-auto py-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] ${collapsed ? 'px-2.5' : 'px-2.5'
            }`}
        >
          {NAV.map((entry, i) => {
            /* Top-level item (Dashboard) */
            if (entry.path) {
              return (
                <NavItem key={entry.path} item={entry} collapsed={collapsed} onItemClick={handleItemClick} />
              )
            }

            /* Section group */
            return (
              <div key={i} className={`${i === 0 ? 'mt-0' : 'mt-4'}`}>
                {/* Section title */}
                {!collapsed && (
                  <p className="text-[10.5px] font-semibold tracking-[0.5px] text-white/65 uppercase mb-1.5 ml-2 leading-normal">
                    {entry.section}
                  </p>
                )}
                {collapsed && (
                  <div className="h-px bg-white/20 my-2" />
                )}

                {/* Items */}
                <div className="flex flex-col gap-0.5">
                  {entry.items.map(item => (
                    <NavItem key={item.path} item={item} collapsed={collapsed} onItemClick={handleItemClick} />
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        {/* ── Collapse button ── */}
        <div className={`pt-2.5 pb-4 border-t border-white/15 ${collapsed ? 'px-2.5' : 'px-2.5'
          }`}>
          <button
            onClick={onToggle}
            className={`flex items-center min-h-[40px] h-[40px] w-full rounded-[10px] bg-transparent border-none text-white/90 text-[13px] font-medium cursor-pointer transition-colors duration-150 ease-in-out hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-3'
              }`}
          >
            <ChevronIcon className="w-[18px] h-[18px] shrink-0 stroke-[1.8]" />
            {!collapsed && <span className="leading-normal py-0.5">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

