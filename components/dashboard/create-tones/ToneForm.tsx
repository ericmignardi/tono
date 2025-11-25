'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { Tone } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ToneCreateSchema } from '@/utils/validation/toneValidation';
import { toast } from 'sonner';

type ToneFormProps = {
  tone?: Tone | null;
};

type FormValues = z.infer<typeof ToneCreateSchema>;

export default function ToneForm({ tone }: ToneFormProps) {
  const router = useRouter();
  const isEditing = !!tone;

  const form = useForm<FormValues>({
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

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: FormValues) => {
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
          form.setError('root', {
            message: 'No credits remaining. Please upgrade your plan.',
          });
        } else if (res.status === 429) {
          form.setError('root', {
            message: 'Too many requests. Please slow down and try again.',
          });
        } else if (data.validationErrors) {
          form.setError('root', {
            message: 'Please check your input and try again.',
          });
        } else {
          form.setError('root', {
            message: data.error || 'Something went wrong. Please try again.',
          });
        }
        return;
      }

      if (isEditing) {
        router.push('/dashboard/tones');
        router.refresh();
        toast.success('Tone updated successfully!');
      } else {
        form.reset();
        router.push('/dashboard/tones');
        router.refresh();
        toast.success('Tone created successfully!');
      }
    } catch {
      form.setError('root', {
        message: 'Network error. Please check your connection and try again.',
      });
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {form.formState.errors.root && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {form.formState.errors.root.message}
          </div>
        )}

        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: fieldProps }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input {...fieldProps} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEditing
              ? 'Updating...'
              : 'Creating...'
            : isEditing
              ? 'Update Tone'
              : 'Create Tone'}
        </Button>
      </form>
    </Form>
  );
}
