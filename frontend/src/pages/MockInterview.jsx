import { useEffect, useRef, useState } from 'react'
import { startInterview, submitAnswer } from '../services/api'
import Layout from '../components/Layout'
import {
  Mic, Send, CheckCircle, Award, RefreshCw, AlertCircle,
  Clock, Square, ArrowRight, Lightbulb, Bot, Type
} from 'lucide-react'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

function MockInterview() {
  const [session, setSession] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [progress, setProgress] = useState({ current: 1, total: 0 })
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState(false)
  const [avgScore, setAvgScore] = useState(null)
  const [pendingNext, setPendingNext] = useState(null)
  const [pendingProgress, setPendingProgress] = useState(null)
  const [mode, setMode] = useState('text')
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { window.location.href = '/login'; return }
    beginInterview()
    return () => {
      clearInterval(timerRef.current)
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [])

  const startTimer = () => {
    startTimeRef.current = Date.now()
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }

  const beginInterview = async () => {
    setLoading(true)
    setError('')
    setCompleted(false)
    setFeedback(null)
    setAnswer('')
    setPendingNext(null)
    setPendingProgress(null)
    try {
      const data = await startInterview()
      setSession(data.session_id)
      setCurrentQuestion(data.current_question)
      setProgress({ current: 1, total: data.total_questions })
      setElapsed(0)
      startTimer()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start interview. Please analyze a resume first.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const startRecording = () => {
    if (!SpeechRecognition) { setMode('text'); return }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    let finalTranscript = answer ? answer + ' ' : ''

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interim += transcript
        }
      }
      setAnswer((finalTranscript + interim).trim())
    }

    recognition.onerror = () => setRecording(false)
    recognition.onend = () => setRecording(false)

    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
  }

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop()
    setRecording(false)
  }

  const handleSubmit = async () => {
    if (!answer.trim()) return
    if (recording) stopRecording()
    setSubmitting(true)
    clearInterval(timerRef.current)
    try {
      const data = await submitAnswer(session, answer)
      setFeedback(data.evaluation)

      if (data.is_complete) {
        setCompleted(true)
        setAvgScore(data.average_score)
      } else {
        setPendingNext(data.next_question)
        setPendingProgress(data.progress)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit answer')
      startTimer()
    } finally {
      setSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    setCurrentQuestion(pendingNext)
    setProgress(pendingProgress)
    setAnswer('')
    setFeedback(null)
    setPendingNext(null)
    setPendingProgress(null)
    setElapsed(0)
    startTimer()
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Preparing your mock interview...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error && !session) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <AlertCircle size={48} className="text-orange-400 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/upload-resume'}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Upload Resume
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const progressPct = completed ? 100 : (progress.current / progress.total) * 100

  return (
    <Layout>
      {/* Header */}
      <div className="bg-white/80 dark:bg-panel-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-border-dark px-8 py-5 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mock Interview</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">AI-powered interview simulation</p>
        </div>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="flex items-center gap-2 border border-gray-200 dark:border-border-dark text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition"
        >
          End Interview
        </button>
      </div>

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 max-w-6xl">

          {/* Main column */}
          <div>
            {!completed ? (
              <>
                {/* Status card */}
                <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-gray-900 dark:text-white text-lg">Frontend Developer Interview</h2>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        In Progress
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Question</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{progress.current} / {progress.total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1"><Clock size={12} /> Time Elapsed</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(elapsed)}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Progress</p>
                      <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 mt-1.5">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question card */}
                <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                      Question {progress.current}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                        {currentQuestion?.category}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                        {currentQuestion?.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed mb-3">
                    {currentQuestion?.question}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 inline-block px-3 py-1.5 rounded-lg">
                    Take your time and give the best answer you can.
                  </p>
                </div>

                {/* Answer input */}
                {!feedback && (
                  <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4 bg-gray-50 dark:bg-white/5 rounded-xl p-1 w-fit">
                      <button
                        onClick={() => { setMode('text'); if (recording) stopRecording() }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                          mode === 'text' ? 'bg-white dark:bg-panel-dark shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <Type size={14} /> Type Answer
                      </button>
                      <button
                        onClick={() => setMode('voice')}
                        disabled={!SpeechRecognition}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-40 ${
                          mode === 'voice' ? 'bg-white dark:bg-panel-dark shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <Mic size={14} /> Voice Answer
                      </button>
                    </div>

                    {mode === 'voice' && SpeechRecognition && (
                      <div className="bg-gradient-to-b from-indigo-50/50 dark:from-indigo-500/10 to-white dark:to-panel-dark border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-8 text-center mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          {recording ? 'Listening...' : 'Tap mic to start speaking'}
                        </p>
                        <button
                          onClick={recording ? stopRecording : startRecording}
                          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all ${
                            recording
                              ? 'bg-red-500 shadow-lg shadow-red-200 dark:shadow-none animate-pulse'
                              : 'bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700'
                          }`}
                        >
                          {recording ? <Square size={22} className="text-white" fill="white" /> : <Mic size={24} className="text-white" />}
                        </button>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">Your answer will be transcribed automatically</p>
                      </div>
                    )}

                    <div>
                      {mode === 'voice' && SpeechRecognition && (
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 h-px bg-gray-100 dark:bg-border-dark"></div>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">TRANSCRIPT — EDIT IF NEEDED</span>
                          <div className="flex-1 h-px bg-gray-100 dark:bg-border-dark"></div>
                        </div>
                      )}
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        rows={6}
                        placeholder="Type your answer here..."
                        className="w-full border border-gray-200 dark:border-border-dark rounded-xl p-4 text-sm text-gray-700 dark:text-gray-200 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-300 dark:text-gray-600">{answer.length} / 2000</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !answer.trim()}
                      className="mt-4 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Submit Answer
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Feedback + Next */}
                {feedback && (
                  <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                        <h3 className="font-bold text-gray-900 dark:text-white">Evaluation</h3>
                      </div>
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{feedback.score}/10</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{feedback.feedback}</p>
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4 flex items-start gap-2">
                      <Lightbulb size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Improvement tip</p>
                        <p className="text-sm text-indigo-800 dark:text-indigo-300">{feedback.tip}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
                    >
                      {pendingProgress ? 'Next Question' : 'Finish Interview'}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-10 text-center">
                <Award size={56} className="text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Interview complete</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Here's how you performed</p>
                <div className="inline-flex flex-col items-center bg-gradient-to-b from-indigo-50 dark:from-indigo-500/10 to-purple-50 dark:to-purple-500/10 rounded-2xl px-10 py-6 mb-8">
                  <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{avgScore}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Average Score / 10</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={beginInterview}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
                  >
                    <RefreshCw size={14} />
                    Retake Interview
                  </button>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="border border-gray-200 dark:border-border-dark text-gray-600 dark:text-gray-300 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar column */}
          <div className="space-y-6">
            {!completed && (
              <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-5">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">Interview Progress</p>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: progress.total }, (_, i) => i + 1).map((num) => {
                    const isAnswered = num < progress.current
                    const isCurrent = num === progress.current
                    return (
                      <div
                        key={num}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                          isAnswered
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {num}
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Answered</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600"></span> Current</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></span> Pending</span>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-yellow-500" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">Tips</p>
              </div>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li>Be clear and concise in your answers.</li>
                <li>Structure your response with examples.</li>
                <li>Take a deep breath and think step by step.</li>
                <li>It's okay to take your time.</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Bot size={16} />
                <p className="text-sm font-bold">AI Interviewer</p>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed">
                I'm your AI interviewer. I'll ask you real interview questions and provide detailed feedback to help you improve.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MockInterview