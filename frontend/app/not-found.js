import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-blue flex items-center justify-center p-4">
      <div className="glass-dark rounded-2xl p-12 max-w-lg w-full text-center">
        <div className="text-9xl font-bold text-white mb-6">404</div>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-white opacity-90 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="btn-gradient inline-block">
          🏠 Back to Home
        </Link>
      </div>
    </div>
  );
}

