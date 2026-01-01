import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Opteryx Documentation',
  description: 'Official documentation for Opteryx - SQL engine for data files',
  icons: {
    icon: '/opteryx.svg',
    apple: '/opteryx.svg',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
