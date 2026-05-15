'use client'

import { RefreshCw, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DataTableProps {
  title: string
  columns: { key: string; label: string; align?: 'left' | 'right' }[]
  data: Record<string, string | number>[]
  period?: string
}

export function DataTable({ title, columns, data, period = 'Este mês' }: DataTableProps) {
  const formatVariation = (value: number) => {
    const formatted = `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
    return {
      text: formatted,
      color: value > 0 ? 'text-emerald-600' : value < 0 ? 'text-red-500' : 'text-muted-foreground',
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <select className="text-sm text-muted-foreground bg-transparent border-none p-0 cursor-pointer">
              <option>{period}</option>
              <option>Mês passado</option>
              <option>Últimos 3 meses</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <select className="text-sm bg-transparent border-none cursor-pointer">
            <option>Selecione um filtro</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-sm font-medium text-muted-foreground',
                    col.align === 'right' ? 'text-right' : 'text-left'
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-muted/30">
                {columns.map((col) => {
                  const value = row[col.key]
                  const isVariation = col.key === 'variacao' && typeof value === 'number'

                  if (isVariation) {
                    const { text, color } = formatVariation(value as number)
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-sm',
                          col.align === 'right' ? 'text-right' : 'text-left',
                          color
                        )}
                      >
                        {text}
                      </td>
                    )
                  }

                  return (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-sm text-foreground',
                        col.align === 'right' ? 'text-right' : 'text-left'
                      )}
                    >
                      {value}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
