import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { SITE_URL } from '@/lib/site-url'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Psicopedagogía Chile - Material de Evaluación Psicopedagógica',
    template: '%s | Psicopedagogía Chile',
  },
  description: 'Plataforma profesional de material e instrumentos de evaluación psicopedagógica para el sistema escolar chileno, desde Prekínder hasta 8° Básico.',
  keywords: ['psicopedagogía', 'evaluación', 'material educativo', 'chile', 'sistema escolar', 'instruments de evaluación', 'Prekínder', 'Básico'],
  authors: [{ name: 'Psicopedagogía Chile' }],
  creator: 'Psicopedagogía Chile',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'Psicopedagogía Chile',
    title: 'Psicopedagogía Chile - Material de Evaluación Psicopedagógica',
    description: 'Plataforma profesional de material e instrumentos de evaluación psicopedagógica para el sistema escolar chileno.',
    images: [{ url: '/social/og-default.png', width: 1200, height: 630, alt: 'Psicopedagogía Chile' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Psicopedagogía Chile - Material de Evaluación Psicopedagógica',
    description: 'Plataforma profesional de material e instrumentos de evaluación psicopedagógica para el sistema escolar chileno.',
    images: ['/social/og-default.png'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              Saltar al contenido principal
            </a>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#f9fafb',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#f9fafb',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#f9fafb',
                  },
                },
              }}
            />
            <Navbar />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
