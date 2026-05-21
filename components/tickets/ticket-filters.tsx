'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Loader2 } from 'lucide-react'

const CAIXAS_FIXAS = [
  { id: 'todos', nome: 'Todos os tickets', ordem: 0 },
  { id: 'triagem', nome: 'Triagem', ordem: 1 },
  { id: 'suporte-pabx', nome: 'Suporte PABX', ordem: 2 },
  { id: 'suporte-omni', nome: 'Suporte Omni', ordem: 3 },
  { id: 'comercial', nome: 'Comercial', ordem: 4 },
  { id: 'onboarding', nome: 'Onboarding', ordem: 5 },
  { id: 'financeiro', nome: 'Financeiro', ordem: 6 },
  { id: 'desenvolvimento', nome: 'Desenvolvimento', ordem: 7 },
  { id: 'projetos', nome: 'Projetos', ordem: 8 },
  { id: 'operacao-assistida', nome: 'Operação Assistida', ordem: 9 },
]

interface TicketFiltersProps {
  selectedQueue: string | null
  onSelectQueue: (id: string | null) => void
}

export function TicketFilters({ selectedQueue, onSelectQueue }: TicketFiltersProps) {
  const [contadores, setContadores] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarContadores()
  }, [])

  async function carregarContadores() {
    try {
      const snap = await getDocs(collection(db, 'tickets'))
      const counts: Record<string, number> = { todos: snap.size }
      snap.docs.forEach(d => {
        const caixa = d.data().caixa as string
        if (caixa) counts[caixa] = (counts[caixa] || 0) + 1
      })
      setContadores(counts)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-56 border-r border-border bg-card h-full overflow-y-auto flex-shrink-0">
      <div className="px-3 pt-3 pb-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Caixas
        </p>
      </div>
      <nav className="px-2 pb-4 space-y-0.5">
        {CAIXAS_FIXAS.map((caixa) => {
          const isActive = selectedQueue === caixa.id || (!selectedQueue && caixa.id === 'todos')
          const count = contadores[caixa.id] || 0

          return (
            <button
              key={caixa.id}
              onClick={() => onSelectQueue(caixa.id === 'todos' ? null : caixa.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <span className="truncate">{caixa.nome}</span>
              {count > 0 && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                  isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
