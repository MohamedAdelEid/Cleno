import { Controller, type Control } from 'react-hook-form'

import type { RoleFormValues } from '@/domain/schemas'
import { RoleStatus } from '@/domain/enums'
import { FormSection } from '@/presentation/components/forms'
import { Field, FieldError, FieldLabel } from '@/presentation/components/ui/field'
import { Input, Textarea } from '@/presentation/components/ui/input'
import { cn } from '@/presentation/utils'

interface RoleDetailsSectionProps {
  control: Control<RoleFormValues>
  labels: {
    sectionTitle: string
    sectionDescription: string
    roleName: string
    description: string
    status: string
    statusActive: string
    statusInactive: string
  }
}

export const RoleDetailsSection = ({ control, labels }: RoleDetailsSectionProps) => (
  <FormSection
    variant="panel"
    title={labels.sectionTitle}
    description={labels.sectionDescription}
  >
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <div className="space-y-6">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Field invalid={!!fieldState.error}>
              <FieldLabel htmlFor="name">{labels.roleName}</FieldLabel>
              <Input {...field} id="name" autoComplete="off" value={field.value ?? ''} />
              <FieldError message={fieldState.error?.message} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field, fieldState }) => (
            <Field invalid={!!fieldState.error}>
              <FieldLabel>{labels.status}</FieldLabel>
              <div className="inline-flex w-full rounded-[10px] border border-border bg-muted/20 p-1 sm:w-auto">
                {[RoleStatus.Active, RoleStatus.Inactive].map((status) => {
                  const isSelected = field.value === status
                  const statusLabel =
                    status === RoleStatus.Active ? labels.statusActive : labels.statusInactive

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => field.onChange(status)}
                      className={cn(
                        'min-w-[7.5rem] flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 sm:flex-none',
                        isSelected
                          ? status === RoleStatus.Active
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-muted text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {statusLabel}
                    </button>
                  )
                })}
              </div>
              <FieldError message={fieldState.error?.message} />
            </Field>
          )}
        />
      </div>

      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <Field invalid={!!fieldState.error}>
            <FieldLabel htmlFor="description">{labels.description}</FieldLabel>
            <Textarea
              {...field}
              id="description"
              autoResize
              rows={6}
              value={field.value ?? ''}
            />
            <FieldError message={fieldState.error?.message} />
          </Field>
        )}
      />
    </div>
  </FormSection>
)
