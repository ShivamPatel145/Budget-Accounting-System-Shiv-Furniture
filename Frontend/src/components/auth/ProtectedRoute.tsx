import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

interface ProtectedRouteProps {
    allowedRoles?: ("ADMIN" | "PORTAL")[];
    redirectTo?: string;
}

export const ProtectedRoute = ({
    allowedRoles,
    redirectTo = "/login"
}: ProtectedRouteProps) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // Show nothing while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!user) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }

    // Check role-based access if roles are specified
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // All users go to the same dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // Authenticated and authorized - render child routes
    return <Outlet />;
};
