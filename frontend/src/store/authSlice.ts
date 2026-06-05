import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/services/authService";
import type { AuthState, LoginCredentials, RegisterCredentials } from "@/types";
import { AxiosError } from "axios";

// ─── Hydrate initial state from localStorage ─────────────────────────────────
const storedToken = localStorage.getItem("token");
const storedAuthor = localStorage.getItem("author");

const initialState: AuthState = {
  author: storedAuthor ? JSON.parse(storedAuthor) : null,
  token: storedToken,
  isLoading: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const loginAuthor = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      localStorage.setItem("token", data.token);
      localStorage.setItem("author", JSON.stringify(data.author));
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

export const registerAuthor = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const data = await authService.register(credentials);
      localStorage.setItem("token", data.token);
      localStorage.setItem("author", JSON.stringify(data.author));
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Registration failed. Please try again."
      );
    }
  }
);

export const deleteAuthorAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.deleteAccount();
      localStorage.removeItem("token");
      localStorage.removeItem("author");
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to delete account. Please try again."
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.author = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("author");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAuthor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAuthor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.author = action.payload.author;
        state.token = action.payload.token;
      })
      .addCase(loginAuthor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerAuthor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAuthor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.author = action.payload.author;
        state.token = action.payload.token;
      })
      .addCase(registerAuthor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Account
    builder
      .addCase(deleteAuthorAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAuthorAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.author = null;
        state.token = null;
      })
      .addCase(deleteAuthorAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
