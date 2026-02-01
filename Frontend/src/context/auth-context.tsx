import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface User {
    id: string;
    name: string;
    loginId: string;
    email: string;
    role: "ADMIN" | "PORTAL";
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

interface RegisterData {
    name: string;
    loginId: string;
    email: string;
    password: string;
    role?: "ADMIN" | "PORTAL";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing user in localStorage
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("accessToken");
        const userRole = localStorage.getItem("userRole"); // Retrieve userRole

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (loginId: string, password: string): Promise<User> => {
        try {
            const response = await api.post("/auth/login", {
                loginId,
                password,
            });

            const { user: userData, accessToken, refreshToken } = response.data.data;

            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("userRole", userData.role); // Keep as ADMIN or PORTAL

            setUser(userData);
            return userData;
        } catch (error: any) {
            const message = error.response?.data?.message || "Login failed";
            toast.error(message);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await api.post("/auth/register", data);

            const { user: userData, accessToken, refreshToken } = response.data.data;

            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("userRole", userData.role); // Keep as ADMIN or PORTAL

            setUser(userData);
            toast.success("Registration successful!");
        } catch (error: any) {
            const message = error.response?.data?.message || "Registration failed";
            toast.error(message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userRole");
        setUser(null);
        toast.info("Logged out successfully");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
