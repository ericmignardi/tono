import { render, screen } from '@testing-library/react';
import Features from '@/components/home/Features';

describe('Features', () => {
  it('renders the section heading', () => {
    render(<Features />);
    // The heading is "Your Personal" and "Tone Engineer." on separate lines
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/Your Personal/i)).toBeInTheDocument();
    expect(screen.getByText(/Tone Engineer/i)).toBeInTheDocument();
  });

  it('renders the hashtag badges', () => {
    render(<Features />);
    expect(screen.getByText('#ai_powered')).toBeInTheDocument();
    expect(screen.getByText('#gear_match')).toBeInTheDocument();
    expect(screen.getByText('#instant_tone')).toBeInTheDocument();
  });

  it('renders "AI-Powered Analysis" feature', () => {
    render(<Features />);
    // Text is split across <br /> so we check for both parts
    expect(screen.getByText(/AI-Powered/i)).toBeInTheDocument();
    expect(screen.getByText(/Describe any tone in plain English/i)).toBeInTheDocument();
  });

  it('renders "Gear-Specific Settings" feature', () => {
    render(<Features />);
    // Text is split across <br /> so we check for Gear-Specific
    expect(screen.getByText(/Gear-Specific/i)).toBeInTheDocument();
    expect(screen.getByText(/Don't just get generic advice/i)).toBeInTheDocument();
  });

  it('renders "Persistent Library" feature', () => {
    render(<Features />);
    // Text is split across <br />
    expect(screen.getByText(/Persistent/i)).toBeInTheDocument();
    expect(screen.getByText(/Save your favorite configurations/i)).toBeInTheDocument();
  });

  it('renders all three feature cards', () => {
    render(<Features />);
    const h3Elements = screen.getAllByRole('heading', { level: 3 });
    expect(h3Elements.length).toBe(3);
  });
});
