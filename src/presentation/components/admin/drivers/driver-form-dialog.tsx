import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, Phone, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'

import type { UploadedFile } from '@/domain/types'
import type { ManagedDriver } from '@/domain/entities'
import { DriverAvailability } from '@/domain/enums'
import {
  createDriverFormSchema,
  emptyDriverFormValues,
  type DriverFormValues,
} from '@/domain/schemas'
import { UPLOAD_FOLDERS } from '@/infrastructure/utils/upload-folders'
import { notify } from '@/infrastructure/libs/toast/toast'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Button } from '@/presentation/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/presentation/components/ui/field'
import { FileUpload, type FileUploadLabels } from '@/presentation/components/ui/file-upload'
import { Input } from '@/presentation/components/ui/input'
import {
  SearchableSelect,
  type SearchableSelectOption,
} from '@/presentation/components/ui/searchable-select'
import { useTranslation } from '@/presentation/hooks/use-translation'

interface DriverFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  driver?: ManagedDriver | null
  onSubmit: (values: DriverFormValues) => Promise<{ success: boolean; error?: string }>
}

export const DriverFormDialog = ({
  open,
  onOpenChange,
  mode,
  driver,
  onSubmit,
}: DriverFormDialogProps) => {
  const { t } = useTranslation('drivers')
  const [uploadedPhoto, setUploadedPhoto] = useState<UploadedFile | null>(null)
  const [existingPhotoRemoved, setExistingPhotoRemoved] = useState(false)

  const schema = useMemo(
    () =>
      createDriverFormSchema(
        {
          fullNameRequired: t('validationFullNameRequired'),
          fullNameMin: t('validationFullNameMin'),
          fullNameMax: t('validationFullNameMax'),
          emailRequired: t('validationEmailRequired'),
          emailInvalid: t('validationEmailInvalid'),
          phoneRequired: t('validationPhoneRequired'),
          phoneMax: t('validationPhoneMax'),
          passwordRequired: t('validationPasswordRequired'),
          passwordMin: t('validationPasswordMin'),
          photoInvalid: t('validationPhotoInvalid'),
          photoMaxSize: t('validationPhotoMaxSize'),
        },
        { mode },
      ),
    [mode, t],
  )

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyDriverFormValues,
  })

  const status = watch('status')
  const photo = watch('photo')

  useEffect(() => {
    if (!open) return

    reset(
      mode === 'edit' && driver
        ? {
            fullName: driver.fullName,
            email: driver.email,
            phone: driver.phone,
            status: driver.status,
            password: '',
            photo: [],
            photoPath: driver.photoPath ?? undefined,
            photoUrl: driver.photoUrl ?? undefined,
            removePhoto: false,
          }
        : emptyDriverFormValues,
    )
    setUploadedPhoto(null)
    setExistingPhotoRemoved(false)
  }, [driver, mode, open, reset])

  const statusOptions: SearchableSelectOption[] = useMemo(
    () => [
      { value: String(DriverAvailability.Available), label: t('statusAvailable') },
      { value: String(DriverAvailability.Unavailable), label: t('statusUnavailable') },
    ],
    [t],
  )

  const uploadLabels: FileUploadLabels = useMemo(
    () => ({
      dragTitle: t('uploadDragTitle'),
      dragHint: t('uploadDragHint'),
      browse: t('uploadBrowse'),
      replace: t('uploadReplace'),
      remove: t('uploadRemove'),
      download: t('uploadDownload'),
      existingFile: t('uploadExistingPhoto'),
      invalidType: t('uploadInvalidType'),
      maxSize: t('uploadMaxSize'),
      maxFiles: t('uploadMaxFiles'),
    }),
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
        mode === 'create'
          ? t('formCreateDesc')
          : t('formEditDesc', { name: driver?.fullName ?? '' })
      }
      size="lg"
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
          <Button type="submit" form="driver-form" disabled={isSubmitting}>
            {mode === 'create' ? t('createDriver') : t('saveChanges')}
          </Button>
        </>
      }
    >
      <form id="driver-form" onSubmit={handleFormSubmit} className="space-y-5" noValidate>
        <Field invalid={!!errors.photo}>
          <FieldLabel>{t('formPhoto')}</FieldLabel>
          <FileUpload
            value={photo ?? []}
            onChange={(files) =>
              setValue('photo', files, { shouldDirty: true, shouldValidate: true })
            }
            accept="image/*"
            maxFiles={1}
            autoUpload
            folder={UPLOAD_FOLDERS.drivers.photos}
            existingPreviewUrl={existingPhotoRemoved ? null : (driver?.photoUrl ?? null)}
            uploadedFileUrl={uploadedPhoto?.fileUrl ?? null}
            uploadedFileName={uploadedPhoto?.originalFileName ?? null}
            uploadedFilePath={uploadedPhoto?.filePath ?? null}
            onExistingPreviewRemove={() => {
              setExistingPhotoRemoved(true)
              setValue('removePhoto', true, { shouldDirty: true })
            }}
            onUploadComplete={(result) => {
              setUploadedPhoto(result)
              setExistingPhotoRemoved(false)
              setValue('photoPath', result.filePath, { shouldDirty: true })
              setValue('photoUrl', result.fileUrl, { shouldDirty: true })
              setValue('removePhoto', false, { shouldDirty: true })
            }}
            onUploadError={(message) =>
              notify.error({ title: t('formPhoto'), description: message })
            }
            onFileRemoved={() => {
              setUploadedPhoto(null)
              setValue('photoPath', undefined, { shouldDirty: true })
              setValue('photoUrl', undefined, { shouldDirty: true })
            }}
            labels={uploadLabels}
          />
          <FieldError message={errors.photo?.message} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field invalid={!!errors.fullName}>
            <FieldLabel htmlFor="driver-fullName" required>
              {t('formFullName')}
            </FieldLabel>
            <Input
              id="driver-fullName"
              placeholder={t('formFullNamePlaceholder')}
              icon={UserRound}
              iconPosition="start"
              {...register('fullName')}
            />
            <FieldError message={errors.fullName?.message} />
          </Field>

          <Field invalid={!!errors.email}>
            <FieldLabel htmlFor="driver-email" required>
              {t('formEmail')}
            </FieldLabel>
            <Input
              id="driver-email"
              type="email"
              placeholder={t('formEmailPlaceholder')}
              icon={Mail}
              iconPosition="start"
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field invalid={!!errors.phone}>
            <FieldLabel htmlFor="driver-phone" required>
              {t('formPhone')}
            </FieldLabel>
            <Input
              id="driver-phone"
              placeholder={t('formPhonePlaceholder')}
              icon={Phone}
              iconPosition="start"
              {...register('phone')}
            />
            <FieldError message={errors.phone?.message} />
          </Field>

          <Field invalid={!!errors.status}>
            <FieldLabel required>{t('formStatus')}</FieldLabel>
            <SearchableSelect
              value={String(status)}
              onChange={(value) =>
                setValue('status', Number(value) as DriverAvailability, {
                  shouldValidate: true,
                })
              }
              options={statusOptions}
              placeholder={t('formStatus')}
              allowCustom={false}
              invalid={!!errors.status}
            />
            <FieldError message={errors.status?.message} />
          </Field>
        </div>

        {mode === 'create' ? (
          <Field invalid={!!errors.password}>
            <FieldLabel htmlFor="driver-password" required>
              {t('formPassword')}
            </FieldLabel>
            <Input
              id="driver-password"
              placeholder={t('formPasswordPlaceholder')}
              icon={Lock}
              iconPosition="start"
              isPasswordField
              {...register('password')}
            />
            <FieldError message={errors.password?.message} />
          </Field>
        ) : null}
      </form>
    </AppDialog>
  )
}
