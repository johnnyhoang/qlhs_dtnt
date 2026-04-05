import { Router } from "express";
import multer from "multer";
import {
    createMenu,
    createPage,
    deleteMenu,
    deletePage,
    getAdminPage,
    getHomepage,
    getPublishedPageByPath,
    getPublishedPageBySlug,
    getPublishedPdf,
    listAdminMenus,
    listAdminPages,
    listPublishedMenus,
    publishPage,
    reorderMenus,
    saveDraft,
    unpublishPage,
    updateMenu,
    updatePage,
} from "../controllers/cms.controller";
import { authMiddleware, editorOrAdmin } from "../middlewares/auth.middleware";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
});

router.get("/menus", listPublishedMenus);
router.get("/pages/home", getHomepage);
router.get("/pages/by-slug", getPublishedPageBySlug);
router.get("/pages/by-path", getPublishedPageByPath);
router.get("/pages/pdf", getPublishedPdf);

router.use("/admin", authMiddleware, editorOrAdmin);

router.get("/admin/menus", listAdminMenus);
router.post("/admin/menus", createMenu);
router.put("/admin/menus/:id", updateMenu);
router.delete("/admin/menus/:id", deleteMenu);
router.post("/admin/menus/reorder", reorderMenus);

router.get("/admin/pages", listAdminPages);
router.get("/admin/pages/:id", getAdminPage);
router.post("/admin/pages", upload.single("tep_noi_dung"), createPage);
router.put("/admin/pages/:id", upload.single("tep_noi_dung"), updatePage);
router.post("/admin/pages/:id/draft", saveDraft);
router.post("/admin/pages/:id/publish", publishPage);
router.post("/admin/pages/:id/unpublish", unpublishPage);
router.delete("/admin/pages/:id", deletePage);

export default router;
