import type {
  Ticket,
  TicketAcao,
  Usuario,
  Equipe,
  FilaTicket,
  Indicador,
  DadosDiarios,
  DadosSLA,
  DadosEquipe,
  DadosAgente,
  DadosCliente,
  DadosVencimento,
} from './types'

// Usuário logado
export const usuarioLogado: Usuario = {
  id: '1',
  nome: 'João Freitas',
  email: 'joao.freitas@era.com.br',
  avatar: '/avatars/joao.jpg',
  cargo: 'Suporte Técnico',
  equipe: 'PABX - VOZ',
  telefone: '(19) 3199-0500',
}

// Equipes
export const equipes: Equipe[] = [
  { id: '1', nome: 'PABX - VOZ', cor: '#10b981' },
  { id: '2', nome: 'Desenvolvimento', cor: '#3b82f6' },
  { id: '3', nome: 'PABX - Omnichannel', cor: '#a855f7' },
  { id: '4', nome: 'Administradores', cor: '#6b7280' },
  { id: '5', nome: 'Infraestrutura', cor: '#eab308' },
  { id: '6', nome: 'Onboarding', cor: '#f97316' },
  { id: '7', nome: 'PABX N2', cor: '#06b6d4' },
]

// Filas de tickets
export const filasTicket: FilaTicket[] = [
  { id: '1', nome: 'Triagem Atendimento Omni', contador: 11 },
  { id: '2', nome: 'TKs Abertos Suporte Voz', contador: 24 },
  { id: '3', nome: 'TKs Abertos Suporte Omni', contador: 18 },
  { id: '4', nome: 'Tks Suporte N2', contador: 7 },
  { id: '5', nome: 'NEX', contador: 3 },
  { id: '6', nome: 'Configurações', contador: 12 },
  { id: '7', nome: 'Onb_Kanban', contador: 5 },
  { id: '8', nome: 'Onb_pequeno', contador: 2 },
  { id: '9', nome: 'Op Assistida', contador: 8 },
  { id: '10', nome: 'Onb_OPAssistida', contador: 4 },
  { id: '11', nome: 'temporaria', contador: 1 },
]

