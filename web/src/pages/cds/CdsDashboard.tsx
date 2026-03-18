import React from 'react';
import { Card, Typography, Row, Col, Statistic, Space } from 'antd';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getCdsDashboardStats } from '../../api/cds-evaluation';
import { FileProtectOutlined, RiseOutlined } from '@ant-design/icons';
import SkeletonLoader from '../../components/SkeletonLoader';

const { Title, Text } = Typography;

const CdsDashboard: React.FC = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['cds-dashboard-stats'],
        queryFn: () => getCdsDashboardStats()
    });

    if (isLoading) return <SkeletonLoader type="list" />;

    const radarData = [
        {
            subject: 'Dạy và Học',
            A: stats?.averageGroup1 || 0,
            fullMark: 100,
        },
        {
            subject: 'Quản trị CĐS',
            A: stats?.averageGroup2 || 0,
            fullMark: 100,
        }
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <Card size="small" hoverable style={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Statistic
                            title="Số Phiếu đánh giá"
                            value={stats?.totalEvaluations || 0}
                            prefix={<FileProtectOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={8}>
                    <Card size="small" hoverable style={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Statistic
                            title="Trung bình Dạy học"
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
                            title="Trung bình Quản trị"
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
                <Title level={4}>Phân tích Mức độ Chuyển đổi số hiện tại</Title>
                <Text type="secondary">Biểu đồ Radar thể hiện điểm trung bình của toàn trường phản chiếu tổng hợp Phiếu Tự đánh giá.</Text>
                
                <div style={{ width: '100%', height: 400, marginTop: 24, padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar name="Trường PT DTNT" dataKey="A" stroke="#1677ff" fill="#1677ff" fillOpacity={0.6} />
                            <RechartsTooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </Space>
    );
};

export default CdsDashboard;
