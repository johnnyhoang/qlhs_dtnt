import { describe, expect, it } from 'vitest';
import { resolveBackofficeHelp } from './backoffice-help';

describe('resolveBackofficeHelp', () => {
  it('resolves static backoffice routes', () => {
    expect(resolveBackofficeHelp('/admin/hoc-sinh')?.title).toBe('Student Management Help');
    expect(resolveBackofficeHelp('/admin/cds/dashboard')?.title).toBe('CDS Dashboard Help');
    expect(resolveBackofficeHelp('/admin/cms')?.title).toBe('CMS Workspace Help');
  });

  it('resolves dynamic backoffice routes', () => {
    expect(resolveBackofficeHelp('/admin/cds/evaluations/12')?.title).toBe('CDS Evaluation Form Help');
    expect(resolveBackofficeHelp('/admin/cds/evaluations/print/12')?.title).toBe('CDS Evaluation Print Help');
    expect(resolveBackofficeHelp('/admin/cds/admin/periods/print/9')?.title).toBe('CDS Period Report Print Help');
  });
});
