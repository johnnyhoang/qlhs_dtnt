import React from 'react';
import { Badge, Space, Typography } from 'antd';
import logoDtnt from '../../assets/logo-dtnt.png';

const { Text, Title } = Typography;

interface SiteHeroProps {
  compact?: boolean;
  navigation?: React.ReactNode;
}

const SiteHero: React.FC<SiteHeroProps> = ({ compact = false, navigation }) => {
  return (
    <div className={compact ? 'site-hero site-hero--compact' : 'site-hero'}>
      <div className="site-hero__backdrop" />
      <div className="site-hero__content">
        <div className="site-hero__identity">
          <div className="site-hero__badge">
            <img
              src={logoDtnt}
              alt="Logo Truong Pho thong Dan toc Noi tru THCS-THPT tinh Lam Dong"
              className="site-hero__logo"
            />
          </div>
          <div className="site-hero__copy">
            <Text className="site-hero__eyebrow">So Giao duc va Dao tao tinh Lam Dong</Text>
            <Title level={compact ? 4 : 2} className="site-hero__title">
              Truong Pho thong Dan toc Noi tru
            </Title>
            <Title level={compact ? 5 : 3} className="site-hero__subtitle">
              THCS-THPT tinh Lam Dong
            </Title>
            <Space wrap size={[8, 8]} className="site-hero__meta">
              <Badge color="#c3e88d" text="Cong thong tin dien tu" />
              <Badge color="#f1d17c" text="CMS, Quan ly hoc sinh, Chuyen doi so" />
            </Space>
          </div>
        </div>
        <div className="site-hero__campus" aria-hidden="true">
          <div className="site-hero__campus-card" />
        </div>
      </div>
      {navigation ? <div className="site-hero__nav-slot">{navigation}</div> : null}
      <div className="site-hero__bottom">
        So 02 Huyen Tran Cong Chua, P4, Da Lat, Lam Dong - 02633 822 160
      </div>
    </div>
  );
};

export default SiteHero;
