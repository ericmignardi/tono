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

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('Header', () => {
  it('renders the logo', () => {
    render(<Header />);
    const logos = screen.getAllByAltText('tono logo');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getAllByText('Features').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pricing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Get started').length).toBeGreaterThan(0);
  });

  it('renders sign in and sign up buttons', () => {
    render(<Header />);
    const signInButtons = screen.getAllByText('Sign in');
    const signUpButtons = screen.getAllByText('Sign up');
    expect(signInButtons.length).toBeGreaterThan(0);
    expect(signUpButtons.length).toBeGreaterThan(0);
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
