import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-blue flex items-center justify-center p-4">
      <div className="glass-dark rounded-2xl p-12 max-w-lg w-full text-center">
        <div className="text-9xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-white opacity-90 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-gradient">
            🏠 Home
          </Link>
          <Link href="/login" className="bg-white text-primary-dark font-semibold py-2 px-6 rounded-lg hover:bg-gray-100">
            🔑 Login
          </Link>
        </div>
      </div>
    </div>
  );
}

