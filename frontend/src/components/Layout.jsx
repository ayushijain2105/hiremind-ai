import Sidebar from './Sidebar'
import { useSidebar } from '../context/SidebarContext'

function Layout({ children }) {
  const { collapsed } = useSidebar()

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-surface-dark transition-colors duration-200">
      <Sidebar />
      <div
        className="flex-1 transition-all duration-200"
        style={{ marginLeft: collapsed ? 76 : 256 }}
      >
        {children}
      </div>
    </div>
  )
}

export default Layout