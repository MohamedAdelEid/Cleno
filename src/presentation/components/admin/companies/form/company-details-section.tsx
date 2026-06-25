import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Controller, type Control } from 'react-hook-form'

import type { UploadedFile } from '@/domain/types'
import type { CompanyFormValues } from '@/domain/schemas'
import { COMPANY_TYPE_SUGGESTIONS } from '@/presentation/components/admin/companies/companies.constants'
import type { CompanyUploadField } from '@/presentation/components/admin/companies/form/company-form'
import { FormSection } from '@/presentation/components/forms'
import { Field, FieldError, FieldLabel } from '@/presentation/components/ui/field'
import { FileUpload, type FileUploadLabels } from '@/presentation/components/ui/file-upload'
import { Input } from '@/presentation/components/ui/input'
import { SearchableSelect } from '@/presentation/components/ui/searchable-select'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { UPLOAD_FOLDERS } from '@/infrastructure/utils/upload-folders'
import { cn } from '@/presentation/utils'

const SECTION_EASE = [0.25, 0.1, 0.25, 1] as const

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, ease: SECTION_EASE, delay },
})

interface CompanyDetailsSectionProps {
  control: Control<CompanyFormValues>
  mode?: 'create' | 'edit'
  existingLogoUrl?: string | null
  existingLogoPath?: string | null
  onExistingLogoRemove?: () => void
  uploadedFiles: Partial<Record<CompanyUploadField, UploadedFile>>
  onUploadedFileChange: (field: CompanyUploadField, file: UploadedFile | null) => void
  onUploadError: (message: string) => void
}

