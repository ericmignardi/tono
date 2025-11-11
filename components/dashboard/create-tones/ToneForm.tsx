import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function ToneForm() {
  const initialForm = {
    name: '',
    artist: '',
    description: '',
    guitar: '',
    pickups: '',
    strings: '',
    amp: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/tones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (res.ok) {
        setFormData(initialForm);
      } else {
        console.error('Error sending OpenAI request');
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      {Object.keys(initialForm).map((key) => (
        <div key={key}>
          <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
          <input
            name={key}
            id={key}
            type="text"
            value={formData[key as keyof typeof initialForm]}
            onChange={handleChange}
          />
        </div>
      ))}
      <Button type="submit">Submit</Button>
    </form>
  );
}
