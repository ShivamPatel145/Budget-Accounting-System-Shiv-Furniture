import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

type UserType = "ADMIN" | "PORTAL";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", loginId: "", email: "", password: "", confirmPassword: "" });
  const [userType, setUserType] = useState<UserType>("PORTAL");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.loginId.length < 6 || formData.loginId.length > 12) {
      toast.error("Login ID must be between 6-12 characters");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/register", { 
        name: formData.name, 
        loginId: formData.loginId,
        email: formData.email, 
        password: formData.password,
        role: userType
      });
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = userType === "ADMIN";

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isAdmin ? 'from-blue-100 via-blue-50 to-indigo-100' : 'from-emerald-100 via-emerald-50 to-teal-100'} flex flex-col transition-colors duration-300`}>
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 ${isAdmin ? 'bg-indigo-600' : 'bg-emerald-600'} rounded-lg flex items-center justify-center transition-colors duration-300`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <span className={`text-xs ${isAdmin ? 'text-indigo-600' : 'text-emerald-600'} font-medium transition-colors duration-300`}>SHIV</span>
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
                <ellipse cx="200" cy="340" rx="120" ry="20" fill="#cbd5e1" />
                <rect x="120" y="200" width="160" height="120" rx="10" fill="#1e293b" />
                <rect x="130" y="210" width="140" height="90" rx="4" fill="#10b981" />
                <rect x="145" y="225" width="110" height="60" fill="#065f46" />
                <rect x="120" y="320" width="40" height="25" fill="#475569" />
                <rect x="240" y="320" width="40" height="25" fill="#475569" />
                <circle cx="300" cy="150" r="40" fill="#fcd9bd" />
                <path d="M260 140 Q260 100 300 100 Q340 100 340 140" fill="#1e293b" />
                <circle cx="290" cy="145" r="3" fill="#1e293b" />
                <circle cx="310" cy="145" r="3" fill="#1e293b" />
                <path d="M290 160 Q300 170 310 160" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M300 190 L300 280 L280 320" stroke="#10b981" strokeWidth="25" fill="none" strokeLinecap="round" />
                <path d="M270 220 L200 260" stroke="#fcd9bd" strokeWidth="15" fill="none" strokeLinecap="round" />
                <path d="M330 220 L340 250" stroke="#fcd9bd" strokeWidth="15" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mt-6">Join Us!</h2>
            <p className="text-slate-600 text-center mt-2 max-w-sm">Create your account and start managing your business finances</p>
          </div>

          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-800">Register</h2>
              <p className="text-slate-500 mt-1 mb-4">Create your free account</p>

              {/* User Type Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Register As</label>
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
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Portal</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <Input type="text" placeholder="Enter Your Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className={`h-11 bg-white border-slate-300 rounded-lg ${isAdmin ? 'focus:border-indigo-500 focus:ring-indigo-500' : 'focus:border-emerald-500 focus:ring-emerald-500'}`} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Login ID <span className="text-red-500">*</span></label>
                  <Input type="text" placeholder="6-12 characters" value={formData.loginId} onChange={(e) => setFormData({...formData, loginId: e.target.value})} required minLength={6} maxLength={12} className={`h-11 bg-white border-slate-300 rounded-lg ${isAdmin ? 'focus:border-indigo-500 focus:ring-indigo-500' : 'focus:border-emerald-500 focus:ring-emerald-500'}`} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email ID <span className="text-red-500">*</span></label>
                  <Input type="email" placeholder="Enter Email Here" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className={`h-11 bg-white border-slate-300 rounded-lg ${isAdmin ? 'focus:border-indigo-500 focus:ring-indigo-500' : 'focus:border-emerald-500 focus:ring-emerald-500'}`} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="Enter Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required className={`h-11 bg-white border-slate-300 rounded-lg pr-10 ${isAdmin ? 'focus:border-indigo-500 focus:ring-indigo-500' : 'focus:border-emerald-500 focus:ring-emerald-500'}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">8+ chars, uppercase, lowercase, special char</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input type={showConfirm ? "text" : "password"} placeholder="Confirm Password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required className={`h-11 bg-white border-slate-300 rounded-lg pr-10 ${isAdmin ? 'focus:border-indigo-500 focus:ring-indigo-500' : 'focus:border-emerald-500 focus:ring-emerald-500'}`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className={`w-full h-11 text-white font-medium rounded-lg transition-colors duration-300 ${isAdmin ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-emerald-700 hover:bg-emerald-600'}`}>
                  {isLoading ? "Creating Account..." : `Register as ${userType === "ADMIN" ? "Admin" : "Portal User"}`}
                </Button>
              </form>
            </div>

            <p className="text-center text-slate-500 text-sm mt-4">
              Already have an account? <Link to="/login" className={`font-medium ${isAdmin ? 'text-indigo-600 hover:text-indigo-700' : 'text-emerald-600 hover:text-emerald-700'}`}>Login here</Link>
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

export default RegisterPage;