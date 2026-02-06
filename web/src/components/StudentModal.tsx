import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { GioiTinh, TrangThaiHocSinh } from '../types/hoc-sinh';
import type { HocSinh, CreateHocSinhRequest } from '../types/hoc-sinh';

import AuditFooter from './AuditFooter';

interface StudentModalProps {
    visible: boolean;
    student?: HocSinh | null;
    onCancel: () => void;
    onSuccess: () => void;
    loading?: boolean;
    onSave: (data: CreateHocSinhRequest) => Promise<void>;
}

const StudentModal: React.FC<StudentModalProps> = ({
    visible,
    student,
    onCancel,
    onSuccess,
    loading,
    onSave
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (student) {
                form.setFieldsValue({
                    ...student,
                    ngay_sinh: student.ngay_sinh ? dayjs(student.ngay_sinh) : undefined
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, student, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formattedValues = {
                ...values,
                ngay_sinh: values.ngay_sinh ? (values.ngay_sinh as dayjs.Dayjs).format('YYYY-MM-DD') : undefined
            };
            await onSave(formattedValues);
            message.success(`${student ? 'Cập nhật' : 'Thêm'} học sinh thành công`);
            onSuccess();
        } catch (error) {
            console.error('Validate Failed:', error);
        }
    };

    return (
        <Modal
            title={student ? "Chỉnh sửa học sinh" : "Thêm học sinh mới"}
            open={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            width={600}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ trang_thai: TrangThaiHocSinh.DANG_HOC, gioi_tinh: GioiTinh.NAM }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="ma_hoc_sinh"
                        label="Mã học sinh"
                        rules={[{ required: true, message: 'Vui lòng nhập mã học sinh' }]}
                    >
                        <Input placeholder="Ví dụ: HS001" />
                    </Form.Item>
                    <Form.Item
                        name="ho_ten"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="lop"
                        label="Lớp"
                        rules={[{ required: true, message: 'Vui lòng nhập lớp' }]}
                    >
                        <Input placeholder="Ví dụ: 10A1" />
                    </Form.Item>
                    <Form.Item
                        name="ma_moet"
                        label="Mã MOET"
                    >
                        <Input placeholder="Mã định danh BGD" />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="ngay_sinh"
                        label="Ngày sinh"
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                    </Form.Item>
                    <Form.Item
                        name="gioi_tinh"
                        label="Giới tính"
                    >
                        <Select>
                            <Select.Option value={GioiTinh.NAM}>Nam</Select.Option>
                            <Select.Option value={GioiTinh.NU}>Nữ</Select.Option>
                            <Select.Option value={GioiTinh.KHAC}>Khác</Select.Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    name="cccd"
                    label="Số CCCD/Định danh"
                >
                    <Input placeholder="Nhập số định danh" />
                </Form.Item>

                <Form.Item
                    name="trang_thai"
                    label="Trạng thái"
                >
                    <Select>
                        <Select.Option value={TrangThaiHocSinh.DANG_HOC}>Đang học</Select.Option>
                        <Select.Option value={TrangThaiHocSinh.DA_NGHI}>Đã nghỉ</Select.Option>
                    </Select>
                </Form.Item>
                <AuditFooter
                    createdAt={student?.createdAt}
                    updatedAt={student?.updatedAt}
                    updatedBy={student?.nguoi_cap_nhat?.ho_ten}
                />
            </Form>
        </Modal>
    );
};

export default StudentModal;
