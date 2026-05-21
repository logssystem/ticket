'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  doc, getDoc, updateDoc, collection, addDoc, getDocs,
  query, orderBy, serverTimestamp, onSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, ArrowLeft, Bold, Italic, Underline, Paperclip, Smile } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo', color: 'bg-blue-500 text-white' },
  { value: 'em_andamento', label: 'Em atendimento', color: 'bg-yellow-500 text-white' },
  { value: 'pendente', label: 'Pendente', color: 'bg-orange-500 text-white' },
  { value: 'resolvido', label: 'Resolvido', color: 'bg-green-500 text-white' },
  { value: 'fechado', label: 'Fechado', color: 'bg-gray-500 text-white' },
]

const CAIXAS = [
  { value: 'triagem', label: 'Triagem' },
  { value: 'suporte-pabx', label: 'Suporte PABX' },
  { value: 'suporte-omni', label: 'Suporte Omni' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'desenvolvimento', label: 'Desenvolvimento' },
  { value: 'projetos', label: 'Projetos' },
  { value: 'operacao-assistida', label: 'Op. Assistida' },
]

function getInitials(name?: string) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function AcaoCard({ acao }: { acao: any }) {
  const isInternal = acao.tipo === 'interna'
  const isSistema = acao.tipo === 'sistema'

  if (isSistema) return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-border" />
      <p className="text-xs text-muted-foreground italic px-2">{acao.conteudo}</p>
      <div className="h-px flex-1 bg-border" />
    </div>
  )

  return (
    <div className="flex gap-3">
      <Avatar className="h-10 w-10 flex-shrink-0 mt-0.5">
        <AvatarFallback className={cn('text-sm font-bold',
          isInternal ? 'bg-orange-500/20 text-orange-400' : 'bg-primary/20 text-primary'
        )}>
          {getInitials(acao.autorNome)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className={cn('rounded-lg overflow-hidden border',
          isInternal ? 'border-orange-400/40' : 'border-border'
        )}>
          <div className={cn('flex items-center justify-between px-4 py-2.5 border-b',
            isInternal ? 'bg-orange-500/10 border-orange-400/30' : 'bg-muted/50 border-border'
          )}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold">{acao.autorNome}</span>
              <span className="text-xs text-muted-foreground">
                {acao.criadoEm ? format(acao.criadoEm, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''}
              </span>
              <span className={cn('text-xs font-medium',
                isInternal ? 'text-orange-400' : 'text-muted-foreground'
              )}>
                {isInternal ? '🔒 Ação interna' : 'Ação pública'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{acao.index}</span>
          </div>
          <div className={cn('px-4 py-4 text-sm leading-relaxed whitespace-pre-wrap min-h-[50px]',
            isInternal ? 'bg-orange-500/5' : 'bg-card'
          )}>
            {acao.conteudo}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { profile } = useAuth()
  const [ticket, setTicket] = useState<any>(null)
  const [acoes, setAcoes] = useState<any[]>([])
  const [agentes, setAgentes] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'publica' | 'interna'>('publica')
  const [resposta, setResposta] = useState('')
  const [filtros, setFiltros] = useState({ publicas: true, internas: true, sistema: true })
  const endRef = useRef<HTMLDivElement>(null)

  const isAgentOrAdmin = profile?.role === 'agente' || profile?.role === 'admin'

  useEffect(() => { carregarDados() }, [id])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [acoes])

  async function carregarDados() {
    try {
      const [ticketDoc, agentesSnap, catSnap] = await Promise.all([
        getDoc(doc(db, 'tickets', id)),
        getDocs(query(collection(db, 'usuarios'), orderBy('nome'))),
        getDocs(collection(db, 'categorias')),
      ])
      if (!ticketDoc.exists()) { router.push('/tickets'); return }
      const data = ticketDoc.data()
      setTicket({
        id: ticketDoc.id, ...data,
        abertoEm: data.abertoEm?.toDate?.() ?? new Date(),
        vencimentoEm: data.vencimentoEm?.toDate?.() ?? null,
      })
      setAgentes(agentesSnap.docs
        .filter(d => ['agente', 'admin'].includes(d.data().role))
        .map(d => ({ uid: d.id, ...d.data() }))
      )
      setCategorias(catSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      const q = query(collection(db, 'tickets', id, 'acoes'), orderBy('criadoEm', 'asc'))
      onSnapshot(q, snap => {
        setAcoes(snap.docs.map((d, i) => ({
          id: d.id, ...d.data(),
          criadoEm: d.data().criadoEm?.toDate?.() ?? new Date(),
          index: i + 1,
        })))
      })
      setLoading(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  async function aplicarSLA(categoriaId: string) {
    if (!categoriaId || categoriaId === '__none__') return
    try {
      // Busca SLA da categoria
      const slaSnap = await getDocs(collection(db, 'slas'))
      const sla = slaSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .find((s: any) => s.categoriaId === categoriaId)
      if (!sla) return
      // Calcula vencimento a partir da abertura do ticket
      const horasUteis = (sla as any).horasUteis || 24
      const abertura = ticket?.abertoEm ? new Date(ticket.abertoEm) : new Date()
      const vencimento = new Date(abertura.getTime() + horasUteis * 60 * 60 * 1000)
      await updateDoc(doc(db, 'tickets', id), {
        vencimentoEm: vencimento,
        sla: 'no_prazo',
        atualizadoEm: serverTimestamp(),
      })
      setTicket((prev: any) => ({ ...prev, vencimentoEm: vencimento, sla: 'no_prazo' }))
      toast.success('SLA aplicado: ' + horasUteis + 'h úteis')
    } catch (e) { console.error(e) }
  }

  async function atualizarCampo(campo: string, valor: any) {
    try {
      await updateDoc(doc(db, 'tickets', id), { [campo]: valor, atualizadoEm: serverTimestamp() })
      setTicket((prev: any) => ({ ...prev, [campo]: valor }))
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  async function enviarResposta() {
    if (!resposta.trim() || !profile) return
    setEnviando(true)
    try {
      await addDoc(collection(db, 'tickets', id, 'acoes'), {
        tipo: isAgentOrAdmin ? abaAtiva : 'publica',
        conteudo: resposta,
        autorNome: profile.nome,
        autorUid: profile.uid,
        criadoEm: serverTimestamp(),
      })
      if (ticket?.status === 'novo') await atualizarCampo('status', 'em_andamento')
      await updateDoc(doc(db, 'tickets', id), { atualizadoEm: serverTimestamp() })
      setResposta('')
      toast.success('Ação adicionada!')
    } catch {
      toast.error('Erro ao enviar')
    } finally {
      setEnviando(false)
    }
  }

  const statusAtual = STATUS_OPTIONS.find(s => s.value === ticket?.status)

  // Cliente só vê ações públicas
  const acoesFiltradas = acoes.filter(a => {
    if (!isAgentOrAdmin) return a.tipo === 'publica' || a.tipo === 'sistema'
    if (a.tipo === 'publica' && !filtros.publicas) return false
    if (a.tipo === 'interna' && !filtros.internas) return false
    if (a.tipo === 'sistema' && !filtros.sistema) return false
    return true
  })

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </AppLayout>
  )

  if (!ticket) return null

  return (
    <AppLayout>
      <div className="flex h-full overflow-hidden">

        {/* Painel lateral - só agente/admin */}
        {isAgentOrAdmin && (
          <div className="w-72 border-r border-border bg-card overflow-y-auto flex-shrink-0 text-sm">

            {/* Solicitante */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Solicitante</span>
                <button className="text-xs text-primary hover:underline">Colocar-me como solicitante</button>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{ticket.clienteNome}</p>
                  <p className="text-xs text-muted-foreground truncate">{ticket.clienteEmail}</p>
                  {ticket.empresaNome && <p className="text-xs text-muted-foreground truncate">{ticket.empresaNome}</p>}
                </div>
              </div>
            </div>

            {/* Campos */}
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Caixa</label>
                <Select value={ticket.caixa || ''} onValueChange={v => atualizarCampo('caixa', v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{CAIXAS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {categorias.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Categoria</label>
                  <Select value={ticket.categoria || '__none__'} onValueChange={async v => {
                      await atualizarCampo('categoria', v === '__none__' ? null : v)
                      if (v !== '__none__') aplicarSLA(v)
                    }}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhuma</SelectItem>
                      {categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Previsão de solução</label>
                  {ticket.categoria && (
                    <button
                      onClick={() => aplicarSLA(ticket.categoria)}
                      className="text-xs text-primary hover:underline"
                    >
                      Aplicar SLA
                    </button>
                  )}
                </div>
                {ticket.vencimentoEm ? (() => {
                  const agora = new Date()
                  const venc = new Date(ticket.vencimentoEm)
                  const abertura = ticket.abertoEm ? new Date(ticket.abertoEm) : venc
                  const totalMs = venc.getTime() - abertura.getTime()
                  const diffMs = venc.getTime() - agora.getTime()
                  const diffHoras = diffMs / (1000 * 60 * 60)
                  const vencido = diffMs < 0
                  // Amarelo quando falta menos de 25% do tempo total (mínimo 1h)
                  const thresholdMs = Math.max(totalMs * 0.25, 60 * 60 * 1000)
                  const aVencer = !vencido && diffMs <= thresholdMs
                  return (
                    <div className={cn(
                      'h-9 px-3 flex items-center rounded-md border text-sm font-medium',
                      vencido ? 'border-red-500/40 bg-red-500/10 text-red-400' :
                      aVencer ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400' :
                      'border-green-500/40 bg-green-500/10 text-green-400'
                    )}>
                      {format(venc, "EEEE, dd 'de' MMMM HH:mm", { locale: ptBR })}
                    </div>
                  )
                })() : (
                  <div className="h-9 px-3 flex items-center rounded-md border border-border text-muted-foreground text-sm">
                    Não definido
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Responsável</label>
                  <button
                    onClick={() => { atualizarCampo('agenteUid', profile!.uid); atualizarCampo('agenteNome', profile!.nome) }}
                    className="text-xs text-primary hover:underline"
                  >
                    Atribuir para mim
                  </button>
                </div>
                <Select value={ticket.agenteUid || '__none__'} onValueChange={v => {
                  const ag = agentes.find(a => a.uid === v)
                  atualizarCampo('agenteUid', v === '__none__' ? null : v)
                  atualizarCampo('agenteNome', ag?.nome || null)
                }}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Não atribuído" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Não atribuído</SelectItem>
                    {agentes.map(a => <SelectItem key={a.uid} value={a.uid}>{a.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">Cc</label>
                <Input className="h-9 bg-muted/30 text-muted-foreground cursor-default" value={ticket.clienteEmail || ''} readOnly />
              </div>
            </div>

            {/* Info */}
            <div className="px-4 pb-4 text-xs text-muted-foreground space-y-1 border-t border-border pt-4">
              <p>Aberto em: <span className="text-foreground font-medium">{format(ticket.abertoEm, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span></p>
              <p>Número: <span className="text-foreground font-mono font-medium">#{ticket.numero}</span></p>
            </div>
          </div>
        )}

        {/* Área principal */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Header */}
          <div className="px-6 py-4 border-b border-border bg-card flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <button onClick={() => router.back()} className="p-1.5 rounded hover:bg-muted text-muted-foreground mt-0.5 flex-shrink-0">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-base font-bold truncate">{ticket.assunto}</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ticket aberto via sistema pelo cliente{' '}
                    <span className="font-semibold text-foreground">{ticket.clienteNome}</span>{' '}
                    em {format(ticket.abertoEm, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
              {isAgentOrAdmin ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select value={ticket.status} onValueChange={v => atualizarCampo('status', v)}>
                    <SelectTrigger className={cn('h-9 w-44 text-sm font-bold border-0', statusAtual?.color)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="font-bold">OPÇÕES</Button>
                </div>
              ) : (
                <span className={cn('px-3 py-1.5 rounded text-sm font-bold flex-shrink-0', statusAtual?.color)}>
                  {statusAtual?.label}
                </span>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="border-b border-border bg-card flex-shrink-0">
            {/* Abas - só agente/admin */}
            {isAgentOrAdmin && (
              <div className="flex border-b border-border px-6">
                {([{ key: 'publica', label: 'Ação pública' }, { key: 'interna', label: 'Ação interna' }] as const).map(aba => (
                  <button
                    key={aba.key}
                    onClick={() => setAbaAtiva(aba.key)}
                    className={cn('px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px',
                      abaAtiva === aba.key
                        ? aba.key === 'interna' ? 'border-orange-400 text-orange-400' : 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {aba.label}
                  </button>
                ))}
              </div>
            )}

            {/* Barra de ferramentas - só agente/admin */}
            {isAgentOrAdmin && (
              <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
                {[{ Icon: Bold, label: 'Negrito' }, { Icon: Italic, label: 'Itálico' }, { Icon: Underline, label: 'Sublinhado' }].map(({ Icon, label }) => (
                  <button key={label} title={label} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
                <div className="w-px h-4 bg-border mx-1" />
                <button title="Anexar" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button title="Emoji" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                  <Smile className="h-4 w-4" />
                </button>
              </div>
            )}

            <Textarea
              placeholder={isAgentOrAdmin && abaAtiva === 'interna' ? 'Nota interna — visível apenas para a equipe...' : 'Digite sua resposta...'}
              value={resposta}
              onChange={e => setResposta(e.target.value)}
              rows={isAgentOrAdmin ? 4 : 3}
              className={cn(
                'border-0 rounded-none resize-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0 w-full',
                isAgentOrAdmin && abaAtiva === 'interna' && 'bg-orange-500/5'
              )}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) enviarResposta() }}
            />

            <div className="flex items-center justify-end px-4 py-3 border-t border-border">
              <Button onClick={enviarResposta} disabled={enviando || !resposta.trim()} className="font-bold tracking-wide px-6">
                {enviando && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isAgentOrAdmin ? 'ADICIONAR AÇÃO' : 'Enviar resposta'}
              </Button>
            </div>
          </div>

          {/* Histórico */}
          <div className="flex-1 overflow-y-auto">
            {/* Filtros - só agente/admin */}
            {isAgentOrAdmin && (
              <div className="flex items-center justify-end gap-4 px-6 py-2 border-b border-border bg-muted/20">
                <span className="text-xs text-muted-foreground font-medium">Visualizar:</span>
                {[
                  { key: 'publicas', label: 'Ações públicas' },
                  { key: 'internas', label: 'Ações internas' },
                  { key: 'sistema', label: 'Histórico' },
                ].map(f => (
                  <label key={f.key} className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filtros[f.key as keyof typeof filtros]}
                      onChange={e => setFiltros(p => ({ ...p, [f.key]: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-muted-foreground">{f.label}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Abertura */}
            <div className="flex gap-4 px-6 py-5 border-b border-border">
              <Avatar className="h-10 w-10 flex-shrink-0 mt-0.5">
                <AvatarFallback className="text-sm font-bold bg-blue-500/20 text-blue-400">
                  {getInitials(ticket.clienteNome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/50 border-b border-border">
                    <span className="text-sm font-bold">{ticket.clienteNome}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(ticket.abertoEm, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                    <span className="text-xs text-muted-foreground">Abertura</span>
                  </div>
                  <div className="px-4 py-4 text-sm leading-relaxed whitespace-pre-wrap bg-card">
                    {ticket.descricao}
                  </div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="px-6 py-4 space-y-4">
              {acoesFiltradas.map(acao => <AcaoCard key={acao.id} acao={acao} />)}
              <div ref={endRef} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
