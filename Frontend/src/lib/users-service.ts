import { api } from "./api";

export interface User {
  id: string;
  name: string;
  loginId: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  loginId: string;
  email: string;
  password: string;
  role: "ADMIN" | "PORTAL";
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "PORTAL";
}

export interface UsersListResponse {
  success: boolean;
  data: User[];
  message?: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export const usersService = {
  /**
   * Get all users (Admin only)
   */
  list: async (): Promise<UsersListResponse> => {
    const response = await api.get<UsersListResponse>("/users");
    return response.data;
  },

  /**
   * Get a single user by ID
   */
  getById: async (id: string): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user (Admin only)
   */
  create: async (data: CreateUserData): Promise<UserResponse> => {
    const response = await api.post<UserResponse>("/users", data);
    return response.data;
  },

  /**
   * Update an existing user
   */
  update: async (id: string, data: UpdateUserData): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete a user (Admin only)
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/users/${id}`);
    return response.data;
  },
};

export default usersService;
