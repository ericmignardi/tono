import { render, screen } from '@testing-library/react';
import Hero from '@/components/home/Hero';

// Mock Clerk components
jest.mock('@clerk/nextjs', () => ({
  SignedOut: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('Hero', () => {
  it('renders the main heading', () => {
    render(<Hero />);
    expect(
      screen.getByRole('heading', { name: /find any guitar tone, instantly./i })
    ).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<Hero />);
    expect(
      screen.getByText(/use ai to recreate the signature sounds of your favourite artists/i)
    ).toBeInTheDocument();
  });

  it('renders the "Powered by OpenAI" badge', () => {
    render(<Hero />);
    expect(screen.getByText(/powered by openai/i)).toBeInTheDocument();
  });

  it('renders the hero image', () => {
    render(<Hero />);
    expect(
      screen.getByRole('img', { name: /tone dashboard page screenshot/i })
    ).toBeInTheDocument();
  });

  it('renders the "Get started" button', () => {
    render(<Hero />);
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });
});
