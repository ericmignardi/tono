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
import { Zap, Loader2, Lock, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ToneCreateSchema } from '@/utils/validation/toneValidation';

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
          toast.error('You have used your free daily guest pass!');
          setAttemptedSave(true); // Show upgrade UI
        } else {
          toast.error(responseData.error || 'Something went wrong');
        }
        return;
      }

      setResult({
        aiAmpSettings: responseData.data.ampSettings,
        aiNotes: responseData.data.notes,
      });
      toast.success('Tone generated! Sign up to save it.');
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  if (result || attemptedSave) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-4 text-center">
        <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
          {attemptedSave ? (
            <Lock className="text-primary h-8 w-8" />
          ) : (
            <Zap className="text-primary h-8 w-8" />
          )}
        </div>

        {attemptedSave ? (
          <div>
            <h3 className="text-2xl font-bold">Daily Limit Reached!</h3>
            <p className="text-muted-foreground mt-2 max-w-xs text-sm">
              You've used your free guest pass for today. Sign up to unlock standard access (3 free
              tones!).
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-2xl font-bold">Tone Generated!</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Here are your settings... strictly for your eyes only.
            </p>
          </div>
        )}

        {/* Mock Knobs Visual */}
        {!attemptedSave && result && (
          <div className="bg-muted/50 grid w-full max-w-md grid-cols-4 gap-4 rounded-xl border p-4">
            {Object.entries(result.aiAmpSettings)
              .slice(0, 4)
              .map(([key, val]) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-300 bg-white shadow-sm">
                    <span className="text-xs font-bold text-slate-700">{val}</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase">{key}</span>
                </div>
              ))}
          </div>
        )}

        <div className="flex w-full flex-col gap-3 px-8">
          <Button
            size="lg"
            className="w-full gap-2 text-lg"
            onClick={() => router.push('/sign-up')} // Redirect to signup
          >
            <Save className="h-5 w-5" />
            Sign Up to Save & View All
          </Button>
          {!attemptedSave && (
            <Button
              variant="ghost"
              onClick={() => {
                setResult(null);
                form.reset();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Try another (if limits allow)
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-2">
      <div className="mb-6 text-center">
        <h3 className="text-lg font-bold">Quick Tone Generator</h3>
        <p className="text-muted-foreground text-xs">Try it out! No account required.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="artist"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Artist / Song</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Nirvana, Smells Like Teen Spirit"
                    className="h-9"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guitar"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Your Guitar</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Fender Strat" className="h-9" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Your Amp</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Boss Katana, Fender Twin" className="h-9" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Free Tone
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
