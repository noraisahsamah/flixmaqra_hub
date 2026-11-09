import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import {
  Award, FileText, User, LogOut, Target, BookOpen, Flame, Trophy, Check,
  MessageSquare, Trash2, UserPlus, PenLine, ArrowRight, Camera
} from 'lucide-react';
import { MAQRA_BOUNDARIES } from './maqraData';
import type { MaqraBoundary } from './maqraData';
import { useMaqraVerses } from './useMaqraVerses';
import logoImg from './logo.png';

type ParentReaction = 'Cemerlang' | 'Baik' | 'Kurang Lancar' | 'Perlu Usaha Lebih';
type TahririStatus = 'Belum Disemak' | 'Disemak';

interface Assessment {
  syafawi: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul' | null;
  teacherNote: string;
  parentVerified: boolean;
  parentReaction?: ParentReaction;
  date: string;
}

interface TahririRecord {
  status: TahririStatus;
  rasmBetul: boolean;
  tulisanKemas: boolean;
  date: string;
}

interface Student {
  id: string;
  name: string;
  kelas: string;
}

type Role = 'Pelajar' | 'Ibu Bapa' | 'Guru';
type Tab = 'Tracker' | 'Maqra' | 'Tahriri' | 'Profile';

// Senarai nama 114 Surah untuk rujukan paparan
const SURAH_NAMES: Record<number, string> = {
  1: 'Al-Fatihah', 2: 'Al-Baqarah', 3: 'Ali Imran', 4: 'An-Nisa', 5: 'Al-Maidah',
  6: 'Al-Anam', 7: 'Al-Araf', 8: 'Al-Anfal', 9: 'At-Tawbah', 10: 'Yunus',
  11: 'Hud', 12: 'Yusuf', 13: 'Ar-Rad', 14: 'Ibrahim', 15: 'Al-Hijr',
  16: 'An-Nahl', 17: 'Al-Isra', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Taha',
  21: 'Al-Anbiya', 22: 'Al-Hajj', 23: 'Al-Muminun', 24: 'An-Nur', 25: 'Al-Furqan',
  26: 'Asy-Syuara', 27: 'An-Naml', 28: 'Al-Qasas', 29: 'Al-Ankabut', 30: 'Ar-Rum',
  31: 'Luqman', 32: 'As-Sajdah', 33: 'Al-Ahzab', 34: 'Saba', 35: 'Fatir',
  36: 'Yasin', 37: 'As-Saffat', 38: 'Sad', 39: 'Az-Zumar', 40: 'Ghafir',
  41: 'Fussilat', 42: 'Asy-Syura', 43: 'Az-Zukhruf', 44: 'Ad-Dukhan', 45: 'Al-Jathiyah',
  46: 'Al-Ahqaf', 47: 'Muhammad', 48: 'Al-Fath', 49: 'Al-Hujurat', 50: 'Qaf',
  51: 'Adz-Dzariyat', 52: 'At-Tur', 53: 'An-Najm', 54: 'Al-Qamar', 55: 'Ar-Rahman',
  56: 'Al-Waqiah', 57: 'Al-Hadid', 58: 'Al-Mujadilah', 59: 'Al-Hasyr', 60: 'Al-Mumtahanah',
  61: 'As-Saff', 62: 'Al-Jumuah', 63: 'Al-Munafiqun', 64: 'At-Taghabun', 65: 'At-Talaq',
  66: 'At-Tahrim', 67: 'Al-Mulk', 68: 'Al-Qalam', 69: 'Al-Haqqah', 70: 'Al-Maarij',
  71: 'Nuh', 72: 'Al-Jinn', 73: 'Al-Muzzammil', 74: 'Al-Muddathir', 75: 'Al-Qiyamah',
  76: 'Al-Insan', 77: 'Al-Mursalat', 78: 'An-Naba', 79: 'An-Naziat', 80: 'Abasa',
  81: 'At-Takwir', 82: 'Al-Infitar', 83: 'Al-Mutaffifin', 84: 'Al-Insyiqaq', 85: 'Al-Buruj',
  86: 'At-Tariq', 87: 'Al-Ala', 88: 'Al-Ghasyiyah', 89: 'Al-Fajr', 90: 'Al-Balad',
  91: 'Asy-Syams', 92: 'Al-Layl', 93: 'Ad-Duha', 94: 'Al-Insyirah', 95: 'At-Tin',
  96: 'Al-Alaq', 97: 'Al-Qadr', 98: 'Al-Bayyinah', 99: 'Az-Zalzalah', 100: 'Al-Adiyat',
  101: 'Al-Qariah', 102: 'At-Takathur', 103: 'Al-Asr', 104: 'Al-Humazah', 105: 'Al-Fil',
  106: 'Quraysh', 107: 'Al-Maun', 108: 'Al-Kawthar', 109: 'Al-Kafirun', 110: 'An-Nasr',
  111: 'Al-Masad', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas'
};

// Bilangan ayat bagi setiap surah (indeks 0 = Al-Fatihah)
const SURAH_AYAH_COUNTS: number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
  123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
  60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
  28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
  5, 4, 5, 6
];

const TOTAL_MAQRA = 240;
const TOTAL_JUZ = 30;
const MAQRA_PER_JUZ = 8;

const ARABIC_FONT = "'Amiri Quran', serif";
const UNSET_VALUE = 'Belum diisi';
const DEFAULT_STUDENT_ID = 'h3-1';
const SELECT_CLASS = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500';

