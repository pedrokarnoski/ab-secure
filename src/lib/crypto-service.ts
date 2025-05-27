/**
 * Fornece operações criptográficas para o sistema de comunicação segura.
 * Implementa:
 * - Geração de chaves RSA para criptografia assimétrica
 * - Geração de chaves AES para criptografia simétrica
 * - Criação e verificação de assinaturas digitais
 * - Criptografia e descriptografia de mensagens
 * - Gerenciamento de certificados
 */

import type { Certificate } from '@/lib/types'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class CryptoService {
  // Geração de par de chaves RSA para criptografia
  static async generateEncryptionKeyPair() {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
          hash: 'SHA-256',
        },
        true, // extraível
        ['encrypt', 'decrypt']
      )

      return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
      }
    } catch (error) {
      console.error('Erro ao gerar par de chaves RSA para criptografia:', error)
      throw new Error('Falha ao gerar par de chaves para criptografia')
    }
  }

  // Geração de par de chaves RSA para assinaturas digitais
  static async generateSignatureKeyPair() {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
          hash: 'SHA-256',
        },
        true, // extraível
        ['sign', 'verify']
      )

      return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
      }
    } catch (error) {
      console.error('Erro ao gerar par de chaves RSA para assinatura:', error)
      throw new Error('Falha ao gerar par de chaves para assinatura')
    }
  }

  // Gerar uma chave simétrica para criptografia AES
  static async generateSymmetricKey() {
    try {
      return await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true, // extraível
        ['encrypt', 'decrypt']
      )
    } catch (error) {
      console.error('Erro ao gerar chave AES:', error)
      throw new Error('Falha ao gerar chave simétrica')
    }
  }

  // Criptografar uma mensagem usando criptografia simétrica AES
  static async encryptMessage(message: string, key: CryptoKey) {
    try {
      // Gerar um IV aleatório para cada criptografia
      const iv = window.crypto.getRandomValues(new Uint8Array(12))

      // Converter mensagem para bytes
      const encoder = new TextEncoder()
      const messageBytes = encoder.encode(message)

      // Criptografar a mensagem
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128, // Usar tag de autenticação de 128 bits
        },
        key,
        messageBytes
      )

      // Combinar IV e dados criptografados para transmissão
      const combined = new Uint8Array(iv.length + encryptedData.byteLength)
      combined.set(iv, 0)
      combined.set(new Uint8Array(encryptedData), iv.length)

      return this.arrayBufferToBase64(combined.buffer)
    } catch (error) {
      console.error('Erro ao criptografar mensagem:', error)
      throw new Error('Falha ao criptografar mensagem')
    }
  }

  // Descriptografar uma mensagem usando criptografia simétrica AES
  static async decryptMessage(encryptedMessage: string, key: CryptoKey) {
    try {
      // Converter de base64 e separar IV e dados criptografados
      const combined = new Uint8Array(
        CryptoService.base64ToArrayBuffer(encryptedMessage)
      )
      const iv = combined.slice(0, 12)
      const encryptedData = combined.slice(12)

      // Descriptografar a mensagem
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128, // Usar tag de autenticação de 128 bits
        },
        key,
        encryptedData
      )

      // Converter de volta para string
      const decoder = new TextDecoder()
      return decoder.decode(decryptedData)
    } catch (error) {
      console.error('Erro ao descriptografar mensagem:', error)
      throw new Error('Falha ao descriptografar mensagem')
    }
  }

  // Criptografar a chave simétrica usando criptografia assimétrica RSA
  static async encryptSymmetricKey(
    symmetricKey: CryptoKey,
    publicKey: CryptoKey
  ) {
    try {
      // Exportar a chave simétrica para formato raw
      const rawKey = await window.crypto.subtle.exportKey('raw', symmetricKey)

      // Criptografar a chave simétrica com RSA-OAEP
      const encryptedKey = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP',
        },
        publicKey,
        rawKey
      )

      return CryptoService.arrayBufferToBase64(encryptedKey)
    } catch (error) {
      console.error('Erro ao criptografar chave simétrica:', error)
      throw new Error('Falha ao criptografar chave simétrica')
    }
  }

  // Descriptografar a chave simétrica usando criptografia assimétrica RSA
  static async decryptSymmetricKey(
    encryptedKey: string,
    privateKey: CryptoKey
  ) {
    try {
      // Converter de base64 e descriptografar a chave simétrica
      const encryptedKeyBuffer = CryptoService.base64ToArrayBuffer(encryptedKey)
      const decryptedKeyBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP',
        },
        privateKey,
        encryptedKeyBuffer
      )

      // Importar a chave descriptografada como uma chave AES-GCM
      return await window.crypto.subtle.importKey(
        'raw',
        decryptedKeyBuffer,
        {
          name: 'AES-GCM',
          length: 256,
        },
        true, // extraível
        ['encrypt', 'decrypt']
      )
    } catch (error) {
      console.error('Erro ao descriptografar chave simétrica:', error)
      throw new Error('Falha ao descriptografar chave simétrica')
    }
  }

  // Criar hash de uma mensagem usando SHA-256
  static async hashMessage(message: string) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(message)
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
      return CryptoService.arrayBufferToHex(hashBuffer)
    } catch (error) {
      console.error('Erro ao criar hash da mensagem:', error)
      throw new Error('Falha ao criar hash da mensagem')
    }
  }

  // Gerar uma assinatura digital
  static async signMessage(messageHash: string, privateKey: CryptoKey) {
    try {
      const hashBytes = CryptoService.hexToArrayBuffer(messageHash)
      const signature = await window.crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        privateKey,
        hashBytes
      )

      return CryptoService.arrayBufferToBase64(signature)
    } catch (error) {
      console.error('Erro ao assinar mensagem:', error)
      throw new Error('Falha ao assinar mensagem')
    }
  }

  // Verificar uma assinatura digital
  static async verifySignature(
    messageHash: string,
    signature: string,
    publicKey: CryptoKey | JsonWebKey
  ) {
    try {
      const hashBytes = CryptoService.hexToArrayBuffer(messageHash)
      const signatureBuffer = CryptoService.base64ToArrayBuffer(signature)

      let verificationKey: CryptoKey
      if (!(publicKey instanceof CryptoKey)) {
        verificationKey = await window.crypto.subtle.importKey(
          'jwk',
          publicKey,
          {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
          },
          false,
          ['verify']
        )
      } else {
        verificationKey = publicKey
      }

      return await window.crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        verificationKey,
        signatureBuffer,
        hashBytes
      )
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error)
      return false
    }
  }

  // Emitir um certificado digital
  static issueCertificate(subject: string, publicKey: CryptoKey): Certificate {
    const serialNumber = Array.from(
      window.crypto.getRandomValues(new Uint8Array(8))
    )
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const now = new Date()
    const validFrom = now.toISOString()
    const validUntil = new Date(
      now.setFullYear(now.getFullYear() + 1)
    ).toISOString()

    return {
      subject,
      issuer: 'AC de Demonstração Teste',
      validFrom,
      validUntil,
      serialNumber,
      publicKey,
      signature: `ca_signature_${serialNumber}`,
    }
  }

  // Verificar um certificado
  static verifyCertificate(certificate: Certificate): boolean {
    const now = new Date()
    const validFrom = new Date(certificate.validFrom)
    const validUntil = new Date(certificate.validUntil)

    return (
      certificate.subject.length > 0 &&
      certificate.issuer.length > 0 &&
      certificate.serialNumber.length > 0 &&
      certificate.signature.length > 0 &&
      now >= validFrom &&
      now <= validUntil
    )
  }

  // Exportar uma chave para o formato especificado
  static async exportKey(
    key: CryptoKey,
    format: 'jwk' | 'raw' | 'spki' | 'pkcs8'
  ) {
    return await window.crypto.subtle.exportKey(format, key)
  }

  // Funções auxiliares para conversão de dados
  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  static arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  static hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = Number.parseInt(hex.substr(i, 2), 16)
    }
    return bytes.buffer
  }
}
