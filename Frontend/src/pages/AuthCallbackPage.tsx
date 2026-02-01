import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle Google OAuth callback params
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const userId = searchParams.get("userId");
    const userName = searchParams.get("userName");
    const userEmail = searchParams.get("userEmail");
    const userRole = searchParams.get("userRole");
    const loginId = searchParams.get("loginId");
    const error = searchParams.get("error");

    if (error) {
      const errorMessages: Record<string, string> = {
        no_code: "Authentication was cancelled",
        token_error: "Failed to get authentication token",
        no_email: "No email was provided by Google",
        oauth_failed: "OAuth authentication failed",
      };
      toast.error(errorMessages[error] || "Authentication failed. Please try again.");
      navigate("/login");
      return;
    }

    if (accessToken && userId) {
      // Store auth data
      localStorage.setItem("authToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", userName || "");
      localStorage.setItem("userEmail", userEmail || "");
      localStorage.setItem("userRole", userRole || "ADMIN");
      localStorage.setItem("loginId", loginId || "");
      
      // Store user object for auth context
      const user = {
        id: userId,
        name: userName || "",
        email: userEmail || "",
        role: userRole || "ADMIN",
        loginId: loginId || "",
      };
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(`Welcome, ${userName || "User"}!`);
      // All users go to the same dashboard
      navigate("/dashboard");
    } else {
      // Legacy token handling
      const token = searchParams.get("token");
      if (token) {
        localStorage.setItem("authToken", token);
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const role = payload.role || "ADMIN";
          localStorage.setItem("userRole", role);
          toast.success("Successfully logged in!");
          navigate("/dashboard");
        } catch (e) {
          localStorage.setItem("userRole", "ADMIN");
          navigate("/dashboard");
          toast.success("Successfully logged in!");
        }
      } else {
        navigate("/login");
      }
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full"
          />
          <p className="text-slate-400 text-sm">Signing you in...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthCallbackPage;
