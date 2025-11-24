import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  it('renders a button', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });

    expect(button).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button', { name: /click me/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with default variant', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('bg-primary');
  });

  it('renders with destructive variant', () => {
    render(<Button variant="destructive">Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('bg-destructive');
  });

  it('renders with outline variant', () => {
    render(<Button variant="outline">Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('bg-background');
  });

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button.className).toContain('hover:bg-accent');
  });

  it('renders with small size', () => {
    render(<Button size="sm">Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('h-8');
  });

  it('renders with large size', () => {
    render(<Button size="lg">Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('h-10');
  });

  it('renders as disabled', () => {
    render(<Button disabled>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
    expect(button.className).toContain('disabled:opacity-50');
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = jest.fn();

    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>
    );

    await userEvent.click(screen.getByRole('button', { name: /click me/i }));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
