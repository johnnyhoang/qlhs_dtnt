import type { ItemType } from 'antd/es/menu/interface';
import type { CMSMenuItem } from '../../types/cms';

const FIXED_TOOL_ITEMS: ItemType[] = [
  { key: '/admin/hoc-sinh', label: 'Quan ly hoc sinh' },
  { key: '/admin/cds/dashboard', label: 'Chuyen doi so' },
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
