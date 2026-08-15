// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

import PageLayout from './components/layout/PageLayout'
import HomePage   from './pages/HomePage'

import Aimsandscope       from './pages/about/Aimsandscope'
import Editorialboard     from './pages/about/Editorialboard'
import Editorialpolicies  from './pages/about/Editorialpolicies'
import Ethics             from './pages/about/Ethics'
import Indexing           from './pages/about/Indexing'
import Journalinformation from './pages/about/Journalinformation'

import Currentissue    from './pages/articles/Currentissue'
import Issueinprogress from './pages/articles/Issueinprogress'
import Archive         from './pages/articles/Archive'
import IssueDetail     from './pages/articles/IssueDetail'
import ArticleDetail   from './pages/articles/ArticleDetail'

import Instructions     from './pages/author/Instructions'
import Charges          from './pages/author/Charges'
import SubmitManuscript from './pages/author/SubmitManuscript'
import TrackManuscript  from './pages/author/TrackManuscript'
import GetCertificate   from './pages/author/GetCertificate'
import MySubmissions    from './pages/author/MySubmissions'

import CallForPapers     from './pages/updates/CallForPapers'
import NewsAndHighlights from './pages/updates/NewsAndHighlights'
import Testimonials      from './pages/updates/Testimonials'

import JoinPage       from './pages/join/JoinPage'
import ContactPage    from './pages/ContactPage'
import PendingReviews from './pages/reviewer/PendingReviews'

import AdminLogin        from './pages/admin/AdminLogin'
import AdminLayout       from './pages/admin/AdminLayout'
import Dashboard         from './pages/admin/Dashboard'
import ManuscriptsReview from './pages/admin/ManuscriptsReview'
import UsersManagement   from './pages/admin/UsersManagement'
import IssuesManagement  from './pages/admin/IssuesManagement'
import ApplicationsPage  from './pages/admin/ApplicationsPage'
import MessagesPage      from './pages/admin/MessagesPage'
import Settings          from './pages/admin/Settings'

// Reviewer goes straight to manuscripts — they cannot access the stats dashboard
const AdminIndex = () => {
  const { user } = useAuth()
  if (user?.role === 'reviewer') return <Navigate to="/admin/manuscripts" replace />
  return <Navigate to="/admin/dashboard" replace />
}

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isReviewer, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated || !isReviewer) return <Navigate to="/admin/login" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PageLayout />}>
        <Route index element={<HomePage />} />

        <Route path="aims-and-scope"      element={<Aimsandscope />} />
        <Route path="editorial-board"     element={<Editorialboard />} />
        <Route path="editorial-policies"  element={<Editorialpolicies />} />
        <Route path="ethics"              element={<Ethics />} />
        <Route path="indexing"            element={<Indexing />} />
        <Route path="journal-information" element={<Journalinformation />} />

        <Route path="current-issue"                    element={<Currentissue />} />
        <Route path="issue-in-progress"                element={<Issueinprogress />} />
        <Route path="archive"                          element={<Archive />} />
        <Route path="archive/issue/:volumeId/:issueId" element={<IssueDetail />} />
        <Route path="article/:id"                      element={<ArticleDetail />} />

        <Route path="instructions"      element={<Instructions />} />
        <Route path="charges"           element={<Charges />} />
        <Route path="submit-manuscript" element={<SubmitManuscript />} />
        <Route path="track-manuscript"  element={<TrackManuscript />} />
        <Route path="get-certificate"   element={<GetCertificate />} />
        <Route path="my-submissions"    element={<MySubmissions />} />

        <Route path="call-for-papers" element={<CallForPapers />} />
        <Route path="news-highlights" element={<NewsAndHighlights />} />
        <Route path="testimonials"    element={<Testimonials />} />

        <Route path="join"    element={<JoinPage />} />
        <Route path="contact" element={<ContactPage />} />

        <Route path="reviewer/pending-reviews" element={<PendingReviews />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route path="/admin" element={
        <ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>
      }>
        <Route index element={<AdminIndex />} />
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="manuscripts"  element={<ManuscriptsReview />} />
        <Route path="issues"       element={<IssuesManagement />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="messages"     element={<MessagesPage />} />
        <Route path="users"        element={<UsersManagement />} />
        <Route path="settings"     element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App