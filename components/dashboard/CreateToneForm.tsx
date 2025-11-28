'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CreateToneForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    artist: '',
    description: '',
    guitar: '',
    amp: '',
    pickups: 'Single Coil',
    strings: '.010 - .046',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/tones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create tone');
      }

      const data = await response.json();
      toast.success('Tone created successfully!');
      router.push(`/dashboard/tones/${data.id}`);
    } catch (error) {
      console.error('Error creating tone:', error);
      toast.error('Failed to create tone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Tone</CardTitle>
          <CardDescription>
            Describe your desired tone and we'll generate the perfect settings for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Warm Jazz Lead"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Artist */}
            <div className="space-y-2">
              <Label htmlFor="artist">Artist *</Label>
              <Input
                id="artist"
                name="artist"
                placeholder="e.g. John Mayer, Tame Impala, 80s Metal"
                value={formData.artist}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the tone you're looking for... (e.g. warm, crunchy, smooth, bright)"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Guitar */}
              <div className="space-y-2">
                <Label htmlFor="guitar">Guitar *</Label>
                <Input
                  id="guitar"
                  name="guitar"
                  placeholder="e.g. Fender Stratocaster"
                  value={formData.guitar}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Pickups */}
              <div className="space-y-2">
                <Label htmlFor="pickups">Pickups *</Label>
                <select
                  id="pickups"
                  name="pickups"
                  value={formData.pickups}
                  onChange={handleChange}
                  className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
                  required
                >
                  <option value="Single Coil">Single Coil</option>
                  <option value="Humbucker">Humbucker</option>
                  <option value="P-90">P-90</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Amp */}
              <div className="space-y-2">
                <Label htmlFor="amp">Amp *</Label>
                <Input
                  id="amp"
                  name="amp"
                  placeholder="e.g. Fender Twin Reverb"
                  value={formData.amp}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Strings */}
              <div className="space-y-2">
                <Label htmlFor="strings">Strings</Label>
                <Input
                  id="strings"
                  name="strings"
                  placeholder="e.g. .010 - .046"
                  value={formData.strings}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Generate Tone
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