// Tickets de exemplo
export const tickets: Ticket[] = [
  {
    id: '1',
    numero: 109520,
    cliente: 'Matheus Mussareli',
    organizacao: 'WAY.COM PROVEDOR BANDA LARGA',
    email: 'matheusmussareliway@gmail.com',
    telefone: '14 99887-6470',
    assunto: 'relatório cliente',
    descricao: 'ERA — Atenda mais e melhor por voz, mensagem e IA.',
    status: 'novo',
    prioridade: 'media',
    sla: 'no_prazo',
    abertoEm: new Date('2026-05-15T00:33:00'),
    vencimentoEm: null,
    resolvidoEm: null,
    responsavel: null,
    equipe: 'Triagem',
    servico: 'TRIAGEM',
    categoria: 'Solicitação',
    tags: [],
    canal: 'sistema',
  },
  {
    id: '2',
    numero: 109513,
    cliente: 'Carlos Silva',
    organizacao: 'voanet',
    email: 'carlos@voanet.com.br',
    telefone: '11 98765-4321',
    assunto: 'Falha na integração de realizar chamadas através d...',
    descricao: 'O sistema apresenta erro ao tentar realizar chamadas através da integração.',
    status: 'em_andamento',
    prioridade: 'alta',
    sla: 'a_vencer',
    abertoEm: new Date('2026-05-14T16:22:00'),
    vencimentoEm: new Date('2026-05-16T16:22:00'),
    resolvidoEm: null,
    responsavel: 'João Freitas',
    equipe: 'PABX - VOZ',
    servico: 'Suporte Técnico',
    categoria: 'Incidente',
    tags: ['integração', 'chamadas'],
    canal: 'email',
  },
  {
    id: '3',
    numero: 109512,
    cliente: 'Ana Paula',
    organizacao: 'ERA',
    email: 'ana@era.com.br',
    telefone: '19 3199-0501',
    assunto: 'Erro bina',
    descricao: 'O bina não está exibindo o número correto.',
    status: 'em_andamento',
    prioridade: 'media',
    sla: 'no_prazo',
    abertoEm: new Date('2026-05-14T16:16:00'),
    vencimentoEm: new Date('2026-05-17T16:16:00'),
    resolvidoEm: null,
    responsavel: 'Bárbara Boiago',
    equipe: 'PABX - VOZ',
    servico: 'Suporte Técnico',
    categoria: 'Incidente',
    tags: ['bina'],
    canal: 'portal',
  },
  {
    id: '4',
    numero: 109510,
    cliente: 'Roberto Santos',
    organizacao: 'Transportes Jomalai LTDA',
    email: 'roberto@jomalai.com.br',
    telefone: '11 4002-8922',
    assunto: 'PESQUISAR CONTATO NAS CONVERSAS ATIVAS',
    descricao: 'Não consigo pesquisar contatos nas conversas ativas do chat.',
    status: 'pendente',
    prioridade: 'media',
    sla: 'no_prazo',
    abertoEm: new Date('2026-05-14T16:15:00'),
    vencimentoEm: new Date('2026-05-18T16:15:00'),
    resolvidoEm: null,
    responsavel: 'Danielle Mascaro',
    equipe: 'PABX - Omnichannel',
    servico: 'Chat',
    categoria: 'Dúvida',
    tags: ['chat', 'pesquisa'],
    canal: 'chat',
  },
  {
    id: '5',
    numero: 109507,
    cliente: 'Maria Fernanda',
    organizacao: 'Transportes Jomalai LTDA',
    email: 'maria@jomalai.com.br',
    telefone: '11 4002-8923',
    assunto: 'O CLIENTE SO RECEBE A PRIMEIRA MENSAGEM',
    descricao: 'Os clientes só estão recebendo a primeira mensagem do bot.',
    status: 'em_andamento',
    prioridade: 'alta',
    sla: 'a_vencer',
    abertoEm: new Date('2026-05-14T16:08:00'),
    vencimentoEm: new Date('2026-05-15T16:08:00'),
    resolvidoEm: null,
    responsavel: 'João Freitas',
    equipe: 'PABX - Omnichannel',
    servico: 'Bot',
    categoria: 'Incidente',
    tags: ['bot', 'mensagens'],
    canal: 'email',
  },
  {
    id: '6',
    numero: 109499,
    cliente: 'Pedro Henrique',
    organizacao: 'ZZ SOLUTIONS LTDA',
    email: 'pedro@zzsolutions.com.br',
    telefone: '21 99999-8888',
    assunto: 'Problema ao enviar imagens',
    descricao: 'Não consigo enviar imagens pelo chat.',
    status: 'em_andamento',
    prioridade: 'media',
    sla: 'no_prazo',
    abertoEm: new Date('2026-05-14T14:13:00'),
    vencimentoEm: new Date('2026-05-19T14:13:00'),
    resolvidoEm: null,
    responsavel: 'Gabriel Heleoterio',
    equipe: 'PABX - Omnichannel',
    servico: 'Chat',
    categoria: 'Incidente',
    tags: ['chat', 'imagens'],
    canal: 'portal',
  },
  {
    id: '7',
    numero: 109482,
    cliente: 'Lucia Martins',
    organizacao: 'MAMAHE COMERCIO',
    email: 'lucia@mamahe.com.br',
    telefone: '31 98877-6655',
    assunto: 'LIGAÇÕES EXTERNAS',
    descricao: 'Não consigo realizar ligações externas.',
    status: 'novo',
    prioridade: 'alta',
    sla: 'vencido',
    abertoEm: new Date('2026-05-14T11:42:00'),
    vencimentoEm: new Date('2026-05-14T17:42:00'),
    resolvidoEm: null,
    responsavel: null,
    equipe: 'Triagem',
    servico: 'TRIAGEM',
    categoria: 'Incidente',
    tags: ['ligações', 'externas'],
    canal: 'telefone',
  },
  {
    id: '8',
    numero: 109480,
    cliente: 'Fernando Costa',
    organizacao: 'Vaitecnologias',
    email: 'fernando@vaitec.com.br',
    telefone: '41 99999-7777',
    assunto: 'grupo de ring',
    descricao: 'Preciso configurar um grupo de ring.',
    status: 'pendente',
    prioridade: 'baixa',
    sla: 'em_pausa',
    abertoEm: new Date('2026-05-14T11:23:00'),
    vencimentoEm: new Date('2026-05-20T11:23:00'),
    resolvidoEm: null,
    responsavel: 'Bárbara Boiago',
    equipe: 'PABX - VOZ',
    servico: 'Configuração',
    categoria: 'Solicitação',
    tags: ['ring', 'configuração'],
    canal: 'email',
  },
  {
    id: '9',
    numero: 109476,
    cliente: 'Amanda Oliveira',
    organizacao: 'VES SOLUÇÕES',
    email: 'amanda@ves.com.br',
    telefone: '51 98888-6666',
    assunto: 'cancelamento pabx msagr',
    descricao: 'Solicito cancelamento do serviço PABX.',
    status: 'em_andamento',
    prioridade: 'media',
    sla: 'no_prazo',
    abertoEm: new Date('2026-05-14T10:32:00'),
    vencimentoEm: new Date('2026-05-21T10:32:00'),
    resolvidoEm: null,
    responsavel: 'Adson Jean',
    equipe: 'Administradores',
    servico: 'Cancelamento',
    categoria: 'Solicitação',
    tags: ['cancelamento'],
    canal: 'email',
  },
  {
    id: '10',
    numero: 109470,
    cliente: 'Ricardo Almeida',
    organizacao: 'CALLIOPE-BH',
    email: 'ricardo@calliope.com.br',
    telefone: '31 99777-5555',
    assunto: 'Configuração de URA',
    descricao: 'Preciso de ajuda para configurar a URA.',
    status: 'resolvido',
    prioridade: 'media',
    sla: 'no_prazo',
    abertoEm: new Date('2026-05-13T09:15:00'),
    vencimentoEm: new Date('2026-05-16T09:15:00'),
    resolvidoEm: new Date('2026-05-14T14:30:00'),
    responsavel: 'João Freitas',
    equipe: 'PABX - VOZ',
    servico: 'Configuração',
    categoria: 'Solicitação',
    tags: ['ura', 'configuração'],
    canal: 'portal',
  },
]

