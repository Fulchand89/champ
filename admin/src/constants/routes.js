export const ROUTES = {
  HOME: '/',
  ADMIN: {
    ROOT: '/admin',
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',
    
    // USER MANAGEMENT
    MANAGE_USERS: '/admin/users',

    // QUIZ MANAGEMENT
    QUIZ_CATEGORIES: '/admin/quiz/categories',
    QUIZ_SUBJECTS: '/admin/quiz/subjects',
    QUIZ_TOPICS: '/admin/quiz/topics',
    UPLOAD_QUESTIONS: '/admin/quiz/upload-questions',
    QUESTION_BANK: '/admin/quiz/questions',

    // CONTEST MANAGEMENT
    CREATE_CONTEST: '/admin/contests/create',
    SCHEDULE_CONTEST: '/admin/contests/schedule',
    CONFIGURE_ENTRY_FEE: '/admin/contests/entry-fee',
    CONFIGURE_PRIZE_POOL: '/admin/contests/prize-pool',
    MONITOR_LIVE: '/admin/contests/live',

    // TRANSACTION MANAGEMENT
    MANAGE_TRANSACTIONS: '/admin/transactions',

    // WITHDRAWAL MANAGEMENT
    VERIFY_WITHDRAWALS: '/admin/withdrawals',

    // REPORTS & ANALYTICS
    VIEW_REPORTS: '/admin/reports',

    // COMMON
    PRIVACY_POLICY: '/admin/privacy-policy',
    TERMS_CONDITIONS: '/admin/terms-conditions',
    REFUND_POLICY: '/admin/refund-policy',
    SUPPORT_CONTACT: '/admin/support-contact',
    PROFILE: '/admin/profile',
    SETTINGS: '/admin/settings',
    NOTIFICATIONS: '/admin/notifications',
    MANAGE_FEATURES: '/admin/features',
    MANAGE_FAQ: '/admin/faq',
  },
}
