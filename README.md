# AssistAI

AssistAI adalah web app asisten belajar berbasis AI dengan dua mode utama:

- `Explain Mode` untuk penjelasan materi yang terstruktur.
- `Quiz Mode` untuk latihan satu soal per giliran.

## Tech Stack

- React + Vite
- Tailwind CSS v4
- shadcn/ui-style source components
- Serverless function untuk proxy Gemini API
- `sessionStorage` untuk riwayat percakapan selama sesi browser

## Menjalankan Secara Lokal

1. Install dependency:

```bash
npm install
```

2. Tambahkan environment variable:

```bash
GEMINI_API_KEY=your_google_api_key
```

3. Jalankan development server:

```bash
npm run dev
```

Endpoint `/api/chat` juga bekerja saat development karena disambungkan lewat middleware Vite.

## Deploy ke Vercel

1. Import project ini ke Vercel.
2. Tambahkan environment variable `GEMINI_API_KEY`.
3. Deploy.

Vercel akan melayani frontend Vite sekaligus serverless function di `api/chat.js`.
