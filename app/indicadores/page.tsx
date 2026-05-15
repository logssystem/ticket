'use client'

import { RefreshCw } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { SLAStackedBarChart } from '@/components/charts/sla-stacked-bar-chart'
import { TicketsLineChart } from '@/components/charts/tickets-line-chart'
import { DonutChart } from '@/components/charts/donut-chart'
import { DataTable } from '@/components/charts/data-table'
import { KPICard } from '@/components/charts/kpi-card'
import { Button } from '@/components/ui/button'
import {
  dadosEquipes,
  dadosAgentes,
  dadosEquipesResolucao,
  dadosClientes,
  dadosVencimento,
  indicadores,
} from '@/lib/mock-data'

export default function IndicadoresPage() {
  // Transform data for donut charts
  const equipesDonutData = dadosEquipes.map((e) => ({
    name: e.equipe,
    value: e.total,
    color: e.cor,
    percentual: e.variacao,
  }))

  const clientesDonutData = dadosClientes.map((c) => ({
    name: c.cliente,
    value: c.total,
    color: c.cor,
    percentual: c.percentual,
  }))

  const vencimentoDonutData = dadosVencimento.map((v) => ({
    name: v.categoria,
    value: v.valor,
    color: v.cor,
    percentual: v.percentual,
  }))

  // Transform data for tables
  const agentesTableData = dadosAgentes.map((a) => ({
    agente: a.agente,
    total: a.total,
    variacao: a.variacao,
  }))

  const equipesTableData = dadosEquipesResolucao.map((e) => ({
    equipe: e.equipe,
    total: e.total,
    variacao: e.variacao,
  }))

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <select className="px-4 py-2 text-sm border border-border rounded-md bg-background">
              <option>Painel de SLA</option>
              <option>Painel Geral</option>
              <option>Painel de Equipes</option>
            </select>
          </div>
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 bg-muted/20">
          {/* Row 1: SLA Stacked Bar Chart */}
          <SLAStackedBarChart />

          {/* Row 2: Line Chart */}
          <TicketsLineChart />

          {/* Row 3: Donut Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DonutChart
              title="Tickets resolvidos por equipes - Donuts"
              data={equipesDonutData}
              period="Mês passado"
            />
            <DonutChart
              title="Tickets por cliente (Organização)"
              data={clientesDonutData}
              period="Este mês"
            />
            <DonutChart
              title="Tickets resolvidos por vencimento - Pizza"
              data={vencimentoDonutData}
              period="Este mês"
            />
          </div>

          {/* Row 4: Tables and KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Tables */}
            <div className="space-y-6">
              <DataTable
                title="Tickets resolvidos por agente responsável - Listagem"
                columns={[
                  { key: 'agente', label: 'Agente' },
                  { key: 'total', label: 'Total', align: 'right' },
                  { key: 'variacao', label: 'Variação', align: 'right' },
                ]}
                data={agentesTableData}
                period="Este mês"
              />
              <DataTable
                title="Tickets resolvidos por equipe responsável - Listagem"
                columns={[
                  { key: 'equipe', label: 'Equipe' },
                  { key: 'total', label: 'Total', align: 'right' },
                  { key: 'variacao', label: 'Variação', align: 'right' },
                ]}
                data={equipesTableData}
                period="Mês passado"
              />
            </div>

            {/* Right: KPIs */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Principais indicadores</h3>
              <div className="grid grid-cols-1 gap-4">
                {indicadores.map((indicador) => (
                  <KPICard
                    key={indicador.nome}
                    title={indicador.nome}
                    description={indicador.descricao}
                    value={indicador.valor}
                    variation={indicador.variacao}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
