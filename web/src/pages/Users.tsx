import React, { useState } from 'react';
import { Table, Card, Switch, Select, Button, Modal, Checkbox, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layDanhSachNguoiDung, capNhatTrangThaiNguoiDung, capNhatPhanQuyen } from '../api/nguoi-dung';
import type { NguoiDung } from '../api/auth';

const Users: React.FC = () => {
    const [permissionModal, setPermissionModal] = useState<{ visible: boolean, user: NguoiDung | null }>({ visible: false, user: null });
    const [selectedPermissions, setSelectedPermissions] = useState<any[]>([]);
    const queryClient = useQueryClient();

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: layDanhSachNguoiDung
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => capNhatTrangThaiNguoiDung(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            message.success('Cập nhật trạng thái thành công');
        }
    });

    const permissionMutation = useMutation({
        mutationFn: ({ id, permissions }: { id: number, permissions: any[] }) => capNhatPhanQuyen(id, permissions),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setPermissionModal({ visible: false, user: null });
            message.success('Cập nhật phân quyền thành công');
        }
    });

    const modules = [
        { key: 'hoc-sinh', label: 'Học sinh' },
        { key: 'suat-an', label: 'Suất ăn' },
        { key: 'dinh-muc-xe', label: 'Định mức xe' },
        { key: 'bao-hiem', label: 'Bảo hiểm' },
        { key: 'thanh-toan', label: 'Thanh toán' },
        { key: 'nhap-lieu', label: 'Nhập liệu (Excel)' }
    ];

    const handleOpenPermissions = (user: NguoiDung) => {
        setPermissionModal({ visible: true, user });
        const currentP = user.danh_sach_quyen || [];
        setSelectedPermissions(modules.map(m => {
            const found = currentP.find(p => p.ma_module === m.key);
            return {
                ma_module: m.key,
                co_quyen_xem: found?.co_quyen_xem || false,
                co_quyen_sua: found?.co_quyen_sua || false
            };
        }));
    };

    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'ho_ten',
            key: 'ho_ten'
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Vai trò',
            key: 'vai_tro',
            render: (_: any, record: NguoiDung) => (
                <Select
                    value={record.vai_tro}
                    onChange={(val) => statusMutation.mutate({ id: record.id, data: { vai_tro: val } })}
                    style={{ width: 120 }}
                >
                    <Select.Option value="ADMIN">ADMIN</Select.Option>
                    <Select.Option value="USER">USER</Select.Option>
                </Select>
            )
        },
        {
            title: 'Trạng thái',
            key: 'kich_hoat',
            render: (_: any, record: NguoiDung) => (
                <Switch
                    checked={record.kich_hoat}
                    onChange={(val) => statusMutation.mutate({ id: record.id, data: { kich_hoat: val } })}
                />
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: NguoiDung) => (
                <Button type="link" disabled={record.vai_tro === 'ADMIN'} onClick={() => handleOpenPermissions(record)}>
                    Phân quyền module
                </Button>
            )
        }
    ];

    return (
        <Card title="Quản lý Người dùng và Phân quyền">
            <Table
                dataSource={users}
                columns={columns}
                rowKey="id"
                loading={isLoading}
            />

            <Modal
                title={`Phân quyền module: ${permissionModal.user?.ho_ten}`}
                open={permissionModal.visible}
                onOk={() => permissionMutation.mutate({ id: permissionModal.user!.id, permissions: selectedPermissions })}
                onCancel={() => setPermissionModal({ visible: false, user: null })}
                width={600}
            >
                <Table
                    dataSource={selectedPermissions}
                    rowKey="ma_module"
                    pagination={false}
                    columns={[
                        { title: 'Module', dataIndex: 'ma_module', render: (val) => modules.find(m => m.key === val)?.label },
                        {
                            title: 'Xem',
                            key: 'xem',
                            render: (_, record, index) => (
                                <Checkbox
                                    checked={record.co_quyen_xem}
                                    onChange={(e) => {
                                        const newP = [...selectedPermissions];
                                        newP[index].co_quyen_xem = e.target.checked;
                                        setSelectedPermissions(newP);
                                    }}
                                />
                            )
                        },
                        {
                            title: 'Sửa/Xóa',
                            key: 'sua',
                            render: (_, record, index) => (
                                <Checkbox
                                    checked={record.co_quyen_sua}
                                    onChange={(e) => {
                                        const newP = [...selectedPermissions];
                                        newP[index].co_quyen_sua = e.target.checked;
                                        setSelectedPermissions(newP);
                                    }}
                                />
                            )
                        }
                    ]}
                />
            </Modal>
        </Card>
    );
};

export default Users;
