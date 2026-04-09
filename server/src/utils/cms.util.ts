import sanitizeHtml from "sanitize-html";
import { CMSContentType } from "../entities/CMSPage";

export const slugifyCmsPath = (input: string) =>
    input
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");

export const sanitizeCmsHtml = (html: string) =>
    sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            "img",
            "h1",
            "h2",
            "h3",
            "section",
            "article",
            "iframe",
        ]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            a: ["href", "name", "target", "rel"],
            img: ["src", "alt", "title", "width", "height"],
            iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder"],
            "*": ["style", "class"],
        },
        allowedSchemes: ["http", "https", "data", "mailto"],
    });

export const validateCmsUpload = (
    contentType: CMSContentType,
    file?: Express.Multer.File | null,
) => {
    if (file && file.size > 2 * 1024 * 1024) {
        throw new Error("Uploaded file exceeds the 2MB limit.");
    }

    if (contentType === CMSContentType.HTML && file && !file.mimetype.includes("html")) {
        throw new Error("HTML pages only accept .html uploads.");
    }

    if (contentType === CMSContentType.PDF && file && file.mimetype !== "application/pdf") {
        throw new Error("PDF pages only accept .pdf uploads.");
    }

    if (contentType === CMSContentType.MEDIA && file) {
        throw new Error("Media pages do not accept single file uploads.");
    }
};
