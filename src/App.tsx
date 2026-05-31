import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import TutorProfilePage from './pages/TutorProfile/TutorProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<LandingPage />} />
        <Route path="/tutors/:id"  element={<TutorProfilePage />} />
        {/* catch-all: demo profile */}
        <Route path="/tutors"      element={<TutorProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}
