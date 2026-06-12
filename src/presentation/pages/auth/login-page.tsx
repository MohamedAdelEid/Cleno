import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { loginSchema, type LoginSchema } from '@/domain/schemas'
import { notify } from '@/infrastructure/libs/toast/toast'
import { TextField } from '@/presentation/components/common/text-field'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'

export const LoginPage = () => {
  const { t } = useTranslation('auth')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    notify.success({ title: t('signIn'), description: values.email })
  })

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('loginTitle')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('loginSubtitle')}</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <TextField
            type="email"
            autoComplete="email"
            label={t('email')}
            error={errors.email?.message}
            icon={<Mail size={18} />}
            {...register('email')}
          />

          <TextField
            type="password"
            autoComplete="current-password"
            label={t('password')}
            error={errors.password?.message}
            icon={<Lock size={18} />}
            {...register('password')}
          />

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              {...register('rememberMe')}
            />
            {t('rememberMe')}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {t('signIn')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {t('noAccount')}{' '}
          <Link to={ROUTES.AUTH.REGISTER} className="font-medium text-brand-600 hover:underline">
            {t('signUp')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
