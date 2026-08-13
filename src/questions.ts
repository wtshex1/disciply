import { lang } from './i18n'
export interface Category { key: string; name: string; nameRo: string; color: string; construct: string; source: string }

export const CATEGORIES: Category[] = [
  { key: 'psyche', name: 'Psyche', nameRo: 'Psihic', color: '#7C3AED', construct: 'Emotional regulation & stability', source: 'ERQ · Big Five (N)' },
  { key: 'social', name: 'Social', nameRo: 'Social', color: '#2563EB', construct: 'Social self-efficacy & connection', source: 'SES · Big Five (E)' },
  { key: 'discipline', name: 'Discipline', nameRo: 'Disciplină', color: '#16A34A', construct: 'Self-control & consistency', source: 'SCS · Big Five (C)' },
  { key: 'mindset', name: 'Mindset', nameRo: 'Mentalitate', color: '#D97706', construct: 'Growth mindset & perseverance', source: 'Dweck · Grit (Duckworth)' },
  { key: 'intellect', name: 'Intellect', nameRo: 'Intelect', color: '#0891B2', construct: 'Curiosity & deep learning', source: 'Big Five (O) · Intellect' },
  { key: 'ambition', name: 'Ambition', nameRo: 'Ambiție', color: '#E11D48', construct: 'Achievement motivation & drive', source: 'AMS · Goal-setting theory' }
]

export function catName(c: Category) {
  return (lang === 'ro') && c.nameRo ? c.nameRo : c.name
}

export interface Question { id: number; cat: string; rev: boolean; text: string; textRo: string }

