'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const publicRoutes = ['/login']

const roleRoutes: Record<string, string[]> = {
  admin: ['/', '/tickets', '/pessoas', '/indicadores', '/configuracoes'],
  agente: ['/tickets', '/pessoas'],
  cliente: ['/meus-tickets'],
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    if (!user && !publicRoutes.includes(pathname)) {
      router.push('/login')
      return
    }

    if (user && publicRoutes.includes(pathname)) {
      if (profile?.role === 'cliente') {
        router.push('/meus-tickets')
      } else {
        router.push('/')
      }
      return
    }
  }, [user, profile, loading, pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
