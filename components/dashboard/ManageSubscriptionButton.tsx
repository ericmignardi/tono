'use client';

import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
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
      toast.error('Failed to open subscription portal. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Button className="cursor-pointer" onClick={handleManage} disabled={loading} variant="outline">
      <Settings className="mr-2 h-4 w-4" />
      {loading ? 'Loading...' : 'Manage Subscription'}
    </Button>
  );
}
