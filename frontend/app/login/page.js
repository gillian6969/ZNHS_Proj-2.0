'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'staff') {
      setActiveTab('staff');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(identifier, password, activeTab);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Full Screen Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/logo2.jpg"
          alt="ZNHS Logo Background"
          fill
          className="object-cover"
          priority
          quality={75}
          sizes="100vw"
        />
        {/* Blur & Dark Overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-br from-gray-900/80 via-blue-900/70 to-indigo-900/80"></div>
      </div>

      <div className="relative z-10 glass-dark rounded-3xl p-8 md:p-12 max-w-md w-full shadow-2xl border border-white/30">
        {/* School Logo & Name */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 relative mx-auto mb-4">
            <Image
              src="/znhslogo.png"
              alt="ZNHS Logo"
              fill
              className="object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Welcome to ZNHS
          </h1>
          <p className="text-white/95 text-sm md:text-base drop-shadow-md">
            Academic Student Grades Portal
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex-1 py-3.5 px-4 rounded-xl font-semibold transition-all transform backdrop-blur-sm ${
              activeTab === 'student'
                ? 'bg-white text-primary-dark shadow-xl scale-105 border-2 border-white/50'
                : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/10'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex-1 py-3.5 px-4 rounded-xl font-semibold transition-all transform backdrop-blur-sm ${
              activeTab === 'staff'
                ? 'bg-white text-primary-dark shadow-xl scale-105 border-2 border-white/50'
                : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/10'
            }`}
          >
            Faculty
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg border border-red-400/30">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-white mb-2 font-medium drop-shadow-sm">
              ID Number / Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all shadow-lg"
              placeholder="Enter your ID or email"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium drop-shadow-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all shadow-lg"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 015.12 5.12m3.48 3.48L12 12m-3.4-3.4l3.4 3.4m0 0l3.4 3.4M12 12l3.4 3.4m0 0a9.97 9.97 0 011.88-1.88m-1.88 1.88L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-white/90 cursor-pointer hover:text-white transition-colors">
              <input 
                type="checkbox" 
                className="mr-2 w-4 h-4 rounded border-white/30 bg-white/10 accent-blue-600 cursor-pointer" 
              />
              <span className="drop-shadow-sm">Remember Me</span>
            </label>
            <Link 
              href="/forgot-password" 
              className="text-white/90 hover:text-white hover:underline transition-colors drop-shadow-sm"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 backdrop-blur-sm border border-white/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Login
                <span className="text-xl">→</span>
              </span>
            )}
          </button>
        </form>

        {/* Register Link */}
        {activeTab === 'student' && (
          <div className="mt-6 text-center">
            <p className="text-white">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-white/80 hover:text-white text-sm inline-flex items-center gap-2">
            <span>←</span> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
