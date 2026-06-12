import { Link } from 'react-router-dom'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { ROUTES } from '@/presentation/routes/routes.constants'

export const NotFoundPage = () => {
  const { t } = useTranslation('common')

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gray-50 p-4 text-center dark:bg-gray-950">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t('notFoundTitle')}</h1>
      <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">{t('notFoundMessage')}</p>
      <Link
        to={ROUTES.AUTH.LOGIN}
        className="mt-2 rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-brand-700"
      >
        {t('backHome')}
      </Link>
    </div>
  )
}
