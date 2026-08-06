import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { SidebarProvider } from './context/SidebarContext'
import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
  <SidebarProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </SidebarProvider>
</ThemeProvider>
  </StrictMode>,
)