import React from 'react';
import { Alert, Card, Descriptions, Empty } from 'antd';
import { WEB_ENV } from '../../config/env';
import type { CMSPage } from '../../types/cms';

interface CmsPageContentProps {
  page?: CMSPage | null;
}

const CmsPageContent: React.FC<CmsPageContentProps> = ({ page }) => {
  if (!page) {
    return <Empty description="Noi dung chua duoc cau hinh" />;
  }

  return (
    <Card variant="borderless">
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 8 }}>{page.tieu_de}</h1>
        {page.mo_ta ? (
          <p style={{ marginTop: 0, marginBottom: 24, color: '#4f5b67', fontSize: 16 }}>{page.mo_ta}</p>
        ) : null}

        {page.metadata && Object.keys(page.metadata).length > 0 ? (
          <Descriptions bordered size="small" column={1} style={{ marginBottom: 24 }}>
            {Object.entries(page.metadata).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {String(value)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        ) : null}

        {page.loai_noi_dung === 'HTML' ? (
          <div data-testid="cms-html-content" dangerouslySetInnerHTML={{ __html: page.noi_dung_html || '' }} />
        ) : (
          <>
            <Alert
              type="info"
              showIcon
              message="Tai lieu PDF duoc hien thi truc tiep ben duoi."
              style={{ marginBottom: 16 }}
            />
            <iframe
              title={page.tieu_de}
              src={`${WEB_ENV.API_URL}/cms/pages/pdf?slug=${page.slug}`}
              style={{ width: '100%', minHeight: '80vh', border: '1px solid #d9d9d9', borderRadius: 12 }}
            />
          </>
        )}
      </div>
    </Card>
  );
};

export default CmsPageContent;
