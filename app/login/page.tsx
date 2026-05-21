'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Ticket, Eye, EyeOff, ArrowLeft, Search } from 'lucide-react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { criarNotificacao } from '@/lib/notificacoes'

type Tela = 'login' | 'cadastro'

function formatCNPJ(value: string) {
  return value.replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
}

export default function LoginPage() {
  const { signIn } = useAuth()
  const [tela, setTela] = useState<Tela>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [cadastro, setCadastro] = useState({ nome: '', email: '', senha: '', confirmarSenha: '', cnpj: '' })
  const [showCSenha, setShowCSenha] = useState(false)
  const [empresaEncontrada, setEmpresaEncontrada] = useState<{ id: string; nome: string } | null>(null)
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false)
  const [errosCadastro, setErrosCadastro] = useState<Record<string, string>>({})
  const [cadastroOk, setCadastroOk] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try { await signIn(email, senha) }
    catch { setError('E-mail ou senha incorretos.') }
    finally { setLoading(false) }
  }

  async function buscarEmpresaPorCNPJ() {
    if (cadastro.cnpj.replace(/\D/g, '').length !== 14) return
    setBuscandoCNPJ(true)
    setEmpresaEncontrada(null)
    try {
      const snap = await getDocs(query(collection(db, 'empresas'), where('cnpj', '==', cadastro.cnpj)))
      if (!snap.empty) {
        const d = snap.docs[0]; const data = d.data()
        setEmpresaEncontrada({ id: d.id, nome: data.nomeFantasia || data.razaoSocial })
      }
    } catch {}
    finally { setBuscandoCNPJ(false) }
  }

  function validarCadastro() {
    const e: Record<string, string> = {}
    if (!cadastro.nome.trim()) e.nome = 'Obrigatório'
    if (!cadastro.email.trim()) e.email = 'Obrigatório'
    if (!cadastro.senha) e.senha = 'Obrigatório'
    if (cadastro.senha.length < 6) e.senha = 'Mínimo 6 caracteres'
    if (cadastro.senha !== cadastro.confirmarSenha) e.confirmarSenha = 'Senhas não conferem'
    setErrosCadastro(e)
    return Object.keys(e).length === 0
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    if (!validarCadastro()) return
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, cadastro.email, cadastro.senha)
      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid, nome: cadastro.nome, email: cadastro.email, role: 'cliente',
        empresaId: empresaEncontrada?.id || null,
        empresaNome: empresaEncontrada?.nome || null,
        criadoEm: new Date().toISOString(),
      })
      await criarNotificacao({
        tipo: 'novo_usuario',
        titulo: 'Novo usuário se cadastrou',
        mensagem: `${cadastro.nome} criou uma conta${empresaEncontrada ? ` (${empresaEncontrada.nome})` : ' (sem empresa vinculada)'}`,
        para: 'todos',
      })
      setCadastroOk(true)
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setErrosCadastro({ email: 'E-mail já cadastrado' })
      else setError('Erro ao criar conta.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
            <Ticket className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">ERA Tickets</h1>
          <p className="text-sm text-muted-foreground">Plataforma de atendimento</p>
        </div>

        {tela === 'login' && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Entrar na conta</CardTitle>
              <CardDescription>Use seu e-mail e senha cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" placeholder="seu@email.com.br" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <div className="relative">
                    <Input type={showSenha ? 'text' : 'password'} placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)} required className="pr-9" />
                    <button type="button" onClick={() => setShowSenha(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Entrando...</> : 'Entrar'}
                </Button>
                <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => { setTela('cadastro'); setError('') }}>
                  Não tenho acesso — criar conta
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {tela === 'cadastro' && !cadastroOk && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setTela('login')} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></button>
                <CardTitle className="text-lg">Criar conta</CardTitle>
              </div>
              <CardDescription>Acesso como cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCadastro} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome completo *</Label>
                  <Input placeholder="João Silva" value={cadastro.nome} onChange={e => setCadastro(p => ({ ...p, nome: e.target.value }))} />
                  {errosCadastro.nome && <p className="text-xs text-destructive">{errosCadastro.nome}</p>}
                </div>
                <div className="space-y-2">
                  <Label>E-mail *</Label>
                  <Input type="email" placeholder="joao@empresa.com.br" value={cadastro.email} onChange={e => setCadastro(p => ({ ...p, email: e.target.value }))} />
                  {errosCadastro.email && <p className="text-xs text-destructive">{errosCadastro.email}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Senha *</Label>
                    <div className="relative">
                      <Input type={showCSenha ? 'text' : 'password'} placeholder="Mín. 6 char" value={cadastro.senha} onChange={e => setCadastro(p => ({ ...p, senha: e.target.value }))} className="pr-9" />
                      <button type="button" onClick={() => setShowCSenha(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showCSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errosCadastro.senha && <p className="text-xs text-destructive">{errosCadastro.senha}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar *</Label>
                    <Input type="password" placeholder="Repita" value={cadastro.confirmarSenha} onChange={e => setCadastro(p => ({ ...p, confirmarSenha: e.target.value }))} />
                    {errosCadastro.confirmarSenha && <p className="text-xs text-destructive">{errosCadastro.confirmarSenha}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>CNPJ da empresa <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                  <div className="flex gap-2">
                    <Input placeholder="00.000.000/0000-00" value={cadastro.cnpj} onChange={e => setCadastro(p => ({ ...p, cnpj: formatCNPJ(e.target.value) }))} className="flex-1" />
                    <Button type="button" variant="outline" size="icon" onClick={buscarEmpresaPorCNPJ} disabled={buscandoCNPJ || cadastro.cnpj.replace(/\D/g, '').length !== 14}>
                      {buscandoCNPJ ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  {empresaEncontrada && <p className="text-xs text-green-400">✓ Empresa: <strong>{empresaEncontrada.nome}</strong></p>}
                  {cadastro.cnpj.replace(/\D/g, '').length === 14 && !empresaEncontrada && !buscandoCNPJ && (
                    <p className="text-xs text-muted-foreground">CNPJ não encontrado — você pode prosseguir sem vínculo</p>
                  )}
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando...</> : 'Criar conta'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {tela === 'cadastro' && cadastroOk && (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="text-4xl">✅</div>
              <p className="font-medium">Conta criada com sucesso!</p>
              <p className="text-sm text-muted-foreground">
                {empresaEncontrada ? `Conta vinculada à empresa ${empresaEncontrada.nome}.` : 'Conta criada. Entre em contato para vincular sua empresa.'}
              </p>
              <Button className="w-full" onClick={() => { setTela('login'); setCadastroOk(false); setCadastro({ nome: '', email: '', senha: '', confirmarSenha: '', cnpj: '' }); setEmpresaEncontrada(null) }}>
                Fazer login
              </Button>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground">Problemas? Fale com o administrador.</p>
      </div>
    </div>
  )
}
