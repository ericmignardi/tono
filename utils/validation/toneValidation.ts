import { z } from 'zod';

export const ToneCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  artist: z.string().trim().min(1, 'Artist is required'),
  description: z.string().trim().min(1, 'Description is required'),
  guitar: z.string().trim().min(1, 'Guitar is required'),
  pickups: z.string().trim().min(1, 'Pickups are required'),
  strings: z
    .string()
    .optional()
    .default('.010–.046')
    .transform((str) => str?.trim() || '.010–.046'),
  amp: z.string().trim().min(1, 'Amp is required'),
});

export const ToneQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

export const ToneUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  artist: z.string().trim().min(1, 'Artist is required').optional(),
  description: z.string().trim().min(1, 'Description is required').optional(),
  guitar: z.string().trim().min(1, 'Guitar is required').optional(),
  pickups: z.string().trim().min(1, 'Pickups are required').optional(),
  strings: z
    .string()
    .optional()
    .default('.010–.046')
    .transform((str) => str?.trim() || '.010–.046'),
  amp: z.string().trim().min(1, 'Amp is required').optional(),
});
