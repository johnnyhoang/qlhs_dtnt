import React, { useState } from 'react';
import { Table, Card, Button, Modal, Form, Select, Input, InputNumber, message } from 'antd';
import { PlusOutlined, EyeOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { layDanhSachDotThanhToan, layChiTietDotThanhToan, taoDotThanhToanMoi } from '../api/thanh-toan';
import type { DotThanhToan, KhoanThanhToan } from '../types/thanh-toan';
import ImportModal from '../components/ImportModal';

const Payments: React.FC = () => {
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [detailsBatchId, setDetailsBatchId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const queryClient = useQueryClient();

    const { data: batches, isLoading } = useQuery({
        queryKey: ['thanh-toan-batches'],
        queryFn: layDanhSachDotThanhToan,
    });

    const { data: batchDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['thanh-toan-batch-details', detailsBatchId],
        queryFn: () => layChiTietDotThanhToan(detailsBatchId!),
        enabled: !!detailsBatchId,
    });

    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const canEdit = user?.vai_tro === 'ADMIN' || user?.danh_sach_quyen?.some((p: any) => p.ma_module === 'thanh-toan' && p.co_quyen_sua);
    const canImport = user?.vai_tro === 'ADMIN' || user?.danh_sach_quyen?.some((p: any) => p.ma_module === 'nhap-lieu' && p.co_quyen_sua);

    const createMutation = useMutation({
        mutationFn: taoDotThanhToanMoi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['thanh-toan-batches'] });
            setIsCreateModalVisible(false);
            message.success('Tạo đợt chi trả thành công');
        },
    });

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            await createMutation.mutateAsync(values);
        } catch (error) {
            console.error(error);
        }
    };

    const columns = [
        {
            title: 'Tháng/Năm',
            key: 'period',
            render: (_: any, record: DotThanhToan) => `Tháng ${record.thang}/${record.nam}`,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghi_chu',
            key: 'ghi_chu',
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: DotThanhToan) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => setDetailsBatchId(record.id)}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    const detailColumns = [
        {
            title: 'Học sinh',
            key: 'hoc_sinh',
            render: (_: any, record: KhoanThanhToan) => record.hoc_sinh?.ho_ten,
        },
        {
            title: 'Lớp',
            key: 'lop',
            render: (_: any, record: KhoanThanhToan) => record.hoc_sinh?.lop,
        },
        {
            title: 'Tiền ăn',
            dataIndex: 'tien_an',
            key: 'tien_an',
            render: (val: number) => val?.toLocaleString() + ' đ',
        },
        {
            title: 'Tiền vận chuyển',
            dataIndex: 'tien_xe',
            key: 'tien_xe',
            render: (val: number) => val?.toLocaleString() + ' đ',
        },
        {
            title: 'Tổng cộng',
            dataIndex: 'tong_tien',
            key: 'tong_tien',
            render: (val: number) => <b>{val?.toLocaleString()} đ</b>,
        },
        {
            title: 'Ngày cập nhật',
            key: 'updatedAt',
            render: (record: KhoanThanhToan) => record.updatedAt ? dayjs(record.updatedAt).format('DD/MM/YYYY HH:mm') : '-',
        },
        {
            title: 'Người cập nhật',
            key: 'updatedBy',
            render: (record: KhoanThanhToan) => record.nguoi_cap_nhat?.ho_ten || '-',
        }
    ];

    const [isImportModalVisible, setIsImportModalVisible] = useState(false);

    return (
        <Card title="Quản lý chi trả hỗ trợ" extra={
            canEdit && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)}>
                    Tạo đợt mới
                </Button>
            )
        }>
            <Table
                columns={columns}
                dataSource={batches}
                rowKey="id"
                loading={isLoading}
            />

            <Modal
                title="Tạo đợt chi trả mới"
                open={isCreateModalVisible}
                onOk={handleCreate}
                onCancel={() => setIsCreateModalVisible(false)}
                confirmLoading={createMutation.isPending}
            >
                <Form form={form} layout="vertical" initialValues={{ thang: dayjs().month() + 1, nam: dayjs().year() }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item name="thang" label="Tháng" rules={[{ required: true }]}>
                            <Select>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <Select.Option key={i + 1} value={i + 1}>{i + 1}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="nam" label="Năm" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                    <Form.Item name="ghi_chu" label="Ghi chú">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 32 }}>
                        <span>Chi tiết đợt chi trả: Tháng {batchDetails?.thang}/{batchDetails?.nam}</span>
                        {canImport && (
                            <Button
                                icon={<FileExcelOutlined />}
                                onClick={() => setIsImportModalVisible(true)}
                            >
                                Import CSV
                            </Button>
                        )}
                    </div>
                }
                open={!!detailsBatchId}
                onCancel={() => setDetailsBatchId(null)}
                footer={null}
                width={1000}
            >
                <Table
                    columns={detailColumns}
                    dataSource={batchDetails?.khoan_thanh_toan}
                    rowKey="id"
                    loading={isLoadingDetails}
                    pagination={{ pageSize: 10 }}
                />
            </Modal>

            <ImportModal
                visible={isImportModalVisible}
                onCancel={() => setIsImportModalVisible(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['thanh-toan-batch-details', detailsBatchId] });
                    setIsImportModalVisible(false);
                }}
                title="Import danh sách chi trả hỗ trợ"
                endpoint="/nhap-lieu/thanh-toan-csv"
                description="Hệ thống cập nhật số tiền chi trả cho từng học sinh trong đợt này. Cột cần có: 'ma_hoc_sinh', 'tien_an', 'tien_xe' (Số tiền VND)."
                additionalFields={{ dot_thanh_toan_id: detailsBatchId }}
            />
        </Card>
    );
};

export default Payments;
