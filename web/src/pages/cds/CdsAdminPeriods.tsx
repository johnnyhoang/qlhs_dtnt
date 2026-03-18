import React, { useState } from 'react';
import { Card, Table, Button, Space, Typography, Tag, Modal, Form, Input, DatePicker, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getCdsPeriods, createCdsPeriod, updateCdsPeriod } from '../../api/cds-evaluation';
import { EditOutlined, PrinterOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const CdsAdminPeriods: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<any>(null);
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

    const updateMutation = useMutation({
        mutationFn: (values: any) => updateCdsPeriod(editingPeriod.id, values),
        onSuccess: () => {
            message.success('Đã cập nhật Kỳ đánh giá thành công!');
            setIsModalVisible(false);
            setEditingPeriod(null);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['cds-periods'] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật kỳ đánh giá');
        }
    });

    const handleFinish = (values: any) => {
        const payload = {
            year: values.year,
            start_date: values.dates[0].format('YYYY-MM-DD'),
            end_date: values.dates[1].format('YYYY-MM-DD')
        };
        if (editingPeriod) updateMutation.mutate(payload);
        else createMutation.mutate(payload);
    };

    const handleEditClick = (record: any) => {
        setEditingPeriod(record);
        form.setFieldsValue({
            year: record.year,
            dates: [dayjs(record.start_date), dayjs(record.end_date)]
        });
        setIsModalVisible(true);
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
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (_: any, record: any) => (
                <Space>
                    <Button 
                        type="primary" 
                        shape="circle" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditClick(record)} 
                        title="Sửa kỳ đánh giá"
                    />
                    <Button
                        type="default"
                        icon={<PrinterOutlined />}
                        onClick={() => window.open(`/cds/admin/periods/print/${record.id}`, '_blank')}
                        title="In Báo cáo tổng hợp kỳ"
                    />
                </Space>
            )
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
                title={<h3>{editingPeriod ? 'Cập nhật Kỳ Đánh giá' : 'Thiết lập Kỳ Đánh giá mới'}</h3>}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingPeriod(null);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
                okText="Lưu kỳ đánh giá"
                cancelText="Huỷ"
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
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