export const QUESTIONS: Question[] = [
  { id: 1, cat: 'psyche', rev: false, text: 'I stay calm and composed even under intense pressure.', textRo: 'Rămân calm și stăpân pe mine chiar și sub presiune intensă.' },
  { id: 2, cat: 'psyche', rev: false, text: 'When I feel stressed, I can recover my composure quickly.', textRo: 'Când mă simt stresat, îmi pot recăpăta rapid calmul.' },
  { id: 3, cat: 'psyche', rev: true, text: 'I tend to dwell on negative thoughts long after a setback.', textRo: 'Tind să rămân blocat la gânduri negative mult timp după un eșec.' },
  { id: 4, cat: 'psyche', rev: true, text: 'Strong emotions sometimes push me into decisions I regret.', textRo: 'Emoțiile puternice mă împing uneori spre decizii pe care le regret.' },
  { id: 5, cat: 'psyche', rev: false, text: 'When things go wrong, I can reframe the situation to find opportunity.', textRo: 'Când lucrurile merg prost, pot reformula situația pentru a găsi o oportunitate.' },
  { id: 6, cat: 'psyche', rev: true, text: 'A minor annoyance can ruin my whole day.', textRo: 'O supărare minoră îmi poate strica toată ziua.' },
  { id: 7, cat: 'psyche', rev: false, text: 'I deliberately calm myself down when I feel upset.', textRo: 'Mă calmez în mod conștient când sunt supărat.' },
  { id: 8, cat: 'psyche', rev: true, text: 'I often feel overwhelmed by my emotions.', textRo: 'Mă simt adesea copleșit de emoțiile mele.' },
  { id: 9, cat: 'psyche', rev: false, text: 'I can postpone short-term gratification without feeling anxious.', textRo: 'Pot amâna gratificația pe termen scurt fără să mă simt anxios.' },
  { id: 10, cat: 'psyche', rev: false, text: 'My mood stays stable even when my circumstances change.', textRo: 'Dispoziția mea rămâne stabilă chiar și când circumstanțele se schimbă.' },
  { id: 11, cat: 'psyche', rev: true, text: 'I make impulsive decisions I later regret.', textRo: 'Iau decizii impulsive pe care le regret mai târziu.' },
  { id: 12, cat: 'psyche', rev: false, text: 'I remain patient in genuinely frustrating situations.', textRo: 'Rămân răbdător în situații cu adevărat frustrante.' },
  { id: 13, cat: 'psyche', rev: false, text: 'I can notice my emotions as they arise and choose my response.', textRo: 'Pot observa emoțiile pe măsură ce apar și îmi aleg reacția.' },
  { id: 14, cat: 'psyche', rev: true, text: 'Harsh criticism affects my mood for days.', textRo: 'Critica dură îmi afectează dispoziția zile întregi.' },
  { id: 15, cat: 'psyche', rev: false, text: 'I stay optimistic even when things go badly.', textRo: 'Rămân optimist chiar și când lucrurile merg prost.' },
  { id: 16, cat: 'psyche', rev: false, text: 'I have healthy habits for processing stress and strong emotions.', textRo: 'Am obiceiuri sănătoase pentru gestionarea stresului și a emoțiilor puternice.' },

  { id: 17, cat: 'social', rev: false, text: 'I feel confident starting a conversation with a stranger.', textRo: 'Mă simt încrezător să încep o conversație cu un necunoscut.' },
  { id: 18, cat: 'social', rev: false, text: 'I build rapport with new people quickly.', textRo: 'Creez rapid o conexiune cu oamenii noi.' },
  { id: 19, cat: 'social', rev: true, text: 'I avoid social situations where I might feel awkward.', textRo: 'Evit situațiile sociale în care m-aș putea simți stânjenit.' },
  { id: 20, cat: 'social', rev: false, text: 'I clearly express my needs and boundaries to others.', textRo: 'Îmi exprim clar nevoile și limitele față de ceilalți.' },
  { id: 21, cat: 'social', rev: true, text: 'I replay conversations in my head, wishing I had said something else.', textRo: 'Redau conversațiile în minte, dorindu-mi să fi spus altceva.' },
  { id: 22, cat: 'social', rev: false, text: 'I read other people\u2019s emotions and reactions accurately.', textRo: 'Citesc cu acuratețe emoțiile și reacțiile celorlalți.' },
  { id: 23, cat: 'social', rev: true, text: 'I prefer to stay quiet and unnoticed in group settings.', textRo: 'Prefer să rămân tăcut și neobservat în grupuri.' },
  { id: 24, cat: 'social', rev: false, text: 'I actively maintain and deepen my friendships.', textRo: 'Îmi mențin și aprofundez în mod activ prieteniile.' },
  { id: 25, cat: 'social', rev: true, text: 'Asking others for help feels very difficult for me.', textRo: 'A cere ajutor celorlalți este foarte dificil pentru mine.' },
  { id: 26, cat: 'social', rev: false, text: 'I handle conflict without damaging the relationship.', textRo: 'Gestionez conflictele fără să stric relația.' },
  { id: 27, cat: 'social', rev: false, text: 'I speak up comfortably in a room full of people.', textRo: 'Vorbesc confortabil într-o încăpere plină de oameni.' },
  { id: 28, cat: 'social', rev: false, text: 'Meeting new people energizes me.', textRo: 'Întâlnirea unor oameni noi mă energizează.' },
  { id: 29, cat: 'social', rev: true, text: 'I often misread social situations.', textRo: 'Interpretez adesea greșit situațiile sociale.' },
  { id: 30, cat: 'social', rev: false, text: 'I follow through on the commitments I make to friends.', textRo: 'Îmi respect angajamentele față de prieteni.' },
  { id: 31, cat: 'social', rev: false, text: 'I listen to others without interrupting or judging.', textRo: 'Îi ascult pe ceilalți fără să întrerup sau să judec.' },
  { id: 32, cat: 'social', rev: false, text: 'Building relationships comes naturally to me.', textRo: 'Construirea relațiilor îmi vine natural.' },

  { id: 33, cat: 'discipline', rev: false, text: 'I do what I said I would, even when I don\u2019t feel like it.', textRo: 'Fac ceea ce am spus că voi face, chiar și când nu am chef.' },
  { id: 34, cat: 'discipline', rev: false, text: 'I complete important tasks before enjoyable ones.', textRo: 'Termin sarcinile importante înaintea celor plăcute.' },
  { id: 35, cat: 'discipline', rev: true, text: 'I quit tasks once they become boring or difficult.', textRo: 'Renunț la sarcini de îndată ce devin plictisitoare sau dificile.' },
  { id: 36, cat: 'discipline', rev: false, text: 'I follow a clear daily routine.', textRo: 'Urmez o rutină zilnică clară.' },
  { id: 37, cat: 'discipline', rev: true, text: 'I give in to temptations that interfere with my goals.', textRo: 'Cedez tentațiilor care interferează cu obiectivele mele.' },
  { id: 38, cat: 'discipline', rev: false, text: 'I start work early instead of leaving things until the last minute.', textRo: 'Încep munca devreme în loc să las lucrurile pe ultima clipă.' },
  { id: 39, cat: 'discipline', rev: false, text: 'My environment is organized and under control.', textRo: 'Mediul meu este organizat și sub control.' },
  { id: 40, cat: 'discipline', rev: true, text: 'I regularly stay up later than planned scrolling or watching videos.', textRo: 'Stau adesea treaz mai târziu decât planificat, derulând sau uitându-mă la videoclipuri.' },
  { id: 41, cat: 'discipline', rev: false, text: 'I keep the promises I make to myself.', textRo: 'Îmi respect promisiunile făcute față de mine însumi.' },
  { id: 42, cat: 'discipline', rev: true, text: 'I struggle to stick to a plan for more than a few days.', textRo: 'Îmi este greu să respect un plan mai mult de câteva zile.' },
  { id: 43, cat: 'discipline', rev: false, text: 'I prepare for important events well in advance.', textRo: 'Mă pregătesc pentru evenimentele importante cu mult timp înainte.' },
  { id: 44, cat: 'discipline', rev: false, text: 'I show up consistently even when my motivation is low.', textRo: 'Mă prezint constant chiar și când motivația mea este scăzută.' },
  { id: 45, cat: 'discipline', rev: true, text: 'I often start projects I never finish.', textRo: 'Încep adesea proiecte pe care nu le termin niciodată.' },
  { id: 46, cat: 'discipline', rev: false, text: 'I say no to short-term pleasure for long-term gain.', textRo: 'Spun nu plăcerii pe termen scurt pentru un câștig pe termen lung.' },
  { id: 47, cat: 'discipline', rev: false, text: 'My habits work for me rather than against me.', textRo: 'Obiceiurile mele lucrează în favoarea mea, nu împotriva mea.' },
  { id: 48, cat: 'discipline', rev: false, text: 'I stick to my schedule even when nobody is watching.', textRo: 'Îmi respect programul chiar și când nimeni nu mă urmărește.' },
  { id: 49, cat: 'discipline', rev: true, text: 'I procrastinate on things I know really matter.', textRo: 'Amân lucrurile despre care știu că contează cu adevărat.' },

  { id: 50, cat: 'mindset', rev: false, text: 'My abilities can always be developed through effort.', textRo: 'Abilitățile mele pot fi mereu dezvoltate prin efort.' },
  { id: 51, cat: 'mindset', rev: false, text: 'When I fail, I see it as feedback rather than as who I am.', textRo: 'Când eșuez, o văd ca feedback, nu ca pe o definiție a mea.' },
  { id: 52, cat: 'mindset', rev: true, text: 'I give up on challenges that seem too hard.', textRo: 'Renunț la provocările care par prea grele.' },
  { id: 53, cat: 'mindset', rev: false, text: 'Effort matters more than natural talent.', textRo: 'Efortul contează mai mult decât talentul natural.' },
  { id: 54, cat: 'mindset', rev: false, text: 'Setbacks make me work even harder.', textRo: 'Eșecurile mă fac să muncesc și mai mult.' },
  { id: 55, cat: 'mindset', rev: true, text: 'I avoid hard problems out of fear of looking incapable.', textRo: 'Evit problemele dificile de teamă să nu par incapabil.' },
  { id: 56, cat: 'mindset', rev: false, text: 'I treat criticism as a chance to improve.', textRo: 'Tratez critica drept o șansă de a mă îmbunătăți.' },
  { id: 57, cat: 'mindset', rev: false, text: 'If an approach doesn\u2019t work, I try another until I find one that does.', textRo: 'Dacă o abordare nu funcționează, încerc alta până găsesc una care funcționează.' },
  { id: 58, cat: 'mindset', rev: true, text: 'After a mistake, I stay discouraged for a long time.', textRo: 'După o greșeală, rămân descurajat mult timp.' },
  { id: 59, cat: 'mindset', rev: false, text: 'I believe people can change and grow at any age.', textRo: 'Cred că oamenii se pot schimba și crește la orice vârstă.' },
  { id: 60, cat: 'mindset', rev: false, text: 'Hard challenges excite me more than easy wins.', textRo: 'Provocările grele mă entuziasmează mai mult decât victoriile ușoare.' },
  { id: 61, cat: 'mindset', rev: false, text: 'I ask for help instead of hiding my struggles.', textRo: 'Cere ajutor în loc să îmi ascund dificultățile.' },
  { id: 62, cat: 'mindset', rev: true, text: 'I constantly compare myself to others and feel behind.', textRo: 'Mă compar constant cu ceilalți și mă simt în urmă.' },
  { id: 63, cat: 'mindset', rev: false, text: 'I embrace unfamiliar situations as learning opportunities.', textRo: 'Îmbrățișez situațiile necunoscute ca oportunități de învățare.' },
  { id: 64, cat: 'mindset', rev: true, text: 'My self-worth depends on how well I perform.', textRo: 'Valoarea mea personală depinde de cât de bine performez.' },
  { id: 65, cat: 'mindset', rev: false, text: 'I keep going after failure, even when quitting would be easier.', textRo: 'Continuu după un eșec, chiar și când renunțarea ar fi mai ușoară.' },
  { id: 66, cat: 'mindset', rev: false, text: 'I believe discipline is a skill I can train, not a fixed trait.', textRo: 'Cred că disciplina este o abilitate care poate fi antrenată, nu o trăsătură fixă.' },

  { id: 67, cat: 'intellect', rev: false, text: 'I actively seek out new ideas and perspectives.', textRo: 'Caut în mod activ idei și perspective noi.' },
  { id: 68, cat: 'intellect', rev: false, text: 'I enjoy learning about topics outside my field.', textRo: 'Îmi place să învăț despre subiecte din afara domeniului meu.' },
  { id: 69, cat: 'intellect', rev: false, text: 'I can focus deeply on a task for long stretches.', textRo: 'Pot să mă concentrez profund pe o sarcină perioade lungi.' },
  { id: 70, cat: 'intellect', rev: false, text: 'I keep asking questions until I truly understand something.', textRo: 'Continuu să pun întrebări până înțeleg cu adevărat ceva.' },
  { id: 71, cat: 'intellect', rev: true, text: 'I rarely think deeply about anything beyond the surface.', textRo: 'Gândesc rareori profund dincolo de suprafață.' },
  { id: 72, cat: 'intellect', rev: false, text: 'I learn or read something new almost every day.', textRo: 'Învăț sau citesc ceva nou aproape în fiecare zi.' },
  { id: 73, cat: 'intellect', rev: false, text: 'I enjoy complex problems that require real thinking.', textRo: 'Îmi plac problemele complexe care cer gândire reală.' },
  { id: 74, cat: 'intellect', rev: true, text: 'I stick to familiar routines instead of learning new ways.', textRo: 'Rămân la rutinele familiare în loc să învăț metode noi.' },
  { id: 75, cat: 'intellect', rev: false, text: 'I can explain complex ideas in simple words.', textRo: 'Pot explica idei complexe în cuvinte simple.' },
  { id: 76, cat: 'intellect', rev: false, text: 'My curiosity leads me to explore topics on my own.', textRo: 'Curiozitatea mă duce să explorez subiecte pe cont propriu.' },
  { id: 77, cat: 'intellect', rev: true, text: 'I get bored quickly by anything that demands mental effort.', textRo: 'Mă plictisesc repede de orice cere efort mental.' },
  { id: 78, cat: 'intellect', rev: false, text: 'I regularly write down ideas, notes, or reflections.', textRo: 'Notez regulat idei, notițe sau reflecții.' },
  { id: 79, cat: 'intellect', rev: false, text: 'I learn fastest when the challenge is difficult.', textRo: 'Învăț cel mai repede când provocarea este dificilă.' },
  { id: 80, cat: 'intellect', rev: true, text: 'I mostly consume content that entertains rather than teaches.', textRo: 'Consum mai ales conținut care distrează, nu care educă.' },
  { id: 81, cat: 'intellect', rev: false, text: 'I actively seek feedback to get better.', textRo: 'Caut feedback activ pentru a deveni mai bun.' },
  { id: 82, cat: 'intellect', rev: false, text: 'I connect new information to what I already know.', textRo: 'Conectez informațiile noi cu ceea ce știu deja.' },
  { id: 83, cat: 'intellect', rev: false, text: 'I question my own assumptions on a regular basis.', textRo: 'Îmi pun la îndoială propriile presupuneri în mod regulat.' },

  { id: 84, cat: 'ambition', rev: false, text: 'I have specific goals for where I want to be in five years.', textRo: 'Am obiective specifice pentru locul unde vreau să fiu peste cinci ani.' },
  { id: 85, cat: 'ambition', rev: false, text: 'I am willing to sacrifice comfort for future success.', textRo: 'Sunt dispus să sacrific confortul pentru succesul viitor.' },
  { id: 86, cat: 'ambition', rev: true, text: 'I rarely set goals beyond what I already know I can do.', textRo: 'Îmi stabilesc rareori obiective dincolo de ceea ce știu deja că pot face.' },
  { id: 87, cat: 'ambition', rev: false, text: 'I measure myself against my past self, not others.', textRo: 'Mă măsor cu mine din trecut, nu cu ceilalți.' },
  { id: 88, cat: 'ambition', rev: false, text: 'I pursue ambitious goals even when the outcome is uncertain.', textRo: 'Urmăresc obiective ambițioase chiar și când rezultatul este incert.' },
  { id: 89, cat: 'ambition', rev: true, text: 'I drop goals when they take longer than expected.', textRo: 'Renunț la obiective când durează mai mult decât mă așteptam.' },
  { id: 90, cat: 'ambition', rev: false, text: 'I feel restless when I\u2019m not making progress.', textRo: 'Mă simt neliniștit când nu fac progrese.' },
  { id: 91, cat: 'ambition', rev: false, text: 'I have a clear vision of the person I want to become.', textRo: 'Am o viziune clară a persoanei în care vreau să devin.' },
  { id: 92, cat: 'ambition', rev: true, text: 'I settle for good enough instead of pursuing excellence.', textRo: 'Mă mulțumesc cu ce e suficient de bun în loc să urmăresc excelența.' },
  { id: 93, cat: 'ambition', rev: false, text: 'I take calculated risks that move me toward my dreams.', textRo: 'Îmi asum riscuri calculate care mă apropie de visurile mele.' },
  { id: 94, cat: 'ambition', rev: false, text: 'My long-term goals guide my daily decisions.', textRo: 'Obiectivele mele pe termen lung îmi ghidează deciziile zilnice.' },
  { id: 95, cat: 'ambition', rev: true, text: 'I envy others\u2019 success instead of learning from it.', textRo: 'Invidiez succesul celorlalți în loc să învăț din el.' },
  { id: 96, cat: 'ambition', rev: false, text: 'I am willing to start small for a big future payoff.', textRo: 'Sunt dispus să încep de la mic pentru un câștig mare pe viitor.' },
  { id: 97, cat: 'ambition', rev: false, text: 'I revisit and revise my goals as I grow.', textRo: 'Revin asupra obiectivelor mele și le revizuiesc pe măsură ce cresc.' },
  { id: 98, cat: 'ambition', rev: false, text: 'I am driven by a purpose bigger than myself.', textRo: 'Sunt condus de un scop mai mare decât mine.' },
  { id: 99, cat: 'ambition', rev: false, text: 'I track my progress against clear milestones.', textRo: 'Îmi urmăresc progresul față de repere clare.' },
  { id: 100, cat: 'ambition', rev: true, text: 'I stop pushing as soon as I reach a comfortable level.', textRo: 'Încetez să mă mai străduiesc de îndată ce ajung la un nivel confortabil.' }
]

