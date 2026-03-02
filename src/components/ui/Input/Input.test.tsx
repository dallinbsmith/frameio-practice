import { describe, it, expect, vi } from 'vitest';

import { render, screen } from '@/test';

import { Input, TextArea, Select } from './Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<Input label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('displays hint text', () => {
    render(<Input label="Email" hint="We'll never share your email" />);
    expect(
      screen.getByText("We'll never share your email")
    ).toBeInTheDocument();
  });

  it('hides hint when error is shown', () => {
    render(<Input label="Email" hint="Hint text" error="Error text" />);
    expect(screen.getByText('Error text')).toBeInTheDocument();
    expect(screen.queryByText('Hint text')).not.toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const handleChange = vi.fn();
    const { user } = render(<Input label="Name" onChange={handleChange} />);

    await user.type(screen.getByLabelText('Name'), 'John');
    expect(handleChange).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<Input label="Email" disabled />);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  it('sets aria-invalid when there is an error', () => {
    render(<Input label="Email" error="Invalid" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });
});

describe('TextArea', () => {
  it('renders with label', () => {
    render(<TextArea label="Message" />);
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('renders with specified rows', () => {
    render(<TextArea label="Message" rows={10} />);
    expect(screen.getByLabelText('Message')).toHaveAttribute('rows', '10');
  });

  it('displays error message', () => {
    render(<TextArea label="Message" error="Message is required" />);
    expect(screen.getByText('Message is required')).toBeInTheDocument();
  });
});

describe('Select', () => {
  it('renders with label and options', () => {
    render(
      <Select label="Country">
        <option value="">Select...</option>
        <option value="us">United States</option>
        <option value="uk">United Kingdom</option>
      </Select>
    );

    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <Select label="Country" error="Please select a country">
        <option value="">Select...</option>
      </Select>
    );
    expect(screen.getByText('Please select a country')).toBeInTheDocument();
  });
});
