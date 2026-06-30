import type {
  FileDeleteFolderRequestDto,
  FileDeleteResponseDto,
  FileUploadResponseDto,
} from '@/application/dtos/file-upload/file-upload.dto'
import type { UploadedFile } from '@/domain/types'
import { API_ENDPOINTS } from './endpoints'
import { httpClient } from './http-client'

const toUploadedFile = (dto: FileUploadResponseDto): UploadedFile => ({
  filePath: dto.filePath,
  fileUrl: dto.fileUrl,
  originalFileName: dto.originalFileName,
  fileSize: dto.fileSize,
  contentType: dto.contentType,
})

const parseUploadResponse = (
  payload: FileUploadResponseDto | null,
  fallbackMessage?: string,
): { success: true; data: UploadedFile } | { success: false; message: string } => {
  if (payload?.success && payload.filePath) {
    return { success: true, data: toUploadedFile(payload) }
  }

  return {
    success: false,
    message: payload?.message ?? fallbackMessage ?? 'Upload failed',
  }
}

const parseDeleteResponse = (
  payload: FileDeleteResponseDto | null,
  fallbackMessage?: string,
): { success: true; message: string } | { success: false; message: string } => {
  if (payload?.success) {
    return { success: true, message: payload.message }
  }

  return {
    success: false,
    message: payload?.message ?? fallbackMessage ?? 'Delete failed',
  }
}

export const fileUploadApi = {
  async upload(
    file: File,
    folder: string,
  ): Promise<{ success: true; data: UploadedFile } | { success: false; message: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const result = await httpClient.post<FileUploadResponseDto>({
      url: API_ENDPOINTS.fileUpload.upload,
      data: formData,
      isFormData: true,
    })

    return parseUploadResponse(result.data, result.error?.message)
  },

  async uploadMultiple(
    files: File[],
    folder: string,
  ): Promise<{ success: true; data: UploadedFile[] } | { success: false; message: string }> {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    formData.append('folder', folder)

    const result = await httpClient.post<FileUploadResponseDto[]>({
      url: API_ENDPOINTS.fileUpload.uploadMultiple,
      data: formData,
      isFormData: true,
    })

    const payload = result.data

    if (Array.isArray(payload) && payload.every((item) => item.success && item.filePath)) {
      return { success: true, data: payload.map(toUploadedFile) }
    }

    if (payload && !Array.isArray(payload)) {
      const single = parseUploadResponse(payload, result.error?.message)
      if (single.success) {
        return { success: true, data: [single.data] }
      }
      return single
    }

    return {
      success: false,
      message: result.error?.message ?? 'Upload failed',
    }
  },

  async delete(
    filePath: string,
  ): Promise<{ success: true; message: string } | { success: false; message: string }> {
    const result = await httpClient.delete<FileDeleteResponseDto>({
      url: API_ENDPOINTS.fileUpload.delete,
      params: { filePath },
    })

    return parseDeleteResponse(result.data, result.error?.message)
  },

  async download(
    filePath: string,
  ): Promise<{ success: true; data: Blob } | { success: false; message: string }> {
    const result = await httpClient.get<Blob>({
      url: API_ENDPOINTS.fileUpload.download,
      params: { filePath },
      responseType: 'blob',
    })

    if (result.hasValue && result.data) {
      return { success: true, data: result.data }
    }

    return {
      success: false,
      message: result.error?.message ?? 'Download failed',
    }
  },

  async deleteFolder(
    folderName: string,
  ): Promise<{ success: true; message: string } | { success: false; message: string }> {
    const payload: FileDeleteFolderRequestDto = { folderName }

    const result = await httpClient.delete<FileDeleteResponseDto>({
      url: API_ENDPOINTS.fileUpload.deleteFolder,
      data: payload,
    })

    return parseDeleteResponse(result.data, result.error?.message)
  },
}
