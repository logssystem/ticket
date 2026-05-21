// Tipos principais da plataforma de tickets

export type TicketStatus = 'novo' | 'em_andamento' | 'pendente' | 'resolvido' | 'fechado' | 'cancelado'
export type TicketPrioridade = 'baixa' | 'media' | 'alta' | 'urgente'
export type TicketSLA = 'no_prazo' | 'a_vencer' | 'vencido' | 'em_pausa' | 'nao_definido'

export interface Ticket {
  id: string
  numero: number
  cliente: string
  organizacao: string
  email: string
  telefone: string
  assunto: string
  descricao: string
  status: TicketStatus
  prioridade: TicketPrioridade
  sla: TicketSLA
  abertoEm: Date
  vencimentoEm: Date | null
  resolvidoEm: Date | null
  responsavel: string | null
  equipe: string
  servico: string
  categoria: string
  tags: string[]
  canal: 'email' | 'chat' | 'telefone' | 'portal' | 'sistema'
}

export interface TicketAcao {
  id: string
  ticketId: string
  tipo: 'publica' | 'interna'
  autor: string
  autorEmail: string
  autorAvatar?: string
  conteudo: string
  criadoEm: Date
  anexos?: string[]
}

export interface Usuario {
  id: string
  nome: string
  email: string
  avatar?: string
  cargo: string
  equipe: string
  telefone?: string
}

export interface Equipe {
  id: string
  nome: string
  cor: string
}

export interface FilaTicket {
  id: string
  nome: string
  contador: number
}

// Tipos para indicadores e gráficos
export interface Indicador {
  nome: string
  descricao: string
  valor: number
  variacao: number // percentual em relação ao período anterior
}

export interface DadosDiarios {
  dia: number
  abertos: number
  fechados: number
  resolvidos: number
  reabertos: number
  cancelados: number
}

export interface DadosSLA {
  dia: number
  naoDefinido: number
  emPausa: number
  aVencer: number
  vencido: number
}

export interface DadosEquipe {
  equipe: string
  total: number
  variacao: number
  cor: string
}

export interface DadosAgente {
  agente: string
  total: number
  variacao: number
}

export interface DadosCliente {
  cliente: string
  total: number
  percentual: number
  cor: string
}

export interface DadosVencimento {
  categoria: string
  valor: number
  percentual: number
  cor: string
}

// Tipos para navegação
export interface NavItem {
  id: string
  label: string
  icon: string
  href?: string
  submenu?: NavItem[]
  badge?: number
}

// Tipos para cards da home
export interface HomeCard {
  id: string
  titulo: string
  icone: string
  expandido: boolean
  conteudo?: React.ReactNode
}
