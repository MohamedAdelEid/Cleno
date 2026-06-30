import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Lock, Mail, Phone, UserRound } from 'lucide-react'

import type { UploadedFile } from '@/domain/types'
import type { ManagedUser, ManagedUserRole } from '@/domain/entities'
import { ManagedUserStatus } from '@/domain/enums'
import { createUserFormSchema, emptyUserFormValues, type UserFormValues } from '@/domain/schemas'
import { fileUploadApi } from '@/infrastructure/api/file-upload.api'
import {
  clearUserFormPhotoDraft,
  getUserFormDraftKey,
  getUserFormPhotoDraft,
  reconcileUserPhotoDraftOnEditOpen,
  saveUserFormPhotoDraft,
  USER_FORM_PHOTO_DRAFT_KEY,
} from '@/infrastructure/storage/user-form-photo-draft'
import { draftStorage } from '@/infrastructure/storage/draft.storage'
import { UPLOAD_FOLDERS } from '@/infrastructure/utils/upload-folders'
import { notify } from '@/infrastructure/libs/toast/toast'
import { AppDialog } from '@/presentation/components/feedback/app-dialog'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/presentation/components/ui/field'
import { FileUpload, type FileUploadLabels } from '@/presentation/components/ui/file-upload'
import { Input } from '@/presentation/components/ui/input'
import {
  SearchableSelect,
  type SearchableSelectOption,
} from '@/presentation/components/ui/searchable-select'
import { useFormDraft } from '@/presentation/hooks/use-form-draft'
import { useTranslation } from '@/presentation/hooks/use-translation'
import { cn } from '@/presentation/utils'

type PhotoDisplayStatus = 'none' | 'saved' | 'pending'

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  user?: ManagedUser | null
  roleOptions: ManagedUserRole[]
  isRolesLoading?: boolean
  onSubmit: (values: UserFormValues) => Promise<boolean>
}

const stripFilesFromValues = (values: UserFormValues): UserFormValues => ({
  ...values,
  photo: [],
})

const buildServerValues = (
  mode: 'create' | 'edit',
  user: ManagedUser | null | undefined,
  roleOptions: ManagedUserRole[],
): UserFormValues => {
  if (mode === 'edit' && user) {
    return {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      roleId: user.role.id,
      status: user.status,
      password: '',
      photo: [],
      photoPath: user.photoPath ?? undefined,
      photoUrl: user.avatarUrl ?? undefined,
      removePhoto: false,
    }
  }

  return {
    ...emptyUserFormValues,
    roleId: roleOptions[0]?.id ?? '',
  }
}

const mergeDraftValues = (
  base: UserFormValues,
  draftValues: Partial<UserFormValues> | undefined,
  pendingPhoto: UploadedFile | null | undefined,
): UserFormValues => {
  const merged = {
    ...base,
    ...(draftValues ?? {}),
    photo: [],
  }

  if (pendingPhoto) {
    merged.photoPath = pendingPhoto.filePath
    merged.photoUrl = pendingPhoto.fileUrl
    merged.removePhoto = false
  } else if (draftValues?.removePhoto) {
    merged.photoPath = undefined
    merged.photoUrl = undefined
    merged.removePhoto = true
  }

  return merged
}

const resolvePhotoStatus = ({
  pendingPhoto,
  serverPhotoPath,
  existingPhotoRemoved,
}: {
  pendingPhoto: UploadedFile | null
  serverPhotoPath: string | null
  existingPhotoRemoved: boolean
}): PhotoDisplayStatus => {
  if (pendingPhoto) return 'pending'
  if (serverPhotoPath && !existingPhotoRemoved) return 'saved'
  return 'none'
}