export const CompanyDetailsSection = ({
  control,
  mode = 'create',
  existingLogoUrl,
  existingLogoPath,
  onExistingLogoRemove,
  uploadedFiles,
  onUploadedFileChange,
  onUploadError,
}: CompanyDetailsSectionProps) => {
  const { t } = useTranslation('companies')

  const businessTypeOptions = useMemo(
    () => COMPANY_TYPE_SUGGESTIONS.map((type) => ({ value: type, label: type })),
    [],
  )

  const uploadLabels: FileUploadLabels = {
    dragTitle: t('uploadDragTitle'),
    dragHint: t('uploadDragHint'),
    browse: t('uploadBrowse'),
    replace: t('uploadReplace'),
    remove: t('uploadRemove'),
    existingFile: t('uploadExistingFile'),
    invalidType: t('uploadInvalidType'),
    maxSize: t('uploadMaxSize'),
    maxFiles: t('uploadMaxFiles'),
    uploadProgress: t('uploadProgress'),
    uploadComplete: t('uploadComplete'),
  }

  return (
    <motion.div {...fadeUp(0.08)}>
      <FormSection
        variant="panel"
        title={t('formDetailsTitle')}
        description={t('formDetailsDescription')}
      >
        <div className="space-y-5">
          <motion.div {...fadeUp(0.12)} className="grid gap-5 lg:grid-cols-2">
          <Controller
            control={control}
            name="businessName"
            render={({ field: { ref, ...fieldProps }, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel htmlFor="businessName" required>
                  {t('formBusinessName')}
                </FieldLabel>
                <Input
                  {...fieldProps}
                  ref={ref}
                  id="businessName"
                  autoComplete="organization"
                  value={fieldProps.value ?? ''}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="businessType"
            render={({ field, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel required>{t('formBusinessType')}</FieldLabel>
                <SearchableSelect
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={businessTypeOptions}
                  placeholder={t('formBusinessTypePlaceholder')}
                  searchPlaceholder={t('formBusinessTypeSearch')}
                  emptyMessage={t('formBusinessTypeEmpty')}
                  customValueLabel={(value) => t('formBusinessTypeCustom', { value })}
                  invalid={!!fieldState.error}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="mainContactPerson"
            render={({ field: { ref, ...fieldProps }, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel htmlFor="mainContactPerson" required>
                  {t('formMainContact')}
                </FieldLabel>
                <Input
                  {...fieldProps}
                  ref={ref}
                  id="mainContactPerson"
                  autoComplete="name"
                  value={fieldProps.value ?? ''}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { ref, ...fieldProps }, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel htmlFor="phone" required>
                  {t('formPhone')}
                </FieldLabel>
                <Input
                  {...fieldProps}
                  ref={ref}
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={fieldProps.value ?? ''}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { ref, ...fieldProps }, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel htmlFor="email" required>
                  {t('formEmail')}
                </FieldLabel>
                <Input
                  {...fieldProps}
                  ref={ref}
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={fieldProps.value ?? ''}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { ref, ...fieldProps }, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel htmlFor="password" required={mode === 'create'}>
                  {t('formPassword')}
                </FieldLabel>
                <Input
                  {...fieldProps}
                  ref={ref}
                  id="password"
                  isPasswordField
                  autoComplete="new-password"
                  value={fieldProps.value ?? ''}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />
        </motion.div>

        <motion.div {...fadeUp(0.16)}>
          <Controller
            control={control}
            name="address"
            render={({ field: { ref, ...fieldProps }, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel htmlFor="address">{t('formAddress')}</FieldLabel>
                <Input
                  {...fieldProps}
                  ref={ref}
                  id="address"
                  autoComplete="street-address"
                  value={fieldProps.value ?? ''}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />
        </motion.div>

        <motion.div {...fadeUp(0.2)} className="grid gap-5 lg:grid-cols-2">
          <Controller
            control={control}
            name="googleMapLink"
            render={({ field: { ref, ...fieldProps }, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel htmlFor="googleMapLink" required>
                  {t('formGoogleMapLink')}
                </FieldLabel>
                <Input
                  {...fieldProps}
                  ref={ref}
                  id="googleMapLink"
                  type="url"
                  value={fieldProps.value ?? ''}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="isActive"
            render={({ field, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel>{t('formStatus')}</FieldLabel>
                <div className="inline-flex w-full rounded-[10px] border border-border bg-muted/20 p-1">
                  {([true, false] as const).map((isActive) => {
                    const isSelected = field.value === isActive
                    const statusLabel = isActive ? t('statusActive') : t('statusInactive')

                    return (
                      <button
                        key={String(isActive)}
                        type="button"
                        onClick={() => field.onChange(isActive)}
                        className={cn(
                          'h-[40px] min-w-[7.5rem] flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                          isSelected
                            ? isActive
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
        </motion.div>

        <motion.div {...fadeUp(0.24)} className="grid gap-5 lg:grid-cols-2">
          <Controller
            control={control}
            name="logo"
            render={({ field, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel>{t('formLogo')}</FieldLabel>
                <FileUpload
                  value={field.value ?? []}
                  onChange={field.onChange}
                  accept="image/*"
                  maxFiles={1}
                  autoUpload
                  folder={UPLOAD_FOLDERS.companies.logos}
                  existingPreviewUrl={existingLogoUrl}
                  existingFilePath={existingLogoPath}
                  onExistingPreviewRemove={onExistingLogoRemove}
                  uploadedFileUrl={uploadedFiles.logo?.fileUrl ?? null}
                  uploadedFileName={uploadedFiles.logo?.originalFileName ?? null}
                  uploadedFilePath={uploadedFiles.logo?.filePath ?? null}
                  onUploadComplete={(result) => onUploadedFileChange('logo', result)}
                  onUploadError={onUploadError}
                  onFileRemoved={() => onUploadedFileChange('logo', null)}
                  labels={{
                    ...uploadLabels,
                    existingFile: t('uploadExistingLogo'),
                  }}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="commercialRegistration"
            render={({ field, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel>{t('formCommercialRegistration')}</FieldLabel>
                <FileUpload
                  value={field.value ?? []}
                  onChange={field.onChange}
                  accept="image/*,application/pdf,.pdf"
                  maxFiles={1}
                  autoUpload
                  folder={UPLOAD_FOLDERS.companies.documents}
                  uploadedFileUrl={uploadedFiles.commercialRegistration?.fileUrl ?? null}
                  uploadedFileName={
                    uploadedFiles.commercialRegistration?.originalFileName ?? null
                  }
                  uploadedFilePath={uploadedFiles.commercialRegistration?.filePath ?? null}
                  onUploadComplete={(result) =>
                    onUploadedFileChange('commercialRegistration', result)
                  }
                  onUploadError={onUploadError}
                  onFileRemoved={() => onUploadedFileChange('commercialRegistration', null)}
                  labels={{
                    ...uploadLabels,
                    existingFile: t('uploadExistingCommercialRegistration'),
                  }}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />
        </motion.div>
      </div>
    </FormSection>
    </motion.div>
  )
}
