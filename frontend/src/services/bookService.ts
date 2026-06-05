import api from "./api";
import type { Book, CreateBookPayload, UpdateBookPayload } from "@/types";

export const bookService = {
  async getBooks(): Promise<Book[]> {
    const response = await api.get<{ books: Book[] }>("/api/books/get-books");
    return response.data.books;
  },

  async getBookByISBN(isbn: string): Promise<Book> {
    const response = await api.get<{ book: Book }>(`/api/books/get-book/${isbn}`);
    return response.data.book;
  },

  async createBook(payload: CreateBookPayload): Promise<Book> {
    const response = await api.post<{ message: string; book: Book }>("/api/books/create-book", payload);
    return response.data.book;
  },

  async updateBook(isbn: string, payload: UpdateBookPayload): Promise<Book> {
    const response = await api.put<{ message: string; book: Book }>(`/api/books/update-book/${isbn}`, payload);
    return response.data.book;
  },

  async deleteBook(isbn: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/api/books/delete-book/${isbn}`);
    return response.data;
  },
};
