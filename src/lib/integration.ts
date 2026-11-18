// Cross-site API access for partner sites — today phledger.com, which shows
// the AI Front Desk and sends pilot applications here.
// Allowed origins can be changed with INTEGRATION_ALLOWED_ORIGINS
// (comma-separated, exact origins).
import { NextResponse } from 'next/server'

const DEFAULT_ORIGINS = ['https://phledger.com', 'https://www.phledger.com', 'http://localhost:3000']

export function allowedOrigins(): string[] {
  const env = process.env.INTEGRATION_ALLOWED_ORIGINS
  return env ? env.split(',').map(s => s.trim()).filter(Boolean) : DEFAULT_ORIGINS
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const h: Record<string, string> = { Vary: 'Origin' }
  if (origin && allowedOrigins().includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin
    h['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    h['Access-Control-Allow-Headers'] = 'content-type'
    h['Access-Control-Max-Age'] = '86400'
  }
  return h
}

export function json(req: Request, body: unknown, status = 200, extra: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...corsHeaders(req.headers.get('origin')), ...extra } })
}

export function preflight(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) })
}

export async function readJson<T>(req: Request): Promise<Partial<T> | null> {
  try {
    const b = await req.json()
    return b && typeof b === 'object' ? b : null
  } catch {
    return null
  }
}
