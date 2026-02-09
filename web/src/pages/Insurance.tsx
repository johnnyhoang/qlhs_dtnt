import React, { useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, DatePicker, Checkbox, Tag, message, Tooltip, Space } from 'antd';
import { EditOutlined, CheckCircleOutlined, CloseCircleOutlined, FileExcelOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import ClassSelect from '../components/ClassSelect';
import { layDanhSachBaoHiem, luuHoSoBaoHiem } from '../api/bao-hiem';
import { layDanhSachHocSinh } from '../api/hoc-sinh';
import type { HocSinh } from '../types/hoc-sinh';
import type { BaoHiem } from '../types/bao-hiem';
import ImportModal from '../components/ImportModal';
import AuditFooter from '../components/AuditFooter';

const Insurance: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingStudent, setEditingStudent] = useState<HocSinh | null>(null);
    const [form] = Form.useForm();

    const queryClient = useQueryClient();

    const { data: students, isLoading: isLoadingStudents } = useQuery({
        queryKey: ['hoc-sinh-all'],
        queryFn: () => layDanhSachHocSinh({ pageSize: 1000 }),
    });

    const { data: profiles, isLoading: isLoadingProfiles } = useQuery({
        queryKey: ['bao-hiem-profiles'],
        queryFn: layDanhSachBaoHiem,
    });

    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const canEdit = user?.vai_tro === 'ADMIN' || user?.danh_sach_quyen?.some((p: any) => p.ma_module === 'bao-hiem' && p.co_quyen_sua);
    const canImport = canEdit;

    const upsertMutation = useMutation({
        mutationFn: luuHoSoBaoHiem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bao-hiem-profiles'] });
            setIsModalVisible(false);
            message.success('Cập nhật thông tin bảo hiểm y tế thành công');
        },
    });

    const handleEdit = (student: HocSinh, profile?: BaoHiem) => {
        setEditingStudent(student);
        form.setFieldsValue(profile ? {
            ...profile,
            han_su_dung: profile.han_su_dung ? dayjs(profile.han_su_dung) : undefined,
            ngay_du_5_nam: profile.ngay_du_5_nam ? dayjs(profile.ngay_du_5_nam) : undefined,
        } : { hoc_sinh_id: student.id });
        setIsModalVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const formattedValues = {
                ...values,
                hoc_sinh_id: editingStudent?.id,
                han_su_dung: values.han_su_dung ? values.han_su_dung.format('YYYY-MM-DD') : undefined,
                ngay_du_5_nam: values.ngay_du_5_nam ? values.ngay_du_5_nam.format('YYYY-MM-DD') : undefined,
            };
            await upsertMutation.mutateAsync(formattedValues);
        } catch (error) {
            console.error(error);
        }
    };

    const profileMap = new Map();
    profiles?.forEach(p => profileMap.set(p.hoc_sinh_id, p));

    const filteredData = students?.data?.filter((s: any) => {
        const matchesSearch = s.ho_ten.toLowerCase().includes(searchText.toLowerCase()) ||
            s.ma_hoc_sinh.toLowerCase().includes(searchText.toLowerCase());
        const matchesClass = !selectedClass || s.lop === selectedClass;
        return matchesSearch && matchesClass;
    });

    const columns = [
        {
            title: 'Mã HS',
            dataIndex: 'ma_hoc_sinh',
            key: 'ma_hoc_sinh',
            sorter: (a: any, b: any) => a.ma_hoc_sinh.localeCompare(b.ma_hoc_sinh),
        },
        {
            title: 'Họ và tên',
            dataIndex: 'ho_ten',
            key: 'ho_ten',
            sorter: (a: any, b: any) => a.ho_ten.localeCompare(b.ho_ten),
        },
        {
            title: 'Lớp',
            dataIndex: 'lop',
            key: 'lop',
            sorter: (a: any, b: any) => a.lop.localeCompare(b.lop),
        },
        {
            title: 'Số thẻ BHYT',
            key: 'so_the',
            render: (_: any, record: HocSinh) => profileMap.get(record.id)?.so_the || '-',
        },
        {
            title: 'Hạn dùng',
            key: 'han_su_dung',
            sorter: (a: any, b: any) => {
                const dA = profileMap.get(a.id)?.han_su_dung;
                const dB = profileMap.get(b.id)?.han_su_dung;
                if (!dA) return 1;
                if (!dB) return -1;
                return dayjs(dA).unix() - dayjs(dB).unix();
            },
            render: (_: any, record: HocSinh) => {
                const date = profileMap.get(record.id)?.han_su_dung;
                return date ? dayjs(date).format('DD/MM/YYYY') : '-';
            },
        },
        {
            title: 'Ảnh thẻ',
            key: 'photo',
            render: (_: any, record: HocSinh) => {
                const submitted = profileMap.get(record.id)?.da_nop_anh;
                return submitted ? <Tag icon={<CheckCircleOutlined />} color="success">Đã nộp</Tag> : <Tag icon={<CloseCircleOutlined />} color="error">Chưa nộp</Tag>;
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
                    {canEdit ? 'Thông tin BHYT' : 'Xem thông tin BHYT'}
                </Button>
            ),
        },
    ];

    const [isImportModalVisible, setIsImportModalVisible] = useState(false);

    return (
        <Card
            title="Quản lý hồ sơ bảo hiểm y tế"
            extra={
                <Space>
                    {canImport && (
                        <Tooltip title="Import từ CSV">
                            <Button
                                icon={<FileExcelOutlined />}
                                onClick={() => setIsImportModalVisible(true)}
                            />
                        </Tooltip>
                    )}
                </Space>
            }
        >
            <Space orientation="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Input
                        placeholder="Tìm theo tên hoặc mã HS..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <ClassSelect
                        style={{ width: 150 }}
                        onChange={(value) => setSelectedClass(value as string)}
                    />
                </div>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={isLoadingStudents || isLoadingProfiles}
                    scroll={{ x: 'max-content' }}
                />
            </Space>

            <Modal
                title={`${canEdit ? 'Thông tin BHYT' : 'Xem thông tin BHYT'}: ${editingStudent?.ho_ten}`}
                open={isModalVisible}
                onOk={canEdit ? handleSave : () => setIsModalVisible(false)}
                okText={canEdit ? 'Lưu' : 'Đóng'}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={upsertMutation.isPending}
                width={800}
                footer={canEdit ? undefined : <Button onClick={() => setIsModalVisible(false)}>Đóng</Button>}
            >
                <Form form={form} layout="vertical" disabled={!canEdit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item name="ma_doi_tuong" label="Mã đối tượng">
                            <Input placeholder="Ví dụ: DT" />
                        </Form.Item>
                        <Form.Item name="so_the" label="Số thẻ">
                            <Input placeholder="Nhập 15 ký tự thẻ BHYT" />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item name="noi_dang_ky" label="Nơi ĐK KCB ban đầu">
                            <Input />
                        </Form.Item>
                        <Form.Item name="han_su_dung" label="Hạn sử dụng đến">
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item name="ngay_du_5_nam" label="Ngày đủ 5 năm liên tục">
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                        <Form.Item name="tra_cuu_vssid" label="Tra cứu VssID">
                            <Input />
                        </Form.Item>
                    </div>

                    <Form.Item name="dia_chi" label="Địa chỉ ghi trên thẻ">
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
                        <Form.Item name="da_nop_anh" valuePropName="checked">
                            <Checkbox>Đã nộp ảnh thẻ 3x4</Checkbox>
                        </Form.Item>
                        <Form.Item name="ly_do_anh" label="Lý do chưa nộp (nếu có)">
                            <Input />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item name="thong_tin_sai" label="Thông tin sai sót">
                            <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item name="thong_tin_dung" label="Thông tin đính chính">
                            <Input.TextArea rows={2} />
                        </Form.Item>
                    </div>

                    <Form.Item name="ghi_chu" label="Ghi chú thêm">
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
                    queryClient.invalidateQueries({ queryKey: ['bao-hiem-profiles'] });
                    setIsImportModalVisible(false);
                }}
                title="Import hồ sơ Bảo hiểm y tế"
                endpoint="/nhap-lieu/bao-hiem-csv"
                description="Hệ thống cập nhật thông tin thẻ BHYT. Cột cần có: 'ma_hoc_sinh', 'so_the', 'han_dung' (dd/mm/yyyy), 'noi_dk'."
            />
        </Card>
    );
};

export default Insurance;
