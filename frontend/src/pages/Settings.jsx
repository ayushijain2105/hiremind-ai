import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Trash2, Bell, Globe, Save } from 'lucide-react'
import Layout from '../components/Layout'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { deleteAllHistory } from '../services/api'

function ToggleRow({ icon: Icon, title, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-border-dark last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <Icon size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
          {desc && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>}
        </div>
      </div>
      <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-brand-600' : 'bg-gray-200 dark:bg-white/10'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}></span>
      </button>
    </div>
  )
}

function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)

  const handleClearHistory = async () => {
    setClearing(true)
    try {
      await deleteAllHistory()
      showToast('All history cleared')
      setConfirmClear(false)
    } catch (err) {
      showToast('Failed to clear history', 'error')
    } finally {
      setClearing(false)
    }
  }

  return (
    <Layout>
      <div className="bg-white dark:bg-panel-dark border-b border-gray-100 dark:border-border-dark px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your preferences</p>
      </div>

      <div className="px-8 py-8 max-w-2xl space-y-6">

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Preferences</p>
          <ToggleRow
            icon={theme === 'dark' ? Sun : Moon}
            title="Dark Mode"
            desc="Switch between light and dark theme"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
          <ToggleRow
            icon={Bell}
            title="Notifications"
            desc="Get notified about analysis results"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <Globe size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Language</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Interface language</p>
              </div>
            </div>
            <select className="text-sm border border-gray-200 dark:border-border-dark rounded-lg px-3 py-1.5 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300">
              <option>English</option>
            </select>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Resume</p>
          <ToggleRow
            icon={Save}
            title="Auto-save analyses"
            desc="Automatically save every resume analysis to history"
            checked={autoSave}
            onChange={() => setAutoSave(!autoSave)}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-panel-dark rounded-2xl border border-red-100 dark:border-red-500/20 shadow-sm p-6">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-4">Danger Zone</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Clear all history</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Permanently delete all resume analyses</p>
            </div>
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-2 border border-red-200 dark:border-red-500/30 text-red-500 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition"
              >
                <Trash2 size={14} />
                Clear
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  disabled={clearing}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
                >
                  {clearing ? 'Clearing...' : 'Confirm'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}

export default Settings