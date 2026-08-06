import { useEffect, useState } from 'react'
import { getAnalyticsSummary } from '../services/api'
import Layout from '../components/Layout'
import { FileText, Mic, Target, Brain, TrendingUp, AlertCircle } from 'lucide-react'

function LineChart({ data, color = '#4f46e5', height = 160 }) {
  if (!data.length) return <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No data yet</p>
  const width = 600
  const max = 100
  const min = 0
  const stepX = data.length > 1 ? width / (data.length - 1) : 0
  const points = data.map((d, i) => {
    const x = data.length > 1 ? i * stepX : width / 2
    const y = height - ((d.score - min) / (max - min)) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = data.length > 1 ? i * stepX : width / 2
        const y = height - ((d.score - min) / (max - min)) * height
        return <circle key={i} cx={x} cy={y} r="4" fill={color} />
      })}
    </svg>
  )
}

function BarChart({ data }) {
  if (!data.length) return <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No data yet</p>
  const max = 10
  return (
    <div className="space-y-4">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium text-gray-700 dark:text-gray-300">{d.category}</span>
            <span className="text-gray-400 dark:text-gray-500">{d.average_score}/10 · {d.count} answers</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(d.average_score / max) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { window.location.href = '/login'; return }
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getAnalyticsSummary()
      setData(res)
    } catch (err) {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <AlertCircle size={48} className="text-orange-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </Layout>
    )
  }

  const stats = [
    { label: 'Resumes Analyzed', value: data.resumes_analyzed, icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Interviews Done', value: data.interviews_done, icon: Mic, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-500/10' },
    { label: 'Avg ATS Score', value: data.avg_ats_score ?? 'N/A', icon: Target, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { label: 'Avg Interview Score', value: data.avg_interview_score ?? 'N/A', icon: Brain, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  ]

  return (
    <Layout>
      <div className="bg-white dark:bg-panel-dark border-b border-gray-100 dark:border-border-dark px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track your progress over time</p>
      </div>

      <div className="px-8 py-8">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-panel-dark rounded-xl border border-gray-100 dark:border-border-dark p-5 shadow-sm">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-gray-900 dark:text-white">ATS Score Trend</h3>
            </div>
            <LineChart data={data.ats_trend} color="#6366f1" />
          </div>

          <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={18} className="text-pink-600 dark:text-pink-400" />
              <h3 className="font-bold text-gray-900 dark:text-white">Interview Score Trend</h3>
            </div>
            <LineChart data={data.interview_trend.map(d => ({ ...d, score: d.score * 10 }))} color="#ec4899" />
          </div>
        </div>

        <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5">Performance by Category</h3>
          <BarChart data={data.category_breakdown} />
        </div>

      </div>
    </Layout>
  )
}

export default Analytics