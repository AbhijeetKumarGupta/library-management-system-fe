import { apiRequest, buildQuery } from './client'
import type {
  PageResponse,
  Student,
  StudentQueryParams,
  StudentRequestDto,
} from '../types'

export const studentsApi = {
  getAll: (params: StudentQueryParams = {}) =>
    apiRequest<PageResponse<Student>>(
      `/student${buildQuery({
        sortBy: params.sortBy ?? 'id',
        sortOrder: params.sortOrder ?? 'asc',
        pageNo: params.pageNo ?? 0,
        pageSize: params.pageSize ?? 10,
      })}`,
    ),
  getById: (id: number) => apiRequest<Student>(`/student/${id}`),
  getByEmail: (email: string) =>
    apiRequest<Student>(`/student/getByEmail?email=${encodeURIComponent(email)}`),
  create: (data: StudentRequestDto) =>
    apiRequest<string>('/student/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: StudentRequestDto) =>
    apiRequest<string>(`/student/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    apiRequest<string>(`/student/delete/${id}`, { method: 'DELETE' }),
}
