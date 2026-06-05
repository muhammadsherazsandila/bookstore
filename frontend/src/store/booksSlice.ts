import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookService } from "@/services/bookService";
import type { BooksState, CreateBookPayload, UpdateBookPayload } from "@/types";
import { AxiosError } from "axios";

const initialState: BooksState = {
  books: [],
  isLoading: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchBooks = createAsyncThunk(
  "books/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await bookService.getBooks();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to fetch books."
      );
    }
  }
);

export const addBook = createAsyncThunk(
  "books/add",
  async (payload: CreateBookPayload, { rejectWithValue }) => {
    try {
      return await bookService.createBook(payload);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to create book."
      );
    }
  }
);

export const editBook = createAsyncThunk(
  "books/edit",
  async (
    { isbn, payload }: { isbn: string; payload: UpdateBookPayload },
    { rejectWithValue }
  ) => {
    try {
      return await bookService.updateBook(isbn, payload);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to update book."
      );
    }
  }
);

export const removeBook = createAsyncThunk(
  "books/remove",
  async (isbn: string, { rejectWithValue }) => {
    try {
      await bookService.deleteBook(isbn);
      return isbn;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to delete book."
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    clearBooksError(state) {
      state.error = null;
    },
    clearBooks(state) {
      state.books = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add
    builder
      .addCase(addBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books.unshift(action.payload);
      })
      .addCase(addBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Edit
    builder
      .addCase(editBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editBook.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.books.findIndex((b) => b.isbn === action.payload.isbn);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
      })
      .addCase(editBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove
    builder
      .addCase(removeBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = state.books.filter((b) => b.isbn !== action.payload);
      })
      .addCase(removeBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBooksError, clearBooks } = booksSlice.actions;
export default booksSlice.reducer;
