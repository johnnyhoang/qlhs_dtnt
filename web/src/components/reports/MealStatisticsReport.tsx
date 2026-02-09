import React from 'react';
import { Card, Row, Col, Statistic, Progress, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { layThongKeSuatAnTheoThang } from '../../api/thong-ke';

interface MealStatisticsReportProps {
    month: number;
    year: number;
    classes?: string[];
}

const MealStatisticsReport: React.FC<MealStatisticsReportProps> = ({ month, year, classes = [] }) => {
    const { data, isLoading } = useQuery({
        queryKey: ['thong-ke-suat-an-thang', month, year, classes],
        queryFn: () => layThongKeSuatAnTheoThang(month, year, classes),
        enabled: !!month && !!year
    });

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>;
    }

    if (!data) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Không có dữ liệu</div>;
    }

    const totalPossibleMeals = data.total_possible_meals * 3; // 3 meals per day
    const servedPercent = (data.total_meals_served / totalPossibleMeals) * 100;
    const cutPercent = (data.total_meals_cut / totalPossibleMeals) * 100;

    return (
        <div>
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng học sinh"
                            value={data.total_students}
                            suffix="HS"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Số ngày ăn"
                            value={data.total_meal_days}
                            suffix="ngày"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng suất ăn phục vụ"
                            value={data.total_meals_served}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng suất ăn cắt"
                            value={data.total_meals_cut}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Tỷ lệ phục vụ" style={{ marginBottom: '24px' }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <div style={{ marginBottom: '8px' }}>Suất ăn phục vụ</div>
                        <Progress
                            percent={Number(servedPercent.toFixed(1))}
                            strokeColor="#52c41a"
                            format={percent => `${percent}%`}
                        />
                    </Col>
                    <Col span={12}>
                        <div style={{ marginBottom: '8px' }}>Suất ăn cắt</div>
                        <Progress
                            percent={Number(cutPercent.toFixed(1))}
                            strokeColor="#f5222d"
                            format={percent => `${percent}%`}
                        />
                    </Col>
                </Row>
            </Card>

            <Card title="Chi tiết theo bữa ăn">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Card type="inner" title="Sáng">
                            <Statistic
                                title="Phục vụ"
                                value={data.by_meal_type.sang.served}
                                valueStyle={{ color: '#3f8600', fontSize: '20px' }}
                            />
                            <Statistic
                                title="Cắt"
                                value={data.by_meal_type.sang.cut}
                                valueStyle={{ color: '#cf1322', fontSize: '20px' }}
                                style={{ marginTop: '16px' }}
                            />
                            <div style={{ marginTop: '16px' }}>
                                <Progress
                                    percent={Number(((data.by_meal_type.sang.served / data.by_meal_type.sang.possible) * 100).toFixed(1))}
                                    strokeColor="#52c41a"
                                    size="small"
                                />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card type="inner" title="Trưa">
                            <Statistic
                                title="Phục vụ"
                                value={data.by_meal_type.trua.served}
                                valueStyle={{ color: '#3f8600', fontSize: '20px' }}
                            />
                            <Statistic
                                title="Cắt"
                                value={data.by_meal_type.trua.cut}
                                valueStyle={{ color: '#cf1322', fontSize: '20px' }}
                                style={{ marginTop: '16px' }}
                            />
                            <div style={{ marginTop: '16px' }}>
                                <Progress
                                    percent={Number(((data.by_meal_type.trua.served / data.by_meal_type.trua.possible) * 100).toFixed(1))}
                                    strokeColor="#52c41a"
                                    size="small"
                                />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card type="inner" title="Tối">
                            <Statistic
                                title="Phục vụ"
                                value={data.by_meal_type.toi.served}
                                valueStyle={{ color: '#3f8600', fontSize: '20px' }}
                            />
                            <Statistic
                                title="Cắt"
                                value={data.by_meal_type.toi.cut}
                                valueStyle={{ color: '#cf1322', fontSize: '20px' }}
                                style={{ marginTop: '16px' }}
                            />
                            <div style={{ marginTop: '16px' }}>
                                <Progress
                                    percent={Number(((data.by_meal_type.toi.served / data.by_meal_type.toi.possible) * 100).toFixed(1))}
                                    strokeColor="#52c41a"
                                    size="small"
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default MealStatisticsReport;
