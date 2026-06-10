import api from "./api";
import type { Book, CreateBookPayload, UpdateBookPayload, PaginationInfo } from "@/types";

const toBookFormData = (payload: CreateBookPayload | UpdateBookPayload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, value instanceof File ? value : String(value));
  });

  return formData;
};

const multipartConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

export const bookService = {
  async getPublicBooks(
    page?: number,
    limit?: number,
    category?: string
  ): Promise<{ books: Book[]; pagination: PaginationInfo }> {
    const response = await api.get<{ books: Book[]; pagination: PaginationInfo }>(
      "/api/books/public",
      {
        params: { page, limit, category },
      }
    );
    return response.data;
  },

  async getPublicBookByISBN(isbn: string): Promise<Book> {
    const response = await api.get<{ book: Book }>(`/api/books/public/${isbn}`);
    return response.data.book;
  },

  async getSavedBooks(): Promise<Book[]> {
    const response = await api.get<{ books: Book[] }>("/api/books/saved");
    return response.data.books;
  },

  async saveBook(isbn: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/api/books/saved/${isbn}`);
    return response.data;
  },

  async unsaveBook(isbn: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/api/books/saved/${isbn}`);
    return response.data;
  },

  async getBooks(
    page?: number,
    limit?: number
  ): Promise<{ books: Book[]; pagination: PaginationInfo }> {
    const response = await api.get<{ books: Book[]; pagination: PaginationInfo }>(
      "/api/books/get-books",
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  async getBookByISBN(isbn: string): Promise<Book> {
    const response = await api.get<{ book: Book }>(`/api/books/get-book/${isbn}`);
    return response.data.book;
  },

  async createBook(payload: CreateBookPayload): Promise<Book> {
    const body = payload.cover_image ? toBookFormData(payload) : payload;
    const response = await api.post<{ message: string; book: Book }>(
      "/api/books/create-book",
      body,
      payload.cover_image ? multipartConfig : undefined
    );
    return response.data.book;
  },

  async updateBook(isbn: string, payload: UpdateBookPayload): Promise<Book> {
    const body = payload.cover_image ? toBookFormData(payload) : payload;
    const response = await api.put<{ message: string; book: Book }>(
      `/api/books/update-book/${isbn}`,
      body,
      payload.cover_image ? multipartConfig : undefined
    );
    return response.data.book;
  },

  async deleteBook(isbn: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/api/books/delete-book/${isbn}`);
    return response.data;
  },
};
