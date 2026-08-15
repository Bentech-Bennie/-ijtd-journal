// src/pages/admin/MessagesPage.jsx
import { useState, useEffect } from 'react'
import { authFetchJson, adminUrl } from '../../utils/auth'
import { Mail, MailOpen, Loader, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'

const MessagesPage = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = unreadOnly ? '?unread=true' : ''
      const data = await authFetchJson(adminUrl(`/messages${params}`))
      setMessages(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [unreadOnly])

  const markRead = async (id) => {
    try {
      await authFetchJson(adminUrl(`/messages/${id}/read`), { method: 'PUT' })
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
    } catch {/* silent */}
  }

  const toggle = (id) => {
    if (expanded === id) {
      setExpanded(null)
    } else {
      setExpanded(id)
      const msg = messages.find(m => m.id === id)
      if (msg && !msg.is_read) markRead(id)
    }
  }

  const unreadCount = messages.filter(m => !m.is_read).length

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-blue-600 mt-1">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} className="w-4 h-4 text-blue-600" />
            Unread only
          </label>
          <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400"><Loader className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…</div>
      ) : messages.length === 0 ? (
        <div className="p-12 text-center text-gray-400">No messages</div>
      ) : (
        <div className="space-y-2">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`bg-white rounded-xl border transition-all ${!msg.is_read ? 'border-blue-200 shadow-sm' : 'border-gray-100'}`}
            >
              <button
                onClick={() => toggle(msg.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 rounded-xl transition-colors"
              >
                {msg.is_read
                  ? <MailOpen className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  : <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold truncate ${!msg.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {msg.subject}
                    </p>
                    {!msg.is_read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{msg.name} · {msg.email} · {msg.created_at}</p>
                </div>
                {expanded === msg.id
                  ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>

              {expanded === msg.id && (
                <div className="px-6 pb-5 pt-1 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                    <div><span className="font-medium">From:</span> {msg.name}</div>
                    <div><span className="font-medium">Email:</span> <a href={`mailto:${msg.email}`} className="text-blue-600 hover:underline">{msg.email}</a></div>
                    <div className="col-span-2"><span className="font-medium">Date:</span> {msg.created_at}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </div>
                  <div className="mt-3">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors"
                    >
                      <Mail className="w-4 h-4" />Reply via email
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MessagesPage