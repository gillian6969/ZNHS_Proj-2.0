export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* School Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-blue rounded-full flex items-center justify-center font-bold">
                Z
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
              Email: info@znhs.edu.ph
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

