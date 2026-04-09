import { AppDataSource } from "../data-source";
import { CMSMenu, CMSMenuTargetType } from "../entities/CMSMenu";
import { CMSContentType, CMSPage, CMSPageStatus } from "../entities/CMSPage";
import { sanitizeCmsHtml, slugifyCmsPath, validateCmsUpload } from "../utils/cms.util";

type PageInput = {
    tieu_de: string;
    slug?: string;
    mo_ta?: string;
    loai_noi_dung: CMSContentType;
    noi_dung_html?: string;
    metadata?: Record<string, unknown>;
    la_trang_chu?: boolean;
};

type CMSMediaItem = {
    id?: string;
    loai: "IMAGE" | "VIDEO";
    duong_dan: string;
    ghi_chu?: string;
};

type MenuInput = {
    nhan_menu: string;
    loai_dich: CMSMenuTargetType;
    duong_dan?: string;
    khoa_he_thong?: string;
    parent_id?: number | null;
    page_id?: number | null;
    thu_tu?: number;
    hien_thi?: boolean;
};

type CMSMenuNode = CMSMenu & {
    children: CMSMenuNode[];
    full_path: string | null;
};

const SYSTEM_MENU_DEFINITIONS: Array<Pick<MenuInput, "nhan_menu" | "khoa_he_thong" | "thu_tu">> = [
    { nhan_menu: "Quan ly hoc sinh", khoa_he_thong: "qlhs", thu_tu: 0 },
    { nhan_menu: "Chuyen doi so", khoa_he_thong: "cds", thu_tu: 1 },
    { nhan_menu: "Admin", khoa_he_thong: "admin", thu_tu: 2 },
];

export class CMSService {
    private static getPageRepository() {
        return AppDataSource.getRepository(CMSPage);
    }

    private static getMenuRepository() {
        return AppDataSource.getRepository(CMSMenu);
    }

    static async listPublishedMenus() {
        await this.ensureSystemMenus();
        const menus = await this.getMenuRepository().find({
            where: { hien_thi: true },
            relations: ["page"],
            order: { thu_tu: "ASC", id: "ASC" },
        });

        return menus.filter((menu) => {
            if (menu.loai_dich === CMSMenuTargetType.TOOL) {
                return true;
            }

            if (!menu.page_id) {
                return true;
            }

            return menu.page?.trang_thai === CMSPageStatus.PUBLISHED;
        });
    }

    static async getPublishedMenuTree() {
        const menus = await this.listPublishedMenus();
        return this.buildMenuTree(menus);
    }

    static async listAdminMenus() {
        await this.ensureSystemMenus();
        return this.getMenuRepository().find({
            relations: ["page"],
            order: { thu_tu: "ASC", id: "ASC" },
        });
    }

    static async listAdminPages() {
        return this.getPageRepository().find({
            order: { updatedAt: "DESC", id: "DESC" },
        });
    }

    static async getHomepage() {
        return this.getPageRepository().findOne({
            where: { la_trang_chu: true, trang_thai: CMSPageStatus.PUBLISHED },
        });
    }

    static async getPublishedPageBySlug(slug: string) {
        return this.getPageRepository().findOne({
            where: { slug, trang_thai: CMSPageStatus.PUBLISHED },
        });
    }

    static async getPublishedPageByPath(path: string) {
        const normalizedPath = path
            .split("/")
            .map((segment) => slugifyCmsPath(segment))
            .filter(Boolean)
            .join("/");

        const menuTree = await this.getPublishedMenuTree();
        const matchedMenu = this.findMenuByPath(menuTree, normalizedPath);

        if (!matchedMenu || matchedMenu.loai_dich !== CMSMenuTargetType.PAGE || !matchedMenu.page_id) {
            return null;
        }

        return this.getPageRepository().findOne({
            where: { id: matchedMenu.page_id, trang_thai: CMSPageStatus.PUBLISHED },
        });
    }

