import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

type UserType = "ADMIN" | "PORTAL";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>("ADMIN");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userData = await login(email, password);
      toast.success("Login successful!");
      // All users go to the same dashboard - content is role-based
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = userType === "ADMIN";
  const primaryColor = isAdmin ? "indigo" : "cyan";

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isAdmin ? 'from-blue-100 via-blue-50 to-indigo-100' : 'from-cyan-100 via-cyan-50 to-sky-100'} flex flex-col transition-colors duration-300`}>
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 ${isAdmin ? 'bg-indigo-600' : 'bg-cyan-600'} rounded-lg flex items-center justify-center transition-colors duration-300`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <span className={`text-xs ${isAdmin ? 'text-indigo-600' : 'text-cyan-600'} font-medium transition-colors duration-300`}>SHIV</span>
            <h1 className="text-xl font-bold text-slate-800 -mt-1">FURNITURE</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-6">
        <div className="w-full max-w-5xl flex items-center justify-between gap-12">
          <div className="hidden lg:flex flex-col items-center flex-1">
            <div className="relative">
              <div className="w-80 h-80 bg-slate-200/50 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              {isAdmin ? (
                <svg className="w-72 h-72 relative z-10" viewBox="0 0 400 400" fill="none">
                  <ellipse cx="200" cy="320" rx="100" ry="20" fill="#cbd5e1" />
                  <path d="M160 180 L160 280 L240 280 L240 180 Z" fill="#3b82f6" />
                  <rect x="140" y="240" width="120" height="80" rx="8" fill="#1e293b" />
                  <rect x="150" y="250" width="100" height="55" rx="4" fill="#334155" />
                  <circle cx="200" cy="300" r="8" fill="#64748b" />
                  <circle cx="200" cy="140" r="50" fill="#fcd9bd" />
                  <path d="M150 130 Q150 80 200 80 Q250 80 250 130 L250 110 Q250 70 200 70 Q150 70 150 110 Z" fill="#1e293b" />
                  <circle cx="185" cy="135" r="4" fill="#1e293b" />
                  <circle cx="215" cy="135" r="4" fill="#1e293b" />
                  <path d="M190 155 Q200 165 210 155" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M160 200 L120 240 L140 250" stroke="#fcd9bd" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M240 200 L280 220 L290 260" stroke="#fcd9bd" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="275" y="245" width="25" height="35" rx="4" fill="#1e293b" />
                  <path d="M300 255 Q315 255 315 270 Q315 285 300 285" stroke="#1e293b" strokeWidth="4" fill="none" />
                </svg>
              ) : (
                <svg className="w-72 h-72 relative z-10" viewBox="0 0 400 400" fill="none">
                  <ellipse cx="200" cy="350" rx="130" ry="20" fill="#cbd5e1" />
                  <rect x="100" y="120" width="200" height="150" rx="10" fill="#1e293b" />
                  <rect x="110" y="130" width="180" height="110" rx="4" fill="#0891b2" />
                  <rect x="120" y="140" width="50" height="30" rx="4" fill="#06b6d4" />
                  <rect x="180" y="140" width="50" height="30" rx="4" fill="#22d3ee" />
                  <rect x="240" y="140" width="40" height="30" rx="4" fill="#67e8f9" />
                  <rect x="120" y="180" width="160" height="50" fill="#164e63" />
                  <circle cx="130" cy="205" r="6" fill="#22d3ee" />
                  <rect x="145" y="195" width="80" height="8" rx="2" fill="#475569" />
                  <circle cx="130" cy="220" r="6" fill="#22d3ee" />
                  <rect x="145" y="212" width="60" height="8" rx="2" fill="#475569" />
                  <rect x="140" y="270" width="120" height="10" rx="3" fill="#475569" />
                  <rect x="165" y="280" width="70" height="70" fill="#475569" />
                  <circle cx="300" cy="200" r="45" fill="#fcd9bd" />
                  <path d="M255 185 Q255 140 300 140 Q345 140 345 185" fill="#1e293b" />
                  <circle cx="285" cy="195" r="4" fill="#1e293b" />
                  <circle cx="315" cy="195" r="4" fill="#1e293b" />
                  <path d="M285 215 Q300 225 315 215" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M300 245 L300 320" stroke="#0891b2" strokeWidth="30" fill="none" strokeLinecap="round" />
                  <path d="M270 270 L220 220" stroke="#fcd9bd" strokeWidth="18" fill="none" strokeLinecap="round" />
                  <path d="M330 270 L350 300" stroke="#fcd9bd" strokeWidth="18" fill="none" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mt-6">
              {isAdmin ? "Welcome!" : "Client Portal"}
            </h2>
            <p className="text-slate-600 text-center mt-2 max-w-sm">
              {isAdmin 
                ? "Sales made easy and growth made certain with Budget Accounting by Shiv Furniture"
                : "Access your invoices, payments and account details in one place"
              }
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-800">Login</h2>
              <p className="text-slate-500 mt-1 mb-4">Enter your credentials to get started</p>

              {/* User Type Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Login As</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType("ADMIN")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      userType === "ADMIN"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("PORTAL")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      userType === "PORTAL"
                        ? "border-cyan-600 bg-cyan-50 text-cyan-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Portal</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email ID <span className="text-red-500">*</span></label>
                  <Input 
                    type="email" 
                    placeholder="Enter Email Here" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className={`h-11 bg-white border-slate-300 rounded-lg ${isAdmin ? 'focus:border-indigo-500 focus:ring-indigo-500' : 'focus:border-cyan-500 focus:ring-cyan-500'}`} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter Password Here" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className={`h-11 bg-white border-slate-300 rounded-lg pr-10 ${isAdmin ? 'focus:border-indigo-500 focus:ring-indigo-500' : 'focus:border-cyan-500 focus:ring-cyan-500'}`} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className={`w-full h-11 text-white font-medium rounded-lg transition-colors duration-300 ${
                    isAdmin 
                      ? 'bg-indigo-900 hover:bg-indigo-800' 
                      : 'bg-cyan-700 hover:bg-cyan-600'
                  }`}
                >
                  {isLoading ? "Signing in..." : `Login as ${userType === "ADMIN" ? "Admin" : "Portal User"}`}
                </Button>

                <div className="text-center">
                  <Link to="/forgot-password" className={`text-sm font-medium ${isAdmin ? 'text-indigo-600 hover:text-indigo-700' : 'text-cyan-600 hover:text-cyan-700'}`}>Forgot password?</Link>
                </div>
              </form>
            </div>

            <p className="text-center text-slate-500 text-sm mt-4">
              Do not have an account? <Link to="/register" className={`font-medium ${isAdmin ? 'text-indigo-600 hover:text-indigo-700' : 'text-cyan-600 hover:text-cyan-700'}`}>Register here</Link>
            </p>
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

export default LoginPage;