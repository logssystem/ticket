'use client'

import { RefreshCw, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { dadosDiarios } from '@/lib/mock-data'

const chartData = dadosDiarios.map((d) => ({
  dia: d.dia,
  Cancelados: d.cancelados,
  Fechados: d.fechados,
  Abertos: d.abertos,
  Reabertos: d.reabertos,
  Resolvidos: d.resolvidos,
}))

export function TicketsLineChart() {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-foreground">Tickets abertos, resolvidos e reabertos no período</h3>
          <div className="flex items-center gap-2 mt-1">
            <select className="text-sm text-muted-foreground bg-transparent border-none p-0 cursor-pointer">
              <option>Este mês</option>
              <option>Mês passado</option>
              <option>Últimos 3 meses</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>00:26</span>
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

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              label={{
                value: 'Quantidade',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="Cancelados" stroke="#1f2937" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Fechados" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Abertos" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Reabertos" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Resolvidos" stroke="#84cc16" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
