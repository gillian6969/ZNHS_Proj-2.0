'use client';

import Toast from '@/components/Toast';
import { authAPI } from '@/utils/api';
import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState('email'); // 'email' | 'verify'
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.requestReset({ email });
      // data contains otp (local-only)
      setToast({ isOpen: true, message: `OTP: ${data.otp}`, type: 'info' });
      setStep('verify');
      setSubmitted(true);
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to request OTP';
      setToast({ isOpen: true, message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, newPassword });
      setToast({ isOpen: true, message: 'Password updated successfully', type: 'success' });
      // redirect to login after short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to reset password';
      setToast({ isOpen: true, message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
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

          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
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

              <button type="submit" disabled={loading} className="w-full bg-white text-primary-dark font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-white mb-2 font-medium">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field"
                  placeholder="6-digit OTP"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-medium">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="New password"
                  required
                  minLength={8}
                />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-white text-primary-dark font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-white hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
        duration={6000}
      />
    </div>
  );
}

