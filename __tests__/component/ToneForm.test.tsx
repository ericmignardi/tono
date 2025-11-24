import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToneForm from '@/components/dashboard/create-tones/ToneForm';
import { Tone } from '@prisma/client';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
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

describe('ToneForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  const mockTone: Tone = {
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders all form fields', () => {
    render(<ToneForm />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Artist' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Guitar' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Pickups' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Strings' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Amp' })).toBeInTheDocument();
  });

  it('renders "Create Tone" button when creating new tone', () => {
    render(<ToneForm />);
    expect(screen.getByRole('button', { name: 'Create Tone' })).toBeInTheDocument();
  });

  it('renders "Update Tone" button when editing existing tone', () => {
    render(<ToneForm tone={mockTone} />);
    expect(screen.getByRole('button', { name: 'Update Tone' })).toBeInTheDocument();
  });

  it('populates form fields with existing tone data when editing', () => {
    render(<ToneForm tone={mockTone} />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(mockTone.name);
    expect(screen.getByRole('textbox', { name: 'Artist' })).toHaveValue(mockTone.artist);
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(mockTone.description);
    expect(screen.getByRole('textbox', { name: 'Guitar' })).toHaveValue(mockTone.guitar);
    expect(screen.getByRole('textbox', { name: 'Pickups' })).toHaveValue(mockTone.pickups);
    expect(screen.getByRole('textbox', { name: 'Strings' })).toHaveValue(mockTone.strings);
    expect(screen.getByRole('textbox', { name: 'Amp' })).toHaveValue(mockTone.amp);
  });

  it('submits form with valid data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1' }),
    });

    render(<ToneForm />);

    await userEvent.type(screen.getByLabelText(/name/i), 'Test Tone');
    await userEvent.type(screen.getByLabelText(/artist/i), 'Test Artist');
    await userEvent.type(screen.getByLabelText(/description/i), 'Test Description');
    await userEvent.type(screen.getByLabelText(/guitar/i), 'Test Guitar');
    await userEvent.type(screen.getByLabelText(/pickups/i), 'Test Pickups');
    await userEvent.type(screen.getByLabelText(/strings/i), 'Test Strings');
    await userEvent.type(screen.getByLabelText(/amp/i), 'Test Amp');

    await userEvent.click(screen.getByRole('button', { name: /create tone/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tones',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('shows validation errors for empty required fields', async () => {
    render(<ToneForm />);

    await userEvent.click(screen.getByRole('button', { name: /create tone/i }));

    // Form should not submit if validation fails
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('shows error message when API returns 403 (credits exhausted)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ code: 'CREDITS_EXHAUSTED' }),
    });

    render(<ToneForm />);

    await userEvent.type(screen.getByLabelText(/name/i), 'Test');
    await userEvent.type(screen.getByLabelText(/artist/i), 'Test');
    await userEvent.type(screen.getByLabelText(/description/i), 'Test');
    await userEvent.type(screen.getByLabelText(/guitar/i), 'Test');
    await userEvent.type(screen.getByLabelText(/pickups/i), 'Test');
    await userEvent.type(screen.getByLabelText(/strings/i), 'Test');
    await userEvent.type(screen.getByLabelText(/amp/i), 'Test');

    await userEvent.click(screen.getByRole('button', { name: /create tone/i }));

    await waitFor(() => {
      expect(screen.getByText(/no credits remaining/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API returns 429 (rate limit)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({}),
    });

    render(<ToneForm />);

    await userEvent.type(screen.getByLabelText(/name/i), 'Test');
    await userEvent.type(screen.getByLabelText(/artist/i), 'Test');
    await userEvent.type(screen.getByLabelText(/description/i), 'Test');
    await userEvent.type(screen.getByLabelText(/guitar/i), 'Test');
    await userEvent.type(screen.getByLabelText(/pickups/i), 'Test');
    await userEvent.type(screen.getByLabelText(/strings/i), 'Test');
    await userEvent.type(screen.getByLabelText(/amp/i), 'Test');

    await userEvent.click(screen.getByRole('button', { name: /create tone/i }));

    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ id: '1' }),
              }),
            100
          )
        )
    );

    render(<ToneForm />);

    await userEvent.type(screen.getByLabelText(/name/i), 'Test');
    await userEvent.type(screen.getByLabelText(/artist/i), 'Test');
    await userEvent.type(screen.getByLabelText(/description/i), 'Test');
    await userEvent.type(screen.getByLabelText(/guitar/i), 'Test');
    await userEvent.type(screen.getByLabelText(/pickups/i), 'Test');
    await userEvent.type(screen.getByLabelText(/strings/i), 'Test');
    await userEvent.type(screen.getByLabelText(/amp/i), 'Test');

    const submitButton = screen.getByRole('button', { name: /create tone/i });
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/creating/i);
  });
});