    static async getAdminPageById(id: number) {
        return this.getPageRepository().findOneBy({ id });
    }

    static async createPage(
        input: PageInput,
        actorId: number,
        file?: Express.Multer.File,
    ) {
        if (!input.tieu_de.trim()) {
            throw new Error("CMS page title is required.");
        }

        validateCmsUpload(input.loai_noi_dung, file);

        const repo = this.getPageRepository();
        const slug = slugifyCmsPath(input.slug || input.tieu_de);

        const page = repo.create({
            slug,
            tieu_de: input.tieu_de,
            mo_ta: input.mo_ta,
            loai_noi_dung: input.loai_noi_dung,
            noi_dung_html: this.resolveHtmlContent(input, file) ?? undefined,
            tep_pdf: input.loai_noi_dung === CMSContentType.PDF ? file?.buffer : undefined,
            ten_tep_goc: input.loai_noi_dung === CMSContentType.PDF ? file?.originalname ?? undefined : undefined,
            mime_type: input.loai_noi_dung === CMSContentType.PDF ? file?.mimetype ?? undefined : undefined,
            metadata: this.normalizeMetadata(input),
            la_trang_chu: Boolean(input.la_trang_chu),
            created_by_id: actorId,
            updated_by_id: actorId,
        });

        if (page.la_trang_chu) {
            await repo.update({ la_trang_chu: true }, { la_trang_chu: false });
        }

        return repo.save(page);
    }

    static async updatePage(
        id: number,
        input: PageInput,
        actorId: number,
        file?: Express.Multer.File,
    ) {
        if (!input.tieu_de.trim()) {
            throw new Error("CMS page title is required.");
        }

        validateCmsUpload(input.loai_noi_dung, file);

        const repo = this.getPageRepository();
        const page = await repo.findOneBy({ id });
        if (!page) {
            throw new Error("CMS page not found.");
        }

        page.slug = slugifyCmsPath(input.slug || input.tieu_de);
        page.tieu_de = input.tieu_de;
        page.mo_ta = input.mo_ta;
        page.loai_noi_dung = input.loai_noi_dung;
        page.metadata = this.normalizeMetadata(input);
        page.la_trang_chu = Boolean(input.la_trang_chu);
        page.updated_by_id = actorId;

        if (page.loai_noi_dung === CMSContentType.HTML) {
            page.noi_dung_html = this.resolveHtmlContent(input, file) ?? undefined;
            page.tep_pdf = undefined;
            page.ten_tep_goc = undefined;
            page.mime_type = undefined;
        } else if (page.loai_noi_dung === CMSContentType.PDF) {
            page.noi_dung_html = undefined;
            page.tep_pdf = file?.buffer ?? page.tep_pdf;
            page.ten_tep_goc = file?.originalname ?? page.ten_tep_goc;
            page.mime_type = file?.mimetype ?? page.mime_type;
        } else {
            page.noi_dung_html = undefined;
            page.tep_pdf = undefined;
            page.ten_tep_goc = undefined;
            page.mime_type = undefined;
        }

        if (page.la_trang_chu) {
            await repo.update({ la_trang_chu: true }, { la_trang_chu: false });
            page.la_trang_chu = true;
        }

        return repo.save(page);
    }

    static async saveDraft(id: number) {
        const repo = this.getPageRepository();
        const page = await repo.findOneBy({ id });
        if (!page) {
            throw new Error("CMS page not found.");
        }

        page.trang_thai = CMSPageStatus.DRAFT;
        return repo.save(page);
    }

    static async publishPage(id: number) {
        const repo = this.getPageRepository();
        const page = await repo.findOneBy({ id });
        if (!page) {
            throw new Error("CMS page not found.");
        }

        if (page.loai_noi_dung === CMSContentType.HTML && !page.noi_dung_html) {
            throw new Error("HTML page cannot be published without content.");
        }

        if (page.loai_noi_dung === CMSContentType.PDF && !page.tep_pdf) {
            throw new Error("PDF page cannot be published without an uploaded PDF.");
        }

        if (page.loai_noi_dung === CMSContentType.MEDIA && !this.hasMediaItems(page.metadata)) {
            throw new Error("Media page cannot be published without at least one media item.");
        }

        page.trang_thai = CMSPageStatus.PUBLISHED;
        return repo.save(page);
    }

