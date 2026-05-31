import { TUTORS, AVATAR_COLORS } from '../../data/tutors'
import './OnlineNow.css'

const ONLINE = TUTORS.filter(t => t.online).concat(TUTORS).slice(0, 11)

export default function OnlineNow() {
  return (
    <section className="online" aria-label="Tutors available now">
      <div className="wrap">
        <div className="online-head">
          <span className="live-label">
            <span className="dot-live anim" aria-hidden="true" />
            Online now
          </span>
          <a href="/tutors?available=now" className="tlink">
            See all available
            <svg className="ar" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className="hscroll" role="list">
          {ONLINE.map((t, i) => (
            <article key={`${t.n}-${i}`} className="mini" role="listitem">
              <div className="mini-top">
                <div className="mini-av-wrap">
                  <span
                    className="mini-av"
                    style={{ background: AVATAR_COLORS[t.c] }}
                    aria-hidden="true"
                  >
                    {t.i}
                    <span className="od" aria-hidden="true" />
                  </span>
                </div>
                <div>
                  <div className="mn">{t.n}</div>
                  <div className="ms">{t.subj.replace('A-Level & ', '').replace('A-Level ', '')}</div>
                </div>
              </div>
              <div className="mini-foot">
                <span className="rating">
                  <span className="star">★</span>
                  {t.r.toFixed(1)}
                  <span className="rc">({t.rev})</span>
                </span>
                <span className="mono price">Rs {t.price.toLocaleString()}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
