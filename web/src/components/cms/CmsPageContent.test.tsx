import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CmsPageContent from './CmsPageContent';

describe('CmsPageContent', () => {
  it('renders HTML page content inline', () => {
    render(
      <CmsPageContent
        page={{
          id: 1,
          slug: 'gioi-thieu',
          tieu_de: 'Giới thiệu',
          loai_noi_dung: 'HTML',
          noi_dung_html: '<p>Xin chào</p>',
          la_trang_chu: false,
          trang_thai: 'PUBLISHED',
        }}
      />,
    );

    expect(screen.getByText('Giới thiệu')).toBeInTheDocument();
    expect(screen.getByTestId('cms-html-content')).toHaveTextContent('Xin chào');
  });
});
