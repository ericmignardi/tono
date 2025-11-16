import { z } from 'zod';

export const ToneCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  artist: z
    .string()
    .trim()
    .min(1, 'Artist is required')
    .max(100, 'Artist must be 100 characters or less'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  guitar: z
    .string()
    .trim()
    .min(1, 'Guitar is required')
    .max(150, 'Guitar must be 150 characters or less'),
  pickups: z
    .string()
    .trim()
    .min(1, 'Pickups are required')
    .max(150, 'Pickups must be 150 characters or less'),
  strings: z
    .string()
    .trim()
    .min(1, 'Strings are required')
    .max(50, 'Strings must be 50 characters or less'),
  amp: z.string().trim().min(1, 'Amp is required').max(150, 'Amp must be 150 characters or less'),
});

export const ToneUpdateSchema = ToneCreateSchema.partial();

export const ToneQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
