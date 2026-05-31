import './DemoCTA.css'

export default function DemoCTA() {
  return (
    <section className="demo-cta" aria-label="Request a demo class">
      <div className="demo-cta__inner">
        <h2 className="demo-cta__heading">
          Try a demo class. It's free, it's 30 minutes,
          and you don't have to commit to anything.
        </h2>
        <a href="/demo" className="demo-cta__button">
          Request a demo class
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  )
}
