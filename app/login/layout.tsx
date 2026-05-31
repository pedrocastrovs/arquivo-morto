import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Arquivo Morto",
  description: "Acesse o Sistema de Gestao de Arquivo Morto",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
