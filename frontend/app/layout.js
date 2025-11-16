'use client';

import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/znhslogo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/znhslogo.png" />
        <title>ZNHS Academic Information Management System</title>
        <meta name="description" content="Zaragoza National High School - Academic Information Management System" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

