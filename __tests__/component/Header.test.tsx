'use client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '@/components/Header';

// Mock Clerk components
jest.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signed-in">{children}</div>
  ),
  SignedOut: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signed-out">{children}</div>
  ),
  SignInButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  UserButton: () => <div data-testid="user-button">User Menu</div>,
}));

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Header', () => {
  it('renders the logo text', () => {
    render(<Header />);
    expect(screen.getByText('tono')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getAllByText('Features').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pricing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Get Started').length).toBeGreaterThan(0);
  });

  it('renders sign in button', () => {
    render(<Header />);
    // Note: Button text is "Sign In" with capital I
    const signInButtons = screen.getAllByText('Sign In');
    expect(signInButtons.length).toBeGreaterThan(0);
  });

  it('renders start playing button (sign up)', () => {
    render(<Header />);
    // Note: Sign up button text is "Start Playing"
    const startPlayingButtons = screen.getAllByText('Start Playing');
    expect(startPlayingButtons.length).toBeGreaterThan(0);
  });

  it('renders user button and dashboard link', () => {
    render(<Header />);
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('toggles mobile menu when menu button is clicked', async () => {
    const { container } = render(<Header />);
    const toggleButton = screen.getByRole('button', { name: 'Toggle mobile menu' });
    await userEvent.click(toggleButton);
    const mobileMenus = container.querySelectorAll('nav');
    const mobileMenu = Array.from(mobileMenus).find(
      (nav) => nav.className.includes('fixed') && nav.className.includes('right-0')
    );
    expect(mobileMenu).toBeInTheDocument();
  });
});
