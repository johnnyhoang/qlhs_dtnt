import { describe, expect, it } from 'vitest';
import { CMSContentType } from '../src/entities/CMSPage';
import { sanitizeCmsHtml, slugifyCmsPath, validateCmsUpload } from '../src/utils/cms.util';

describe('cms utilities', () => {
  it('slugifies a menu or page path', () => {
    expect(slugifyCmsPath('Giới thiệu Trường Nội Trú')).toBe('gioi-thieu-truong-noi-tru');
  });

  it('removes dangerous html content', () => {
    const result = sanitizeCmsHtml('<h1>Hello</h1><script>alert(1)</script>');
    expect(result).toContain('<h1>Hello</h1>');
    expect(result).not.toContain('<script>');
  });

  it('rejects oversized uploads', () => {
    expect(() =>
      validateCmsUpload(CMSContentType.PDF, {
        size: 3 * 1024 * 1024,
        mimetype: 'application/pdf',
      } as Express.Multer.File),
    ).toThrow('2MB limit');
  });
});
