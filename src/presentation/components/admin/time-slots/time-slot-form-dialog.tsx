import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import type { ManagedTimeSlot } from '@/domain/entities'
import {
  createTimeSlotFormSchema,
  emptyTimeSlotFormValues,
  type TimeSlotFormValues,
} from '@/domain/schemas'
import { notify } from '@/infrastructure/libs/toast/toast'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Button } from '@/presentation/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/presentation/components/ui/field'
import { Input } from '@/presentation/components/ui/input'
import { useTranslation } from '@/presentation/hooks/use-translation'

interface TimeSlotFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  slot?: ManagedTimeSlot | null
  initialValues?: TimeSlotFormValues | null
  isLoadingInitial?: boolean
  onSubmit: (values: TimeSlotFormValues) => Promise<{ success: boolean; error?: string }>
}

export const TimeSlotFormDialog = ({
  open,
  onOpenChange,
  mode,
  slot,
  initialValues,
  isLoadingInitial = false,
  onSubmit,
}: TimeSlotFormDialogProps) => {
  const { t } = useTranslation('timeSlots')

  const schema = useMemo(
    () =>
      createTimeSlotFormSchema({
        startTimeRequired: t('validationStartTimeRequired'),
        endTimeRequired: t('validationEndTimeRequired'),
        endAfterStart: t('validationEndAfterStart'),
        displayOrderMin: t('validationDisplayOrderMin'),
      }),
    [t],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TimeSlotFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyTimeSlotFormValues,
  })

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && initialValues) {
      reset(initialValues)
      return
    }

    if (mode === 'create') {
      reset(emptyTimeSlotFormValues)
    }
  }, [initialValues, mode, open, reset])

  const handleFormSubmit = handleSubmit(async (values) => {
    const result = await onSubmit(values)
    if (result.success) {
      onOpenChange(false)
      return
    }

    notify.error({
      title: t('toastActionFailed'),
      description: result.error ?? t('toastActionFailed'),
    })
  })

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? t('formCreateTitle') : t('formEditTitle')}
      description={
        mode === 'edit' && slot?.label
          ? t('formEditDesc', { label: slot.label })
          : t('formCreateDesc')
      }
      size="md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" form="time-slot-form" disabled={isSubmitting || isLoadingInitial}>
            {mode === 'create' ? t('createTimeSlot') : t('saveChanges')}
          </Button>
        </>
      }
    >
      {isLoadingInitial ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t('formLoading')}</p>
      ) : (
        <form id="time-slot-form" onSubmit={handleFormSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field invalid={!!errors.startTime}>
              <FieldLabel htmlFor="startTime" required>
                {t('formStartTime')}
              </FieldLabel>
              <Input id="startTime" type="time" {...register('startTime')} />
              <FieldError message={errors.startTime?.message} />
            </Field>

            <Field invalid={!!errors.endTime}>
              <FieldLabel htmlFor="endTime" required>
                {t('formEndTime')}
              </FieldLabel>
              <Input id="endTime" type="time" {...register('endTime')} />
              <FieldError message={errors.endTime?.message} />
            </Field>
          </div>

          <Field invalid={!!errors.displayOrder}>
            <FieldLabel htmlFor="displayOrder" required>
              {t('formDisplayOrder')}
            </FieldLabel>
            <Input
              id="displayOrder"
              type="number"
              min={0}
              {...register('displayOrder', { valueAsNumber: true })}
            />
            <FieldError message={errors.displayOrder?.message} />
          </Field>
        </form>
      )}
    </AppDialog>
  )
}
