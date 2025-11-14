import { ToneCreateSchema, ToneUpdateSchema } from '@/utils/validation/toneValidation';
import { z } from 'zod';

export type ToneCreateBody = z.infer<typeof ToneCreateSchema>;

export type ToneUpdateBody = z.infer<typeof ToneUpdateSchema>;
