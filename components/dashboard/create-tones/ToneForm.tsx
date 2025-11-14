'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormValues } from '@/types/tone/toneTypes';
import { Tone } from '@prisma/client';

export default function ToneForm({ tone }: { tone?: Tone | null }) {
  const router = useRouter();
  const isEditing = !!tone;

  const initialForm: FormValues = {
    name: tone?.name || '',
    artist: tone?.artist || '',
    description: tone?.description || '',
    guitar: tone?.guitar || '',
    pickups: tone?.pickups || '',
    strings: tone?.strings || '',
    amp: tone?.amp || '',
  };

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isEditing ? `/api/tones/${tone.id}` : '/api/tones';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (res.ok) {
        if (isEditing) {
          router.push('/dashboard/tones');
          router.refresh();
        } else {
          setFormData(initialForm);
        }
      } else {
        console.error('Error sending request:', json.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fields: Array<keyof FormValues> = [
    'name',
    'artist',
    'description',
    'guitar',
    'pickups',
    'strings',
    'amp',
  ];

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {fields.map((fieldName) => (
        <div key={fieldName} className="flex flex-col gap-2">
          <Label htmlFor={fieldName}>
            {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
          </Label>
          <Input
            id={fieldName}
            name={fieldName}
            value={formData[fieldName]}
            onChange={handleChange}
            required
          />
        </div>
      ))}
      <Button className="cursor-pointer" type="submit" disabled={isLoading} variant={'outline'}>
        {isLoading
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
