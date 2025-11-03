import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* School Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/znhslogo.png"
                  alt="ZNHS Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-xl">ZNHS</span>
            </div>
            <p className="text-gray-400">
              Zaragoza National High School
              <br />
              Excellence in Education
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
            <p className="text-gray-400">
              Zaragoza, Nueva Ecija
              <br />
              Philippines
              <br />
              <br />
              <a 
                href="https://www.facebook.com/ZaragozaNationalHS" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook Page
              </a>
              <br />
              Phone: (044) 123-4567
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/#about" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="/#academics" className="hover:text-white">
                  Academics
                </a>
              </li>
              <li>
                <a href="/#admission" className="hover:text-white">
                  Admission
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white">
                  Student Portal
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Zaragoza National High School. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

