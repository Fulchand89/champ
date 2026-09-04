export const ROUTES = {
  HOME: '/',
  EXCELLENCE_LEAGUE: '/excellence-league',
  LEAGUE: '/league',
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

    // WALLET
    DEPOSITS: '/admin/deposits',
    WITHDRAWALS: '/admin/withdrawals',
    TRANSACTIONS: '/admin/transactions',

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
    MANAGE_LEADERBOARD: '/admin/cms/leaderboard',
    MANAGE_EXCELLENCE_LEAGUE: '/admin/cms/excellence-league',
    MANAGE_HOW_IT_WORKS: '/admin/cms/how-it-works',
  },
}
