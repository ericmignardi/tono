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
import { Cpu, Loader2, Upload, Sparkles, Activity, ShieldAlert } from 'lucide-react';
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

  useEffect(() => {
    async function checkSubscription() {
      try {
        const response = await fetch('/api/user/subscription-status');
        if (response.ok) {
          const data = await response.json();
          setIsPro(data.hasActiveSubscription || false);
        }
      } catch {
        console.error('Failed to check subscription status');
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

        toast.success('Sequence updated');
        router.push('/dashboard/tones');
        router.refresh();
      } else {
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

        toast.success('Synthesis complete');
        router.push('/dashboard/tones');
        router.refresh();
      }
    } catch (error) {
      toast.error('Processing failure');
    }
  };

  const handleError = (response: Response, responseData: any) => {
    if (response.status === 403 && responseData.code === 'CREDITS_EXHAUSTED') {
      form.setError('root', { message: 'Operational credits depleted. System upgrade required.' });
    } else {
      form.setError('root', { message: responseData.error || 'System error detected' });
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-8 space-y-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-px w-8 bg-accent"></span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent">Module: {isEditing ? 'UPDATE-01' : 'SYNTH-01'}</span>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tighter text-foreground md:text-5xl uppercase">
          {isEditing ? 'Modify' : 'Deploy'} <span className="text-muted-foreground/30 italic">Frequency</span>.
        </h1>
      </div>

      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-b from-border/50 to-transparent rounded-xl pointer-events-none"></div>
        <Card className="terminal-card overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded border border-border bg-muted/20">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="font-display text-xl font-bold uppercase tracking-tight">Terminal Configuration</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">Input operational parameters for synthesis</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                {form.formState.errors.root && (
                  <div className="flex items-center gap-3 p-4 border border-destructive/20 bg-destructive/5 rounded text-[10px] font-bold uppercase tracking-widest text-destructive">
                    <ShieldAlert className="h-4 w-4" />
                    {form.formState.errors.root.message}
                  </div>
                )}

                <div className="space-y-8">
                  <div className="grid gap-8 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="terminal-label">Sequence Title</FormLabel>
                          <FormControl>
                            <Input placeholder="E.G. NEURAL LEAD" className="terminal-input" {...field} />
                          </FormControl>
                          <FormMessage className="text-[9px] font-bold uppercase" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="artist"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="terminal-label">Source Blueprint</FormLabel>
                          <FormControl>
                            <Input placeholder="ARTIST OR RECORDING REFERENCE" className="terminal-input" {...field} />
                          </FormControl>
                          <FormMessage className="text-[9px] font-bold uppercase" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="terminal-label">Descriptive Metadata</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="TONAL CHARACTERISTICS (CRUNCH, WARMTH, GAIN STAGING...)"
                            rows={3}
                            className="terminal-input min-h-[100px] py-3 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[9px] font-bold uppercase" />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-8 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="guitar"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="terminal-label">Primary Instrument</FormLabel>
                          <FormControl>
                            <Input placeholder="HARDWARE MODEL" className="terminal-input" {...field} />
                          </FormControl>
                          <FormMessage className="text-[9px] font-bold uppercase" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pickups"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="terminal-label">Transducer Type</FormLabel>
                          <FormControl>
                            <select
                              className="terminal-input w-full px-3 appearance-none outline-hidden"
                              {...field}
                            >
                              <option value="Single Coil">Single Coil</option>
                              <option value="Humbucker">Humbucker</option>
                              <option value="P-90">P-90</option>
                            </select>
                          </FormControl>
                          <FormMessage className="text-[9px] font-bold uppercase" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-8 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="amp"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="terminal-label">Output Processor</FormLabel>
                          <FormControl>
                            <Input placeholder="AMPLIFIER MODEL" className="terminal-input" {...field} />
                          </FormControl>
                          <FormMessage className="text-[9px] font-bold uppercase" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="strings"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="terminal-label">Gauge Specifications</FormLabel>
                          <FormControl>
                            <Input placeholder="E.G. .010 - .046" className="terminal-input" {...field} />
                          </FormControl>
                          <FormMessage className="text-[9px] font-bold uppercase" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {!isEditing && (
                  <div className="pt-4">
                    {isPro ? (
                      <div className="bg-muted/10 border-border border-2 border-dashed rounded-lg p-8">
                        <div className="mb-6 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 flex items-center justify-center rounded border border-accent/30 bg-accent/5">
                              <Sparkles className="text-accent h-4 w-4" />
                            </div>
                            <label className="terminal-label text-foreground">
                              Reference Frequencies
                            </label>
                          </div>
                          <span className="bg-accent text-background text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-sm">
                            PRO-LINK
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <label
                            htmlFor="audio-upload"
                            className="bg-foreground text-background hover:scale-[1.02] cursor-pointer flex items-center gap-2 rounded-sm px-6 py-3 transition-all"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Connect Input</span>
                          </label>
                          <input
                            id="audio-upload"
                            type="file"
                            accept="audio/wav,audio/mp3,audio/mpeg,audio/aiff,audio/aac,audio/ogg,audio/flac"
                            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                          {audioFile && (
                            <div className="flex items-center gap-4">
                              <span className="text-accent text-[10px] font-bold uppercase tracking-widest">✓ {audioFile.name}</span>
                              <button
                                type="button"
                                onClick={() => setAudioFile(null)}
                                className="text-destructive text-[9px] font-black uppercase tracking-widest hover:underline"
                              >
                                Eject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-accent/5 border border-accent/20 rounded-lg p-8 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full border border-accent/30 bg-background shrink-0">
                              <Sparkles className="text-accent h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-foreground terminal-label">
                                Frequency Analysis Locked
                              </h4>
                              <p className="text-muted-foreground text-[11px] font-medium leading-relaxed opacity-60 max-w-sm">
                                Upgrade to Tier 02 to enable AI-powered audio signal reconstruction.
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={() => router.push('/#pricing')}
                            className="bg-accent text-background text-[9px] font-black uppercase tracking-widest px-6 h-10 rounded-sm hover:scale-[1.02]"
                          >
                            Activate Pro
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-border/50 pt-10">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Ready for deployment</span>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4"
                      disabled={isSubmitting}
                    >
                      Abort
                    </button>
                    <Button type="submit" disabled={isSubmitting} className="terminal-button-primary px-8">
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Cpu className="h-3.5 w-3.5" />
                          <span>{isEditing ? 'Execute Update' : 'Initialize Synthesis'}</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
