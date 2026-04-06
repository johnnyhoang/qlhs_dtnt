import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getPublishedMenuTreeMock = vi.fn();
const listAdminMenusMock = vi.fn();
const createMenuMock = vi.fn();
const getHomepageMock = vi.fn();
const getPublishedPageBySlugMock = vi.fn();
const getPublishedPageByPathMock = vi.fn();
const publishPageMock = vi.fn();
const unpublishPageMock = vi.fn();
const deletePageMock = vi.fn();
const deleteMenuMock = vi.fn();

vi.mock('../src/middlewares/auth.middleware', () => ({
  authMiddleware: (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
  editorOrAdmin: (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
}));

vi.mock('../src/services/cms.service', () => ({
  CMSService: {
    getPublishedMenuTree: getPublishedMenuTreeMock,
    listAdminMenus: listAdminMenusMock,
    createMenu: createMenuMock,
    getHomepage: getHomepageMock,
    getPublishedPageBySlug: getPublishedPageBySlugMock,
    getPublishedPageByPath: getPublishedPageByPathMock,
    publishPage: publishPageMock,
    unpublishPage: unpublishPageMock,
    deletePage: deletePageMock,
    deleteMenu: deleteMenuMock,
  },
}));

describe('cms routes integration', () => {
  beforeEach(() => {
    getPublishedMenuTreeMock.mockReset();
    listAdminMenusMock.mockReset();
    createMenuMock.mockReset();
    getHomepageMock.mockReset();
    getPublishedPageBySlugMock.mockReset();
    getPublishedPageByPathMock.mockReset();
    publishPageMock.mockReset();
    unpublishPageMock.mockReset();
    deletePageMock.mockReset();
    deleteMenuMock.mockReset();
  });

  it('returns published menu items on the public endpoint', async () => {
    const cmsRoutes = (await import('../src/routes/cms.routes')).default;
    getPublishedMenuTreeMock.mockResolvedValue([{ id: 1, nhan_menu: 'Trang chu' }]);

    const app = express();
    app.use(express.json());
    app.use('/cms', cmsRoutes);

    const response = await request(app).get('/cms/menus');

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].nhan_menu).toBe('Trang chu');
  }, 30000);

  it('creates a menu item on the admin endpoint', async () => {
    const cmsRoutes = (await import('../src/routes/cms.routes')).default;
    createMenuMock.mockResolvedValue({
      id: 5,
      nhan_menu: 'Gioi thieu',
    });

    const app = express();
    app.use(express.json());
    app.use('/cms', cmsRoutes);

    const response = await request(app)
      .post('/cms/admin/menus')
      .send({ nhan_menu: 'Gioi thieu', loai_dich: 'PAGE' });

    expect(response.status).toBe(201);
    expect(response.body.item.id).toBe(5);
  });

  it('returns the published homepage', async () => {
    const cmsRoutes = (await import('../src/routes/cms.routes')).default;
    getHomepageMock.mockResolvedValue({
      id: 9,
      tieu_de: 'Trang chu',
      slug: 'trang-chu',
    });

    const app = express();
    app.use(express.json());
    app.use('/cms', cmsRoutes);

    const response = await request(app).get('/cms/pages/home');

    expect(response.status).toBe(200);
    expect(response.body.item.slug).toBe('trang-chu');
  });

  it('maps publish validation errors to 400 responses', async () => {
    const cmsRoutes = (await import('../src/routes/cms.routes')).default;
    publishPageMock.mockRejectedValue(new Error('HTML page cannot be published without content.'));

    const app = express();
    app.use(express.json());
    app.use('/cms', cmsRoutes);

    const response = await request(app).post('/cms/admin/pages/2/publish');

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('cannot be published');
  });

  it('resolves a published page by menu path', async () => {
    const cmsRoutes = (await import('../src/routes/cms.routes')).default;
    getPublishedPageByPathMock.mockResolvedValue({
      id: 10,
      slug: 'ke-hoach',
      tieu_de: 'Ke hoach',
    });

    const app = express();
    app.use(express.json());
    app.use('/cms', cmsRoutes);

    const response = await request(app).get('/cms/pages/by-path').query({ path: 'gioi-thieu/ke-hoach' });

    expect(response.status).toBe(200);
    expect(response.body.item.id).toBe(10);
  });

  it('unpublishes a page on the admin endpoint', async () => {
    const cmsRoutes = (await import('../src/routes/cms.routes')).default;
    unpublishPageMock.mockResolvedValue({ id: 4, trang_thai: 'DRAFT' });

    const app = express();
    app.use(express.json());
    app.use('/cms', cmsRoutes);

    const response = await request(app).post('/cms/admin/pages/4/unpublish');

    expect(response.status).toBe(200);
    expect(response.body.item.trang_thai).toBe('DRAFT');
  });

  it('maps delete guard errors to 400 responses', async () => {
    const cmsRoutes = (await import('../src/routes/cms.routes')).default;
    deletePageMock.mockRejectedValue(new Error('CMS page is linked to one or more menu items.'));

    const app = express();
    app.use(express.json());
    app.use('/cms', cmsRoutes);

    const response = await request(app).delete('/cms/admin/pages/12');

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('linked');
  });
});