// Ações de um ticket (timeline)
export const ticketAcoes: TicketAcao[] = [
  {
    id: '1',
    ticketId: '1',
    tipo: 'publica',
    autor: 'Matheus Mussareli',
    autorEmail: 'matheusmussareliway@gmail.com',
    conteudo: 'ERA — Atenda mais e melhor por voz, mensagem e IA.\n\nAcesse: era.com.br',
    criadoEm: new Date('2026-05-15T00:33:00'),
  },
]

// Dados para gráficos
export const dadosDiarios: DadosDiarios[] = [
  { dia: 1, abertos: 25, fechados: 30, resolvidos: 5, reabertos: 0, cancelados: 0 },
  { dia: 2, abertos: 30, fechados: 28, resolvidos: 3, reabertos: 0, cancelados: 0 },
  { dia: 3, abertos: 0, fechados: 0, resolvidos: 0, reabertos: 0, cancelados: 0 },
  { dia: 4, abertos: 45, fechados: 28, resolvidos: 0, reabertos: 0, cancelados: 0 },
  { dia: 5, abertos: 58, fechados: 55, resolvidos: 60, reabertos: 0, cancelados: 0 },
  { dia: 6, abertos: 55, fechados: 45, resolvidos: 58, reabertos: 0, cancelados: 0 },
  { dia: 7, abertos: 45, fechados: 55, resolvidos: 35, reabertos: 0, cancelados: 0 },
  { dia: 8, abertos: 55, fechados: 45, resolvidos: 60, reabertos: 5, cancelados: 0 },
  { dia: 9, abertos: 20, fechados: 18, resolvidos: 5, reabertos: 0, cancelados: 0 },
  { dia: 10, abertos: 20, fechados: 22, resolvidos: 0, reabertos: 0, cancelados: 3 },
  { dia: 11, abertos: 25, fechados: 30, resolvidos: 0, reabertos: 0, cancelados: 0 },
  { dia: 12, abertos: 55, fechados: 50, resolvidos: 35, reabertos: 0, cancelados: 0 },
  { dia: 13, abertos: 50, fechados: 55, resolvidos: 35, reabertos: 8, cancelados: 0 },
  { dia: 14, abertos: 55, fechados: 50, resolvidos: 45, reabertos: 5, cancelados: 0 },
  { dia: 15, abertos: 8, fechados: 5, resolvidos: 3, reabertos: 0, cancelados: 2 },
]

