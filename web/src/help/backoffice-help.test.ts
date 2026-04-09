import { describe, expect, it } from 'vitest';
import { resolveBackofficeHelp } from './backoffice-help';

describe('resolveBackofficeHelp', () => {
  it('resolves static backoffice routes', () => {
    expect(resolveBackofficeHelp('/admin/hoc-sinh')?.title).toBe('Huong dan quan ly hoc sinh');
    expect(resolveBackofficeHelp('/admin/cds/dashboard')?.title).toBe('Huong dan dashboard CDS');
    expect(resolveBackofficeHelp('/admin/cms')?.title).toBe('Huong dan CMS');
  });

  it('resolves dynamic backoffice routes', () => {
    expect(resolveBackofficeHelp('/admin/cds/evaluations/12')?.title).toBe('Huong dan phieu danh gia CDS');
    expect(resolveBackofficeHelp('/admin/cds/evaluations/print/12')?.title).toBe('Huong dan in phieu CDS');
    expect(resolveBackofficeHelp('/admin/cds/admin/periods/print/9')?.title).toBe('Huong dan in bao cao ky CDS');
  });
});
