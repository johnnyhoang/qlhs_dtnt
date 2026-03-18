import React, { useState } from 'react';
import { Card, Table, Button, Space, Typography, Tag, Modal, Form, Input, DatePicker, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getCdsPeriods, createCdsPeriod } from '../../api/cds-evaluation';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const CdsAdminPeriods: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: periods, isLoading } = useQuery({
        queryKey: ['cds-periods'],
        queryFn: () => getCdsPeriods()
    });

    const createMutation = useMutation({
        mutationFn: (values: any) => createCdsPeriod(values),
        onSuccess: () => {
            message.success('Đã tạo thành công Kỳ đánh giá mới!');
            setIsModalVisible(false);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['cds-periods'] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo kỳ đánh giá');
        }
    });

    const handleCreate = (values: any) => {
        const payload = {
            year: values.year,
            start_date: values.dates[0].format('YYYY-MM-DD'),
            end_date: values.dates[1].format('YYYY-MM-DD')
        };
        createMutation.mutate(payload);
    };

    const columns = [
        {
            title: 'Năm học',
            dataIndex: 'year',
            key: 'year',
            render: (text: string) => <b>{text}</b>
        },
        {
            title: 'Ngày bắt đầu tính điểm',
            dataIndex: 'start_date',
            key: 'start_date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Hạn cuối đánh giá',
            dataIndex: 'end_date',
            key: 'end_date',
            render: (date: string) => <Tag color="red">{dayjs(date).format('DD/MM/YYYY')}</Tag>
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_: any, record: any) => {
                const now = dayjs();
                const start = dayjs(record.start_date);
                const end = dayjs(record.end_date);
                if (now.isBefore(start)) return <Tag color="default">Chưa mở form</Tag>;
                if (now.isAfter(end)) return <Tag color="error">Đã khoá form</Tag>;
                return <Tag color="success">Đang cho phép điểm</Tag>;
            }
        }
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card 
                title={<Title level={4} style={{ margin: 0 }}>Quản lý Danh mục Kỳ Đánh giá CĐS</Title>}
                extra={
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} style={{ borderRadius: '8px' }}>
                        Tạo kỳ Mới
                    </Button>
                }
                style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
                <Table 
                    dataSource={periods} 
                    columns={columns} 
                    rowKey="id" 
                    loading={isLoading}
                    pagination={{ pageSize: 15 }}
                    scroll={{ x: 800 }}
                />
            </Card>

            <Modal
                title={<h3>Thiết lập Kỳ Đánh giá mới</h3>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending}
                okText="Lưu kỳ đánh giá"
                cancelText="Huỷ"
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item 
                        name="year" 
                        label={<span style={{ fontWeight: 500 }}>Tên kỳ đánh giá (Ví dụ: Năm học 2024-2025)</span>} 
                        rules={[{ required: true, message: 'Vui lòng nhập tên kỳ' }]}
                    >
                        <Input size="large" placeholder="Nhập tên năm học..." />
                    </Form.Item>
                    <Form.Item 
                        name="dates" 
                        label={<span style={{ fontWeight: 500 }}>Khoảng thời gian mở và đóng Form</span>} 
                        rules={[{ required: true, message: 'Vui lòng chọn ngày mở và kết thúc' }]}
                    >
                        <RangePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" placeholder={['Ngày bắt đầu', 'Hạn chót']} />
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
};

export default CdsAdminPeriods;
