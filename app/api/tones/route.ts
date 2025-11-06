import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: '' }, { status: 201 });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: '' }, { status: 200 });
}
