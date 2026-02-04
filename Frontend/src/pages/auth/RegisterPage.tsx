import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PasswordInput } from "@/components/ui/password-input";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["ADMIN", "PORTAL"], { required_error: "Role is required" }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must include a special character")
      .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "PORTAL",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedRole = form.watch("role");

  const onSubmit = async (data: RegisterSchema) => {
    setIsLoading(true);
    try {
      const emailLocal = data.email.split("@")[0];
      const normalizedLoginId = (() => {
        const trimmed = emailLocal.replace(/[^a-zA-Z0-9]/g, "");
        if (trimmed.length >= 6 && trimmed.length <= 12) return trimmed;
        if (trimmed.length > 12) return trimmed.slice(0, 12);
        const pad = "1234567890";
        return (trimmed + pad).slice(0, 6);
      })();

      await registerUser({
        name: `${data.firstName} ${data.lastName}`,
        loginId: normalizedLoginId,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      navigate("/dashboard");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Registration failed";
      toast.error(message);
      form.setError("email", { message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Google OAuth 2.0 Identity Protocol initiated...");
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Enter your details below to create your account"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="John"
              {...form.register("firstName")}
              className="input-focus h-12"
              disabled={isLoading}
            />
            {form.formState.errors.firstName && (
              <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              {...form.register("lastName")}
              className="input-focus h-12"
              disabled={isLoading}
            />
            {form.formState.errors.lastName && (
              <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...form.register("email")}
            className="input-focus h-12"
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>I want to register as:</Label>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => form.setValue("role", "ADMIN")}
              className={`cursor-pointer border rounded-lg px-4 py-3 text-center transition-all flex items-center justify-center gap-2 ${selectedRole === "ADMIN"
                ? "bg-primary text-white border-primary"
                : "bg-background text-foreground border-input hover:border-primary/50"
                }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRole === "ADMIN" ? "border-white" : "border-muted-foreground"
                  }`}
              >
                {selectedRole === "ADMIN" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm font-medium">Admin</span>
            </div>

            <div
              onClick={() => form.setValue("role", "PORTAL")}
              className={`cursor-pointer border rounded-lg px-4 py-3 text-center transition-all flex items-center justify-center gap-2 ${selectedRole === "PORTAL"
                ? "bg-primary text-white border-primary"
                : "bg-background text-foreground border-input hover:border-primary/50"
                }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRole === "PORTAL" ? "border-white" : "border-muted-foreground"
                  }`}
              >
                {selectedRole === "PORTAL" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm font-medium">Portal User</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              placeholder="Min 8 chars"
              {...form.register("password")}
              className="input-focus h-12"
              disabled={isLoading}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Retype"
              {...form.register("confirmPassword")}
              className="input-focus h-12"
              disabled={isLoading}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
          <Button type="submit" className="w-full btn-gradient py-6 text-lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Account"}
          </Button>
        </motion.div>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            type="button"
            variant="outline"
            className="w-full py-6 flex items-center justify-center gap-2 text-base"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </Button>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:text-accent hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
