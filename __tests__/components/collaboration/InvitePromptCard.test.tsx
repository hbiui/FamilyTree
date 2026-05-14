import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import InvitePromptCard from '@/components/collaboration/InvitePromptCard';

describe('InvitePromptCard', () => {
  const mockOnInvite = jest.fn();

  beforeEach(() => {
    mockOnInvite.mockClear();
  });

  it('should render correctly', () => {
    const { getByText } = render(<InvitePromptCard onInvite={mockOnInvite} />);
    
    expect(getByText('邀请家人共同管理')).toBeTruthy();
    expect(getByText('邀请其他家庭成员一起编辑家族树')).toBeTruthy();
    expect(getByText('发送邀请')).toBeTruthy();
  });

  it('should call onInvite when button is pressed', () => {
    const { getByText } = render(<InvitePromptCard onInvite={mockOnInvite} />);
    
    const button = getByText('发送邀请');
    fireEvent.press(button);
    
    expect(mockOnInvite).toHaveBeenCalledTimes(1);
  });

  it('should allow multiple presses', () => {
    const { getByText } = render(<InvitePromptCard onInvite={mockOnInvite} />);
    
    const button = getByText('发送邀请');
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);
    
    expect(mockOnInvite).toHaveBeenCalledTimes(3);
  });

  it('should render with default styles', () => {
    const { getByText } = render(<InvitePromptCard onInvite={mockOnInvite} />);
    
    const button = getByText('发送邀请');
    expect(button).toBeTruthy();
  });
});