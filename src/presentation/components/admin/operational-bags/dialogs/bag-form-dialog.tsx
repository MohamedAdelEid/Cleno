import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { OperationalBag } from '@/domain/entities'
import { OperationalBagSystemStatus } from '@/domain/enums'
import {
  createOperationalBagFormSchema,
  emptyOperationalBagFormValues,
  type OperationalBagFormValues,
} from '@/domain/schemas'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Button } from '@/presentation/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/presentation/components/ui/field'
import { Input } from '@/presentation/components/ui/input'
import { SearchableSelect, type SearchableSelectOption } from '@/presentation/components/ui/searchable-select'
import { useTranslation } from '@/presentation/hooks/use-translation'

interface BagFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  bag?: OperationalBag | null
  onSubmit: (values: OperationalBagFormValues) => boolean
  isBagIdTaken: (bagId: string, excludeId?: string) => boolean
}

export const BagFormDialog = ({
  open,
  onOpenChange,
  mode,
  bag,
  onSubmit,
  isBagIdTaken,
}: BagFormDialogProps) => {
  const { t } = useTranslation('operationalBags')

  const schema = useMemo(
    () =>
      createOperationalBagFormSchema({
        bagIdRequired: t('validationBagIdRequired'),
        bagIdMin: t('validationBagIdMin'),
        bagIdMax: t('validationBagIdMax'),
        bagIdFormat: t('validationBagIdFormat'),
      }),
    [t],
  )

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OperationalBagFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyOperationalBagFormValues,
  })

  const systemStatus = watch('systemStatus')

  useEffect(() => {
    if (!open) return

    reset(
      mode === 'edit' && bag
        ? { bagId: bag.bagId, systemStatus: bag.systemStatus }
        : emptyOperationalBagFormValues,
    )
  }, [bag, mode, open, reset])

  const systemOptions: SearchableSelectOption[] = useMemo(
    () => [
      { value: OperationalBagSystemStatus.Active, label: t('systemActive') },
      { value: OperationalBagSystemStatus.Inactive, label: t('systemInactive') },
    ],
    [t],
  )

  const handleFormSubmit = handleSubmit((values) => {
    if (isBagIdTaken(values.bagId, bag?.id)) {
      setError('bagId', { message: t('validationBagIdUnique') })
      return
    }

    const success = onSubmit(values)
    if (success) {
      onOpenChange(false)
    }
  })

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? t('formCreateTitle') : t('formEditTitle')}
      description={mode === 'create' ? t('formCreateDesc') : t('formEditDesc', { bagId: bag?.bagId ?? '' })}
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="bag-form" disabled={isSubmitting}>
            {mode === 'create' ? t('createBag') : t('saveChanges')}
          </Button>
        </>
      }
    >
      <form id="bag-form" onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        <Field invalid={!!errors.bagId}>
          <FieldLabel htmlFor="bagId">{t('formBagId')}</FieldLabel>
          <Input
            id="bagId"
            placeholder={t('formBagIdPlaceholder')}
            className="font-mono uppercase"
            {...register('bagId')}
          />
          <FieldError message={errors.bagId?.message} />
        </Field>

        <Field invalid={!!errors.systemStatus}>
          <FieldLabel>{t('formSystemStatus')}</FieldLabel>
          <SearchableSelect
            value={systemStatus}
            onChange={(value) =>
              setValue('systemStatus', value as OperationalBagFormValues['systemStatus'], {
                shouldValidate: true,
              })
            }
            options={systemOptions}
            placeholder={t('formSystemStatus')}
            allowCustom={false}
          />
          <FieldError message={errors.systemStatus?.message} />
        </Field>
      </form>
    </AppDialog>
  )
}
