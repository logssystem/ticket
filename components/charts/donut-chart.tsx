'use client'

import { RefreshCw, Maximize2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface DonutChartProps {
  title: string
  data: { name: string; value: number; color: string; percentual?: number }[]
  period?: string
}

export function DonutChart({ title, data, period = 'Este mês' }: DonutChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0)

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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

      <div className="flex items-center gap-8">
        {/* Legend */}
        <div className="space-y-2 min-w-40">
          {data.slice(0, 8).map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-foreground truncate">{item.name}</span>
            </div>
          ))}
          {data.length > 8 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <ChevronUp className="h-4 w-4" />
              <span>1/3</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="h-56 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={1}
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value, 'Total']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
