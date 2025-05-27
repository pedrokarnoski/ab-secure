'use client'

import React, { useState, useEffect } from 'react'
import { CryptoService } from '@/lib/crypto-service'

import { UserPanel } from '@/components/user-panel'
import { CertificateAuthority } from '@/components/certificate-authority'
import { ProcessVisualizer } from '@/components/process-visualizer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { MessageData, UserKeys, Certificate } from '@/lib/types'
import { AlertTriangle, Shield, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export function CommunicationSystem() {
  const [aliceKeys, setAliceKeys] = useState<UserKeys | null>(null)
  const [bobKeys, setBobKeys] = useState<UserKeys | null>(null)
  const [aliceCertificate, setAliceCertificate] = useState<Certificate | null>(
    null
  )
  const [bobCertificate, setBobCertificate] = useState<Certificate | null>(null)
  const [message, setMessage] = useState<MessageData | null>(null)
  const [securityStatus, setSecurityStatus] = useState<
    'secure' | 'warning' | 'breach'
  >('secure')
  const [activeTab, setActiveTab] = useState('alice')
  const [showProcess, setShowProcess] = useState(false)

  useEffect(() => {
    initializeSystem()
  }, [])

  const initializeSystem = async () => {
    try {
      // Gerar pares de chaves de criptografia e assinatura para Alice
      const aliceEncryptionKeyPair =
        await CryptoService.generateEncryptionKeyPair()
      const aliceSignatureKeyPair =
        await CryptoService.generateSignatureKeyPair()

      // Gerar pares de chaves de criptografia e assinatura para Bob
      const bobEncryptionKeyPair =
        await CryptoService.generateEncryptionKeyPair()
      const bobSignatureKeyPair = await CryptoService.generateSignatureKeyPair()

      setAliceKeys({
        encryptionPublicKey: aliceEncryptionKeyPair.publicKey,
        encryptionPrivateKey: aliceEncryptionKeyPair.privateKey,
        signaturePublicKey: aliceSignatureKeyPair.publicKey,
        signaturePrivateKey: aliceSignatureKeyPair.privateKey,
        encryptionPublicKeyJwk: (await CryptoService.exportKey(
          aliceEncryptionKeyPair.publicKey,
          'jwk'
        )) as JsonWebKey,
        encryptionPrivateKeyJwk: (await CryptoService.exportKey(
          aliceEncryptionKeyPair.privateKey,
          'jwk'
        )) as JsonWebKey,
        signaturePublicKeyJwk: (await CryptoService.exportKey(
          aliceSignatureKeyPair.publicKey,
          'jwk'
        )) as JsonWebKey,
        signaturePrivateKeyJwk: (await CryptoService.exportKey(
          aliceSignatureKeyPair.privateKey,
          'jwk'
        )) as JsonWebKey,
      })

      setBobKeys({
        encryptionPublicKey: bobEncryptionKeyPair.publicKey,
        encryptionPrivateKey: bobEncryptionKeyPair.privateKey,
        signaturePublicKey: bobSignatureKeyPair.publicKey,
        signaturePrivateKey: bobSignatureKeyPair.privateKey,
        encryptionPublicKeyJwk: (await CryptoService.exportKey(
          bobEncryptionKeyPair.publicKey,
          'jwk'
        )) as JsonWebKey,
        encryptionPrivateKeyJwk: (await CryptoService.exportKey(
          bobEncryptionKeyPair.privateKey,
          'jwk'
        )) as JsonWebKey,
        signaturePublicKeyJwk: (await CryptoService.exportKey(
          bobSignatureKeyPair.publicKey,
          'jwk'
        )) as JsonWebKey,
        signaturePrivateKeyJwk: (await CryptoService.exportKey(
          bobSignatureKeyPair.privateKey,
          'jwk'
        )) as JsonWebKey,
      })

      // Emitir certificados usando chaves públicas de assinatura
      const aliceCert = CryptoService.issueCertificate(
        'Alice',
        aliceSignatureKeyPair.publicKey
      )
      const bobCert = CryptoService.issueCertificate(
        'Bob',
        bobSignatureKeyPair.publicKey
      )

      setAliceCertificate(aliceCert)
      setBobCertificate(bobCert)

      toast.success('Sistema inicializado', {
        description: 'Chaves criptográficas e certificados foram gerados.',
      })
    } catch (error) {
      console.error('Erro ao inicializar o sistema:', error)
      toast.error('Erro de inicialização', {
        description: 'Falha ao gerar chaves criptográficas.',
      })
    }
  }

  const handleSendMessage = async (
    content: string,
    sender: 'alice' | 'bob'
  ) => {
    try {
      setShowProcess(true)
      setSecurityStatus('secure')

      const senderKeys = sender === 'alice' ? aliceKeys : bobKeys
      const receiverKeys = sender === 'alice' ? bobKeys : aliceKeys
      const senderCertificate =
        sender === 'alice' ? aliceCertificate : bobCertificate

      if (!senderKeys || !receiverKeys || !senderCertificate) {
        throw new Error('Chaves ou certificado não disponíveis')
      }

      // Criar uma chave simétrica para criptografia AES
      const symmetricKey = await CryptoService.generateSymmetricKey()

      // Criptografar a mensagem com a chave simétrica
      const encryptedMessage = await CryptoService.encryptMessage(
        content,
        symmetricKey
      )

      // Criptografar a chave simétrica com a chave pública do destinatário
      const encryptedSymmetricKey = await CryptoService.encryptSymmetricKey(
        symmetricKey,
        receiverKeys.encryptionPublicKey
      )

      // Criar um hash da mensagem original
      const messageHash = await CryptoService.hashMessage(content)

      // Assinar o hash com a chave privada de assinatura do remetente
      const signature = await CryptoService.signMessage(
        messageHash,
        senderKeys.signaturePrivateKey
      )

      const newMessage: MessageData = {
        sender: sender,
        encryptedContent: encryptedMessage,
        encryptedSymmetricKey,
        signature,
        certificate: senderCertificate,
        timestamp: new Date().toISOString(),
        messageHash,
      }

      setMessage(newMessage)
      setActiveTab(sender === 'alice' ? 'bob' : 'alice')

      toast.success('Mensagem enviada', {
        description: 'Sua mensagem segura foi enviada.',
      })
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setSecurityStatus('breach')

      toast.error('Erro no envio', {
        description: 'Falha ao enviar mensagem criptografada.',
      })
    }
  }

  const handleVerifyMessage = async () => {
    if (!message) return

    try {
      const receiverKeys = message.sender === 'alice' ? bobKeys : aliceKeys
      const senderCertificate =
        message.sender === 'alice' ? aliceCertificate : bobCertificate

      if (!receiverKeys || !senderCertificate) {
        throw new Error('Chaves ou certificado não disponíveis')
      }

      // Verificar certificado
      const certificateValid = CryptoService.verifyCertificate(
        message.certificate
      )

      if (!certificateValid) {
        setSecurityStatus('breach')
        toast.warning('Alerta de segurança', {
          description:
            'Validação do certificado falhou! O remetente pode não ser quem diz ser.',
        })
        return
      }

      // Descriptografar a chave simétrica usando a chave privada de criptografia do destinatário
      const symmetricKey = await CryptoService.decryptSymmetricKey(
        message.encryptedSymmetricKey,
        receiverKeys.encryptionPrivateKey
      )

      // Descriptografar a mensagem usando a chave simétrica
      const decryptedContent = await CryptoService.decryptMessage(
        message.encryptedContent,
        symmetricKey
      )

      // Calcular o hash da mensagem descriptografada
      const calculatedHash = await CryptoService.hashMessage(decryptedContent)

      // Verificar se o hash corresponde ao original
      if (calculatedHash !== message.messageHash) {
        setSecurityStatus('breach')
        toast.warning('Alerta de segurança', {
          description:
            'Verificação de integridade falhou! A mensagem pode ter sido adulterada.',
        })
        return
      }

      // Verificar assinatura usando a chave pública de assinatura do certificado do remetente
      const signatureValid = await CryptoService.verifySignature(
        message.messageHash,
        message.signature,
        message.certificate.publicKey
      )

      if (!signatureValid) {
        setSecurityStatus('breach')
        toast.warning('Alerta de segurança', {
          description:
            'Verificação da assinatura falhou! A autenticidade da mensagem não pode ser confirmada.',
        })
        return
      }

      // Se todas as verificações de segurança passarem
      setSecurityStatus('secure')
      toast.success('Mensagem verificada', {
        description:
          'Todas as verificações de segurança passaram. A mensagem é autêntica e não foi adulterada.',
      })
    } catch (error) {
      console.error('Erro ao verificar mensagem:', error)
      setSecurityStatus('breach')
      toast.error('Erro de verificação', {
        description: 'Falha ao verificar e descriptografar a mensagem.',
      })
    }
  }

  // Função para simular adulteração da mensagem para demonstração
  const simulateTamper = () => {
    if (!message) return

    const tamperedMessage = { ...message }

    // Escolher aleatoriamente o que adulterar
    const tamperType = Math.floor(Math.random() * 3)

    switch (tamperType) {
      case 0:
        // Adulterar certificado
        tamperedMessage.certificate = {
          ...tamperedMessage.certificate,
          signature: 'tampered_signature_data',
        }
        break
      case 1:
        // Adulterar hash da mensagem
        tamperedMessage.messageHash = 'tampered_hash_data'
        break
      case 2:
        // Adulterar assinatura digital
        tamperedMessage.signature = 'tampered_signature_data'
        break
    }

    setMessage(tamperedMessage)
    setSecurityStatus('warning')

    toast.info('Mensagem adulterada', {
      description: 'Para fins de demonstração, a mensagem foi adulterada.',
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-between p-4 bg-card rounded-lg shadow">
        <div className="flex items-center gap-2">
          {securityStatus === 'secure' && (
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-500 border-green-500/20 flex gap-2"
            >
              <ShieldCheck className="size-4" />
              <Label>Seguro</Label>
            </Badge>
          )}
          {securityStatus === 'warning' && (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-500 border-amber-500/20 flex gap-2"
            >
              <AlertTriangle className="size-4" />
              <Label>Aviso</Label>
            </Badge>
          )}
          {securityStatus === 'breach' && (
            <Badge
              variant="outline"
              className="bg-red-500/10 text-red-500 border-red-500/20 flex gap-1"
            >
              <Shield className="size-4" /> Violação de segurança
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowProcess(!showProcess)}
            className="text-xs md:text-sm"
          >
            {showProcess ? 'Ocultar processo' : 'Mostrar processo'}
          </Button>
          <Button
            variant="secondary"
            onClick={initializeSystem}
            className="text-xs md:text-sm"
          >
            Resetar chaves
          </Button>
          <Button
            variant="destructive"
            onClick={simulateTamper}
            disabled={!message}
            className="text-xs md:text-sm"
          >
            Simular adulteração
          </Button>
        </div>
      </div>

      {showProcess && message && (
        <ProcessVisualizer message={message} securityStatus={securityStatus} />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alice">Alice</TabsTrigger>
          <TabsTrigger value="bob">Bob</TabsTrigger>
        </TabsList>

        <TabsContent value="alice">
          <UserPanel
            user="alice"
            userKeys={aliceKeys}
            certificate={aliceCertificate}
            message={message}
            onSendMessage={handleSendMessage}
            onVerifyMessage={handleVerifyMessage}
            isActiveReceiver={message?.sender === 'bob'}
          />
        </TabsContent>

        <TabsContent value="bob">
          <UserPanel
            user="bob"
            userKeys={bobKeys}
            certificate={bobCertificate}
            message={message}
            onSendMessage={handleSendMessage}
            onVerifyMessage={handleVerifyMessage}
            isActiveReceiver={message?.sender === 'alice'}
          />
        </TabsContent>
      </Tabs>

      <CertificateAuthority
        aliceCertificate={aliceCertificate}
        bobCertificate={bobCertificate}
      />
    </div>
  )
}
