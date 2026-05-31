import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage       from './pages/LandingPage'
import BrowsePage        from './pages/BrowsePage/BrowsePage'
import TutorProfilePage  from './pages/TutorProfile/TutorProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<LandingPage />} />
        <Route path="/tutors"     element={<BrowsePage />} />
        <Route path="/tutors/:id" element={<TutorProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}
