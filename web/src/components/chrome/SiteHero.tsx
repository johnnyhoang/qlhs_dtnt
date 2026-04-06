import React from 'react';
import { Badge, Space, Typography } from 'antd';
import logoDtnt from '../../assets/logo-dtnt.png';

const { Text, Title } = Typography;

interface SiteHeroProps {
    compact?: boolean;
}

const SiteHero: React.FC<SiteHeroProps> = ({ compact = false }) => {
    return (
        <div className={compact ? 'site-hero site-hero--compact' : 'site-hero'}>
            <div className="site-hero__backdrop" />
            <div className="site-hero__content">
                <div className="site-hero__identity">
                    <div className="site-hero__badge">
                        <img
                            src={logoDtnt}
                            alt={"Logo Tr\u01b0\u1eddng Ph\u1ed5 th\u00f4ng D\u00e2n t\u1ed9c N\u1ed9i tr\u00fa THCS-THPT t\u1ec9nh L\u00e2m \u0110\u1ed3ng"}
                            className="site-hero__logo"
                        />
                    </div>
                    <div className="site-hero__copy">
                        <Text className="site-hero__eyebrow">{"S\u1edf Gi\u00e1o d\u1ee5c v\u00e0 \u0110\u00e0o t\u1ea1o t\u1ec9nh L\u00e2m \u0110\u1ed3ng"}</Text>
                        <Title level={compact ? 4 : 2} className="site-hero__title">
                            {"Tr\u01b0\u1eddng Ph\u1ed5 th\u00f4ng D\u00e2n t\u1ed9c N\u1ed9i tr\u00fa"}
                        </Title>
                        <Title level={compact ? 5 : 3} className="site-hero__subtitle">
                            {"THCS-THPT t\u1ec9nh L\u00e2m \u0110\u1ed3ng"}
                        </Title>
                        <Space wrap size={[8, 8]} className="site-hero__meta">
                            <Badge color="#c3e88d" text={"C\u1ed5ng th\u00f4ng tin v\u00e0 qu\u1ea3n tr\u1ecb n\u1ed9i b\u1ed9"} />
                            <Badge color="#f1d17c" text={"CMS, Qu\u1ea3n l\u00fd h\u1ecdc sinh, Chuy\u1ec3n \u0111\u1ed5i s\u1ed1"} />
                        </Space>
                    </div>
                </div>
                <div className="site-hero__campus" aria-hidden="true">
                    <div className="site-hero__campus-card" />
                </div>
            </div>
            <div className="site-hero__footer">
                {"S\u1ed1 02 Huy\u1ec1n Tr\u00e2n C\u00f4ng Ch\u00faa, P4, \u0110\u00e0 L\u1ea1t, L\u00e2m \u0110\u1ed3ng - 02633 822 160"}
            </div>
        </div>
    );
};

export default SiteHero;
