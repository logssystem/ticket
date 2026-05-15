'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Mail, Phone, Globe, Linkedin, Instagram, Youtube } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { usuarioLogado } from '@/lib/mock-data'
import type { TicketAcao } from '@/lib/types'

interface TicketTimelineProps {
  acoes: TicketAcao[]
}

export function TicketTimeline({ acoes }: TicketTimelineProps) {
  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })
  }

  return (
    <div className="space-y-6">
      {acoes.map((acao) => (
        <div key={acao.id} className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Action Header */}
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border">
            <button className="px-3 py-1 text-sm font-medium text-primary border-b-2 border-primary">
              Ação pública
            </button>
            <button className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
              Ação interna
            </button>
          </div>

          {/* Action Content */}
          <div className="p-6 space-y-6">
            {/* Message Content */}
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground font-medium">{acao.conteudo.split('\n')[0]}</p>
              {acao.conteudo.split('\n').length > 1 && (
                <p className="text-muted-foreground mt-2">
                  Acesse:{' '}
                  <a href="https://era.com.br" className="text-primary hover:underline">
                    era.com.br
                  </a>
                </p>
              )}
            </div>

            {/* Signature */}
            <div className="flex items-start gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4 bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg flex-1">
                {/* Avatar with badge */}
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-primary/20">
                    <AvatarImage src={usuarioLogado.avatar} alt={usuarioLogado.nome} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {usuarioLogado.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-[10px] px-1.5">
                    Great Place To Work
                  </Badge>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-semibold text-foreground">João Freitas</h4>
                    <p className="text-sm text-muted-foreground">Suporte Técnico</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      joao.freitas@era.com.br
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      (19) 3199-0500
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      era.com.br
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                      Verificada por Reclame AQUI
                    </Badge>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                      RA 1000
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Prêmio IA 2025
                  </Badge>
                </div>
              </div>
            </div>

            {/* Company Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-primary">br.did</span>
                <span className="text-xl font-bold text-foreground tracking-wider">ERA</span>
                <span className="text-sm text-muted-foreground">
                  Atenda mais e melhor por voz, mensagens e IA
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a href="#" className="p-2 text-muted-foreground hover:text-foreground">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 text-muted-foreground hover:text-foreground">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 text-muted-foreground hover:text-foreground">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
