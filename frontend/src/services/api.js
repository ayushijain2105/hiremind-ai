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