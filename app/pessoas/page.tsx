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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Search, Users, Loader2, Eye, EyeOff, Building2, Trash2, Pencil } from 'lucide-react'
import {
  collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc,
} from 'firebase/firestore'
import { criarUsuarioSemDeslogar } from '@/lib/firebase-admin-helper'
import { db } from '@/lib/firebase'
import { useAuth, UserRole } from '@/lib/auth-context'
import { criarNotificacao } from '@/lib/notificacoes'
import { toast } from 'sonner'
import EmpresasPage from './empresas/page'

interface Usuario {
  uid: string
  nome: string
  email: string
  role: UserRole
  empresaId?: string
  empresaNome?: string
  whatsapp?: string
  criadoEm?: string
}

interface Empresa {
  id: string
  razaoSocial: string
  nomeFantasia?: string
  cnpj: string
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin', agente: 'Agente', cliente: 'Cliente',
}

const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  agente: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cliente: 'bg-green-500/10 text-green-400 border-green-500/20',
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export default function PessoasPage() {
  const { profile } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal criar
  const [modalCriar, setModalCriar] = useState(false)
  const [criando, setCriando] = useState(false)
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirma, setShowConfirma] = useState(false)
  const [errosCriar, setErrosCriar] = useState<Record<string, string>>({})
  const [formCriar, setFormCriar] = useState({
    nome: '', email: '', senha: '', confirmarSenha: '',
    role: 'cliente' as UserRole, empresaId: '', whatsapp: '', dominio: '',
  })

  // Modal editar
  const [modalEditar, setModalEditar] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [formEditar, setFormEditar] = useState({
    nome: '', role: 'cliente' as UserRole, empresaId: '', whatsapp: '',
  })

  useEffect(() => {
    carregarUsuarios()
    carregarEmpresas()
  }, [])

  async function carregarUsuarios() {
    try {
      const snap = await getDocs(query(collection(db, 'usuarios'), orderBy('criadoEm', 'desc')))
      setUsuarios(snap.docs.map(d => d.data() as Usuario))
    } catch { toast.error('Erro ao carregar usuários') }
    finally { setLoading(false) }
  }

  async function carregarEmpresas() {
    try {
      const snap = await getDocs(collection(db, 'empresas'))
      setEmpresas(snap.docs.map(d => ({ id: d.id, ...d.data() } as Empresa)))
    } catch {}
  }

  // === CRIAR ===
  function validarCriar() {
    const e: Record<string, string> = {}
    if (!formCriar.nome.trim()) e.nome = 'Obrigatório'
    if (!formCriar.email.trim()) e.email = 'Obrigatório'
    if (!formCriar.senha) e.senha = 'Obrigatório'
    if (formCriar.senha.length < 6) e.senha = 'Mínimo 6 caracteres'
    if (formCriar.senha !== formCriar.confirmarSenha) e.confirmarSenha = 'Senhas não conferem'
    setErrosCriar(e)
    return Object.keys(e).length === 0
  }

  async function criarUsuario() {
    if (!validarCriar()) return
    setCriando(true)
    try {
      const empresa = empresas.find(e => e.id === formCriar.empresaId)
      const dados = {
        nome: formCriar.nome, email: formCriar.email, role: formCriar.role,
        empresaId: formCriar.empresaId || null,
        empresaNome: empresa?.nomeFantasia || empresa?.razaoSocial || null,
        whatsapp: formCriar.whatsapp || null,
        criadoEm: new Date().toISOString(),
      }
      const uid = await criarUsuarioSemDeslogar(formCriar.email, formCriar.senha, dados)
      const novoUsuario: Usuario = { ...dados, uid, empresaId: dados.empresaId ?? undefined, empresaNome: dados.empresaNome ?? undefined, whatsapp: dados.whatsapp ?? undefined }
      setUsuarios(prev => [novoUsuario, ...prev])
      await criarNotificacao({
        tipo: 'novo_usuario',
        titulo: 'Novo usuário cadastrado',
        mensagem: `${formCriar.nome} (${roleLabels[formCriar.role]}) adicionado por ${profile?.nome}`,
        para: 'todos',
      })
      setModalCriar(false)
      setFormCriar({ nome: '', email: '', senha: '', confirmarSenha: '', role: 'cliente', empresaId: '', whatsapp: '', dominio: '' })
      toast.success(`Usuário ${formCriar.nome} criado!`)
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') setErrosCriar({ email: 'E-mail já cadastrado' })
      else toast.error('Erro ao criar usuário')
    } finally { setCriando(false) }
  }

  // === EDITAR ===
  function abrirEditar(u: Usuario) {
    setEditando(u)
    setFormEditar({ nome: u.nome, role: u.role, empresaId: u.empresaId || '', whatsapp: u.whatsapp || '' })
    setModalEditar(true)
  }

  async function salvarEdicao() {
    if (!editando || !formEditar.nome.trim()) return
    setSalvando(true)
    try {
      const empresa = empresas.find(e => e.id === formEditar.empresaId)
      const dados = {
        nome: formEditar.nome,
        role: formEditar.role,
        empresaId: formEditar.empresaId || null,
        empresaNome: empresa?.nomeFantasia || empresa?.razaoSocial || null,
        whatsapp: formEditar.whatsapp || null,
      }
      await updateDoc(doc(db, 'usuarios', editando.uid), dados)
      setUsuarios(prev => prev.map(u =>
        u.uid === editando.uid ? { ...u, ...dados, empresaNome: dados.empresaNome ?? undefined } : u
      ))
      setModalEditar(false)
      toast.success('Usuário atualizado!')
    } catch { toast.error('Erro ao salvar') }
    finally { setSalvando(false) }
  }

  // === EXCLUIR ===
  async function excluirUsuario(uid: string, nome: string) {
    if (!confirm(`Excluir o usuário "${nome}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteDoc(doc(db, 'usuarios', uid))
      setUsuarios(prev => prev.filter(u => u.uid !== uid))
      toast.success(`Usuário ${nome} excluído.`)
    } catch { toast.error('Erro ao excluir usuário.') }
  }

  const roleOptions = () => profile?.role === 'admin' ? ['agente', 'cliente'] : ['cliente']

  const filtrados = usuarios.filter(u => {
    const match = u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.empresaNome?.toLowerCase().includes(search.toLowerCase())
    if (profile?.role === 'cliente') return match && u.empresaId === (profile as any).empresaId
    return match
  })

  const porRole = (role: UserRole) => filtrados.filter(u => u.role === role)

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <Tabs defaultValue="usuarios" className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-3 border-b border-border">
            <TabsList>
              <TabsTrigger value="usuarios" className="gap-2">
                <Users className="h-4 w-4" /> Usuários
              </TabsTrigger>
              {profile?.role !== 'cliente' && (
                <TabsTrigger value="empresas" className="gap-2">
                  <Building2 className="h-4 w-4" /> Empresas
                </TabsTrigger>
              )}
            </TabsList>
            <Button onClick={() => setModalCriar(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Novo usuário
            </Button>
          </div>

          <TabsContent value="usuarios" className="flex-1 flex flex-col overflow-hidden m-0">
            <div className="px-6 py-3 border-b border-border">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="flex-1 overflow-auto px-6 py-4">
              {loading ? (
                <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <Tabs defaultValue="todos">
                  <TabsList className="mb-4">
                    <TabsTrigger value="todos">Todos ({filtrados.length})</TabsTrigger>
                    {profile?.role === 'admin' && <TabsTrigger value="agentes">Agentes ({porRole('agente').length})</TabsTrigger>}
                    <TabsTrigger value="clientes">Clientes ({porRole('cliente').length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="todos">
                    <TabelaUsuarios usuarios={filtrados} roleColors={roleColors} roleLabels={roleLabels} onEditar={abrirEditar} onExcluir={excluirUsuario} />
                  </TabsContent>
                  <TabsContent value="agentes">
                    <TabelaUsuarios usuarios={porRole('agente')} roleColors={roleColors} roleLabels={roleLabels} onEditar={abrirEditar} onExcluir={excluirUsuario} />
                  </TabsContent>
                  <TabsContent value="clientes">
                    <TabelaUsuarios usuarios={porRole('cliente')} roleColors={roleColors} roleLabels={roleLabels} onEditar={abrirEditar} onExcluir={excluirUsuario} />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </TabsContent>

          <TabsContent value="empresas" className="flex-1 overflow-hidden m-0">
            <EmpresasPage />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Criar */}
      <Dialog open={modalCriar} onOpenChange={setModalCriar}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo usuário</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tipo de usuário</Label>
              <Select value={formCriar.role} onValueChange={v => setFormCriar(p => ({ ...p, role: v as UserRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roleOptions().map(r => <SelectItem key={r} value={r}>{roleLabels[r as UserRole]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nome completo *</Label>
              <Input placeholder="João Silva" value={formCriar.nome} onChange={e => setFormCriar(p => ({ ...p, nome: e.target.value }))} />
              {errosCriar.nome && <p className="text-xs text-destructive">{errosCriar.nome}</p>}
            </div>
            <div className="space-y-2">
              <Label>E-mail *</Label>
              <Input type="email" placeholder="joao@empresa.com.br" value={formCriar.email} onChange={e => setFormCriar(p => ({ ...p, email: e.target.value }))} />
              {errosCriar.email && <p className="text-xs text-destructive">{errosCriar.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Senha *</Label>
                <div className="relative">
                  <Input type={showSenha ? 'text' : 'password'} placeholder="Mín. 6 caracteres" value={formCriar.senha} onChange={e => setFormCriar(p => ({ ...p, senha: e.target.value }))} className="pr-9" />
                  <button type="button" onClick={() => setShowSenha(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errosCriar.senha && <p className="text-xs text-destructive">{errosCriar.senha}</p>}
              </div>
              <div className="space-y-2">
                <Label>Confirmar senha *</Label>
                <div className="relative">
                  <Input type={showConfirma ? 'text' : 'password'} placeholder="Repita" value={formCriar.confirmarSenha} onChange={e => setFormCriar(p => ({ ...p, confirmarSenha: e.target.value }))} className="pr-9" />
                  <button type="button" onClick={() => setShowConfirma(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirma ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errosCriar.confirmarSenha && <p className="text-xs text-destructive">{errosCriar.confirmarSenha}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={formCriar.empresaId} onValueChange={v => setFormCriar(p => ({ ...p, empresaId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar empresa..." /></SelectTrigger>
                <SelectContent>
                  {empresas.map(e => <SelectItem key={e.id} value={e.id}>{e.nomeFantasia || e.razaoSocial} — {e.cnpj}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input placeholder="(19) 99999-9999" value={formCriar.whatsapp} onChange={e => setFormCriar(p => ({ ...p, whatsapp: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCriar(false)}>Cancelar</Button>
            <Button onClick={criarUsuario} disabled={criando}>
              {criando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando...</> : 'Criar usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={modalEditar} onOpenChange={setModalEditar}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar usuário</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{editando ? getInitials(editando.nome) : '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{editando?.nome}</p>
                <p className="text-xs text-muted-foreground">{editando?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome completo *</Label>
              <Input value={formEditar.nome} onChange={e => setFormEditar(p => ({ ...p, nome: e.target.value }))} />
            </div>
            {profile?.role === 'admin' && (
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={formEditar.role} onValueChange={v => setFormEditar(p => ({ ...p, role: v as UserRole }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="agente">Agente</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={formEditar.empresaId || 'none'} onValueChange={v => setFormEditar(p => ({ ...p, empresaId: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar empresa..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem empresa</SelectItem>
                  {empresas.map(e => <SelectItem key={e.id} value={e.id}>{e.nomeFantasia || e.razaoSocial} — {e.cnpj}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input placeholder="(19) 99999-9999" value={formEditar.whatsapp} onChange={e => setFormEditar(p => ({ ...p, whatsapp: e.target.value }))} />
            </div>
            <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado por aqui.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditar(false)}>Cancelar</Button>
            <Button onClick={salvarEdicao} disabled={salvando}>
              {salvando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}

function TabelaUsuarios({ usuarios, roleColors, roleLabels, onEditar, onExcluir }: {
  usuarios: Usuario[]
  roleColors: Record<UserRole, string>
  roleLabels: Record<UserRole, string>
  onEditar: (u: Usuario) => void
  onExcluir: (uid: string, nome: string) => void
}) {
  if (usuarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
        <Users className="h-8 w-8 opacity-30" />
        <p className="text-sm">Nenhum usuário encontrado</p>
      </div>
    )
  }
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Usuário</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map(u => (
            <TableRow key={u.uid} className="hover:bg-muted/30 group">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{getInitials(u.nome)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{u.nome}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{u.empresaNome || '—'}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{u.whatsapp || '—'}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleColors[u.role]}`}>
                  {roleLabels[u.role]}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => onEditar(u)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Editar">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => onExcluir(u.uid, u.nome)} className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
