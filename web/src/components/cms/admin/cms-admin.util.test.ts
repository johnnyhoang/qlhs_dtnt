import { describe, expect, it } from 'vitest';
import {
  buildCmsAdminTree,
  collectCmsAdminDescendantIds,
  findCmsAdminTreeNode,
  extractMetadataFormValues,
  flattenCmsAdminTree,
  parseMetadataFormValues,
  reorderCmsAdminTree,
} from './cms-admin.util';

const menus = [
  {
    id: 1,
    nhan_menu: 'Gi?i thi?u',
    loai_dich: 'PAGE' as const,
    duong_dan: 'gioi-thieu',
    parent_id: null,
    page_id: 10,
    thu_tu: 0,
    hien_thi: true,
    children: [],
  },
  {
    id: 2,
    nhan_menu: 'Van b?n',
    loai_dich: 'PAGE' as const,
    duong_dan: 'van-ban',
    parent_id: null,
    page_id: 11,
    thu_tu: 1,
    hien_thi: true,
    children: [],
  },
  {
    id: 3,
    nhan_menu: 'Quy ch?',
    loai_dich: 'PAGE' as const,
    duong_dan: 'quy-che',
    parent_id: 2,
    page_id: 12,
    thu_tu: 0,
    hien_thi: true,
    children: [],
  },
];

describe('cms-admin.util', () => {
  it('builds a nested admin tree and flattens it back into parent/order payload', () => {
    const tree = buildCmsAdminTree(menus);

    expect(tree).toHaveLength(2);
    expect(tree[1].children[0].id).toBe(3);

    expect(flattenCmsAdminTree(tree)).toEqual([
      { id: 1, parent_id: null, thu_tu: 0 },
      { id: 2, parent_id: null, thu_tu: 1 },
      { id: 3, parent_id: 2, thu_tu: 0 },
    ]);
  });

  it('reorders nodes when dragged into another branch', () => {
    const tree = buildCmsAdminTree(menus);
    const reordered = reorderCmsAdminTree(tree, 1, 2, false, 0);

    expect(flattenCmsAdminTree(reordered)).toEqual([
      { id: 2, parent_id: null, thu_tu: 0 },
      { id: 3, parent_id: 2, thu_tu: 0 },
      { id: 1, parent_id: 2, thu_tu: 1 },
    ]);
  });

  it('finds nodes and descendant ids for cycle prevention', () => {
    const tree = buildCmsAdminTree(menus);
    const target = findCmsAdminTreeNode(tree, 2);

    expect(target?.id).toBe(2);
    expect(target ? collectCmsAdminDescendantIds(target) : []).toEqual([3]);
  });

  it('parses and extracts metadata fields consistently', () => {
    const metadata = parseMetadataFormValues({
      loai_van_ban: 'Quy ch?',
      so_hieu: '12/QD',
      don_vi_ban_hanh: '',
      ngay_ban_hanh: '2026-04-06',
    });

    expect(metadata).toEqual({
      loai_van_ban: 'Quy ch?',
      so_hieu: '12/QD',
      ngay_ban_hanh: '2026-04-06',
    });

    expect(extractMetadataFormValues(metadata)).toEqual({
      loai_van_ban: 'Quy ch?',
      so_hieu: '12/QD',
      don_vi_ban_hanh: '',
      ngay_ban_hanh: '2026-04-06',
    });
  });
});
