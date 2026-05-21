import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export interface Notificacao {
  id?: string
  tipo: 'novo_usuario' | 'novo_ticket' | 'ticket_atribuido' | 'sla_vencendo'
  titulo: string
  mensagem: string
  lida: boolean
  para: 'todos' | string // 'todos' = admin+agentes, ou uid específico
  criadoEm: any
  link?: string
  avatar?: string
}

export async function criarNotificacao(dados: Omit<Notificacao, 'id' | 'lida' | 'criadoEm'>) {
  try {
    await addDoc(collection(db, 'notificacoes'), {
      ...dados,
      lida: false,
      criadoEm: serverTimestamp(),
    })
  } catch (e) {
    console.error('Erro ao criar notificação:', e)
  }
}
