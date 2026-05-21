'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, BarChart3 } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { TicketFilters } from '@/components/tickets/ticket-filters'
import { TicketList } from '@/components/tickets/ticket-list'
import { NovoTicketModal } from '@/components/tickets/novo-ticket-modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TabType = 'tickets' | 'indicadores'

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tickets')
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null)
  const [modalNovoTicket, setModalNovoTicket] = useState(false)

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Tab Header */}
        <div className="flex items-center gap-1 px-4 py-2 bg-card border-b border-border">
          <button
            onClick={() => setActiveTab('tickets')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'tickets'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            Tickets
          </button>
          <Link href="/indicadores">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted">
              <BarChart3 className="h-4 w-4" />
              Indicadores
            </button>
          </Link>
          <Button
            size="sm"
            className="ml-auto gap-2"
            onClick={() => setModalNovoTicket(true)}
          >
            <Plus className="h-4 w-4" />
            Novo ticket
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          <TicketFilters
            selectedQueue={selectedQueue}
            onSelectQueue={setSelectedQueue}
          />
          <TicketList queueId={selectedQueue} />
        </div>
      </div>

      <NovoTicketModal
        aberto={modalNovoTicket}
        onFechar={() => setModalNovoTicket(false)}
      />
    </AppLayout>
  )
}
