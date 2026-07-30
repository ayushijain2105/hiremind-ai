import { useEffect, useState } from 'react'
import { getAnalysisHistory } from '../services/api'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { FileText, Calendar, ChevronRight } from 'lucide-react'

function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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

  const formatDate = (objectId) => {
    const timestamp = parseInt(objectId.substring(0, 8), 16) * 1000
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">

        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <h1 className="text-2xl font-bold text-gray-900">Resume History</h1>
          <p className="text-gray-500 text-sm mt-1">All your past resume analyses</p>
        </div>

        <div className="px-8 py-8 max-w-3xl">

          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-700 font-semibold">Loading history...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-24">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="text-center py-24">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-4">No analyzed resumes yet</p>
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
                  className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.filename}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <Calendar size={12} />
                        {formatDate(item._id)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{item.analysis?.ats_score ?? '-'}</p>
                      <p className="text-xs text-gray-400">ATS Score</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default History