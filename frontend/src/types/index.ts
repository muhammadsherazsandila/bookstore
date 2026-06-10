// ─── Author Types ────────────────────────────────────────────────────────────

export interface Author {
  name: string;
  email: string;
  role: "author" | "user";
  book_count?: number;
  bio?: string | null;
  avatar?: string | null;
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
  role: "author" | "user";
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
  author_name?: string;
  cover_image?: string | null;
  category?: string | null;
  description?: string | null;
  likes_count?: number;
  user_liked?: boolean;
  saved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBookPayload {
  isbn: string;
  title: string;
  price: number;
  published_date: string;
  category?: string;
  description?: string;
  cover_image?: File | null;
}

export interface UpdateBookPayload {
  title: string;
  price: number;
  published_date: string;
  category?: string;
  description?: string;
  cover_image?: File | null;
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

// ─── Review & Playlist Types ──────────────────────────────────────────────────

export interface Review {
  id: number;
  user_email: string;
  book_isbn: string;
  rating: number;
  comment: string;
  created_at: string;
  author_name: string;
  avatar?: string | null;
}

export interface Playlist {
  id: number;
  name: string;
  description?: string | null;
  user_email: string;
  created_at: string;
  book_count?: number;
}
