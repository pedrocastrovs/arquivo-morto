"use client"

import { useEffect, useState } from "react"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/types"

const roleLabels: Record<UserRole, string> = {
  administrador: "Administrador",
  operador: "Operador",
  consultante: "Consultante",
}

interface Profile {
  name: string
  role: UserRole
}

export function UserMenu() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile({
          name: data.name as string,
          role: data.role as UserRole,
        })
      } else {
        setProfile({
          name: user.email?.split("@")[0] ?? "Usuário",
          role: "operador",
        })
      }
    }

    load()
  }, [])

  const initials = (profile?.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium">{profile?.name ?? "Carregando…"}</p>
            <p className="text-xs text-muted-foreground">
              {profile ? roleLabels[profile.role] : "—"}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem>Configurações</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full cursor-pointer text-left">
              Sair
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
