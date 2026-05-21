'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Ticket, TicketStatus, TicketSLA } from '@/lib/types'
import { Loader2, Inbox } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusLabels: Record<TicketStatus, string> = {
  novo: 'Novo',
  em_andamento: 'Em andamento',
  pendente: 'Pendente',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
  cancelado: 'Cancelado',
}

const statusColors: Record<TicketStatus, string> = {
  novo: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  em_andamento: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  pendente: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  resolvido: 'bg-green-500/10 text-green-400 border-green-500/20',
  fechado: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  cancelado: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const slaColors: Record<TicketSLA, string> = {
  no_prazo: 'bg-green-500',
  a_vencer: 'bg-yellow-500',
  vencido: 'bg-red-500',
  em_pausa: 'bg-gray-400',
  nao_definido: 'bg-gray-600',
}

interface TicketListProps {
  queueId: string | null
}

export function TicketList({ queueId }: TicketListProps) {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarTickets()
  }, [queueId])

  async function carregarTickets() {
    setLoading(true)
    try {
      const q = query(collection(db, 'tickets'), orderBy('abertoEm', 'desc'))
      const snap = await getDocs(q)
      const dados = snap.docs.map(d => {
        const data = d.data()
        return {
          ...data,
          id: d.id,
          abertoEm: data.abertoEm?.toDate?.() ?? new Date(data.abertoEm),
          vencimentoEm: data.vencimentoEm?.toDate?.() ?? (data.vencimentoEm ? new Date(data.vencimentoEm) : null),
          resolvidoEm: data.resolvidoEm?.toDate?.() ?? (data.resolvidoEm ? new Date(data.resolvidoEm) : null),
        } as Ticket
      })
      setTickets(dados)
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-8">
        <Inbox className="h-12 w-12 opacity-20" />
        <p className="text-sm font-medium">Nenhum ticket encontrado</p>
        <p className="text-xs opacity-60">Os tickets criados aparecerão aqui</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-card border-b border-border">
          <tr className="text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium w-8"></th>
            <th className="px-4 py-3 font-medium">Número</th>
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Assunto</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Aberto em</th>
            <th className="px-4 py-3 font-medium">Vencimento</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => router.push(`/tickets/${ticket.id}`)}
              className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3">
                <div className={cn('w-2 h-2 rounded-full', slaColors[ticket.sla])} />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                #{ticket.numero}
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{ticket.clienteNome}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">{ticket.empresaNome}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="truncate max-w-[280px]">{ticket.assunto}</p>
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                  statusColors[ticket.status]
                )}>
                  {statusLabels[ticket.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {formatDistanceToNow(ticket.abertoEm, { addSuffix: true, locale: ptBR })}
              </td>
              <td className="px-4 py-3 text-xs">
                {ticket.vencimentoEm ? (
                  <span className={cn(
                    'px-2 py-0.5 rounded border text-xs',
                    ticket.sla === 'vencido' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    ticket.sla === 'a_vencer' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-green-500/10 text-green-400 border-green-500/20'
                  )}>
                    {ticket.vencimentoEm.toLocaleDateString('pt-BR')}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
