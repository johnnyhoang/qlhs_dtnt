import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppDataSource } from '../src/data-source';
import { CMSMenuTargetType } from '../src/entities/CMSMenu';
import { CMSContentType, CMSPageStatus } from '../src/entities/CMSPage';
import { CMSService } from '../src/services/cms.service';

vi.mock('../src/data-source', () => ({
  AppDataSource: {
    getRepository: vi.fn(),
  },
}));

describe('CMSService', () => {
  const pageRepo = {
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    findOneBy: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    remove: vi.fn(),
  };

  const menuRepo = {
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    findOneBy: vi.fn(),
    find: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AppDataSource.getRepository).mockImplementation((entity: unknown) => {
      const name = (entity as { name?: string })?.name;
      if (name === 'CMSPage') return pageRepo as never;
      if (name === 'CMSMenu') return menuRepo as never;
      throw new Error(`Unexpected repository request for ${String(name)}`);
    });
  });

  it('sanitizes HTML content when creating a page', async () => {
    pageRepo.create.mockImplementation((input) => input);
    pageRepo.save.mockImplementation(async (input) => ({ id: 1, ...input }));

    const page = await CMSService.createPage(
      {
        tieu_de: 'Trang giới thiệu',
        loai_noi_dung: CMSContentType.HTML,
        noi_dung_html: '<h1>Hello</h1><script>alert(1)</script>',
      },
      10,
    );

    expect(page.slug).toBe('trang-gioi-thieu');
    expect(page.noi_dung_html).toContain('<h1>Hello</h1>');
    expect(page.noi_dung_html).not.toContain('<script>');
  });

  it('resets previous homepage flags when setting a new homepage', async () => {
    pageRepo.create.mockImplementation((input) => input);
    pageRepo.save.mockImplementation(async (input) => ({ id: 2, ...input }));

    await CMSService.createPage(
      {
        tieu_de: 'Trang chủ',
        loai_noi_dung: CMSContentType.HTML,
        noi_dung_html: '<p>Home</p>',
        la_trang_chu: true,
      },
      11,
    );

    expect(pageRepo.update).toHaveBeenCalledWith({ la_trang_chu: true }, { la_trang_chu: false });
  });

  it('rejects publishing a PDF page without an uploaded file', async () => {
    pageRepo.findOneBy.mockResolvedValue({
      id: 5,
      loai_noi_dung: CMSContentType.PDF,
      tep_pdf: undefined,
    });

    await expect(CMSService.publishPage(5)).rejects.toThrow(
      'PDF page cannot be published without an uploaded PDF.',
    );
  });

  it('publishes a valid HTML page', async () => {
    pageRepo.findOneBy.mockResolvedValue({
      id: 7,
      loai_noi_dung: CMSContentType.HTML,
      noi_dung_html: '<p>Ready</p>',
      trang_thai: CMSPageStatus.DRAFT,
    });
    pageRepo.save.mockImplementation(async (input) => input);

    const page = await CMSService.publishPage(7);

    expect(page.trang_thai).toBe(CMSPageStatus.PUBLISHED);
  });

  it('requires a system key for tool menu items', async () => {
    await expect(
      CMSService.createMenu({
        nhan_menu: 'Quản lý học sinh',
        loai_dich: CMSMenuTargetType.TOOL,
      }),
    ).rejects.toThrow('Tool menu items require a system key.');
  });

  it('unpublishes a page by moving it back to draft', async () => {
    pageRepo.findOneBy.mockResolvedValue({
      id: 8,
      trang_thai: CMSPageStatus.PUBLISHED,
    });
    pageRepo.save.mockImplementation(async (input) => input);

    const page = await CMSService.unpublishPage(8);

    expect(page.trang_thai).toBe(CMSPageStatus.DRAFT);
  });

  it('rejects deleting a page that is still linked to a menu', async () => {
    pageRepo.findOneBy.mockResolvedValue({ id: 12 });
    menuRepo.findOneBy.mockResolvedValue({ id: 55, page_id: 12 });

    await expect(CMSService.deletePage(12)).rejects.toThrow(
      'CMS page is linked to one or more menu items.',
    );
  });

  it('rejects deleting a menu that still has child menus', async () => {
    menuRepo.findOneBy
      .mockResolvedValueOnce({ id: 20, khoa_he_thong_bat_buoc: false })
      .mockResolvedValueOnce({ id: 21, parent_id: 20 });

    await expect(CMSService.deleteMenu(20)).rejects.toThrow(
      'CMS menu cannot be deleted while it still has child items.',
    );
  });
});
