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
    title: 'Huong dan tong quan QLHS',
    loader: loadHelpFile('qlhs-dashboard'),
  },
  {
    match: (pathname) => pathname === '/admin/hoc-sinh',
    title: 'Huong dan quan ly hoc sinh',
    loader: loadHelpFile('students'),
  },
  {
    match: (pathname) => pathname === '/admin/suat-an',
    title: 'Huong dan suat an',
    loader: loadHelpFile('meals'),
  },
  {
    match: (pathname) => pathname === '/admin/dinh-muc-xe',
    title: 'Huong dan dinh muc xe',
    loader: loadHelpFile('transport'),
  },
  {
    match: (pathname) => pathname === '/admin/bao-hiem',
    title: 'Huong dan bao hiem',
    loader: loadHelpFile('insurance'),
  },
  {
    match: (pathname) => pathname === '/admin/thanh-toan',
    title: 'Huong dan thanh toan',
    loader: loadHelpFile('payments'),
  },
  {
    match: (pathname) => pathname === '/admin/cms',
    title: 'Huong dan CMS',
    loader: loadHelpFile('cms'),
  },
  {
    match: (pathname) => pathname === '/admin/danh-muc-master',
    title: 'Huong dan danh muc',
    loader: loadHelpFile('master-data'),
  },
  {
    match: (pathname) => pathname === '/admin/nguoi-dung',
    title: 'Huong dan nguoi dung',
    loader: loadHelpFile('users'),
  },
  {
    match: (pathname) => pathname === '/admin/cds/dashboard',
    title: 'Huong dan dashboard CDS',
    loader: loadHelpFile('cds-dashboard'),
  },
  {
    match: (pathname) => pathname === '/admin/cds/evaluations',
    title: 'Huong dan danh sach phieu CDS',
    loader: loadHelpFile('cds-evaluations'),
  },
  {
    match: (pathname) => pathname === '/admin/cds/evaluations/new' || /^\/admin\/cds\/evaluations\/\d+$/.test(pathname),
    title: 'Huong dan phieu danh gia CDS',
    loader: loadHelpFile('cds-evaluation-form'),
  },
  {
    match: (pathname) => /^\/admin\/cds\/evaluations\/print\/\d+$/.test(pathname),
    title: 'Huong dan in phieu CDS',
    loader: loadHelpFile('cds-evaluation-print'),
  },
  {
    match: (pathname) => pathname === '/admin/cds/admin/periods',
    title: 'Huong dan ky danh gia CDS',
    loader: loadHelpFile('cds-periods'),
  },
  {
    match: (pathname) => /^\/admin\/cds\/admin\/periods\/print\/\d+$/.test(pathname),
    title: 'Huong dan in bao cao ky CDS',
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
