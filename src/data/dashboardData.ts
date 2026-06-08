/* Mock data for the student/parent dashboard.
   Front-end only — no backend wiring yet. */

export type StatChip = {
  value: string
  label: string
  tone:  'ever' | 'saff' | 'succ' | 'terr'
  icon:  'calendar' | 'users' | 'check' | 'star'
}

export type Session = {
  initials:  string
  color:     number          // avatar colour index (0-7)
  name:      string
  subject:   string
  date:      string
  time:      string
  status:    'soon' | 'confirmed' | 'demo'
  statusText: string
}

export type MiniTutor = {
  initials: string
  color:    number
  name:     string
  subject:  string
  rating:   string
  desc:     string
}

export type ProgressItem = {
  subject: string
  grade:   string
  width:   number            // 0-100
  saffron: boolean
  note:    string
}

export type Message = {
  initials: string
  color:    number
  name:     string
  time:     string
  text:     string
  unread:   boolean
}

export type Recommended = {
  initials: string
  color:    number
  name:     string
  sub:      string
  rating:   string
}

export const STATS: StatChip[] = [
  { value: '2',    label: 'upcoming sessions', tone: 'ever', icon: 'calendar' },
  { value: '3',    label: 'active tutors',     tone: 'saff', icon: 'users'    },
  { value: '24',   label: 'lessons completed', tone: 'succ', icon: 'check'    },
  { value: '+1.5', label: 'avg grade gain',    tone: 'terr', icon: 'star'     },
]

export const SESSIONS: Session[] = [
  {
    initials: 'HR', color: 4,
    name: 'Mr Hassan', subject: 'A-Level Physics · Topic: Circular motion',
    date: 'Today', time: '6:00 – 7:00 pm',
    status: 'soon', statusText: 'Starts soon',
  },
  {
    initials: 'AK', color: 0,
    name: 'Ms Ayesha', subject: 'A-Level Chemistry · Topic: Organic reactions',
    date: 'Thu, Jun 5', time: '5:30 – 6:30 pm',
    status: 'confirmed', statusText: 'Confirmed',
  },
  {
    initials: 'FS', color: 1,
    name: 'Ms Fatima', subject: 'A-Level Maths · Free demo class',
    date: 'Fri, Jun 6', time: '4:00 – 4:30 pm',
    status: 'demo', statusText: 'Free demo',
  },
]

export const MINI_TUTORS: MiniTutor[] = [
  {
    initials: 'HR', color: 4, name: 'Mr Hassan', subject: 'A-Level Physics', rating: '5.0',
    desc: '8 lessons together. Your mocks are up a full grade since March.',
  },
  {
    initials: 'AK', color: 0, name: 'Ms Ayesha', subject: 'A-Level Chemistry', rating: '4.9',
    desc: '12 lessons together. Currently revising organic chemistry past papers.',
  },
  {
    initials: 'FS', color: 1, name: 'Ms Fatima', subject: 'A-Level Mathematics', rating: '4.9',
    desc: 'Demo booked for Friday. Specialises in Further Maths and statistics.',
  },
]

export const PROGRESS: ProgressItem[] = [
  { subject: 'Physics',     grade: 'C → B+ predicted', width: 74, saffron: false, note: 'Up from a C in March mocks.' },
  { subject: 'Chemistry',   grade: 'B → A predicted',  width: 86, saffron: true,  note: 'On track for your target grade.' },
  { subject: 'Mathematics', grade: 'Demo pending',     width: 20, saffron: false, note: "Starts after Friday's demo." },
]

export const MESSAGES: Message[] = [
  { initials: 'HR', color: 4, name: 'Mr Hassan', time: '10m',       unread: true,  text: 'Great work today — try past paper 22 before next session.' },
  { initials: 'AK', color: 0, name: 'Ms Ayesha', time: '1h',        unread: true,  text: "I've shared the organic chemistry notes to your Drive." },
  { initials: 'FS', color: 1, name: 'Ms Fatima', time: 'Yesterday', unread: false, text: 'Looking forward to our demo on Friday! Any topics to focus on?' },
]

export const RECOMMENDED: Recommended = {
  initials: 'IN', color: 7, name: 'Dr Iqra',
  sub: 'A-Level Biology · CAIE',
  rating: '5.0 · 119 reviews · Rs 2,700/hr',
}

export const EMPTY_TUTORS = [
  { initials: 'HR', color: 4, name: 'Mr Hassan', sub: 'A-Level Physics',   price: 'Rs 3,000/hr', rating: '5.0' },
  { initials: 'AK', color: 0, name: 'Ms Ayesha', sub: 'A-Level Chemistry', price: 'Rs 2,500/hr', rating: '4.9' },
  { initials: 'FS', color: 1, name: 'Ms Fatima', sub: 'A-Level Maths',     price: 'Rs 2,800/hr', rating: '4.9' },
]
