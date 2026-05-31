import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Login - Arquivo Morto",
  description: "Acesse o Sistema de Gestao de Arquivo Morto",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense fallback={null}>{children}</Suspense>
}