export const dadosSLA: DadosSLA[] = [
  { dia: 1, naoDefinido: 180, emPausa: 120, aVencer: 150, vencido: 100 },
  { dia: 2, naoDefinido: 175, emPausa: 130, aVencer: 140, vencido: 105 },
  { dia: 3, naoDefinido: 185, emPausa: 125, aVencer: 145, vencido: 95 },
  { dia: 4, naoDefinido: 190, emPausa: 115, aVencer: 155, vencido: 90 },
  { dia: 5, naoDefinido: 180, emPausa: 135, aVencer: 140, vencido: 95 },
  { dia: 6, naoDefinido: 175, emPausa: 140, aVencer: 135, vencido: 100 },
  { dia: 7, naoDefinido: 185, emPausa: 130, aVencer: 145, vencido: 90 },
  { dia: 8, naoDefinido: 180, emPausa: 125, aVencer: 150, vencido: 95 },
  { dia: 9, naoDefinido: 175, emPausa: 135, aVencer: 140, vencido: 100 },
  { dia: 10, naoDefinido: 185, emPausa: 120, aVencer: 155, vencido: 90 },
  { dia: 11, naoDefinido: 180, emPausa: 130, aVencer: 145, vencido: 95 },
  { dia: 12, naoDefinido: 175, emPausa: 140, aVencer: 135, vencido: 100 },
  { dia: 13, naoDefinido: 185, emPausa: 125, aVencer: 150, vencido: 90 },
  { dia: 14, naoDefinido: 180, emPausa: 135, aVencer: 145, vencido: 95 },
  { dia: 15, naoDefinido: 270, emPausa: 140, aVencer: 150, vencido: 110 },
]

export const dadosEquipes: DadosEquipe[] = [
  { equipe: 'PABX - VOZ', total: 485, variacao: 40.3, cor: '#10b981' },
  { equipe: 'Desenvolvimento', total: 187, variacao: 15.6, cor: '#3b82f6' },
  { equipe: 'PABX - Omnichannel', total: 180, variacao: 15.0, cor: '#a855f7' },
  { equipe: 'Administradores', total: 92, variacao: 7.7, cor: '#6b7280' },
  { equipe: 'Infraestrutura', total: 45, variacao: 3.8, cor: '#eab308' },
  { equipe: 'Onboarding', total: 38, variacao: 3.2, cor: '#f97316' },
  { equipe: 'PABX N2', total: 25, variacao: 2.1, cor: '#06b6d4' },
]

export const dadosAgentes: DadosAgente[] = [
  { agente: 'Não informado', total: 3, variacao: -82.35 },
  { agente: 'Acesso Comercial - Geral', total: 0, variacao: -100.0 },
  { agente: 'Adson Jean', total: 1, variacao: -75.0 },
  { agente: 'Bárbara Boiago', total: 32, variacao: 45.45 },
  { agente: 'Bruno Rafael Marsolla', total: 1, variacao: -80.0 },
  { agente: 'cristiano.sousa', total: 0, variacao: -100.0 },
  { agente: 'Danielle Mascaro', total: 27, variacao: 68.75 },
  { agente: 'Gabriel Heleoterio', total: 1, variacao: 0.0 },
  { agente: 'Gabriel Silva', total: 0, variacao: -100.0 },
]

export const dadosEquipesResolucao: DadosEquipe[] = [
  { equipe: 'Não informado', total: 1, variacao: 0.0, cor: '#6b7280' },
  { equipe: 'Administradores', total: 73, variacao: 35.19, cor: '#6b7280' },
  { equipe: 'BRDID', total: 2, variacao: 0.0, cor: '#3b82f6' },
  { equipe: 'Customer and Partner Success', total: 1, variacao: -95.65, cor: '#10b981' },
  { equipe: 'Desenvolvimento', total: 148, variacao: -9.2, cor: '#3b82f6' },
  { equipe: 'Engenharia de Vendas', total: 5, variacao: 150.0, cor: '#a855f7' },
  { equipe: 'Financeiro', total: 2, variacao: -95.83, cor: '#eab308' },
  { equipe: 'Infraestrutura', total: 63, variacao: -37.0, cor: '#eab308' },
  { equipe: 'Integrações', total: 13, variacao: 0.0, cor: '#06b6d4' },
]

export const dadosClientes: DadosCliente[] = [
  { cliente: 'CALLIOPE-BH', total: 89, percentual: 49.5, cor: '#10b981' },
  { cliente: 'ERA', total: 25, percentual: 13.9, cor: '#3b82f6' },
  { cliente: 'JIVE', total: 18, percentual: 10.0, cor: '#a855f7' },
  { cliente: 'MHNET - 187.45.96.75', total: 15, percentual: 8.3, cor: '#1f2937' },
  { cliente: 'ZZ SOLUTIONS LTDA', total: 12, percentual: 6.7, cor: '#eab308' },
  { cliente: 'VoiceCorp - 190.89.34.38', total: 10, percentual: 5.6, cor: '#f97316' },
  { cliente: 'DW NET - 138.59.144.175', total: 8, percentual: 4.4, cor: '#10b981' },
  { cliente: 'Outros', total: 3, percentual: 1.7, cor: '#6b7280' },
]

