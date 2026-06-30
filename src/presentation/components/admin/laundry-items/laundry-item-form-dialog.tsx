import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import type { ManagedLaundryItem } from '@/domain/entities'
import { LaundryItemCategory } from '@/domain/enums'
import {
  createLaundryItemFormSchema,
  emptyLaundryItemFormValues,
  type LaundryItemFormValues,
} from '@/domain/schemas'
import { notify } from '@/infrastructure/libs/toast/toast'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Button } from '@/presentation/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/presentation/components/ui/field'
import { Input } from '@/presentation/components/ui/input'
import {
  SearchableSelect,
  type SearchableSelectOption,
} from '@/presentation/components/ui/searchable-select'
import { useTranslation } from '@/presentation/hooks/use-translation'

interface LaundryItemFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  item?: ManagedLaundryItem | null
  onSubmit: (values: LaundryItemFormValues) => Promise<{ success: boolean; error?: string }>
}

export const LaundryItemFormDialog = ({
  open,
  onOpenChange,
  mode,
  item,
  onSubmit,
}: LaundryItemFormDialogProps) => {
  const { t } = useTranslation('laundryItems')

  const schema = useMemo(
    () =>
      createLaundryItemFormSchema({
        nameRequired: t('validationNameRequired'),
        nameMax: t('validationNameMax'),
        priceMin: t('validationPriceMin'),
      }),
    [t],
  )

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LaundryItemFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyLaundryItemFormValues,
  })

  const category = watch('category')

  useEffect(() => {
    if (!open) return

    reset(
      mode === 'edit' && item
        ? {
            name: item.name,
            category: item.category,
            price: item.price,
          }
        : emptyLaundryItemFormValues,
    )
  }, [item, mode, open, reset])

  const categoryOptions: SearchableSelectOption[] = useMemo(
    () => [
      { value: String(LaundryItemCategory.Wash), label: t('categoryWash') },
      { value: String(LaundryItemCategory.Iron), label: t('categoryIron') },
      { value: String(LaundryItemCategory.WashAndIron), label: t('categoryWashAndIron') },
    ],
    [t],
  )

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
        mode === 'edit' && item?.name
          ? t('formEditDesc', { name: item.name })
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
          <Button type="submit" form="laundry-item-form" disabled={isSubmitting}>
            {mode === 'create' ? t('createLaundryItem') : t('saveChanges')}
          </Button>
        </>
      }
    >
      <form id="laundry-item-form" onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        <Field invalid={!!errors.name}>
          <FieldLabel htmlFor="name" required>
            {t('formName')}
          </FieldLabel>
          <Input id="name" {...register('name')} placeholder={t('formNamePlaceholder')} />
          <FieldError message={errors.name?.message} />
        </Field>

        <Field invalid={!!errors.category}>
          <FieldLabel required>{t('formCategory')}</FieldLabel>
          <SearchableSelect
            value={String(category)}
            onChange={(value) =>
              setValue('category', Number(value) as LaundryItemFormValues['category'], {
                shouldValidate: true,
              })
            }
            options={categoryOptions}
            placeholder={t('formCategoryPlaceholder')}
            allowCustom={false}
            invalid={!!errors.category}
          />
          <FieldError message={errors.category?.message} />
        </Field>

        <Field invalid={!!errors.price}>
          <FieldLabel htmlFor="price" required>
            {t('formPrice')}
          </FieldLabel>
          <Input
            id="price"
            type="number"
            min={0}
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            placeholder={t('formPricePlaceholder')}
          />
          <FieldError message={errors.price?.message} />
        </Field>
      </form>
    </AppDialog>
  )
}
