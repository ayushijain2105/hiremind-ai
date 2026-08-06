import { useEffect, useRef, useState } from 'react'
import { startInterview, submitAnswer } from '../services/api'
import Layout from '../components/Layout'
import {
  Mic, Send, CheckCircle, Award, RefreshCw, AlertCircle,
  Clock, Square, ArrowRight, Lightbulb, Bot, Type, Play,
  X, TrendingUp, TrendingDown, ListChecks
} from 'lucide-react'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const QUESTION_TIME = 120 // seconds per question

function MockInterview() {
  const [stage, setStage] = useState('welcome') // welcome | active | complete
  const [session, setSession] = useState(null)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [progress, setProgress] = useState({ current: 1, total: 0 })
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [avgScore, setAvgScore] = useState(null)
  const [pendingNext, setPendingNext] = useState(null)
  const [pendingProgress, setPendingProgress] = useState(null)
  const [mode, setMode] = useState('text')
  const [recording, setRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [answerLog, setAnswerLog] = useState([])

  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const answerRef = useRef('')

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { window.location.href = '/login'; return }
    return () => {
      clearInterval(timerRef.current)
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [])

  useEffect(() => {
    answerRef.current = answer
  }, [answer])

  const startCountdown = () => {
    setTimeLeft(QUESTION_TIME)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          doSubmit(answerRef.current || '(No answer provided — time expired)')
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const beginInterview = async () => {
    setStarting(true)
    setError('')
    try {
      const data = await startInterview()
      setSession(data.session_id)
      setCurrentQuestion(data.current_question)
      setTotalQuestions(data.total_questions)
      setProgress({ current: 1, total: data.total_questions })
      setAnswerLog([])
      setStage('active')
      setAnswer('')
      startCountdown()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start interview. Please analyze a resume first.')
    } finally {
      setStarting(false)
    }
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
        if (event.results[i].isFinal) finalTranscript += transcript + ' '
        else interim += transcript
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

  const doSubmit = async (answerText) => {
    if (!answerText.trim()) return
    if (recording) stopRecording()
    clearInterval(timerRef.current)
    setSubmitting(true)
    try {
      const data = await submitAnswer(session, answerText)
      setFeedback(data.evaluation)
      setAnswerLog((prev) => [...prev, {
        question: currentQuestion.question,
        category: currentQuestion.category,
        score: data.evaluation.score,
        feedback: data.evaluation.feedback,
      }])

      if (data.is_complete) {
        setAvgScore(data.average_score)
      } else {
        setPendingNext(data.next_question)
        setPendingProgress(data.progress)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = () => doSubmit(answer)

  const handleNextQuestion = () => {
    if (!pendingProgress) {
      setStage('complete')
      return
    }
    setCurrentQuestion(pendingNext)
    setProgress(pendingProgress)
    setAnswer('')
    setFeedback(null)
    setPendingNext(null)
    setPendingProgress(null)
    startCountdown()
  }

  const confirmExit = () => {
    clearInterval(timerRef.current)
    if (recognitionRef.current) recognitionRef.current.stop()
    window.location.href = '/dashboard'
  }

  const strongAreas = answerLog.filter(a => a.score >= 7).map(a => a.category)
  const weakAreas = answerLog.filter(a => a.score < 5).map(a => a.category)
  const uniqueStrong = [...new Set(strongAreas)]
  const uniqueWeak = [...new Set(weakAreas)]

  // === WELCOME SCREEN ===
  if (stage === 'welcome') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[85vh] px-8">
          <div className="max-w-lg w-full bg-white dark:bg-panel-dark rounded-3xl border border-gray-100 dark:border-border-dark shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <Bot size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Mock Interview</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Practice with real interview questions generated from your resume, evaluated instantly by AI.</p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                <p className="text-lg font-bold text-gray-900 dark:text-white">10</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Questions</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                <p className="text-lg font-bold text-gray-900 dark:text-white">~20 min</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Duration</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                <p className="text-lg font-bold text-gray-900 dark:text-white">2:00</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Per Question</p>
              </div>
            </div>

            <div className="text-left bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4 mb-8">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Before you start</p>
              <ul className="text-xs text-indigo-800 dark:text-indigo-300 space-y-1">
                <li>• Each question has a 2-minute timer — it auto-submits when time runs out</li>
                <li>• You'll get AI feedback and a score after every answer</li>
                <li>• You control when to move to the next question</li>
                <li>• You can end the interview anytime</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-6 text-left">
                {error}
              </div>
            )}

            <button
              onClick={beginInterview}
              disabled={starting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {starting ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} fill="white" />}
              {starting ? 'Preparing...' : 'Start Interview'}
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  // === COMPLETE SCREEN ===
  if (stage === 'complete') {
    return (
      <Layout>
        <div className="px-8 py-10 max-w-3xl mx-auto">
          <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-10 text-center mb-6">
            <Award size={56} className="text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Interview complete</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Here's your performance report</p>
            <div className="inline-flex flex-col items-center bg-gradient-to-b from-indigo-50 dark:from-indigo-500/10 to-purple-50 dark:to-purple-500/10 rounded-2xl px-10 py-6">
              <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{avgScore}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Average Score / 10</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-green-600 dark:text-green-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Strong Areas</h3>
              </div>
              {uniqueStrong.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {uniqueStrong.map((c, i) => (
                    <span key={i} className="text-xs bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full font-medium">{c}</span>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-400 dark:text-gray-500">No standout areas yet — keep practicing.</p>}
            </div>

            <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown size={18} className="text-red-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">Needs Improvement</h3>
              </div>
              {uniqueWeak.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {uniqueWeak.map((c, i) => (
                    <span key={i} className="text-xs bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full font-medium">{c}</span>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-400 dark:text-gray-500">No major weak spots — nice work.</p>}
            </div>
          </div>

          <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-gray-900 dark:text-white">Question-wise Breakdown</h3>
            </div>
            <div className="space-y-3">
              {answerLog.map((a, i) => (
                <div key={i} className="flex items-start justify-between gap-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.question}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{a.feedback}</p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${a.score >= 7 ? 'text-green-600 dark:text-green-400' : a.score >= 5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500'}`}>
                    {a.score}/10
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => { setStage('welcome'); setError('') }}
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
      </Layout>
    )
  }

  // === ACTIVE INTERVIEW ===
  const progressPct = (progress.current / progress.total) * 100
  const timerDanger = timeLeft <= 15

  return (
    <Layout>
      <div className="bg-white/80 dark:bg-panel-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-border-dark px-8 py-5 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mock Interview</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">AI-powered interview simulation</p>
        </div>
        <button
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-2 border border-gray-200 dark:border-border-dark text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 hover:border-red-200 transition"
        >
          <X size={14} />
          End Interview
        </button>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-panel-dark rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">End this interview?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Your progress on this session won't be counted as completed. This can't be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 border border-gray-200 dark:border-border-dark text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                Continue Interview
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 max-w-6xl">

          <div>
            {/* Status card */}
            <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6 mb-6">
              <div className="flex items-center gap-8 mb-4">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Question</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{progress.current} / {progress.total}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1"><Clock size={12} /> Time Left</p>
                  <p className={`text-sm font-bold ${timerDanger ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{formatTime(timeLeft)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Progress</p>
                  <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 mt-1.5">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                  </div>
                </div>
              </div>
              {!feedback && (
                <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-1000 linear ${timerDanger ? 'bg-red-500' : 'bg-indigo-400'}`}
                    style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
                  ></div>
                </div>
              )}
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
              <p className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
                {currentQuestion?.question}
              </p>
            </div>

            {!feedback && (
              <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4 bg-gray-50 dark:bg-white/5 rounded-xl p-1 w-fit">
                  <button
                    onClick={() => { setMode('text'); if (recording) stopRecording() }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${mode === 'text' ? 'bg-white dark:bg-panel-dark shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <Type size={14} /> Type Answer
                  </button>
                  <button
                    onClick={() => setMode('voice')}
                    disabled={!SpeechRecognition}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-40 ${mode === 'voice' ? 'bg-white dark:bg-panel-dark shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <Mic size={14} /> Voice Answer
                  </button>
                </div>

                {mode === 'voice' && SpeechRecognition && (
                  <div className="bg-gradient-to-b from-indigo-50/50 dark:from-indigo-500/10 to-white dark:to-panel-dark border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-8 text-center mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{recording ? 'Listening...' : 'Tap mic to start speaking'}</p>
                    <button
                      onClick={recording ? stopRecording : startRecording}
                      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all ${recording ? 'bg-red-500 shadow-lg animate-pulse' : 'bg-indigo-600 shadow-lg hover:bg-indigo-700'}`}
                    >
                      {recording ? <Square size={22} className="text-white" fill="white" /> : <Mic size={24} className="text-white" />}
                    </button>
                  </div>
                )}

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  placeholder="Type your answer here..."
                  className="w-full border border-gray-200 dark:border-border-dark rounded-xl p-4 text-sm text-gray-700 dark:text-gray-200 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <div className="flex items-center justify-between mt-1 mb-4">
                  <span className="text-xs text-gray-300 dark:text-gray-600">{answer.length} / 2000</span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !answer.trim()}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? <><RefreshCw size={14} className="animate-spin" /> Evaluating...</> : <><Send size={14} /> Submit Answer</>}
                </button>
              </div>
            )}

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
          </div>

          {/* Sidebar column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-5">
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">Interview Progress</p>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: progress.total }, (_, i) => i + 1).map((num) => {
                  const isAnswered = num < progress.current
                  const isCurrent = num === progress.current
                  return (
                    <div key={num} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${isAnswered ? 'bg-green-500 text-white' : isCurrent ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500'}`}>
                      {num}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-panel-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-yellow-500" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">Tips</p>
              </div>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li>Be clear and concise in your answers.</li>
                <li>Structure your response with examples.</li>
                <li>Watch the timer — it auto-submits at zero.</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Bot size={16} />
                <p className="text-sm font-bold">AI Interviewer</p>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed">
                I'll ask you real interview questions and provide detailed feedback to help you improve.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MockInterview