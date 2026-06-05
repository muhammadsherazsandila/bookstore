// ─── Author Types ────────────────────────────────────────────────────────────

export interface Author {
  name: string;
  email: string;
}

export interface AuthState {
  author: Author | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  author: Author;
  token: string;
}

// ─── Book Types ──────────────────────────────────────────────────────────────

export interface Book {
  isbn: string;
  title: string;
  price: number;
  published_date: string;
  author_email: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookPayload {
  isbn: string;
  title: string;
  price: number;
  published_date: string;
}

export interface UpdateBookPayload {
  title: string;
  price: number;
  published_date: string;
}

export interface PaginationInfo {
  totalBooks: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  totalValue: number;
}

export interface BooksState {
  books: Book[];
  pagination: PaginationInfo | null;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
}
