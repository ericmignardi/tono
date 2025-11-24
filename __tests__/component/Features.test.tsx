import { render, screen } from '@testing-library/react';
import Features from '@/components/home/Features';

describe('Features', () => {
  it('renders the section heading', () => {
    render(<Features />);
    expect(
      screen.getByRole('heading', { name: /everything a guitarist needs in one place/i })
    ).toBeInTheDocument();
  });

  it('renders the "Our Features" badge', () => {
    render(<Features />);
    expect(screen.getByText(/our features/i)).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<Features />);
    expect(screen.getByText(/all-in-one solution for tone management/i)).toBeInTheDocument();
  });

  it('renders all 6 feature cards', () => {
    render(<Features />);
    expect(screen.getByText(/instant tone generation/i)).toBeInTheDocument();
    expect(screen.getByText(/gear-specific results/i)).toBeInTheDocument();
    expect(screen.getByText(/tone library/i)).toBeInTheDocument();
    expect(screen.getByText(/ai-powered intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/endless refinement/i)).toBeInTheDocument();
    expect(screen.getByText(/stop wasting time/i)).toBeInTheDocument();
  });

  it('renders "Instant Tone Generation" feature', () => {
    render(<Features />);
    expect(screen.getByText(/instant tone generation/i)).toBeInTheDocument();
    expect(screen.getByText(/professional amp settings/i)).toBeInTheDocument();
  });

  it('renders "Gear-Specific Results" feature', () => {
    render(<Features />);
    expect(screen.getByText(/gear-specific results/i)).toBeInTheDocument();
  });

  it('renders "Tone Library" feature', () => {
    render(<Features />);
    expect(screen.getByText(/tone library/i)).toBeInTheDocument();
  });

  it('renders "AI-Powered Intelligence" feature', () => {
    render(<Features />);
    expect(screen.getByText(/ai-powered intelligence/i)).toBeInTheDocument();
  });

  it('renders "Endless Refinement" feature', () => {
    render(<Features />);
    expect(screen.getByText(/endless refinement/i)).toBeInTheDocument();
  });

  it('renders "Stop Wasting Time" feature', () => {
    render(<Features />);
    expect(screen.getByText(/stop wasting time/i)).toBeInTheDocument();
  });
});
