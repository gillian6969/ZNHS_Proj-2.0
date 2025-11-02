'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-blue rounded-full flex items-center justify-center text-white font-bold">
              Z
            </div>
            <span className="font-bold text-xl text-primary-dark">ZNHS</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-light font-medium">
              Home
            </Link>
            <Link href="/#about" className="text-gray-700 hover:text-primary-light font-medium">
              About
            </Link>
            <Link href="/#academics" className="text-gray-700 hover:text-primary-light font-medium">
              Academics
            </Link>
            <Link href="/#admission" className="text-gray-700 hover:text-primary-light font-medium">
              Admission
            </Link>
            <Link href="/#contact" className="text-gray-700 hover:text-primary-light font-medium">
              Contact Us
            </Link>
          </div>

          {/* Login Button */}
          <div className="hidden md:block">
            <Link href="/login" className="btn-gradient">
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <Link href="/" className="block py-2 text-gray-700 hover:text-primary-light">
              Home
            </Link>
            <Link href="/#about" className="block py-2 text-gray-700 hover:text-primary-light">
              About
            </Link>
            <Link href="/#academics" className="block py-2 text-gray-700 hover:text-primary-light">
              Academics
            </Link>
            <Link href="/#admission" className="block py-2 text-gray-700 hover:text-primary-light">
              Admission
            </Link>
            <Link href="/#contact" className="block py-2 text-gray-700 hover:text-primary-light">
              Contact Us
            </Link>
            <Link href="/login" className="block py-2 text-primary-dark font-semibold">
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

