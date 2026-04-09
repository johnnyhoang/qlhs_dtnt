export type CMSContentType = 'HTML' | 'PDF' | 'MEDIA';
export type CMSPageStatus = 'DRAFT' | 'PUBLISHED';
export type CMSMenuTargetType = 'PAGE' | 'TOOL';

export interface CMSMediaItem {
  id?: string;
  loai: 'IMAGE' | 'VIDEO';
  duong_dan: string;
  ghi_chu?: string;
}

export interface CMSPage {
  id: number;
  slug: string;
  tieu_de: string;
  mo_ta?: string;
  loai_noi_dung: CMSContentType;
  noi_dung_html?: string;
  metadata?: Record<string, unknown>;
  la_trang_chu: boolean;
  trang_thai: CMSPageStatus;
  ten_tep_goc?: string;
  mime_type?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CMSPageInput {
  tieu_de: string;
  slug?: string;
  mo_ta?: string;
  loai_noi_dung: CMSContentType;
  noi_dung_html?: string;
  metadata?: Record<string, unknown>;
  la_trang_chu?: boolean;
  tep_noi_dung?: File | null;
}

export interface CMSMenuItem {
  id: number;
  nhan_menu: string;
  loai_dich: CMSMenuTargetType;
  duong_dan?: string;
  khoa_he_thong?: string;
  khoa_he_thong_bat_buoc?: boolean;
  full_path?: string | null;
  page_id?: number | null;
  children: CMSMenuItem[];
}

export interface CMSAdminMenu {
  id: number;
  nhan_menu: string;
  loai_dich: CMSMenuTargetType;
  duong_dan?: string;
  khoa_he_thong?: string;
  khoa_he_thong_bat_buoc?: boolean;
  parent_id?: number | null;
  page_id?: number | null;
  thu_tu: number;
  hien_thi: boolean;
  page?: CMSPage | null;
  children: CMSAdminMenu[];
}

export interface CMSMenuInput {
  nhan_menu: string;
  loai_dich: CMSMenuTargetType;
  duong_dan?: string;
  khoa_he_thong?: string;
  parent_id?: number | null;
  page_id?: number | null;
  thu_tu?: number;
  hien_thi?: boolean;
}
