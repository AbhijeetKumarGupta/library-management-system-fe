import { apiRequest } from './client'
import type { Transaction, TransactionRequestDto } from '../types'

export const transactionsApi = {
  getAll: () => apiRequest<Transaction[]>('/transaction'),
  getById: (id: number) => apiRequest<Transaction>(`/transaction/${id}`),
  create: (data: TransactionRequestDto) =>
    apiRequest<string>('/transaction/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