    static async unpublishPage(id: number) {
        const repo = this.getPageRepository();
        const page = await repo.findOneBy({ id });
        if (!page) {
            throw new Error("CMS page not found.");
        }

        page.trang_thai = CMSPageStatus.DRAFT;
        return repo.save(page);
    }

    static async deletePage(id: number) {
        const pageRepo = this.getPageRepository();
        const menuRepo = this.getMenuRepository();
        const page = await pageRepo.findOneBy({ id });
        if (!page) {
            throw new Error("CMS page not found.");
        }

        const linkedMenu = await menuRepo.findOneBy({ page_id: id });
        if (linkedMenu) {
            throw new Error("CMS page is linked to one or more menu items.");
        }

        await pageRepo.remove(page);
        return { id };
    }

    static async createMenu(input: MenuInput) {
        if (!input.nhan_menu.trim()) {
            throw new Error("CMS menu label is required.");
        }

        if (input.loai_dich === CMSMenuTargetType.TOOL && !input.khoa_he_thong?.trim()) {
            throw new Error("Tool menu items require a system key.");
        }

        const repo = this.getMenuRepository();
        const menu = repo.create({
            ...input,
            duong_dan: input.duong_dan ? slugifyCmsPath(input.duong_dan) : undefined,
            parent_id: input.parent_id ?? null,
            page_id: input.page_id ?? null,
            thu_tu: input.thu_tu ?? 0,
            hien_thi: input.hien_thi ?? true,
        });

        return repo.save(menu);
    }

    static async updateMenu(id: number, input: MenuInput) {
        if (!input.nhan_menu.trim()) {
            throw new Error("CMS menu label is required.");
        }

        if (input.loai_dich === CMSMenuTargetType.TOOL && !input.khoa_he_thong?.trim()) {
            throw new Error("Tool menu items require a system key.");
        }

        const repo = this.getMenuRepository();
        const menu = await repo.findOneBy({ id });
        if (!menu) {
            throw new Error("CMS menu not found.");
        }

        Object.assign(menu, {
            ...input,
            duong_dan: input.duong_dan ? slugifyCmsPath(input.duong_dan) : undefined,
            parent_id: input.parent_id ?? null,
            page_id: input.page_id ?? null,
            thu_tu: input.thu_tu ?? menu.thu_tu,
            hien_thi: input.hien_thi ?? menu.hien_thi,
        });

        return repo.save(menu);
    }

    static async reorderMenus(items: Array<{ id: number; parent_id?: number | null; thu_tu: number }>) {
        const repo = this.getMenuRepository();
        for (const item of items) {
            await repo.update(
                { id: item.id },
                { parent_id: item.parent_id ?? null, thu_tu: item.thu_tu },
            );
        }

        return this.listAdminMenus();
    }

    static async deleteMenu(id: number) {
        const repo = this.getMenuRepository();
        const menu = await repo.findOneBy({ id });
        if (!menu) {
            throw new Error("CMS menu not found.");
        }

        if (menu.khoa_he_thong_bat_buoc) {
            throw new Error("System CMS menu cannot be deleted.");
        }

        const childMenu = await repo.findOneBy({ parent_id: id });
        if (childMenu) {
            throw new Error("CMS menu cannot be deleted while it still has child items.");
        }

        await repo.remove(menu);
        return { id };
    }

    private static resolveHtmlContent(input: PageInput, file?: Express.Multer.File) {
        if (input.loai_noi_dung !== CMSContentType.HTML) {
            return undefined;
        }

        const rawHtml = file?.buffer?.toString("utf-8") || input.noi_dung_html || "";
        return sanitizeCmsHtml(rawHtml);
    }

