'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Home,
  Ticket,
  Users,
  BarChart3,
  MessageSquare,
  Bot,
  Mail,
  Calendar,
  Trophy,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  submenu?: { id: string; label: string; href: string }[]
  badge?: number
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Página inicial', icon: <Home className="h-5 w-5" />, href: '/' },
  { id: 'tickets', label: 'Tickets', icon: <Ticket className="h-5 w-5" />, href: '/tickets' },
  { id: 'pessoas', label: 'Pessoas', icon: <Users className="h-5 w-5" />, href: '/pessoas' },
  {
    id: 'analise',
    label: 'Análise e dados',
    icon: <BarChart3 className="h-5 w-5" />,
    submenu: [
      { id: 'indicadores', label: 'Indicadores', href: '/indicadores' },
      { id: 'relatorios', label: 'Relatórios', href: '/relatorios' },
    ],
  },
  { id: 'chat', label: 'Chat', icon: <MessageSquare className="h-5 w-5" />, href: '/chat' },
  { id: 'bot', label: 'Bot', icon: <Bot className="h-5 w-5" />, href: '/bot' },
  {
    id: 'recados',
    label: 'Recados',
    icon: <Mail className="h-5 w-5" />,
    submenu: [
      { id: 'caixa-entrada', label: 'Caixa de entrada', href: '/recados' },
      { id: 'enviados', label: 'Enviados', href: '/recados/enviados' },
    ],
  },
  { id: 'agenda', label: 'Agenda', icon: <Calendar className="h-5 w-5" />, href: '/agenda' },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: <Trophy className="h-5 w-5" />,
    submenu: [
      { id: 'organizacoes', label: 'Organizações', href: '/clientes' },
      { id: 'contatos', label: 'Contatos', href: '/clientes/contatos' },
    ],
  },
]

const bottomNavItems: NavItem[] = [
  { id: 'config', label: 'Configurações', icon: <Settings className="h-5 w-5" />, href: '/configuracoes' },
  { id: 'ajuda', label: 'Ajuda', icon: <HelpCircle className="h-5 w-5" />, href: '/ajuda' },
]

interface AppSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function AppSidebar({ collapsed = false, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleSubmenu = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const renderNavItem = (item: NavItem) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const active = isActive(item.href) || (hasSubmenu && item.submenu?.some(sub => isActive(sub.href)))

    const content = (
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer',
          active
            ? 'bg-sidebar-accent text-sidebar-primary'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )}
        onClick={() => hasSubmenu && toggleSubmenu(item.id)}
      >
        <span className={cn(active && 'text-sidebar-primary')}>{item.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs font-medium bg-sidebar-primary text-sidebar-primary-foreground rounded-full">
                {item.badge}
              </span>
            )}
            {hasSubmenu && (
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            )}
          </>
        )}
      </div>
    )

    if (collapsed) {
      return (
        <TooltipProvider key={item.id} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              {item.href && !hasSubmenu ? (
                <Link href={item.href}>{content}</Link>
              ) : (
                <div>{content}</div>
              )}
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground border-sidebar-border">
              <p>{item.label}</p>
              {hasSubmenu && (
                <div className="mt-2 space-y-1">
                  {item.submenu?.map((sub) => (
                    <Link
                      key={sub.id}
                      href={sub.href}
                      className="block px-2 py-1 text-sm hover:text-sidebar-primary rounded"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <div key={item.id}>
        {item.href && !hasSubmenu ? (
          <Link href={item.href}>{content}</Link>
        ) : (
          content
        )}
        {hasSubmenu && isExpanded && !collapsed && (
          <div className="ml-8 mt-1 space-y-1">
            {item.submenu?.map((sub) => (
              <Link
                key={sub.id}
                href={sub.href}
                className={cn(
                  'block px-3 py-2 text-sm rounded-lg transition-colors',
                  isActive(sub.href)
                    ? 'text-sidebar-primary bg-sidebar-accent/50'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30'
                )}
              >
                {sub.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-sidebar-primary tracking-tight">ERA</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(renderNavItem)}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {bottomNavItems.map(renderNavItem)}
      </div>
    </aside>
  )
}
