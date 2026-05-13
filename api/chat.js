import { handleChatRequest } from '../server/chat-handler.js'

function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body)
  }

  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('Body JSON tidak valid.'))
      }
    })
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method tidak didukung.' })
  }

  try {
    const body = await parseBody(req)
    const result = await handleChatRequest(body)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message:
        error.userMessage ||
        'Terjadi kendala saat memproses permintaan ke AssistAI.',
    })
  }
}
