/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/tones/route';
import { prisma } from '@/lib/prisma/database';

jest.mock('@/lib/prisma/database', () => ({}));

describe('POST /api/tones', () => {});

describe('GET /api/tones', () => {});
