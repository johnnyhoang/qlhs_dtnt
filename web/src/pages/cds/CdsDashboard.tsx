import React, { Suspense, lazy } from 'react';
import { Card, Typography, Row, Col, Statistic, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getCdsDashboardStats } from '../../api/cds-evaluation';
import { FileProtectOutlined, RiseOutlined } from '@ant-design/icons';
import SkeletonLoader from '../../components/SkeletonLoader';

const CdsRadarChart = lazy(() => import('../../components/reports/CdsRadarChart'));

const { Title, Text } = Typography;

const CdsDashboard: React.FC = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['cds-dashboard-stats'],
        queryFn: () => getCdsDashboardStats(),
    });

    if (isLoading) {
        return <SkeletonLoader type="list" />;
    }

    const radarData = [
        {
            subject: 'Day va Hoc',
            A: stats?.averageGroup1 || 0,
            fullMark: 100,
        },
        {
            subject: 'Quan tri CDS',
            A: stats?.averageGroup2 || 0,
            fullMark: 100,
        },
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <Card size="small" hoverable style={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Statistic
                            title="So Phieu danh gia"
                            value={stats?.totalEvaluations || 0}
                            prefix={<FileProtectOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={8}>
                    <Card size="small" hoverable style={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Statistic
                            title="Trung binh Day hoc"
                            value={stats?.averageGroup1 || 0}
                            precision={2}
                            suffix="/ 100"
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<RiseOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={8}>
                    <Card size="small" hoverable style={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Statistic
                            title="Trung binh Quan tri"
                            value={stats?.averageGroup2 || 0}
                            precision={2}
                            suffix="/ 100"
                            valueStyle={{ color: '#3fafff' }}
                            prefix={<RiseOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginTop: 8, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Title level={4}>Phan tich muc do chuyen doi so hien tai</Title>
                <Text type="secondary">
                    Bieu do radar the hien diem trung binh cua toan truong, tong hop tu phieu tu danh gia.
                </Text>

                <div style={{ width: '100%', height: 400, marginTop: 24, padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <Suspense fallback={<SkeletonLoader type="list" />}>
                        <CdsRadarChart data={radarData} />
                    </Suspense>
                </div>
            </Card>
        </Space>
    );
};

export default CdsDashboard;
