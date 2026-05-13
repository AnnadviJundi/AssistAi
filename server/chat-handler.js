import { buildSystemInstruction, normalizeMode } from '../src/lib/study-assistant.js'

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

function createError(statusCode, userMessage) {
  const error = new Error(userMessage)
  error.statusCode = statusCode
  error.userMessage = userMessage
  return error
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw createError(400, 'Pesan belum ada. Kirim pertanyaan terlebih dahulu.')
  }

  return messages
    .filter((message) => message && typeof message.content === 'string')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content.trim() }],
    }))
    .filter((message) => message.parts[0].text.length > 0)
}

function extractMessage(data) {
  const parts = data?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) {
    throw createError(
      502,
      'AssistAI menerima respons yang belum bisa dibaca. Coba lagi sebentar.',
    )
  }

  const text = parts
    .map((part) => part?.text)
    .filter(Boolean)
    .join('\n')
    .trim()

  if (!text) {
    throw createError(
      502,
      'AssistAI belum menghasilkan jawaban yang utuh. Silakan ulangi permintaan.',
    )
  }

  return text
}

function extractQuiz(text) {
  const normalizedText = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  let parsed

  try {
    parsed = JSON.parse(normalizedText)
  } catch {
    throw createError(
      502,
      'Quiz Mode menerima format soal yang tidak valid. Silakan coba lagi.',
    )
  }

  const hasValidOptions =
    Array.isArray(parsed?.options) &&
    parsed.options.length === 3 &&
    parsed.options.every(
      (option) =>
        option &&
        typeof option.id === 'string' &&
        typeof option.text === 'string' &&
        ['A', 'B', 'C'].includes(option.id),
    )

  if (
    typeof parsed?.topic !== 'string' ||
    typeof parsed?.question !== 'string' ||
    typeof parsed?.correctOption !== 'string' ||
    typeof parsed?.explanation !== 'string' ||
    !hasValidOptions ||
    !['A', 'B', 'C'].includes(parsed.correctOption)
  ) {
    throw createError(
      502,
      'Quiz Mode menerima struktur soal yang belum lengkap. Silakan coba lagi.',
    )
  }

  return {
    topic: parsed.topic.trim(),
    question: parsed.question.trim(),
    options: parsed.options.map((option) => ({
      id: option.id,
      text: option.text.trim(),
    })),
    correctOption: parsed.correctOption,
    explanation: parsed.explanation.trim(),
  }
}

export async function handleChatRequest(
  body,
  env = globalThis.process?.env ?? {},
) {
  const apiKey = env.GEMINI_API_KEY
  if (!apiKey) {
    throw createError(
      500,
      'GEMINI_API_KEY belum dikonfigurasi di environment server.',
    )
  }

  const mode = normalizeMode(body?.mode)
  const contents = normalizeMessages(body?.messages)

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: buildSystemInstruction(mode) }],
      },
      contents,
      generationConfig: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    }),
  })

  const payload = await response.json()

  if (!response.ok) {
    const upstreamMessage =
      payload?.error?.message ||
      'Permintaan ke Gemini belum berhasil diproses.'

    throw createError(502, upstreamMessage)
  }

  const message = extractMessage(payload)

  if (mode === 'quiz') {
    return {
      quiz: extractQuiz(message),
    }
  }

  return {
    message,
  }
}
