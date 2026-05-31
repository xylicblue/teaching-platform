import Navbar        from '../components/Navbar/Navbar'
import Hero          from '../components/Hero/Hero'
import StatsStrip    from '../components/StatsStrip/StatsStrip'
import OnlineNow     from '../components/OnlineNow/OnlineNow'
import Catalog       from '../components/Catalog/Catalog'
import FeaturedTutors from '../components/FeaturedTutors/FeaturedTutors'
import HowItWorks    from '../components/HowItWorks/HowItWorks'
import Stories       from '../components/Stories/Stories'
import ReviewsWall   from '../components/ReviewsWall/ReviewsWall'
import BookingWidget from '../components/BookingWidget/BookingWidget'
import ForParents    from '../components/ForParents/ForParents'
import ForTeachers   from '../components/ForTeachers/ForTeachers'
import Footer        from '../components/Footer/Footer'
import './LandingPage.css'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />

      <main>
        <Hero />
        <StatsStrip />
        <OnlineNow />
        <Catalog />
        <FeaturedTutors />
        <HowItWorks />
        <Stories />
        <ReviewsWall />
        <BookingWidget />
        <ForParents />
        <ForTeachers />
      </main>

      <Footer />

      {/* Mobile sticky CTA */}
      <div className="mcta" aria-label="Quick actions">
        <a href="/tutors" className="btn btn-outline">Browse tutors</a>
        <a href="/demo"   className="btn btn-primary">Book free demo</a>
      </div>
    </div>
  )
}
