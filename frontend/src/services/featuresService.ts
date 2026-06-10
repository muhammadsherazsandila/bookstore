import api from "./api";
import type { Review, Playlist, Book, Author } from "@/types";

export const featuresService = {
  // Likes
  async toggleLike(isbn: string): Promise<{ liked: boolean; likes_count: number }> {
    const response = await api.post<{ liked: boolean; likes_count: number }>(
      `/api/books/public/${isbn}/like`
    );
    return response.data;
  },

  async getLikes(isbn: string): Promise<{ liked: boolean; likes_count: number }> {
    const response = await api.get<{ liked: boolean; likes_count: number }>(
      `/api/books/public/${isbn}/likes`
    );
    return response.data;
  },

  // Reviews
  async getReviews(isbn: string): Promise<Review[]> {
    const response = await api.get<{ reviews: Review[] }>(
      `/api/books/public/${isbn}/reviews`
    );
    return response.data.reviews;
  },

  async addReview(isbn: string, rating: number, comment: string): Promise<Review> {
    const response = await api.post<{ review: Review }>(
      `/api/books/public/${isbn}/reviews`,
      { rating, comment }
    );
    return response.data.review;
  },

  async deleteReview(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/api/books/public/reviews/${id}`
    );
    return response.data;
  },

  // Collections (Playlists)
  async getCollections(): Promise<Playlist[]> {
    const response = await api.get<{ collections: Playlist[] }>("/api/collections");
    return response.data.collections;
  },

  async createCollection(name: string, description?: string): Promise<Playlist> {
    const response = await api.post<{ collection: Playlist }>("/api/collections", {
      name,
      description,
    });
    return response.data.collection;
  },

  async deleteCollection(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/api/collections/${id}`);
    return response.data;
  },

  async addBookToCollection(collectionId: number, isbn: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/api/collections/${collectionId}/books/${isbn}`
    );
    return response.data;
  },

  async removeBookFromCollection(collectionId: number, isbn: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/api/collections/${collectionId}/books/${isbn}`
    );
    return response.data;
  },

  async getCollectionBooks(collectionId: number): Promise<Book[]> {
    const response = await api.get<{ books: Book[] }>(`/api/collections/${collectionId}/books`);
    return response.data.books;
  },

  // Writer/Author Profile Management & Details
  async getAuthorProfile(email: string): Promise<{ author: Author; books: Book[] }> {
    const response = await api.get<{ author: Author; books: Book[] }>(
      `/api/authors/${email}`
    );
    return response.data;
  },

  async updateProfile(profile: { name?: string; bio?: string; avatar?: string }): Promise<Author> {
    const response = await api.put<{ author: Author }>("/api/authors/profile", profile);
    return response.data.author;
  },
};
