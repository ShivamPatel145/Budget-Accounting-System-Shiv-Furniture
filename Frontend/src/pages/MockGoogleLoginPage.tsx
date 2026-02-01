import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User } from "lucide-react";
import { Building2 } from "lucide-react";

// Google G Logo SVG
const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const MockGoogleLoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleAccountSelect = (role: string, name: string) => {
    setIsLoading(true);
    
    setTimeout(() => {
        // SIMULATION: Backend would verify ID token, check DB, create user if needed, then issue JWT.
        // Scopes used: openid, email, profile (Identity Only)
        // Create a fake JWT token with role
        const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoi${role}LCJuYW1lIjoi${name}In0.mocksignature`;
        navigate(`/auth/callback?token=${mockToken}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#202124] text-white p-4">
      <div className="w-full max-w-[480px] bg-[#202124] rounded-2xl flex flex-col overflow-hidden">
        
        {/* Google Header */}
        <div className="px-10 pt-10 pb-6 flex flex-col items-center">
          <div className="mb-4">
            <GoogleLogo />
          </div>
          <h1 className="text-2xl font-normal google-sans mb-1 text-[#e8eaed]">Sign in with Google</h1>
        </div>

        {/* App Info */}
        <div className="px-10 pb-8 flex flex-col items-center text-center border-b border-[#3c4043]">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3">
                 <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-normal mb-1">Choose an account</h2>
            <p className="text-[#9aa0a6] text-base">
                to continue to <span className="text-[#8ab4f8]">Shiv Furniture</span>
            </p>
        </div>

        {/* Account List */}
        <div className="flex flex-col">
          {/* Admin Account */}
          <button 
            className="flex items-center gap-4 px-10 py-4 hover:bg-[#303134] transition-colors text-left group w-full border-b border-[#3c4043]"
            onClick={() => handleAccountSelect("admin", "Shreya Wani")}
            disabled={isLoading}
          >
             <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" />
              <AvatarFallback className="bg-purple-500 text-white text-sm">SW</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[#e8eaed] text-sm font-medium truncate">Shreya Wani</span>
              <span className="text-[#9aa0a6] text-xs truncate">shreyawani.dev@gmail.com</span>
            </div>
          </button>

          {/* Portal User Account */}
          <button 
            className="flex items-center gap-4 px-10 py-4 hover:bg-[#303134] transition-colors text-left group w-full border-b border-[#3c4043]"
            onClick={() => handleAccountSelect("portal", "Shiv Portal")}
            disabled={isLoading}
          >
             <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-emerald-600 text-white text-sm">SP</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[#e8eaed] text-sm font-medium truncate">Shiv Portal</span>
              <span className="text-[#9aa0a6] text-xs truncate">portal@shivfurniture.com</span>
            </div>
          </button>

          {/* Use Another Account */}
          <button 
            className="flex items-center gap-4 px-10 py-4 hover:bg-[#303134] transition-colors text-left w-full"
            disabled={isLoading}
          >
            <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-[#e8eaed]" />
            </div>
            <span className="text-[#e8eaed] text-sm font-medium">Use another account</span>
          </button>
        </div>

        <div className="mt-8 px-10 pb-10 text-xs text-[#9aa0a6]">
          <p className="mb-4">
             To continue, you agree to Shiv Furniture's <span className="text-[#8ab4f8]">privacy policy</span> and <span className="text-[#8ab4f8]">terms of service</span>.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}
    </div>
  );
};

export default MockGoogleLoginPage;
