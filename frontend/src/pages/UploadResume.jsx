import { useState } from 'react'
import { uploadResume } from '../services/api'
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, Sparkles, Shield, Zap, Brain } from 'lucide-react'
import Sidebar from '../components/Sidebar'

function UploadResume() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError('')
    } else {
      setError('Please select a PDF file only')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const data = await uploadResume(file)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">

        {/* Top Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Step 1 of 4</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Your Resume</h1>
            <p className="text-gray-500 text-sm mt-1">Our AI will analyze your resume and provide detailed insights</p>
          </div>
        </div>

        <div className="px-8 py-8">
          <div className="max-w-3xl mx-auto">

            {/* What happens next cards */}
            {!result && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Brain, title: 'AI Analysis', desc: 'Deep resume scan', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: Zap, title: 'ATS Score', desc: 'Instant scoring', color: 'text-orange-500', bg: 'bg-orange-50' },
                  { icon: Sparkles, title: 'Skill Gaps', desc: 'Missing skills', color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                    <div className={`w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <item.icon size={18} className={item.color} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {!result && (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                    dragging
                      ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                      : 'border-gray-200 bg-white hover:border-blue-400'
                  }`}
                >
                  {/* Loading overlay */}
                  {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10">
                      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                      <p className="text-sm font-semibold text-gray-900">Analyzing your resume...</p>
                      <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
                    </div>
                  )}

                  <div className="p-12 text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                        <Upload size={32} className="text-blue-600" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Drop your resume here
                    </h3>
                    <p className="text-gray-400 text-sm mb-1">
                      Drag and drop your PDF file or click to browse
                    </p>
                    <p className="text-gray-300 text-xs mb-8">
                      Supports PDF · Maximum file size 10MB
                    </p>

                    <label className="cursor-pointer inline-block">
                      <span className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm shadow-blue-200">
                        Choose PDF File
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files[0])}
                      />
                    </label>

                    <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100">
                      {[
                        { icon: Shield, text: '100% Secure' },
                        { icon: Zap, text: 'Instant Analysis' },
                        { icon: Sparkles, text: 'AI Powered' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                          <item.icon size={13} className="text-gray-300" />
                          {item.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected File */}
                {file && (
                  <div className="mt-4 bg-white border border-blue-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={22} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">PDF ✓</span>
                      </div>
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
                    >
                      <Zap size={14} />
                      Analyze Resume
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
              </>
            )}

            {/* Success Result */}
            {result && (
              <div className="space-y-4">
                {/* Success Banner */}
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-green-900">Resume Analyzed Successfully!</h3>
                    <p className="text-sm text-green-600 mt-0.5">{result.filename}</p>
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1.5 rounded-full">
                    Ready for AI ✓
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Characters', value: result.text_length, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pages', value: '1+', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Status', value: 'Ready', color: 'text-green-600', bg: 'bg-green-50' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-center">
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Preview */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Extracted Text Preview</p>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">First 300 chars</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed font-mono bg-gray-50 p-4 rounded-lg">
                    {result.preview}...
                  </p>
                </div>

                {/* Next Steps */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <p className="text-sm font-bold text-gray-900 mb-4">What's next?</p>
                  <div className="space-y-3">
                    {[
                      { step: '01', title: 'ATS Score Check', desc: 'See how your resume scores', color: 'text-orange-500', bg: 'bg-orange-50' },
                      { step: '02', title: 'Skill Gap Analysis', desc: 'Find missing skills', color: 'text-purple-600', bg: 'bg-purple-50' },
                      { step: '03', title: 'Mock Interview', desc: 'Practice with AI', color: 'text-blue-600', bg: 'bg-blue-50' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                        <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <span className={`text-xs font-bold ${item.color}`}>{item.step}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                        <ArrowRight size={14} className="text-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  Go to Dashboard <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadResume