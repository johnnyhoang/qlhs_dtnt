import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CdsDocumentHeader from './CdsDocumentHeader';

describe('CdsDocumentHeader', () => {
  it('renders the updated school and national headers', () => {
    render(
      <CdsDocumentHeader
        title="PHIẾU ĐÁNH GIÁ MỨC ĐỘ CHUYỂN ĐỔI SỐ"
        regulationLines={[
          'Theo quyết định số 4725/QĐ-BGDĐT ngày 30 tháng 12 năm 2022',
          'của Bộ giáo dục đào tạo',
        ]}
      />,
    );

    expect(screen.getByText('SỞ GIÁO DỤC ĐÀO TẠO LÂM ĐỒNG')).toBeInTheDocument();
    expect(screen.getByText('TRƯỜNG PTDTNT THCS-THPT TỈNH')).toBeInTheDocument();
    expect(screen.getByText('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM')).toBeInTheDocument();
    expect(screen.getByText('Độc lập - Tự do - Hạnh phúc')).toBeInTheDocument();
    expect(screen.getByText('Theo quyết định số 4725/QĐ-BGDĐT ngày 30 tháng 12 năm 2022')).toBeInTheDocument();
  });
});
