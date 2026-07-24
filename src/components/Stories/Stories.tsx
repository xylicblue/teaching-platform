import { Link } from 'react-router-dom'
import { AVATAR_COLORS } from '../../lib/catalog'
import './Stories.css'

const STORIES = [
  { from:'C', to:'A',  sub:'A-Level Chemistry · CAIE',      time:'6 months to exam', q:'My school teacher skipped half the syllabus. We worked through every past paper since 2017. I walked into 9701 knowing exactly what to expect.', who:'Hira A.',    whoT:'now at LUMS',         c:0 },
  { from:'D', to:'B',  sub:'A-Level Physics · CAIE',        time:'8 months to exam', q:'I was failing mocks in September. Mr. Hassan rebuilt the basics with me, then drilled mechanics until it was automatic.',                          who:'Daniyal R.', whoT:'A2 student, Karachi',  c:4 },
  { from:'B', to:'A*', sub:'A-Level Mathematics · Edexcel',  time:'5 months to exam', q:'Further Maths felt impossible. Fatima broke every topic into a method I could actually repeat under pressure.',                                   who:'Ans M.',     whoT:'now at UCL',           c:1 },
  { from:'E', to:'C',  sub:'IGCSE Biology · CAIE',          time:'7 months to exam', q:'I genuinely thought I would fail. Two sessions a week and a lot of diagrams later, I passed comfortably.',                                        who:'Zoya K.',    whoT:'O-Level student, Lahore', c:7 },
  { from:'C', to:'A',  sub:'A-Level Economics · Edexcel',   time:'6 months to exam', q:'The evaluation marks were killing me. Hamza taught me how examiners actually award the top band.',                                                who:'Bilal S.',   whoT:'now at LSE',           c:2 },
  { from:'D', to:'A',  sub:'O-Level Chemistry · CAIE',      time:'9 months to exam', q:'We started a full year out. By June nothing on the paper surprised me — we had done it all already.',                                             who:'Minha T.',   whoT:'O-Level student, Islamabad', c:3 },
]

export default function Stories() {
  return (
    <section className="stories" id="stories" aria-label="Student success stories">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <p className="eyebrow">Success stories</p>
            <h2 className="display">Real results.</h2>
            <p>These are a few students who came to us with a deadline and left with a grade.</p>
          </div>
          <Link to="/tutors" className="tlink">
            Find your tutor
            <svg className="ar" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="story-grid">
          {STORIES.map((s, i) => (
            <article key={i} className="story">
              <div className="grade-jump">
                <span className="grade from">{s.from}</span>
                <span className="arr" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                  </svg>
                </span>
                <span className="grade to">{s.to}</span>
                <div style={{ marginLeft: 6 }}>
                  <div className="gj-sub">{s.sub}</div>
                  <div className="gj-time">{s.time}</div>
                </div>
              </div>
              <p className="story-quote">&ldquo;{s.q}&rdquo;</p>
              <div className="story-who">
                <span
                  className="story-av"
                  style={{ background: AVATAR_COLORS[s.c] }}
                  aria-hidden="true"
                >
                  {s.who.slice(0, 2)}
                </span>
                <div>
                  <div className="wn">{s.who}</div>
                  <div className="wt">{s.whoT}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
