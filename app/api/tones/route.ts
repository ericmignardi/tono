import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { generateToneSettings } from '@/lib/services/openai/toneAiService';
import { toneRateLimit } from '@/lib/rateLimit';
import { ToneCreateSchema, ToneQuerySchema } from '@/utils/validation/toneValidation';
import { ToneCreateBody } from '@/types/toneValidationTypes';

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { success } = await toneRateLimit.limit(user.id);
  if (!success) return NextResponse.json({ message: 'Rate limit exceeded' }, { status: 429 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  });
  if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  try {
    const body: ToneCreateBody = await req.json();
    const parsed = ToneCreateSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { message: 'Invalid input', errors: parsed.error.format() },
        { status: 400 }
      );

    const { name, artist, description, guitar, pickups, strings, amp } = parsed.data;

    const aiResult = await generateToneSettings({
      artist,
      description,
      guitar,
      pickups,
      strings,
      amp,
    });

    const tone = await prisma.tone.create({
      data: {
        userId: dbUser.id,
        name,
        artist,
        description,
        guitar,
        pickups,
        strings,
        amp,
        aiAmpSettings: aiResult.ampSettings,
        aiNotes: aiResult.notes,
      },
    });

    revalidatePath('/dashboard/tones');

    return NextResponse.json({ message: 'Successfully created tone', tone }, { status: 201 });
  } catch (error) {
    console.error(`[Tones POST] Error for user ${user.id}:`, error);
    return NextResponse.json(
      {
        message: 'Failed to create tone',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { success } = await toneRateLimit.limit(user.id);
  if (!success) return NextResponse.json({ message: 'Rate limit exceeded' }, { status: 429 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  });
  if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  try {
    const queryParsed = ToneQuerySchema.parse({
      page: req.nextUrl.searchParams.get('page'),
      limit: req.nextUrl.searchParams.get('limit'),
    });

    const page = Math.max(1, parseInt(queryParsed.page, 10));
    const limit = Math.min(100, Math.max(1, parseInt(queryParsed.limit, 10)));

    const [tones, total] = await Promise.all([
      prisma.tone.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tone.count({ where: { userId: dbUser.id } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        message: 'Successfully fetched tones',
        tones,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[Tones GET] Error for user ${user.id}:`, error);
    return NextResponse.json(
      {
        message: 'Failed to fetch tones',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
