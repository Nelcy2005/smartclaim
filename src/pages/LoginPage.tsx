import React from 'react';
import { ShieldCheck, Cpu, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { signInWithGoogle, loading, error, clearError } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      clearError();
      await signInWithGoogle();
      if (onLogin) {
        onLogin();
      }
    } catch {
      // Error is stored in AuthContext and displayed
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-gray-200 rounded-xl sm:px-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-600 tracking-tight">
              SmartClaim <span className="text-gray-900">AI</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1.5">
              Sign in with your Google account to manage your claims
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="space-y-4">
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {/* Google SVG Icon */}
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
            </button>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Automated image condition verification with MobileNetV2</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Cpu className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span>Direct price-matched refund recommendations</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>Secure user-isolated Firestore records</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400 font-normal">
          SmartClaim AI &bull; Academic Project Prototype
        </div>
      </div>
    </div>
  );
};
