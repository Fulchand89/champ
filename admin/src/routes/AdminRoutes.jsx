import React, { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import { ROUTES } from '../constants/routes'
import ProtectedRoute from './ProtectedRoute'

const Dashboard = lazy(() => import('../pages/admin/Dashboard'))
const ManageUsers = lazy(() => import('../pages/admin/ManageUsers'))
const ManageQuizCategories = lazy(() => import('../pages/admin/ManageQuizCategories'))
const ManageSubjects = lazy(() => import('../pages/admin/ManageSubjects'))
const ManageTopics = lazy(() => import('../pages/admin/ManageTopics'))
const UploadQuestions = lazy(() => import('../pages/admin/UploadQuestions'))
const ManageQuestionBank = lazy(() => import('../pages/admin/ManageQuestionBank'))
const CreateContest = lazy(() => import('../pages/admin/CreateContest'))
const ScheduleContest = lazy(() => import('../pages/admin/ScheduleContest'))
const ConfigureEntryFee = lazy(() => import('../pages/admin/ConfigureEntryFee'))
const ConfigurePrizePool = lazy(() => import('../pages/admin/ConfigurePrizePool'))
const MonitorLiveContests = lazy(() => import('../pages/admin/MonitorLiveContests'))
const Transactions = lazy(() => import('../pages/admin/Transactions'))
const Deposits = lazy(() => import('../pages/admin/Deposits'))
const Withdrawals = lazy(() => import('../pages/admin/Withdrawals'))
const ViewReports = lazy(() => import('../pages/admin/ViewReports'))
const PrivacyPolicy = lazy(() => import('../pages/admin/PrivacyPolicy'))
const TermsConditions = lazy(() => import('../pages/admin/TermsConditions'))
const RefundPolicy = lazy(() => import('../pages/admin/RefundPolicy'))
const SupportContact = lazy(() => import('../pages/admin/SupportContact'))
const Profile = lazy(() => import('../pages/admin/Profile'))
const Settings = lazy(() => import('../pages/admin/Settings'))
const NotificationsPage = lazy(() => import('../pages/admin/NotificationsPage'))
const ManageFeatures = lazy(() => import('../pages/admin/ManageFeatures'))
const ManageFAQ = lazy(() => import('../pages/admin/ManageFAQ'))

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
      path: ROUTES.ADMIN.MANAGE_TRANSACTIONS.replace(ROUTES.ADMIN.ROOT + '/', ''),
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
      path: '*',
      element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />,
    },
  ],
}

export default AdminRoutes
