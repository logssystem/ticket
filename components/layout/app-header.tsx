'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, Clock, MessageSquare, ChevronDown, Ticket, Users, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Notificacao } from '@/lib/notificacoes'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const tipoIcone = {
  novo_usuario: <Users className="h-4 w-4 text-blue-400" />,
  novo_ticket: <Ticket className="h-4 w-4 text-green-400" />,
  ticket_atribuido: <Ticket className="h-4 w-4 text-yellow-400" />,
  sla_vencendo: <AlertTriangle className="h-4 w-4 text-red-400" />,
}

export function AppHeader() {
  const { profile, signOut } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificacoes, setNotificacoes] = useState<(Notificacao & { id: string })[]>([])
  const [notifAberto, setNotifAberto] = useState(false)

  const naoLidas = notificacoes.filter(n => !n.lida).length

  useEffect(() => {
    if (!profile) return
    // Busca notificações para 'todos' ou para o uid específico
    const q = query(
      collection(db, 'notificacoes'),
      where('para', 'in', ['todos', profile.uid]),
      orderBy('criadoEm', 'desc'),
    )
    const unsub = onSnapshot(q, snap => {
      setNotificacoes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notificacao & { id: string })))
    })
    return () => unsub()
  }, [profile])

  async function marcarTodasLidas() {
    const batch = writeBatch(db)
    notificacoes.filter(n => !n.lida).forEach(n => {
      batch.update(doc(db, 'notificacoes', n.id), { lida: true })
    })
    await batch.commit()
  }

  async function marcarLida(id: string) {
    await updateDoc(doc(db, 'notificacoes', id), { lida: true })
  }

  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {/* Search */}
        {searchOpen ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="w-56 pl-9 h-8 text-sm"
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Notifications */}
        <DropdownMenu open={notifAberto} onOpenChange={setNotifAberto}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {naoLidas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 text-[10px] font-bold bg-destructive text-white rounded-full flex items-center justify-center">
                  {naoLidas > 9 ? '9+' : naoLidas}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-medium text-sm">Notificações</span>
              {naoLidas > 0 && (
                <button
                  onClick={marcarTodasLidas}
                  className="text-xs text-primary hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                  <Bell className="h-6 w-6 opacity-30" />
                  <p className="text-xs">Nenhuma notificação</p>
                </div>
              ) : (
                notificacoes.map(n => (
                  <button
                    key={n.id}
                    onClick={() => marcarLida(n.id)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0',
                      !n.lida && 'bg-primary/5'
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                      {tipoIcone[n.tipo]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs', !n.lida && 'font-medium')}>{n.titulo}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.mensagem}</p>
                      {n.criadoEm && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDistanceToNow(n.criadoEm.toDate?.() ?? new Date(n.criadoEm), { addSuffix: true, locale: ptBR })}
                        </p>
                      )}
                    </div>
                    {!n.lida && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                    )}
                  </button>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 h-8">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                  {profile?.nome ? getInitials(profile.nome) : '?'}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium truncate">{profile?.nome}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{profile?.role}</p>
            </div>
            <button
              onClick={signOut}
              className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
            >
              Sair
            </button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
