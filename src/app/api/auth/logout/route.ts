import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/** POST /api/auth/logout — Elimina la cookie de sesión */
export async function POST() {
  ;(await cookies()).delete('session')
  return NextResponse.json({ success: true })
}
