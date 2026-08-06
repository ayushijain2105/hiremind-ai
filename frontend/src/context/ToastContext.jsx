import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] space-y-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-[280px] max-w-sm ${
                t.type === 'success'
                  ? 'bg-white dark:bg-panel-dark border-green-100 dark:border-green-500/20'
                  : 'bg-white dark:bg-panel-dark border-red-100 dark:border-red-500/20'
              }`}
            >
              {t.type === 'success' ? (
                <CheckCircle size={18} className="text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <XCircle size={18} className="text-red-500 flex-shrink-0" />
              )}
              <p className="text-sm text-gray-700 dark:text-gray-200 flex-1">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)