import { ArrowLeft, ArrowDown, BookOpen, GraduationCap, Users, type LucideIcon } from 'lucide-react';

interface FlowStep {
  title: string;
  detail: string;
}

interface RoleFlow {
  role: string;
  icon: LucideIcon;
  accent: string;
  summary: string;
  steps: FlowStep[];
}

const ROLE_FLOWS: RoleFlow[] = [
  {
    role: 'Pensyarah',
    icon: GraduationCap,
    accent: 'bg-teal-700 text-white',
    summary: 'Menilai hafazan dan menyemak buku tahriri pelajar.',
    steps: [
      { title: 'Log masuk', detail: 'Masuk ke portal dengan emel pensyarah.' },
      { title: 'Pilih pelajar', detail: 'Buka tab Tracker dan pilih pelajar dari senarai.' },
      { title: 'Nilai maqra\'', detail: 'Buka tab Maqra\' dan beri penilaian syafawi bagi setiap maqra\'.' },
      { title: 'Tulis komen', detail: 'Tambah catatan prestasi untuk dibaca oleh pelajar dan waris.' },
      { title: 'Semak tahriri', detail: 'Buka tab Tahriri dan tandakan buku yang telah disemak.' },
      { title: 'Kongsi laporan', detail: 'Hubungi waris melalui WhatsApp atau muat turun laporan PDF.' },
    ],
  },
  {
    role: 'Pelajar',
    icon: BookOpen,
    accent: 'bg-emerald-600 text-white',
    summary: 'Memantau kemajuan hafazan sendiri.',
    steps: [
      { title: 'Log masuk', detail: 'Masuk ke portal dengan emel pelajar.' },
      { title: 'Lihat kemajuan', detail: 'Tab Tracker menunjukkan peratusan semester dan surah yang disemak.' },
      { title: 'Semak maqra\'', detail: 'Tab Maqra\' memaparkan maqra\' dan penilaian terkini.' },
      { title: 'Baca komen', detail: 'Baca ulasan pensyarah untuk setiap maqra\'.' },
      { title: 'Semak tahriri', detail: 'Tab Tahriri menunjukkan status semakan buku anda.' },
      { title: 'Kemas kini profil', detail: 'Tukar gambar profil di tab Profile.' },
    ],
  },
  {
    role: 'Waris',
    icon: Users,
    accent: 'bg-amber-500 text-slate-900',
    summary: 'Mengikuti perkembangan anak tanpa perlu hadir ke kelas.',
    steps: [
      { title: 'Log masuk', detail: 'Masuk ke portal dengan emel waris.' },
      { title: 'Lihat kemajuan anak', detail: 'Tab Tracker menunjukkan ringkasan hafazan dan tahriri anak.' },
      { title: 'Semak maqra\'', detail: 'Tab Maqra\' memaparkan penilaian bagi setiap maqra\'.' },
      { title: 'Baca ulasan', detail: 'Baca komen pensyarah dan sahkan bahawa ia telah dibaca.' },
      { title: 'Beri reaksi', detail: 'Balas ulasan dengan reaksi ringkas untuk pensyarah.' },
      { title: 'Muat turun laporan', detail: 'Simpan laporan prestasi anak dalam format PDF.' },
    ],
  },
];

interface ProcessFlowInfographicProps {
  onBack: () => void;
}

export default function ProcessFlowInfographic({ onBack }: ProcessFlowInfographicProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-amber-300">Panduan Pantas</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Aliran Proses Flixmaqra’<sup className="text-xs align-super">®</sup> Hub</h1>
            <p className="text-sm text-teal-100 mt-1">Langkah mudah untuk setiap peranan pengguna.</p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-xl bg-white text-teal-900 text-sm font-bold hover:bg-amber-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Log Masuk
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ROLE_FLOWS.map(flow => {
            const Icon = flow.icon;
            return (
              <section key={flow.role} className="bg-white/95 rounded-3xl border border-amber-300/40 shadow-2xl p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow ${flow.accent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800">{flow.role}</h2>
                    <p className="text-xs text-slate-600 mt-0.5">{flow.summary}</p>
                  </div>
                </div>

                <ol className="space-y-2">
                  {flow.steps.map((step, idx) => (
                    <li key={step.title}>
                      <div className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="w-7 h-7 shrink-0 rounded-full bg-teal-800 text-amber-300 text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800">{step.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{step.detail}</p>
                        </div>
                      </div>
                      {idx < flow.steps.length - 1 && (
                        <div className="flex justify-center py-1 text-teal-600">
                          <ArrowDown className="w-4 h-4" />
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
