import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getLatestAnalysis, getAnalysisById } from '../services/api'
import Layout from '../components/Layout'
import {
  CheckCircle, XCircle, AlertCircle, Star,
  TrendingUp, Award, BookOpen, Lightbulb,
  ArrowRight, RefreshCw, Target, Brain, FileText, Upload
} from 'lucide-react'

function ScoreCircle({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-40 h-40">
        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" className="dark:stroke-white/10" />
          <circle
            cx="80" cy="80" r="70"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${2 * Math.PI * 70}`}
            strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{score}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
        </div>
      </div>
      <span className="mt-4 text-lg font-bold" style={{ color }}>
        {label}
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">ATS Score</span>
    </div>
  )
}

const TABS = [
  { key: 'overview', label: 'Overview', icon: FileText },
  { key: 'ats', label: 'ATS Score', icon: Target },
  { key: 'skills', label: 'Skill Gap', icon: Brain },
  { key: 'feedback', label: 'AI Feedback', icon: Lightbulb },
]

function AnalysisResult() {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const atsRef = useRef(null)
  const skillsRef = useRef(null)
  const feedbackRef = useRef(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      window.location.href = '/login'
      return
    }
    fetchAnalysis()
  }, [])

  useEffect(() => {
    if (!analysis) return
    const refs = { ats: atsRef, skills: skillsRef, feedback: feedbackRef }
    const target = refs[activeTab]
    if (target?.current) {
      setTimeout(() => {
        target.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [activeTab, analysis])

  const fetchAnalysis = async () => {
    setLoading(true)
    try {
      const data = await getLatestAnalysis()
      setAnalysis(data)
    } catch (err) {
      setError('empty')
    } finally {
      setLoading(false)
    }
  }

  const goToTab = (key) => {
    setSearchParams(key === 'overview' ? {} : { tab: key })
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-100 dark:border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your analysis...</p>
        </div>
      </div>
    </Layout>
  )

  if (error) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload size={28} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-700 dark:text-gray-200 font-semibold mb-1">No resume analyzed yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Upload and analyze a resume to see your ATS score, skill gaps, and AI feedback here.</p>
          <button
            onClick={() => window.location.href = '/upload-resume'}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Upload Resume
          </button>
        </div>
      </div>
    </Layout>
  )

  const { analysis: a, filename } = analysis

  return (
    <Layout>
      {/* Header */}
      <div className="bg-white dark:bg-panel-dark border-b border-gray-100 dark:border-border-dark px-8 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Analysis</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{filename}</p>
          </div>
          <button
            onClick={() => window.location.href = '/upload-resume'}
            className="flex items-center gap-2 border border-gray-200 dark:border-border-dark text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            <RefreshCw size={14} />
            Analyze New Resume
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => goToTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                activeTab === tab.key
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-8">

        {/* Top Section — Score + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center">
            <ScoreCircle score={a.ats_score} />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} className="text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Overall Summary</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{a.overall_summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Experience Level</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{a.experience_level}</p>
              </div>
              <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Keywords Found</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{a.keywords_found.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* === ATS SECTION === */}
        <div ref={atsRef} className={`rounded-2xl mb-6 ${activeTab === 'ats' ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-surface-dark' : ''}`}>
          <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} className="text-orange-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">ATS Score Details</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {a.keywords_found.map((keyword, i) => (
                <span key={i} className="bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                  {keyword}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your resume matched {a.keywords_found.length} ATS-relevant keywords.</p>
          </div>
        </div>

        {/* Top Skills */}
        <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow duration-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-yellow-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">Top Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {a.top_skills.map((skill, i) => (
              <span key={i} className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-4 py-1.5 rounded-full text-sm font-semibold">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* === SKILL GAP SECTION === */}
        <div ref={skillsRef} className={`rounded-2xl mb-6 ${activeTab === 'skills' ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-surface-dark' : ''}`}>
          <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-orange-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Missing Skills</h3>
              <span className="ml-auto text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2.5 py-1 rounded-full font-semibold">
                Add these to your resume
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {a.missing_skills.map((skill, i) => (
                <span key={i} className="bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 px-4 py-1.5 rounded-full text-sm font-medium">
                  + {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* === FEEDBACK SECTION === */}
        <div ref={feedbackRef} className={`rounded-2xl mb-6 ${activeTab === 'feedback' ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-surface-dark' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Strengths</h3>
              </div>
              <div className="space-y-3">
                {a.strengths.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle size={18} className="text-red-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">Weaknesses</h3>
              </div>
              <div className="space-y-3">
                {a.weaknesses.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <XCircle size={12} className="text-red-500" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-yellow-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Improvement Suggestions</h3>
            </div>
            <div className="space-y-3">
              {a.improvement_suggestions.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl">
                  <span className="w-6 h-6 bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center text-xs font-bold text-yellow-700 dark:text-yellow-400 flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} />
            <h3 className="font-bold">What's Next?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Mock Interview', desc: 'Practice with AI interviewer', link: '/mock-interview' },
              { title: 'Skill Gap Analysis', desc: 'Deep dive into missing skills', link: '/analysis?tab=skills' },
              { title: 'Interview Questions', desc: 'Get personalized questions', link: '/interview-questions' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => window.location.href = item.link}
                className="flex items-center justify-between bg-white/10 hover:bg-white/20 transition rounded-xl p-4 text-left"
              >
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-blue-100 text-xs mt-0.5">{item.desc}</p>
                </div>
                <ArrowRight size={16} className="text-blue-200" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}

export default AnalysisResult