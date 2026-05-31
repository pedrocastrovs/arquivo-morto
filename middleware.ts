import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

const PUBLIC_PATHS = ["/login", "/auth"]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}

/** Server Actions usam POST; redirect no middleware quebra com "Failed to fetch". */
function isServerAction(request: NextRequest) {
  return (
    request.method === "POST" &&
    (request.headers.has("next-action") ||
      request.headers.has("Next-Action") ||
      request.headers.has("x-action"))
  )
}

export async function middleware(request: NextRequest) {
  if (isServerAction(request)) {
    try {
      const { supabaseResponse } = await updateSession(request)
      return supabaseResponse
    } catch {
      return NextResponse.next()
    }
  }

  try {
    const { supabaseResponse, user } = await updateSession(request)

    if (request.nextUrl.pathname === "/login") {
      if (user) {
        return NextResponse.redirect(new URL("/", request.url))
      }
      return NextResponse.next()
    }

    if (isPublicPath(request.nextUrl.pathname)) {
      return supabaseResponse
    }

    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = "/login"
      loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
  } catch {
    if (request.method === "POST") {
      return NextResponse.next()
    }
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
