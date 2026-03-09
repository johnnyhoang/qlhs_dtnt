import React, { useState } from 'react';
import { Table, Card, Button, Drawer, Form, Input, InputNumber, message, Tooltip, Space, Statistic, Row, Col, Divider } from 'antd';
import { EditOutlined, FileTextOutlined, SearchOutlined, CarOutlined, BankOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layTatCaDinhMuc, luuDinhMucXe } from '../api/dinh-muc-xe';
import { layDanhSachHocSinh } from '../api/hoc-sinh';
import type { HocSinh } from '../types/hoc-sinh';
import type { DinhMucXe } from '../types/dinh-muc-xe';
import ImportModal from '../components/ImportModal';
import AuditFooter from '../components/AuditFooter';
import dayjs from 'dayjs';
import ClassSelect from '../components/ClassSelect';
import ExportButton from '../components/ExportButton';

const Transport: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedClass, setSelectedClass] = useState<string[]>([]);
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
        queryFn: () => layTatCaDinhMuc(),
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

    const filteredData = students?.data?.filter((s: any) => {
        const matchesSearch = s.ho_ten.toLowerCase().includes(searchText.toLowerCase()) ||
            s.ma_hoc_sinh.toLowerCase().includes(searchText.toLowerCase());
        const matchesClass = selectedClass.length === 0 || selectedClass.includes(s.lop);
        return matchesSearch && matchesClass;
    });

    const columns = [
        {
            title: 'Mã HS',
            dataIndex: 'ma_hoc_sinh',
            key: 'ma_hoc_sinh',
            fixed: 'left' as const,
            width: 100,
            sorter: (a: any, b: any) => a.ma_hoc_sinh.localeCompare(b.ma_hoc_sinh),
        },
        {
            title: 'Họ và tên',
            dataIndex: 'ho_ten',
            key: 'ho_ten',
            fixed: 'left' as const,
            width: 180,
            ellipsis: true,
            sorter: (a: any, b: any) => a.ho_ten.localeCompare(b.ho_ten),
        },
        {
            title: 'Lớp',
            dataIndex: 'lop',
            key: 'lop',
            width: 90,
            sorter: (a: any, b: any) => a.lop.localeCompare(b.lop),
        },
        {
            title: 'K.Cách (km)',
            key: 'khoang_cach',
            width: 110,
            sorter: (a: any, b: any) => (profileMap.get(a.id)?.khoang_cach || 0) - (profileMap.get(b.id)?.khoang_cach || 0),
            render: (_: any, record: HocSinh) => profileMap.get(record.id)?.khoang_cach || '-',
        },
        {
            title: 'Định mức (VNĐ)',
            key: 'so_tien',
            width: 130,
            sorter: (a: any, b: any) => (profileMap.get(a.id)?.so_tien || 0) - (profileMap.get(b.id)?.so_tien || 0),
            render: (_: any, record: HocSinh) => profileMap.get(record.id)?.so_tien?.toLocaleString() || '-',
        },
        {
            title: 'Ngân hàng',
            key: 'ngan_hang',
            width: 200,
            ellipsis: true,
            render: (_: any, record: HocSinh) => {
                const p = profileMap.get(record.id);
                return p ? `${p.ngan_hang || ''} - ${p.so_tai_khoan || ''}` : '-';
            },
        },
        {
            title: 'Cập nhật',
            key: 'updatedAt',
            width: 150,
            responsive: ['md'] as any,
            render: (_: any, record: HocSinh) => {
                const p = profileMap.get(record.id);
                return p?.updatedAt ? dayjs(p.updatedAt).format('DD/MM/YYYY HH:mm') : '-';
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right' as const,
            width: 100,
            render: (_: any, record: HocSinh) => (
                <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record, profileMap.get(record.id))}
                >
                    {canEdit ? 'Hồ sơ' : 'Xem'}
                </Button>
            ),
        },
    ];

    const [isImportModalVisible, setIsImportModalVisible] = useState(false);

    const totalStudentsWithProfile = Array.from(profileMap.values()).filter(p => p.so_tien > 0).length;
    const totalAmount = Array.from(profileMap.values()).reduce((sum, p) => sum + (p.so_tien || 0), 0);

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                    <Card size="small">
                        <Statistic
                            title="Học sinh có hỗ trợ"
                            value={totalStudentsWithProfile}
                            prefix={<CarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card size="small">
                        <Statistic
                            title="Tổng kinh phí hỗ trợ"
                            value={totalAmount}
                            suffix="VNĐ"
                            prefix={<BankOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title="Quản lý hỗ trợ chi phí vận chuyển"
                size="small"
                extra={
                    <Space wrap>
                        {canImport && (
                            <Tooltip title="Import từ CSV">
                                <Button
                                    icon={<FileTextOutlined />}
                                    onClick={() => setIsImportModalVisible(true)}
                                />
                            </Tooltip>
                        )}
                        <ExportButton
                            endpoint="/dinh-muc-xe/export"
                            filename={`dinh_muc_xe_${dayjs().format('YYYYMMDD')}.csv`}
                            params={{ lop: selectedClass.join(',') }}
                        />
                    </Space>
                }
            >
                <div className="responsive-toolbar">
                    <Input
                        placeholder="Tìm theo tên hoặc mã HS..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <ClassSelect
                        style={{ minWidth: 200 }}
                        value={selectedClass}
                        mode="multiple"
                        onChange={(value) => setSelectedClass(value as string[])}
                    />
                </div>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={isLoadingStudents || isLoadingProfiles}
                    size="small"
                    scroll={{ x: 1000 }}
                    expandable={{
                        expandedRowRender: (record) => {
                            const p = profileMap.get(record.id);
                            if (!p) return <div style={{ padding: '8px 40px' }}>Chưa có hồ sơ hỗ trợ</div>;
                            return (
                                <div style={{ padding: '8px 40px' }}>
                                    <p><b>Hình thức di chuyển:</b> {p.phuong_tien || '-'}</p>
                                    <p><b>Địa chỉ xã mới:</b> {p.dia_chi_xa_moi || '-'}</p>
                                    <p><b>Xã thuộc diện hỗ trợ:</b> {p.xa_huong_tro_cap || '-'}</p>
                                    <p><b>Điểm dừng xe buýt:</b> {p.ten_diem_dung || '-'}</p>
                                    <p className="mobile-only"><b>Người cập nhật:</b> {p.nguoi_cap_nhat?.ho_ten || '-'}</p>
                                    <p className="mobile-only"><b>Ngày cập nhật:</b> {p.updatedAt ? dayjs(p.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}</p>
                                </div>
                            );
                        },
                        rowExpandable: (record) => !!profileMap.get(record.id),
                    }}
                />
            </Card>

            <Drawer
                title={`${canEdit ? 'Hồ sơ hỗ trợ' : 'Xem hồ sơ'}: ${editingStudent?.ho_ten}`}
                open={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                width={500}
                extra={
                    canEdit && (
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
                            <Button type="primary" onClick={handleSave} loading={upsertMutation.isPending}>
                                Lưu
                            </Button>
                        </Space>
                    )
                }
            >
                <Form form={form} layout="vertical" disabled={!canEdit}>
                    <Divider>Thông tin thanh toán</Divider>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="ngan_hang" label="Tên ngân hàng">
                                <Input placeholder="Ví dụ: Agribank" prefix={<BankOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="so_tai_khoan" label="Số tài khoản">
                                <Input placeholder="Nhập số tài khoản" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Thông tin định mức</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="khoang_cach" label="Khoảng cách (Km)">
                                <InputNumber style={{ width: '100%' }} precision={2} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phuong_tien" label="Hình thức di chuyển">
                                <Input placeholder="Ví dụ: Tự túc, Xe buýt" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Thông tin địa bàn</Divider>
                    <Form.Item name="dia_chi_xa_moi" label="Địa chỉ xã mới">
                        <Input prefix={<EnvironmentOutlined />} />
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
            </Drawer>

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
        </Space>
    );
};
export default Transport;
