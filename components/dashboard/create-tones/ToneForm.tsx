'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser } from '@clerk/nextjs';
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
import { Zap, Loader2, Upload, Sparkles } from 'lucide-react';
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
  const { user } = useUser();
  const isEditing = !!tone;
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Fetch user's subscription status from database
  useEffect(() => {
    async function checkSubscription() {
      try {
        const response = await fetch('/api/user/subscription-status');
        if (response.ok) {
          const data = await response.json();
          setIsPro(data.hasActiveSubscription || false);
        }
      } catch (error) {
        console.error('Failed to check subscription status:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    }

    if (user) {
      checkSubscription();
    }
  }, [user]);

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
      // For create, use FormData to support audio upload
      // For edit, keep using JSON (audio upload not supported on edit)
      if (isEditing) {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
          handleError(response, responseData);
          return;
        }

        toast.success('Tone updated successfully!');
        router.push('/dashboard/tones');
        router.refresh();
      } else {
        // Create new tone with FormData
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('artist', data.artist);
        formData.append('description', data.description);
        formData.append('guitar', data.guitar);
        formData.append('pickups', data.pickups);
        formData.append('strings', data.strings || '');
        formData.append('amp', data.amp);

        if (audioFile) {
          formData.append('audioFile', audioFile);
        }

        const response = await fetch(url, {
          method,
          body: formData,
        });

        const responseData = await response.json();

        if (!response.ok) {
          handleError(response, responseData);
          return;
        }

        toast.success(
          audioFile ? 'Tone created with audio analysis!' : 'Tone created successfully!'
        );
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

  const handleError = (response: Response, responseData: any) => {
    if (response.status === 403 && responseData.code === 'CREDITS_EXHAUSTED') {
      form.setError('root', {
        message: 'No credits remaining. Please upgrade your plan.',
      });
    } else if (response.status === 403 && responseData.code === 'FEATURE_NOT_AVAILABLE') {
      form.setError('root', {
        message: 'Audio analysis is only available for Pro subscribers.',
      });
    } else if (response.status === 429) {
      form.setError('root', {
        message: 'Too many requests. Please slow down and try again.',
      });
    } else if (response.status === 400 && responseData.code === 'INVALID_AUDIO_FILE') {
      form.setError('root', {
        message: responseData.error || 'Invalid audio file. Please check the format and size.',
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

              {/* Audio Upload Section - Only show for create, not edit */}
              {!isEditing && (
                <>
                  {isPro ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
                      <div className="mb-2 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <label className="text-sm font-medium">
                          Upload Reference Audio (Optional)
                        </label>
                        <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                          PRO
                        </span>
                      </div>
                      <p className="mb-4 text-sm text-gray-600">
                        Upload an audio clip of your desired tone for AI-enhanced analysis and more
                        accurate recommendations.
                      </p>
                      <div className="flex items-center gap-4">
                        <label
                          htmlFor="audio-upload"
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">Choose Audio File</span>
                        </label>
                        <input
                          id="audio-upload"
                          type="file"
                          accept="audio/wav,audio/mp3,audio/mpeg,audio/aiff,audio/aac,audio/ogg,audio/flac"
                          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        {audioFile && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-green-600">✓ {audioFile.name}</span>
                            <span className="text-gray-500">
                              ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                            <button
                              type="button"
                              onClick={() => setAudioFile(null)}
                              className="text-xs text-red-600 underline hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Supported formats: MP3, WAV, FLAC, AAC, OGG, AIFF (max 20MB)
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                      <div className="flex items-start gap-3">
                        <Sparkles className="mt-0.5 h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <h4 className="mb-1 text-sm font-semibold text-blue-900">
                            🎸 Unlock Audio-Enhanced Tone Analysis
                          </h4>
                          <p className="mb-3 text-sm text-blue-800">
                            Upgrade to <strong>Pro</strong> to upload audio clips and get AI-powered
                            tone analysis for incredibly accurate amp settings!
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/#pricing')}
                            className="border-blue-300 bg-white text-blue-700 hover:bg-blue-50"
                          >
                            Upgrade to Pro
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

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
