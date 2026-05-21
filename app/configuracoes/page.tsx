'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Plus, ChevronRight, Pencil, Trash2, Loader2, Tag, Clock, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Categoria {
  id: string
  nome: string
  descricao?: string
  parentId?: string | null
  nivel: number // 0=raiz, 1=sub, 2=folha
  cor?: string
  criadoEm?: any
}

interface SLA {
  id: string
  categoriaId: string
  categoriaNome: string
  horasUteis: number
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  criadoEm?: any
}

const CORES = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#10b981', label: 'Verde' },
  { value: '#f59e0b', label: 'Amarelo' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#06b6d4', label: 'Ciano' },
  { value: '#f97316', label: 'Laranja' },
  { value: '#64748b', label: 'Cinza' },
]

const PRIORIDADE_LABELS = {
  baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente',
}

export default function ConfiguracoesPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [slas, setSlas] = useState<SLA[]>([])
  const [loading, setLoading] = useState(true)

  // Modal categoria
  const [modalCat, setModalCat] = useState(false)
  const [editandoCat, setEditandoCat] = useState<Categoria | null>(null)
  const [salvandoCat, setSalvandoCat] = useState(false)
  const [formCat, setFormCat] = useState({ nome: '', descricao: '', parentId: '', cor: '#3b82f6' })

  // Modal SLA
  const [modalSla, setModalSla] = useState(false)
  const [editandoSla, setEditandoSla] = useState<SLA | null>(null)
  const [salvandoSla, setSalvandoSla] = useState(false)
  const [formSla, setFormSla] = useState({ categoriaId: '', horasUteis: 24, prioridade: 'media' as SLA['prioridade'] })

  useEffect(() => {
    carregarTudo()
  }, [])

  async function carregarTudo() {
    try {
      const [catSnap, slaSnap] = await Promise.all([
        getDocs(query(collection(db, 'categorias'), orderBy('criadoEm', 'asc'))),
        getDocs(query(collection(db, 'slas'), orderBy('criadoEm', 'asc'))),
      ])
      setCategorias(catSnap.docs.map(d => ({ id: d.id, ...d.data() } as Categoria)))
      setSlas(slaSnap.docs.map(d => ({ id: d.id, ...d.data() } as SLA)))
    } catch { }
    finally { setLoading(false) }
  }

  // ===== CATEGORIAS =====
  function abrirNovaCat(parentId?: string) {
    setEditandoCat(null)
    const parent = categorias.find(c => c.id === parentId)
    setFormCat({ nome: '', descricao: '', parentId: parentId || '', cor: '#3b82f6' })
    setModalCat(true)
  }

  function abrirEditarCat(cat: Categoria) {
    setEditandoCat(cat)
    setFormCat({ nome: cat.nome, descricao: cat.descricao || '', parentId: cat.parentId || '', cor: cat.cor || '#3b82f6' })
    setModalCat(true)
  }

  async function salvarCat() {
    if (!formCat.nome.trim()) return toast.error('Nome obrigatório')
    setSalvandoCat(true)
    try {
      const parent = categorias.find(c => c.id === formCat.parentId)
      const nivel = formCat.parentId ? (parent?.nivel ?? 0) + 1 : 0
      const dados = {
        nome: formCat.nome,
        descricao: formCat.descricao || null,
        parentId: formCat.parentId || null,
        nivel,
        cor: formCat.cor,
      }
      if (editandoCat) {
        await updateDoc(doc(db, 'categorias', editandoCat.id), dados)
        setCategorias(prev => prev.map(c => c.id === editandoCat.id ? { ...c, ...dados } : c))
        toast.success('Categoria atualizada!')
      } else {
        const ref = await addDoc(collection(db, 'categorias'), { ...dados, criadoEm: serverTimestamp() })
        setCategorias(prev => [...prev, { id: ref.id, ...dados, nivel } as Categoria])
        toast.success('Categoria criada!')
      }
      setModalCat(false)
    } catch { toast.error('Erro ao salvar categoria') }
    finally { setSalvandoCat(false) }
  }

  async function excluirCat(cat: Categoria) {
    const temFilhos = categorias.some(c => c.parentId === cat.id)
    if (temFilhos) return toast.error('Remova as subcategorias antes de excluir.')
    if (!confirm(`Excluir a categoria "${cat.nome}"?`)) return
    try {
      await deleteDoc(doc(db, 'categorias', cat.id))
      setCategorias(prev => prev.filter(c => c.id !== cat.id))
      toast.success('Categoria excluída.')
    } catch { toast.error('Erro ao excluir') }
  }

  // ===== SLAs =====
  function abrirNovoSla() {
    setEditandoSla(null)
    setFormSla({ categoriaId: '', horasUteis: 24, prioridade: 'media' })
    setModalSla(true)
  }

  function abrirEditarSla(sla: SLA) {
    setEditandoSla(sla)
    setFormSla({ categoriaId: sla.categoriaId, horasUteis: sla.horasUteis, prioridade: sla.prioridade })
    setModalSla(true)
  }

  async function salvarSla() {
    if (!formSla.categoriaId) return toast.error('Selecione uma categoria')
    setSalvandoSla(true)
    try {
      const cat = categorias.find(c => c.id === formSla.categoriaId)
      const dados = {
        categoriaId: formSla.categoriaId,
        categoriaNome: cat?.nome || '',
        horasUteis: Number(formSla.horasUteis),
        prioridade: formSla.prioridade,
      }
      if (editandoSla) {
        await updateDoc(doc(db, 'slas', editandoSla.id), dados)
        setSlas(prev => prev.map(s => s.id === editandoSla.id ? { ...s, ...dados } : s))
        toast.success('SLA atualizado!')
      } else {
        const ref = await addDoc(collection(db, 'slas'), { ...dados, criadoEm: serverTimestamp() })
        setSlas(prev => [...prev, { id: ref.id, ...dados } as SLA])
        toast.success('SLA criado!')
      }
      setModalSla(false)
    } catch { toast.error('Erro ao salvar SLA') }
    finally { setSalvandoSla(false) }
  }

  async function excluirSla(sla: SLA) {
    if (!confirm(`Excluir SLA da categoria "${sla.categoriaNome}"?`)) return
    try {
      await deleteDoc(doc(db, 'slas', sla.id))
      setSlas(prev => prev.filter(s => s.id !== sla.id))
      toast.success('SLA excluído.')
    } catch { toast.error('Erro ao excluir') }
  }

  // Renderizar árvore de categorias
  const raizes = categorias.filter(c => !c.parentId)

  function renderCategorias(items: Categoria[], nivel = 0): React.ReactNode {
    return items.map(cat => {
      const filhos = categorias.filter(c => c.parentId === cat.id)
      return (
        <div key={cat.id}>
          <div className={cn(
            'flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 group transition-colors',
            nivel > 0 && 'ml-6 border-l border-border pl-4'
          )}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.cor || '#3b82f6' }} />
            <span className="text-sm flex-1">{cat.nome}</span>
            {cat.descricao && (
              <span className="text-xs text-muted-foreground hidden group-hover:block truncate max-w-[200px]">
                {cat.descricao}
              </span>
            )}
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Nível {cat.nivel + 1}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              {cat.nivel < 2 && (
                <button
                  onClick={() => abrirNovaCat(cat.id)}
                  className="p-1 rounded hover:bg-primary/10 hover:text-primary text-muted-foreground"
                  title="Adicionar subcategoria"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => abrirEditarCat(cat)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => excluirCat(cat)} className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {filhos.length > 0 && renderCategorias(filhos, nivel + 1)}
        </div>
      )
    })
  }

  // Categorias folha para SLA (nível mais profundo ou qualquer uma)
  const categoriasParaSla = categorias

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-border">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" /> Configurações
          </h1>
          <p className="text-sm text-muted-foreground">Gerencie categorias, SLAs e regras da plataforma</p>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          <Tabs defaultValue="categorias">
            <TabsList className="mb-6">
              <TabsTrigger value="categorias" className="gap-2">
                <Tag className="h-4 w-4" /> Categorias
              </TabsTrigger>
              <TabsTrigger value="slas" className="gap-2">
                <Clock className="h-4 w-4" /> SLAs
              </TabsTrigger>
            </TabsList>

            {/* CATEGORIAS */}
            <TabsContent value="categorias">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold">Categorias de atendimento</h2>
                  <p className="text-xs text-muted-foreground">Organize os tickets em até 3 níveis de categorias</p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => abrirNovaCat()}>
                  <Plus className="h-4 w-4" /> Nova categoria
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : raizes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2 border border-dashed border-border rounded-lg">
                  <Tag className="h-8 w-8 opacity-20" />
                  <p className="text-sm">Nenhuma categoria criada ainda</p>
                  <Button size="sm" variant="outline" onClick={() => abrirNovaCat()}>Criar primeira categoria</Button>
                </div>
              ) : (
                <div className="rounded-lg border border-border p-3 space-y-1">
                  {renderCategorias(raizes)}
                </div>
              )}
            </TabsContent>

            {/* SLAs */}
            <TabsContent value="slas">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold">Regras de SLA</h2>
                  <p className="text-xs text-muted-foreground">Configure o tempo máximo de resolução por categoria e prioridade</p>
                </div>
                <Button size="sm" className="gap-2" onClick={abrirNovoSla}>
                  <Plus className="h-4 w-4" /> Novo SLA
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : slas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2 border border-dashed border-border rounded-lg">
                  <Clock className="h-8 w-8 opacity-20" />
                  <p className="text-sm">Nenhuma regra de SLA configurada</p>
                  <Button size="sm" variant="outline" onClick={abrirNovoSla}>Criar primeiro SLA</Button>
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Categoria</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Tempo de resolução</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {slas.map(sla => (
                        <TableRow key={sla.id} className="hover:bg-muted/30 group">
                          <TableCell className="font-medium text-sm">{sla.categoriaNome}</TableCell>
                          <TableCell>
                            <span className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                              sla.prioridade === 'urgente' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              sla.prioridade === 'alta' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                              sla.prioridade === 'media' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                              'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            )}>
                              {PRIORIDADE_LABELS[sla.prioridade]}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            <span className="font-medium">{sla.horasUteis}h</span>
                            <span className="text-muted-foreground ml-1">úteis</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => abrirEditarSla(sla)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => excluirSla(sla)} className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal Categoria */}
      <Dialog open={modalCat} onOpenChange={setModalCat}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editandoCat ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input placeholder="Ex: Suporte PABX" value={formCat.nome} onChange={e => setFormCat(p => ({ ...p, nome: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input placeholder="Descreva brevemente esta categoria" value={formCat.descricao} onChange={e => setFormCat(p => ({ ...p, descricao: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Categoria pai</Label>
              <Select value={formCat.parentId || '__none__'} onValueChange={v => setFormCat(p => ({ ...p, parentId: v === '__none__' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Nenhuma (categoria raiz)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhuma (categoria raiz)</SelectItem>
                  {categorias.filter(c => c.nivel < 2 && c.id !== editandoCat?.id).map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {'→ '.repeat(c.nivel)}{c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cor de identificação</Label>
              <div className="flex flex-wrap gap-2">
                {CORES.map(cor => (
                  <button
                    key={cor.value}
                    onClick={() => setFormCat(p => ({ ...p, cor: cor.value }))}
                    className={cn(
                      'w-7 h-7 rounded-full border-2 transition-all',
                      formCat.cor === cor.value ? 'border-foreground scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: cor.value }}
                    title={cor.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCat(false)}>Cancelar</Button>
            <Button onClick={salvarCat} disabled={salvandoCat}>
              {salvandoCat ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal SLA */}
      <Dialog open={modalSla} onOpenChange={setModalSla}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editandoSla ? 'Editar SLA' : 'Novo SLA'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={formSla.categoriaId} onValueChange={v => setFormSla(p => ({ ...p, categoriaId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar categoria..." /></SelectTrigger>
                <SelectContent>
                  {categoriasParaSla.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {'→ '.repeat(c.nivel)}{c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={formSla.prioridade} onValueChange={v => setFormSla(p => ({ ...p, prioridade: v as SLA['prioridade'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tempo de resolução (horas úteis) *</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={720}
                  value={formSla.horasUteis}
                  onChange={e => setFormSla(p => ({ ...p, horasUteis: Number(e.target.value) }))}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">horas úteis</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Exemplos: 4h = urgente, 8h = alta, 24h = média, 72h = baixa
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalSla(false)}>Cancelar</Button>
            <Button onClick={salvarSla} disabled={salvandoSla}>
              {salvandoSla ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
