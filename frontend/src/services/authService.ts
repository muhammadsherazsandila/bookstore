import api from "./api";
import type { AuthResponse, LoginCredentials, RegisterCredentials } from "@/types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/authors/login", credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/authors/register", credentials);
    return response.data;
  },

  async deleteAccount(): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>("/api/authors/delete");
    return response.data;
  },
};
