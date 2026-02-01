import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotForm = z.infer<typeof schema>;

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    try {
      // TODO: replace with real endpoint when available
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSuccess(true);
      toast.success("Reset link sent to your email");
    } catch (error) {
      toast.error("Failed to send reset link");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const emailValue = form.watch("email");

  return (
    <AuthLayout
      title={isSuccess ? "Check your email" : "Forgot your password?"}
      subtitle={isSuccess ? "We just sent you a secure reset link" : "Enter your email address and we will send you a reset link"}
    >
      <div className="space-y-6">
        {isSuccess ? (
          <div className="space-y-4 text-center card-elevated p-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-success/10 text-success flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">Reset link sent</p>
              <p className="text-sm text-muted-foreground">We have emailed a reset link to {emailValue || "your inbox"}. Follow the instructions to set a new password.</p>
            </div>
            <Button asChild className="w-full btn-gradient py-3 text-base">
              <Link to="/login">Back to login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                {...form.register("email")}
                className="input-focus"
                disabled={isLoading}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button type="submit" className="w-full btn-gradient py-5 text-lg" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Sending...</span>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </motion.div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Remember your password?</span>
              </div>
            </div>

            <div className="text-center">
              <Link to="/login" className="text-sm font-semibold text-primary hover:text-accent hover:underline">
                Go back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;