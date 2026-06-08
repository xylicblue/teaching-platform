import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage       from './pages/LandingPage'
import BrowsePage        from './pages/BrowsePage/BrowsePage'
import TutorProfilePage  from './pages/TutorProfile/TutorProfilePage'
import AuthPage          from './pages/AuthPage/AuthPage'
import DashboardPage     from './pages/DashboardPage/DashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<LandingPage />} />
        <Route path="/tutors"     element={<BrowsePage />} />
        <Route path="/tutors/:id" element={<TutorProfilePage />} />
        <Route path="/signin"     element={<AuthPage />} />
        <Route path="/dashboard"  element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}
