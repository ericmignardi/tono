import { render, screen } from '@testing-library/react';
import Hero from '@/components/home/Hero';

// Mock the GuestToneForm component since it has its own complex dependencies
jest.mock('@/components/home/GuestToneForm', () => {
  return function MockGuestToneForm() {
    return <div data-testid="guest-tone-form">Mock Guest Tone Form</div>;
  };
});

// Mock the AppWindow component
jest.mock('@/components/ui/app-window', () => ({
  AppWindow: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-window">{children}</div>
  ),
}));

describe('Hero', () => {
  it('renders the main heading', () => {
    render(<Hero />);
    // Just verify the h1 exists
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders heading text content', () => {
    render(<Hero />);
    // The heading is split across multiple elements, so check each part
    expect(screen.getByText(/The best place to/i)).toBeInTheDocument();
    expect(screen.getByText(/the perfect tones/i)).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<Hero />);
    expect(
      screen.getByText(/tono uses advanced AI to analyze your desired sound/i)
    ).toBeInTheDocument();
  });

  it('renders the "Powered by AI" badge', () => {
    render(<Hero />);
    expect(screen.getByText(/Powered by AI/i)).toBeInTheDocument();
  });

  it('renders the live demo label', () => {
    render(<Hero />);
    expect(screen.getByText(/Live Demo - No account required/i)).toBeInTheDocument();
  });

  it('renders the GuestToneForm', () => {
    render(<Hero />);
    expect(screen.getByTestId('guest-tone-form')).toBeInTheDocument();
  });

  it('renders the AppWindow wrapper', () => {
    render(<Hero />);
    expect(screen.getByTestId('app-window')).toBeInTheDocument();
  });
});
