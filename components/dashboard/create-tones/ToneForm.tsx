'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ToneCreateSchema } from '@/utils/validation/toneValidation';
import { Tone } from '@prisma/client';

type ToneFormProps = {
  tone?: Tone | null;
};

type ToneFormValues = z.infer<typeof ToneCreateSchema>;

export default function ToneForm({ tone }: ToneFormProps) {
  const router = useRouter();
  const isEditing = !!tone;

  const form = useForm<ToneFormValues>({
    resolver: zodResolver(ToneCreateSchema),
    defaultValues: {
      name: tone?.name ?? '',
      artist: tone?.artist ?? '',
      description: tone?.description ?? '',
      guitar: tone?.guitar ?? '',
      amp: tone?.amp ?? '',
      pickups: tone?.pickups ?? 'Single Coil',
      strings: tone?.strings ?? '.010 - .046',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ToneFormValues) => {
    const url = isEditing ? `/api/tones/${tone?.id}` : '/api/tones';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 403 && responseData.code === 'CREDITS_EXHAUSTED') {
          form.setError('root', {
            message: 'No credits remaining. Please upgrade your plan.',
          });
        } else if (response.status === 429) {
          form.setError('root', {
            message: 'Too many requests. Please slow down and try again.',
          });
        } else if (responseData.validationErrors) {
          form.setError('root', {
            message: 'Please check your input and try again.',
          });
        } else {
          form.setError('root', {
            message: responseData.error || 'Something went wrong. Please try again.',
          });
        }
        return;
      }

      if (isEditing) {
        toast.success('Tone updated successfully!');
        router.push('/dashboard/tones');
        router.refresh();
      } else {
        toast.success('Tone created successfully!');
        router.push('/dashboard/tones');
        router.refresh();
      }
    } catch (error) {
      console.error('Error submitting tone:', error);
      form.setError('root', {
        message: 'Network error. Please check your connection and try again.',
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Tone' : 'Create New Tone'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update your tone settings.'
              : "Describe your desired tone and we'll generate the perfect settings for you."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {form.formState.errors.root && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  {form.formState.errors.root.message}
                </div>
              )}

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Warm Jazz Lead" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Artist */}
              <FormField
                control={form.control}
                name="artist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Mayer, Tame Impala, 80s Metal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the tone you're looking for... (e.g. warm, crunchy, smooth, bright)"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                {/* Guitar */}
                <FormField
                  control={form.control}
                  name="guitar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guitar *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Fender Stratocaster" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pickups */}
                <FormField
                  control={form.control}
                  name="pickups"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickups *</FormLabel>
                      <FormControl>
                        <select
                          className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
                          {...field}
                        >
                          <option value="Single Coil">Single Coil</option>
                          <option value="Humbucker">Humbucker</option>
                          <option value="P-90">P-90</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Amp */}
                <FormField
                  control={form.control}
                  name="amp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amp *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Fender Twin Reverb" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Strings */}
                <FormField
                  control={form.control}
                  name="strings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strings</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. .010 - .046" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEditing ? 'Updating...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      {isEditing ? 'Update Tone' : 'Generate Tone'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
