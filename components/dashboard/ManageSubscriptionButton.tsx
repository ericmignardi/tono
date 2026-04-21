'use client';

import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState<boolean>(false);

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      toast.error('License portal unreachable');
      setLoading(false);
    }
  };

  return (
    <Button 
      className="cursor-pointer border-accent/20 bg-accent/5 text-accent hover:bg-accent/10 hover:border-accent/40 rounded-sm h-10 px-4 transition-all" 
      onClick={handleManage} 
      disabled={loading} 
      variant="outline"
    >
      {loading ? (
        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
      ) : (
        <ShieldCheck className="mr-2 h-3.5 w-3.5" />
      )}
      <span className="text-[10px] font-black uppercase tracking-widest">
        {loading ? 'Connecting...' : 'License Protocol'}
      </span>
    </Button>
  );
}
