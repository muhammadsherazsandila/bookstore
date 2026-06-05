import api from "./api";
import type { Book, CreateBookPayload, UpdateBookPayload } from "@/types";

export const bookService = {
  async getBooks(): Promise<Book[]> {
    const response = await api.get<Book[]>("/api/books/get-books");
    return response.data;
  },

  async getBookByISBN(isbn: string): Promise<Book> {
    const response = await api.get<Book>(`/api/books/get-book/${isbn}`);
    return response.data;
  },

  async createBook(payload: CreateBookPayload): Promise<Book> {
    const response = await api.post<Book>("/api/books/create-book", payload);
    return response.data;
  },

  async updateBook(isbn: string, payload: UpdateBookPayload): Promise<Book> {
    const response = await api.put<Book>(`/api/books/update-book/${isbn}`, payload);
    return response.data;
  },

  async deleteBook(isbn: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/api/books/delete-book/${isbn}`);
    return response.data;
  },
};
