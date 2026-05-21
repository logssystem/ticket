'use client'

import { RefreshCw, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  description: string
  value: number
  variation: number
}

export function KPICard({ title, description, value, variation }: KPICardProps) {
  const isPositive = variation > 0
  const isNegative = variation < 0

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 pr-4">
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end justify-between mt-4">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span
          className={cn(
            'text-sm font-medium',
            isPositive && 'text-emerald-600',
            isNegative && 'text-red-500',
            !isPositive && !isNegative && 'text-muted-foreground'
          )}
        >
          {isPositive && '+'}
          {variation.toFixed(2)}%
        </span>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-end mt-2">
        <select className="text-xs text-muted-foreground bg-transparent border-none cursor-pointer">
          <option>Selecione um filtro</option>
        </select>
      </div>
    </div>
  )
}
