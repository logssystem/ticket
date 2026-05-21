'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { criarNotificacao } from '@/lib/notificacoes'
import { toast } from 'sonner'

interface NovoTicketModalProps {
  aberto: boolean
  onFechar: () => void
  onCriado?: () => void
}

const CATEGORIAS = [
  { value: 'problema', label: 'Problema' },
  { value: 'duvida', label: 'Dúvida' },
  { value: 'solicitacao', label: 'Solicitação' },
  { value: 'melhoria', label: 'Melhoria' },
  { value: 'financeiro', label: 'Financeiro' },
]

const PRIORIDADES = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

async function proximoNumeroTicket(): Promise<number> {
  try {
    const snap = await getDocs(query(collection(db, 'tickets'), orderBy('numero', 'desc'), limit(1)))
    if (snap.empty) return 100001
    return (snap.docs[0].data().numero || 100000) + 1
  } catch {
    return Date.now()
  }
}

export function NovoTicketModal({ aberto, onFechar, onCriado }: NovoTicketModalProps) {
  const { profile } = useAuth()
  const [salvando, setSalvando] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    assunto: '',
    descricao: '',
    categoria: '',
    prioridade: 'media',
  })

  function validar() {
    const e: Record<string, string> = {}
    if (!form.assunto.trim()) e.assunto = 'Obrigatório'
    if (!form.descricao.trim()) e.descricao = 'Obrigatório'
    if (!form.categoria) e.categoria = 'Selecione uma categoria'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function salvar() {
    if (!validar()) return
    if (!profile?.uid) { toast.error("Sessão expirada. Faça login novamente."); return }
    setSalvando(true)
    try {
      const numero = await proximoNumeroTicket()
      const ticket = {
        numero,
        assunto: form.assunto,
        descricao: form.descricao,
        categoria: form.categoria,
        prioridade: form.prioridade,
        status: 'novo',
        caixa: 'triagem', // Todo ticket novo vai para triagem
        sla: 'nao_definido',
        clienteUid: profile!.uid,
        clienteNome: profile!.nome,
        clienteEmail: profile!.email,
        empresaId: (profile as any)?.empresaId ?? null,
        empresaNome: (profile as any)?.empresaNome ?? null,
        agenteUid: null,
        agenteNome: null,
        abertoEm: serverTimestamp(),
        vencimentoEm: null,
        resolvidoEm: null,
        atualizadoEm: serverTimestamp(),
        historico: [],
      }

      const ref = await addDoc(collection(db, 'tickets'), ticket)

      // Notifica agentes/admin
      await criarNotificacao({
        tipo: 'novo_ticket',
        titulo: 'Novo ticket aberto',
        mensagem: `#${numero} — ${form.assunto} (${profile?.nome})`,
        para: 'todos',
        link: `/tickets/${ref.id}`,
      })

      toast.success(`Ticket #${numero} aberto com sucesso!`)
      setForm({ assunto: '', descricao: '', categoria: '', prioridade: 'media' })
      setErros({})
      onFechar()
      onCriado?.()
    } catch (e) {
      console.error(e)
      toast.error('Erro ao criar ticket. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  function fechar() {
    if (salvando) return
    setForm({ assunto: '', descricao: '', categoria: '', prioridade: 'media' })
    setErros({})
    onFechar()
  }

  return (
    <Dialog open={aberto} onOpenChange={fechar}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo ticket</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Assunto */}
          <div className="space-y-2">
            <Label>Assunto *</Label>
            <Input
              placeholder="Descreva brevemente o problema"
              value={form.assunto}
              onChange={e => setForm(p => ({ ...p, assunto: e.target.value }))}
            />
            {erros.assunto && <p className="text-xs text-destructive">{erros.assunto}</p>}
          </div>

          {/* Categoria + Prioridade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={form.categoria} onValueChange={v => setForm(p => ({ ...p, categoria: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.categoria && <p className="text-xs text-destructive">{erros.categoria}</p>}
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={form.prioridade} onValueChange={v => setForm(p => ({ ...p, prioridade: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Textarea
              placeholder="Descreva detalhadamente o que está acontecendo, incluindo passos para reproduzir o problema..."
              value={form.descricao}
              onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
              rows={5}
              className="resize-none"
            />
            {erros.descricao && <p className="text-xs text-destructive">{erros.descricao}</p>}
          </div>

          {/* Info caixa */}
          <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
            📥 Seu ticket será enviado para a <strong>Triagem</strong> e direcionado para o setor responsável.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={fechar} disabled={salvando}>Cancelar</Button>
          <Button onClick={salvar} disabled={salvando}>
            {salvando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : 'Abrir ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
