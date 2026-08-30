import { NextRequest, NextResponse } from 'next/server';
import {
  incrementVisitCount,
  readVisitCount,
  VISIT_SESSION_COOKIE,
  visitStoreConfigured,
} from '@/lib/visitStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0, must-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

const BOT_UA_RE =
  /bot|crawler|spider|slurp|curl|wget|preview|headless|facebookexternalhit|petalbot|bingpreview/i;

function isLikelyNonHuman(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') ?? '';
  if (!userAgent || BOT_UA_RE.test(userAgent)) return true;

  const purpose =
    request.headers.get('purpose') ??
    request.headers.get('sec-purpose') ??
    request.headers.get('x-purpose') ??
    '';
  if (/prefetch|preview/i.test(purpose)) return true;

  if (request.headers.get('x-middleware-prefetch') === '1') return true;
  if (request.headers.get('next-router-prefetch') === '1') return true;

  return false;
}

function json(data: unknown) {
  return NextResponse.json(data, {
    headers: NO_STORE_HEADERS,
  });
}

export async function GET() {
  const count = await readVisitCount();
  return json({
    count,
    configured: visitStoreConfigured,
    counted: false,
  });
}

export async function POST(request: NextRequest) {
  const configured = visitStoreConfigured;
  if (!configured) {
    return json({
      count: 0,
      configured: false,
      counted: false,
    });
  }

  const hasSession = Boolean(request.cookies.get(VISIT_SESSION_COOKIE)?.value);
  const shouldSkipIncrement = hasSession || isLikelyNonHuman(request);
  const count = shouldSkipIncrement
    ? await readVisitCount()
    : await incrementVisitCount();

  const response = json({
    count,
    configured: true,
    counted: !shouldSkipIncrement,
  });

  if (!hasSession) {
    response.cookies.set({
      name: VISIT_SESSION_COOKIE,
      value: '1',
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return response;
}
