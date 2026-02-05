import React, { useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, DatePicker, Checkbox, Tag, message } from 'antd';
import { EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { layDanhSachBaoHiem, luuHoSoBaoHiem } from '../api/bao-hiem';
import { layDanhSachHocSinh } from '../api/hoc-sinh';
import type { HocSinh } from '../types/hoc-sinh';
import type { BaoHiem } from '../types/bao-hiem';

const Insurance: React.FC = () => {
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
            title: 'Số thẻ BHYT',
            key: 'so_the',
            render: (_: any, record: HocSinh) => profileMap.get(record.id)?.so_the || '-',
        },
        {
            title: 'Hạn dùng',
            key: 'han_su_dung',
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
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: HocSinh) => (
                <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record, profileMap.get(record.id))}
                >
                    Thông tin BHYT
                </Button>
            ),
        },
    ];

    return (
        <Card title="Quản lý Bảo hiểm y tế">
            <Table
                columns={columns}
                dataSource={students?.data}
                rowKey="id"
                loading={isLoadingStudents || isLoadingProfiles}
            />

            <Modal
                title={`Thông tin BHYT: ${editingStudent?.ho_ten}`}
                open={isModalVisible}
                onOk={handleSave}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={upsertMutation.isPending}
                width={800}
            >
                <Form form={form} layout="vertical">
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
                </Form>
            </Modal>
        </Card>
    );
};

export default Insurance;
