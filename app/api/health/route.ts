import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown' as 'connected' | 'disconnected' | 'unknown',
    },
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = 'connected';
  } catch (error) {
    checks.status = 'unhealthy';
    checks.checks.database = 'disconnected';
    console.error('Health check - Database connection failed:', error);
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503;

  return NextResponse.json(checks, { status: statusCode });
}
