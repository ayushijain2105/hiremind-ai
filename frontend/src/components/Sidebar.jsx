import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Target,
  Brain,
  Mic,
  HelpCircle,
  BarChart2,
  History,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", link: "/dashboard" },
  { icon: FileText, label: "Resume Analysis", link: "/analysis" },
  { icon: Target, label: "ATS Score", link: "/analysis" },
  { icon: Brain, label: "Skill Gap", link: "/analysis" },
  { icon: HelpCircle, label: "Interview Questions", link: "/interview-questions" },
  { icon: Mic, label: "Mock Interview", link: "/mock-interview" },
 { icon: BarChart2, label: "AI Feedback", link: "/analytics" },
  { icon: History, label: "History", link: "/history" },
  { icon: Settings, label: "Settings", link: "/dashboard" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex flex-col z-20 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>

          <span className="text-xl font-bold text-gray-900">
            HireMind <span className="text-blue-600">AI</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {navItems.map((item, i) => {
          const active = location.pathname === item.link;
          return (
            <button
              key={i}
              onClick={() => item.link && navigate(item.link)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile */}
      <div className="px-4 py-5 border-t border-gray-100">
        <div className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 cursor-pointer transition">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            A
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              My Account
            </p>

            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;