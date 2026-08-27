import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ICONS } from '../../constants/icons'
import { THEME } from '../../theme'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { getImageUrl } from '../../utils/image'
import { adminNotificationService } from '../../api/services/notificationService'
import { initAdminSocket } from '../../api/services/adminSocketService'

// Flattened searchable menu items from sidebar navigation
const searchableNav = [
  { label: 'Dashboard', path: ROUTES.ADMIN.DASHBOARD, category: 'Main' },
  { label: 'My Profile', path: ROUTES.ADMIN.PROFILE, category: 'Settings' },
  { label: 'Manage Users', path: ROUTES.ADMIN.MANAGE_USERS, category: 'User Management' },
  { label: 'Manage Quiz Categories', path: ROUTES.ADMIN.QUIZ_CATEGORIES, category: 'Quiz Management' },
  { label: 'Manage Subjects', path: ROUTES.ADMIN.QUIZ_SUBJECTS, category: 'Quiz Management' },
  { label: 'Manage Topics', path: ROUTES.ADMIN.QUIZ_TOPICS, category: 'Quiz Management' },
  { label: 'Upload Questions', path: ROUTES.ADMIN.UPLOAD_QUESTIONS, category: 'Quiz Management' },
  { label: 'Manage Question Bank', path: ROUTES.ADMIN.QUESTION_BANK, category: 'Quiz Management' },
  { label: 'Create Contest', path: ROUTES.ADMIN.CREATE_CONTEST, category: 'Contest Management' },
  { label: 'Schedule Contest', path: ROUTES.ADMIN.SCHEDULE_CONTEST, category: 'Contest Management' },
  { label: 'Configure Entry Fee', path: ROUTES.ADMIN.CONFIGURE_ENTRY_FEE, category: 'Contest Management' },
  { label: 'Configure Prize Pool', path: ROUTES.ADMIN.CONFIGURE_PRIZE_POOL, category: 'Contest Management' },
  { label: 'Monitor Live Contests', path: ROUTES.ADMIN.MONITOR_LIVE, category: 'Contest Management' },
  { label: 'Manage Transactions', path: ROUTES.ADMIN.MANAGE_TRANSACTIONS, category: 'Transaction Management' },
  { label: 'Verify Withdrawals', path: ROUTES.ADMIN.VERIFY_WITHDRAWALS, category: 'Withdrawal Management' },
  { label: 'View Reports', path: ROUTES.ADMIN.VIEW_REPORTS, category: 'Reports & Analytics' },
  { label: 'Notifications', path: ROUTES.ADMIN.NOTIFICATIONS, category: 'Main' },
  { label: 'Privacy Policy', path: ROUTES.ADMIN.PRIVACY_POLICY, category: 'Content & Support' },
  { label: 'Terms & Conditions', path: ROUTES.ADMIN.TERMS_CONDITIONS, category: 'Content & Support' },
  { label: 'Contact Support', path: ROUTES.ADMIN.SUPPORT_CONTACT, category: 'Content & Support' },
  { label: 'Settings', path: ROUTES.ADMIN.SETTINGS, category: 'Settings' },
]

