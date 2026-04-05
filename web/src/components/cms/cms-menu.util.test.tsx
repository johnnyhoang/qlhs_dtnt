import { describe, expect, it } from 'vitest';
import { buildPublicMenuItems } from './cms-menu.util';

describe('buildPublicMenuItems', () => {
  it('prepends fixed tool items before CMS content items', () => {
    const items = buildPublicMenuItems([
      {
        id: 1,
        nhan_menu: 'Giới thiệu',
        loai_dich: 'PAGE',
        full_path: 'gioi-thieu',
        children: [],
      },
    ]);

    expect(items[0]?.key).toBe('/admin/hoc-sinh');
    expect(items[1]?.key).toBe('/admin/cds/dashboard');
    expect(items[2]?.key).toBe('/gioi-thieu');
  });
});