const DEFAULT_STUDENTS: Student[] = [
  { id: 'h3-1', name: 'MUHAMAD IZZUL HAIMAN BIN MOHD FAIRUZ', kelas: 'DKA 5' },
  { id: 'h3-2', name: 'AHMAD YUSUF B. BADRUL HISHAM', kelas: 'DKM 3' },
  { id: 'h3-3', name: 'ZARIF ZAKWAN BIN SYAHRIL AMRIN', kelas: 'DKM 3' },
  { id: 'h3-4', name: 'MUHAMMAD ZAKI MUNIR BIN HAMDAN', kelas: 'DKM 3' },
  { id: 'h3-5', name: 'MUHAMMAD IRSYAD BIN AZAM', kelas: 'DEP 3' },
  { id: 'h3-6', name: 'MUHAMMAD ADAM BIN RAMZAN', kelas: 'DEP 1' },
  { id: 'h3-7', name: 'SYED MUHAMMAD YASIR BIN SYED ERMIWAZA', kelas: 'DEP 1' },
  { id: 'h3-8', name: 'MUHAMMADA ZAFRAN BIN MD AZIMI', kelas: 'DEP 1' },
  { id: 'h3-9', name: 'MUHAMAD THAQIF AHNAF BIN MOHD SABBAH', kelas: 'DEP 1' },
];

const REMEMBER_EMAIL_KEY = 'flixmaqra_remember_email';

const TEST_ACCOUNTS: { email: string; password: string; role: Role; displayName: string; fullName: string; studentId: string }[] = [
  { email: 'guru@psa.edu.my', password: 'guru123', role: 'Guru', displayName: 'Ustazah Nor Aisah', fullName: 'Ustazah Nor Aisah binti Abu Samah', studentId: DEFAULT_STUDENT_ID },
  { email: 'pelajar@student.psa.edu.my', password: 'pelajar123', role: 'Pelajar', displayName: 'Muhammad Irsyad', fullName: 'Muhammad Irsyad bin Azam', studentId: 'h3-5' },
  { email: 'waris@gmail.com', password: 'waris123', role: 'Ibu Bapa', displayName: 'Suhaila', fullName: 'Suhaila Binti Hamzah', studentId: 'h3-5' },
];

const ROLE_GREETINGS: Record<Role, string> = {
  'Guru': 'Pantau kemajuan tasmik dan semak hafazan pelajar anda hari ini.',
  'Pelajar': 'Teruskan hafazan anda. Setiap maqra yang ditasmik adalah satu kejayaan.',
  'Ibu Bapa': 'Ikuti perkembangan hafazan anak anda dengan mudah dan telus.',
};

const TAHRIRI_LABELS: Record<TahririStatus, string> = {
  'Belum Disemak': 'Belum Disemak',
  'Disemak': 'Disemak',
};

const TAHRIRI_BADGE: Record<TahririStatus, string> = {
  'Belum Disemak': 'bg-slate-100 text-slate-700 border-slate-300',
  'Disemak': 'bg-emerald-50 text-emerald-800 border-emerald-300',
};

const TAHRIRI_ACTIVE: Record<TahririStatus, string> = {
  'Belum Disemak': 'bg-slate-200 text-slate-800 border-slate-400',
  'Disemak': 'bg-emerald-600 text-white border-emerald-700',
};

const STATUS_ACTIONS: Record<Role, { label: string; next: TahririStatus }[]> = {
  'Guru': [{ label: '✅ Disemak', next: 'Disemak' }, { label: '⏳ Belum Disemak', next: 'Belum Disemak' }],
  'Pelajar': [],
  'Ibu Bapa': [],
};

const QUALITY_TAGS: { key: 'rasmBetul' | 'tulisanKemas'; label: string }[] = [
  { key: 'rasmBetul', label: '✍️ Rasm Betul' },
  { key: 'tulisanKemas', label: '✨ Tulisan Kemas' },
];

const PARENT_REACTIONS: { label: ParentReaction; emoji: string }[] = [
  { label: 'Cemerlang', emoji: '😄' },
  { label: 'Baik', emoji: '🙂' },
  { label: 'Kurang Lancar', emoji: '☹️' },
  { label: 'Perlu Usaha Lebih', emoji: '😣' },
];

function loadStored<T>(key: string, fallback: T): T {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) as T : fallback;
}

function today(): string {
  return new Date().toLocaleDateString('ms-MY');
}

function countMaqraAyat(m: MaqraBoundary): number {
  let total = 0;
  for (let s = m.startSurah; s <= m.endSurah; s++) {
    const from = s === m.startSurah ? m.startAyah : 1;
    const to = s === m.endSurah ? m.endAyah : SURAH_AYAH_COUNTS[s - 1];
    total += to - from + 1;
  }
  return total;
}

function formatMaqraRange(m: MaqraBoundary): string {
  return `${SURAH_NAMES[m.startSurah]} ${m.startAyah} - ${SURAH_NAMES[m.endSurah]} ${m.endAyah}`;
}

function highestMaqraWhere<T>(store: Record<string, T>, prefix: string, matches: (value: T) => boolean): number | null {
  let highest: number | null = null;
  for (const [key, value] of Object.entries(store)) {
    if (!key.startsWith(prefix) || !matches(value)) continue;
    const maqraNum = Number(key.slice(prefix.length));
    if (Number.isInteger(maqraNum) && maqraNum >= 1 && maqraNum <= TOTAL_MAQRA && (highest === null || maqraNum > highest)) {
      highest = maqraNum;
    }
  }
  return highest;
}

function formatMaqraPosition(maqraNum: number): string {
  const juzuk = Math.floor((maqraNum - 1) / MAQRA_PER_JUZ) + 1;
  const maqraInJuz = ((maqraNum - 1) % MAQRA_PER_JUZ) + 1;
  return `Juz ${juzuk} (Maqra' ${maqraInJuz})`;
}

const JUZ_PER_SEMESTER = 6;