    private static normalizeMetadata(input: PageInput) {
        if (input.loai_noi_dung !== CMSContentType.MEDIA) {
            return input.metadata;
        }

        const mediaItems = this.extractMediaItems(input.metadata);
        return {
            ...(input.metadata || {}),
            media_items: mediaItems,
        };
    }

    private static extractMediaItems(metadata?: Record<string, unknown>) {
        const rawMediaItems = metadata?.media_items;
        if (!rawMediaItems) {
            return [];
        }

        const parsedItems = Array.isArray(rawMediaItems)
            ? rawMediaItems
            : typeof rawMediaItems === "string"
                ? JSON.parse(rawMediaItems)
                : [];

        if (!Array.isArray(parsedItems)) {
            return [];
        }

        return parsedItems
            .map((item) => {
                if (!item || typeof item !== "object") {
                    return null;
                }

                const mediaItem = item as CMSMediaItem;
                const loai = mediaItem.loai === "VIDEO" ? "VIDEO" : "IMAGE";
                const duongDan = String(mediaItem.duong_dan || "").trim();
                const ghiChu = typeof mediaItem.ghi_chu === "string" ? mediaItem.ghi_chu.trim() : "";

                if (!duongDan) {
                    return null;
                }

                return {
                    id: typeof mediaItem.id === "string" && mediaItem.id.trim() ? mediaItem.id.trim() : `${loai.toLowerCase()}-${Math.random().toString(36).slice(2, 10)}`,
                    loai: loai as "IMAGE" | "VIDEO",
                    duong_dan: duongDan,
                    ghi_chu: ghiChu || undefined,
                };
            })
            .filter((item) => item !== null);
    }

    private static hasMediaItems(metadata?: Record<string, unknown>) {
        return this.extractMediaItems(metadata).length > 0;
    }

    private static async ensureSystemMenus() {
        const repo = this.getMenuRepository();
        const existingMenus = await repo.find();

        for (const definition of SYSTEM_MENU_DEFINITIONS) {
            const existingMenu = existingMenus.find((item) => item.khoa_he_thong === definition.khoa_he_thong);
            if (!existingMenu) {
                const createdMenu = repo.create({
                    nhan_menu: definition.nhan_menu,
                    loai_dich: CMSMenuTargetType.TOOL,
                    khoa_he_thong: definition.khoa_he_thong,
                    thu_tu: definition.thu_tu,
                    hien_thi: true,
                    khoa_he_thong_bat_buoc: true,
                    parent_id: null,
                    page_id: null,
                });
                await repo.save(createdMenu);
                existingMenus.push(createdMenu);
                continue;
            }

            if (!existingMenu.khoa_he_thong_bat_buoc) {
                existingMenu.khoa_he_thong_bat_buoc = true;
                await repo.save(existingMenu);
            }
        }
    }

    private static buildMenuTree(menus: CMSMenu[], parentId: number | null = null, parentPath = ""): CMSMenuNode[] {
        return menus
            .filter((menu) => (menu.parent_id ?? null) === parentId)
            .sort((left, right) => left.thu_tu - right.thu_tu || left.id - right.id)
            .map((menu) => {
                const segment = menu.duong_dan ? slugifyCmsPath(menu.duong_dan) : "";
                const fullPath = segment ? [parentPath, segment].filter(Boolean).join("/") : parentPath || null;
                const children = this.buildMenuTree(menus, menu.id, fullPath || "");

                return {
                    ...menu,
                    children,
                    full_path: fullPath,
                };
            });
    }

    private static findMenuByPath(nodes: CMSMenuNode[], path: string): CMSMenuNode | null {
        for (const node of nodes) {
            if (node.full_path === path) {
                return node;
            }

            const childMatch = this.findMenuByPath(node.children, path);
            if (childMatch) {
                return childMatch;
            }
        }

        return null;
    }
}
