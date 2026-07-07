import { useEffect, useState } from 'react'

function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      window.location.href = '/login'
      return
    }
    setUser(JSON.parse(userData))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">HireMind AI</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            Welcome, <strong>{user.name}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto mt-10 px-4">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Hello, {user.name}! 👋
          </h2>
          <p className="text-gray-500">
            Welcome to HireMind AI. Start by uploading your resume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-3">📄</div>
            <h3 className="font-semibold text-gray-800 mb-1">Upload Resume</h3>
            <p className="text-gray-500 text-sm">Upload your PDF resume for AI analysis</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-800 mb-1">ATS Score</h3>
            <p className="text-gray-500 text-sm">Check how your resume performs</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-3">🎤</div>
            <h3 className="font-semibold text-gray-800 mb-1">Mock Interview</h3>
            <p className="text-gray-500 text-sm">Practice with AI interviewer</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h3 className="font-semibold text-gray-800 mb-4">Your Profile</h3>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account Status</span>
              <span className="text-green-600 font-medium">Active ✅</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard