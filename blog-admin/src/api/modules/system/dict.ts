import request from '@/utils/http'
import type { ListResponse, DataResponse } from '@/utils/http'

export interface DictType {
  id: number
  dictName: string
  dictType: string
  status: string
  remark: string
  createdAt: string
  updatedAt: string
}

export const dictApi = {
  getDictTypes(params?: { page?: number; limit?: number; keyword?: string }) {
    return request.get<ListResponse<DictType>>('/dict/types', { params })
  },

  getAllDictTypes() {
    return request.get<DataResponse<DictType[]>>('/dict/types/all')
  },

  getDictType(id: number) {
    return request.get<DataResponse<DictType>>(`/dict/types/${id}`)
  },

  createDictType(data: { dictName: string; dictType: string; status?: string; remark?: string }) {
    return request.post<DataResponse<{ message: string }>>('/dict/types', data)
  },

  updateDictType(id: number, data: { dictName?: string; dictType?: string; status?: string; remark?: string }) {
    return request.put<DataResponse<{ message: string }>>(`/dict/types/${id}`, data)
  },

  deleteDictType(id: number) {
    return request.delete<DataResponse<{ message: string }>>(`/dict/types/${id}`)
  },

  getDictData(params?: { page?: number; limit?: number; dictType?: string; status?: string }) {
    return request.get<DataResponse<{
      list: any[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }>>('/dict/data', { params })
  },

  getDictDataByType(dictType: string) {
    return request.get<DataResponse<any[]>>(`/dict/data/type/${dictType}`)
  },

  getDictDataItem(id: number) {
    return request.get<DataResponse<any>>(`/dict/data/${id}`)
  },

  createDictData(data: {
    dictType: string
    dictLabel: string
    dictValue: string
    dictSort?: number
    isDefault?: string
    status?: string
    remark?: string
    cssClass?: string
    listClass?: string
  }) {
    return request.post<DataResponse<{ message: string }>>('/dict/data', data)
  },

  updateDictData(id: number, data: {
    dictType?: string
    dictLabel?: string
    dictValue?: string
    dictSort?: number
    isDefault?: string
    status?: string
    remark?: string
    cssClass?: string
    listClass?: string
  }) {
    return request.put<DataResponse<{ message: string }>>(`/dict/data/${id}`, data)
  },

  deleteDictData(id: number) {
    return request.delete<DataResponse<{ message: string }>>(`/dict/data/${id}`)
  },

  batchDeleteDictData(ids: string) {
    return request.delete<DataResponse<{ message: string }>>(`/dict/data/batch/${ids}`)
  },
}
