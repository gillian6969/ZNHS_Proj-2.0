'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section - Full Screen Wallpaper */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Full Screen Background Image with Blur */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/IMG_6294.JPG"
            alt="ZNHS Modern Classroom Building"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Blur Overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/20"></div>
          {/* Dark Overlay para sa text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 via-gray-900/50 to-gray-900/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32 w-full flex items-center justify-center">
          <div className="max-w-4xl mx-auto w-full">
            {/* Centered Content */}
            <div className="space-y-8 text-center">
              <div className="inline-block bg-white/90 backdrop-blur-md text-blue-700 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                🎓 Welcome to ZNHS
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight drop-shadow-lg">
                Your Journey to
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg"> Excellence</span>
              </h1>
              
              <p className="text-xl text-white/95 leading-relaxed drop-shadow-md max-w-2xl mx-auto">
                Access your grades, attendance, and learning materials anytime, anywhere. 
                Empowering education through technology.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/login?type=student" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all overflow-hidden backdrop-blur-sm"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Student Portal
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                
                <Link 
                  href="/login?type=staff" 
                  className="px-8 py-4 bg-white/95 backdrop-blur-md text-blue-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl border-2 border-white/50 transform hover:-translate-y-1 transition-all"
                >
                  Staff Portal
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/30">
                  <div className="text-3xl font-bold text-white drop-shadow-lg">1000+</div>
                  <div className="text-sm text-white/90 font-medium">Students</div>
                </div>
                <div className="text-center bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/30">
                  <div className="text-3xl font-bold text-white drop-shadow-lg">50+</div>
                  <div className="text-sm text-white/90 font-medium">Teachers</div>
                </div>
                <div className="text-center bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/30">
                  <div className="text-3xl font-bold text-white drop-shadow-lg">77+</div>
                  <div className="text-sm text-white/90 font-medium">Years</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                About ZNHS
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Excellence in Education Since 1947
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-3xl mx-auto">
                Zaragoza National High School is committed to providing quality education 
                and empowering students to achieve their full potential. With over 75 years 
                of academic excellence, we continue to innovate and adapt to modern educational 
                needs through technology and dedicated teaching.
              </p>
            </div>

            {/* School Building Image */}
            <div className="relative w-full h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl mb-12">
              <Image
                src="/IMG_6294.JPG"
                alt="ZNHS Modern Classroom Building - The Eggia Modern Classroom Concept"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Modern Learning Facilities
                </h3>
                <p className="text-white/90 text-lg">
                  State-of-the-art classrooms designed for 21st century education
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-md">
                <div className="text-4xl font-bold text-blue-600 mb-2">75+</div>
                <div className="text-gray-600 font-medium">Years of Excellence</div>
              </div>
              <div className="text-center bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 shadow-md">
                <div className="text-4xl font-bold text-purple-600 mb-2">1000+</div>
                <div className="text-gray-600 font-medium">Active Students</div>
              </div>
              <div className="text-center bg-gradient-to-br from-pink-50 to-white rounded-2xl p-6 shadow-md">
                <div className="text-4xl font-bold text-pink-600 mb-2">50+</div>
                <div className="text-gray-600 font-medium">Dedicated Teachers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Card Style */}
      <section className="py-20 bg-gray-50">
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
              <div key={index} className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
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

      {/* Academics Section */}
      <section id="academics" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Our Academics
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Comprehensive Academic Programs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer a wide range of academic programs designed to prepare students 
              for success in higher education and beyond.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Junior High School', desc: 'Grades 7-10 comprehensive curriculum', icon: '🎓' },
              { title: 'Senior High School', desc: 'Academic, Technical, and STEM tracks', icon: '📚' },
              { title: 'STEM Program', desc: 'Science, Technology, Engineering, Math', icon: '🔬' },
              { title: 'Technical-Vocational', desc: 'Skills-based learning programs', icon: '🔧' },
            ].map((program, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100">
                <div className="text-4xl mb-4">{program.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                <p className="text-gray-600 text-sm">{program.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Section */}
      <section id="admission" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                Admissions
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Start Your Journey With Us
              </h2>
              <p className="text-xl text-gray-600">
                We welcome students who are committed to academic excellence and personal growth
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-3xl mb-4">📋</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Admission Requirements</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Report Card (Form 138)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Certificate of Good Moral Character</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Birth Certificate (PSA)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>2x2 ID Photos</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-3xl mb-4">📅</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Important Dates</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">→</span>
                    <span>Enrollment Period: April - May</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">→</span>
                    <span>Orientation: First week of June</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">→</span>
                    <span>Classes Start: Mid-June</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <Link 
                href="/register" 
                className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Register Now →
              </Link>
            </div>
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

              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Facebook</h3>
                    <a 
                      href="https://www.facebook.com/ZaragozaNationalHS" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Visit our Facebook Page
                    </a>
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
