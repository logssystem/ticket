'use client'

import { RefreshCw, Maximize2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { dadosSLA } from '@/lib/mock-data'

const chartData = dadosSLA.map((d) => ({
  dia: d.dia,
  'Não definido': d.naoDefinido,
  'Em pausa': d.emPausa,
  'A vencer': d.aVencer,
  'Vencido': d.vencido,
}))

export function SLAStackedBarChart() {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-foreground">Tickets pendentes por vencimento</h3>
          <div className="flex items-center gap-2 mt-1">
            <select className="text-sm text-muted-foreground bg-transparent border-none p-0 cursor-pointer">
              <option>Este mês</option>
              <option>Mês passado</option>
              <option>Últimos 3 meses</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>00:34</span>
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
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
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
            <Bar dataKey="Não definido" stackId="a" fill="#06b6d4" />
            <Bar dataKey="Em pausa" stackId="a" fill="#84cc16" />
            <Bar dataKey="A vencer" stackId="a" fill="#a3a3a3" />
            <Bar dataKey="Vencido" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
