'use client'

import { use } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronRight, Edit2, User } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { TicketTimeline } from '@/components/tickets/ticket-timeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { tickets, ticketAcoes, getCorStatus, getLabelStatus } from '@/lib/mock-data'

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const ticket = tickets.find((t) => t.id === resolvedParams.id) || tickets[0]
  const acoes = ticketAcoes.filter((a) => a.ticketId === ticket.id)

  // If no actions found, add a default one based on ticket
  const displayAcoes = acoes.length > 0 ? acoes : [{
    id: '1',
    ticketId: ticket.id,
    tipo: 'publica' as const,
    autor: ticket.cliente,
    autorEmail: ticket.email,
    conteudo: ticket.descricao,
    criadoEm: ticket.abertoEm,
  }]

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Tab Header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-card border-b border-border">
          <Link href="/tickets">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
              Tickets
            </button>
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md">
            #{ticket.numero} - r...
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-3 text-sm bg-muted/30 border-b border-border">
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            {ticket.organizacao}
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            {ticket.cliente}
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">#{ticket.numero}</span>

          <div className="ml-auto flex items-center gap-3">
            <Select defaultValue="novo">
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novo">1. Novo</SelectItem>
                <SelectItem value="em_andamento">2. Em andamento</SelectItem>
                <SelectItem value="pendente">3. Pendente</SelectItem>
                <SelectItem value="resolvido">4. Resolvido</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              OPÇÕES
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Ticket Info */}
          <div className="w-80 border-r border-border bg-card overflow-y-auto">
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button className="flex-1 px-4 py-3 text-sm font-medium text-primary border-b-2 border-primary">
                PÚBLICO
              </button>
              <button className="flex-1 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                INTERNO
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Solicitante */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Solicitante</label>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                    Colocar-me como solicitante
                  </Button>
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar solicitante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ticket.cliente}>{ticket.cliente}</SelectItem>
                  </SelectContent>
                </Select>

                <Card className="mt-3">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-destructive" />
                      <span className="font-medium text-sm">{ticket.cliente}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{ticket.email}</p>
                    <p className="text-xs text-muted-foreground">{ticket.telefone}</p>
                    <p className="text-xs text-muted-foreground">{ticket.organizacao}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Serviço */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Serviço</label>
                <Select defaultValue={ticket.servico}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRIAGEM">TRIAGEM</SelectItem>
                    <SelectItem value="Suporte Técnico">Suporte Técnico</SelectItem>
                    <SelectItem value="Configuração">Configuração</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Categoria</label>
                <Select defaultValue={ticket.categoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solicitação">Solicitação</SelectItem>
                    <SelectItem value="Incidente">Incidente</SelectItem>
                    <SelectItem value="Dúvida">Dúvida</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Previsão de solução */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Previsão de solução</label>
                <input
                  type="text"
                  placeholder="-"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                  readOnly
                />
              </div>

              {/* Responsável */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Responsável</label>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                    Atribuir para mim
                  </Button>
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="- Selecione -" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="joao">João Freitas</SelectItem>
                    <SelectItem value="barbara">Bárbara Boiago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Tags</label>
                <input
                  type="text"
                  placeholder="Adicionar tags..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                />
              </div>

              {/* Cc */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Cc</label>
                <input
                  type="text"
                  placeholder="Adicionar destinatários..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Timeline */}
          <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
            {/* Subject */}
            <div className="flex items-start gap-3 mb-6">
              <h1 className="text-xl font-semibold text-foreground flex-1">{ticket.assunto}</h1>
              <Button variant="ghost" size="icon">
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Meta Info */}
            <p className="text-sm text-muted-foreground mb-6">
              Ticket aberto via sistema pelo cliente{' '}
              <span className="font-medium text-foreground">{ticket.cliente}</span> em{' '}
              {formatDate(ticket.abertoEm)}
            </p>

            {/* Timeline */}
            <TicketTimeline acoes={displayAcoes} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
