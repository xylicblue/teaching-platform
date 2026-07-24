/**
 * Shape of the tutor profile page. Populated at runtime in
 * TutorProfilePage.tsx from profiles + courses + teacher_public.
 * Types only — no seed data lives here.
 */

export type SubjectRow = {
  id?:     string
  code:    string
  name:    string
  rating:  number
  students: number
  price:   number
}

export type Credential = {
  icon:    'degree' | 'doc' | 'cert' | 'id'
  title:   string
  sub:     string
}

export type ReviewItem = {
  n:       string
  c:       number
  sub:     string
  lvl:     string
  date:    string
  recency: number
  r:       number
  grade:   string
  t:       string
}

export type ResultStat = {
  value: string
  bar:   number
  label: string
}

export type FaqItem = {
  q: string
  a: string
}

export type SimilarTutor = {
  id:     number
  n:      string
  i:      string
  c:      number
  subj:   string
  r:      number
  rev:    number
  price:  number
  online: boolean
  slots:  number
}

export type AvailDay = {
  has:   boolean
  times: string[]
}

export type TutorProfile = {
  id:           string
  name:         string
  initials:     string
  colorIndex:   number
  avatarUrl?:   string | null
  headline:     string
  location:     string
  languages:    string[]
  online:       boolean
  rating:       number
  reviews:      number
  lessons:      number
  responseTime: string
  yearsExp:     number
  price:        number
  quote:        string
  aboutShort:   string
  aboutLong:    string
  aboutFacts:   { value: string; label: string }[]
  subjects:     SubjectRow[]
  results:      ResultStat[]
  credentials:  Credential[]
  reviewList:   ReviewItem[]
  faq:          FaqItem[]
  similar:      SimilarTutor[]
  availability: AvailDay[]
  watching:     string
  trustBadges:  string[]
}
