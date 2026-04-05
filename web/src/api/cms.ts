import client from './client';
import type { CMSAdminMenu, CMSMenuInput, CMSMenuItem, CMSPage, CMSPageInput } from '../types/cms';

const appendFormDataValue = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return;
  }

  formData.append(key, String(value));
};

const buildPageFormData = (input: CMSPageInput) => {
  const formData = new FormData();

  appendFormDataValue(formData, 'tieu_de', input.tieu_de);
  appendFormDataValue(formData, 'slug', input.slug);
  appendFormDataValue(formData, 'mo_ta', input.mo_ta);
  appendFormDataValue(formData, 'loai_noi_dung', input.loai_noi_dung);
  appendFormDataValue(formData, 'noi_dung_html', input.noi_dung_html);
  appendFormDataValue(formData, 'la_trang_chu', input.la_trang_chu ? 'true' : 'false');

  if (input.metadata && Object.keys(input.metadata).length > 0) {
    formData.append('metadata', JSON.stringify(input.metadata));
  }

  if (input.tep_noi_dung) {
    formData.append('tep_noi_dung', input.tep_noi_dung);
  }

  return formData;
};

export const getPublishedMenus = async () => {
  const response = await client.get<{ items: CMSMenuItem[] }>('/cms/menus');
  return response.data.items;
};

export const getHomepage = async () => {
  const response = await client.get<{ item: CMSPage }>('/cms/pages/home');
  return response.data.item;
};

export const getPageByPath = async (path: string) => {
  const response = await client.get<{ item: CMSPage }>('/cms/pages/by-path', {
    params: { path },
  });
  return response.data.item;
};

export const getAdminMenus = async () => {
  const response = await client.get<{ items: CMSAdminMenu[] }>('/cms/admin/menus');
  return response.data.items;
};

export const createAdminMenu = async (input: CMSMenuInput) => {
  const response = await client.post<{ item: CMSAdminMenu }>('/cms/admin/menus', input);
  return response.data.item;
};

export const updateAdminMenu = async (id: number, input: CMSMenuInput) => {
  const response = await client.put<{ item: CMSAdminMenu }>(`/cms/admin/menus/${id}`, input);
  return response.data.item;
};

export const reorderAdminMenus = async (items: Array<{ id: number; parent_id: number | null; thu_tu: number }>) => {
  const response = await client.post<{ items: CMSAdminMenu[] }>('/cms/admin/menus/reorder', { items });
  return response.data.items;
};

export const getAdminPages = async () => {
  const response = await client.get<{ items: CMSPage[] }>('/cms/admin/pages');
  return response.data.items;
};

export const getAdminPage = async (id: number) => {
  const response = await client.get<{ item: CMSPage }>(`/cms/admin/pages/${id}`);
  return response.data.item;
};

export const createAdminPage = async (input: CMSPageInput) => {
  const response = await client.post<{ item: CMSPage }>('/cms/admin/pages', buildPageFormData(input));
  return response.data.item;
};

export const updateAdminPage = async (id: number, input: CMSPageInput) => {
  const response = await client.put<{ item: CMSPage }>(`/cms/admin/pages/${id}`, buildPageFormData(input));
  return response.data.item;
};

export const saveAdminPageDraft = async (id: number) => {
  const response = await client.post<{ item: CMSPage }>(`/cms/admin/pages/${id}/draft`);
  return response.data.item;
};

export const publishAdminPage = async (id: number) => {
  const response = await client.post<{ item: CMSPage }>(`/cms/admin/pages/${id}/publish`);
  return response.data.item;
};

export const unpublishAdminPage = async (id: number) => {
  const response = await client.post<{ item: CMSPage }>(`/cms/admin/pages/${id}/unpublish`);
  return response.data.item;
};

export const deleteAdminPage = async (id: number) => {
  const response = await client.delete<{ id: number }>(`/cms/admin/pages/${id}`);
  return response.data;
};

export const deleteAdminMenu = async (id: number) => {
  const response = await client.delete<{ id: number }>(`/cms/admin/menus/${id}`);
  return response.data;
};
