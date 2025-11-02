'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would send a password reset email
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-blue flex items-center justify-center p-4">
      <div className="glass-dark rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-primary-dark">Z</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
          <p className="text-white opacity-90">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-500 text-white p-4 rounded-lg mb-6 text-center">
            <p className="font-semibold mb-2">✓ Check your email!</p>
            <p className="text-sm">
              If an account exists with that email, you'll receive password reset instructions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2 font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <button type="submit" className="w-full bg-white text-primary-dark font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors">
              Send Reset Link
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-white hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

