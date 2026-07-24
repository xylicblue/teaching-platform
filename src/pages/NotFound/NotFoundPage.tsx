import { Link, useLocation } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './NotFoundPage.css'

export default function NotFoundPage() {
  const { pathname } = useLocation()

  return (
    <div className="nf-page">
      <Navbar />
      <main className="wrap nf-wrap">
        <p className="eyebrow">404</p>
        <h1 className="nf-title display">This page doesn&rsquo;t exist.</h1>
        <p className="nf-lede">
          Nothing lives at <code className="nf-path">{pathname}</code>. It may have moved,
          or the link that brought you here is out of date.
        </p>
        <div className="nf-actions">
          <Link className="btn btn-primary btn-lg" to="/tutors">Browse tutors</Link>
          <Link className="btn btn-outline btn-lg" to="/">Back to home</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
