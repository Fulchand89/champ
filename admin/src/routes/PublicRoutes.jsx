import React, { lazy, Suspense } from 'react'
import { ROUTES } from '../constants/routes'

const KnowChampHome = lazy(() => import('../pages/know-champ/Home'))
const ContestPage = lazy(() => import('../pages/know-champ/Contest'))
const ExcellenceLeaguePage = lazy(() => import('../pages/know-champ/ExcellenceLeague'))
const HowItWorksPage = lazy(() => import('../pages/know-champ/HowItWorks'))
const LeaderboardPage = lazy(() => import('../pages/know-champ/Leaderboard'))
const Login = lazy(() => import('../pages/admin/Login'))
const RegisterPage = lazy(() => import('../pages/know-champ/Register'))
const PublicPrivacyPolicy = lazy(() => import('../pages/know-champ/PublicPrivacyPolicy'))
const PublicTermsConditions = lazy(() => import('../pages/know-champ/PublicTermsConditions'))
const PublicRefundPolicy = lazy(() => import('../pages/know-champ/PublicRefundPolicy'))
const PublicSupportContact = lazy(() => import('../pages/know-champ/PublicSupportContact'))

const withSuspense = (Component) => (
  <Suspense fallback={
    <div className="flex items-center justify-center min-h-screen bg-[#090b15]">
      <div className="w-8 h-8 border-4 border-[#E94B4B] border-t-transparent rounded-full animate-spin"></div>
    </div>
  }>
    <Component />
  </Suspense>
)

const PublicRoutes = [
  {
    path: ROUTES.HOME,
    element: withSuspense(KnowChampHome),
  },
  {
    path: '/excellence-league',
    element: withSuspense(ExcellenceLeaguePage),
  },
  {
    path: '/excellence-league/:leagueSlug',
    element: withSuspense(ExcellenceLeaguePage),
  },
  {
    path: '/excellence-leagues/:leagueSlug',
    element: withSuspense(ExcellenceLeaguePage),
  },
  {
    path: '/league',
    element: withSuspense(ExcellenceLeaguePage),
  },
  {
    path: '/contests',
    element: withSuspense(ContestPage),
  },
  {
    path: '/how-it-works',
    element: withSuspense(HowItWorksPage),
  },
  {
    path: '/leaderboard',
    element: withSuspense(LeaderboardPage),
  },
  {
    path: '/register',
    element: withSuspense(RegisterPage),
  },
  {
    path: '/privacy-policy',
    element: withSuspense(PublicPrivacyPolicy),
  },
  {
    path: '/terms-conditions',
    element: withSuspense(PublicTermsConditions),
  },
  {
    path: '/refund-policy',
    element: withSuspense(PublicRefundPolicy),
  },
  {
    path: '/contact',
    element: withSuspense(PublicSupportContact),
  },
  {
    path: '/support',
    element: withSuspense(PublicSupportContact),
  },
  {
    path: '/support-contact',
    element: withSuspense(PublicSupportContact),
  },
  {
    path: ROUTES.ADMIN.LOGIN,
    element: withSuspense(Login),
  },
]

export default PublicRoutes
