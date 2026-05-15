'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Ticket,
  Users,
  Pin,
  Mail,
  MessageSquare,
  Calendar,
  HelpCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { contadoresHome, usuarioLogado } from '@/lib/mock-data'

interface ExpandableCardProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  accentColor?: string
  action?: { label: string; href: string }
}

function ExpandableCard({
  title,
  icon,
  children,
  defaultExpanded = false,
  accentColor = 'bg-amber-400',
  action,
}: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="flex flex-row items-center justify-between py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">{icon}</span>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </CardHeader>
      <div className={cn('h-1', accentColor)} />
      {expanded && (
        <CardContent className="pt-4">
          {children}
          {action && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="link" className="p-0 h-auto text-primary font-medium">
                {action.label}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

interface TicketCounterProps {
  label: string
  count: number
  color: string
}

function TicketCounter({ label, count, color }: TicketCounterProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge variant="secondary" className={cn('font-semibold', color)}>
        {count}
      </Badge>
    </div>
  )
}

export function HomeContent() {
  const { meusTickets, ticketsEquipe, todosTickets, mensagens, chatsAguardando, chatsEmAtendimento, eventosHoje, eventosSemana } = contadoresHome

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Message */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Olá, {usuarioLogado.nome.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">Que bom te ver por aqui! :)</p>
      </div>

      {/* Info Banner */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        Para acessar os contadores de tickets é só expandir os indicadores que deseja visualizar e utilizar normalmente
      </div>

      {/* Cards Grid - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Meus Tickets */}
        <ExpandableCard
          title="Meus tickets"
          icon={<Ticket className="h-5 w-5" />}
          accentColor="bg-amber-400"
          defaultExpanded
        >
          <div className="space-y-1">
            <TicketCounter label="Novos" count={meusTickets.novos} color="text-blue-600" />
            <TicketCounter label="Em andamento" count={meusTickets.emAndamento} color="text-cyan-600" />
            <TicketCounter label="Pendentes" count={meusTickets.pendentes} color="text-amber-600" />
          </div>
        </ExpandableCard>

        {/* Tickets da Equipe */}
        <ExpandableCard
          title="Tickets da minha equipe"
          icon={<Ticket className="h-5 w-5" />}
          accentColor="bg-amber-400"
        >
          <div className="space-y-1">
            <TicketCounter label="Novos" count={ticketsEquipe.novos} color="text-blue-600" />
            <TicketCounter label="Em andamento" count={ticketsEquipe.emAndamento} color="text-cyan-600" />
            <TicketCounter label="Pendentes" count={ticketsEquipe.pendentes} color="text-amber-600" />
          </div>
        </ExpandableCard>

        {/* Todos os Tickets */}
        <ExpandableCard
          title="Tickets de todos os agentes"
          icon={<Ticket className="h-5 w-5" />}
          accentColor="bg-amber-400"
        >
          <div className="space-y-1">
            <TicketCounter label="Novos" count={todosTickets.novos} color="text-blue-600" />
            <TicketCounter label="Em andamento" count={todosTickets.emAndamento} color="text-cyan-600" />
            <TicketCounter label="Pendentes" count={todosTickets.pendentes} color="text-amber-600" />
          </div>
        </ExpandableCard>
      </div>

      {/* Cards Grid - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mural de Avisos */}
        <ExpandableCard
          title="Mural de avisos"
          icon={<Pin className="h-5 w-5" />}
          accentColor="bg-amber-400"
          action={{ label: 'VER AVISOS', href: '/avisos' }}
        >
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Pin className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhum aviso para ser exibido</p>
          </div>
        </ExpandableCard>

        {/* Mensagens */}
        <ExpandableCard
          title="Mensagens"
          icon={<Mail className="h-5 w-5" />}
          accentColor="bg-amber-400"
          defaultExpanded
          action={{ label: 'CAIXA DE ENTRADA', href: '/recados' }}
        >
          <p className="text-foreground">
            Você tem <span className="font-semibold">{mensagens} mensagens novas</span>
          </p>
        </ExpandableCard>

        {/* Chat */}
        <ExpandableCard
          title="Chat"
          icon={<MessageSquare className="h-5 w-5" />}
          accentColor="bg-amber-400"
          defaultExpanded
          action={{ label: 'VER CONVERSAS', href: '/chat' }}
        >
          <div className="space-y-2">
            <p className="text-foreground">{chatsAguardando} chats aguardando atendimento</p>
            <p className="text-foreground">{chatsEmAtendimento} chats em atendimento</p>
          </div>
        </ExpandableCard>
      </div>

      {/* Cards Grid - Third Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Empty Placeholder */}
        <div />

        {/* Agenda */}
        <ExpandableCard
          title="Agenda"
          icon={<Calendar className="h-5 w-5" />}
          accentColor="bg-amber-400"
          defaultExpanded
          action={{ label: 'VER AGENDA', href: '/agenda' }}
        >
          <div className="space-y-2">
            <p className="text-foreground font-medium">{eventosHoje} eventos hoje</p>
            <p className="text-foreground">{eventosSemana} eventos esta semana</p>
          </div>
        </ExpandableCard>

        {/* Central de Ajuda */}
        <ExpandableCard
          title="Central de ajuda"
          icon={<HelpCircle className="h-5 w-5" />}
          accentColor="bg-amber-400"
          defaultExpanded
        >
          <p className="text-muted-foreground text-sm">
            Aqui você terá acesso às atualizações da base de conhecimento da ERA
          </p>
        </ExpandableCard>
      </div>
    </div>
  )
}