function getSemesterInfo(kelas: string): { semester: number; startJuz: number; endJuz: number } | null {
  const semester = Number(kelas.match(/(\d+)\s*$/)?.[1]);
  if (!Number.isInteger(semester) || semester < 1 || semester > TOTAL_JUZ / JUZ_PER_SEMESTER) return null;
  const startJuz = (semester - 1) * JUZ_PER_SEMESTER + 1;
  return { semester, startJuz, endJuz: startJuz + JUZ_PER_SEMESTER - 1 };
}

function formatSemesterLabel(kelas: string): string {
  const info = getSemesterInfo(kelas);
  return info ? `Muqarar Sem ${info.semester}: Juz ${info.startJuz}–${info.endJuz}` : 'Muqarar belum ditetapkan';
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function parseStoredDay(value: string): string | null {
  const [d, m, y] = value.split('/').map(Number);
  if (!d || !m || !y) return null;
  return dayKey(new Date(y, m - 1, d));
}

function computeStreak(dates: string[]): number {
  const days = new Set(dates.map(parseStoredDay).filter((k): k is string => k !== null));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

interface ParentFeedbackProps {
  teacherNote: string;
  parentVerified: boolean;
  parentReaction?: ParentReaction;
  onMarkRead: () => void;
  onReact: (reaction: ParentReaction) => void;
}

function ParentFeedback({ teacherNote, parentVerified, parentReaction, onMarkRead, onReact }: ParentFeedbackProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
      <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
        <MessageSquare className="w-4 h-4 text-teal-700" /> Komen Guru
      </span>
      <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100 min-h-[3rem]">
        {teacherNote || 'Belum ada komen daripada guru.'}
      </p>

      <button
        onClick={onMarkRead}
        disabled={parentVerified}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold border transition-all disabled:cursor-default ${
          parentVerified ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-teal-400'
        }`}
      >
        <Check className="w-4 h-4" /> {parentVerified ? 'Sudah Dibaca' : 'Tanda Sudah Baca'}
      </button>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase text-slate-600">Reaksi Pantas Ibu Bapa</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PARENT_REACTIONS.map(({ label, emoji }) => {
            const selected = parentReaction === label;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={selected}
                onClick={() => onReact(label)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                  selected ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'
                }`}
              >
                <span className="text-2xl leading-none" aria-hidden="true">{emoji}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VerseSnippet({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 3) {
    return <p className="flex-1 text-center leading-loose font-bold text-teal-950">{words.join(' ')}</p>;
  }
  return (
    <p className="flex-1 text-center leading-loose">
      <span className="font-bold text-teal-950">{words.slice(0, 2).join(' ')}</span>
      <span className="mx-2 text-amber-500">...</span>
      <span className="font-bold text-teal-950">{words[words.length - 1]}</span>
    </p>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (value: string) => void;
}

function SelectField({ id, label, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-sm space-y-2">
      <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase block">{label}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)} className={SELECT_CLASS}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

const JUZ_OPTIONS = Array.from({ length: TOTAL_JUZ }, (_, i) => ({ value: i + 1, label: `Juz ${i + 1}` }));

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<Role>('Guru');
  const [activeTab, setActiveTab] = useState<Tab>('Tracker');
  const [selectedJuz, setSelectedJuz] = useState<number>(1);
  const [expandedRub, setExpandedRub] = useState<number>(1);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(DEFAULT_STUDENT_ID);
  const [loginEmail, setLoginEmail] = useState<string>(() => localStorage.getItem(REMEMBER_EMAIL_KEY) ?? '');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(() => !!localStorage.getItem(REMEMBER_EMAIL_KEY));
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showForgotHint, setShowForgotHint] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>(() => loadStored('flixmaqra_students', DEFAULT_STUDENTS));
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentKelas, setNewStudentKelas] = useState<string>('');
  const [assessments, setAssessments] = useState<Record<string, Assessment>>(() => loadStored('flixmaqra_assessments', {}));
  const [tahririStore, setTahririStore] = useState<Record<string, TahririRecord>>(() => loadStored('flixmaqra_tahriri', {}));
  const [profileImages, setProfileImages] = useState<Record<string, string>>(() => loadStored('flixmaqra_profile_images', {}));

  useEffect(() => {
    localStorage.setItem('flixmaqra_assessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('flixmaqra_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('flixmaqra_tahriri', JSON.stringify(tahririStore));
  }, [tahririStore]);

  useEffect(() => {
    localStorage.setItem('flixmaqra_profile_images', JSON.stringify(profileImages));
  }, [profileImages]);

  const selectedStudent = students.find(s => s.id === selectedStudentId) ?? null;
  const expandedMaqra = MAQRA_BOUNDARIES.find(m => m.rubNumber === expandedRub) ?? null;
  const { verses: fetchedVerses, state: verseState } = useMaqraVerses(
    expandedMaqra?.rubNumber ?? null,
    expandedMaqra?.startSurah ?? 1,
    expandedMaqra?.startAyah ?? 1,
    expandedMaqra?.endSurah ?? 1,
    expandedMaqra?.endAyah ?? 1,
    SURAH_NAMES,
  );

  const currentJuzMaqras = MAQRA_BOUNDARIES.filter(m =>
    m.rubNumber > (selectedJuz - 1) * MAQRA_PER_JUZ && m.rubNumber <= selectedJuz * MAQRA_PER_JUZ
  );

  const studentAssessments: Record<number, Assessment> = {};
  for (const m of MAQRA_BOUNDARIES) {
    const record = assessments[`${selectedStudentId}_${m.rubNumber}`];
    if (record) studentAssessments[m.rubNumber] = record;
  }

  const updateAssessment = (rubNum: number, fields: Partial<Assessment>) => {
    setAssessments(prev => {
      const key = `${selectedStudentId}_${rubNum}`;
      const current: Assessment = prev[key] ?? {
        syafawi: null,
        teacherNote: '',
        parentVerified: false,
        date: today(),
      };
      return { ...prev, [key]: { ...current, ...fields, date: today() } };
    });
  };

  const getTahriri = (rubNum: number): TahririRecord | undefined =>
    tahririStore[`${selectedStudentId}_tahriri_${rubNum}`];

  const updateTahriri = (rubNum: number, fields: Partial<TahririRecord>) => {
    setTahririStore(prev => {
      const key = `${selectedStudentId}_tahriri_${rubNum}`;
      const current: TahririRecord = prev[key] ?? { status: 'Belum Disemak', rasmBetul: false, tulisanKemas: false, date: today() };
      return { ...prev, [key]: { ...current, ...fields, date: today() } };
    });
  };

  const addStudent = () => {
    const name = newStudentName.trim();
    if (!name) return;
    const kelas = newStudentKelas.trim() || UNSET_VALUE;
    setStudents(prev => [...prev, { id: `s${Date.now()}`, name, kelas }]);
    setNewStudentName('');
    setNewStudentKelas('');
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    if (selectedStudentId === id) {
      setSelectedStudentId(students.find(s => s.id !== id)?.id ?? '');
    }
  };

  const selectJuz = (juz: number) => {
    setSelectedJuz(juz);
    setExpandedRub((juz - 1) * MAQRA_PER_JUZ + 1);
  };

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const account = TEST_ACCOUNTS.find(a => a.email === loginEmail.trim().toLowerCase() && a.password === loginPassword);
    if (!account) {
      setLoginError('Emel atau kata laluan tidak sah. Sila semak semula.');
      return;
    }
    setLoginError(null);
    setLoginPassword('');
    if (rememberMe) localStorage.setItem(REMEMBER_EMAIL_KEY, account.email);
    else localStorage.removeItem(REMEMBER_EMAIL_KEY);
    setUserRole(account.role);
    setSelectedStudentId(account.studentId);
    setActiveTab('Tracker');
    setIsAuthenticated(true);
  };

  const hasCompletedSemester = (studentId: string): boolean => {
    const student = students.find(s => s.id === studentId);
    if (!student) return false;
    const info = getSemesterInfo(student.kelas);
    if (!info) return false;
    const semRubs = MAQRA_BOUNDARIES.filter(m =>
      m.rubNumber > (info.startJuz - 1) * MAQRA_PER_JUZ && m.rubNumber <= info.endJuz * MAQRA_PER_JUZ
    );
    return semRubs.every(m => {
      const asm = assessments[`${studentId}_${m.rubNumber}`];
      const tah = tahririStore[`${studentId}_tahriri_${m.rubNumber}`];
      return !!asm?.syafawi && tah?.status === 'Disemak';
    });
  };
  const weeklyCapai = students.filter(s => hasCompletedSemester(s.id)).length;
  const weeklyBelum = students.length - weeklyCapai;
  const totalTahririDisahkan = Object.entries(tahririStore).filter(([key, r]) =>
    r.status === 'Disemak' && students.some(s => key.startsWith(`${s.id}_tahriri_`))
  ).length;

  const getStudentHafazanProgress = (studentId: string): string => {
    const maqraNum = highestMaqraWhere(assessments, `${studentId}_`, a => !!a.syafawi);
    return maqraNum ? `Hafazan: ${formatMaqraPosition(maqraNum)}` : 'Belum Tasmik';
  };

  const getStudentTahririProgress = (studentId: string): string => {
    const maqraNum = highestMaqraWhere(tahririStore, `${studentId}_tahriri_`, r => r.status === 'Disemak');
    return maqraNum ? `Tahriri: ${formatMaqraPosition(maqraNum)}` : 'Belum Disemak';
  };

  const latestHafazanMaqra = highestMaqraWhere(assessments, `${selectedStudentId}_`, a => !!a.syafawi);
  const latestTeacherNote = latestHafazanMaqra ? (studentAssessments[latestHafazanMaqra]?.teacherNote ?? '') : '';

  const studentSemesterInfo = getSemesterInfo(selectedStudent?.kelas ?? '');
  const semesterRubs = studentSemesterInfo
    ? MAQRA_BOUNDARIES.filter(m => m.rubNumber > (studentSemesterInfo.startJuz - 1) * MAQRA_PER_JUZ && m.rubNumber <= studentSemesterInfo.endJuz * MAQRA_PER_JUZ)
    : [];
  const semesterDone = semesterRubs.filter(m => studentAssessments[m.rubNumber]?.syafawi).length;
  const semesterPercent = semesterRubs.length > 0 ? Math.round((semesterDone / semesterRubs.length) * 100) : 0;

  const totalCompleted = Object.values(studentAssessments).filter(a => a.syafawi !== null).length;
  const countMumtaz = Object.values(studentAssessments).filter(a => a.syafawi === 'Mumtaz').length;
  const countJayyidJiddan = Object.values(studentAssessments).filter(a => a.syafawi === 'Jayyid Jiddan').length;
  const countJayyid = Object.values(studentAssessments).filter(a => a.syafawi === 'Jayyid').length;
  const countMaqbul = Object.values(studentAssessments).filter(a => a.syafawi === 'Maqbul').length;

  const totalAyatMemorized = MAQRA_BOUNDARIES
    .filter(m => studentAssessments[m.rubNumber]?.syafawi)
    .reduce((sum, m) => sum + countMaqraAyat(m), 0);
  const completedJuzCount = Array.from({ length: TOTAL_JUZ }, (_, i) => i + 1).filter(juz =>
    MAQRA_BOUNDARIES
      .filter(m => m.rubNumber > (juz - 1) * MAQRA_PER_JUZ && m.rubNumber <= juz * MAQRA_PER_JUZ)
      .every(m => studentAssessments[m.rubNumber]?.syafawi)
  ).length;
  const streak = computeStreak(Object.values(studentAssessments).map(a => a.date));
  const progressPercent = Math.round((totalCompleted / TOTAL_MAQRA) * 100);
  const rankRows = [
    { label: 'Mumtaz', count: countMumtaz, bar: 'bg-emerald-500' },
    { label: 'Jayyid Jiddan', count: countJayyidJiddan, bar: 'bg-cyan-500' },
    { label: 'Jayyid', count: countJayyid, bar: 'bg-amber-500' },
    { label: 'Maqbul', count: countMaqbul, bar: 'bg-rose-500' },
  ];

  const juzTahririDisahkan = currentJuzMaqras.filter(m => getTahriri(m.rubNumber)?.status === 'Disemak').length;

  const activeAccount = TEST_ACCOUNTS.find(a => a.role === userRole);
  const displayName = activeAccount?.displayName ?? userRole;

  const profile: { name: string; badge: string; fields: { label: string; value: string }[] } =
    userRole === 'Guru'
      ? {
          name: 'Ustazah Nor Aisah binti Abu Samah',
          badge: 'Pensyarah Tasmik',
          fields: [
            { label: 'Halaqah', value: 'Halaqah 3' },
            { label: 'Program', value: 'Program Techno-Huffaz PSA' },
            { label: 'Jabatan', value: 'Jabatan Pengajian Am (JPA), PSA' },
          ],
        }
      : userRole === 'Pelajar'
        ? {
            name: 'Muhammad Irsyad Bin Azam',
            badge: userRole,
            fields: [
              { label: 'No. Matrik', value: '08DEP25F1067' },
              { label: 'Kelas', value: 'DEP 3' },
              { label: 'No. Telefon', value: '013-767 0285' },
            ],
          }
        : {
            name: 'Suhaila Binti Hamzah',
            badge: userRole,
            fields: [
              { label: 'Nama Waris', value: 'Suhaila Binti Hamzah' },
              { label: 'No. Telefon', value: '017-678 0422' },
              { label: 'Hubungan', value: 'Ibu / Waris kepada Muhammad Irsyad Bin Azam' },
            ],
          };

  const currentProfileImage = profileImages[userRole] ?? null;

  const handleProfileImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfileImages(prev => ({ ...prev, [userRole]: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const resetProfileImage = () => {
    setProfileImages(prev => {
      const next = { ...prev };
      delete next[userRole];
      return next;
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md border border-amber-300/40 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200 p-2 flex items-center justify-center">
              <img src={logoImg} alt="Logo Flixmaqra'" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Flixmaqra’ Hub</h1>
            <p className="text-xs text-teal-700 font-bold tracking-wide uppercase mt-1">TRANSFORMASI DIGITAL MAQRA' AL-QURAN</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-bold uppercase text-slate-600 block">Emel</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="guru@psa.edu.my atau emel berdaftar"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-bold uppercase text-slate-600 block">Kata Laluan</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                />
                Ingat sesi ini
              </label>
              <button type="button" onClick={() => setShowForgotHint(v => !v)} className="text-teal-700 hover:text-teal-900 hover:underline">
                Lupa kata laluan?
              </button>
            </div>

            {showForgotHint && (
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                Sila hubungi pentadbir PSA untuk set semula kata laluan anda.
              </p>
            )}

            {loginError && (
              <p role="alert" className="text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl w-full transition-all"
            >
              Log Masuk ke Portal
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 space-y-1 text-[11px] text-slate-500">
            <p className="font-bold uppercase text-slate-600">RUJUKAN AKAUN PROTOTAIP</p>
            <p>Guru: guru@psa.edu.my / guru123</p>
            <p>Pelajar: pelajar@student.psa.edu.my / pelajar123</p>
            <p>Ibu Bapa: waris@gmail.com / waris123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      <header className="bg-teal-800 text-white border-b-4 border-amber-400 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={logoImg} alt="Logo Flixmaqra'" className="w-10 h-10 object-contain rounded-xl shadow-sm bg-white p-1" />
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">Flixmaqra’ Hub</h1>
              <p className="text-xs text-teal-200">Transformasi Maqra' Al-Quran</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-teal-900 border border-amber-300/30 text-amber-300 text-xs font-semibold rounded-full flex items-center gap-1.5">
              {currentProfileImage ? (
                <img src={currentProfileImage} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              {displayName}
            </span>
            <button onClick={() => setIsAuthenticated(false)} className="p-2 bg-teal-900 text-teal-200 rounded-xl hover:bg-teal-950 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {activeTab === 'Tracker' && userRole === 'Guru' && (
          <>
            <section className="bg-teal-800 rounded-3xl p-6 text-white shadow-lg border-b-4 border-amber-400">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-300">Dashboard Halaqah 3</p>
              <h2 className="text-xl font-black mt-1">Ustazah Nor Aisah binti Abu Samah</h2>
              <div className="text-xs text-teal-100 mt-1">
                <p className="font-bold text-amber-300">Muqarar Mengikut Semester:</p>
                <p>Sem 1: Juzuk 1-6 | Sem 2: Juzuk 7-12 | Sem 3: Juzuk 13-18 | Sem 4: Juzuk 19-24 | Sem 5: Juzuk 25-30</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                <div className="bg-white rounded-2xl p-4 text-slate-800">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">Capai Muqarar</span>
                  <p className="text-3xl font-black mt-2">{weeklyCapai}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">lengkap tasmik & tahriri semester</p>
                </div>
                <div className="bg-white rounded-2xl p-4 text-slate-800">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">Belum Capai</span>
                  <p className="text-3xl font-black mt-2">{weeklyBelum}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">daripada {students.length} pelajar</p>
                </div>
                <div className="bg-white rounded-2xl p-4 text-slate-800">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">Status Tahriri</span>
                  <p className="text-3xl font-black mt-2">{totalTahririDisahkan}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">buku tahriri disemak keseluruhan</p>
                </div>
              </div>
            </section>

            <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase text-teal-700">Senarai Pelajar</span>
              {students.length === 0 && <p className="text-sm text-slate-500">Belum ada pelajar. Tambah pelajar di bawah.</p>}
              <ul className="space-y-3">
                {students.map(s => (
                  <li key={s.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-black text-slate-800 min-w-0">
                        {s.name} <span className="text-teal-700">• {s.kelas}</span>
                      </p>
                      <button
                        aria-label={`Padam ${s.name}`}
                        onClick={() => removeStudent(s.id)}
                        className="p-2 shrink-0 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-bold">
                        {formatSemesterLabel(s.kelas)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-[11px] font-bold">
                        <BookOpen className="w-3.5 h-3.5" /> {getStudentHafazanProgress(s.id)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-bold">
                        <PenLine className="w-3.5 h-3.5" /> {getStudentTahririProgress(s.id)}
                      </span>
                    </div>
                    <button
                      onClick={() => { setSelectedStudentId(s.id); setActiveTab('Maqra'); }}
                      className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition-all"
                    >
                      Tasmik / Semak <ArrowRight className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <form onSubmit={e => { e.preventDefault(); addStudent(); }} className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                <input
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="Nama pelajar"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  value={newStudentKelas}
                  onChange={e => setNewStudentKelas(e.target.value)}
                  placeholder="Kelas (cth: DKA 5)"
                  className="sm:w-40 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={!newStudentName.trim()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" /> Tambah
                </button>
              </form>
            </div>
          </>
        )}

        {activeTab === 'Tracker' && userRole !== 'Guru' && (
          <>
            <section className="bg-teal-800 rounded-3xl p-6 text-white shadow-lg border-b-4 border-amber-400">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-300">{userRole === 'Ibu Bapa' ? 'Dashboard Prestasi Huffaz' : 'Dashboard Huffaz'}</p>
              <h2 className="text-2xl font-black mt-1">
                {`Selamat datang, ${activeAccount?.fullName ?? userRole}`}
              </h2>
              <p className="text-sm text-teal-100 mt-1">
                {userRole === 'Pelajar' ? `Halaqah 3 (Ustazah Nor Aisah) • ${selectedStudent?.kelas ?? UNSET_VALUE}` : ROLE_GREETINGS[userRole]}
              </p>
            </section>

            {studentSemesterInfo && (
              <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-teal-700">Silibus Semester {studentSemesterInfo.semester}: Juzuk {studentSemesterInfo.startJuz}–{studentSemesterInfo.endJuz}</span>
                    <p className="text-sm text-slate-500 mt-1">{semesterDone} daripada {semesterRubs.length} Maqra' semester ini telah dinilai</p>
                  </div>
                  <span className="text-2xl font-black text-teal-700">{semesterPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full mt-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-600 to-amber-400 h-full rounded-full transition-all duration-700" style={{ width: `${semesterPercent}%` }} />
                </div>
              </div>
            )}

            <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold uppercase text-teal-700">Hafazan Terkini</span>
                <p className="font-black text-slate-800 mt-1">{getStudentHafazanProgress(selectedStudentId)}</p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-teal-700">Status Tahriri</span>
                <p className="font-black text-slate-800 mt-1">{getStudentTahririProgress(selectedStudentId)}</p>
              </div>
            </div>

            {userRole === 'Ibu Bapa' && (
              <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm">
                <span className="text-xs font-bold uppercase text-teal-700 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-teal-700" /> Komen Pensyarah / Maklum Balas Terkini
                </span>
                <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg p-3 border border-slate-100 min-h-[3rem]">
                  {latestTeacherNote || 'Belum ada komen daripada pensyarah.'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-teal-700">
                  <BookOpen className="w-4 h-4" /> Jumlah Ayat Dihafal
                </div>
                <p className="text-3xl font-extrabold mt-3">{totalAyatMemorized}</p>
                <p className="text-xs text-slate-400 mt-1">ayat dinilai Mumtaz hingga Maqbul</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-teal-700">
                  <Award className="w-4 h-4" /> Juzuk Selesai
                </div>
                <p className="text-3xl font-extrabold mt-3">
                  {completedJuzCount} <span className="text-base text-slate-400 font-normal">/ {TOTAL_JUZ}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">8 maqra' dinilai dalam satu juzuk</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-teal-700">
                  <Flame className="w-4 h-4 text-amber-500" /> Streak Hari
                </div>
                <p className="text-3xl font-extrabold mt-3">
                  {streak} <span className="text-base text-slate-400 font-normal">hari</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">hari berturut-turut tasmik direkodkan</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-teal-700">
                  <Trophy className="w-4 h-4" /> Taburan Pangkat
                </div>
                <div className="space-y-2 mt-3">
                  {rankRows.map(row => (
                    <div key={row.label} className="flex items-center gap-2 text-xs">
                      <span className="w-20 shrink-0 font-semibold text-slate-600 truncate">{row.label}</span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${row.bar} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${totalCompleted > 0 ? (row.count / totalCompleted) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-5 text-right font-bold text-slate-800">{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-teal-700">Kemajuan Keseluruhan</span>
                  <p className="text-sm text-slate-500 mt-1">{totalCompleted} daripada {TOTAL_MAQRA} Maqra' telah dinilai</p>
                </div>
                <span className="text-2xl font-black text-teal-700">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-600 to-amber-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'Maqra' && (
          <>
            {userRole === 'Guru' && (
              <SelectField
                id="maqra-student"
                label="Pilih Pelajar Tasmik:"
                value={selectedStudentId}
                onChange={setSelectedStudentId}
                options={students.map(s => ({ value: s.id, label: s.name }))}
              />
            )}

            {!selectedStudent ? (
              <div className="bg-white p-6 rounded-2xl border border-amber-200/60 text-center text-sm text-slate-500">
                Tiada pelajar dipilih. Tambah pelajar di tab Tracker.
              </div>
            ) : (
              <>
                <SelectField id="maqra-juz" label="Pilih Juzuk (1 - 30):" value={selectedJuz} onChange={v => selectJuz(Number(v))} options={JUZ_OPTIONS} />

                <div className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentJuzMaqras.map((m, idx) => {
                      const active = expandedRub === m.rubNumber;
                      const grade = studentAssessments[m.rubNumber]?.syafawi;
                      return (
                        <button
                          key={m.rubNumber}
                          onClick={() => setExpandedRub(m.rubNumber)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            active ? 'bg-teal-700 text-white border-teal-800 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-400'
                          }`}
                        >
                          <span className="block text-xs font-black">J{selectedJuz}_M{idx + 1}</span>
                          <span className={`block text-[11px] mt-1 truncate ${active ? 'text-teal-100' : 'text-slate-500'}`}>{SURAH_NAMES[m.startSurah]}</span>
                          <span className={`block text-[11px] font-bold mt-1 ${active ? 'text-amber-300' : grade ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {grade ?? 'Belum dinilai'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {expandedMaqra && (
                  <div className="bg-white rounded-2xl border border-amber-200/80 shadow-sm p-5 space-y-5">
                    <div>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-lg border border-amber-300">
                        J{selectedJuz}_M{currentJuzMaqras.findIndex(m => m.rubNumber === expandedRub) + 1} (Rub' {expandedMaqra.rubNumber})
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 mt-2">{formatMaqraRange(expandedMaqra)}</h3>
                    </div>

                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-200">
                        <span className="text-xs font-bold uppercase text-teal-800">Panduan Hafazan Maqra' (Hafs 'an 'Asim)</span>
                      </div>

                      {userRole === 'Ibu Bapa' ? (
                        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-bold uppercase text-slate-500">Surah</span>
                            <p className="font-bold text-slate-800 mt-1">{SURAH_NAMES[expandedMaqra.startSurah]}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase text-slate-500">Hafazan Syafawi</span>
                            <p className={`font-bold mt-1 ${studentAssessments[expandedMaqra.rubNumber]?.syafawi ? 'text-teal-700' : 'text-slate-400'}`}>
                              {studentAssessments[expandedMaqra.rubNumber]?.syafawi ?? 'Belum dinilai'}
                            </p>
                          </div>
                        </div>
                      ) : verseState === 'error' ? (
                        <div className="text-center py-4 text-xs text-rose-700">Gagal memuat teks ayat. Sila cuba lagi.</div>
                      ) : verseState !== 'loaded' ? (
                        <div className="text-center py-4 text-xs text-slate-500">Memuatkan teks ayat Al-Quran...</div>
                      ) : (
                        <div className="space-y-2.5">
                          {fetchedVerses.map((v, idx) => (
                            <div key={`${v.surahNumber}-${v.ayahNumber}`} className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 shadow-sm">
                              <p className="text-xs font-semibold text-slate-400 mb-2">
                                Surah : {v.surahName} (Ayat {v.ayahNumber})
                              </p>
                              <div dir="rtl" className="flex items-center justify-between gap-3 text-xl text-slate-900" style={{ fontFamily: ARABIC_FONT }}>
                                <span className="w-8 shrink-0 text-center text-2xl text-amber-600" title="Awal Maqra'">
                                  {idx === 0 ? '۞' : ''}
                                </span>
                                <VerseSnippet text={v.textUthmani} />
                                <span className="w-8 h-8 shrink-0 rounded-full border border-amber-400 bg-amber-50 text-amber-900 text-xs font-sans font-bold flex items-center justify-center">
                                  {v.ayahNumber}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-teal-700" /> Tasmik Hafazan (Syafawi)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['Mumtaz', 'Jayyid Jiddan', 'Jayyid', 'Maqbul'] as const).map((grade) => {
                          const active = studentAssessments[expandedMaqra.rubNumber]?.syafawi === grade;
                          return (
                            <button
                              key={grade}
                              disabled={userRole !== 'Guru'}
                              onClick={() => updateAssessment(expandedMaqra.rubNumber, { syafawi: grade })}
                              className={`py-2 text-xs font-bold rounded-lg border transition-all disabled:cursor-default ${
                                active ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 disabled:hover:border-slate-200'
                              }`}
                            >
                              {grade}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {userRole === 'Guru' && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                        <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-teal-700" /> Catatan / Komen Prestasi Pensyarah
                        </span>
                        <textarea
                          value={studentAssessments[expandedMaqra.rubNumber]?.teacherNote ?? ''}
                          onChange={e => updateAssessment(expandedMaqra.rubNumber, { teacherNote: e.target.value })}
                          placeholder="cth: Bacaan lancar, tajwid mantap. Atau: Perlu ulang maqra' semasa di rumah."
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                        />
                      </div>
                    )}

                    {userRole === 'Ibu Bapa' && (
                      <ParentFeedback
                        teacherNote={studentAssessments[expandedMaqra.rubNumber]?.teacherNote ?? ''}
                        parentVerified={!!studentAssessments[expandedMaqra.rubNumber]?.parentVerified}
                        parentReaction={studentAssessments[expandedMaqra.rubNumber]?.parentReaction}
                        onMarkRead={() => updateAssessment(expandedMaqra.rubNumber, { parentVerified: true })}
                        onReact={(reaction) => updateAssessment(expandedMaqra.rubNumber, { parentReaction: reaction })}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'Tahriri' && (
          <>
            <section className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-teal-700 text-white flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Semakan Buku Tahriri</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Pensyarah menyemak buku penulisan tahriri mengikut kemajuan juzuk/surah hafazan pelajar.</p>
                </div>
              </div>
            </section>

            {!selectedStudent ? (
              <div className="bg-white p-6 rounded-2xl border border-amber-200/60 text-center text-sm text-slate-500">
                Tiada pelajar dipilih. Tambah pelajar di tab Tracker.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userRole === 'Guru' && (
                    <SelectField
                      id="tahriri-student"
                      label="Pilih Pelajar"
                      value={selectedStudentId}
                      onChange={setSelectedStudentId}
                      options={students.map(s => ({ value: s.id, label: s.name }))}
                    />
                  )}
                  <SelectField id="tahriri-juz" label="Pilih Juzuk" value={selectedJuz} onChange={v => selectJuz(Number(v))} options={JUZ_OPTIONS} />
                </div>

                <div className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-sm flex flex-wrap items-center gap-3 text-xs font-bold">
                  <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">✅ Disemak: {juzTahririDisahkan}</span>
                  <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">⏳ Belum Disemak: {currentJuzMaqras.length - juzTahririDisahkan}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {currentJuzMaqras.map((maqra, idx) => {
                    const record = getTahriri(maqra.rubNumber);
                    const status: TahririStatus = record?.status ?? 'Belum Disemak';
                    const label = `J${selectedJuz}_M${idx + 1}`;

                    if (userRole === 'Ibu Bapa') {
                      return (
                        <div key={maqra.rubNumber} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">{label}</span>
                            <p className="text-xs text-slate-500 mt-1 truncate">{formatMaqraRange(maqra)}</p>
                          </div>
                          <span className={`text-sm font-bold shrink-0 ${status === 'Disemak' ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {status === 'Disemak' ? '✅ Disemak' : '⏳ Belum Disemak'}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <article key={maqra.rubNumber} className="bg-white rounded-2xl border border-amber-200/60 shadow-sm p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">{label}</span>
                            <p className="text-xs text-slate-500 mt-1 truncate">{formatMaqraRange(maqra)}</p>
                          </div>
                          <span className={`shrink-0 px-2.5 py-1 rounded-full border text-[11px] font-bold ${TAHRIRI_BADGE[status]}`}>
                            {TAHRIRI_LABELS[status]}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {STATUS_ACTIONS[userRole].map(action => {
                            const active = status === action.next;
                            return (
                              <button
                                key={action.label}
                                disabled={active}
                                onClick={() => updateTahriri(maqra.rubNumber, { status: action.next })}
                                className={`py-2 rounded-lg border text-xs font-bold transition-all disabled:cursor-default ${
                                  active ? TAHRIRI_ACTIVE[action.next] : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-400'
                                }`}
                              >
                                {action.label}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {QUALITY_TAGS.map(tag => {
                            const active = record?.[tag.key] === true;
                            return (
                              <button
                                key={tag.key}
                                type="button"
                                aria-pressed={active}
                                disabled={userRole !== 'Guru'}
                                onClick={() => updateTahriri(maqra.rubNumber, { [tag.key]: !active })}
                                className={`px-3 py-1 rounded-full border text-xs font-bold transition-all disabled:cursor-default ${
                                  active ? 'bg-teal-700 text-white border-teal-800' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
                                }`}
                              >
                                {tag.label}
                              </button>
                            );
                          })}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'Profile' && (
          <section className="bg-white rounded-2xl border border-amber-200/60 shadow-sm overflow-hidden">
            <div className="bg-teal-800 p-6 text-center text-white border-b-4 border-amber-400">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full bg-amber-400 text-teal-950 flex items-center justify-center shadow-md overflow-hidden">
                  {currentProfileImage ? (
                    <img src={currentProfileImage} alt="Gambar Profil" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-9 h-9" />
                  )}
                </div>
                <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow cursor-pointer transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </label>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
              </div>
              {currentProfileImage && (
                <button
                  onClick={resetProfileImage}
                  className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Reset Gambar
                </button>
              )}
              <h2 className="text-xl font-black mt-4">{profile.name}</h2>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-teal-900 border border-amber-300/30 text-amber-300 text-xs font-semibold">
                {profile.badge}
              </span>
            </div>

            <div className="p-6 space-y-5">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.fields.map(field => (
                  <div key={field.label} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <dt className="text-xs font-bold uppercase text-slate-500">{field.label}</dt>
                    <dd className="font-bold text-slate-800 mt-0.5">{field.value}</dd>
                  </div>
                ))}
              </dl>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-all"
              >
                <LogOut className="w-4 h-4" /> Log Keluar
              </button>
            </div>
          </section>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around py-2">
        {([
          { key: 'Tracker', icon: Target, label: 'Tracker' },
          { key: 'Maqra', icon: BookOpen, label: "Maqra'" },
          { key: 'Tahriri', icon: FileText, label: 'Tahriri' },
          { key: 'Profile', icon: User, label: 'Profile' },
        ] as const).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-bold transition-colors ${
              activeTab === key ? 'text-teal-700' : 'text-slate-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
