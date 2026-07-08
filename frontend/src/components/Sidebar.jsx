import { LayoutDashboard, FileText, Target, Brain, Mic, HelpCircle, BarChart2, History, Settings } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: FileText, label: 'Resume Analysis' },
  { icon: Target, label: 'ATS Score' },
  { icon: Brain, label: 'Skill Gap' },
  { icon: HelpCircle, label: 'Interview Questions' },
  { icon: Mic, label: 'Mock Interview' },
  { icon: BarChart2, label: 'AI Feedback' },
  { icon: History, label: 'History' },
  { icon: Settings, label: 'Settings' },
]

function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-20">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            HireMind <span className="text-blue-600">AI</span>
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => (
          <button
            key={i}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${item.active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom Profile */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">My Account</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
