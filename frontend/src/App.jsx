import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import UploadResume from './pages/UploadResume'
import AnalysisResult from './pages/AnalysisResult'
import InterviewQuestions from './pages/InterviewQuestions'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload-resume" element={<UploadResume />} />
        <Route path="/analysis" element={<AnalysisResult />} />
        <Route path="/interview-questions" element={<InterviewQuestions />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App