'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Lock, Activity, Cpu } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ToneCreateSchema } from '@/utils/validation/toneValidation';
import { motion, AnimatePresence } from 'motion/react';

// Simplified Schema for Guest
const GuestSchema = ToneCreateSchema.pick({
  artist: true,
  amp: true,
  guitar: true,
});

type GuestFormValues = z.infer<typeof GuestSchema>;

interface GeneratedResult {
  aiAmpSettings: Record<string, any>;
  aiNotes: string;
}

export default function GuestToneForm() {
  const router = useRouter();
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [attemptedSave, setAttemptedSave] = useState(false);

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(GuestSchema),
    defaultValues: {
      artist: '',
      amp: '',
      guitar: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: GuestFormValues) => {
    try {
      const response = await fetch('/api/tones/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Daily limit reached');
          setAttemptedSave(true);
        } else {
          toast.error(responseData.error || 'Processing error');
        }
        return;
      }

      setResult({
        aiAmpSettings: responseData.data.ampSettings,
        aiNotes: responseData.data.notes,
      });
      toast.success('Sequence complete');
    } catch {
      toast.error('Connection timeout');
    }
  };

  return (
    <div className="w-full min-h-[400px] flex flex-col">
      <AnimatePresence mode="wait">
        {result || attemptedSave ? (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-full py-6"
          >
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">
                  {attemptedSave ? 'Access Denied' : 'Output Sequence'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground/40 font-mono">00:00:42.109</span>
            </div>

            {attemptedSave ? (
              <div className="flex flex-col items-center justify-center grow px-8 text-center">
                <div className="mb-6 h-12 w-12 flex items-center justify-center rounded border border-destructive/30 bg-destructive/5 text-destructive">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-4 uppercase tracking-tighter">Capacity Reached</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8 max-w-xs">
                  Your daily guest processing license has expired. Initialize a full account to continue operations.
                </p>
              </div>
            ) : (
              <div className="grow px-4 flex flex-col">
                {/* Result Display as Rack Unit */}
                <div className="bg-background border border-border rounded p-px mb-8 shadow-inner">
                  <div className="bg-muted/10 border border-border/50 rounded-sm p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.entries(result!.aiAmpSettings).slice(0, 4).map(([key, val]) => (
                        <div key={key} className="space-y-3">
                          <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">{key}</div>
                          <div className="relative group">
                            <div className="absolute -inset-1 bg-accent/10 rounded blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative h-12 flex items-center justify-center bg-background border border-border rounded font-display text-xl font-bold text-accent">
                              {val}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-muted/5 border-l-2 border-accent p-4 mb-8">
                  <p className="text-[10px] font-medium leading-relaxed text-muted-foreground/80 italic font-mono">
                    "{result?.aiNotes.substring(0, 120)}..."
                  </p>
                </div>
              </div>
            )}

            <div className="mt-auto px-4 space-y-3">
              <Button
                onClick={() => router.push('/sign-up')}
                className="w-full bg-accent text-background text-[10px] font-black uppercase tracking-[0.2em] h-12 rounded-sm hover:bg-accent/90"
              >
                Save Configuration
              </Button>
              {!attemptedSave && (
                <button
                  onClick={() => {
                    setResult(null);
                    form.reset();
                  }}
                  className="w-full text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-foreground transition-colors py-2"
                >
                  Reset Terminal
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full py-6"
          >
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Terminal Input</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-px w-4 bg-border"></span>
                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Active</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 grow space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="artist"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="terminal-label">
                          Source Material / Target Reference
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ARTIST, SONG, OR TONE DESCRIPTION"
                            className="terminal-input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[9px] font-bold uppercase text-accent/80" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="guitar"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="terminal-label">
                            Instrument
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="GUITAR TYPE"
                              className="terminal-input"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amp"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="terminal-label">
                            Processor
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="AMPLIFIER"
                              className="terminal-input"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="terminal-button-primary w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <Activity className="h-3 w-3 animate-pulse text-accent" />
                        <span>Analyzing Frequencies...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Cpu className="h-3 w-3" />
                        <span>Execute Synthesis</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="mt-8 px-4 flex justify-between items-center">
              <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">Ready for input</span>
              <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="h-1 w-1 bg-border rounded-full" />)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
