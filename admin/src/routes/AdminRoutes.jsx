import React from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import { ROUTES } from '../constants/routes'
import ProtectedRoute from './ProtectedRoute'

import Dashboard from '../pages/admin/Dashboard'
import ManageUsers from '../pages/admin/ManageUsers'
import ManageQuizCategories from '../pages/admin/ManageQuizCategories'
import ManageSubjects from '../pages/admin/ManageSubjects'
import ManageTopics from '../pages/admin/ManageTopics'
import UploadQuestions from '../pages/admin/UploadQuestions'
import ManageQuestionBank from '../pages/admin/ManageQuestionBank'
import CreateContest from '../pages/admin/CreateContest'
import ScheduleContest from '../pages/admin/ScheduleContest'
import ConfigureEntryFee from '../pages/admin/ConfigureEntryFee'
import ConfigurePrizePool from '../pages/admin/ConfigurePrizePool'
import MonitorLiveContests from '../pages/admin/MonitorLiveContests'
import Transactions from '../pages/admin/Transactions'
import Deposits from '../pages/admin/Deposits'
import Withdrawals from '../pages/admin/Withdrawals'
import ViewReports from '../pages/admin/ViewReports'
import PrivacyPolicy from '../pages/admin/PrivacyPolicy'
import TermsConditions from '../pages/admin/TermsConditions'
import RefundPolicy from '../pages/admin/RefundPolicy'
import SupportContact from '../pages/admin/SupportContact'
import Profile from '../pages/admin/Profile'
import Settings from '../pages/admin/Settings'
import NotificationsPage from '../pages/admin/NotificationsPage'
import ManageFeatures from '../pages/admin/ManageFeatures'
import ManageFAQ from '../pages/admin/ManageFAQ'
import ManageLeaderboard from '../pages/admin/ManageLeaderboard'
import ManageExcellenceLeague from '../pages/admin/ManageExcellenceLeague'
import ManageHowItWorks from '../pages/admin/ManageHowItWorks'

const AdminRoutes = {
  path: ROUTES.ADMIN.ROOT,
  element: (
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />,
    },
    {
      path: ROUTES.ADMIN.DASHBOARD.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <Dashboard />,
    },
    {
      path: ROUTES.ADMIN.MANAGE_USERS.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ManageUsers />,
    },
    {
      path: ROUTES.ADMIN.QUIZ_CATEGORIES.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ManageQuizCategories />,
    },
    {
      path: ROUTES.ADMIN.QUIZ_SUBJECTS.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ManageSubjects />,
    },
    {
      path: ROUTES.ADMIN.QUIZ_TOPICS.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ManageTopics />,
    },
    {
      path: ROUTES.ADMIN.UPLOAD_QUESTIONS.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <UploadQuestions />,
    },
    {
      path: ROUTES.ADMIN.QUESTION_BANK.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ManageQuestionBank />,
    },
    {
      path: ROUTES.ADMIN.CREATE_CONTEST.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <CreateContest />,
    },
    {
      path: ROUTES.ADMIN.SCHEDULE_CONTEST.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ScheduleContest />,
    },
    {
      path: ROUTES.ADMIN.CONFIGURE_ENTRY_FEE.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ConfigureEntryFee />,
    },
    {
      path: ROUTES.ADMIN.CONFIGURE_PRIZE_POOL.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ConfigurePrizePool />,
    },
    {
      path: ROUTES.ADMIN.MONITOR_LIVE.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <MonitorLiveContests />,
    },
    {
      path: ROUTES.ADMIN.TRANSACTIONS.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <Transactions />,
    },
    {
      path: ROUTES.ADMIN.DEPOSITS.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <Deposits />,
    },
    {
      path: ROUTES.ADMIN.WITHDRAWALS.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <Withdrawals />,
    },
    {
      path: ROUTES.ADMIN.VIEW_REPORTS.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ViewReports />,
    },
    {
      path: ROUTES.ADMIN.PRIVACY_POLICY.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <PrivacyPolicy />,
    },
    {
      path: ROUTES.ADMIN.TERMS_CONDITIONS.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <TermsConditions />,
    },
    {
      path: ROUTES.ADMIN.REFUND_POLICY.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <RefundPolicy />,
    },
    {
      path: ROUTES.ADMIN.SUPPORT_CONTACT.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <SupportContact />,
    },
    {
      path: ROUTES.ADMIN.PROFILE.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <Profile />,
    },
    {
      path: ROUTES.ADMIN.SETTINGS.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <Settings />,
    },
    {
      path: ROUTES.ADMIN.NOTIFICATIONS.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <NotificationsPage />,
    },
    {
      path: ROUTES.ADMIN.MANAGE_FEATURES.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ManageFeatures />,
    },
    {
      path: ROUTES.ADMIN.MANAGE_FAQ.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ManageFAQ />,
    },
    {
      path: ROUTES.ADMIN.MANAGE_LEADERBOARD.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ManageLeaderboard />,
    },
    {
      path: ROUTES.ADMIN.MANAGE_EXCELLENCE_LEAGUE.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ManageExcellenceLeague />,
    },
    {
      path: ROUTES.ADMIN.MANAGE_HOW_IT_WORKS.replace(ROUTES.ADMIN.ROOT + '/', ''),
      element: <ManageHowItWorks />,
    },
    {
      path: '*',
      element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />,
    },
  ],
}

export default AdminRoutes
