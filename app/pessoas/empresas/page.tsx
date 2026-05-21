'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, deleteDoc, updateDoc, query, orderBy, serverTimestamp, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Search, Building2, Loader2, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export interface Empresa {
  id?: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  telefone: string
  dominio: string
  criadoEm?: any
}

const emptyForm: Omit<Empresa, 'id' | 'criadoEm'> = {
  razaoSocial: '', nomeFantasia: '', cnpj: '', telefone: '', dominio: '',
}

function formatCNPJ(value: string) {
  return value.replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Empresa | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { carregarEmpresas() }, [])

  async function carregarEmpresas() {
    try {
      const q = query(collection(db, 'empresas'), orderBy('criadoEm', 'desc'))
      const snap = await getDocs(q)
      setEmpresas(snap.docs.map(d => ({ id: d.id, ...d.data() } as Empresa)))
    } catch { toast.error('Erro ao carregar empresas') }
    finally { setLoading(false) }
  }

  function abrirNova() {
    setEditando(null)
    setForm(emptyForm)
    setErros({})
    setModalAberto(true)
  }

  function abrirEditar(empresa: Empresa) {
    setEditando(empresa)
    setForm({ razaoSocial: empresa.razaoSocial, nomeFantasia: empresa.nomeFantasia, cnpj: empresa.cnpj, telefone: empresa.telefone || '', dominio: empresa.dominio || '' })
    setErros({})
    setModalAberto(true)
  }

  function validar() {
    const e: Record<string, string> = {}
    if (!form.razaoSocial.trim()) e.razaoSocial = 'Obrigatório'
    if (!form.cnpj.trim()) e.cnpj = 'Obrigatório'
    if (form.cnpj.replace(/\D/g, '').length !== 14) e.cnpj = 'CNPJ inválido'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function salvar() {
    if (!validar()) return
    setSalvando(true)
    try {
      if (editando?.id) {
        await updateDoc(doc(db, 'empresas', editando.id), { ...form })
        setEmpresas(prev => prev.map(e => e.id === editando.id ? { ...e, ...form } : e))
        toast.success('Empresa atualizada!')
      } else {
        const ref = await addDoc(collection(db, 'empresas'), { ...form, criadoEm: serverTimestamp() })
        setEmpresas(prev => [{ ...form, id: ref.id }, ...prev])
        toast.success('Empresa cadastrada!')
      }
      setModalAberto(false)
    } catch { toast.error('Erro ao salvar empresa') }
    finally { setSalvando(false) }
  }

  async function excluir(id: string, nome: string) {
    if (!confirm(`Excluir a empresa "${nome}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteDoc(doc(db, 'empresas', id))
      setEmpresas(prev => prev.filter(e => e.id !== id))
      toast.success('Empresa excluída.')
    } catch { toast.error('Erro ao excluir empresa') }
  }

  const filtradas = empresas.filter(e =>
    e.razaoSocial.toLowerCase().includes(search.toLowerCase()) ||
    e.nomeFantasia?.toLowerCase().includes(search.toLowerCase()) ||
    e.cnpj.includes(search)
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold">Empresas</h2>
          <p className="text-sm text-muted-foreground">{empresas.length} empresa{empresas.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={abrirNova} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Nova empresa
        </Button>
      </div>

      <div className="px-6 py-3 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CNPJ..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
            <Building2 className="h-10 w-10 opacity-20" />
            <p className="text-sm">Nenhuma empresa cadastrada</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Razão Social</TableHead>
                  <TableHead>Nome Fantasia</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Domínio</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map(e => (
                  <TableRow key={e.id} className="hover:bg-muted/30 group">
                    <TableCell className="font-medium text-sm">{e.razaoSocial}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.nomeFantasia || '—'}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{e.cnpj}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.telefone || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.dominio || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => abrirEditar(e)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => excluir(e.id!, e.razaoSocial)} className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground">
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
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar empresa' : 'Nova empresa'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Razão Social *</Label>
              <Input placeholder="ERA Tecnologia Ltda" value={form.razaoSocial} onChange={e => setForm(p => ({ ...p, razaoSocial: e.target.value }))} />
              {erros.razaoSocial && <p className="text-xs text-destructive">{erros.razaoSocial}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input placeholder="ERA" value={form.nomeFantasia} onChange={e => setForm(p => ({ ...p, nomeFantasia: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>CNPJ *</Label>
                <Input placeholder="00.000.000/0000-00" value={form.cnpj} onChange={e => setForm(p => ({ ...p, cnpj: formatCNPJ(e.target.value) }))} />
                {erros.cnpj && <p className="text-xs text-destructive">{erros.cnpj}</p>}
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input placeholder="(19) 3199-0500" value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Domínio</Label>
                <Input placeholder="era.com.br" value={form.dominio} onChange={e => setForm(p => ({ ...p, dominio: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
