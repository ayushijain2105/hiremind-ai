import { useState } from 'react'
import { loginUser } from '../services/api'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await loginUser(form)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col justify-between p-12">
        <div>
          <h1 className="text-white text-3xl font-bold">HireMind AI</h1>
          <p className="text-blue-200 text-sm mt-1">Your AI-powered career companion</p>
        </div>
        <div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-6">
            Land your dream job with AI-powered preparation
          </h2>
          <div className="space-y-4">
            {[
              { icon: '📄', text: 'Smart Resume Analysis' },
              { icon: '🎯', text: 'ATS Score Optimization' },
              { icon: '🎤', text: 'AI Mock Interviews' },
              { icon: '📊', text: 'Personalized Feedback' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-blue-100 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {['A', 'B', 'C'].map((l, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                {l}
              </div>
            ))}
          </div>
          <p className="text-blue-200 text-sm">Join 10,000+ students preparing smarter</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-2">Sign in to continue your preparation</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 font-semibold hover:underline">
              Create one free
            </a>
          </p>

          <p className="text-center text-xs text-gray-400 mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login