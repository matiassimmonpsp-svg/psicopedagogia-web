import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Psicopedagogía Chile - Material de Evaluación Informal',
  description: 'Plataforma profesional de material e instrumentos de evaluación psicopedagógica para el sistema escolar chileno, desde Prekínder hasta 8° Básico.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
