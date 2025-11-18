/**
 * @jest-environment node
 */
import { GET } from '@/app/api/health/route';
import { prisma } from '@/lib/prisma/database';

// Mock the Prisma client
jest.mock('@/lib/prisma/database', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

describe('GET /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 and healthy status when database is connected', async () => {
    // Mock successful database connection
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ 1: 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      status: 'healthy',
      checks: {
        database: 'connected',
      },
    });
    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp).getTime()).not.toBeNaN();
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should return 503 and unhealthy status when database is disconnected', async () => {
    // Mock database connection failure
    const dbError = new Error('Database connection failed');
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(dbError);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toMatchObject({
      status: 'unhealthy',
      checks: {
        database: 'disconnected',
      },
    });
    expect(data.timestamp).toBeDefined();
    expect(console.error).toHaveBeenCalledWith(
      'Health check - Database connection failed:',
      dbError
    );
  });

  it('should include a valid ISO timestamp', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ 1: 1 }]);

    const beforeTime = new Date().getTime();
    const response = await GET();
    const afterTime = new Date().getTime();
    const data = await response.json();

    const timestamp = new Date(data.timestamp).getTime();
    expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(timestamp).toBeLessThanOrEqual(afterTime);
    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should return JSON response with correct content-type', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ 1: 1 }]);

    const response = await GET();

    expect(response.headers.get('content-type')).toContain('application/json');
  });
});
