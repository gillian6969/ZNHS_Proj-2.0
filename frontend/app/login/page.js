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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative glass-dark rounded-3xl p-8 md:p-12 max-w-md w-full shadow-2xl">
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome to ZNHS
          </h1>
          <p className="text-white/90 text-sm md:text-base">
            Academic Information Management System
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all transform ${
              activeTab === 'student'
                ? 'bg-white text-primary-dark shadow-lg scale-105'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <span className="text-lg mr-2">👨‍🎓</span>
            Student
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all transform ${
              activeTab === 'staff'
                ? 'bg-white text-primary-dark shadow-lg scale-105'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <span className="text-lg mr-2">👨‍🏫</span>
            Staff
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500 text-white px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="text-xl">❌</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-white mb-2 font-medium">
              ID Number / Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
              placeholder="Enter your ID or email"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-white cursor-pointer">
              <input type="checkbox" className="mr-2 w-4 h-4" />
              Remember Me
            </label>
            <Link href="/forgot-password" className="text-white hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-primary-dark font-bold py-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-primary-dark border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </span>
            ) : (
              'Login'
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
