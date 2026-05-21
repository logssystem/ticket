import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { RouteGuard } from '@/components/route-guard'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ERA Tickets',
  description: 'Plataforma de atendimento e gestão de tickets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <RouteGuard>
            {children}
          </RouteGuard>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}