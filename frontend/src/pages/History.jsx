import { useEffect, useState } from 'react'
import { getAnalysisHistory, deleteAnalysis } from '../services/api'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useToast } from '../context/ToastContext'
import { FileText, Calendar, ChevronRight, Trash2 } from 'lucide-react'

function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { window.location.href = '/login'; return }
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAnalysisHistory()
      setHistory(data.history)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    setDeletingId(id)
    try {
      await deleteAnalysis(id)
      setHistory((prev) => prev.filter((item) => item._id !== id))
      showToast('Analysis deleted')
    } catch (err) {
      showToast('Failed to delete', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (objectId) => {
    const timestamp = parseInt(objectId.substring(0, 8), 16) * 1000
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <Layout>
      <div className="bg-white dark:bg-panel-dark border-b border-gray-100 dark:border-border-dark px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume History</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">All your past resume analyses</p>
      </div>

      <div className="px-8 py-8 max-w-3xl">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-14 h-14 border-4 border-blue-100 dark:border-blue-500/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">Loading history...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-24">
            <FileText size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="text-center py-24">
            <FileText size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">No analyzed resumes yet</p>
            <button
              onClick={() => navigate('/upload-resume')}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Upload Resume
            </button>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate('/analysis', { state: { resumeId: item._id } })}
                className="group bg-white dark:bg-panel-dark border border-gray-100 dark:border-border-dark rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-100 dark:hover:border-brand-500/30 transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.filename}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-1">
                      <Calendar size={12} />
                      {formatDate(item._id)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{item.analysis?.ats_score ?? '-'}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">ATS Score</p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, item._id)}
                    disabled={deletingId === item._id}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition disabled:opacity-50 p-1.5"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default History