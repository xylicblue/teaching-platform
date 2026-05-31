import { AVATAR_COLORS } from '../../data/tutors'
import './ReviewsWall.css'

const REVIEWS = [
  { n:'Ifra S.',    m:'Parent · A-Level',  r:5, c:1, t:'My daughter went from dreading Chemistry to teaching her friends. <b>Ayesha is worth every rupee.</b>',                              tut:'Ayesha Khan'  },
  { n:'Hamza K.',   m:'A2 · Karachi',      r:5, c:4, t:'Physics finally clicked. We went through <b>every CAIE past paper</b> and I stopped panicking in exams.',                           tut:'Hassan Raza'  },
  { n:'Mrs. Javed', m:'Parent',            r:5, c:3, t:'Booked a free demo on Sunday, enrolled the same evening. The recording in Google Drive lets me follow along.',                       tut:'Fatima Sheikh' },
  { n:'Bilal A.',   m:'A-Level',           r:5, c:2, t:'The <b>evaluation marks</b> in Economics were a mystery until Hamza showed me how examiners think.',                                 tut:'Hamza Sheikh' },
  { n:'Zoya R.',    m:'IGCSE',             r:4, c:7, t:'I was certain I would fail Biology. Two months later I am at a solid B and still improving.',                                         tut:'Nadia Malik'  },
  { n:'Mr. Ahmed',  m:'Parent · O-Level',  r:5, c:0, t:'Verified credentials, an admin who actually checks in, and a tutor who shows up early. <b>Genuinely trustworthy.</b>',             tut:'Salman Tariq' },
  { n:'Mahnoor T.', m:'A2 · Lahore',       r:5, c:5, t:'Further Maths used to make me cry. Now it is my highest predicted grade.',                                                           tut:'Daniyal Khan' },
  { n:'Saad M.',    m:'A-Level',           r:5, c:6, t:'Computer Science paper 2 was brutal. Omar drilled pseudocode until it was second nature.',                                           tut:'Omar Farooq'  },
  { n:'Ayman F.',   m:'Parent',            r:5, c:3, t:'What sold me was the <b>free demo</b> — no pressure, no commitment, and Zara clearly knew the syllabus cold.',                      tut:'Zara Hussain' },
  { n:'Rohan D.',   m:'A2 · Islamabad',    r:4, c:0, t:'Responsive, patient, and organised. Sessions always start on time and there is a plan for each one.',                                tut:'Mahira Ali'   },
  { n:'Hiba S.',    m:'IGCSE',             r:5, c:7, t:'I came in with an E and left the year with an A. I still cannot quite believe it.',                                                   tut:'Iqra Nadeem'  },
  { n:'Mr. Riaz',   m:'Parent',            r:5, c:1, t:'Transparent pricing, fortnightly progress notes, and a tutor my son actually likes. We have renewed twice.',                        tut:'Sana Riaz'    },
]

function stars(r: number) {
  return '★'.repeat(r) + '☆'.repeat(5 - r)
}

export default function ReviewsWall() {
  return (
    <section className="reviews-sec" aria-label="Student and parent reviews">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <p className="eyebrow">Reviews</p>
            <h2 className="display">What students and parents say.</h2>
          </div>
          <a href="/reviews" className="tlink">
            Read all 1,200+ reviews
            <svg className="ar" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className="reviews-wall">
          {REVIEWS.map((rv, i) => (
            <article key={i} className="review">
              <div className="r-top">
                <span
                  className="r-av"
                  style={{ background: AVATAR_COLORS[rv.c] }}
                  aria-hidden="true"
                >
                  {rv.n.slice(0, 2)}
                </span>
                <div>
                  <div className="r-name">{rv.n}</div>
                  <div className="r-meta">{rv.m}</div>
                </div>
              </div>
              <div className="r-stars" aria-label={`${rv.r} out of 5 stars`}>{stars(rv.r)}</div>
              <p className="r-text" dangerouslySetInnerHTML={{ __html: rv.t }} />
              <div className="r-tutor">with <b>{rv.tut}</b></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
