"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Archive, Eye, EyeOff, Lock, Mail, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth_callback"
      ? "Falha ao confirmar sessão. Tente novamente."
      : null
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : signInError.message
      )
      setIsLoading(false)
      return
    }

    const redirectTo = searchParams.get("redirectTo") ?? "/"
    router.push(redirectTo)
    router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Branding */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary/20 via-background to-background p-12 lg:flex">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Archive className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xl font-semibold text-foreground">Arquivo Morto</span>
            <span className="ml-2 rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
              Enterprise
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Sistema de Gestao
              <br />
              <span className="text-primary">Documental</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Controle completo do ciclo de vida dos seus documentos com rastreabilidade, 
              seguranca e conformidade.
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Archive className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Gestao de Caixas</p>
                <p className="text-sm text-muted-foreground">Cadastro e localizacao em tempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Estrutura Hierarquica</p>
                <p className="text-sm text-muted-foreground">Local, Rua, Predio, Andar, Torre e Posicao</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Controle de Acesso</p>
                <p className="text-sm text-muted-foreground">Permissoes granulares por usuario</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-sm text-muted-foreground">
            Grupo DNA Center - Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Archive className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Arquivo Morto</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Bem-vindo de volta
            </h2>
            <p className="text-muted-foreground">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-xs text-primary"
                  >
                    Esqueceu a senha?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Ocultar senha" : "Mostrar senha"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                Manter-me conectado neste dispositivo
              </Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Help */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-center text-sm text-muted-foreground">
              Problemas para acessar?{" "}
              <Button variant="link" className="h-auto p-0 text-primary">
                Contate o suporte
              </Button>
            </p>
          </div>

          {/* Footer - Mobile */}
          <p className="text-center text-xs text-muted-foreground lg:hidden">
            Grupo DNA Center - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  )
}
