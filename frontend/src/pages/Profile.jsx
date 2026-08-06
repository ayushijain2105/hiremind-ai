import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, LogOut, Save, Eye, EyeOff } from 'lucide-react'
import Layout from '../components/Layout'
import { updateProfile, changePassword } from '../services/api'
import { useToast } from '../context/ToastContext'

function Profile() {
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  const { showToast } = useToast()

  const [name, setName] = useState(userData.name || '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error')
      return
    }
    setSavingProfile(true)
    try {
      const updated = await updateProfile(name)
      localStorage.setItem('user', JSON.stringify({ ...userData, name: updated.name }))
      showToast('Profile updated successfully')
      window.location.reload()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update profile', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error')
      return
    }
    setSavingPassword(true)
    try {
      await changePassword(currentPassword, newPassword)
      showToast('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to change password', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <Layout>
      <div className="bg-white dark:bg-panel-dark border-b border-gray-100 dark:border-border-dark px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account information</p>
      </div>

      <div className="px-8 py-8 max-w-2xl space-y-6">

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg">{userData.name}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">{userData.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 dark:border-border-dark rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-white dark:bg-white/5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={userData.email || ''}
                  disabled
                  className="w-full border border-gray-200 dark:border-border-dark rounded-xl pl-11 pr-4 py-3 text-gray-400 dark:text-gray-500 dark:bg-white/5 bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition disabled:opacity-50"
            >
              <Save size={14} />
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>

        {/* Password card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={16} className="text-gray-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">Change Password</h3>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full border border-gray-200 dark:border-border-dark rounded-xl px-4 pr-11 py-3 text-gray-900 dark:text-white dark:bg-white/5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min. 8 characters)"
                className="w-full border border-gray-200 dark:border-border-dark rounded-xl px-4 pr-11 py-3 text-gray-900 dark:text-white dark:bg-white/5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full border border-gray-200 dark:border-border-dark rounded-xl px-4 py-3 text-gray-900 dark:text-white dark:bg-white/5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={handleChangePassword}
              disabled={savingPassword || !currentPassword || !newPassword}
              className="flex items-center gap-2 bg-gray-900 dark:bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Log out</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Sign out of your account on this device</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-red-200 dark:border-red-500/30 text-red-500 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition"
          >
            <LogOut size={14} />
            Logout
          </button>
        </motion.div>
      </div>
    </Layout>
  )
}

export default Profile