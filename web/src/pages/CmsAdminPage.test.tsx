import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CmsAdminPage from './CmsAdminPage';

vi.mock('../api/cms', () => ({
  getAdminPages: vi.fn().mockResolvedValue([]),
  getAdminPage: vi.fn().mockResolvedValue(null),
  createAdminPage: vi.fn(),
  updateAdminPage: vi.fn(),
  saveAdminPageDraft: vi.fn(),
  publishAdminPage: vi.fn(),
  unpublishAdminPage: vi.fn(),
  deleteAdminPage: vi.fn(),
  getAdminMenus: vi.fn().mockResolvedValue([]),
  createAdminMenu: vi.fn(),
  updateAdminMenu: vi.fn(),
  reorderAdminMenus: vi.fn(),
  deleteAdminMenu: vi.fn(),
}));

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

describe('CmsAdminPage', () => {
  it('renders the CMS admin workspace tabs', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CmsAdminPage />
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: /CMS/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Trang/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /menu/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /trang|tao/i })).toBeInTheDocument();
  });
});
