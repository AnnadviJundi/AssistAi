export const STORAGE_KEY = 'assistai-session-v1'

export const modeDetails = {
  explain: {
    key: 'explain',
    label: 'Explain Mode',
    shortLabel: 'Explain',
    description: 'AI menjelaskan konsep dengan struktur ringkas dan contoh sederhana.',
    badge: 'Tutor Terstruktur',
  },
  quiz: {
    key: 'quiz',
    label: 'Quiz Mode',
    shortLabel: 'Quiz',
    description: 'AI memberi satu soal pilihan ganda dengan 3 opsi, lalu menampilkan pembahasan dan Next Question.',
    badge: 'Latihan Interaktif',
  },
  summary: {
    key: 'summary',
    label: 'Summary Mode',
    shortLabel: 'Summary',
    description: 'AI merangkum materi yang diketik user menjadi ringkasan bertingkat yang selalu singkat.',
    badge: 'Ringkasan Cepat',
  },
}

export const modeOrder = ['explain', 'quiz', 'summary']

export const examplePrompts = {
  explain: [
    'Jelaskan konsep limit fungsi dengan bahasa sederhana.',
    'Apa bedanya mitosis dan meiosis? Beri contoh singkat.',
    'Ringkas teori supply dan demand untuk mahasiswa semester awal.',
  ],
  quiz: [
    'Buat quiz tentang turunan fungsi dasar.',
    'Uji saya tentang sistem pernapasan manusia.',
    'Kasih saya soal latihan pengantar akuntansi.',
  ],
  summary: [
    'Ringkas materi fotosintesis berikut menjadi poin belajar cepat.',
    'Buat rangkuman singkat tentang inflasi dan dampaknya.',
    'Ringkas penjelasan tentang sistem peredaran darah menjadi inti pelajaran.',
  ],
}

export function createInitialMessages(mode) {
  return [
    {
      id: `welcome-${mode}`,
      role: 'assistant',
      content: createWelcomeMessage(mode),
      quiz: null,
    },
  ]
}

function createWelcomeMessage(mode) {
  if (mode === 'quiz') {
    return [
      'Halo! Saya **AssistAI** dalam **Quiz Mode**.',
      '',
      'Kirim topik yang ingin Anda latih, lalu saya akan memberi **1 soal pilihan ganda** dengan **3 opsi jawaban**.',
      '',
      'Setelah Anda memilih jawaban, saya akan menampilkan pembahasan singkat dan tombol **Next Question**.',
      '',
      'Contoh: `Buat quiz tentang integral dasar`',
    ].join('\n')
  }

  if (mode === 'summary') {
    return [
      'Halo! Saya **AssistAI** dalam **Summary Mode**.',
      '',
      'Ketik materi yang ingin diringkas, lalu saya akan mengubahnya menjadi **ringkasan bertingkat** yang selalu singkat.',
      '',
      'Format tetap yang saya pakai:',
      '',
      '1. **Gagasan Utama**',
      '2. **Poin Kunci**',
      '3. **Yang Wajib Diingat**',
      '',
      'Contoh: `Ringkas materi fotosintesis berikut...`',
    ].join('\n')
  }

  return [
    'Halo! Saya **AssistAI** dalam **Explain Mode**.',
    '',
    'Saya akan menjelaskan materi kuliah dalam bahasa Indonesia dengan struktur tetap:',
    '',
    '1. **Inti Konsep**',
    '2. **Contoh Sederhana**',
    '3. **Poin Penting**',
    '',
    'Contoh: `Jelaskan fotosintesis untuk pemula`',
  ].join('\n')
}

