import { expect, test, type Page, type Route } from '@playwright/test';

type CmsPageRecord = {
  id: number;
  slug: string;
  tieu_de: string;
  mo_ta?: string;
  loai_noi_dung: 'HTML' | 'PDF';
  noi_dung_html?: string;
  metadata?: Record<string, string>;
  la_trang_chu: boolean;
  trang_thai: 'DRAFT' | 'PUBLISHED';
  ten_tep_goc?: string;
};

type CmsMenuRecord = {
  id: number;
  nhan_menu: string;
  loai_dich: 'PAGE' | 'TOOL';
  duong_dan?: string;
  khoa_he_thong?: string;
  parent_id: number | null;
  page_id: number | null;
  thu_tu: number;
  hien_thi: boolean;
};

const API_BASE = 'http://127.0.0.1:3500/api';

const seedPages = (): CmsPageRecord[] => [
  {
    id: 1,
    slug: 'trang-chu',
    tieu_de: 'Trang chu',
    mo_ta: 'Cong thong tin cong khai',
    loai_noi_dung: 'HTML',
    noi_dung_html: '<p>Noi dung trang chu</p>',
    metadata: {},
    la_trang_chu: true,
    trang_thai: 'PUBLISHED',
  },
  {
    id: 2,
    slug: 'quy-che-noi-tru',
    tieu_de: 'Quy che noi tru',
    mo_ta: 'Ban PDF cho khu van ban',
    loai_noi_dung: 'PDF',
    metadata: { loai_van_ban: 'Quy che' },
    la_trang_chu: false,
    trang_thai: 'PUBLISHED',
    ten_tep_goc: 'quy-che.pdf',
  },
];

const seedMenus = (): CmsMenuRecord[] => [
  {
    id: 10,
    nhan_menu: 'Van ban',
    loai_dich: 'PAGE',
    duong_dan: 'van-ban',
    parent_id: null,
    page_id: null,
    thu_tu: 0,
    hien_thi: true,
  },
  {
    id: 11,
    nhan_menu: 'Quy che',
    loai_dich: 'PAGE',
    duong_dan: 'quy-che',
    parent_id: 10,
    page_id: 2,
    thu_tu: 0,
    hien_thi: true,
  },
];

const parseMultipartBody = (body: string) => {
  const boundary = body.split('\r\n')[0];
  const parts = body
    .split(boundary)
    .map((part) => part.trim())
    .filter((part) => part && part !== '--');

  const fields: Record<string, string> = {};

  for (const part of parts) {
    const [rawHeaders, ...rawValueParts] = part.split('\r\n\r\n');
    if (!rawHeaders || rawValueParts.length === 0) {
      continue;
    }

    const nameMatch = rawHeaders.match(/name="([^"]+)"/);
    if (!nameMatch) {
      continue;
    }

    fields[nameMatch[1]] = rawValueParts.join('\r\n\r\n').replace(/\r\n--$/, '').trim();
  }

  return fields;
};

const buildPublicTree = (menus: CmsMenuRecord[], pages: CmsPageRecord[]) => {
  const visibleMenus = menus
    .filter((menu) => menu.hien_thi)
    .filter((menu) => {
      if (menu.loai_dich === 'TOOL') {
        return true;
      }
      if (!menu.page_id) {
        return true;
      }
      return pages.find((page) => page.id === menu.page_id)?.trang_thai === 'PUBLISHED';
    })
    .sort((left, right) => left.thu_tu - right.thu_tu || left.id - right.id);

  const buildNode = (menu: CmsMenuRecord, parentPath = ''): any => {
    const segment = menu.duong_dan || '';
    const fullPath = [parentPath, segment].filter(Boolean).join('/');
    const page = menu.page_id ? pages.find((item) => item.id === menu.page_id) || null : null;
    const children = visibleMenus
      .filter((child) => child.parent_id === menu.id)
      .map((child) => buildNode(child, fullPath));

    return {
      ...menu,
      page,
      full_path: fullPath || null,
      children,
    };
  };

  return visibleMenus.filter((menu) => menu.parent_id === null).map((menu) => buildNode(menu));
};

