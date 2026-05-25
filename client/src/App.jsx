import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectBoardPage from './pages/ProjectBoardPage'
import TaskDetailPage from './pages/TaskDetailPage'
import TeamPage from './pages/TeamPage'
import NotFoundPage from './pages/NotFoundPage'

function AppLayout() {
  const { theme } = useAuthStore()

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',       // ← fixes the blue background
      transition: 'var(--theme-transition)',
    }}>
      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: '224px',
        minWidth: 0,
        backgroundColor: 'var(--bg-base)',      // ← main content area too
        transition: 'var(--theme-transition)',
      }}>
        <Navbar />
        <main style={{
          marginTop: '56px',
          padding: '24px',
          minHeight: 'calc(100vh - 56px)',
          backgroundColor: 'var(--bg-base)',    // ← and the scrollable area
          transition: 'var(--theme-transition)',
        }}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectBoardPage />} />
            <Route path="/projects/:id/tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="/team" element={<TeamPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const { theme } = useAuthStore()

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#f1f5f9' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<AppLayout />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}