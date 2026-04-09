import React from 'react';
import { Alert, Button, Card, Collapse, Descriptions, Empty, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { WEB_ENV } from '../../config/env';
import type { CMSMediaItem, CMSPage } from '../../types/cms';

interface CmsPageContentProps {
  page?: CMSPage | null;
}

const metadataLabels: Record<string, string> = {
  loai_van_ban: 'Loại nội dung',
  so_hieu: 'Số hiệu',
  ngay_ban_hanh: 'Ngày ban hành',
  co_quan_ban_hanh: 'Cơ quan ban hành',
  linh_vuc: 'Lĩnh vực',
  ghi_chu: 'Ghi chú',
  ngay_cap_nhat: 'Ngày cập nhật',
};

const CmsPageContent: React.FC<CmsPageContentProps> = ({ page }) => {
  if (!page) {
    return <Empty description={"N\u1ed9i dung ch\u01b0a \u0111\u01b0\u1ee3c c\u1ea5u h\u00ecnh"} />;
  }

  const mediaItems = Array.isArray(page.metadata?.media_items)
    ? page.metadata.media_items.filter((item): item is CMSMediaItem => Boolean(item && typeof item === 'object'))
    : [];

  const handleDownloadPdf = () => {
    if (page.loai_noi_dung === 'PDF') {
      window.open(`${WEB_ENV.API_URL}/cms/pages/pdf?slug=${page.slug}`, '_blank', 'noopener,noreferrer');
      return;
    }

    const printableContent = document.querySelector('.cms-page-card__inner')?.innerHTML;
    if (!printableContent) {
      return;
    }

    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720');
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html lang="vi">
        <head>
          <meta charset="utf-8" />
          <title>${page.tieu_de}</title>
          <style>
            body { font-family: "Noto Sans", "Segoe UI", sans-serif; margin: 24px; color: #183625; }
            .page-title { font-size: 28px; margin-bottom: 12px; color: #0d5a1d; }
            .page-description { color: #647067; margin-bottom: 20px; }
            .cms-html-content { line-height: 1.7; }
            .cms-html-content img, .cms-html-content iframe, .cms-media-card__asset img, .cms-media-card__asset iframe, table { max-width: 100%; }
            .cms-media-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
            .cms-media-card { border: 1px solid #d8e8d8; border-radius: 16px; overflow: hidden; break-inside: avoid; }
            .cms-media-card__asset { aspect-ratio: 4 / 3; background: #f3f8f2; }
            .cms-media-card__asset img, .cms-media-card__asset iframe { width: 100%; height: 100%; object-fit: cover; border: 0; }
            .cms-media-card__caption { padding: 10px 12px 12px; font-size: 14px; }
            .cms-page-card__meta-collapse, button { display: none !important; }
            @page { size: A4; margin: 14mm; }
          </style>
        </head>
        <body>
          ${printableContent}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Card className="page-section-card cms-page-card" variant="borderless">
      <div className="cms-page-card__inner">
        <div className="cms-page-card__header">
          <div className="cms-page-card__headline">
            <div>
              {page.la_trang_chu ? <span className="page-kicker">Trang chu</span> : null}
              <h1 className="page-title">{page.tieu_de}</h1>
            </div>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleDownloadPdf}>
                Tai PDF
              </Button>
            </Space>
          </div>
        </div>

        {page.mo_ta ? <p className="page-description">{page.mo_ta}</p> : null}

        {page.loai_noi_dung === 'HTML' ? (
          <div className="cms-html-content" data-testid="cms-html-content" dangerouslySetInnerHTML={{ __html: page.noi_dung_html || '' }} />
        ) : page.loai_noi_dung === 'PDF' ? (
          <>
            <Alert
              type="info"
              showIcon
              message={"T\u00e0i li\u1ec7u PDF \u0111\u01b0\u1ee3c hi\u1ec3n th\u1ecb tr\u1ef1c ti\u1ebfp b\u00ean d\u01b0\u1edbi."}
              style={{ marginBottom: 16 }}
            />
            <iframe
              title={page.tieu_de}
              src={`${WEB_ENV.API_URL}/cms/pages/pdf?slug=${page.slug}`}
              className="cms-page-card__frame"
            />
          </>
        ) : (
          <div className="cms-media-grid" data-testid="cms-media-content">
            {mediaItems.map((item, index) => (
              <figure key={item.id || `${item.loai}-${index}`} className="cms-media-card">
                <div className="cms-media-card__asset">
                  {item.loai === 'VIDEO' ? (
                    <iframe
                      title={item.ghi_chu || `Video ${index + 1}`}
                      src={item.duong_dan}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <img src={item.duong_dan} alt={item.ghi_chu || page.tieu_de} loading="lazy" />
                  )}
                </div>
                {item.ghi_chu ? <figcaption className="cms-media-card__caption">{item.ghi_chu}</figcaption> : null}
              </figure>
            ))}
          </div>
        )}

        {page.metadata && Object.keys(page.metadata).length > 0 ? (
          <Collapse
            size="small"
            ghost
            className="cms-page-card__meta-collapse"
            items={[
              {
                key: 'meta',
                label: 'Thông tin bổ sung',
                children: (
                  <Descriptions bordered size="small" column={1} className="cms-page-card__meta">
                    {Object.entries(page.metadata).map(([key, value]) => (
                      <Descriptions.Item key={key} label={metadataLabels[key] || key}>
                        {String(value)}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                ),
              },
            ]}
          />
        ) : null}
      </div>
    </Card>
  );
};

export default CmsPageContent;
