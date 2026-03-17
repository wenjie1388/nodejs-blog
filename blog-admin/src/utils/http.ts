import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

// 基础响应结构
export interface BaseResponse {
  success: boolean
  message?: string
  code?: number
}

// 数据响应结构
export interface DataResponse<T = any> extends BaseResponse {
  data: T
}

// 列表响应结构
export interface ListResponse<T = any> extends BaseResponse {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 自定义 axios 实例类型 - 继承 AxiosInstance 但覆盖方法返回类型
type HttpInstance = Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> & {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}) as HttpInstance

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 直接返回 response.data
http.interceptors.response.use(
  (response: any) => {
    return response.data 
  },
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    } else if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    }
    return Promise.reject(error)
  }
)

export default http
