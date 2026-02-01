import { api } from "./api";

export interface User {
    id: string;
    name: string;
    loginId: string;
    email: string;
    role: "ADMIN" | "PORTAL";
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    loginId: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    loginId: string;
    email: string;
    password: string;
    role?: "ADMIN" | "PORTAL";
}

export interface CreateUserRequest {
    name: string;
    loginId: string;
    email: string;
    password: string;
    role: "ADMIN" | "PORTAL";
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// Password validation rules as per mockup
export const passwordRules = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireSpecialChar: true,
};

export const loginIdRules = {
    minLength: 6,
    maxLength: 12,
};

export const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < passwordRules.minLength) {
        errors.push(`Password must be at least ${passwordRules.minLength} characters`);
    }
    if (passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if (passwordRules.requireLowercase && !/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if (passwordRules.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character");
    }
    return errors;
};

export const validateLoginId = (loginId: string): string[] => {
    const errors: string[] = [];
    if (loginId.length < loginIdRules.minLength || loginId.length > loginIdRules.maxLength) {
        errors.push(`Login ID must be between ${loginIdRules.minLength}-${loginIdRules.maxLength} characters`);
    }
    return errors;
};

export const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await api.post("/auth/login", data);
        return response.data.data;
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await api.post("/auth/register", data);
        return response.data.data;
    },
};

export const usersService = {
    async list(): Promise<User[]> {
        const response = await api.get("/users");
        return response.data.data;
    },

    async getById(id: string): Promise<User> {
        const response = await api.get(`/users/${id}`);
        return response.data.data;
    },

    async create(data: CreateUserRequest): Promise<User> {
        const response = await api.post("/users", data);
        return response.data.data;
    },

    async update(id: string, data: Partial<CreateUserRequest>): Promise<User> {
        const response = await api.put(`/users/${id}`, data);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/users/${id}`);
    },
};
