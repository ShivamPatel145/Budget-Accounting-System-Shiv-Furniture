import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      toast.success("Reset link sent to your email!");
    } catch {
      toast.error("Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-violet-100 flex flex-col">
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <span className="text-xs text-purple-600 font-medium">SHIV</span>
            <h1 className="text-xl font-bold text-slate-800 -mt-1">FURNITURE</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-6">
        <div className="w-full max-w-5xl flex items-center justify-between gap-12">
          <div className="hidden lg:flex flex-col items-center flex-1">
            <div className="relative">
              <div className="w-80 h-80 bg-slate-200/50 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <svg className="w-72 h-72 relative z-10" viewBox="0 0 400 400" fill="none">
                <ellipse cx="200" cy="350" rx="100" ry="15" fill="#cbd5e1" />
                <rect x="140" y="150" width="120" height="160" rx="15" fill="#8b5cf6" />
                <rect x="155" y="165" width="90" height="90" rx="45" fill="#7c3aed" />
                <circle cx="200" cy="210" r="25" fill="#a78bfa" stroke="#c4b5fd" strokeWidth="4" />
                <rect x="195" y="205" width="10" height="15" rx="2" fill="#1e293b" />
                <circle cx="200" cy="215" r="3" fill="#fbbf24" />
                <rect x="175" y="270" width="50" height="25" rx="4" fill="#6d28d9" />
                <circle cx="187" cy="282" r="5" fill="#c4b5fd" />
                <circle cx="200" cy="282" r="5" fill="#c4b5fd" />
                <circle cx="213" cy="282" r="5" fill="#c4b5fd" />
                <path d="M200 120 L200 80 L180 90 M200 80 L220 90" stroke="#fbbf24" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="200" cy="70" r="15" fill="#fbbf24" />
                <path d="M260 200 Q320 200 320 260 L320 300" stroke="#a78bfa" strokeWidth="8" fill="none" strokeLinecap="round" />
                <circle cx="320" cy="310" r="15" fill="#fbbf24" />
                <path d="M330 305 L310 315 M310 305 L330 315" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mt-6">Reset Password</h2>
            <p className="text-slate-600 text-center mt-2 max-w-sm">Do not worry, we will help you get back into your account</p>
          </div>

          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              {isSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Check Your Email</h2>
                  <p className="text-slate-500 mt-2 mb-6">We have sent a password reset link to {email}</p>
                  <Link to="/login">
                    <Button className="w-full h-11 bg-purple-700 hover:bg-purple-600 text-white font-medium rounded-lg">Back to Login</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-800">Forgot Password?</h2>
                  <p className="text-slate-500 mt-1 mb-6">Enter your email to receive a reset link</p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email ID <span className="text-red-500">*</span></label>
                      <Input type="email" placeholder="Enter Email Here" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 bg-white border-slate-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg" />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full h-11 bg-purple-700 hover:bg-purple-600 text-white font-medium rounded-lg">
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <div className="text-center">
                      <Link to="/login" className="text-purple-600 hover:text-purple-700 text-sm font-medium">Back to Login</Link>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm py-4 px-6">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>© 2026 Shiv Furniture</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-700">TERMS OF USE</a>
            <a href="#" className="hover:text-slate-700">PRIVACY POLICY</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;