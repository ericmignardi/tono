import {
  ToneCreateSchema,
  ToneUpdateSchema,
  ToneQuerySchema,
} from '@/utils/validation/toneValidation';

describe('ToneCreateSchema', () => {
  it('should validate a valid tone creation request', () => {
    const validData = {
      name: 'Test Tone',
      artist: 'Test Artist',
      description: 'This is a test tone',
      guitar: 'Test Guitar',
      pickups: 'Test Pickups',
      strings: 'Test Strings',
      amp: 'Test Amp',
    };

    const result = ToneCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail if name is missing', () => {
    const invalidData = {
      artist: 'Test Artist',
      description: 'This is a test tone',
      guitar: 'Test Guitar',
      pickups: 'Test Pickups',
      strings: 'Test Strings',
      amp: 'Test Amp',
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if name is too long', () => {
    const invalidData = {
      name: 'a'.repeat(101),
      artist: 'Test Artist',
      description: 'This is a test tone',
      guitar: 'Test Guitar',
      pickups: 'Test Pickups',
      strings: 'Test Strings',
      amp: 'Test Amp',
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if artist is missing', () => {
    const invalidData = {
      name: 'Test Tone',
      description: 'This is a test tone',
      guitar: 'Test Guitar',
      pickups: 'Test Pickups',
      strings: 'Test Strings',
      amp: 'Test Amp',
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if artist is too long', () => {
    const invalidData = {
      name: 'Test Tone',
      artist: 'a'.repeat(101),
      description: 'This is a test tone',
      guitar: 'Test Guitar',
      pickups: 'Test Pickups',
      strings: 'Test Strings',
      amp: 'Test Amp',
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if description is missing', () => {
    const invalidData = {
      name: 'Test Tone',
      artist: 'Test Artist',
      guitar: 'Test Guitar',
      pickups: 'Test Pickups',
      strings: 'Test Strings',
      amp: 'Test Amp',
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if description is too long', () => {
    const invalidData = {
      name: 'Test Tone',
      artist: 'Test Artist',
      description: 'a'.repeat(501),
      guitar: 'Test Guitar',
      pickups: 'Test Pickups',
      strings: 'Test Strings',
      amp: 'Test Amp',
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if guitar is missing', () => {
    const invalidData = {
      name: 'Test Tone',
      artist: 'Test Artist',
      description: 'This is a test tone',
      pickups: 'Test Pickups',
      strings: 'Test Strings',
      amp: 'Test Amp',
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if guitar is too long', () => {
    const invalidData = {
      name: 'Test Tone',
      artist: 'Test Artist',
      description: 'This is a test tone',
      guitar: 'a'.repeat(151),
      pickups: 'Test Pickups',
      strings: 'Test Strings',
      amp: 'Test Amp',
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if pickups is missing', () => {
    const invalidData = {
      name: 'Test Tone',
      artist: 'Test Artist',
      description: 'This is a test tone',
      guitar: 'Test Guitar',
      strings: 'Test Strings',
      amp: 'Test Amp',
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if pickups is too long', () => {
    const invalidData = {
      name: 'Test Tone',
      artist: 'Test Artist',
      description: 'This is a test tone',
      guitar: 'Test Guitar',
      pickups: 'a'.repeat(151),
      strings: 'Test Strings',
      amp: 'Test Amp',
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if strings is missing', () => {
    const invalidData = {
      name: 'Test Tone',
      artist: 'Test Artist',
      description: 'This is a test tone',
      guitar: 'Test Guitar',
      pickups: 'Test Pickups',
      amp: 'Test Amp',
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if strings is too long', () => {
    const invalidData = {
      name: 'Test Tone',
      artist: 'Test Artist',
      description: 'This is a test tone',
      guitar: 'Test Guitar',
      pickups: 'Test Pickups',
      strings: 'a'.repeat(51),
      amp: 'Test Amp',
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if amp is missing', () => {
    const invalidData = {
      name: 'Test Tone',
      artist: 'Test Artist',
      description: 'This is a test tone',
      guitar: 'Test Guitar',
      pickups: 'Test Pickups',
      strings: 'Test Strings',
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if amp is too long', () => {
    const invalidData = {
      name: 'Test Tone',
      artist: 'Test Artist',
      description: 'This is a test tone',
      guitar: 'Test Guitar',
      pickups: 'Test Pickups',
      strings: 'Test Strings',
      amp: 'a'.repeat(151),
    };

    const result = ToneCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('ToneUpdateSchema', () => {
  it('should validate a partial update', () => {
    const validData = {
      name: 'Updated Name',
    };

    const result = ToneUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('ToneQuerySchema', () => {
  it('should use default values if empty', () => {
    const result = ToneQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('should coerce string numbers', () => {
    const result = ToneQuerySchema.safeParse({ page: '2', limit: '50' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it('should fail on invalid numbers', () => {
    const result = ToneQuerySchema.safeParse({ page: -1, limit: 101 });
    expect(result.success).toBe(false);
  });
});
