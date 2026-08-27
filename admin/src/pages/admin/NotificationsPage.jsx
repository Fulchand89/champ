import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  RotateCw, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Info,
  Package,
  FileText,
  Wallet,
  Star,
  Users,
  Trophy,
  CreditCard,
  HelpCircle,
  Megaphone
} from 'lucide-react';
import { adminNotificationService } from '../../api/services/notificationService';
import { initAdminSocket } from '../../api/services/adminSocketService';
import Card from '../../components/common/Card';
import Badge from '../../components/ui/Badge';
import TableSkeleton from '../../components/common/TableSkeleton';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread'
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 15;

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminNotificationService.getNotifications({ page, limit });
      if (res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalItems(res.data.pagination.totalItems || 0);
          setCurrentPage(res.data.pagination.currentPage || 1);
        }
      }
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(currentPage);

    // Setup Socket Real-time Listener
    const socket = initAdminSocket();

    const handleNewNotif = (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      setTotalItems(prev => prev + 1);
    };

    const handleAdminUpdate = () => {
      fetchNotifications(currentPage);
    };

    socket.on('new_notification', handleNewNotif);
    socket.on('new_admin_notification', handleNewNotif);
    socket.on('admin_notification_update', handleAdminUpdate);

    return () => {
      socket.off('new_notification', handleNewNotif);
      socket.off('new_admin_notification', handleNewNotif);
      socket.off('admin_notification_update', handleAdminUpdate);
    };
  }, [currentPage]);

  const handleMarkAllRead = async () => {
    try {
      await adminNotificationService.markAsRead(null);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Mark all read error:', err);
      toast.error('Failed to mark all as read');
    }
  };

  const handleMarkSingleRead = async (notifId, isAlreadyRead) => {
    if (isAlreadyRead) return;
    try {
      await adminNotificationService.markAsRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      await adminNotificationService.deleteNotification(notifId);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      setTotalItems(prev => Math.max(0, prev - 1));
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Delete notification error:', err);
      toast.error('Failed to delete notification');
    }
  };

  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClearAllConfirm = async () => {
    try {
      setClearing(true);
      await adminNotificationService.deleteNotification(null);
      setNotifications([]);
      setUnreadCount(0);
      setTotalItems(0);
      toast.success('All notifications cleared successfully');
      setClearModalOpen(false);
    } catch (err) {
      console.error('Clear all notifications error:', err);
      toast.error('Failed to clear notifications');
    } finally {
      setClearing(false);
    }
  };

  const filteredNotifications = filterType === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'user':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'contest':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'withdrawal':
        return <Wallet className="w-4 h-4 text-purple-400" />;
      case 'payment':
      case 'payment_status':
      case 'wallet_credit':
        return <CreditCard className="w-4 h-4 text-green-400" />;
      case 'support':
      case 'enquiry':
        return <HelpCircle className="w-4 h-4 text-[#E94B4B]" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-orange-400" />;
      case 'review':
        return <Star className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-white/50" />;
    }
  };

  return (
    <div className="font-sans space-y-4 sm:space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0f1117] p-5 rounded-2xl border border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Notifications Center</h1>
            {unreadCount > 0 && (
              <span className="text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs" style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}>
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 mt-1">Live system notifications, user registrations, contest alerts, and withdrawals.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchNotifications(currentPage)}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#E94B4B] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 border border-[#E94B4B]/30 bg-[#E94B4B]/10 text-[#E94B4B] hover:bg-[#E94B4B]/20 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => setClearModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90"
              style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filterType === 'all'
                ? 'text-white shadow-xs'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
            }`}
            style={filterType === 'all' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
          >
            All ({totalItems})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filterType === 'unread'
                ? 'text-white shadow-xs'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
            }`}
            style={filterType === 'unread' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <p className="text-xs font-semibold text-white/40">
          Showing Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Notifications List Container */}
      <div className="bg-[#0f1117] rounded-2xl border border-white/10 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6">
            <TableSkeleton columnsCount={4} rowCount={6} />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3 border border-white/10">
              <Bell className="w-6 h-6 text-white/30" />
            </div>
            <p className="text-sm font-bold text-white">No Notifications Found</p>
            <p className="text-xs text-white/40 mt-1">You are all caught up with your admin alerts.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors hover:bg-white/5 ${
                  !notif.isRead ? 'bg-[#E94B4B]/5 border-l-4 border-l-[#E94B4B]' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-white' : 'font-medium text-white/80'}`}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#E94B4B] inline-block shadow-sm" />
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed whitespace-pre-wrap">
                      {notif.message}
                    </p>
                    <p className="text-[11px] text-white/40 font-medium mt-2">
                      {new Date(notif.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkSingleRead(notif.id, notif.isRead)}
                      title="Mark as read"
                      className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notif.id)}
                    title="Delete notification"
                    className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Standard Pagination Component */}
        {totalItems > 0 && (
          <div className="border-t border-white/10 p-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages || 1}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={(page) => setCurrentPage(page)}
              itemName="notifications"
            />
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clear All */}
      <ConfirmModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearAllConfirm}
        title="Clear All Notifications?"
        message="Are you sure you want to delete all admin notifications? This action is permanent and cannot be undone."
        confirmText="Yes, Clear All"
        cancelText="Cancel"
        type="danger"
        isLoading={clearing}
      />
    </div>
  );
};

export default NotificationsPage;
