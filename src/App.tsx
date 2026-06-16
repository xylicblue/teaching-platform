import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage       from './pages/LandingPage'
import BrowsePage        from './pages/BrowsePage/BrowsePage'
import TutorProfilePage  from './pages/TutorProfile/TutorProfilePage'
import AuthPage          from './pages/AuthPage/AuthPage'
import AuthCallback      from './pages/AuthCallback/AuthCallback'
import DashboardPage     from './pages/DashboardPage/DashboardPage'
import TeacherApplyPage  from './pages/TeacherApplyPage/TeacherApplyPage'
import AdminDashboard    from './pages/AdminDashboard/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<LandingPage />} />
        <Route path="/tutors"        element={<BrowsePage />} />
        <Route path="/tutors/:id"    element={<TutorProfilePage />} />
        <Route path="/signin"        element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard"     element={<DashboardPage />} />
        <Route path="/apply"         element={<TeacherApplyPage />} />
        <Route path="/admin"         element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
