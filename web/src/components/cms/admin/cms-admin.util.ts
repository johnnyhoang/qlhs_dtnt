import type { DataNode } from 'antd/es/tree';
import type { CMSAdminMenu } from '../../../types/cms';

type CmsMediaFormItem = {
  loai: 'IMAGE' | 'VIDEO';
  duong_dan: string;
  ghi_chu: string;
};

export interface CMSAdminTreeNode extends CMSAdminMenu {
  key: string;
  title: string;
  children: CMSAdminTreeNode[];
}

const cloneNode = (node: CMSAdminTreeNode): CMSAdminTreeNode => ({
  ...node,
  children: node.children.map(cloneNode),
});

export const buildCmsAdminTree = (items: CMSAdminMenu[]): CMSAdminTreeNode[] => {
  const nodeMap = new Map<number, CMSAdminTreeNode>();

  const sortedItems = [...items].sort((left, right) => left.thu_tu - right.thu_tu || left.id - right.id);

  for (const item of sortedItems) {
    nodeMap.set(item.id, {
      ...item,
      key: String(item.id),
      title: item.nhan_menu,
      children: [],
    });
  }

  const roots: CMSAdminTreeNode[] = [];

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

export const flattenCmsAdminTree = (
  nodes: CMSAdminTreeNode[],
  parentId: number | null = null,
): Array<{ id: number; parent_id: number | null; thu_tu: number }> => {
  return nodes.flatMap((node, index) => [
    { id: node.id, parent_id: parentId, thu_tu: index },
    ...flattenCmsAdminTree(node.children, node.id),
  ]);
};

const removeNode = (
  nodes: CMSAdminTreeNode[],
  targetId: number,
): { tree: CMSAdminTreeNode[]; removed: CMSAdminTreeNode | null } => {
  const nextTree: CMSAdminTreeNode[] = [];
  let removed: CMSAdminTreeNode | null = null;

  for (const node of nodes) {
    if (node.id === targetId) {
      removed = cloneNode(node);
      continue;
    }

    const result = removeNode(node.children, targetId);
    if (result.removed) {
      removed = result.removed;
      nextTree.push({ ...node, children: result.tree });
    } else {
      nextTree.push(cloneNode(node));
    }
  }

  return { tree: nextTree, removed };
};

const insertNode = (
  nodes: CMSAdminTreeNode[],
  targetId: number,
  draggedNode: CMSAdminTreeNode,
  dropToGap: boolean,
  relativePosition: number,
): CMSAdminTreeNode[] => {
  const nextTree: CMSAdminTreeNode[] = [];

  for (const node of nodes) {
    if (node.id === targetId) {
      if (!dropToGap) {
        nextTree.push({
          ...node,
          children: [...node.children.map(cloneNode), draggedNode],
        });
        continue;
      }

      if (relativePosition < 0) {
        nextTree.push(draggedNode);
        nextTree.push(cloneNode(node));
      } else {
        nextTree.push(cloneNode(node));
        nextTree.push(draggedNode);
      }
      continue;
    }

    const updatedChildren = insertNode(node.children, targetId, draggedNode, dropToGap, relativePosition);
    nextTree.push({ ...node, children: updatedChildren });
  }

  return nextTree;
};

export const reorderCmsAdminTree = (
  tree: CMSAdminTreeNode[],
  dragId: number,
  dropId: number,
  dropToGap: boolean,
  relativePosition: number,
): CMSAdminTreeNode[] => {
  if (dragId === dropId) {
    return tree.map(cloneNode);
  }

  const removedResult = removeNode(tree, dragId);
  if (!removedResult.removed) {
    return tree.map(cloneNode);
  }

  return insertNode(removedResult.tree, dropId, removedResult.removed, dropToGap, relativePosition);
};

export const toAntTreeData = (nodes: CMSAdminTreeNode[]): DataNode[] =>
  nodes.map((node) => ({
    key: node.key,
    title: node.title,
    children: toAntTreeData(node.children),
  }));

export const findCmsAdminTreeNode = (
  nodes: CMSAdminTreeNode[],
  targetId: number,
): CMSAdminTreeNode | null => {
  for (const node of nodes) {
    if (node.id === targetId) {
      return node;
    }

    const match = findCmsAdminTreeNode(node.children, targetId);
    if (match) {
      return match;
    }
  }

  return null;
};

export const collectCmsAdminDescendantIds = (node: CMSAdminTreeNode): number[] => {
  return node.children.flatMap((child) => [child.id, ...collectCmsAdminDescendantIds(child)]);
};

export const parseMetadataFormValues = (values: {
  loai_van_ban?: string;
  so_hieu?: string;
  don_vi_ban_hanh?: string;
  ngay_ban_hanh?: string;
  media_items?: CmsMediaFormItem[];
}): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return Boolean(typeof value === 'string' ? value.trim() : value);
    }),
  );
};

export const extractMetadataFormValues = (metadata?: Record<string, unknown>): {
  loai_van_ban: string;
  so_hieu: string;
  don_vi_ban_hanh: string;
  ngay_ban_hanh: string;
  media_items: CmsMediaFormItem[];
} => ({
  loai_van_ban: typeof metadata?.loai_van_ban === 'string' ? metadata.loai_van_ban : '',
  so_hieu: typeof metadata?.so_hieu === 'string' ? metadata.so_hieu : '',
  don_vi_ban_hanh: typeof metadata?.don_vi_ban_hanh === 'string' ? metadata.don_vi_ban_hanh : '',
  ngay_ban_hanh: typeof metadata?.ngay_ban_hanh === 'string' ? metadata.ngay_ban_hanh : '',
  media_items: Array.isArray(metadata?.media_items)
    ? metadata.media_items
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => ({
        loai: item.loai === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        duong_dan: typeof item.duong_dan === 'string' ? item.duong_dan : '',
        ghi_chu: typeof item.ghi_chu === 'string' ? item.ghi_chu : '',
      }))
    : [],
});