export interface Mode { key: 'quick' | 'balanced' | 'full'; name: string; nameRo: string; count: number; time: string; timeRo: string; desc: string; descRo: string; rec?: boolean }

export const MODES: Mode[] = [
  { key: 'quick', name: 'Quick Check', nameRo: 'Verificare rapidă', count: 20, time: '~1 min', timeRo: '~1 min', desc: 'A fast snapshot of your potential', descRo: 'O imagine rapidă a potențialului tău' },
  { key: 'balanced', name: 'Balanced', nameRo: 'Echilibrat', count: 50, time: '~3 min', timeRo: '~3 min', desc: 'Speed with solid accuracy', descRo: 'Viteză cu precizie solidă', rec: true },
  { key: 'full', name: 'Full Assessment', nameRo: 'Evaluare completă', count: 100, time: '~6 min', timeRo: '~6 min', desc: 'Maximum precision, all 100 items', descRo: 'Precizie maximă, toate cele 100 de întrebări' }
]

export function modeName(m: Mode) {
  return (lang === 'ro') && m.nameRo ? m.nameRo : m.name
}
export function modeDesc(m: Mode) {
  return (lang === 'ro') && m.descRo ? m.descRo : m.desc
}
export function modeTime(m: Mode) {
  return (lang === 'ro') && m.timeRo ? m.timeRo : m.time
}
export function questionText(q: Question) {
  return (lang === 'ro') && q.textRo ? q.textRo : q.text
}