export default function Header({ onMenuClick, collapsed, title }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifs, setLoadingNotifs] = useState(false)

  const searchRef = useRef(null)
  const profileRef = useRef(null)
  const notificationRef = useRef(null)

  // Fetch admin notifications from backend API (limit 10 for header preview)
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifs(true)
      const res = await adminNotificationService.getNotifications({ page: 1, limit: 10 })
      if (res?.data) {
        setNotifications(res.data.notifications || [])
        setUnreadCount(res.data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Failed to fetch admin notifications:', err)
    } finally {
      setLoadingNotifs(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()

    // Initialize Admin WebSocket Connection
    const socket = initAdminSocket()

    // 1. Listen for new direct user notification
    const handleNewNotif = (newNotif) => {
      setNotifications(prev => [newNotif, ...prev])
      setUnreadCount(prev => prev + 1)
    }

    // 2. Listen for unread count update
    const handleUnreadUpdate = (data) => {
      if (typeof data?.count === 'number') {
        setUnreadCount(data.count)
      }
    }

    // 3. Listen for general admin room broadcast
    const handleAdminBroadcast = () => {
      fetchNotifications()
    }

    socket.on('new_notification', handleNewNotif)
    socket.on('new_admin_notification', handleNewNotif)
    socket.on('unread_count_update', handleUnreadUpdate)
    socket.on('admin_notification_update', handleAdminBroadcast)

    return () => {
      socket.off('new_notification', handleNewNotif)
      socket.off('new_admin_notification', handleNewNotif)
      socket.off('unread_count_update', handleUnreadUpdate)
      socket.off('admin_notification_update', handleAdminBroadcast)
    }
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await adminNotificationService.markAsRead(null)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark notifications as read:', err)
    }
  }

  const handleMarkSingleRead = async (notifId, isAlreadyRead) => {
    if (isAlreadyRead) return
    try {
      await adminNotificationService.markAsRead(notifId)
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []
    return searchableNav.filter(item => 
      item.label.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    )
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-14 md:h-16 bg-[#0f1117] border-b border-white/10 flex items-center justify-between px-3 md:px-6 shrink-0 relative z-30">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button 
          onClick={onMenuClick}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none cursor-pointer shrink-0"
          style={{ color: THEME.colors.primaryLight }}
        >
          <span className="md:hidden flex items-center">
            <ICONS.Menu className="w-5 h-5" />
          </span>
          <span className="hidden md:flex items-center">
            {collapsed ? <ICONS.MenuOpen className="w-5 h-5" /> : <ICONS.Menu className="w-5 h-5" />}
          </span>
        </button>
        <div className="truncate">
          <h2 className="text-sm md:text-base font-bold text-white truncate">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Navigation Quick Search Dropdown (Hidden on small mobile screens) */}
        <div className="relative hidden sm:block" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search pages or tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="w-48 lg:w-64 pl-9 pr-4 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#E94B4B] focus:bg-white/15 transition-all text-white placeholder-white/40"
            />
            <ICONS.Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                ×
              </button>
            )}
          </div>

          {searchFocused && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50 max-h-72 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setSearchQuery('');
                    setSearchFocused(false);
                  }}
                  className="px-3.5 py-2 hover:bg-[#E94B4B]/10 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-50 last:border-0"
                >
                  <span className="text-xs font-bold text-gray-800">{item.label}</span>
                  <span className="text-[10px] font-medium text-[#E94B4B] bg-[#E94B4B]/10 px-2 py-0.5 rounded-md border border-[#E94B4B]/20">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
            title="Admin Notifications"
          >
            <ICONS.Bell className="w-5 h-5 text-white/70" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-white text-[9px] font-extrabold rounded-full border-2 border-white shadow-xs" style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="fixed sm:absolute top-14 md:top-16 sm:top-auto left-2 right-2 sm:left-auto sm:right-0 sm:mt-2 w-auto sm:w-[22rem] bg-[#0f1117] rounded-xl shadow-xl border border-white/10 py-2 z-50 transition-all duration-200 origin-top sm:origin-top-right transform">
              <div className="px-4 py-3 border-b border-white/10 mb-1 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[#E94B4B] hover:underline font-bold cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                {loadingNotifs ? (
                  <div className="px-4 py-8 text-center text-xs text-white/40 font-medium">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-white/40 font-medium">
                    No notifications available
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => handleMarkSingleRead(notif.id, notif.isRead)}
                      className={`px-4 py-3 hover:bg-white/8 cursor-pointer transition-colors flex items-start gap-2.5 ${!notif.isRead ? 'bg-[#E94B4B]/10' : ''}`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.isRead ? 'bg-[#E94B4B]' : 'bg-white/25'}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-[12px] leading-snug ${!notif.isRead ? 'font-bold text-white' : 'font-medium text-white/70'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-white/50 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-white/35 font-medium mt-1">
                          {new Date(notif.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-white/10 mt-1 px-2 pt-2">
                <button 
                  onClick={() => {
                    navigate(ROUTES.ADMIN.NOTIFICATIONS);
                    setNotificationOpen(false);
                  }}
                  className="w-full text-center py-2 text-[12px] font-bold text-[#E94B4B] hover:bg-white/8 rounded-lg transition-colors cursor-pointer"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 hover:bg-white/10 px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <img
              src={user?.profilePicUrl ? getImageUrl(user.profilePicUrl) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=E94B4B&color=fff`}
              alt={user?.name || 'Admin'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=E94B4B&color=fff`;
              }}
              className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0 bg-white/10"
            />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-white leading-none mb-1 truncate max-w-[120px]">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-white/50 leading-none font-medium uppercase tracking-wider">{user?.role || 'Super Admin'}</p>
            </div>
            <ICONS.ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ml-1 ${profileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileMenuOpen && (
            <div className="fixed sm:absolute top-14 md:top-16 sm:top-auto left-2 right-2 sm:left-auto sm:right-0 sm:mt-2 w-auto sm:w-56 bg-[#0f1117] rounded-xl shadow-lg border border-white/10 py-2 z-50">
              <div className="px-4 py-3 border-b border-white/10 mb-1 bg-white/5 rounded-t-xl -mt-2">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-white/50 truncate mt-0.5 font-medium">{user?.email || 'admin@knowchamp.com'}</p>
              </div>
              
              <div className="px-2 py-1">
                <button 
                  onClick={() => {
                    navigate(ROUTES.ADMIN.PROFILE);
                    setProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/8 rounded-lg flex items-center gap-3 transition-colors font-medium cursor-pointer"
                >
                  <ICONS.User className="w-4 h-4 text-white/40" />
                  My Profile
                </button>
                <button 
                  onClick={() => {
                    navigate(ROUTES.ADMIN.SETTINGS);
                    setProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/8 rounded-lg flex items-center gap-3 transition-colors font-medium cursor-pointer"
                >
                  <ICONS.Settings className="w-4 h-4 text-white/40" />
                  Settings
                </button>
              </div>
              
              <div className="border-t border-white/10 mt-1 px-2 pt-2">
                <button 
                  onClick={async () => {
                    await logout()
                    navigate(ROUTES.ADMIN.LOGIN)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[#E94B4B] hover:bg-[#E94B4B]/10 rounded-lg flex items-center gap-3 transition-colors font-medium cursor-pointer"
                >
                  <ICONS.Logout className="w-4 h-4 text-[#E94B4B]" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
