import React from 'react';
import { Card, Tabs, Typography } from 'antd';
import CmsPageManager from '../components/cms/admin/CmsPageManager';
import CmsMenuManager from '../components/cms/admin/CmsMenuManager';

const { Paragraph, Title } = Typography;

const CmsAdminPage: React.FC = () => {
  return (
    <Card variant="borderless">
      <Title level={3} style={{ marginTop: 0 }}>Quan tri CMS</Title>
      <Paragraph type="secondary">
        Tao trang public, quan ly menu nhieu cap, va xuat ban noi dung HTML, PDF hoac media truc tiep tu khu quan tri.
      </Paragraph>
      <Tabs
        items={[
          {
            key: 'pages',
            label: 'Trang noi dung',
            children: <CmsPageManager />,
          },
          {
            key: 'menus',
            label: 'Cau truc menu',
            children: <CmsMenuManager />,
          },
        ]}
      />
    </Card>
  );
};

export default CmsAdminPage;
