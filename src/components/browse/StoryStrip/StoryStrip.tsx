import './StoryStrip.css'

type Props = {
  from: string
  to:   string
  q:    string
  who:  string
  subj: string
}

export default function StoryStrip({ from, to, q, who, subj }: Props) {
  return (
    <div className="story-strip" aria-label="Student success story">
      <div className="ss-grade">
        <span className="ss-g from">{from}</span>
        <span className="ss-arr" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
          </svg>
        </span>
        <span className="ss-g to">{to}</span>
      </div>
      <div className="ss-text">
        <p className="ss-quote display">&ldquo;{q}&rdquo;</p>
        <p className="ss-who"><b>{who}</b> · {subj} · verified outcome</p>
      </div>
      <a className="btn btn-saffron ss-cta" href="#stories">More success stories</a>
    </div>
  )
}
