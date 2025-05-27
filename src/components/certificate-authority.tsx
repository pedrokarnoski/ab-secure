'use client'

import React from 'react'
import type { Certificate } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CheckCircle, FileCheck, ShieldAlert } from 'lucide-react'

interface CertificateAuthorityProps {
  aliceCertificate: Certificate | null
  bobCertificate: Certificate | null
}

export function CertificateAuthority({
  aliceCertificate,
  bobCertificate,
}: CertificateAuthorityProps) {
  const formatCertificate = (cert: Certificate | null) => {
    if (!cert) return null

    return {
      subject: cert.subject,
      issuer: cert.issuer,
      validFrom: new Date(cert.validFrom).toLocaleString('pt-BR'),
      validUntil: new Date(cert.validUntil).toLocaleString('pt-BR'),
      serialNumber: cert.serialNumber,
    }
  }

  const aliceCert = formatCertificate(aliceCertificate)
  const bobCert = formatCertificate(bobCertificate)

  return (
    <Card>
      <CardHeader className="bg-yellow-500/10 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-yellow-500" />
          <span>Autoridade Certificadora (AC)</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground mb-4">
          A Autoridade Certificadora (AC) é responsável por emitir e verificar
          certificados digitais, que vinculam uma chave pública a uma
          identidade. Nesta simulação, a AC verifica se as chaves públicas
          pertencem às identidades declaradas (Alice e Bob).
        </p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="certificates">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <span>Certificados emitidos</span>
                <Badge
                  variant="outline"
                  className="ml-2 bg-green-500/10 text-green-500 border-green-500/20"
                >
                  {(aliceCert ? 1 : 0) + (bobCert ? 1 : 0)} Ativos
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {aliceCert && (
                  <div className="border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Certificado da Alice</h3>
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-xs">Válido</span>
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block text-muted-foreground">
                          Titular:
                        </span>
                        <span>{aliceCert.subject}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground">
                          Emissor:
                        </span>
                        <span>{aliceCert.issuer}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground">
                          Válido desde:
                        </span>
                        <span>{aliceCert.validFrom}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground">
                          Válido até:
                        </span>
                        <span>{aliceCert.validUntil}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-muted-foreground">
                          Número de série:
                        </span>
                        <span className="font-mono">
                          {aliceCert.serialNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {bobCert && (
                  <div className="border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Certificado do Bob</h3>
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-xs">Válido</span>
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block text-muted-foreground">
                          Titular:
                        </span>
                        <span>{bobCert.subject}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground">
                          Emissor:
                        </span>
                        <span>{bobCert.issuer}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground">
                          Válido desde:
                        </span>
                        <span>{bobCert.validFrom}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground">
                          Válido até:
                        </span>
                        <span>{bobCert.validUntil}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-muted-foreground">
                          Número de série:
                        </span>
                        <span className="font-mono">
                          {bobCert.serialNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!aliceCert && !bobCert && (
                  <div className="flex flex-col items-center justify-center p-4">
                    <ShieldAlert className="h-8 w-8 text-yellow-500 mb-2" />
                    <p className="text-center text-sm">
                      Nenhum certificado foi emitido ainda.
                    </p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ca-info">
            <AccordionTrigger>
              O que é uma Autoridade Certificadora?
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                <p>
                  Uma Autoridade Certificadora (AC) é uma entidade confiável que
                  emite certificados digitais. Estes certificados são usados
                  para vincular criptograficamente uma entidade a uma chave
                  pública.
                </p>
                <p>
                  Em uma Infraestrutura de Chaves Públicas (ICP), a AC realiza
                  as seguintes funções:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Emite certificados digitais que confirmam a identidade do
                    titular
                  </li>
                  <li>
                    Assina digitalmente estes certificados para evitar
                    adulterações
                  </li>
                  <li>
                    Mantém listas de revogação de certificados (LRC) para
                    certificados que não são mais válidos
                  </li>
                  <li>
                    Atua como um terceiro confiável em que tanto o remetente
                    quanto o destinatário confiam
                  </li>
                </ul>
                <p className="text-muted-foreground text-xs mt-2">
                  Nesta simulação, estamos usando um modelo simplificado de AC
                  para demonstrar os conceitos.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
