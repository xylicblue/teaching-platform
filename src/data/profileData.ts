import { AVATAR_COLORS } from './tutors'

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

export const HASSAN: TutorProfile = {
  id:           'hassan-raza',
  name:         'Hassan Raza',
  initials:     'HR',
  colorIndex:   4,
  headline:     'A-Level Physics Specialist · CAIE & Edexcel',
  location:     'Lahore, Pakistan',
  languages:    ['English', 'Urdu'],
  online:       true,
  rating:       4.9,
  reviews:      128,
  lessons:      1240,
  responseTime: '< 1 hr',
  yearsExp:     9,
  price:        3000,
  quote:        'I help students understand Physics instead of memorising it.',
  aboutShort:   "I've taught A-Level and IGCSE Physics on the CAIE and Edexcel syllabuses since 2015 — the same papers I sat and scored an A* on myself. Most students don't struggle because Physics is hard; they struggle because it's taught out of order. I put the order back.",
  aboutLong:    "Every student starts with a free 30-minute demo so we can find the gaps before we build. Sessions run on Google Meet and are recorded to your own Google Drive, so you can revisit any explanation. We work topic by topic, then drill past papers until the exam holds no surprises — I keep a bank of every CAIE Physics paper since 2010, mark to the official scheme, and track your grade week by week.",
  aboutFacts: [
    { value: '9702 / 0625', label: 'CAIE A-Level & IGCSE Physics specialist' },
    { value: 'Sun–Fri',     label: 'Evenings & weekends, PKT' },
    { value: 'Google Meet', label: 'Every lesson recorded to your Drive' },
  ],
  subjects: [
    { code: '9702',      name: 'A-Level Physics',  rating: 4.9, students: 820, price: 3000 },
    { code: '9702\nAS',  name: 'AS Physics',        rating: 4.9, students: 240, price: 2800 },
    { code: '0625',      name: 'IGCSE Physics',     rating: 5.0, students: 310, price: 2400 },
    { code: '5054',      name: 'O-Level Physics',   rating: 4.8, students: 180, price: 2200 },
  ],
  results: [
    { value: '89%',  bar: 89, label: 'of students improved by at least one full grade' },
    { value: '62',   bar: 74, label: 'students achieved an A or A* in the last three sessions' },
    { value: '+1.7', bar: 68, label: 'average grade improvement across 9702 students' },
  ],
  credentials: [
    { icon: 'degree', title: 'MSc Physics',           sub: 'Imperial College London' },
    { icon: 'doc',    title: 'BSc Physics',            sub: 'LUMS · First class honours' },
    { icon: 'cert',   title: 'CAIE Certified Teacher', sub: 'Cambridge International' },
    { icon: 'id',     title: 'National ID verified',   sub: 'NADRA check passed' },
  ],
  reviewList: [
    { n:'Ifra Sajid',   c:1, sub:'A-Level Physics', lvl:'A-Level', date:'2 weeks ago', recency:14,  r:5, grade:'C → A',  t:"Hassan completely changed how my son sees Physics. He stopped memorising and started actually understanding. We saw a grade jump within two months of mocks." },
    { n:'Daniyal Raza', c:4, sub:'A-Level Physics', lvl:'A-Level', date:'3 weeks ago', recency:21,  r:5, grade:'D → B',  t:"I was failing mocks in September. We rebuilt mechanics from scratch and drilled past papers until nothing surprised me. Walked into 9702 calm for the first time." },
    { n:'Mrs. Khan',    c:3, sub:'AS Physics',      lvl:'A-Level', date:'1 month ago', recency:30,  r:5, grade:'Verified parent', t:"Booked a free demo on Sunday and enrolled the same evening. The recordings in our Google Drive let me follow exactly what's being taught. Total peace of mind." },
    { n:'Zoya Iqbal',   c:7, sub:'IGCSE Physics',   lvl:'IGCSE',   date:'1 month ago', recency:33,  r:5, grade:'E → B',  t:"I genuinely thought I'd fail IGCSE Physics. Hassan is so patient and explains with diagrams that finally made circuits make sense. Cannot recommend enough." },
    { n:'Saad Mahmood', c:6, sub:'A-Level Physics', lvl:'A-Level', date:'2 months ago',recency:60,  r:4, grade:'B → A',  t:"Sessions always start on time and there's a clear plan each week. The only reason it's four stars is I wish I'd started earlier — the slots fill fast." },
    { n:'Hiba Rauf',    c:0, sub:'O-Level Physics', lvl:'O-Level', date:'2 months ago',recency:62,  r:5, grade:'C → A*', t:"Went through every past paper since 2017 with me. By June I'd seen every question type at least twice. Got an A* and honestly enjoyed the subject by the end." },
    { n:'Rohan Das',    c:2, sub:'IGCSE Physics',   lvl:'IGCSE',   date:'3 months ago',recency:90,  r:5, grade:'D → A',  t:"My daughter went from dreading Physics to teaching her friends. Hassan is worth every rupee — responsive, organised and genuinely kind." },
    { n:'Ans Malik',    c:5, sub:'A-Level Physics', lvl:'A-Level', date:'3 months ago',recency:95,  r:5, grade:'C → A',  t:"The way he breaks down the harder topics into repeatable methods is unreal. I stopped panicking in exams because I always knew where to start." },
  ],
  faq: [
    { q: 'How does the free demo class work?',
      a: "Pick any open slot and request it — no card or payment needed. You'll get a Google Meet link by email. The 30 minutes are for Hassan to assess where you are and show you how he teaches. There's no obligation to continue." },
    { q: 'Can lessons be recorded?',
      a: "Yes. Every session is recorded on Google Meet and saved to your family's own Google Drive folder, so you can rewatch any explanation or sit in whenever you like." },
    { q: 'What happens after the demo?',
      a: "If it felt right, you book your first paid lesson and pick a regular weekly time. If it didn't, you owe nothing and we'll help you find another tutor — no awkwardness." },
    { q: 'Can I switch tutors later?',
      a: "Any time. Your lesson balance moves with you, and our team will match you to another verified Physics tutor at the same level within a day." },
  ],
  similar: [
    { id:10, n:'Usman Javed', i:'UJ', c:4, subj:'A-Level Physics',       r:4.7, rev:73,  price:2300, online:false, slots:7 },
    { id: 9, n:'Mahira Ali',  i:'MA', c:0, subj:'A-Level Maths & Physics', r:4.9, rev:156, price:2500, online:true,  slots:2 },
    { id: 8, n:'Omar Farooq', i:'OF', c:6, subj:'A-Level Physics & CS',   r:4.8, rev:88,  price:2700, online:false, slots:3 },
    { id:13, n:'Iqra Nadeem', i:'IN', c:7, subj:'A-Level Physics & Bio',  r:5.0, rev:119, price:2700, online:true,  slots:1 },
  ],
  availability: [
    { has: true,  times: ['4:00pm','6:00pm','7:30pm'] },
    { has: true,  times: ['10:00am','2:00pm','5:00pm','8:00pm'] },
    { has: false, times: [] },
    { has: true,  times: ['3:00pm','6:30pm'] },
    { has: true,  times: ['11:00am','4:00pm','7:00pm'] },
    { has: true,  times: ['9:00am','1:00pm'] },
    { has: false, times: [] },
  ],
  watching:    '9 students viewed Hassan this week · 1 demo slot left',
  trustBadges: ['Identity verified', 'Qualifications verified', 'Background checked', 'Super Tutor'],
}

export const PROFILES: Record<string, TutorProfile> = {
  'hassan-raza': HASSAN,
}

export { AVATAR_COLORS }
