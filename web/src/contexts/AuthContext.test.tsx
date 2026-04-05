import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const Probe = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div>
      <span data-testid="auth-state">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="user-name">{user?.ho_ten ?? 'anonymous'}</span>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hydrates the authenticated user from local storage', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 1,
        username: 'admin',
        ho_ten: 'System Admin',
        vai_tro: 'ADMIN',
      }),
    );

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth-state')).toHaveTextContent('yes');
    expect(screen.getByTestId('user-name')).toHaveTextContent('System Admin');
  });
});
