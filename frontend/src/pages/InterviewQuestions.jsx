import { useEffect, useState } from 'react'
import { generateQuestions } from '../services/api'
import Layout from '../components/Layout'
import {
  Brain, RefreshCw, ChevronDown, ChevronUp, CheckCircle,
  AlertTriangle, MessageSquare, Lightbulb, Target, Layers
} from 'lucide-react'

const difficultyColor = {
  Easy: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400',
  Medium: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  Hard: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400',
}

const categoryColor = {
  Technical: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  HR: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
  Behavioral: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',
}

function Section({ icon: Icon, title, children, color }) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={13} className={color} />
        <p className={`text-xs font-semibold ${color}`}>{title}</p>
      </div>
      {children}
    </div>
  )
}

function QuestionCard({ q }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="bg-white dark:bg-panel-dark border border-gray-100 dark:border-border-dark rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-100 dark:hover:border-brand-500/30 transition-all duration-200"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {q.id}
          </span>
          <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">{q.question}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0 mt-1" />}
      </div>
      <div className="flex items-center gap-2 mt-3 ml-10">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColor[q.category] || 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400'}`}>
          {q.category}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColor[q.difficulty] || 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400'}`}>
          {q.difficulty}
        </span>
      </div>

      {open && (
        <div className="mt-4 ml-10 pl-4 border-l-2 border-gray-100 dark:border-border-dark">

          {q.interviewer_expectation && (
            <Section icon={Target} title="What the interviewer expects" color="text-indigo-600 dark:text-indigo-400">
              <p className="text-sm text-gray-600 dark:text-gray-300">{q.interviewer_expectation}</p>
            </Section>
          )}

          {q.explanation && (
            <Section icon={Brain} title="Explanation" color="text-gray-500 dark:text-gray-400">
              <p className="text-sm text-gray-600 dark:text-gray-300">{q.explanation}</p>
            </Section>
          )}

          {q.ideal_answer && (
            <Section icon={CheckCircle} title="Sample answer" color="text-green-600 dark:text-green-400">
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-500/10 p-3 rounded-lg">{q.ideal_answer}</p>
            </Section>
          )}

          {q.key_points?.length > 0 && (
            <Section icon={Layers} title="Key points to mention" color="text-blue-600 dark:text-blue-400">
              <ul className="space-y-1">
                {q.key_points.map((p, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span> {p}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {q.common_mistakes?.length > 0 && (
            <Section icon={AlertTriangle} title="Common mistakes to avoid" color="text-red-500">
              <ul className="space-y-1">
                {q.common_mistakes.map((m, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span> {m}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {q.follow_up_questions?.length > 0 && (
            <Section icon={MessageSquare} title="Possible follow-up questions" color="text-purple-600 dark:text-purple-400">
              <ul className="space-y-1">
                {q.follow_up_questions.map((f, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span> {f}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {q.related_concepts?.length > 0 && (
            <Section icon={Lightbulb} title="Related concepts" color="text-yellow-600 dark:text-yellow-400">
              <div className="flex flex-wrap gap-2">
                {q.related_concepts.map((c, i) => (
                  <span key={i} className="text-xs bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2.5 py-1 rounded-full font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </Section>
          )}
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
    <Layout>
      <div className="bg-white dark:bg-panel-dark border-b border-gray-100 dark:border-border-dark px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Preparation</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Complete prep guide — sample answers, key points, and follow-ups for each question</p>
        </div>
        <button
          onClick={fetchQuestions}
          disabled={loading}
          className="flex items-center gap-2 border border-gray-200 dark:border-border-dark text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Regenerate
        </button>
      </div>

      <div className="px-8 py-8 max-w-3xl">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-14 h-14 border-4 border-blue-100 dark:border-blue-500/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">Building your prep guide...</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">AI is reading your resume</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-24">
            <Brain size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/upload-resume'}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Upload Resume First
            </button>
          </div>
        )}

        {!loading && !error && questions.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-panel-dark border border-gray-100 dark:border-border-dark rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{questions.length}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Total Questions</p>
              </div>
              <div className="bg-white dark:bg-panel-dark border border-gray-100 dark:border-border-dark rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{categories.length}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Categories</p>
              </div>
              <div className="bg-white dark:bg-panel-dark border border-gray-100 dark:border-border-dark rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {questions.filter(q => q.difficulty === 'Easy').length}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Easy Questions</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Filter:</span>
              {categories.map((cat, i) => (
                <span key={i} className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer ${categoryColor[cat] || 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400'}`}>
                  {cat}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              {questions.map((q, i) => (
                <QuestionCard key={i} q={q} />
              ))}
            </div>

            <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center">
              <h3 className="font-bold text-lg mb-2">Ready to practice?</h3>
              <p className="text-blue-100 text-sm mb-4">Start a mock interview with our AI interviewer</p>
              <button
                onClick={() => window.location.href = '/mock-interview'}
                className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition"
              >
                Start Mock Interview →
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default InterviewQuestions