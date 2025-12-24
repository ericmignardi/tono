import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToneForm from '@/components/dashboard/create-tones/ToneForm';

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { id: 'user_123' },
  }),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock tone type for testing
const mockTone = {
  id: '1',
  userId: 'user123',
  name: 'Van Halen Brown Sound',
  artist: 'Eddie Van Halen',
  description: 'Iconic brown sound',
  guitar: 'Frankenstrat',
  pickups: 'Humbucker',
  strings: '09-42',
  amp: 'Marshall Plexi',
  aiAmpSettings: {},
  aiNotes: '',
  audioAnalysis: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ToneForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    // Mock subscription check
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/user/subscription-status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ hasActiveSubscription: false }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: '1' }),
      });
    });
  });

  it('renders all form fields', () => {
    render(<ToneForm />);
    // Labels have asterisks
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/artist/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/guitar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pickups/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/strings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amp/i)).toBeInTheDocument();
  });

  it('renders "Generate Tone" button when creating new tone', () => {
    render(<ToneForm />);
    expect(screen.getByRole('button', { name: /generate tone/i })).toBeInTheDocument();
  });

  it('renders "Update Tone" button when editing existing tone', () => {
    render(<ToneForm tone={mockTone} />);
    expect(screen.getByRole('button', { name: /update tone/i })).toBeInTheDocument();
  });

  it('renders card title "Create New Tone" when creating', () => {
    render(<ToneForm />);
    expect(screen.getByText('Create New Tone')).toBeInTheDocument();
  });

  it('renders card title "Edit Tone" when editing', () => {
    render(<ToneForm tone={mockTone} />);
    expect(screen.getByText('Edit Tone')).toBeInTheDocument();
  });

  it('populates form fields with existing tone data when editing', () => {
    render(<ToneForm tone={mockTone} />);
    expect(screen.getByLabelText(/name/i)).toHaveValue(mockTone.name);
    expect(screen.getByLabelText(/artist/i)).toHaveValue(mockTone.artist);
    expect(screen.getByLabelText(/description/i)).toHaveValue(mockTone.description);
    expect(screen.getByLabelText(/guitar/i)).toHaveValue(mockTone.guitar);
    expect(screen.getByLabelText(/amp/i)).toHaveValue(mockTone.amp);
  });

  it('shows validation errors for empty required fields', async () => {
    render(<ToneForm />);

    // Click submit without filling in fields
    await userEvent.click(screen.getByRole('button', { name: /generate tone/i }));

    // Form should not submit if validation fails
    await waitFor(() => {
      // Should not have called the API for tone creation
      const calls = (global.fetch as jest.Mock).mock.calls;
      const toneApiCalls = calls.filter((call) => call[0] === '/api/tones');
      expect(toneApiCalls.length).toBe(0);
    });
  });

  it('shows error message when API returns 403 (credits exhausted)', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/user/subscription-status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ hasActiveSubscription: false }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ code: 'CREDITS_EXHAUSTED' }),
      });
    });

    render(<ToneForm />);

    await userEvent.type(screen.getByLabelText(/name/i), 'Test');
    await userEvent.type(screen.getByLabelText(/artist/i), 'Test');
    await userEvent.type(screen.getByLabelText(/description/i), 'Test description here');
    await userEvent.type(screen.getByLabelText(/guitar/i), 'Test');
    await userEvent.type(screen.getByLabelText(/amp/i), 'Test');

    await userEvent.click(screen.getByRole('button', { name: /generate tone/i }));

    await waitFor(() => {
      expect(screen.getByText(/no credits remaining/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API returns 429 (rate limit)', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/user/subscription-status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ hasActiveSubscription: false }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 429,
        json: () => Promise.resolve({}),
      });
    });

    render(<ToneForm />);

    await userEvent.type(screen.getByLabelText(/name/i), 'Test');
    await userEvent.type(screen.getByLabelText(/artist/i), 'Test');
    await userEvent.type(screen.getByLabelText(/description/i), 'Test description here');
    await userEvent.type(screen.getByLabelText(/guitar/i), 'Test');
    await userEvent.type(screen.getByLabelText(/amp/i), 'Test');

    await userEvent.click(screen.getByRole('button', { name: /generate tone/i }));

    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });
  });

  it('renders cancel button', () => {
    render(<ToneForm />);
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders Pro upgrade prompt for free users', async () => {
    render(<ToneForm />);

    await waitFor(() => {
      expect(screen.getByText(/unlock audio-enhanced tone analysis/i)).toBeInTheDocument();
    });
  });
});
