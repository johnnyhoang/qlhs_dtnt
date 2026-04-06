import React from 'react';
import { Alert, Card, Collapse, Descriptions, Empty } from 'antd';
import { WEB_ENV } from '../../config/env';
import type { CMSPage } from '../../types/cms';

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

  return (
    <Card className="page-section-card cms-page-card" variant="borderless">
      <div className="cms-page-card__inner">
        <div className="cms-page-card__header">
          <span className="page-kicker">{page.la_trang_chu ? 'Trang ch\u1ee7' : 'N\u1ed9i dung CMS'}</span>
          <h1 className="page-title">{page.tieu_de}</h1>
        </div>

        {page.mo_ta ? <p className="page-description">{page.mo_ta}</p> : null}

        {page.loai_noi_dung === 'HTML' ? (
          <div className="cms-html-content" data-testid="cms-html-content" dangerouslySetInnerHTML={{ __html: page.noi_dung_html || '' }} />
        ) : (
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
