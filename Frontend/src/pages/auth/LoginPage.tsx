import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const loginSchema = z.object({
  loginId: z.string().min(1, "Email or Login ID is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
  role: z.enum(["ADMIN", "PORTAL"]),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginId: "",
      password: "",
      rememberMe: false,
      role: "ADMIN",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const selectedRole = form.watch("role", "ADMIN");

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    try {
      await login(data.loginId, data.password);
      navigate("/dashboard");
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed";
      toast.error(message);
      form.setError("password", { message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Google OAuth 2.0 Identity Protocol initiated...");
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label>I want to log in as:</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => form.setValue("role", "ADMIN")}
              className={`cursor-pointer border rounded-lg p-2 text-center transition-all flex items-center justify-center gap-2 ${
                selectedRole === "ADMIN" ? "bg-primary text-white border-primary" : "bg-background text-foreground border-input hover:border-primary/50"
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRole === "ADMIN" ? "border-white" : "border-muted-foreground"}`}>
                {selectedRole === "ADMIN" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm font-medium">Admin</span>
            </button>
            <button
              type="button"
              onClick={() => form.setValue("role", "PORTAL")}
              className={`cursor-pointer border rounded-lg p-2 text-center transition-all flex items-center justify-center gap-2 ${
                selectedRole === "PORTAL" ? "bg-primary text-white border-primary" : "bg-background text-foreground border-input hover:border-primary/50"
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRole === "PORTAL" ? "border-white" : "border-muted-foreground"}`}>
                {selectedRole === "PORTAL" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm font-medium">Portal User</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="loginId">Email Address</Label>
          <Input
            id="loginId"
            placeholder="name@company.com"
            {...form.register("loginId")}
            className="input-focus"
            disabled={isLoading}
          />
          {form.formState.errors.loginId && (
            <p className="text-sm text-destructive">{form.formState.errors.loginId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:underline hover:text-accent"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...form.register("password")}
            className="input-focus"
            disabled={isLoading}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            onCheckedChange={(checked) => form.setValue("rememberMe", checked as boolean)}
          />
          <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Remember me for 30 days
          </Label>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button type="submit" className="w-full btn-gradient py-6 text-lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
              <span className="flex items-center gap-2">Sign In as {selectedRole === "ADMIN" ? "Admin" : "Portal"} <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg></span>
            )}
          </Button>
        </motion.div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            type="button"
            variant="outline"
            className="w-full py-6 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:text-accent hover:underline">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
