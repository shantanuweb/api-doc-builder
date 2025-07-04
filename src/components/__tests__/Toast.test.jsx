import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from '../Toast';
import { describe, it, expect, vi } from 'vitest';

describe('Toast', () => {
  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Hello" onClose={onClose} />);
    fireEvent.click(screen.getByText('×'));
    expect(onClose).toHaveBeenCalled();
  });
});
