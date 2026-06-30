import type { FileReferenceDto } from '@/application/dtos/file-upload/file-upload.dto'

export interface UserResponseDto {
  id: string
  email: string
  full_name: string
  role: string
  avatar_url?: string | null
  photo?: string | FileReferenceDto | null
  created_at: string
}
