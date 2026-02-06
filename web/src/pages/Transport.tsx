import React, { useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, InputNumber, message, Tooltip } from 'antd';
import { EditOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layTatCaDinhMuc, luuDinhMucXe } from '../api/dinh-muc-xe';
import { layDanhSachHocSinh } from '../api/hoc-sinh';
import type { HocSinh } from '../types/hoc-sinh';
import type { DinhMucXe } from '../types/dinh-muc-xe';
import ImportModal from '../components/ImportModal';
import AuditFooter from '../components/AuditFooter';
import dayjs from 'dayjs';

const Transport: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingStudent, setEditingStudent] = useState<HocSinh | null>(null);
    const [form] = Form.useForm();

    const queryClient = useQueryClient();

    const { data: students, isLoading: isLoadingStudents } = useQuery({
        queryKey: ['hoc-sinh-all'],
        queryFn: () => layDanhSachHocSinh({ pageSize: 1000 }),
    });

    const { data: profiles, isLoading: isLoadingProfiles } = useQuery({
        queryKey: ['dinh-muc-xe-profiles'],
        queryFn: layTatCaDinhMuc,
    });

    const upsertMutation = useMutation({
        mutationFn: luuDinhMucXe,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dinh-muc-xe-profiles'] });
            setIsModalVisible(false);
            message.success('Cập nhật thông tin hỗ trợ thành công');
        },
    });

    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const canEdit = user?.vai_tro === 'ADMIN' || user?.danh_sach_quyen?.some((p: any) => p.ma_module === 'dinh-muc-xe' && p.co_quyen_sua);
    const canImport = canEdit;

    const handleEdit = (student: HocSinh, profile?: DinhMucXe) => {
        setEditingStudent(student);
        form.setFieldsValue(profile || { hoc_sinh_id: student.id });
        setIsModalVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            await upsertMutation.mutateAsync({
                ...values,
                hoc_sinh_id: editingStudent?.id
            });
        } catch (error) {
            console.error(error);
        }
    };

    const profileMap = new Map();
    profiles?.forEach(p => profileMap.set(p.hoc_sinh_id, p));

    const columns = [
        {
            title: 'Mã HS',
            dataIndex: 'ma_hoc_sinh',
            key: 'ma_hoc_sinh',
        },
        {
            title: 'Họ và tên',
            dataIndex: 'ho_ten',
            key: 'ho_ten',
        },
        {
            title: 'Lớp',
            dataIndex: 'lop',
            key: 'lop',
        },
        {
            title: 'Khoảng cách (km)',
            key: 'khoang_cach',
            render: (_: any, record: HocSinh) => profileMap.get(record.id)?.khoang_cach || '-',
        },
        {
            title: 'Ngân hàng',
            key: 'ngan_hang',
            render: (_: any, record: HocSinh) => {
                const p = profileMap.get(record.id);
                return p ? `${p.ngan_hang || ''} - ${p.so_tai_khoan || ''}` : '-';
            },
        },
        {
            title: 'Ngày cập nhật',
            key: 'updatedAt',
            render: (_: any, record: HocSinh) => {
                const p = profileMap.get(record.id);
                return p?.updatedAt ? dayjs(p.updatedAt).format('DD/MM/YYYY HH:mm') : '-';
            },
        },
        {
            title: 'Người cập nhật',
            key: 'updatedBy',
            render: (_: any, record: HocSinh) => {
                const p = profileMap.get(record.id);
                return p?.nguoi_cap_nhat?.ho_ten || '-';
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: HocSinh) => (
                <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record, profileMap.get(record.id))}
                >
                    {canEdit ? 'Hồ sơ hỗ trợ' : 'Xem hồ sơ'}
                </Button>
            ),
        },
    ];

    const [isImportModalVisible, setIsImportModalVisible] = useState(false);

    return (
        <Card
            title="Quản lý hỗ trợ chi phí vận chuyển"
            extra={
                canImport && (
                    <Tooltip title="Import từ CSV">
                        <Button
                            icon={<FileExcelOutlined />}
                            onClick={() => setIsImportModalVisible(true)}
                        />
                    </Tooltip>
                )
            }
        >
            <Table
                columns={columns}
                dataSource={students?.data}
                rowKey="id"
                loading={isLoadingStudents || isLoadingProfiles}
            />

            <Modal
                title={`${canEdit ? 'Hồ sơ hỗ trợ' : 'Xem hồ sơ'}: ${editingStudent?.ho_ten}`}
                open={isModalVisible}
                onOk={canEdit ? handleSave : () => setIsModalVisible(false)}
                okText={canEdit ? 'Lưu' : 'Đóng'}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={upsertMutation.isPending}
                width={700}
                footer={canEdit ? undefined : <Button onClick={() => setIsModalVisible(false)}>Đóng</Button>}
            >
                <Form form={form} layout="vertical" disabled={!canEdit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item name="ngan_hang" label="Tên ngân hàng">
                            <Input placeholder="Ví dụ: Agribank" />
                        </Form.Item>
                        <Form.Item name="so_tai_khoan" label="Số tài khoản">
                            <Input placeholder="Nhập số tài khoản" />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item name="khoang_cach" label="Khoảng cách (Km)">
                            <InputNumber style={{ width: '100%' }} precision={2} />
                        </Form.Item>
                        <Form.Item name="phuong_tien" label="Hình thức di chuyển">
                            <Input placeholder="Ví dụ: Tự túc, Xe buýt" />
                        </Form.Item>
                    </div>

                    <Form.Item name="dia_chi_xa_moi" label="Địa chỉ xã mới">
                        <Input />
                    </Form.Item>

                    <Form.Item name="xa_huong_tro_cap" label="Xã thuộc diện hỗ trợ">
                        <Input />
                    </Form.Item>

                    <Form.Item name="ten_diem_dung" label="Điểm dừng xe buýt (nếu có)">
                        <Input />
                    </Form.Item>

                    <AuditFooter
                        createdAt={profileMap.get(editingStudent?.id || '')?.createdAt}
                        updatedAt={profileMap.get(editingStudent?.id || '')?.updatedAt}
                        updatedBy={profileMap.get(editingStudent?.id || '')?.nguoi_cap_nhat?.ho_ten}
                    />
                </Form>
            </Modal>

            <ImportModal
                visible={isImportModalVisible}
                onCancel={() => setIsImportModalVisible(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['dinh-muc-xe-profiles'] });
                    setIsImportModalVisible(false);
                }}
                title="Import định mức hỗ trợ vận chuyển"
                endpoint="/nhap-lieu/dinh-muc-xe-csv"
                description="Hệ thống cập nhật định mức km và thông tin ngân hàng. Cột cần có: 'ma_hoc_sinh', 'khoang_cach', 'ngan_hang', 'stk'."
            />
        </Card>
    );
};

export default Transport;
