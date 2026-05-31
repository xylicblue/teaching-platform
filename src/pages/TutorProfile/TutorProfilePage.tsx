import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { PROFILES, HASSAN } from '../../data/profileData'
import Navbar         from '../../components/Navbar/Navbar'
import Breadcrumb     from '../../components/profile/Breadcrumb/Breadcrumb'
import StickyBar      from '../../components/profile/StickyBar/StickyBar'
import ProfileHero    from '../../components/profile/ProfileHero/ProfileHero'
import BookingCard    from '../../components/profile/BookingCard/BookingCard'
import {
  ProfileAbout,
  ProfileSubjects,
  ProfileResults,
  ProfileCredentials,
} from '../../components/profile/ProfileSections/ProfileSections'
import ProfileReviews from '../../components/profile/ProfileReviews/ProfileReviews'
import ProfileFAQ     from '../../components/profile/ProfileFAQ/ProfileFAQ'
import SimilarTutors  from '../../components/profile/SimilarTutors/SimilarTutors'
import Footer         from '../../components/Footer/Footer'
import './TutorProfilePage.css'

export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const profile = (id && PROFILES[id]) ? PROFILES[id] : HASSAN
  const heroRef = useRef<HTMLDivElement>(null)

  const subject = profile.headline.split('·')[0].trim().replace(' Specialist', '')

  return (
    <div className="profile-page">
      <Navbar />
      <StickyBar profile={profile} heroRef={heroRef} />
      <Breadcrumb tutorName={profile.name} subject={subject} />

      <main className="wrap profile">
        <div className="pcols">
          {/* ── Left column ── */}
          <div className="pmain" ref={heroRef as React.RefObject<HTMLDivElement>}>
            <ProfileHero profile={profile} />
            <hr className="block-divider" />
            <ProfileAbout profile={profile} />
            <hr className="block-divider" />
            <ProfileSubjects profile={profile} />
            <ProfileResults profile={profile} />
            <hr className="block-divider" />
            <ProfileCredentials profile={profile} />
            <hr className="block-divider" />
            <ProfileReviews profile={profile} />
            <hr className="block-divider" />
            <ProfileFAQ profile={profile} />
          </div>

          {/* ── Right column — sticky booking ── */}
          <aside className="aside" aria-label="Booking">
            <BookingCard profile={profile} />
          </aside>
        </div>
      </main>

      <SimilarTutors profile={profile} />

      <Footer />

      {/* Mobile sticky CTA */}
      <div className="mcta" aria-label="Quick actions">
        <div className="mcta-price">
          <span className="mono">Rs {profile.price.toLocaleString()}</span>
          <span>free demo first</span>
        </div>
        <a className="btn btn-primary" href="#book" style={{ flex: 1 }}>
          Book free demo
        </a>
      </div>
    </div>
  )
}
