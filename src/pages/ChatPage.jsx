import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  AlertCircle,
  ArrowLeft,
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  SendHorizonal,
  Trash2,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { Textarea } from '@/components/ui/textarea'
import {
  createInitialMessages,
  createQuizContinuationPrompt,
  createQuizTranscript,
  examplePrompts,
  modeDetails,
  modeOrder,
  normalizeMode,
  STORAGE_KEY,
} from '@/lib/study-assistant'
import { cn } from '@/lib/utils'

function normalizeStoredMessage(message) {
  if (!message || typeof message.content !== 'string') {
    return null
  }

  const hasQuiz = message.quiz && typeof message.quiz.question === 'string'

  return {
    id:
      message.id ||
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`),
    role: message.role === 'user' ? 'user' : 'assistant',
    content: message.content,
    hidden: Boolean(message.hidden),
    quiz: hasQuiz ? message.quiz : null,
    quizState: hasQuiz
      ? {
          selectedOption: message.quizState?.selectedOption ?? null,
          revealed: Boolean(message.quizState?.revealed),
        }
      : null,
  }
}

function loadSession() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)
    const mode = normalizeMode(parsed.mode)
    const messages = Array.isArray(parsed.messages)
      ? parsed.messages.map(normalizeStoredMessage).filter(Boolean)
      : []

    return {
      mode,
      messages: messages.length > 0 ? messages : createInitialMessages(mode),
    }
  } catch {
    return null
  }
}

function toUiMessage(role, content, extra = {}) {
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    role,
    content,
    hidden: Boolean(extra.hidden),
    quiz: extra.quiz ?? null,
    quizState: extra.quizState ?? null,
  }
}

function isQuizMessage(message) {
  return Boolean(message.quiz)
}

function getQuizOptionVariant(message, optionId) {
  const selectedOption = message.quizState?.selectedOption
  const revealed = message.quizState?.revealed

  if (!revealed) {
    return selectedOption === optionId ? 'default' : 'outline'
  }

  if (message.quiz.correctOption === optionId) {
    return 'default'
  }

  if (selectedOption === optionId) {
    return 'outline'
  }

  return 'ghost'
}

export function ChatPage() {
  const session = useMemo(() => loadSession(), [])
  const [mode, setMode] = useState(session?.mode ?? 'explain')
  const [messages, setMessages] = useState(
    session?.messages ?? createInitialMessages('explain'),
  )
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [failedRequestMessages, setFailedRequestMessages] = useState(null)
  const feedRef = useRef(null)

  useEffect(() => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mode, messages }),
    )
  }, [messages, mode])

  useEffect(() => {
    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isSubmitting, error])

  async function requestAssistant(nextMessages) {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          messages: nextMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(
          payload.message ||
            'AssistAI belum bisa menjawab. Coba kirim ulang dalam beberapa saat.',
        )
      }

      setMessages((current) => {
        if (mode === 'quiz') {
          if (!payload.quiz) {
            throw new Error('Quiz Mode tidak menerima soal yang valid.')
          }

          return [
            ...current,
            toUiMessage(
              'assistant',
              createQuizTranscript(payload.quiz),
              {
                quiz: payload.quiz,
                quizState: {
                  selectedOption: null,
                  revealed: false,
                },
              },
            ),
          ]
        }

        return [...current, toUiMessage('assistant', payload.message)]
      })
      setFailedRequestMessages(null)
    } catch (requestError) {
      setError(
        requestError.message ||
          'Terjadi kendala saat menghubungi AI. Silakan coba lagi.',
      )
      setFailedRequestMessages(nextMessages)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleModeChange(nextMode) {
    if (nextMode === mode || isSubmitting) {
      return
    }

    const freshMessages = createInitialMessages(nextMode)
    setMode(nextMode)
    setMessages(freshMessages)
    setInput('')
    setError(null)
    setFailedRequestMessages(null)
  }

  function handleClearSession() {
    const freshMessages = createInitialMessages(mode)
    setMessages(freshMessages)
    setInput('')
    setError(null)
    setFailedRequestMessages(null)
  }

  async function submitPrompt(rawValue, extra = {}) {
    const value = rawValue.trim()
    if (!value || isSubmitting) {
      return
    }

    const nextMessages = [
      ...messages,
      toUiMessage('user', value, { hidden: extra.hidden }),
    ]
    setMessages(nextMessages)
    setInput(extra.keepInput ? value : '')
    await requestAssistant(nextMessages)
  }

  async function handleNextQuestion(message) {
    if (!message.quiz || !message.quizState?.revealed || isSubmitting) {
      return
    }

    await submitPrompt(createQuizContinuationPrompt(message.quiz), {
      hidden: true,
    })
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitPrompt(input)
    }
  }

  function handleQuizAnswer(messageId, optionId) {
    setMessages((current) =>
      current.map((message) => {
        if (message.id !== messageId || !isQuizMessage(message)) {
          return message
        }

        if (message.quizState?.revealed) {
          return message
        }

        return {
          ...message,
          quizState: {
            selectedOption: optionId,
            revealed: true,
          },
        }
      }),
    )
  }

  const activeMode = modeDetails[mode]
  const visibleMessages = messages.filter((message) => !message.hidden)
  const activeQuiz = [...messages].reverse().find(isQuizMessage)

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-5 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(20,184,166,0.16),transparent_30%),linear-gradient(180deg,#f6fbff_0%,#eef6f7_100%)]" />

      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-7xl flex-col gap-6">
        <header className="glass-panel flex flex-col gap-4 rounded-[2rem] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <BookOpenText />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">AssistAI Tutor</h1>
                <Badge>{activeMode.shortLabel}</Badge>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {activeMode.description} Mengganti mode akan memulai sesi baru agar
                konteks tetap bersih.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft data-icon="inline-start" />
                Kembali ke Landing
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleClearSession}>
              <Trash2 data-icon="inline-start" />
              Clear Session
            </Button>
          </div>
        </header>

        <section className="grid flex-1 gap-6 lg:grid-cols-[1.45fr_0.95fr]">
          <Card className="flex min-h-[42rem] flex-col overflow-hidden">
            <CardHeader className="border-b border-border pb-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Ruang Belajar</CardTitle>
                  <CardDescription>
                    Riwayat percakapan tersimpan selama sesi browser aktif.
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {visibleMessages.length - 1 > 0
                    ? `${visibleMessages.length - 1} pesan aktif`
                    : 'Sesi baru'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4 p-0">
              <div
                ref={feedRef}
                className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6"
              >
                {visibleMessages.map((message) => (
                  <article
                    key={message.id}
                    className={cn(
                      'max-w-[92%] rounded-[1.6rem] px-5 py-4 text-sm leading-7 shadow-sm',
                      message.role === 'assistant'
                        ? 'glass-panel border border-border text-foreground'
                        : 'ml-auto bg-primary text-primary-foreground',
                    )}
                  >
                    <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] opacity-80">
                      {message.role === 'assistant' ? 'AssistAI' : 'Anda'}
                    </p>

                    {message.role === 'assistant' && isQuizMessage(message) ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge>{message.quiz.topic}</Badge>
                          <Badge variant="outline">1 soal • 3 opsi</Badge>
                        </div>

                        <div>
                          <p className="text-lg font-semibold leading-8 text-foreground">
                            {message.quiz.question}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">
                          {message.quiz.options.map((option) => {
                            const isSelected =
                              message.quizState?.selectedOption === option.id
                            const isCorrect =
                              message.quiz.correctOption === option.id
                            const revealed = message.quizState?.revealed

                            return (
                              <Button
                                key={option.id}
                                variant={getQuizOptionVariant(message, option.id)}
                                className={cn(
                                  'h-auto justify-start rounded-[1.25rem] px-4 py-4 text-left whitespace-normal',
                                  revealed && isCorrect
                                    ? 'bg-primary text-primary-foreground'
                                    : '',
                                  revealed &&
                                    isSelected &&
                                    !isCorrect
                                    ? 'border-destructive/30 text-foreground'
                                    : '',
                                )}
                                onClick={() => handleQuizAnswer(message.id, option.id)}
                                disabled={revealed || isSubmitting}
                              >
                                <span className="mr-3 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-black/8 text-sm font-bold">
                                  {option.id}
                                </span>
                                <span>{option.text}</span>
                              </Button>
                            )
                          })}
                        </div>

                        {message.quizState?.revealed ? (
                          <div className="rounded-[1.3rem] border border-border bg-background/75 p-4">
                            <div className="flex items-start gap-3">
                              {message.quizState.selectedOption ===
                              message.quiz.correctOption ? (
                                <CheckCircle2 className="mt-1 text-teal-600" />
                              ) : (
                                <XCircle className="mt-1 text-amber-600" />
                              )}
                              <div className="flex-1">
                                <p className="font-semibold text-foreground">
                                  {message.quizState.selectedOption ===
                                  message.quiz.correctOption
                                    ? 'Jawaban Anda benar'
                                    : `Jawaban yang benar adalah ${message.quiz.correctOption}`}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                  {message.quiz.explanation}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <Button
                                onClick={() => handleNextQuestion(message)}
                                disabled={isSubmitting}
                              >
                                Next Question
                                <ChevronRight data-icon="inline-end" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm leading-6 text-muted-foreground">
                            Pilih salah satu jawaban untuk melihat pembahasan.
                          </p>
                        )}
                      </div>
                    ) : message.role === 'assistant' ? (
                      <div className="assistant-markdown">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </article>
                ))}

                {isSubmitting ? (
                  <article className="glass-panel max-w-[92%] rounded-[1.6rem] border border-border px-5 py-4 text-sm text-foreground shadow-sm">
                    <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      AssistAI
                    </p>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <LoaderCircle className="animate-spin" />
                      <span>
                        {mode === 'quiz'
                          ? 'AssistAI sedang menyiapkan soal berikutnya...'
                          : mode === 'summary'
                            ? 'AssistAI sedang merangkum materi...'
                            : 'AssistAI sedang menyusun jawaban...'}
                      </span>
                    </div>
                  </article>
                ) : null}
              </div>

              <Separator />

              <div className="px-6 pb-6">
                {error ? (
                  <Alert className="mb-4" variant="destructive">
                    <AlertCircle className="mb-2" />
                    <AlertTitle>Koneksi ke tutor sempat terganggu</AlertTitle>
                    <AlertDescription>
                      <p>{error}</p>
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            failedRequestMessages && requestAssistant(failedRequestMessages)
                          }
                        >
                          <RefreshCw data-icon="inline-start" />
                          Coba Lagi
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : null}

                <label
                  className="mb-3 block text-sm font-medium text-foreground"
                  htmlFor="chat-input"
                >
                  {mode === 'quiz'
                    ? 'Masukkan topik untuk memulai atau mengganti quiz'
                    : mode === 'summary'
                      ? 'Tempel atau ketik materi yang ingin diringkas'
                      : 'Tulis pertanyaan atau topik belajar'}
                </label>
                <div className="flex flex-col gap-4">
                  <Textarea
                    id="chat-input"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      mode === 'explain'
                        ? 'Contoh: Jelaskan hukum Newton pertama dengan contoh sehari-hari.'
                        : mode === 'quiz'
                          ? 'Contoh: Buat quiz tentang elastisitas permintaan.'
                          : 'Contoh: Ringkas materi fotosintesis berikut menjadi catatan singkat.'
                    }
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-6 text-muted-foreground">
                      {mode === 'quiz'
                        ? 'Kirim topik baru untuk memulai quiz baru. Gunakan Next Question di kartu soal untuk lanjut.'
                        : mode === 'summary'
                          ? 'Kirim materi langsung, lalu AssistAI akan mengubahnya menjadi ringkasan bertingkat yang singkat.'
                        : (
                          <>
                            Tekan <span className="font-semibold text-foreground">Enter</span>{' '}
                            untuk kirim, <span className="font-semibold text-foreground">Shift + Enter</span>{' '}
                            untuk baris baru.
                          </>
                        )}
                    </p>
                    <Button onClick={() => submitPrompt(input)} disabled={isSubmitting}>
                      <SendHorizonal data-icon="inline-start" />
                      {mode === 'quiz'
                        ? 'Mulai Quiz'
                        : mode === 'summary'
                          ? 'Ringkas Materi'
                          : 'Kirim ke AssistAI'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pilih Mode</CardTitle>
                <CardDescription>
                  Ganti mode untuk menyesuaikan ritme belajar Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {modeOrder.map((modeKey) => {
                  const detail = modeDetails[modeKey]
                  const active = modeKey === mode

                  return (
                    <button
                      key={modeKey}
                      type="button"
                      onClick={() => handleModeChange(modeKey)}
                      className={cn(
                        'flex cursor-pointer flex-col items-start gap-2 rounded-[1.4rem] border px-4 py-4 text-left transition-colors duration-200',
                        active
                          ? 'border-primary bg-primary/8'
                          : 'border-border bg-background/70 hover:bg-muted',
                      )}
                    >
                      <div className="flex w-full items-center justify-between gap-3">
                        <p className="font-semibold text-foreground">{detail.label}</p>
                        <Badge variant={active ? 'default' : 'outline'}>
                          {detail.badge}
                        </Badge>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {detail.description}
                      </p>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contoh Prompt</CardTitle>
                <CardDescription>
                  Klik salah satu agar demo langsung terasa hidup.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {examplePrompts[mode].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitPrompt(prompt)}
                    className="cursor-pointer rounded-[1.3rem] border border-border bg-background/70 px-4 py-4 text-left text-sm leading-6 text-foreground transition-colors duration-200 hover:bg-muted"
                  >
                    {prompt}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Catatan Sesi</CardTitle>
                <CardDescription>
                  Perilaku tutor dibentuk dengan system prompt khusus pada backend tipis.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-sm leading-6 text-muted-foreground">
                <p>
                  Explain Mode menjaga struktur jawaban tetap ringan dan konsisten:
                  inti konsep, contoh sederhana, lalu poin penting.
                </p>
                <p>
                  Quiz Mode sekarang menampilkan satu soal pilihan ganda dengan tiga
                  opsi, pembahasan setelah memilih, dan tombol Next Question.
                </p>
                <p>
                  Summary Mode merangkum materi yang Anda ketik langsung menjadi
                  format tetap: gagasan utama, poin kunci, dan yang wajib diingat.
                </p>
                <p>
                  Riwayat percakapan dan status quiz aktif disimpan di <code>sessionStorage</code>{' '}
                  agar refresh tidak menghapus sesi berjalan.
                </p>
                {activeQuiz ? (
                  <div className="rounded-[1.25rem] bg-muted/70 p-4">
                    <p className="font-semibold text-foreground">Topik quiz aktif</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activeQuiz.quiz.topic}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}
