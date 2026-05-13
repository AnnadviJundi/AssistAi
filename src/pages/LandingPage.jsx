import { ArrowRight, BookOpenText, BrainCircuit, GraduationCap, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { modeDetails } from '@/lib/study-assistant'

const featureCards = [
  {
    title: 'Tutor yang fokus dan konsisten',
    description:
      'System prompt menjaga jawaban tetap berperan sebagai asisten belajar berbahasa Indonesia yang terstruktur.',
    icon: GraduationCap,
  },
  {
    title: 'Mode belajar yang jelas',
    description:
      'Pilih Explain Mode untuk memahami konsep atau Quiz Mode untuk latihan satu soal per giliran.',
    icon: BrainCircuit,
  },
  {
    title: 'Riwayat sesi tersimpan',
    description:
      'Percakapan tetap aman selama sesi browser aktif berkat sessionStorage, termasuk setelah refresh.',
    icon: ShieldCheck,
  },
]

const steps = [
  'Pilih mode belajar yang paling sesuai dengan tujuan Anda.',
  'Ketik topik kuliah, konsep, atau latihan yang ingin dipelajari.',
  'Biarkan AssistAI membimbing Anda dengan jawaban terstruktur atau quiz interaktif.',
]

export function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_48%),radial-gradient(circle_at_85%_10%,rgba(20,184,166,0.18),transparent_30%)]" />

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-16 pt-5 sm:px-6 lg:px-8">
        <header className="glass-panel sticky top-4 z-20 flex items-center justify-between rounded-full px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <BookOpenText />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AssistAI</p>
              <p className="text-xs text-muted-foreground">AI-Powered Study Assistant</p>
            </div>
          </div>
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/chat">
              Mulai Belajar
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </header>

        <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <div className="flex flex-col gap-8">
            <Badge className="w-fit" variant="outline">
              Slate + Blue + Teal
            </Badge>

            <div className="flex flex-col gap-5">
              <h1 className="max-w-3xl font-serif text-5xl leading-tight text-balance text-foreground sm:text-6xl lg:text-7xl">
                Belajar lebih fokus dengan tutor AI yang terasa seperti partner kuliah.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                AssistAI membantu menjelaskan materi, memberi latihan satu soal per
                giliran, dan menjaga ritme belajar tetap nyaman lewat antarmuka
                chat yang intuitif.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/chat">
                  Buka Tutor AI
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#fitur">Lihat Fitur</a>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['2 mode inti', 'Explain + Quiz'],
                ['Sesi lokal', 'sessionStorage'],
                ['Deploy siap', 'Vercel + serverless'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[1.5rem] border border-border bg-card/80 px-5 py-4 backdrop-blur"
                >
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden border-white/60 bg-slate-950 text-slate-50">
            <CardHeader className="gap-4 pb-4">
              <Badge className="w-fit bg-white/10 text-slate-100" variant="secondary">
                Preview Chat
              </Badge>
              <CardTitle className="text-2xl text-white">
                Tutor yang memahami konteks sesi Anda
              </CardTitle>
              <CardDescription className="text-slate-300">
                Landing page mengantar Anda ke pengalaman belajar yang rapi, lalu
                halaman chat menjaga fokus pada percakapan.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-[1.4rem] bg-white/8 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-300">
                    Explain Mode
                  </span>
                  <Sparkles className="text-teal-300" />
                </div>
                <p className="text-sm leading-7 text-slate-100">
                  “Jelaskan elastisitas permintaan.”
                </p>
                <div className="mt-4 rounded-[1.2rem] bg-white/10 p-4 text-sm leading-7 text-slate-200">
                  <p className="font-semibold text-white">Inti Konsep</p>
                  <p className="mt-1">
                    Elastisitas permintaan menunjukkan seberapa besar jumlah
                    barang yang diminta berubah ketika harga berubah.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.4rem] bg-teal-400/10 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.16em] text-teal-100">
                    Quiz Mode
                  </span>
                  <MessageSquareText className="text-teal-300" />
                </div>
                <p className="text-sm leading-7 text-slate-100">
                  “Saya siap, kasih soal akuntansi dasar.”
                </p>
                <div className="mt-4 rounded-[1.2rem] bg-black/20 p-4 text-sm leading-7 text-slate-200">
                  <p className="font-semibold text-white">Soal 1</p>
                  <p className="mt-1">
                    Jika perusahaan membeli perlengkapan secara tunai, akun apa
                    yang bertambah dan akun apa yang berkurang?
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="fitur" className="grid gap-6 lg:grid-cols-3">
          {featureCards.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="glass-panel">
              <CardHeader>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <Badge className="w-fit">Mode Belajar</Badge>
              <CardTitle>Pilih ritme belajar tanpa meninggalkan konteks.</CardTitle>
              <CardDescription>
                Dua mode inti dibuat agar terasa berbeda, bukan sekadar tombol
                kosmetik.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {Object.values(modeDetails).map((mode) => (
                <div
                  key={mode.key}
                  className="rounded-[1.4rem] border border-border bg-background/75 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {mode.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {mode.description}
                      </p>
                    </div>
                    <Badge variant="secondary">{mode.badge}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge className="w-fit" variant="secondary">
                Cara Kerja
              </Badge>
              <CardTitle>Alur singkat, cepat, dan enak dipresentasikan.</CardTitle>
              <CardDescription>
                Cocok untuk demo karena value produk terlihat dalam beberapa klik.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-[1.25rem] bg-muted/70 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-foreground">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        <section className="glass-panel flex flex-col items-start justify-between gap-6 rounded-[2rem] p-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Siap Dipakai
            </p>
            <h2 className="mt-3 font-serif text-4xl text-foreground">
              Dari landing page ke tutor AI dalam satu alur yang ringkas.
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Sistem prompt, mode belajar, session history, dan endpoint Gemini
              sudah dirancang untuk demo yang terasa matang.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/chat">
              Coba AssistAI Sekarang
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </section>
      </section>
    </main>
  )
}
