import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Target,
  Brain,
  HelpCircle,
  Mic,
  History,
  User,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", link: "/dashboard" },
    ],
  },
  {
    label: "Resume Analysis",
    items: [
      { icon: FileText, label: "Resume Analysis", link: "/analysis" },
      { icon: Target, label: "ATS Score", link: "/analysis" },
      { icon: Brain, label: "Skill Gap", link: "/analysis" },
    ],
  },
  {
    label: "Interview Preparation",
    items: [
      { icon: HelpCircle, label: "Interview Questions", link: "/interview-questions" },
      { icon: Mic, label: "Mock Interview", link: "/mock-interview" },
    ],
  },
  {
    label: "History",
    items: [
      { icon: History, label: "Analysis History", link: "/history" },
    ],
  },
  {
    label: "Account",
    items: [
    { icon: User, label: "My Profile", link: "/profile" },
    { icon: Settings, label: "Settings", link: "/settings" },
    ],
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, toggleCollapsed } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  return (
    <motion.div
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed inset-y-0 left-0 bg-white dark:bg-panel-dark border-r border-gray-100 dark:border-border-dark flex flex-col z-20 overflow-hidden"
    >
      {/* Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 dark:border-border-dark flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap"
              >
                HireMind <span className="text-brand-600 dark:text-brand-400">AI</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={toggleCollapsed}
          className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 transition flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item, i) => {
                const active = location.pathname === item.link && !item.disabled;
                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: item.disabled ? 1 : 0.98 }}
                    onClick={() => !item.disabled && item.link && navigate(item.link)}
                    title={collapsed ? item.label : undefined}
                    disabled={item.disabled}
                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      item.disabled
                        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        : active
                        ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    {active && (
                      <motion.span
                        layoutId="active-pill"
                        className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-brand-600 dark:bg-brand-400 rounded-full"
                      />
                    )}
                    <item.icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className="px-3 py-2 border-t border-gray-100 dark:border-border-dark flex-shrink-0">
        <button
          onClick={toggleTheme}
          title={collapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-150 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {theme === "dark" ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />}
          {!collapsed && <span className="truncate">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>
      </div>

      {/* Profile */}
      <div className="px-3 py-3 border-t border-gray-100 dark:border-border-dark flex-shrink-0">
        <div className={`flex items-center gap-2.5 rounded-lg px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.name || "Guest"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">Student</p>
            </div>
          )}
        </div>
        {!collapsed && (
        <button
          onClick={() => navigate('/profile')}
            className="w-full mt-1 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-border-dark rounded-lg py-1.5 hover:bg-gray-50 dark:hover:bg-white/5 transition"
       >
      View Profile
  </button>
    )}
      </div>
    </motion.div>
  );
}

export default Sidebar;