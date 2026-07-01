import { apiRequest } from './client'
import type { Book, BookRequestDto } from '../types'

export const booksApi = {
  getAll: () => apiRequest<Book[]>('/book'),
  getById: (id: number) => apiRequest<Book>(`/book/${id}`),
  getByTitle: (title: string) =>
    apiRequest<Book>(`/book/getByTitle?title=${encodeURIComponent(title)}`),
  create: (data: BookRequestDto) =>
    apiRequest<string>('/book/save', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: BookRequestDto) =>
    apiRequest<string>(`/book/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    apiRequest<string>(`/book/delete/${id}`, { method: 'DELETE' }),
}
