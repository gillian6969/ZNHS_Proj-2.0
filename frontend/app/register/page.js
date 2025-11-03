'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    <div className="min-h-screen bg-gradient-blue flex items-center justify-center p-4">
      <div className="glass-dark rounded-2xl p-8 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-primary-dark">Z</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Student Registration</h1>
          <p className="text-white opacity-90">Create your ZNHS account</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white mb-2 font-medium text-sm">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm">
              ID Number *
            </label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your student ID"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm">
              Grade Level *
            </label>
            <select
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Grade Level</option>
              {GRADE_LEVELS.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm">
              Section *
            </label>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Section</option>
              {SECTIONS.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm">
              Contact Number
            </label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="input-field"
              placeholder="09XX XXX XXXX"
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium text-sm">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field"
              placeholder="Re-enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-primary-dark font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-white">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-white/80 hover:text-white text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

