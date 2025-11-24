import { render, screen } from '@testing-library/react';
import ToneCard from '@/components/dashboard/tones/ToneCard';
import { Tone } from '@prisma/client';

describe('ToneCard', () => {
  const mockTone: Tone = {
    id: '1',
    userId: 'user123',
    name: 'Van Halen Brown Sound',
    artist: 'Eddie Van Halen',
    description: 'Iconic brown sound from Van Halen I',
    guitar: 'Frankenstrat',
    pickups: 'Humbucker',
    strings: '09-42',
    amp: 'Marshall Plexi',
    aiAmpSettings: {
      gain: 7,
      treble: 6,
      mid: 5,
      bass: 4,
      volume: 8,
      presence: 6,
      reverb: 3,
    },
    aiNotes: 'Classic rock tone with high gain and presence',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  it('renders the tone name', () => {
    render(<ToneCard tone={mockTone} />);
    expect(screen.getByText(mockTone.name)).toBeInTheDocument();
  });

  it('renders the tone description', () => {
    render(<ToneCard tone={mockTone} />);
    expect(screen.getByText(mockTone.description)).toBeInTheDocument();
  });

  it('renders as a card component', () => {
    const { container } = render(<ToneCard tone={mockTone} />);
    const card = container.querySelector('[data-slot="card"]');
    expect(card).toBeInTheDocument();
  });
});
