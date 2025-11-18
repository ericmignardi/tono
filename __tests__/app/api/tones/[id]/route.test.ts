/**
 * @jest-environment node
 */
import { GET, PUT, DELETE } from '@/app/api/tones/[id]/route';
import { prisma } from '@/lib/prisma/database';

jest.mock('@/lib/prisma/database', () => ({}));

describe('GET /api/tones/[id]', () => {});

describe('PUT /api/tones/[id]', () => {});

describe('DELETE /api/tones/[id]', () => {});
