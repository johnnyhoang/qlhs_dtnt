export interface BackofficeHelpEntry {
  title: string;
  loader: () => Promise<string>;
}

const helpModules = import.meta.glob('./backoffice/*.html', {
  query: '?raw',
  import: 'default',
});

const loadHelpFile = (fileName: string) => {
  const loader = helpModules[`./backoffice/${fileName}.html`];

  if (!loader) {
    throw new Error(`Missing help file for ${fileName}`);
  }

  return () => loader() as Promise<string>;
};

const HELP_ENTRIES: Array<{
  match: (pathname: string) => boolean;
  title: string;
  loader: () => Promise<string>;
}> = [
  {
    match: (pathname) => pathname === '/admin',
    title: 'QLHS Overview Help',
    loader: loadHelpFile('qlhs-dashboard'),
  },
  {
    match: (pathname) => pathname === '/admin/hoc-sinh',
    title: 'Student Management Help',
    loader: loadHelpFile('students'),
  },
  {
    match: (pathname) => pathname === '/admin/suat-an',
    title: 'Meal Cut-off Help',
    loader: loadHelpFile('meals'),
  },
  {
    match: (pathname) => pathname === '/admin/dinh-muc-xe',
    title: 'Transport Support Help',
    loader: loadHelpFile('transport'),
  },
  {
    match: (pathname) => pathname === '/admin/bao-hiem',
    title: 'Insurance Profile Help',
    loader: loadHelpFile('insurance'),
  },
  {
    match: (pathname) => pathname === '/admin/thanh-toan',
    title: 'Payment Batch Help',
    loader: loadHelpFile('payments'),
  },
  {
    match: (pathname) => pathname === '/admin/cms',
    title: 'CMS Workspace Help',
    loader: loadHelpFile('cms'),
  },
  {
    match: (pathname) => pathname === '/admin/danh-muc-master',
    title: 'Master Data Help',
    loader: loadHelpFile('master-data'),
  },
  {
    match: (pathname) => pathname === '/admin/nguoi-dung',
    title: 'User Permission Help',
    loader: loadHelpFile('users'),
  },
  {
    match: (pathname) => pathname === '/admin/cds/dashboard',
    title: 'CDS Dashboard Help',
    loader: loadHelpFile('cds-dashboard'),
  },
  {
    match: (pathname) => pathname === '/admin/cds/evaluations',
    title: 'CDS Evaluation List Help',
    loader: loadHelpFile('cds-evaluations'),
  },
  {
    match: (pathname) => pathname === '/admin/cds/evaluations/new' || /^\/admin\/cds\/evaluations\/\d+$/.test(pathname),
    title: 'CDS Evaluation Form Help',
    loader: loadHelpFile('cds-evaluation-form'),
  },
  {
    match: (pathname) => /^\/admin\/cds\/evaluations\/print\/\d+$/.test(pathname),
    title: 'CDS Evaluation Print Help',
    loader: loadHelpFile('cds-evaluation-print'),
  },
  {
    match: (pathname) => pathname === '/admin/cds/admin/periods',
    title: 'CDS Period Management Help',
    loader: loadHelpFile('cds-periods'),
  },
  {
    match: (pathname) => /^\/admin\/cds\/admin\/periods\/print\/\d+$/.test(pathname),
    title: 'CDS Period Report Print Help',
    loader: loadHelpFile('cds-period-print'),
  },
];

export const resolveBackofficeHelp = (pathname: string): BackofficeHelpEntry | null => {
  const match = HELP_ENTRIES.find((entry) => entry.match(pathname));
  if (!match) {
    return null;
  }

  return {
    title: match.title,
    loader: match.loader,
  };
};
