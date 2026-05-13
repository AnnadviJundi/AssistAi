import { URL, fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { handleChatRequest } from './server/chat-handler.js'

function readRequestBody(req) {
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

function assistAiApiPlugin(env) {
  return {
    name: 'assistai-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res, next) => {
        if (req.method !== 'POST') {
          return next()
        }

        try {
          const body = await readRequestBody(req)
          const result = await handleChatRequest(body, env)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (error) {
          res.statusCode = error.statusCode || 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              message:
                error.userMessage ||
                'Terjadi kendala saat memproses permintaan ke AssistAI.',
            }),
          )
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')

  return {
    plugins: [react(), tailwindcss(), assistAiApiPlugin(env)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
