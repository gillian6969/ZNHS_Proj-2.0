'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { GRADE_LEVELS, SECTIONS } from '@/utils/constants';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    idNumber: '',
    password: '',
    confirmPassword: '',
    gradeLevel: '',
    section: '',
    contact: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      idNumber: formData.idNumber,
      password: formData.password,
      gradeLevel: formData.gradeLevel,
      section: formData.section,
      contact: formData.contact,
    });

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
          quality={90}
        />
        {/* Blur & Dark Overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-br from-gray-900/80 via-blue-900/70 to-indigo-900/80"></div>
      </div>

      <div className="relative z-10 glass-dark rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/30">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 relative mx-auto mb-4">
            <Image
              src="/znhslogo.png"
              alt="ZNHS Logo"
              fill
              className="object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Student Registration</h1>
          <p className="text-white/95 text-sm md:text-base drop-shadow-md">Create your ZNHS account</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg border border-red-400/30">
              <span className="text-xl">⚠️</span>
              <span className="font-medium text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-white mb-2 font-medium text-sm drop-shadow-sm">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all shadow-lg"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm drop-shadow-sm">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all shadow-lg"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm drop-shadow-sm">
              ID Number *
            </label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all shadow-lg"
              placeholder="Enter your student ID"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm drop-shadow-sm">
              Grade Level *
            </label>
            <select
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all shadow-lg [&>option]:bg-gray-800 [&>option]:text-white"
              required
            >
              <option value="">Select Grade Level</option>
              {GRADE_LEVELS.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm drop-shadow-sm">
              Section *
            </label>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all shadow-lg [&>option]:bg-gray-800 [&>option]:text-white"
              required
            >
              <option value="">Select Section</option>
              {SECTIONS.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm drop-shadow-sm">
              Contact Number
            </label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all shadow-lg"
              placeholder="09XX XXX XXXX"
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm drop-shadow-sm">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all shadow-lg"
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm drop-shadow-sm">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all shadow-lg"
              placeholder="Re-enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 backdrop-blur-sm border border-white/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Register
                <span className="text-xl">→</span>
              </span>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-white/90 drop-shadow-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:text-white hover:underline transition-colors">
              Login here
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-white/80 hover:text-white text-sm inline-flex items-center gap-2 transition-colors drop-shadow-sm">
            <span>←</span> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

