import './Testimonial.css'

export default function Testimonial() {
  return (
    <section className="testimonial" aria-label="Student testimonial">
      <div className="testimonial__inner">
        <div className="testimonial__decoration" aria-hidden="true">&ldquo;</div>

        <blockquote className="testimonial__quote">
          My CIE Chemistry teacher at school skipped half the syllabus.
          Mr. Salman went through every past paper since 2017 with me.
          I got an A*.
        </blockquote>

        <footer className="testimonial__footer">
          <div className="testimonial__rule" aria-hidden="true" />
          <cite className="testimonial__cite">Bilal, A2 student, Lahore.</cite>
        </footer>

        <p className="testimonial__link-row">
          <a href="/reviews" className="testimonial__link">
            Read 1,200+ reviews from students and parents &rarr;
          </a>
        </p>
      </div>
    </section>
  )
}
