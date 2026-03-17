import apiClient from '@/utils/http'
import type { DataResponse } from '@/utils/http'

export const uploadApi = {
  uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<DataResponse<{
      filename: string
      originalName: string
      mimetype: string
      size: number
      url: string
    }>>('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  uploadImage(file: File) {
    const formData = new FormData()
    formData.append('image', file)
    return apiClient.post<DataResponse<{
      filename: string
      originalName: string
      url: string
      size: number
    }>>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteFile(filename: string, folder: string = 'images') {
    return apiClient.delete<DataResponse<{ message: string }>>(`/upload/file/${filename}`, {
      params: { folder },
    })
  },
}