const findPageByPath = (path: string, menus: CmsMenuRecord[], pages: CmsPageRecord[]) => {
  const walk = (nodes: any[]): CmsPageRecord | null => {
    for (const node of nodes) {
      if (node.full_path === path && node.page_id) {
        return pages.find((page) => page.id === node.page_id) || null;
      }
      const childMatch = walk(node.children || []);
      if (childMatch) {
        return childMatch;
      }
    }
    return null;
  };

  return walk(buildPublicTree(menus, pages));
};

const installGoogleStub = async (page: Page) => {
  await page.addInitScript(() => {
    (window as any).google = {
      accounts: {
        id: {
          initialize: () => undefined,
          renderButton: () => undefined,
          prompt: () => undefined,
        },
      },
    };
  });
};

const installEditorSession = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 99,
        email: 'editor@example.com',
        ho_ten: 'CMS Editor',
        vai_tro: 'EDITOR',
        danh_sach_quyen: [],
      }),
    );
  });
};

const fulfillJson = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

const installCmsApiMock = async (page: Page) => {
  const pages = seedPages();
  const menus = seedMenus();
  let nextPageId = 100;
  let nextMenuId = 200;

  await page.route(`${API_BASE}/cms/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;
    const method = request.method();

    if (pathname === '/api/cms/menus' && method === 'GET') {
      return fulfillJson(route, { items: buildPublicTree(menus, pages) });
    }

    if (pathname === '/api/cms/pages/home' && method === 'GET') {
      const home = pages.find((item) => item.la_trang_chu && item.trang_thai === 'PUBLISHED');
      if (!home) {
        return fulfillJson(route, { message: 'Homepage not found.' }, 404);
      }
      return fulfillJson(route, { item: home });
    }

    if (pathname === '/api/cms/pages/by-path' && method === 'GET') {
      const pageByPath = findPageByPath(url.searchParams.get('path') || '', menus, pages);
      if (!pageByPath) {
        return fulfillJson(route, { message: 'CMS page not found.' }, 404);
      }
      return fulfillJson(route, { item: pageByPath });
    }

    if (pathname === '/api/cms/pages/pdf' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: '%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF',
      });
    }

    if (pathname === '/api/cms/admin/pages' && method === 'GET') {
      return fulfillJson(route, { items: [...pages].sort((a, b) => b.id - a.id) });
    }

    if (pathname.startsWith('/api/cms/admin/pages/') && method === 'GET') {
      const id = Number(pathname.split('/').pop());
      const pageItem = pages.find((item) => item.id === id);
      if (!pageItem) {
        return fulfillJson(route, { message: 'CMS page not found.' }, 404);
      }
      return fulfillJson(route, { item: pageItem });
    }

    if (pathname === '/api/cms/admin/pages' && method === 'POST') {
      const fields = parseMultipartBody(request.postData() || '');
      const contentType = fields.loai_noi_dung as 'HTML' | 'PDF';
      const createdPage: CmsPageRecord = {
        id: nextPageId++,
        slug: fields.slug || (fields.tieu_de || 'Gioi thieu nha truong').toLowerCase().replace(/\s+/g, '-'),
        tieu_de: fields.tieu_de || 'Gioi thieu nha truong',
        mo_ta: fields.mo_ta || 'Trang gioi thieu public',
        loai_noi_dung: contentType || 'HTML',
        noi_dung_html: fields.noi_dung_html || '<p>Noi dung gioi thieu chi tiet</p>',
        metadata: fields.metadata ? JSON.parse(fields.metadata) : {},
        la_trang_chu: fields.la_trang_chu === 'true',
        trang_thai: 'DRAFT',
        ten_tep_goc: contentType === 'PDF' ? 'uploaded.pdf' : 'uploaded.html',
      };

      if (createdPage.la_trang_chu) {
        pages.forEach((item) => {
          item.la_trang_chu = false;
        });
      }
      pages.unshift(createdPage);
      return fulfillJson(route, { item: createdPage }, 201);
    }

    if (pathname.startsWith('/api/cms/admin/pages/') && method === 'PUT') {
      const id = Number(pathname.split('/')[5]);
      const pageItem = pages.find((item) => item.id === id);
      const fields = parseMultipartBody(request.postData() || '');
      if (!pageItem) {
        return fulfillJson(route, { message: 'CMS page not found.' }, 404);
      }

      pageItem.tieu_de = fields.tieu_de || pageItem.tieu_de;
      pageItem.slug = fields.slug || pageItem.slug;
      pageItem.mo_ta = fields.mo_ta || pageItem.mo_ta;
      pageItem.loai_noi_dung = (fields.loai_noi_dung as 'HTML' | 'PDF') || pageItem.loai_noi_dung;
      pageItem.noi_dung_html = fields.noi_dung_html || pageItem.noi_dung_html;
      if (fields.metadata) {
        pageItem.metadata = JSON.parse(fields.metadata);
      }
      if (fields.la_trang_chu === 'true') {
        pages.forEach((item) => {
          item.la_trang_chu = false;
        });
        pageItem.la_trang_chu = true;
      }
      return fulfillJson(route, { item: pageItem });
    }

    if (pathname.endsWith('/draft') && method === 'POST') {
      const id = Number(pathname.split('/')[5]);
      const pageItem = pages.find((item) => item.id === id);
      if (!pageItem) {
        return fulfillJson(route, { message: 'CMS page not found.' }, 404);
      }
      pageItem.trang_thai = 'DRAFT';
      return fulfillJson(route, { item: pageItem });
    }

    if (pathname.endsWith('/publish') && method === 'POST') {
      const id = Number(pathname.split('/')[5]);
      const pageItem = pages.find((item) => item.id === id);
      if (!pageItem) {
        return fulfillJson(route, { message: 'CMS page not found.' }, 404);
      }
      pageItem.trang_thai = 'PUBLISHED';
      return fulfillJson(route, { item: pageItem });
    }

    if (pathname.endsWith('/unpublish') && method === 'POST') {
      const id = Number(pathname.split('/')[5]);
      const pageItem = pages.find((item) => item.id === id);
      if (!pageItem) {
        return fulfillJson(route, { message: 'CMS page not found.' }, 404);
      }
      pageItem.trang_thai = 'DRAFT';
      return fulfillJson(route, { item: pageItem });
    }

    if (pathname.startsWith('/api/cms/admin/pages/') && method === 'DELETE') {
      const id = Number(pathname.split('/').pop());
      const linkedMenu = menus.find((menu) => menu.page_id === id);
      if (linkedMenu) {
        return fulfillJson(route, { message: 'CMS page is linked to one or more menu items.' }, 400);
      }
      const targetIndex = pages.findIndex((item) => item.id === id);
      if (targetIndex === -1) {
        return fulfillJson(route, { message: 'CMS page not found.' }, 404);
      }
      pages.splice(targetIndex, 1);
      return fulfillJson(route, { id });
    }

    if (pathname === '/api/cms/admin/menus' && method === 'GET') {
      const items = menus.map((menu) => ({
        ...menu,
        page: menu.page_id ? pages.find((item) => item.id === menu.page_id) || null : null,
        children: [],
      }));
      return fulfillJson(route, { items });
    }

    if (pathname === '/api/cms/admin/menus' && method === 'POST') {
      const body = request.postDataJSON() as Record<string, unknown>;
      const item: CmsMenuRecord = {
        id: nextMenuId++,
        nhan_menu: String(body.nhan_menu || ''),
        loai_dich: 'PAGE',
        duong_dan: String(body.duong_dan || ''),
        parent_id: body.parent_id ? Number(body.parent_id) : null,
        page_id: body.page_id ? Number(body.page_id) : null,
        thu_tu: Number(body.thu_tu || 0),
        hien_thi: body.hien_thi !== false,
      };
      menus.push(item);
      return fulfillJson(route, { item }, 201);
    }

    if (pathname.startsWith('/api/cms/admin/menus/') && method === 'PUT') {
      const id = Number(pathname.split('/').pop());
      const body = request.postDataJSON() as Record<string, unknown>;
      const item = menus.find((menu) => menu.id === id);
      if (!item) {
        return fulfillJson(route, { message: 'CMS menu not found.' }, 404);
      }
      item.nhan_menu = String(body.nhan_menu || item.nhan_menu);
      item.duong_dan = String(body.duong_dan || item.duong_dan || '');
      item.parent_id = body.parent_id ? Number(body.parent_id) : null;
      item.page_id = body.page_id ? Number(body.page_id) : null;
      item.hien_thi = body.hien_thi !== false;
      return fulfillJson(route, { item });
    }

    if (pathname.startsWith('/api/cms/admin/menus/') && method === 'DELETE') {
      const id = Number(pathname.split('/').pop());
      const childMenu = menus.find((menu) => menu.parent_id === id);
      if (childMenu) {
        return fulfillJson(route, { message: 'CMS menu cannot be deleted while it still has child items.' }, 400);
      }
      const targetIndex = menus.findIndex((menu) => menu.id === id);
      if (targetIndex === -1) {
        return fulfillJson(route, { message: 'CMS menu not found.' }, 404);
      }
      menus.splice(targetIndex, 1);
      return fulfillJson(route, { id });
    }

    if (pathname === '/api/cms/admin/menus/reorder' && method === 'POST') {
      const body = request.postDataJSON() as { items: Array<{ id: number; parent_id: number | null; thu_tu: number }> };
      body.items.forEach((entry) => {
        const item = menus.find((menu) => menu.id === entry.id);
        if (item) {
          item.parent_id = entry.parent_id;
          item.thu_tu = entry.thu_tu;
        }
      });
      const items = menus.map((menu) => ({
        ...menu,
        page: menu.page_id ? pages.find((item) => item.id === menu.page_id) || null : null,
        children: [],
      }));
      return fulfillJson(route, { items });
    }

    return fulfillJson(route, { message: `Unhandled route: ${method} ${pathname}` }, 500);
  });
};

test.describe('CMS flows', () => {
  test('editor can create and publish an HTML page, link it to a menu, and see it on the public site', async ({ page }) => {
    await installGoogleStub(page);
    await installEditorSession(page);
    await installCmsApiMock(page);

    await page.goto('/admin/cms');

    await page.getByRole('button', { name: /tao trang/i }).click();
    await page.getByLabel(/tieu de/i).fill('Gioi thieu nha truong');
    await page.getByLabel(/slug/i).fill('gioi-thieu-nha-truong');
    await page.getByLabel(/mo ta ngan/i).fill('Trang gioi thieu public');
    await page.getByLabel(/noi dung html nhap tay/i).fill('<p>Noi dung gioi thieu chi tiet</p>');
    await page.getByRole('button', { name: /xuat ban/i }).click();

    await expect(page.getByRole('heading', { name: /gioi thieu nha truong/i })).toBeVisible();

    await page.getByRole('tab', { name: /menu/i }).click();
    await page.getByRole('button', { name: /them menu/i }).click();
    await page.getByLabel(/nhan menu/i).fill('Gioi thieu');
    await page.getByLabel(/slug menu/i).fill('gioi-thieu');
    await page.getByLabel(/trang noi dung gan voi menu/i).click();
    await page.getByTitle('Gioi thieu nha truong (gioi-thieu-nha-truong)').click();
    await page.getByRole('button', { name: /^ok$/i }).click();

    await page.goto('/gioi-thieu');
    await expect(page.getByRole('heading', { name: /gioi thieu nha truong/i })).toBeVisible();
    await expect(page.locator('[data-testid="cms-html-content"]')).toContainText('Noi dung gioi thieu chi tiet');
  });

  test('public PDF page renders an embedded viewer', async ({ page }) => {
    await installGoogleStub(page);
    await installCmsApiMock(page);

    await page.goto('/van-ban/quy-che');

    await expect(page.getByRole('heading', { name: /quy che noi tru/i })).toBeVisible();
    await expect(page.locator('iframe[title="Quy che noi tru"]')).toHaveAttribute('src', /cms\/pages\/pdf\?slug=quy-che-noi-tru/);
  });

  test('public fixed tool menu redirects unauthenticated users to the admin login page', async ({ page }) => {
    await installGoogleStub(page);
    await installCmsApiMock(page);

    await page.goto('/');
    await page.locator('.ant-menu-overflow-item').first().click();

    await expect(page).toHaveURL(/\/admin\/login\?from=%2Fadmin%2Fhoc-sinh/);
  });

  test('editor can unpublish a page and the public route stops resolving', async ({ page }) => {
    await installGoogleStub(page);
    await installEditorSession(page);
    await installCmsApiMock(page);

    await page.goto('/admin/cms');
    await page.getByText('Quy che noi tru').click();
    await page.getByRole('button', { name: /go public/i }).click();

    await page.goto('/van-ban/quy-che');
    await expect(page.getByText(/khong tim thay trang noi dung/i)).toBeVisible();
  });
});