export const dadosVencimento: DadosVencimento[] = [
  { categoria: 'No prazo', valor: 418, percentual: 83.6, cor: '#3b82f6' },
  { categoria: 'Fora do prazo', valor: 62, percentual: 12.4, cor: '#a855f7' },
  { categoria: 'Não definido', valor: 20, percentual: 4.0, cor: '#10b981' },
]

// Indicadores principais
export const indicadores: Indicador[] = [
  {
    nome: 'Tickets resolvidos fora do prazo',
    descricao: 'Total de tickets que foram resolvidos após o término do SLA de solução.',
    valor: 50,
    variacao: -41.86,
  },
  {
    nome: 'Tickets respondidos no prazo',
    descricao: 'Total de tickets que tiveram a primeira ação incluída pelo agente antes do término do SLA de resposta.',
    valor: 30,
    variacao: 56.67,
  },
  {
    nome: 'Tickets respondidos fora do prazo',
    descricao: 'Total de tickets que tiveram a primeira ação incluída pelo agente após o término do SLA de resposta.',
    valor: 196,
    variacao: -7.1,
  },
  {
    nome: 'Tickets fechados',
    descricao: 'Total de tickets que foram fechados no período e terminaram o período como fechado.',
    valor: 448,
    variacao: -22.63,
  },
  {
    nome: 'Tickets aceitos pelo cliente',
    descricao: 'Total de tickets que tiveram a solução aceita pelo cliente no período e terminaram o período como fechado.',
    valor: 72,
    variacao: -11.11,
  },
  {
    nome: 'Tickets fechados pelo sistema',
    descricao: 'Total de tickets que foram fechados automaticamente pelo sistema.',
    valor: 376,
    variacao: -25.0,
  },
]

// Contadores para a home
export const contadoresHome = {
  meusTickets: {
    novos: 5,
    emAndamento: 12,
    pendentes: 3,
  },
  ticketsEquipe: {
    novos: 15,
    emAndamento: 42,
    pendentes: 8,
  },
  todosTickets: {
    novos: 133,
    emAndamento: 14,
    pendentes: 102,
  },
  mensagens: 1,
  chatsAguardando: 0,
  chatsEmAtendimento: 0,
  eventosHoje: 0,
  eventosSemana: 0,
}

// Helper para formatar data
export function formatarData(data: Date): string {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Helper para obter cor do status SLA
export function getCorSLA(sla: string): string {
  switch (sla) {
    case 'no_prazo':
      return 'text-emerald-600 bg-emerald-50'
    case 'a_vencer':
      return 'text-amber-600 bg-amber-50'
    case 'vencido':
      return 'text-red-600 bg-red-50'
    case 'em_pausa':
      return 'text-gray-600 bg-gray-100'
    default:
      return 'text-blue-600 bg-blue-50'
  }
}

// Helper para obter cor do status
export function getCorStatus(status: string): string {
  switch (status) {
    case 'novo':
      return 'text-blue-600 bg-blue-50'
    case 'em_andamento':
      return 'text-cyan-600 bg-cyan-50'
    case 'pendente':
      return 'text-amber-600 bg-amber-50'
    case 'resolvido':
      return 'text-emerald-600 bg-emerald-50'
    case 'fechado':
      return 'text-gray-600 bg-gray-100'
    case 'cancelado':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

// Helper para label do status
export function getLabelStatus(status: string): string {
  const labels: Record<string, string> = {
    novo: 'Novo',
    em_andamento: 'Em andamento',
    pendente: 'Pendente',
    resolvido: 'Resolvido',
    fechado: 'Fechado',
    cancelado: 'Cancelado',
  }
  return labels[status] || status
}

// Helper para label do SLA
export function getLabelSLA(sla: string): string {
  const labels: Record<string, string> = {
    no_prazo: 'No prazo',
    a_vencer: 'A vencer',
    vencido: 'Vencido',
    em_pausa: 'Em pausa',
    nao_definido: 'Não definido',
  }
  return labels[sla] || sla
}
