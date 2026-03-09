import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Select, Input, InputNumber, message, Tooltip, Space, Tag, Drawer, Grid } from 'antd';
import { PlusOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { layDanhSachDotThanhToan, layChiTietDotThanhToan, taoDotThanhToanMoi } from '../api/thanh-toan';
import type { DotThanhToan, KhoanThanhToan } from '../types/thanh-toan';
import ImportModal from '../components/ImportModal';
import ClassSelect from '../components/ClassSelect';
import ExportButton from '../components/ExportButton';
import MobileList from '../components/MobileList';
import SkeletonLoader from '../components/SkeletonLoader';

const Payments: React.FC = () => {
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [detailsBatchId, setDetailsBatchId] = useState<number | null>(null);
    const [filterClass, setFilterClass] = useState<string[]>([]);
    const [form] = Form.useForm();
    const [filteredData, setFilteredData] = useState<DotThanhToan[]>([]);
    const screens = Grid.useBreakpoint();


    const queryClient = useQueryClient();

    const { data: batches, isLoading } = useQuery({
        queryKey: ['thanh-toan-batches'],
        queryFn: layDanhSachDotThanhToan,
    });

    useEffect(() => {
        if (batches) {
            setFilteredData(batches);
        }
    }, [batches]);

    const { data: batchDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['thanh-toan-batch-details', detailsBatchId, filterClass],
        queryFn: () => layChiTietDotThanhToan(detailsBatchId!, filterClass),
        enabled: !!detailsBatchId,
    });

    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const canEdit = user?.vai_tro === 'ADMIN' || user?.danh_sach_quyen?.some((p: any) => p.ma_module === 'thanh-toan' && p.co_quyen_sua);
    const canImport = canEdit;

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
            sorter: (a: any, b: any) => {
                const dateA = dayjs(`${a.thang}/${a.nam}`, 'MM/YYYY');
                const dateB = dayjs(`${b.thang}/${b.nam}`, 'MM/YYYY');
                return dateA.unix() - dateB.unix();
            },
            render: (_: any, record: DotThanhToan) => `Tháng ${record.thang}/${record.nam}`,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a: any, b: any) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
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
            <div className="desktop-only">
                {isLoading ? (
                    <SkeletonLoader type="table" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        scroll={{ x: 'max-content' }}
                        onRow={(record) => ({
                            onClick: () => setDetailsBatchId(record.id),
                            style: { cursor: 'pointer' }
                        })}
                    />
                )}
            </div>

            <div className="mobile-only">
                {isLoading ? (
                    <SkeletonLoader type="list" />
                ) : (
                    <MobileList
                        dataSource={filteredData}
                        onRowClick={(record) => setDetailsBatchId(record.id)}
                        renderItem={(record: DotThanhToan) => (
                            <div>
                                <div className="mobile-card-row">
                                    <span style={{ fontWeight: 600 }}>{record.ghi_chu || `Đợt tháng ${record.thang}/${record.nam}`}</span>
                                    {/* Assuming 'loai' and 'ten_dot', 'tong_tien', 'so_luong_hoc_sinh' are not directly available on DotThanhToan,
                                    using placeholder or adapting to available fields.
                                    The provided diff's MobileList renderItem uses fields not directly present in DotThanhToan type.
                                    I'm adapting it to use available fields from DotThanhToan.
                                */}
                                    <Tag color={'blue'}>
                                        Chi trả
                                    </Tag>
                                </div>
                                <div className="mobile-card-row">
                                    <span className="mobile-card-label">Tháng/Năm:</span>
                                    <span className="mobile-card-value">{record.thang}/{record.nam}</span>
                                </div>
                                <div className="mobile-card-row">
                                    <span className="mobile-card-label">Ghi chú:</span>
                                    <span className="mobile-card-value" style={{ fontWeight: 600 }}>
                                        {record.ghi_chu || '-'}
                                    </span>
                                </div>
                                <div style={{ marginTop: 8, fontSize: '0.85em', color: '#999' }}>
                                    Ngày tạo: {dayjs(record.createdAt).format('DD/MM/YYYY')}
                                </div>
                            </div>
                        )}
                    />
                )}
            </div>

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

            <Drawer
                title={
                    <div style={{ display: 'flex', flexDirection: screens.xs ? 'column' : 'row', justifyContent: 'space-between', alignItems: screens.xs ? 'flex-start' : 'center', gap: '8px' }}>
                        <span>Thang {batchDetails?.thang}/{batchDetails?.nam}</span>
                        <Space wrap>
                            <ClassSelect
                                style={{ minWidth: 120 }}
                                mode="multiple"
                                placeholder="Lọc lớp"
                                value={filterClass}
                                onChange={(val) => setFilterClass(val as string[])}
                            />
                            {canImport && (
                                <Space>
                                    <Tooltip title="Import">
                                        <Button
                                            size="small"
                                            icon={<FileTextOutlined />}
                                            onClick={() => setIsImportModalVisible(true)}
                                        />
                                    </Tooltip>
                                    <ExportButton
                                        endpoint={`/thanh-toan/${detailsBatchId}/export`}
                                        filename={`thanh_toan_thang_${batchDetails?.thang}_${batchDetails?.nam}_${dayjs().format('YYYYMMDD')}.csv`}
                                        params={{ lop: filterClass.join(',') }}
                                    />
                                </Space>
                            )}
                        </Space>
                    </div>
                }
                open={!!detailsBatchId}
                onClose={() => {
                    setDetailsBatchId(null);
                    setFilterClass([]);
                }}
                width={screens.xs ? '100%' : 1000}
            >
                <Table
                    columns={detailColumns}
                    dataSource={batchDetails?.khoan_thanh_toan}
                    rowKey="id"
                    loading={isLoadingDetails}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                />
            </Drawer>

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
