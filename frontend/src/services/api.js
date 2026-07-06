import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export const registerUser = async (data) => {
  const response = await API.post('/api/auth/register', data)
  return response.data
}

export const loginUser = async (data) => {
  const response = await API.post('/api/auth/login', data)
  return response.data
}