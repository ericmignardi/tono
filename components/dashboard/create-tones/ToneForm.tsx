'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Tone } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ToneCreateSchema } from '@/utils/validation/toneValidation';
import { useState } from 'react';

type ToneFormProps = {
  tone?: Tone | null;
};

type FormValues = z.infer<typeof ToneCreateSchema>;

export default function ToneForm({ tone }: ToneFormProps) {
  const router = useRouter();
  const isEditing = !!tone;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(ToneCreateSchema),
    defaultValues: {
      name: tone?.name ?? '',
      artist: tone?.artist ?? '',
      description: tone?.description ?? '',
      guitar: tone?.guitar ?? '',
      pickups: tone?.pickups ?? '',
      strings: tone?.strings ?? '.010–.046',
      amp: tone?.amp ?? '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSuccess(false);

    const url = isEditing ? `/api/tones/${tone?.id}` : '/api/tones';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.code === 'CREDITS_EXHAUSTED') {
          setError('No credits remaining. Please upgrade your plan.');
        } else if (res.status === 429) {
          setError('Too many requests. Please slow down and try again.');
        } else if (data.validationErrors) {
          setError('Please check your input and try again.');
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
        return;
      }

      if (isEditing) {
        router.push('/dashboard/tones');
        router.refresh();
      } else {
        reset();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    }
  };

  const fields = [
    { name: 'name' as const, label: 'Name' },
    { name: 'artist' as const, label: 'Artist' },
    { name: 'description' as const, label: 'Description' },
    { name: 'guitar' as const, label: 'Guitar' },
    { name: 'pickups' as const, label: 'Pickups' },
    { name: 'strings' as const, label: 'Strings' },
    { name: 'amp' as const, label: 'Amp' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Tone created successfully! Create another one below.
        </div>
      )}

      {fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            {...register(field.name)}
            aria-invalid={errors[field.name] ? 'true' : 'false'}
            disabled={isSubmitting}
          />
          {errors[field.name] && (
            <p className="text-sm text-red-500">{errors[field.name]?.message}</p>
          )}
        </div>
      ))}

      <Button type="submit" disabled={isSubmitting} variant="outline">
        {isSubmitting
          ? isEditing
            ? 'Updating...'
            : 'Creating...'
          : isEditing
            ? 'Update Tone'
            : 'Create Tone'}
      </Button>
    </form>
  );
}
