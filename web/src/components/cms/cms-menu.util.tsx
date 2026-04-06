import type { ItemType } from 'antd/es/menu/interface';
import type { CMSMenuItem } from '../../types/cms';

const FIXED_TOOL_ITEMS: ItemType[] = [
  { key: '/admin/hoc-sinh', label: 'Qu\u1ea3n l\u00fd h\u1ecdc sinh' },
  { key: '/admin/cds/dashboard', label: 'Chuy\u1ec3n \u0111\u1ed5i s\u1ed1' },
];

const mapCmsMenuItem = (item: CMSMenuItem): ItemType => ({
  key: item.full_path ? `/${item.full_path}` : `/page/${item.id}`,
  label: item.nhan_menu,
  children: item.children?.length ? item.children.map(mapCmsMenuItem) : undefined,
});

export const buildPublicMenuItems = (items: CMSMenuItem[]): ItemType[] => [
  ...FIXED_TOOL_ITEMS,
  ...items.map(mapCmsMenuItem),
];
