'use client'

import React, { useState } from 'react'
import { UserKeys, Certificate, MessageData } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CryptoService } from '@/lib/crypto-service'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'

import {
  KeyRound,
  Lock,
  Unlock,
  Send,
  ShieldCheck,
  FileKey,
} from 'lucide-react'

interface UserPanelProps {
  user: 'alice' | 'bob'
  userKeys: UserKeys | null
  certificate: Certificate | null
  message: MessageData | null
  onSendMessage: (content: string, sender: 'alice' | 'bob') => void
  onVerifyMessage: () => void
  isActiveReceiver: boolean
}

export function UserPanel({
  user,
  userKeys,
  certificate,
  message,
  onSendMessage,
  onVerifyMessage,
  isActiveReceiver,
}: UserPanelProps) {
  const [messageContent, setMessageContent] = useState('')
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null)

  const handleSendMessage = () => {
    if (messageContent.trim()) {
      onSendMessage(messageContent, user)
      setMessageContent('')
    }
  }

  const handleVerifyAndDecrypt = async () => {
    if (!message || !userKeys) return

    // Apenas o destinatário pretendido pode descriptografar
    if (
      (user === 'alice' && message.sender === 'bob') ||
      (user === 'bob' && message.sender === 'alice')
    ) {
      try {
        // Chamar o manipulador de verificação de mensagem
        onVerifyMessage()

        // Importar a chave privada do formato JWK completo
        const privateKey = await window.crypto.subtle.importKey(
          'jwk',
          userKeys.encryptionPrivateKeyJwk,
          {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
          },
          false,
          ['decrypt']
        )

        // Descriptografar a chave simétrica usando a chave privada do destinatário
        const symmetricKey = await CryptoService.decryptSymmetricKey(
          message.encryptedSymmetricKey,
          privateKey
        )

        // Descriptografar a mensagem usando a chave simétrica
        const content = await CryptoService.decryptMessage(
          message.encryptedContent,
          symmetricKey
        )

        setDecryptedContent(content)
      } catch (error) {
        console.error('Erro de descriptografia:', error)
        setDecryptedContent(
          'Falha na descriptografia: A mensagem não pôde ser descriptografada.'
        )
      }
    }
  }

  const userName = user.charAt(0).toUpperCase() + user.slice(1)
  const isMessageSender = message && message.sender === user
  const isMessageReceiver = message && message.sender !== user

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${user === 'alice' ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'}`}
            >
              {userName.charAt(0)}
            </div>
            {userName}
          </CardTitle>
          <CardDescription>
            {userKeys ? (
              <div className="flex items-center gap-1 mt-3">
                <KeyRound className="h-3 w-3" />
                <span className="text-xs">Par de chaves gerado</span>
              </div>
            ) : (
              <span className="text-xs">Nenhuma chave disponível</span>
            )}
          </CardDescription>
        </div>

        {certificate && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
          >
            <FileKey className="h-3 w-3" />
            <span className="text-xs">Certificado</span>
          </Badge>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        {/* Compositor de Mensagem */}
        <div className="mb-4">
          <label
            htmlFor={`${user}-message`}
            className="block text-sm font-medium mb-2"
          >
            Mensagem
          </label>
          <div className="space-y-6">
            <Textarea
              id={`${user}-message`}
              value={messageContent}
              onChange={e => setMessageContent(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              className="min-h-[120px]"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!userKeys || !messageContent.trim()}
              className="w-full h-12"
            >
              <Send className="size-5 mr-2" />
              Enviar mensagem criptografada
            </Button>
          </div>
        </div>

        {/* Mensagem Recebida */}
        {isMessageReceiver && (
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                Mensagem criptografada recebida
              </h3>
              <Badge variant="secondary" className="text-sm">
                De {message?.sender === 'alice' ? 'Alice' : 'Bob'}
              </Badge>
            </div>

            <div className="bg-secondary/50 rounded-md p-3 text-xs font-mono overflow-x-auto">
              <Label className="truncate">
                {message?.encryptedContent
                  ? message.encryptedContent.substring(0, 120)
                  : ''}
                ...
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={handleVerifyAndDecrypt}
                className="w-full h-12"
                disabled={!isActiveReceiver}
              >
                <ShieldCheck className="size-5 mr-2" />
                Verificar e descriptografar
              </Button>
            </div>

            {decryptedContent && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Unlock className="h-4 w-4" />
                  Mensagem descriptografada
                </h3>
                <div className="bg-green-500/10 text-green-500 rounded-md p-4">
                  {decryptedContent}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mensagem Enviada */}
        {isMessageSender && (
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                Mensagem criptografada enviada
              </h3>
              <Badge variant="secondary" className="text-xs">
                Para {message?.sender === 'alice' ? 'Bob' : 'Alice'}
              </Badge>
            </div>

            <div className="bg-secondary/50 rounded-md p-3 text-xs font-mono overflow-x-auto">
              <Label className="truncate">
                {message?.encryptedContent
                  ? message.encryptedContent.substring(0, 50)
                  : ''}
                ...
              </Label>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 flex items-center gap-2">
              <Lock className="size-4 text-blue-500" />
              <span className="text-sm text-blue-500">
                Sua mensagem foi criptografada e enviada com segurança.
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col">
        <Separator className="my-3" />
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="keys">
            <AccordionTrigger className="text-sm">
              Chaves criptográficas
            </AccordionTrigger>
            <AccordionContent>
              {userKeys ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium">
                      Chave pública (JWK)
                    </Label>
                    <div className="bg-secondary/50 rounded-md p-2 mt-1 text-xs font-mono break-all">
                      {userKeys.encryptionPublicKeyJwk
                        ? JSON.stringify(
                            userKeys.encryptionPublicKeyJwk
                          ).substring(0, 120)
                        : ''}
                      ...
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">
                      Chave privada (JWK - Parcial)
                    </Label>
                    <div className="bg-secondary/50 rounded-md p-2 mt-1 text-xs font-mono">
                      {userKeys.encryptionPrivateKeyJwk
                        ? JSON.stringify(
                            userKeys.encryptionPrivateKeyJwk
                          ).substring(0, 120)
                        : ''}
                      ...
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm">Nenhuma chave disponível.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="certificate">
            <AccordionTrigger className="text-sm">
              Certificado digital
            </AccordionTrigger>
            <AccordionContent>
              {certificate ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium">Titular</Label>
                    <Input
                      value={certificate.subject}
                      readOnly
                      className="mt-1 text-xs h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Emissor</Label>
                    <Input
                      value={certificate.issuer}
                      readOnly
                      className="mt-1 text-xs h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Válido até</Label>
                    <Input
                      value={new Date(certificate.validUntil).toLocaleString(
                        'pt-BR'
                      )}
                      readOnly
                      className="mt-1 text-xs h-8"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm">Nenhum certificado disponível.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardFooter>
    </Card>
  )
}
