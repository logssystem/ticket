'use client'

import { useState } from 'react'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader title={title} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
