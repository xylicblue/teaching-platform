import { AVATAR_COLORS } from './tutors'

export { AVATAR_COLORS }

export type BrowseTutor = {
  id:       string
  n:        string   // full name
  h:        string   // display handle (Mr/Ms prefix)
  i:        string   // initials
  c:        number   // avatar colour index
  spec:     string   // specialisation headline
  lvl:      string[] // levels taught
  subj:     string[] // subjects (for filtering)
  boards:   string[] // exam boards
  r:        number
  rev:      number
  price:    number
  lessons:  number
  cred:     string
  type:     string[] // 'school' | 'grad' | 'examiner' | 'specialist'
  examiner: boolean
  online:   boolean
  avail:    'today' | 'week'
  slots:    number
  langs:    string[]
  quote:    string
  feat:     boolean
  subjects: string[] // subject tags shown on card
}

export const TYPE_LABEL: Record<string, string> = {
  school:     'School Teacher',
  grad:       'University Graduate',
  examiner:   'Examiner',
  specialist: 'Subject Specialist',
}

export const BROWSE_TUTORS: BrowseTutor[] = [
  { id:'hassan-raza',    n:'Hassan Raza',    h:'Mr Hassan',    i:'HR', c:4, spec:'A-Level Physics Specialist',         lvl:['A-Level','IGCSE','O-Level'], subj:['Physics'],                     boards:['CAIE','Edexcel'], r:5.0, rev:128, price:3000, lessons:1240, cred:'MSc Physics, Imperial College London',         type:['examiner','specialist'], examiner:true,  online:true,  avail:'today', slots:1, langs:['English','Urdu'], quote:'I help students understand Physics instead of memorising it.',                         feat:true,  subjects:['A-Level Physics','AS Physics','IGCSE Physics'] },
  { id:'ayesha-khan',    n:'Ayesha Khan',    h:'Ms Ayesha',    i:'AK', c:0, spec:'A-Level Chemistry Specialist',        lvl:['A-Level','IGCSE'],           subj:['Chemistry','Biology'],         boards:['CAIE'],           r:4.9, rev:142, price:2500, lessons:1280, cred:'MSc Chemistry, Imperial College London',         type:['examiner','specialist'], examiner:true,  online:true,  avail:'today', slots:3, langs:['English','Urdu'], quote:'Students understand chemistry when they stop memorising it.',                          feat:true,  subjects:['A-Level Chemistry','IGCSE Chemistry','IGCSE Science'] },
  { id:'fatima-sheikh',  n:'Fatima Sheikh',  h:'Ms Fatima',    i:'FS', c:1, spec:'A-Level Mathematics Specialist',      lvl:['A-Level'],                   subj:['Mathematics'],                 boards:['Edexcel','CAIE'], r:4.9, rev:176, price:2800, lessons:980,  cred:'BSc Mathematics, University of Warwick',         type:['grad','specialist'],    examiner:false, online:false, avail:'week',  slots:5, langs:['English','Urdu'], quote:'Most students fear not knowing where to start. We fix that first.',                    feat:true,  subjects:['A-Level Maths','Further Maths','Statistics'] },
  { id:'salman-tariq',   n:'Salman Tariq',   h:'Mr Salman',    i:'ST', c:2, spec:'Chemistry Specialist',                lvl:['A-Level','O-Level'],         subj:['Chemistry'],                   boards:['CAIE'],           r:4.8, rev:205, price:2200, lessons:1450, cred:'MPhil Chemistry, Quaid-i-Azam University',      type:['school','specialist'],  examiner:false, online:true,  avail:'today', slots:2, langs:['English','Urdu'], quote:'We go through every past paper since 2017. Nothing surprises you.',                    feat:false, subjects:['A-Level Chemistry','O-Level Chemistry'] },
  { id:'nadia-malik',    n:'Nadia Malik',    h:'Dr Nadia',     i:'NM', c:7, spec:'A-Level Biology Specialist',          lvl:['A-Level','IGCSE'],           subj:['Biology'],                     boards:['CAIE'],           r:5.0, rev:94,  price:2600, lessons:720,  cred:'MBBS, Aga Khan University',                     type:['grad','specialist'],    examiner:false, online:false, avail:'week',  slots:4, langs:['English','Urdu'], quote:'Biology rewards the student who can draw the process, not name it.',                  feat:false, subjects:['A-Level Biology','IGCSE Biology'] },
  { id:'bilal-ahmed',    n:'Bilal Ahmed',    h:'Mr Bilal',     i:'BA', c:5, spec:'Economics & Accounting',              lvl:['A-Level'],                   subj:['Economics','Accounting'],      boards:['CAIE'],           r:4.7, rev:129, price:2000, lessons:610,  cred:'ACCA · A-Level Economics since 2016',            type:['school'],               examiner:false, online:true,  avail:'today', slots:6, langs:['English','Urdu'], quote:'The essay marks live in the evaluation. That is the half nobody teaches.',            feat:false, subjects:['A-Level Economics','A-Level Accounting'] },
  { id:'zara-hussain',   n:'Zara Hussain',   h:'Ms Zara',      i:'ZH', c:3, spec:'English Literature Specialist',       lvl:['A-Level','IGCSE'],           subj:['English Literature'],          boards:['CAIE','AQA'],     r:4.9, rev:211, price:2400, lessons:1190, cred:'BA English, University of Oxford',               type:['grad','examiner','specialist'], examiner:true, online:true, avail:'today', slots:2, langs:['English','Urdu'], quote:'A text means nothing until you can argue with it on the page.',                        feat:false, subjects:['A-Level English Lit','IGCSE English'] },
  { id:'omar-farooq',    n:'Omar Farooq',    h:'Mr Omar',      i:'OF', c:6, spec:'Computer Science Specialist',          lvl:['A-Level'],                   subj:['Computer Science'],            boards:['CAIE'],           r:4.8, rev:88,  price:2700, lessons:540,  cred:'BSc Computer Science, FAST-NUCES',               type:['grad','specialist'],    examiner:false, online:false, avail:'week',  slots:3, langs:['English','Urdu'], quote:'Pseudocode is a language. We make it your second one.',                                feat:false, subjects:['A-Level CS','AS CS'] },
  { id:'mahira-ali',     n:'Mahira Ali',     h:'Ms Mahira',    i:'MA', c:0, spec:'Mathematics Specialist',              lvl:['A-Level','IGCSE'],           subj:['Mathematics','Physics'],       boards:['CAIE'],           r:4.9, rev:156, price:2500, lessons:870,  cred:'BSc Mathematics, University of Cambridge',       type:['grad','specialist'],    examiner:false, online:true,  avail:'today', slots:2, langs:['English','Urdu'], quote:'Every hard topic is just an easy one you have not broken down yet.',                   feat:false, subjects:['A-Level Maths','IGCSE Maths','Physics'] },
  { id:'usman-javed',    n:'Usman Javed',    h:'Mr Usman',     i:'UJ', c:4, spec:'Physics Specialist',                  lvl:['A-Level','IGCSE'],           subj:['Physics'],                     boards:['Edexcel'],        r:4.7, rev:73,  price:2300, lessons:430,  cred:'MSc Physics, UCL',                               type:['grad'],                 examiner:false, online:false, avail:'week',  slots:7, langs:['English','Urdu'], quote:'Slow is smooth and smooth is fast. We build the basics properly.',                    feat:false, subjects:['A-Level Physics','IGCSE Physics'] },
  { id:'sana-riaz',      n:'Sana Riaz',      h:'Ms Sana',      i:'SR', c:1, spec:'Accounting & Business',               lvl:['A-Level'],                   subj:['Accounting','Business'],       boards:['CAIE'],           r:4.8, rev:102, price:2100, lessons:560,  cred:'Chartered Accountant · teaching since 2017',     type:['school'],               examiner:false, online:true,  avail:'today', slots:4, langs:['English','Urdu'], quote:'Accounting is a story the numbers tell. I teach you to read it.',                      feat:false, subjects:['A-Level Accounting','Business Studies'] },
  { id:'hamza-sheikh',   n:'Hamza Sheikh',   h:'Mr Hamza',     i:'HS', c:2, spec:'Economics Specialist',                lvl:['A-Level'],                   subj:['Economics'],                   boards:['Edexcel'],        r:4.9, rev:134, price:2600, lessons:780,  cred:'BSc Economics, LSE',                             type:['grad','examiner','specialist'], examiner:true, online:false, avail:'week', slots:3, langs:['English','Urdu'], quote:'I show you exactly how examiners award the top evaluation band.',                      feat:false, subjects:['A-Level Economics','AS Economics'] },
  { id:'iqra-nadeem',    n:'Iqra Nadeem',    h:'Dr Iqra',      i:'IN', c:7, spec:'Biology & Chemistry',                 lvl:['A-Level','IGCSE'],           subj:['Biology','Chemistry'],         boards:['CAIE'],           r:5.0, rev:119, price:2700, lessons:690,  cred:'MBBS, King Edward Medical University',           type:['grad','specialist'],    examiner:false, online:true,  avail:'today', slots:1, langs:['English','Urdu'], quote:'If you can teach it back to me, you have learned it. That is the test.',              feat:false, subjects:['A-Level Biology','A-Level Chemistry'] },
  { id:'daniyal-khan',   n:'Daniyal Khan',   h:'Mr Daniyal',   i:'DK', c:5, spec:'Maths & Further Maths',              lvl:['A-Level'],                   subj:['Mathematics'],                 boards:['CAIE'],           r:4.8, rev:167, price:2900, lessons:1020, cred:'BSc, Massachusetts Institute of Technology',     type:['grad','specialist'],    examiner:false, online:false, avail:'week',  slots:5, langs:['English','Urdu'], quote:'Further Maths is a method, not a mystery. We rehearse the method.',                   feat:false, subjects:['A-Level Maths','Further Maths'] },
  { id:'ayesha-tariq',   n:'Ayesha Tariq',   h:'Ms Ayesha T.', i:'AT', c:3, spec:'History & Urdu',                     lvl:['A-Level','O-Level'],         subj:['History','Urdu'],              boards:['CAIE'],           r:4.9, rev:90,  price:1900, lessons:480,  cred:'MA History, University of the Punjab',           type:['school','specialist'],  examiner:false, online:true,  avail:'today', slots:6, langs:['English','Urdu'], quote:'Source analysis is detective work. I teach you to read the clues.',                   feat:false, subjects:['A-Level History','O-Level Urdu'] },
  { id:'faizan-malik',   n:'Faizan Malik',   h:'Mr Faizan',    i:'FM', c:6, spec:'Computer Science',                    lvl:['A-Level'],                   subj:['Computer Science'],            boards:['CAIE'],           r:4.7, rev:64,  price:2400, lessons:350,  cred:'BSc Computer Science, NUST',                     type:['grad'],                 examiner:false, online:true,  avail:'today', slots:2, langs:['English','Urdu'], quote:'We build projects, not just answers. The grade follows.',                             feat:false, subjects:['A-Level CS','AS CS'] },
]

export const BROWSE_STORIES = [
  { from:'D', to:'A',  q:'This tutor helped me understand topics I had struggled with for two years.',     who:'Ahmed', subj:'A-Level Physics' },
  { from:'C', to:'A*', q:'We went through every past paper. By June, the exam felt like revision.',         who:'Hira',  subj:'A-Level Chemistry' },
  { from:'E', to:'B',  q:'I genuinely thought I would fail. Two months later I was confident in every topic.', who:'Zoya',  subj:'IGCSE Biology' },
]
