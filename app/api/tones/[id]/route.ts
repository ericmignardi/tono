import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: '' }, { status: 200 });
}

export async function PUT(req: NextRequest) {
  return NextResponse.json({ message: '' }, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({ message: '' }, { status: 209 });
}
