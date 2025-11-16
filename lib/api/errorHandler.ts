import { NextResponse } from 'next/server';
import { $ZodIssue } from 'zod/v4/core';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public parsedError?: $ZodIssue[]
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown, requestId?: string) {
  const logData = {
    requestId,
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  };

  if (error instanceof APIError) {
    console.error('API Error:', JSON.stringify(logData));
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(requestId && { requestId }),
        ...(error.parsedError && { validationErrors: error.parsedError }),
      },
      { status: error.statusCode }
    );
  }

  // Unexpected error - log full details but don't expose to client
  console.error('Unexpected error:', JSON.stringify(logData));
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(requestId && { requestId }),
      // Only include details in development
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    },
    { status: 500 }
  );
}

export function logRequest(data: {
  requestId: string;
  method: string;
  path: string;
  userId?: string;
}) {
  console.log(
    JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
      type: 'request',
    })
  );
}