export const SCALE_LABELS = ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree']
export const SCALE_LABELS_RO = ['Dezacord total', 'Dezacord', 'De acord', 'Total de acord']
export const SCALE_VALUES = [25, 50, 75, 100]

export function scaleLabels() {
  return (lang === 'ro') ? SCALE_LABELS_RO : SCALE_LABELS
}

function mulberry32(seed: number) {
  return function () {
    (seed |= 0)
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function selectQuiz(modeKey: Mode['key']): Question[] {
  const mode = MODES.find(m => m.key === modeKey) || MODES[1]
  const available: Record<string, number> = {}
  const quotas: Record<string, number> = {}
  CATEGORIES.forEach(c => {
    available[c.key] = QUESTIONS.filter(q => q.cat === c.key).length
    quotas[c.key] = 0
  })
  let need = mode.count
  while (need > 0) {
    let progressed = false
    for (const c of CATEGORIES) {
      if (quotas[c.key] < available[c.key] && need > 0) {
        quotas[c.key]++
        need--
        progressed = true
      }
    }
    if (!progressed) break
  }
  const picked: Question[] = []
  for (const q of shuffleQuiz()) {
    if (quotas[q.cat] > 0) { picked.push(q); quotas[q.cat]-- }
    if (picked.length === mode.count) break
  }
  return mixUp(picked, mode.count * 7919 + 11)
}

function mixUp(arr: Question[], seed: number): Question[] {
  const rng = mulberry32(seed)
  const qs = arr.slice()
  for (let i = qs.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[qs[i], qs[j]] = [qs[j], qs[i]]
  }
  for (let i = 2; i < qs.length; i++) {
    if (qs[i].cat === qs[i - 1].cat && qs[i].cat === qs[i - 2].cat) {
      let j = i + 1
      while (j < qs.length && qs[j].cat === qs[i].cat) j++
      if (j < qs.length) [qs[i], qs[j]] = [qs[j], qs[i]]
    }
  }
  return qs
}

function shuffleQuiz() {
  return mixUp(QUESTIONS, 20260730)
}
