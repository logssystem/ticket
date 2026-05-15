'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search, Filter, Settings2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { tickets, getCorSLA, getLabelSLA } from '@/lib/mock-data'
import type { Ticket } from '@/lib/types'

interface TicketListProps {
  queueId: string | null
}

export function TicketList({ queueId }: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter tickets based on search and queue
  const filteredTickets = tickets.filter((ticket) => {
    if (searchTerm.length >= 3) {
      const searchLower = searchTerm.toLowerCase()
      return (
        ticket.assunto.toLowerCase().includes(searchLower) ||
        ticket.cliente.toLowerCase().includes(searchLower) ||
        ticket.organizacao.toLowerCase().includes(searchLower) ||
        ticket.numero.toString().includes(searchTerm)
      )
    }
    return true
  })

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const toggleSelectAll = () => {
    if (selectedTickets.length === paginatedTickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(paginatedTickets.map((t) => t.id))
    }
  }

  const toggleSelectTicket = (id: string) => {
    setSelectedTickets((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Triagem Atendimento Omni</h2>
          <p className="text-sm text-muted-foreground">
            Exibindo de 1 até {Math.min(itemsPerPage, filteredTickets.length)} de um total de {filteredTickets.length} registro(s)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            OPÇÕES
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
            {searchTerm.length > 0 && searchTerm.length < 3 && (
              <p className="absolute top-full left-0 mt-1 text-xs text-muted-foreground">
                Digite pelo menos 3 caracteres para iniciar a busca.
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={selectedTickets.length === paginatedTickets.length && paginatedTickets.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Número</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cliente (Organização)</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Assunto</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Aberto em</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Vencimento em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedTickets.map((ticket) => (
              <tr
                key={ticket.id}
                className={cn(
                  'hover:bg-muted/30 transition-colors',
                  selectedTickets.includes(ticket.id) && 'bg-primary/5'
                )}
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedTickets.includes(ticket.id)}
                    onCheckedChange={() => toggleSelectTicket(ticket.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {ticket.numero}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-foreground">{ticket.organizacao}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-foreground line-clamp-1 max-w-xs">
                    {ticket.assunto}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">{formatDate(ticket.abertoEm)}</span>
                </td>
                <td className="px-4 py-3">
                  {ticket.vencimentoEm ? (
                    <Badge variant="secondary" className={cn('text-xs', getCorSLA(ticket.sla))}>
                      {formatDate(ticket.vencimentoEm)}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-card">
        <p className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages || 1}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
