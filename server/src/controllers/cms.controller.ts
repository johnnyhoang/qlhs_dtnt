import { Request, Response } from "express";
import { CMSService } from "../services/cms.service";
import { CMSContentType } from "../entities/CMSPage";
import { CMSMenuTargetType } from "../entities/CMSMenu";

const handleCmsError = (res: Response, error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown CMS error";

    if (message.includes("not found")) {
        return res.status(404).json({ message });
    }

    if (
        message.includes("required") ||
        message.includes("accept") ||
        message.includes("limit") ||
        message.includes("cannot be published") ||
        message.includes("cannot be deleted") ||
        message.includes("linked")
    ) {
        return res.status(400).json({ message });
    }

    return res.status(500).json({ message });
};

const parseMetadata = (value: unknown) => {
    if (!value) {
        return undefined;
    }

    if (typeof value === "string") {
        return JSON.parse(value);
    }

    return value as Record<string, string | number | boolean | null>;
};

const parsePageBody = (body: Record<string, unknown>) => ({
    tieu_de: String(body.tieu_de || ""),
    slug: body.slug ? String(body.slug) : undefined,
    mo_ta: body.mo_ta ? String(body.mo_ta) : undefined,
    loai_noi_dung: String(body.loai_noi_dung || CMSContentType.HTML) as CMSContentType,
    noi_dung_html: body.noi_dung_html ? String(body.noi_dung_html) : undefined,
    metadata: parseMetadata(body.metadata),
    la_trang_chu: String(body.la_trang_chu || "false") === "true",
});

const parseMenuBody = (body: Record<string, unknown>) => ({
    nhan_menu: String(body.nhan_menu || ""),
    loai_dich: String(body.loai_dich || CMSMenuTargetType.PAGE) as CMSMenuTargetType,
    duong_dan: body.duong_dan ? String(body.duong_dan) : undefined,
    khoa_he_thong: body.khoa_he_thong ? String(body.khoa_he_thong) : undefined,
    parent_id: body.parent_id ? Number(body.parent_id) : null,
    page_id: body.page_id ? Number(body.page_id) : null,
    thu_tu: body.thu_tu ? Number(body.thu_tu) : 0,
    hien_thi: body.hien_thi === undefined ? true : String(body.hien_thi) === "true",
});

export const listPublishedMenus = async (_req: Request, res: Response) => {
    try {
        const menus = await CMSService.getPublishedMenuTree();
        res.json({ items: menus });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const getHomepage = async (_req: Request, res: Response) => {
    try {
        const page = await CMSService.getHomepage();
        if (!page) {
            return res.status(404).json({ message: "Homepage not found." });
        }

        res.json({ item: page });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const getPublishedPageBySlug = async (req: Request, res: Response) => {
    try {
        const slug = String(req.query.slug || "");
        const page = await CMSService.getPublishedPageBySlug(slug);
        if (!page) {
            return res.status(404).json({ message: "CMS page not found." });
        }

        res.json({ item: page });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const getPublishedPageByPath = async (req: Request, res: Response) => {
    try {
        const path = String(req.query.path || "");
        const page = await CMSService.getPublishedPageByPath(path);
        if (!page) {
            return res.status(404).json({ message: "CMS page not found." });
        }

        res.json({ item: page });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const getPublishedPdf = async (req: Request, res: Response) => {
    try {
        const slug = String(req.query.slug || "");
        const page = await CMSService.getPublishedPageBySlug(slug);
        if (!page || page.loai_noi_dung !== CMSContentType.PDF || !page.tep_pdf) {
            return res.status(404).json({ message: "PDF page not found." });
        }

        res.setHeader("Content-Type", "application/pdf");
        res.send(page.tep_pdf);
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const listAdminMenus = async (_req: Request, res: Response) => {
    try {
        const items = await CMSService.listAdminMenus();
        res.json({ items });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const createMenu = async (req: Request, res: Response) => {
    try {
        const item = await CMSService.createMenu(parseMenuBody(req.body));
        res.status(201).json({ item });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const updateMenu = async (req: Request, res: Response) => {
    try {
        const item = await CMSService.updateMenu(Number(req.params.id), parseMenuBody(req.body));
        res.json({ item });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const reorderMenus = async (req: Request, res: Response) => {
    try {
        const items = await CMSService.reorderMenus(req.body.items || []);
        res.json({ items });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const deleteMenu = async (req: Request, res: Response) => {
    try {
        const result = await CMSService.deleteMenu(Number(req.params.id));
        res.json(result);
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const listAdminPages = async (_req: Request, res: Response) => {
    try {
        const items = await CMSService.listAdminPages();
        res.json({ items });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const getAdminPage = async (req: Request, res: Response) => {
    try {
        const item = await CMSService.getAdminPageById(Number(req.params.id));
        if (!item) {
            return res.status(404).json({ message: "CMS page not found." });
        }

        res.json({ item });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const createPage = async (req: Request, res: Response) => {
    try {
        const actorId = (req as any).user?.id;
        const item = await CMSService.createPage(parsePageBody(req.body), actorId, req.file);
        res.status(201).json({ item });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const updatePage = async (req: Request, res: Response) => {
    try {
        const actorId = (req as any).user?.id;
        const item = await CMSService.updatePage(Number(req.params.id), parsePageBody(req.body), actorId, req.file);
        res.json({ item });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const saveDraft = async (req: Request, res: Response) => {
    try {
        const item = await CMSService.saveDraft(Number(req.params.id));
        res.json({ item });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const publishPage = async (req: Request, res: Response) => {
    try {
        const item = await CMSService.publishPage(Number(req.params.id));
        res.json({ item });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const unpublishPage = async (req: Request, res: Response) => {
    try {
        const item = await CMSService.unpublishPage(Number(req.params.id));
        res.json({ item });
    } catch (error) {
        handleCmsError(res, error);
    }
};

export const deletePage = async (req: Request, res: Response) => {
    try {
        const result = await CMSService.deletePage(Number(req.params.id));
        res.json(result);
    } catch (error) {
        handleCmsError(res, error);
    }
};
