// src/pages/admin/AdminLayout.jsx
import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard, FileText, BookOpen, Users, Mail,
  Settings, LogOut, Menu, X, ChevronRight, Shield,
  UserCheck, AlertCircle
} from 'lucide-react'

const AdminLayout = () => {
  const { user, logout, isAuthenticated, isReviewer, isEditor, isAdmin, loading } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  if (loading) return null
  if (!isAuthenticated || !isReviewer) return <Navigate to="/admin/login" replace />

  const isReviewerOnly = user?.role === 'reviewer'
  const isEditorRole   = user?.role === 'editor'

  const roleBadge = {
    admin:    { label: 'Administrator', color: 'bg-red-100 text-red-700',    icon: Shield },
    editor:   { label: 'Editor',        color: 'bg-blue-100 text-blue-700',  icon: UserCheck },
    reviewer: { label: 'Reviewer',      color: 'bg-green-100 text-green-700',icon: FileText },
  }[user?.role] || { label: user?.role, color: 'bg-gray-100 text-gray-600', icon: Shield }

  const RoleIcon = roleBadge.icon

  const navItems = isReviewerOnly
    ? [
        { path: '/admin/manuscripts', icon: FileText, label: 'My Reviews', description: 'Manuscripts assigned to you' },
        { path: '/admin/settings',   icon: Settings, label: 'Settings' },
      ]
    : isEditorRole
    ? [
        { path: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/manuscripts',  icon: FileText,        label: 'Manuscripts', description: 'Full manuscript workflow' },
        { path: '/admin/issues',       icon: BookOpen,        label: 'Issues & Publication', description: 'Upload formatted PDFs' },
        { path: '/admin/applications', icon: UserCheck,       label: 'Applications' },
        { path: '/admin/messages',     icon: Mail,            label: 'Messages' },
        { path: '/admin/settings',     icon: Settings,        label: 'Settings' },
      ]
    : [
        { path: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/manuscripts',  icon: FileText,        label: 'Manuscripts' },
        { path: '/admin/issues',       icon: BookOpen,        label: 'Issues & Publication', description: 'Publish ready articles' },
        { path: '/admin/applications', icon: UserCheck,       label: 'Applications' },
        { path: '/admin/messages',     icon: Mail,            label: 'Messages' },
        { path: '/admin/users',        icon: Users,           label: 'Users' },
        { path: '/admin/settings',     icon: Settings,        label: 'Settings' },
      ]

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-5 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <div>
            <div className="text-white font-bold text-sm leading-tight">IJTD</div>
            <div className="text-gray-400 text-xs">Editorial Portal</div>
          </div>
        </Link>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge.color}`}>
          <RoleIcon className="w-3 h-3" />
          {roleBadge.label}
        </div>
        <div className="text-gray-300 text-sm mt-2 font-medium truncate">{user?.full_name}</div>
        <div className="text-gray-500 text-xs truncate">{user?.email}</div>
      </div>

      {/* Role notice */}
      {isReviewerOnly && (
        <div className="flex-shrink-0 mx-3 mt-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-300">You can see and review only manuscripts assigned to you by the Editor.</p>
          </div>
        </div>
      )}

      {isEditorRole && (
        <div className="flex-shrink-0 mx-3 mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">Upload the formatted PDF under <strong>Issues & Publication</strong> to mark a manuscript ready for the Admin to publish.</p>
          </div>
        </div>
      )}

      {/* Nav items - Scrollable middle section */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 mt-2">
        {navItems.map(item => {
          const Icon   = item.icon
          const active = location.pathname === item.path ||
                         (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              <div>
                <div className="text-sm font-medium leading-tight">{item.label}</div>
                {item.description && (
                  <div className={`text-xs mt-0.5 ${active ? 'text-blue-200' : 'text-gray-500 group-hover:text-gray-400'}`}>{item.description}</div>
                )}
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto mt-0.5 flex-shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0 p-3 border-t border-gray-800 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 text-sm transition-all">
          <BookOpen className="w-4 h-4" />
          View Journal Site
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 text-sm transition-all text-left">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 h-screen fixed top-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-gray-900 h-full">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 z-10">
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-900 text-sm">IJTD Editorial Portal</span>
          <div className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge.color}`}>
            <RoleIcon className="w-3 h-3" />
            {roleBadge.label}
          </div>
        </div>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout