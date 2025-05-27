'use client'

import React from 'react'
import type { MessageData } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowDown,
  MessagesSquare,
} from 'lucide-react'

interface ProcessVisualizerProps {
  message: MessageData
  securityStatus: 'secure' | 'warning' | 'breach'
}

export function ProcessVisualizer({
  message,
  securityStatus,
}: ProcessVisualizerProps) {
  const sender = message.sender === 'alice' ? 'Alice' : 'Bob'
  const receiver = message.sender === 'alice' ? 'Bob' : 'Alice'

  // Status das verificações de segurança baseado no status atual
  const certificateValid = securityStatus !== 'breach'
  const signatureValid = securityStatus !== 'breach'
  const hashValid = securityStatus !== 'breach'

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10">
        <CardTitle className="text-xl pt-1 flex items-center gap-3">
          <MessagesSquare className="size-5 text-blue-500" />
          Processo de comunicação segura
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Lado do Remetente */}
          <div className="border-l-2 border-blue-500 pl-4 relative">
            <div className="absolute -left-1.5 top-0 size-3 rounded-full bg-blue-500" />
            <h3 className="font-semibold mb-2 flex items-center">
              <span>Remetente ({sender})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-card p-3 rounded-md">
                <h4 className="font-medium mb-1">1. Mensagem original</h4>
                <p className="text-xs text-muted-foreground">
                  Mensagem em texto plano que será criptografada
                </p>
              </div>

              <div className="bg-card p-3 rounded-md">
                <h4 className="font-medium mb-1">2. Gerar Hash</h4>
                <p className="text-xs text-muted-foreground">
                  Hash SHA-256 da mensagem para verificação de integridade
                </p>
              </div>

              <div className="bg-card p-3 rounded-md">
                <h4 className="font-medium mb-1">3. Assinar Hash</h4>
                <p className="text-xs text-muted-foreground">
                  Assinatura digital criada com a chave privada do remetente
                </p>
              </div>

              <div className="bg-card p-3 rounded-md">
                <h4 className="font-medium mb-1">4. Gerar chave AES</h4>
                <p className="text-xs text-muted-foreground">
                  Chave simétrica para criptografar a mensagem
                </p>
              </div>

              <div className="bg-card p-3 rounded-md">
                <h4 className="font-medium mb-1">5. Criptografar mensagem</h4>
                <p className="text-xs text-muted-foreground">
                  Mensagem criptografada com chave simétrica AES
                </p>
              </div>

              <div className="bg-card p-3 rounded-md">
                <h4 className="font-medium mb-1">6. Criptografar chave AES</h4>
                <p className="text-xs text-muted-foreground">
                  Chave AES criptografada com a chave pública do destinatário
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-secondary">
              <ArrowDown className="size-6" />
            </div>
          </div>

          {/* Pacote de Dados */}
          <div className="bg-card border border-border p-4 rounded-md">
            <h3 className="font-semibold mb-2">
              Pacote de dados seguro transmitido
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-secondary/50 p-2 rounded">
                <span className="block font-medium mb-1">
                  Mensagem criptografada
                </span>
                <span className="block truncate font-mono">
                  {message.encryptedContent.substring(0, 40)}...
                </span>
              </div>
              <div className="bg-secondary/50 p-2 rounded">
                <span className="block font-medium mb-1">
                  Chave AES criptografada
                </span>
                <span className="block truncate font-mono">
                  {message.encryptedSymmetricKey.substring(0, 40)}...
                </span>
              </div>
              <div className="bg-secondary/50 p-2 rounded">
                <span className="block font-medium mb-1">
                  Assinatura digital
                </span>
                <span className="block truncate font-mono">
                  {message.signature.substring(0, 40)}...
                </span>
              </div>
              <div className="bg-secondary/50 p-2 rounded md:col-span-2">
                <span className="block font-medium mb-1">Certificado</span>
                <span className="block truncate font-mono">
                  {JSON.stringify(message.certificate).substring(0, 100)}...
                </span>
              </div>
              <div className="bg-secondary/50 p-2 rounded">
                <span className="block font-medium mb-1">Hash da mensagem</span>
                <span className="block truncate font-mono">
                  {message.messageHash.substring(0, 40)}...
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-secondary">
              <ArrowDown className="size-6" />
            </div>
          </div>

          {/* Lado do Destinatário */}
          <div className="border-l-2 border-green-500 pl-4 relative">
            <div className="absolute -left-1.5 top-0 size-3 rounded-full bg-green-500" />
            <h3 className="font-semibold mb-2">Destinatário ({receiver})</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-card p-3 rounded-md">
                <h4 className="font-medium mb-1 flex items-center justify-between">
                  <span>1. Verificar certificado</span>
                  {certificateValid ? (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500 text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="size-3" /> Válido
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-red-500/10 text-red-500 text-xs flex items-center gap-1"
                    >
                      <XCircle className="size-3" /> Inválido
                    </Badge>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Validar certificado do remetente com a AC
                </p>
              </div>

              <div className="bg-card p-3 rounded-md">
                <h4 className="font-medium mb-1 flex items-center justify-between">
                  <span>2. Verificar assinatura</span>
                  {signatureValid ? (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500 text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="size-3" /> Válida
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-red-500/10 text-red-500 text-xs flex items-center gap-1"
                    >
                      <XCircle className="size-3" /> Inválida
                    </Badge>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Verificar assinatura usando a chave pública do remetente
                </p>
              </div>

              <div className="bg-card p-3 rounded-md">
                <h4 className="font-medium mb-1">
                  3. Descriptografar chave AES
                </h4>
                <p className="text-xs text-muted-foreground">
                  Descriptografar chave simétrica usando a chave privada do
                  destinatário
                </p>
              </div>

              <div className="bg-card p-3 rounded-md">
                <h4 className="font-medium mb-1">
                  4. Descriptografar mensagem
                </h4>
                <p className="text-xs text-muted-foreground">
                  Descriptografar mensagem usando a chave simétrica AES
                </p>
              </div>

              <div className="bg-card p-3 rounded-md">
                <h4 className="font-medium mb-1">5. Calcular Hash</h4>
                <p className="text-xs text-muted-foreground">
                  Calcular hash da mensagem descriptografada
                </p>
              </div>

              <div className="bg-card p-3 rounded-md">
                <h4 className="font-medium mb-1 flex items-center justify-between">
                  <span>6. Verificar Hash</span>
                  {hashValid ? (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500 text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="size-3" /> Válido
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-red-500/10 text-red-500 text-xs flex items-center gap-1"
                    >
                      <XCircle className="size-3" /> Inválido
                    </Badge>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Comparar hash calculado com o hash transmitido
                </p>
              </div>
            </div>
          </div>

          {/* Status Final */}
          <div
            className={`mt-4 p-3 rounded-md ${
              securityStatus === 'secure'
                ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                : securityStatus === 'warning'
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
                  : 'bg-red-500/10 border border-red-500/20 text-red-500'
            }`}
          >
            <div className="flex items-center gap-2">
              {securityStatus === 'secure' && (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {securityStatus === 'warning' && (
                <AlertTriangle className="h-5 w-5" />
              )}
              {securityStatus === 'breach' && <XCircle className="h-5 w-5" />}

              <div>
                <h3 className="font-medium">
                  {securityStatus === 'secure' && 'Comunicação segura'}
                  {securityStatus === 'warning' &&
                    'Possível adulteração detectada'}
                  {securityStatus === 'breach' &&
                    'Violação de segurança detectada!'}
                </h3>
                <p className="text-xs">
                  {securityStatus === 'secure' &&
                    'Todas as verificações de segurança passaram. A mensagem é autêntica e não foi adulterada.'}
                  {securityStatus === 'warning' &&
                    'A mensagem pode ter sido adulterada. A verificação falhou.'}
                  {securityStatus === 'breach' &&
                    'A verificação de segurança falhou. Não confie nesta mensagem.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
