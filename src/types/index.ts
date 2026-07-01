export type Gender = "MALE" | "FEMALE";
export type CardStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";
export type TransactionType = "BORROW" | "RETURN";

export interface Book {
  id: number;
  title: string;
  publisherName: string;
  publishedDate: string;
  pages: number;
  availability: boolean;
  category: string;
  rackNo: number;
}

export interface Card {
  id: number;
  cardStatus: CardStatus;
  expiryDate: string;
  createdDate?: string;
  updatedDate?: string;
  books?: Book[];
}

export interface Student {
  id: number;
  name: string;
  email: string;
  mobile: string;
  department: string;
  semester: string;
  gender: Gender;
  address: string;
  dob: string;
  card?: Card | null;
}

export interface Transaction {
  id: number;
  transactionDate: string;
  dueDate: string;
  transactionType: TransactionType;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface BookRequestDto {
  title: string;
  publisherName: string;
  publishedDate: string;
  pages: number;
  availability: boolean;
  category: string;
  rackNo: number;
}

export interface StudentRequestDto {
  name: string;
  email: string;
  mobile: string;
  department: string;
  semester: string;
  gender: Gender;
  address: string;
  dob: string;
  cardId: number;
}

export interface CardRequestDto {
  cardStatus: CardStatus;
  expiryDate: string;
}

export interface TransactionRequestDto {
  dueDate: string;
  transactionType: TransactionType;
  cardId: number;
  bookId: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}

export interface StudentQueryParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageNo?: number;
  pageSize?: number;
}
