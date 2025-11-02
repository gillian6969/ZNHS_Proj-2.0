'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      {/* Hero Section - Modern & Colorful */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                🎓 Welcome to ZNHS
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
                Your Journey to
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Excellence</span>
              </h1>
              
              <p className="text-xl text-gray-700 leading-relaxed">
                Access your grades, attendance, and learning materials anytime, anywhere. 
                Empowering education through technology.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/login?type=student" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    📚 Student Portal
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                
                <Link 
                  href="/login?type=staff" 
                  className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl border-2 border-blue-600 transform hover:-translate-y-1 transition-all"
                >
                  👨‍🏫 Staff Portal
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1000+</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">50+</div>
                  <div className="text-sm text-gray-600">Teachers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">77+</div>
                  <div className="text-sm text-gray-600">Years</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-[3rem] transform rotate-3"></div>
                <div className="absolute inset-0 bg-white rounded-[3rem] shadow-2xl p-8 flex items-center justify-center">
                  <div className="w-48 h-48 relative">
                    <Image
                      src="/znhslogo.png"
                      alt="ZNHS Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Card Style */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features to enhance your learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '📊', title: 'Track Grades', desc: 'View your academic performance in real-time', color: 'from-blue-500 to-blue-600' },
              { icon: '📅', title: 'Monitor Attendance', desc: 'Stay on top of your attendance records', color: 'from-purple-500 to-purple-600' },
              { icon: '📚', title: 'Learning Materials', desc: 'Access course materials anytime', color: 'from-pink-500 to-pink-600' },
              { icon: '📢', title: 'Announcements', desc: 'Never miss important updates', color: 'from-green-500 to-green-600' },
              { icon: '💬', title: 'Teacher Communication', desc: 'Connect with your teachers easily', color: 'from-yellow-500 to-orange-600' },
              { icon: '📝', title: 'Submit Assignments', desc: 'Turn in work digitally and on time', color: 'from-red-500 to-pink-600' },
            ].map((feature, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students and teachers already using ZNHS AIMS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
            >
              Register Now
            </Link>
            <Link 
              href="/login" 
              className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-xl text-gray-600">We're here to help you succeed</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    📍
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Address</h3>
                    <p className="text-gray-600">Zaragoza, Nueva Ecija, Philippines</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    📧
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Email</h3>
                    <p className="text-gray-600">info@znhs.edu.ph</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    📞
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Phone</h3>
                    <p className="text-gray-600">(044) 123-4567</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    🕐
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Office Hours</h3>
                    <p className="text-gray-600">Mon-Fri: 7:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
