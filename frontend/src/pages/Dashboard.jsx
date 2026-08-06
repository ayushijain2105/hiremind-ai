import { useEffect, useState } from 'react'
import { FileText, Target, Brain, Mic, HelpCircle, BarChart2, Bell, Search, LogOut, TrendingUp } from 'lucide-react'
import Layout from '../components/Layout'
import { getAnalyticsSummary } from '../services/api'

const features = [
  {
    icon: FileText,
    title: 'Resume Analysis',
    desc: 'Upload your resume and get instant AI-powered feedback on structure, content and impact.',
    tag: 'Most Popular',
    tagColor: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    btn: 'Analyze Resume',
    link: '/analysis',
  },
  {
    icon: Target,
    title: 'ATS Score',
    desc: 'See exactly how your resume performs against Applicant Tracking Systems used by top companies.',
    tag: 'Important',
    tagColor: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
    btnColor: 'bg-orange-500 hover:bg-orange-600',
    iconBg: 'bg-orange-50 dark:bg-orange-500/10',
    iconColor: 'text-orange-500',
    btn: 'Check Score',
    link: '/analysis?tab=ats',
  },
  {
    icon: Brain,
    title: 'Skill Gap Analysis',
    desc: 'Discover exactly which skills you are missing for your target role and how to fill the gaps.',
    tag: 'New',
    tagColor: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    iconBg: 'bg-purple-50 dark:bg-purple-500/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
    btn: 'Analyze Skills',
    link: '/analysis?tab=skills',
  },
  {
    icon: HelpCircle,
    title: 'Interview Questions',
    desc: 'Get personalized interview questions generated from your resume by AI.',
    tag: 'AI Powered',
    tagColor: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
    btnColor: 'bg-green-600 hover:bg-green-700',
    iconBg: 'bg-green-50 dark:bg-green-500/10',
    iconColor: 'text-green-600 dark:text-green-400',
    btn: 'Generate Questions',
    link: '/interview-questions',
  },
  {
    icon: Mic,
    title: 'Mock Interview',
    desc: 'Practice with a real-time AI interviewer and get evaluated on your answers instantly.',
    tag: 'Interactive',
    tagColor: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400',
    btnColor: 'bg-pink-600 hover:bg-pink-700',
    iconBg: 'bg-pink-50 dark:bg-pink-500/10',
    iconColor: 'text-pink-600 dark:text-pink-400',
    btn: 'Start Interview',
    link: '/mock-interview',
  },
  {
    icon: BarChart2,
    title: 'AI Feedback',
    desc: 'Receive detailed performance feedback with actionable improvement suggestions.',
    tag: 'Detailed',
    tagColor: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    btnColor: 'bg-indigo-600 hover:bg-indigo-700',
    iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    btn: 'View Feedback',
    link: '/analysis?tab=feedback',
  },
]

function Dashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState([
    { label: 'Resumes Analyzed', value: '0', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Interviews Done', value: '0', icon: Mic, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-500/10' },
    { label: 'ATS Score', value: 'N/A', icon: Target, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { label: 'Skills Found', value: '0', icon: Brain, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  ])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      window.location.href = '/login'
      return
    }
    setUser(JSON.parse(userData))
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getAnalyticsSummary()
      setStats([
        { label: 'Resumes Analyzed', value: data.resumes_analyzed, icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
        { label: 'Interviews Done', value: data.interviews_done, icon: Mic, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-500/10' },
        { label: 'ATS Score', value: data.latest_ats_score ?? 'N/A', icon: Target, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
        { label: 'Skills Found', value: data.skills_found_count, icon: Brain, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
      ])
    } catch (err) {
      // keep defaults if not enough data yet
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  if (!user) return null

  return (
    <Layout>
      <header className="sticky top-0 z-10 bg-white dark:bg-panel-dark border-b border-gray-100 dark:border-border-dark px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-border-dark rounded-xl px-4 py-2 w-72">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search features..."
            className="bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none w-full placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition">
            <Bell size={18} className="text-gray-500 dark:text-gray-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-border-dark">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut size={15} />
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-8 py-8">
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
            <button
              onClick={() => window.location.href = '/upload-resume'}
              className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition flex items-center gap-2"
            >
              <FileText size={16} />
              Upload Resume →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-panel-dark rounded-xl border border-gray-100 dark:border-border-dark p-5 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-brand-500/30 transition-all hover:-translate-y-0.5 duration-200">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-panel-dark rounded-xl border border-gray-100 dark:border-border-dark p-5 mb-8 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-yellow-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Complete your profile to unlock all features</p>
            <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 mt-2">
              <div className="bg-blue-600 h-1.5 rounded-full w-1/4"></div>
            </div>
          </div>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">25%</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">All Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white dark:bg-panel-dark rounded-xl border border-gray-100 dark:border-border-dark p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-5">
                <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center`}>
                  <feature.icon size={22} className={feature.iconColor} />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${feature.tagColor}`}>
                  {feature.tag}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base mb-2">{feature.title}</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5">{feature.desc}</p>
              <button
                onClick={() => window.location.href = feature.link}
                className={`w-full text-white py-2.5 rounded-xl text-sm font-semibold transition duration-200 ${feature.btnColor}`}
              >
                {feature.btn}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-border-dark text-center text-xs text-gray-400 dark:text-gray-500">
          HireMind AI © 2024 · Built for placement preparation · All rights reserved
        </div>
      </main>
    </Layout>
  )
}

export default Dashboard