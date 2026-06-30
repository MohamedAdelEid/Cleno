import { useEffect, useMemo, useState } from 'react'

import type { ManagedIncident } from '@/domain/entities'
import { IncidentStage, IncidentType } from '@/domain/enums'
import { ordersApi } from '@/infrastructure/api/orders.api'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Button } from '@/presentation/components/ui/button'
import { Field, FieldLabel } from '@/presentation/components/ui/field'
import { Input, Textarea } from '@/presentation/components/ui/input'
import {
  SearchableSelect,
  type SearchableSelectOption,
} from '@/presentation/components/ui/searchable-select'
import { useTranslation } from '@/presentation/hooks/use-translation'

export interface IncidentFormValues {
  orderSlug: string
  type: IncidentType
  stage: IncidentStage
  title: string
  description: string
}

interface IncidentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  incident?: ManagedIncident | null
  onSubmit: (values: IncidentFormValues) => Promise<{ success: boolean; error?: string }>
}

const emptyValues: IncidentFormValues = {
  orderSlug: '',
  type: IncidentType.DamagedBag,
  stage: IncidentStage.Incoming,
  title: '',
  description: '',
}

export const IncidentFormDialog = ({
  open,
  onOpenChange,
  mode,
  incident,
  onSubmit,
}: IncidentFormDialogProps) => {
  const { t } = useTranslation('incidents')
  const [values, setValues] = useState<IncidentFormValues>(emptyValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderOptions, setOrderOptions] = useState<SearchableSelectOption[]>([])

  const typeOptions = useMemo<SearchableSelectOption[]>(
    () => [
      { value: String(IncidentType.DamagedBag), label: t('typeDamagedBag') },
      { value: String(IncidentType.WrongItems), label: t('typeWrongItems') },
      { value: String(IncidentType.MissingItems), label: t('typeMissingItems') },
      { value: String(IncidentType.Delay), label: t('typeDelay') },
      { value: String(IncidentType.Other), label: t('typeOther') },
    ],
    [t],
  )

  const stageOptions = useMemo<SearchableSelectOption[]>(
    () => [
      { value: String(IncidentStage.Incoming), label: t('stageIncoming') },
      { value: String(IncidentStage.InLaundry), label: t('stageInLaundry') },
      { value: String(IncidentStage.ReadyForDelivery), label: t('stageReadyForDelivery') },
    ],
    [t],
  )

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && incident) {
      setValues({
        orderSlug: incident.order.slug,
        type: incident.type as IncidentType,
        stage: incident.stage as IncidentStage,
        title: incident.title,
        description: incident.description,
      })
      return
    }

    setValues(emptyValues)
  }, [incident, mode, open])

  useEffect(() => {
    if (!open || mode !== 'create') return

    void ordersApi
      .getAdminAll({
        pageNumber: 1,
        pageSize: 50,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      })
      .then((result) => {
        if (result.hasValue && result.data) {
          setOrderOptions(
            result.data.map((order) => ({
              value: order.slug,
              label: `${order.orderNumber} — ${order.company.name}`,
            })),
          )
        }
      })
  }, [mode, open])

  const handleSubmit = async () => {
    if (!values.description.trim()) return
    if (mode === 'create' && !values.orderSlug) return

    setIsSubmitting(true)
    const result = await onSubmit(values)
    setIsSubmitting(false)

    if (result.success) onOpenChange(false)
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? t('formCreateTitle') : t('formEditTitle')}
      description={mode === 'create' ? t('formCreateDesc') : t('formEditDesc', { title: incident?.title ?? '' })}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !values.description.trim()}>
            {mode === 'create' ? t('reportIncident') : t('saveChanges')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {mode === 'create' && (
          <Field>
            <FieldLabel required>{t('formOrder')}</FieldLabel>
            <SearchableSelect
              value={values.orderSlug}
              onChange={(orderSlug) => setValues((current) => ({ ...current, orderSlug }))}
              options={orderOptions}
              placeholder={t('formOrderPlaceholder')}
              searchPlaceholder={t('formOrderSearch')}
              allowCustom={false}
            />
          </Field>
        )}

        <Field>
          <FieldLabel required>{t('formType')}</FieldLabel>
          <SearchableSelect
            value={String(values.type)}
            onChange={(next) =>
              setValues((current) => ({ ...current, type: Number(next) as IncidentType }))
            }
            options={typeOptions}
            placeholder={t('formTypePlaceholder')}
            allowCustom={false}
          />
        </Field>

        <Field>
          <FieldLabel required={mode === 'edit'}>{t('formStage')}</FieldLabel>
          <SearchableSelect
            value={String(values.stage)}
            onChange={(next) =>
              setValues((current) => ({ ...current, stage: Number(next) as IncidentStage }))
            }
            options={stageOptions}
            placeholder={t('formStagePlaceholder')}
            allowCustom={false}
          />
        </Field>

        <Field>
          <FieldLabel>{t('formTitle')}</FieldLabel>
          <Input
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            placeholder={t('formTitlePlaceholder')}
            maxLength={200}
          />
        </Field>

        <Field>
          <FieldLabel required>{t('formDescription')}</FieldLabel>
          <Textarea
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value }))
            }
            placeholder={t('formDescriptionPlaceholder')}
            rows={4}
            maxLength={2000}
            className="resize-none"
          />
        </Field>
      </div>
    </AppDialog>
  )
}