export const UserFormDialog = ({
  open,
  onOpenChange,
  mode,
  user,
  roleOptions,
  isRolesLoading = false,
  onSubmit,
}: UserFormDialogProps) => {
  const { t } = useTranslation('users')
  const draftKey = getUserFormDraftKey(mode, user?.id)
  const { saveDraft, clearDraft } = useFormDraft<UserFormValues>({ key: draftKey })

  const serverPhotoPath = mode === 'edit' ? (user?.photoPath ?? null) : null
  const initializedSessionRef = useRef<string | null>(null)
  const submittedRef = useRef(false)

  const [uploadedPhoto, setUploadedPhoto] = useState<UploadedFile | null>(null)
  const [existingPhotoRemoved, setExistingPhotoRemoved] = useState(false)
  const [photoStatus, setPhotoStatus] = useState<PhotoDisplayStatus>('none')
  const [isInitializing, setIsInitializing] = useState(false)

  const schema = useMemo(
    () =>
      createUserFormSchema(
        {
          fullNameRequired: t('validationFullNameRequired'),
          fullNameMin: t('validationFullNameMin'),
          fullNameMax: t('validationFullNameMax'),
          emailRequired: t('validationEmailRequired'),
          emailInvalid: t('validationEmailInvalid'),
          phoneRequired: t('validationPhoneRequired'),
          phoneMax: t('validationPhoneMax'),
          roleRequired: t('validationRoleRequired'),
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
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyUserFormValues,
  })

  const photo = watch('photo')

  const readStoredPhoto = useCallback(
    () => getUserFormPhotoDraft(draftKey),
    [draftKey],
  )

  const persistDraft = useCallback(
    (values?: UserFormValues, photoUpdate?: UploadedFile | null | undefined) => {
      const nextValues = stripFilesFromValues(values ?? getValues())
      const retainedPhoto =
        photoUpdate !== undefined
          ? photoUpdate
          : (uploadedPhoto ?? readStoredPhoto())

      saveUserFormPhotoDraft(draftKey, nextValues, retainedPhoto)
      saveDraft(nextValues, retainedPhoto ? { [USER_FORM_PHOTO_DRAFT_KEY]: retainedPhoto } : {})
    },
    [draftKey, getValues, readStoredPhoto, saveDraft, uploadedPhoto],
  )

  const cleanupOrphanUpload = useCallback(
    async (filePath: string | null | undefined) => {
      if (!filePath) return
      if (mode === 'edit' && filePath === serverPhotoPath) return
      await fileUploadApi.delete(filePath)
    },
    [mode, serverPhotoPath],
  )

  useEffect(() => {
    if (!open) {
      initializedSessionRef.current = null
      submittedRef.current = false
      setIsInitializing(false)
      return
    }

    const sessionKey = `${draftKey}:${user?.id ?? 'create'}`
    if (initializedSessionRef.current === sessionKey) return

    let active = true

    const initialize = async () => {
      setIsInitializing(true)

      const storedDraft = draftStorage.get<UserFormValues>(draftKey)
      let pendingPhoto =
        mode === 'edit'
          ? await reconcileUserPhotoDraftOnEditOpen(draftKey, serverPhotoPath)
          : getUserFormPhotoDraft(draftKey)

      if (!active) return

      const base = buildServerValues(mode, user, roleOptions)
      const initialValues = mergeDraftValues(base, storedDraft?.values, pendingPhoto)

      reset(initialValues)
      setUploadedPhoto(pendingPhoto)
      setExistingPhotoRemoved(initialValues.removePhoto === true)
      setPhotoStatus(
        resolvePhotoStatus({
          pendingPhoto,
          serverPhotoPath,
          existingPhotoRemoved: initialValues.removePhoto === true,
        }),
      )

      initializedSessionRef.current = sessionKey
      setIsInitializing(false)
    }

    void initialize()

    return () => {
      active = false
    }
  }, [draftKey, mode, open, reset, roleOptions, serverPhotoPath, user])

  useEffect(() => {
    if (!open) return

    const subscription = watch((values) => {
      persistDraft(values as UserFormValues)
    })

    return () => subscription.unsubscribe()
  }, [open, persistDraft, watch])

  useEffect(() => {
    if (!open || mode !== 'create') return

    const currentRoleId = getValues('roleId')
    if (!currentRoleId && roleOptions[0]?.id) {
      setValue('roleId', roleOptions[0].id, { shouldValidate: true })
    }
  }, [getValues, mode, open, roleOptions, setValue])

  const roleSelectOptions: SearchableSelectOption[] = useMemo(
    () => roleOptions.map((role) => ({ value: role.id, label: role.name })),
    [roleOptions],
  )

  const statusOptions: SearchableSelectOption[] = useMemo(
    () => [
      { value: ManagedUserStatus.Active, label: t('statusActive') },
      { value: ManagedUserStatus.Inactive, label: t('statusInactive') },
      { value: ManagedUserStatus.Suspended, label: t('statusSuspended') },
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

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !submittedRef.current && !isSubmitting) {
      persistDraft()
    }

    onOpenChange(nextOpen)
  }

  const handleCancel = () => {
    persistDraft()
    onOpenChange(false)
  }

  const handleFormSubmit = handleSubmit(async (values) => {
    const success = await onSubmit(values)
    if (success) {
      submittedRef.current = true
      clearUserFormPhotoDraft(draftKey)
      clearDraft()
      onOpenChange(false)
    }
  })

  const existingPreviewUrl =
    existingPhotoRemoved || uploadedPhoto?.fileUrl ? null : (user?.avatarUrl ?? null)

  const existingFilePath =
    existingPhotoRemoved || uploadedPhoto?.filePath ? null : (user?.photoPath ?? null)

  return (
    <AppDialog
      open={open}
      onOpenChange={handleDialogOpenChange}
      title={mode === 'create' ? t('formCreateTitle') : t('formEditTitle')}
      description={
        mode === 'create' ? t('formCreateDesc') : t('formEditDesc', { name: user?.fullName ?? '' })
      }
      size="lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting || isInitializing}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" form="user-form" disabled={isSubmitting || isInitializing}>
            {mode === 'create' ? t('createUser') : t('saveChanges')}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleFormSubmit} className="space-y-5" noValidate>
        <Field invalid={!!errors.photo}>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <FieldLabel className="mb-0">{t('formPhoto')}</FieldLabel>
            {photoStatus === 'saved' ? (
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                {t('photoSavedToUser')}
              </Badge>
            ) : null}
            {photoStatus === 'pending' ? (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                {t('photoPendingSave')}
              </Badge>
            ) : null}
          </div>
          <FileUpload
            value={photo ?? []}
            onChange={(files) =>
              setValue('photo', files, { shouldDirty: true, shouldValidate: true })
            }
            accept="image/*"
            maxFiles={1}
            autoUpload
            disabled={isInitializing}
            folder={UPLOAD_FOLDERS.users.avatars}
            existingPreviewUrl={existingPreviewUrl}
            existingFilePath={existingFilePath}
            uploadedFileUrl={uploadedPhoto?.fileUrl ?? null}
            uploadedFileName={uploadedPhoto?.originalFileName ?? null}
            uploadedFilePath={uploadedPhoto?.filePath ?? null}
            onExistingPreviewRemove={() => {
              setExistingPhotoRemoved(true)
              setValue('removePhoto', true, { shouldDirty: true })
              setValue('photoPath', undefined, { shouldDirty: true })
              setValue('photoUrl', undefined, { shouldDirty: true })
              setPhotoStatus(uploadedPhoto ? 'pending' : 'none')
              persistDraft(undefined, uploadedPhoto)
            }}
            onUploadComplete={(result) => {
              setUploadedPhoto(result)
              setExistingPhotoRemoved(false)
              setValue('photoPath', result.filePath, { shouldDirty: true })
              setValue('photoUrl', result.fileUrl, { shouldDirty: true })
              setValue('removePhoto', false, { shouldDirty: true })
              setPhotoStatus('pending')
              persistDraft(undefined, result)
            }}
            onUploadError={(message) =>
              notify.error({ title: t('formPhoto'), description: message })
            }
            onFileRemoved={() => {
              const removedPath = uploadedPhoto?.filePath
              setUploadedPhoto(null)
              setValue('photoPath', undefined, { shouldDirty: true })
              setValue('photoUrl', undefined, { shouldDirty: true })
              setPhotoStatus(
                resolvePhotoStatus({
                  pendingPhoto: null,
                  serverPhotoPath,
                  existingPhotoRemoved,
                }),
              )
              persistDraft(undefined, null)
              void cleanupOrphanUpload(removedPath)
            }}
            labels={uploadLabels}
            className={cn(isInitializing && 'pointer-events-none opacity-60')}
          />
          <FieldError message={errors.photo?.message} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="fullName"
            render={({ field: { ref, ...fieldProps }, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel htmlFor="fullName" required>
                  {t('formFullName')}
                </FieldLabel>
                <Input
                  {...fieldProps}
                  ref={ref}
                  id="fullName"
                  placeholder={t('formFullNamePlaceholder')}
                  icon={UserRound}
                  iconPosition="start"
                  value={fieldProps.value ?? ''}
                  disabled={isInitializing}
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
                  placeholder={t('formEmailPlaceholder')}
                  icon={Mail}
                  iconPosition="start"
                  value={fieldProps.value ?? ''}
                  disabled={isInitializing}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
                  placeholder={t('formPhonePlaceholder')}
                  icon={Phone}
                  iconPosition="start"
                  value={fieldProps.value ?? ''}
                  disabled={isInitializing}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="roleId"
            render={({ field, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel required>{t('formRole')}</FieldLabel>
                <SearchableSelect
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={roleSelectOptions}
                  placeholder={t('formRole')}
                  searchPlaceholder={t('formRoleSearch')}
                  emptyMessage={t('formRoleEmpty')}
                  allowCustom={false}
                  disabled={isRolesLoading || isInitializing}
                  invalid={!!fieldState.error}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="status"
            render={({ field, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel required>{t('formStatus')}</FieldLabel>
                <SearchableSelect
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={statusOptions}
                  placeholder={t('formStatus')}
                  allowCustom={false}
                  disabled={isInitializing}
                  invalid={!!fieldState.error}
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
                  placeholder={
                    mode === 'create'
                      ? t('formPasswordPlaceholder')
                      : t('formPasswordEditPlaceholder')
                  }
                  icon={Lock}
                  iconPosition="start"
                  isPasswordField
                  value={fieldProps.value ?? ''}
                  disabled={isInitializing}
                />
                <FieldError message={fieldState.error?.message} />
              </Field>
            )}
          />
        </div>
      </form>
    </AppDialog>
  )
}
