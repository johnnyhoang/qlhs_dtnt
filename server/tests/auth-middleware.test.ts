import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const verifyTokenMock = vi.fn();
const getUserWithPermissionsMock = vi.fn();

vi.mock('../src/utils/jwt', () => ({
  verifyToken: verifyTokenMock,
}));

vi.mock('../src/services/nguoi-dung.service', () => ({
  NguoiDungService: {
    getUserWithPermissions: getUserWithPermissionsMock,
  },
}));

describe('auth middleware integration', () => {
  beforeEach(() => {
    verifyTokenMock.mockReset();
    getUserWithPermissionsMock.mockReset();
  });

  it('attaches the authenticated user to the request', async () => {
    const { authMiddleware } = await import('../src/middlewares/auth.middleware');
    verifyTokenMock.mockReturnValue({ id: 42 });
    getUserWithPermissionsMock.mockResolvedValue({
      id: 42,
      email: 'admin@example.com',
      vai_tro: 'ADMIN',
      danh_sach_quyen: [],
    });

    const app = express();
    app.get('/protected', authMiddleware, (req, res) => {
      res.json({ user: (req as any).user });
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('admin@example.com');
  }, 30000);
});
