import type { ItemType } from 'antd/es/menu/interface';
import type { CMSAdminMenu, CMSMenuItem } from '../../types/cms';

const SYSTEM_MENU_ROUTES: Record<string, string> = {
  qlhs: '/admin',
  cds: '/admin/cds/dashboard',
  admin: '/admin/cms',
};

const resolveToolRoute = (systemKey?: string) => {
  if (!systemKey) {
    return null;
  }

  return SYSTEM_MENU_ROUTES[systemKey] || null;
};

const shouldIncludeTool = (systemKey: string | undefined, includeAdminTool: boolean) => {
  if (!systemKey) {
    return false;
  }

  if (systemKey === 'admin') {
    return includeAdminTool;
  }

  return true;
};

const mapPublicMenuItem = (item: CMSMenuItem, includeAdminTool: boolean): ItemType | null => {
  if (item.loai_dich === 'TOOL') {
    if (!shouldIncludeTool(item.khoa_he_thong, includeAdminTool)) {
      return null;
    }

    const route = resolveToolRoute(item.khoa_he_thong);
    if (!route) {
      return null;
    }

    const children = item.children?.map((child) => mapPublicMenuItem(child, includeAdminTool)).filter(Boolean) as ItemType[] | undefined;
    return {
      key: route,
      label: item.nhan_menu,
      children: children?.length ? children : undefined,
    };
  }

  const children = item.children?.map((child) => mapPublicMenuItem(child, includeAdminTool)).filter(Boolean) as ItemType[] | undefined;
  return {
    key: item.full_path ? `/${item.full_path}` : `/page/${item.id}`,
    label: item.nhan_menu,
    children: children?.length ? children : undefined,
  };
};

const buildAdminMenuTree = (items: CMSAdminMenu[]) => {
  const nodeMap = new Map<number, CMSAdminMenu & { children: CMSAdminMenu[] }>();
  const sortedItems = [...items]
    .filter((item) => item.hien_thi)
    .sort((left, right) => left.thu_tu - right.thu_tu || left.id - right.id);

  for (const item of sortedItems) {
    nodeMap.set(item.id, {
      ...item,
      children: [],
    });
  }

  const roots: Array<CMSAdminMenu & { children: CMSAdminMenu[] }> = [];
  for (const item of sortedItems) {
    const node = nodeMap.get(item.id)!;
    if (item.parent_id && nodeMap.has(item.parent_id)) {
      nodeMap.get(item.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

const mapAdminMenuItem = (item: CMSAdminMenu, parentPath = ''): ItemType | null => {
  if (item.loai_dich === 'TOOL') {
    const route = resolveToolRoute(item.khoa_he_thong);
    if (!route) {
      return null;
    }

    const children = item.children?.map((child) => mapAdminMenuItem(child, parentPath)).filter(Boolean) as ItemType[] | undefined;
    return {
      key: route,
      label: item.nhan_menu,
      children: children?.length ? children : undefined,
    };
  }

  const segment = item.duong_dan || '';
  const fullPath = [parentPath, segment].filter(Boolean).join('/');
  const children = item.children?.map((child) => mapAdminMenuItem(child, fullPath)).filter(Boolean) as ItemType[] | undefined;

  return {
    key: fullPath ? `/${fullPath}` : `/page/${item.id}`,
    label: item.nhan_menu,
    children: children?.length ? children : undefined,
  };
};

export const buildPublicMenuItems = (items: CMSMenuItem[], includeAdminTool = false): ItemType[] =>
  items.map((item) => mapPublicMenuItem(item, includeAdminTool)).filter(Boolean) as ItemType[];

export const buildAdminNavigationItems = (items: CMSAdminMenu[]): ItemType[] =>
  buildAdminMenuTree(items).map((item) => mapAdminMenuItem(item)).filter(Boolean) as ItemType[];

export const resolveNavigationSelectedKey = (pathname: string) => {
  if (pathname.startsWith('/admin/cds')) {
    return '/admin/cds/dashboard';
  }

  if (pathname.startsWith('/admin/cms') || pathname.startsWith('/admin/danh-muc-master') || pathname.startsWith('/admin/nguoi-dung')) {
    return '/admin/cms';
  }

  if (pathname.startsWith('/admin')) {
    return '/admin';
  }

  return pathname;
};
