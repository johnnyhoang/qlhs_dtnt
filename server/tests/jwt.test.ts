import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('jwt utilities', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.JWT_SECRET = 'phase-1-test-secret';
    process.env.GOOGLE_CLIENT_ID = 'phase-1-test-client-id';
  });

  it('signs and verifies a token payload', async () => {
    const { signToken, verifyToken } = await import('../src/utils/jwt');

    const token = signToken({ id: 123, email: 'admin@example.com' });
    const decoded = verifyToken(token) as { id: number; email: string };

    expect(decoded.id).toBe(123);
    expect(decoded.email).toBe('admin@example.com');
  });
});
