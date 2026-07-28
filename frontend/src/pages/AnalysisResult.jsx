import { useEffect, useState } from 'react'
import { getLatestAnalysis } from '../services/api'
import Sidebar from '../components/Sidebar'
import {
  CheckCircle, XCircle, AlertCircle, Star,
  TrendingUp, Award, BookOpen, Lightbulb,
  ArrowRight, RefreshCw
} from 'lucide-react'

function ScoreCircle({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-40 h-40">
        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
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
          <span className="text-4xl font-bold text-gray-900">{score}</span>
          <span className="text-sm text-gray-500">/ 100</span>
        </div>
      </div>
      <span className="mt-4 text-lg font-bold" style={{ color }}>
        {label}
      </span>
      <span className="text-sm text-gray-500 mt-1">ATS Score</span>
    </div>
  )
}

function AnalysisResult() {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      window.location.href = '/login'
      return
    }
    fetchAnalysis()
  }, [])

  const fetchAnalysis = async () => {
    setLoading(true)
    try {
      const data = await getLatestAnalysis()
      setAnalysis(data)
    } catch (err) {
      setError('No analysis found. Please upload and analyze your resume first.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading your analysis...</p>
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-orange-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/upload-resume'}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Upload Resume
          </button>
        </div>
      </div>
    </div>
  )

  const { analysis: a, filename } = analysis

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resume Analysis</h1>
              <p className="text-gray-500 text-sm mt-1">{filename}</p>
            </div>
            <button
              onClick={() => window.location.href = '/upload-resume'}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              <RefreshCw size={14} />
              Analyze New Resume
            </button>
          </div>
        </div>

        <div className="px-8 py-8">

          {/* Top Section — Score + Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* ATS Score */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <ScoreCircle score={a.ats_score} />
            </div>

            {/* Summary + Experience */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={18} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900">Overall Summary</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{a.overall_summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs text-gray-400 mb-1">Experience Level</p>
                  <p className="text-xl font-bold text-blue-600">{a.experience_level}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs text-gray-400 mb-1">Keywords Found</p>
                  <p className="text-xl font-bold text-green-600">{a.keywords_found.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-yellow-500" />
              <h3 className="font-bold text-gray-900">Top Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {a.top_skills.map((skill, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Strengths + Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Strengths */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={18} className="text-green-600" />
                <h3 className="font-bold text-gray-900">Strengths</h3>
              </div>
              <div className="space-y-3">
                {a.strengths.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle size={12} className="text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle size={18} className="text-red-500" />
                <h3 className="font-bold text-gray-900">Weaknesses</h3>
              </div>
              <div className="space-y-3">
                {a.weaknesses.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <XCircle size={12} className="text-red-500" />
                    </div>
                    <p className="text-sm text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Missing Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-orange-500" />
              <h3 className="font-bold text-gray-900">Missing Skills</h3>
              <span className="ml-auto text-xs text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full font-semibold">
                Add these to your resume
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {a.missing_skills.map((skill, i) => (
                <span key={i} className="bg-orange-50 text-orange-700 border border-orange-100 px-4 py-1.5 rounded-full text-sm font-medium">
                  + {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-yellow-500" />
              <h3 className="font-bold text-gray-900">Improvement Suggestions</h3>
            </div>
            <div className="space-y-3">
              {a.improvement_suggestions.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl">
                  <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs font-bold text-yellow-700 flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Award size={18} className="text-purple-600" />
              <h3 className="font-bold text-gray-900">Keywords Found</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {a.keywords_found.map((keyword, i) => (
                <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  {keyword}
                </span>
              ))}
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
                { title: 'Mock Interview', desc: 'Practice with AI interviewer', link: '/dashboard' },
                { title: 'Skill Gap Analysis', desc: 'Deep dive into missing skills', link: '/dashboard' },
                { title: 'Interview Questions', desc: 'Get personalized questions', link: '/dashboard' },
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
      </div>
    </div>
  )
}

export default AnalysisResult