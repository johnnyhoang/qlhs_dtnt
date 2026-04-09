import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VaiTro } from '../src/entities/NguoiDung';

const findOneMock = vi.fn();
const countMock = vi.fn();
const createUserMock = vi.fn();
const saveUserMock = vi.fn();

const createPermissionMock = vi.fn();
const savePermissionsMock = vi.fn();

const getRepositoryMock = vi.fn();

vi.mock('../src/data-source', () => ({
  AppDataSource: {
    getRepository: getRepositoryMock,
  },
}));

describe('NguoiDungService.findOrCreateByEmail', () => {
  beforeEach(() => {
    findOneMock.mockReset();
    countMock.mockReset();
    createUserMock.mockReset();
    saveUserMock.mockReset();
    createPermissionMock.mockReset();
    savePermissionsMock.mockReset();
    getRepositoryMock.mockReset();
  });

  it('creates a new user with default CDS view/edit permissions', async () => {
    const createdUser = {
      id: 12,
      email: 'teacher@example.com',
      ho_ten: 'Teacher Example',
      vai_tro: VaiTro.USER,
      kich_hoat: true,
    };

    findOneMock.mockResolvedValue(null);
    countMock.mockResolvedValue(1);
    createUserMock.mockReturnValue(createdUser);
    saveUserMock.mockResolvedValue(createdUser);
    createPermissionMock.mockImplementation((value) => value);
    savePermissionsMock.mockResolvedValue([
      {
        id: 77,
        nguoi_dung_id: 12,
        ma_module: 'cds',
        co_quyen_xem: true,
        co_quyen_sua: true,
      },
    ]);

    getRepositoryMock
      .mockReturnValueOnce({
        findOne: findOneMock,
        count: countMock,
        create: createUserMock,
        save: saveUserMock,
      })
      .mockReturnValueOnce({
        create: createPermissionMock,
        save: savePermissionsMock,
      });

    const { NguoiDungService } = await import('../src/services/nguoi-dung.service');

    const result = await NguoiDungService.findOrCreateByEmail(
      'teacher@example.com',
      'Teacher Example',
      'avatar.png',
    );

    expect(createUserMock).toHaveBeenCalledWith({
      email: 'teacher@example.com',
      ho_ten: 'Teacher Example',
      anh_dai_dien: 'avatar.png',
      vai_tro: VaiTro.USER,
      kich_hoat: true,
    });
    expect(createPermissionMock).toHaveBeenCalledWith({
      nguoi_dung_id: 12,
      ma_module: 'cds',
      co_quyen_xem: true,
      co_quyen_sua: true,
    });
    expect(result.danh_sach_quyen).toEqual([
      expect.objectContaining({
        ma_module: 'cds',
        co_quyen_xem: true,
        co_quyen_sua: true,
      }),
    ]);
  });

  it('backfills default CDS permissions for existing users when they are missing', async () => {
    const existingUser = {
      id: 5,
      email: 'existing@example.com',
      ho_ten: 'Existing User',
      vai_tro: VaiTro.USER,
      kich_hoat: true,
      danh_sach_quyen: [],
    };

    findOneMock.mockResolvedValue(existingUser);
    createPermissionMock.mockImplementation((value) => value);
    savePermissionsMock.mockResolvedValue([
      {
        id: 88,
        nguoi_dung_id: 5,
        ma_module: 'cds',
        co_quyen_xem: true,
        co_quyen_sua: true,
      },
    ]);

    getRepositoryMock
      .mockReturnValueOnce({
        findOne: findOneMock,
      })
      .mockReturnValueOnce({
        create: createPermissionMock,
        save: savePermissionsMock,
      });

    const { NguoiDungService } = await import('../src/services/nguoi-dung.service');

    const result = await NguoiDungService.findOrCreateByEmail('existing@example.com', 'Existing User');

    expect(result).toBe(existingUser);
    expect(createPermissionMock).toHaveBeenCalledWith({
      nguoi_dung_id: 5,
      ma_module: 'cds',
      co_quyen_xem: true,
      co_quyen_sua: true,
    });
    expect(savePermissionsMock).toHaveBeenCalledOnce();
    expect(result.danh_sach_quyen).toEqual([
      expect.objectContaining({
        ma_module: 'cds',
        co_quyen_xem: true,
        co_quyen_sua: true,
      }),
    ]);
  });
});
