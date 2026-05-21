'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Home,
  Ticket,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, UserRole } from '@/lib/auth-context'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  submenu?: { id: string; label: string; href: string }[]
  badge?: number
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Página inicial',
    icon: <Home className="h-5 w-5" />,
    href: '/',
    roles: ['admin'],
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: <Ticket className="h-5 w-5" />,
    href: '/tickets',
    roles: ['admin', 'agente'],
  },
  {
    id: 'meus-tickets',
    label: 'Meus Tickets',
    icon: <Ticket className="h-5 w-5" />,
    href: '/meus-tickets',
    roles: ['cliente'],
  },
  {
    id: 'pessoas',
    label: 'Pessoas',
    icon: <Users className="h-5 w-5" />,
    href: '/pessoas',
    roles: ['admin', 'agente'],
  },
  {
    id: 'indicadores',
    label: 'Indicadores',
    icon: <BarChart3 className="h-5 w-5" />,
    href: '/indicadores',
    roles: ['admin'],
  },
]

const bottomNavItems: NavItem[] = [
  {
    id: 'config',
    label: 'Configurações',
    icon: <Settings className="h-5 w-5" />,
    href: '/configuracoes',
    roles: ['admin'],
  },
]

interface AppSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function AppSidebar({ collapsed = false, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([])

  const userRole = profile?.role ?? 'cliente'

  const visibleNavItems = navItems.filter((item) => item.roles.includes(userRole))
  const visibleBottomItems = bottomNavItems.filter((item) => item.roles.includes(userRole))

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'flex flex-col h-full bg-card border-r border-border transition-all duration-300',
          collapsed ? 'w-14' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-3 border-b border-border">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Ticket className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-sm truncate">ERA Tickets</span>
            )}
          </div>
          <button
            onClick={onToggle}
            className="flex-shrink-0 p-1 rounded-md hover:bg-muted text-muted-foreground"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = item.href
              ? pathname === item.href
              : item.submenu?.some((s) => pathname === s.href)
            const isOpen = openSubmenus.includes(item.id)

            if (item.submenu) {
              return (
                <div key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleSubmenu(item.id)}
                        className={cn(
                          'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md mx-1 transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                      >
                        {item.icon}
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </>
                        )}
                      </button>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    )}
                  </Tooltip>
                  {!collapsed && isOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className={cn(
                            'block px-3 py-1.5 text-sm rounded-md transition-colors',
                            pathname === sub.href
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href!}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm rounded-md mx-1 transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="py-2 border-t border-border">
          {visibleBottomItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href!}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm rounded-md mx-1 transition-colors',
                    pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          ))}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md mx-1 transition-colors hover:bg-muted',
                  collapsed && 'justify-center'
                )}
              >
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {profile?.nome ? getInitials(profile.nome) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-medium truncate">{profile?.nome ?? 'Usuário'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{profile?.role ?? ''}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{profile?.nome}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  )
}
