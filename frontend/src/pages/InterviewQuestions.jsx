import { useEffect, useState } from 'react'
import { generateQuestions } from '../services/api'
import Sidebar from '../components/Sidebar'
import { Brain, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

const difficultyColor = {
  Easy: 'bg-green-50 text-green-700',
  Medium: 'bg-yellow-50 text-yellow-700',
  Hard: 'bg-red-50 text-red-700',
}

const categoryColor = {
  Technical: 'bg-blue-50 text-blue-700',
  HR: 'bg-purple-50 text-purple-700',
  Behavioral: 'bg-orange-50 text-orange-700',
}

function QuestionCard({ q }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {q.id}
          </span>
          <p className="text-sm font-medium text-gray-900 leading-relaxed">{q.question}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0 mt-1" />}
      </div>
      <div className="flex items-center gap-2 mt-3 ml-10">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColor[q.category] || 'bg-gray-50 text-gray-600'}`}>
          {q.category}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColor[q.difficulty] || 'bg-gray-50 text-gray-600'}`}>
          {q.difficulty}
        </span>
      </div>
      {open && (
        <div className="mt-4 ml-10 p-4 bg-blue-50 rounded-xl">
          <p className="text-xs font-semibold text-blue-600 mb-1">💡 Tip</p>
          <p className="text-sm text-blue-800">Think about a specific example from your projects or experience before answering this question.</p>
        </div>
      )}
    </div>
  )
}

function InterviewQuestions() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { window.location.href = '/login'; return }
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await generateQuestions()
      setQuestions(data.questions)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate questions. Please upload and analyze your resume first.')
    } finally {
      setLoading(false)
    }
  }

  const categories = [...new Set(questions.map(q => q.category))]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Questions</h1>
            <p className="text-gray-500 text-sm mt-1">AI-generated questions based on your resume</p>
          </div>
          <button
            onClick={fetchQuestions}
            disabled={loading}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Regenerate
          </button>
        </div>

        <div className="px-8 py-8 max-w-3xl">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-700 font-semibold">Generating your questions...</p>
              <p className="text-gray-400 text-sm mt-1">AI is reading your resume</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-24">
              <Brain size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-4">{error}</p>
              <button
                onClick={() => window.location.href = '/upload-resume'}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
              >
                Upload Resume First
              </button>
            </div>
          )}

          {/* Questions */}
          {!loading && !error && questions.length > 0 && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
                  <p className="text-2xl font-bold text-blue-600">{questions.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Total Questions</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
                  <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Categories</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {questions.filter(q => q.difficulty === 'Easy').length}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Easy Questions</p>
                </div>
              </div>

              {/* Category filters */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-xs font-semibold text-gray-400">Filter:</span>
                {categories.map((cat, i) => (
                  <span key={i} className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer ${categoryColor[cat] || 'bg-gray-50 text-gray-600'}`}>
                    {cat}
                  </span>
                ))}
              </div>

              {/* Question List */}
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionCard key={i} q={q} />
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center">
                <h3 className="font-bold text-lg mb-2">Ready to practice?</h3>
                <p className="text-blue-100 text-sm mb-4">Start a mock interview with our AI interviewer</p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition"
                >
                  Start Mock Interview →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default InterviewQuestions