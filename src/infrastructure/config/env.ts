import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_API_TIMEOUT: z.coerce.number().positive().default(15000),
  VITE_APP_NAME: z.string().default('Cleno'),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', z.treeifyError(parsed.error))
  throw new Error('Invalid environment variables. Check your .env file.')
}

export const env = {
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
  apiTimeout: parsed.data.VITE_API_TIMEOUT,
  appName: parsed.data.VITE_APP_NAME,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
