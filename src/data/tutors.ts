export type Tutor = {
  n: string;   // name
  i: string;   // initials
  c: number;   // avatar colour index (0-7)
  subj: string;
  g: string;   // group / stream
  board: string;
  r: number;   // rating
  rev: number; // reviews
  price: number;
  cred: string;
  online: boolean;
  resp: string;
  slots: number;
};

export const TUTORS: Tutor[] = [
  { n:"Ayesha Khan",    i:"AK", c:0, subj:"A-Level & IGCSE Chemistry",        g:"Sciences",    board:"CAIE",    r:4.9, rev:142, price:2500, cred:"CAIE A*, 2018 · MSc Chemistry, Imperial College",  online:true,  resp:"1h", slots:3 },
  { n:"Hassan Raza",    i:"HR", c:4, subj:"A-Level & IGCSE Physics",           g:"Sciences",    board:"CAIE",    r:5.0, rev:318, price:3000, cred:"CAIE A*, 2015 · BSc Physics, LUMS",                online:true,  resp:"2h", slots:2 },
  { n:"Fatima Sheikh",  i:"FS", c:1, subj:"A-Level Maths & Further Maths",     g:"Mathematics", board:"Edexcel", r:4.9, rev:176, price:2800, cred:"A*A*, 2017 · BSc Mathematics, Warwick",             online:false, resp:"3h", slots:5 },
  { n:"Salman Tariq",   i:"ST", c:2, subj:"A-Level & O-Level Chemistry",       g:"Sciences",    board:"CAIE",    r:4.8, rev:205, price:2200, cred:"CAIE A*, 2016 · MPhil Chemistry, QAU",              online:true,  resp:"1h", slots:1 },
  { n:"Nadia Malik",    i:"NM", c:7, subj:"A-Level & IGCSE Biology",           g:"Sciences",    board:"CAIE",    r:5.0, rev:94,  price:2600, cred:"CAIE A*, 2019 · MBBS, Aga Khan University",         online:false, resp:"1h", slots:4 },
  { n:"Bilal Ahmed",    i:"BA", c:5, subj:"A-Level Economics & Accounting",    g:"Commerce",    board:"CAIE",    r:4.7, rev:129, price:2000, cred:"CAIE A*, 2014 · ACCA",                              online:true,  resp:"4h", slots:6 },
  { n:"Zara Hussain",   i:"ZH", c:3, subj:"A-Level English Literature",        g:"Humanities",  board:"CAIE",    r:4.9, rev:211, price:2400, cred:"CAIE A*, 2016 · BA English, Oxford",                online:true,  resp:"2h", slots:2 },
  { n:"Omar Farooq",    i:"OF", c:6, subj:"A-Level Computer Science",          g:"Sciences",    board:"CAIE",    r:4.8, rev:88,  price:2700, cred:"CAIE A*, 2018 · BSc CS, FAST",                      online:false, resp:"3h", slots:3 },
  { n:"Mahira Ali",     i:"MA", c:0, subj:"A-Level Mathematics",               g:"Mathematics", board:"CAIE",    r:4.9, rev:156, price:2500, cred:"CAIE A*, 2017 · BSc Maths, Cambridge",              online:true,  resp:"2h", slots:2 },
  { n:"Usman Javed",    i:"UJ", c:4, subj:"A-Level & IGCSE Physics",           g:"Sciences",    board:"Edexcel", r:4.7, rev:73,  price:2300, cred:"A*, 2015 · MSc Physics, UCL",                       online:false, resp:"5h", slots:7 },
  { n:"Sana Riaz",      i:"SR", c:1, subj:"A-Level Accounting & Business",     g:"Commerce",    board:"CAIE",    r:4.8, rev:102, price:2100, cred:"CAIE A*, 2016 · Chartered Accountant",              online:true,  resp:"3h", slots:4 },
  { n:"Hamza Sheikh",   i:"HS", c:2, subj:"A-Level Economics",                 g:"Commerce",    board:"Edexcel", r:4.9, rev:134, price:2600, cred:"A*, 2014 · BSc Economics, LSE",                     online:false, resp:"2h", slots:3 },
  { n:"Iqra Nadeem",    i:"IN", c:7, subj:"A-Level Biology & Chemistry",       g:"Sciences",    board:"CAIE",    r:5.0, rev:119, price:2700, cred:"CAIE A*, 2018 · MBBS, King Edward",                 online:true,  resp:"1h", slots:1 },
  { n:"Daniyal Khan",   i:"DK", c:5, subj:"A-Level Maths & Further Maths",    g:"Mathematics", board:"CAIE",    r:4.8, rev:167, price:2900, cred:"A*A*, 2015 · BSc Mathematics, MIT",                 online:false, resp:"4h", slots:5 },
  { n:"Ayesha Tariq",   i:"AT", c:3, subj:"A-Level History & Urdu",            g:"Humanities",  board:"CAIE",    r:4.9, rev:90,  price:1900, cred:"CAIE A*, 2017 · MA History, Punjab University",    online:true,  resp:"2h", slots:6 },
  { n:"Faizan Malik",   i:"FM", c:6, subj:"A-Level Computer Science",          g:"Sciences",    board:"CAIE",    r:4.7, rev:64,  price:2400, cred:"CAIE A*, 2019 · BSc CS, NUST",                      online:true,  resp:"3h", slots:2 },
];

export const AVATAR_COLORS = [
  '#1F4A3D', '#A8741C', '#B0532A', '#5C544A',
  '#2E5A4A', '#8A5A2B', '#6B4A3A', '#3B6E54',
];
