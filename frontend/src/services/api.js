import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Automatically add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const registerUser = async (data) => {
  const response = await API.post('/api/auth/register', data)
  return response.data
}

export const loginUser = async (data) => {
  const response = await API.post('/api/auth/login', data)
  return response.data
}

export const uploadResume = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await API.post('/api/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const getMyResumes = async () => {
  const response = await API.get('/api/resume/my-resumes')
  return response.data
}
export const analyzeResume = async (resumeId) => {
  const response = await API.post(`/api/analysis/analyze/${resumeId}`)
  return response.data
}

export const getLatestAnalysis = async () => {
  const response = await API.get('/api/analysis/latest')
  return response.data
}
export const generateQuestions = async () => {
  const response = await API.get('/api/questions/generate')
  return response.data
}
export const getAnalysisHistory = async () => {
  const response = await API.get('/api/analysis/history')
  return response.data
}
export const startInterview = async () => {
  const response = await API.post('/api/interview/start')
  return response.data
}

export const submitAnswer = async (sessionId, answer) => {
  const response = await API.post(`/api/interview/${sessionId}/answer`, { answer })
  return response.data
}

export const getInterviewSessions = async () => {
  const response = await API.get('/api/interview/sessions')
  return response.data
}

export const getInterviewSession = async (sessionId) => {
  const response = await API.get(`/api/interview/${sessionId}`)
  return response.data
}
export const getAnalyticsSummary = async () => {
  const response = await API.get('/api/analytics/summary')
  return response.data
}