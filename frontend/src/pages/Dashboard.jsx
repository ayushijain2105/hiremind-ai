import { useEffect, useState } from 'react'
import { FileText, Target, Brain, Mic, HelpCircle, BarChart2, Bell, Search, LogOut, TrendingUp } from 'lucide-react'
import Sidebar from '../components/Sidebar'

const features = [
  {
    icon: FileText,
    title: 'Resume Analysis',
    desc: 'Upload your resume and get instant AI-powered feedback on structure, content and impact.',
    tag: 'Most Popular',
    tagColor: 'bg-blue-50 text-blue-600',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    btn: 'Analyze Resume',
  },
  {
    icon: Target,
    title: 'ATS Score',
    desc: 'See exactly how your resume performs against Applicant Tracking Systems used by top companies.',
    tag: 'Important',
    tagColor: 'bg-orange-50 text-orange-600',
    btnColor: 'bg-orange-500 hover:bg-orange-600',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    btn: 'Check Score',
  },
  {
    icon: Brain,
    title: 'Skill Gap Analysis',
    desc: 'Discover exactly which skills you are missing for your target role and how to fill the gaps.',
    tag: 'New',
    tagColor: 'bg-purple-50 text-purple-600',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    btn: 'Analyze Skills',
  },
  {
    icon: HelpCircle,
    title: 'Interview Questions',
    desc: 'Get personalized interview questions generated from your resume by AI.',
    tag: 'AI Powered',
    tagColor: 'bg-green-50 text-green-600',
    btnColor: 'bg-green-600 hover:bg-green-700',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    btn: 'Generate Questions',
  },
  {
    icon: Mic,
    title: 'Mock Interview',
    desc: 'Practice with a real-time AI interviewer and get evaluated on your answers instantly.',
    tag: 'Interactive',
    tagColor: 'bg-pink-50 text-pink-600',
    btnColor: 'bg-pink-600 hover:bg-pink-700',
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    btn: 'Start Interview',
  },
  {
    icon: BarChart2,
    title: 'AI Feedback',
    desc: 'Receive detailed performance feedback with actionable improvement suggestions.',
    tag: 'Detailed',
    tagColor: 'bg-indigo-50 text-indigo-600',
    btnColor: 'bg-indigo-600 hover:bg-indigo-700',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    btn: 'View Feedback',
  },
]

const stats = [
  { label: 'Resumes Analyzed', value: '0', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Interviews Done', value: '0', icon: Mic, color: 'text-pink-600', bg: 'bg-pink-50' },
  { label: 'ATS Score', value: 'N/A', icon: Target, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Skills Found', value: '0', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
]

function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      window.location.href = '/login'
      return
    }
    setUser(JSON.parse(userData))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Navbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-72">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search features..."
              className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-50 transition">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <LogOut size={15} />
                <span className="hidden md:block">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="px-8 py-8">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <Brain size={180} className="text-white" />
            </div>
            <div className="relative z-10">
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                AI-Powered Career Platform
              </span>
              <h2 className="text-4xl font-bold text-white mb-3">
                Hello, {user.name.split(' ')[0]}! 👋
              </h2>
              <p className="text-blue-100 text-lg mb-2">Ready to crack your dream interview?</p>
              <div className="flex flex-wrap gap-4 mb-6 text-blue-100 text-sm">
                {['ATS Score', 'Skill Analysis', 'AI Feedback', 'Mock Interviews'].map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</span>
                    {item}
                  </span>
                ))}
              </div>
              <button className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition flex items-center gap-2">
                <FileText size={16} />
                Upload Resume
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition hover:-translate-y-0.5 duration-200">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Progress Banner */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Complete your profile to unlock all features</p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-blue-600 h-1.5 rounded-full w-1/4"></div>
              </div>
            </div>
            <span className="text-sm font-semibold text-blue-600">25%</span>
          </div>

          {/* Features Grid */}
          <h3 className="text-lg font-bold text-gray-900 mb-5">All Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center`}>
                    <feature.icon size={22} className={feature.iconColor} />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${feature.tagColor}`}>
                    {feature.tag}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-base mb-2">{feature.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{feature.desc}</p>
                <button className={`w-full text-white py-2.5 rounded-xl text-sm font-semibold transition duration-200 ${feature.btnColor}`}>
                  {feature.btn}
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            HireMind AI © 2024 · Built for placement preparation · All rights reserved
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard