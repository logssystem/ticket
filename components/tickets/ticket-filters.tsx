'use client'

import { cn } from '@/lib/utils'
import { filasTicket } from '@/lib/mock-data'

interface TicketFiltersProps {
  selectedQueue: string | null
  onSelectQueue: (id: string | null) => void
}

export function TicketFilters({ selectedQueue, onSelectQueue }: TicketFiltersProps) {
  return (
    <div className="w-64 border-r border-border bg-card h-full overflow-y-auto">
      <div className="p-3">
        <select
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
          value={selectedQueue || 'all'}
          onChange={(e) => onSelectQueue(e.target.value === 'all' ? null : e.target.value)}
        >
          <option value="all">TK Abertos</option>
        </select>
      </div>

      <nav className="px-2 pb-4">
        {filasTicket.map((fila) => (
          <button
            key={fila.id}
            onClick={() => onSelectQueue(fila.id)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md transition-colors text-left',
              selectedQueue === fila.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground hover:bg-muted'
            )}
          >
            <span className="truncate">{fila.nome}</span>
            {fila.contador > 0 && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                selectedQueue === fila.id ? 'bg-primary/20' : 'bg-muted'
              )}>
                {fila.contador}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