export function buildSystemInstruction(mode) {
  const sharedRules = [
    'Kamu adalah AssistAI, tutor belajar berbahasa Indonesia yang hangat, jelas, dan suportif.',
    'Fokus pada materi kuliah umum. Tidak perlu memilih mata kuliah tertentu kecuali user menyebutkannya.',
    'Gunakan markdown ringan saja: heading pendek, bullet, dan penekanan tebal jika membantu.',
    'Jangan menyebut diri sebagai model AI kecuali benar-benar perlu.',
    'Jika pertanyaan user ambigu, ajukan paling banyak satu pertanyaan klarifikasi singkat sebelum menjawab panjang.',
    'Jaga jawaban tetap nyaman dibaca, padat, dan relevan untuk mahasiswa.',
  ]

  if (mode === 'quiz') {
    return [
      ...sharedRules,
      'Mode aktif adalah Quiz Mode.',
      'Tugasmu adalah menjadi tutor latihan yang interaktif dengan pilihan ganda.',
      'Berikan tepat satu soal per giliran, bukan beberapa soal sekaligus.',
      'Setiap soal harus memiliki tepat 3 opsi jawaban: A, B, dan C.',
      'Tepat satu opsi harus benar.',
      'Opsi yang salah harus tetap masuk akal agar tidak terasa terlalu mudah.',
      'Jangan sertakan pembahasan di pertanyaan. Pembahasan akan ditampilkan UI setelah user memilih jawaban.',
      'Balas HANYA dalam format JSON valid tanpa markdown, tanpa code fence, tanpa teks pembuka atau penutup.',
      'Gunakan schema JSON ini persis: {"topic":"string","question":"string","options":[{"id":"A","text":"string"},{"id":"B","text":"string"},{"id":"C","text":"string"}],"correctOption":"A|B|C","explanation":"string"}',
      'Field explanation harus singkat, edukatif, dan menjelaskan mengapa jawaban benar.',
      'Jika user meminta soal berikutnya, buat soal baru yang masih satu topik dan tidak mengulang soal sebelumnya.',
    ].join(' ')
  }

  if (mode === 'summary') {
    return [
      ...sharedRules,
      'Mode aktif adalah Summary Mode.',
      'Tugasmu adalah merangkum materi yang diketik user langsung, bukan menjelaskan panjang seperti tutor.',
      'Setiap jawaban harus singkat, padat, dan memakai struktur tetap berikut dalam bahasa Indonesia:',
      '1. Gagasan Utama',
      '2. Poin Kunci',
      '3. Yang Wajib Diingat',
      'Gunakan markdown ringan dengan heading pendek dan bullet jika perlu.',
      'Jangan membuat output terlalu panjang.',
      'Fokus pada inti materi yang paling penting untuk dipelajari cepat.',
      'Jika user memberi materi yang panjang, padatkan tanpa kehilangan ide utama.',
    ].join(' ')
  }

  return [
    ...sharedRules,
    'Mode aktif adalah Explain Mode.',
    'Setiap jawaban utama harus memakai struktur tetap berikut dalam bahasa Indonesia:',
    '1. Inti Konsep',
    '2. Contoh Sederhana',
    '3. Poin Penting',
    'Boleh tambahkan bagian singkat "Langkah Belajar Lanjut" jika sangat membantu, tetapi jangan wajib.',
    'Gunakan analogi sederhana jika topik sulit.',
    'Hindari jawaban terlalu teknis pada kalimat pembuka; mulai dari gambaran besar dulu.',
    'Jika user meminta rangkuman, tetap gunakan struktur yang sama namun lebih ringkas.',
  ].join(' ')
}

export function normalizeMode(mode) {
  return modeOrder.includes(mode) ? mode : 'explain'
}

export function createQuizContinuationPrompt(quiz) {
  return [
    `Lanjutkan quiz topik ${quiz.topic}.`,
    'Buat satu soal pilihan ganda baru dengan 3 opsi A, B, dan C.',
    'Jangan ulangi soal sebelumnya.',
    `Soal sebelumnya: ${quiz.question}`,
  ].join(' ')
}

export function createQuizTranscript(quiz) {
  const options = quiz.options
    .map((option) => `${option.id}. ${option.text}`)
    .join('\n')

  return [
    `Topik: ${quiz.topic}`,
    `Soal: ${quiz.question}`,
    options,
    `Jawaban benar: ${quiz.correctOption}`,
    `Pembahasan: ${quiz.explanation}`,
  ].join('\n')
}
