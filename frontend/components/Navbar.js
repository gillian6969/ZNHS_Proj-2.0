'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10">
              <Image
                src="/znhslogo.png"
                alt="ZNHS Logo"
                fill
                className="object-contain"
                priority
              />
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
            className="md:hidden text-gray-700 hover:text-primary-dark focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
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
          <div className="md:hidden pb-4 space-y-2">
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-primary-light transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/#about" 
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-primary-light transition-colors"
            >
              About
            </Link>
            <Link 
              href="/#academics" 
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-primary-light transition-colors"
            >
              Academics
            </Link>
            <Link 
              href="/#admission" 
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-primary-light transition-colors"
            >
              Admission
            </Link>
            <Link 
              href="/#contact" 
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-primary-light transition-colors"
            >
              Contact Us
            </Link>
            <Link 
              href="/login" 
              onClick={() => setIsOpen(false)}
              className="block py-2 text-primary-dark font-semibold"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

