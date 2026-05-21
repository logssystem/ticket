'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Loader2, Ticket, CheckCircle, Clock, AlertTriangle, Users, TrendingUp } from 'lucide-react'

interface Stats {
  totalAbertos: number
  totalResolvidos: number
  totalVencidos: number
  totalAgentes: number
  porCaixa: { nome: string; count: number }[]
  porAgente: { nome: string; count: number }[]
}

const CAIXAS = [
  'triagem', 'suporte-pabx', 'suporte-omni', 'comercial',
  'onboarding', 'financeiro', 'desenvolvimento', 'projetos', 'operacao-assistida'
]

const CAIXA_LABELS: Record<string, string> = {
  'triagem': 'Triagem',
  'suporte-pabx': 'Suporte PABX',
  'suporte-omni': 'Suporte Omni',
  'comercial': 'Comercial',
  'onboarding': 'Onboarding',
  'financeiro': 'Financeiro',
  'desenvolvimento': 'Desenvolvimento',
  'projetos': 'Projetos',
  'operacao-assistida': 'Op. Assistida',
}

export default function IndicadoresPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarStats() }, [])

  async function carregarStats() {
    try {
      const [ticketsSnap, usuariosSnap] = await Promise.all([
        getDocs(collection(db, 'tickets')),
        getDocs(query(collection(db, 'usuarios'), where('role', '==', 'agente'))),
      ])

      const tickets = ticketsSnap.docs.map(d => d.data())
      const agentes = usuariosSnap.docs.map(d => d.data())

      const abertos = ['novo', 'em_andamento', 'pendente']
      const totalAbertos = tickets.filter(t => abertos.includes(t.status)).length
      const totalResolvidos = tickets.filter(t => ['resolvido', 'fechado'].includes(t.status)).length
      const totalVencidos = tickets.filter(t => t.sla === 'vencido').length

      const porCaixa = CAIXAS.map(id => ({
        nome: CAIXA_LABELS[id] || id,
        count: tickets.filter(t => t.caixa === id).length,
      })).filter(c => c.count > 0).sort((a, b) => b.count - a.count)

      const porAgente: { nome: string; count: number }[] = agentes.map(a => ({
        nome: a.nome,
        count: tickets.filter(t => t.agenteUid === a.uid && ['resolvido', 'fechado'].includes(t.status)).length,
      })).sort((a, b) => b.count - a.count)

      setStats({
        totalAbertos, totalResolvidos, totalVencidos,
        totalAgentes: agentes.length,
        porCaixa, porAgente,
      })
    } catch {
      setStats({ totalAbertos: 0, totalResolvidos: 0, totalVencidos: 0, totalAgentes: 0, porCaixa: [], porAgente: [] })
    } finally { setLoading(false) }
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-border">
          <h1 className="text-lg font-semibold">Indicadores</h1>
          <p className="text-sm text-muted-foreground">Visão geral da operação</p>
        </div>

        <div className="flex-1 overflow-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  icon={<Ticket className="h-5 w-5 text-blue-400" />}
                  label="Tickets abertos"
                  value={stats.totalAbertos}
                  cor="blue"
                />
                <KPICard
                  icon={<CheckCircle className="h-5 w-5 text-green-400" />}
                  label="Resolvidos"
                  value={stats.totalResolvidos}
                  cor="green"
                />
                <KPICard
                  icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
                  label="SLA vencido"
                  value={stats.totalVencidos}
                  cor="red"
                />
                <KPICard
                  icon={<Users className="h-5 w-5 text-purple-400" />}
                  label="Agentes ativos"
                  value={stats.totalAgentes}
                  cor="purple"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tickets por caixa */}
                <div className="rounded-lg border border-border p-5">
                  <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Tickets por caixa
                  </h2>
                  {stats.porCaixa.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum ticket registrado ainda</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.porCaixa.map(c => {
                        const max = stats.porCaixa[0]?.count || 1
                        const pct = Math.round((c.count / max) * 100)
                        return (
                          <div key={c.nome}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>{c.nome}</span>
                              <span className="font-medium">{c.count}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Ranking agentes */}
                <div className="rounded-lg border border-border p-5">
                  <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Ranking de agentes (tickets resolvidos)
                  </h2>
                  {stats.porAgente.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum agente cadastrado ainda</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.porAgente.map((a, i) => (
                        <div key={a.nome} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>{a.nome}</span>
                              <span className="font-medium">{a.count}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-green-500 transition-all"
                                style={{ width: `${stats.porAgente[0]?.count ? Math.round((a.count / stats.porAgente[0].count) * 100) : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Empty state message when no data */}
              {stats.totalAbertos === 0 && stats.totalResolvidos === 0 && (
                <div className="rounded-lg border border-border border-dashed p-8 text-center text-muted-foreground">
                  <TrendingUp className="h-10 w-10 opacity-20 mx-auto mb-3" />
                  <p className="text-sm font-medium">Nenhum dado disponível ainda</p>
                  <p className="text-xs mt-1">Os indicadores serão preenchidos conforme os tickets forem criados</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </AppLayout>
  )
}

function KPICard({ icon, label, value, cor }: {
  icon: React.ReactNode
  label: string
  value: number
  cor: 'blue' | 'green' | 'red' | 'purple'
}) {
  const bg: Record<string, string> = {
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    red: 'bg-red-500/10',
    purple: 'bg-purple-500/10',
  }
  return (
    <div className="rounded-lg border border-border p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bg[cor]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
