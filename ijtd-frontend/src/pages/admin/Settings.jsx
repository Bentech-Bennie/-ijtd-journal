// src/pages/admin/Settings.jsx
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authFetchJson, authUrl } from '../../utils/auth'
import { Lock, Save, CheckCircle, AlertCircle, Loader } from 'lucide-react'

const Settings = () => {
  const { user } = useAuth()

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg]       = useState(null)

  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }))

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwMsg(null)
    if (pwForm.new_password !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    if (pwForm.new_password.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }
    setPwSaving(true)
    try {
      await authFetchJson(authUrl('/change-password'), {
        method: 'POST',
        body: JSON.stringify({ current_password: pwForm.current_password, new_password: pwForm.new_password }),
      })
      setPwMsg({ type: 'success', text: 'Password changed successfully' })
      setPwForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message })
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Profile info (read-only) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">My Profile</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Full Name</p>
            <p className="font-semibold text-gray-900 mt-0.5">{user?.full_name}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-semibold text-gray-900 mt-0.5">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Role</p>
            <p className="font-semibold text-gray-900 mt-0.5 capitalize">{user?.role}</p>
          </div>
          <div>
            <p className="text-gray-500">Institution</p>
            <p className="font-semibold text-gray-900 mt-0.5">{user?.institution || '—'}</p>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />Change Password
        </h2>

        {pwMsg && (
          <div className={`flex items-center gap-3 rounded-lg p-3 mb-4 text-sm ${pwMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {pwMsg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={pwForm.current_password}
              onChange={e => setPw('current_password', e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={pwForm.new_password}
              onChange={e => setPw('new_password', e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={pwForm.confirm}
              onChange={e => setPw('confirm', e.target.value)}
              placeholder="Repeat new password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={pwSaving}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {pwSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {pwSaving ? 'Saving…' : 'Save Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Settings