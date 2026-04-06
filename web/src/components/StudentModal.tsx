import React, { useEffect, useMemo } from 'react';
import { Drawer, Form, Input, Select, DatePicker, message, Row, Col, Space, Button, Divider, Grid } from 'antd';
// ... (imports remain same)
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { layDanhSachDanhMuc } from '../api/danh-muc-master';
import { LoaiDanhMuc } from '../types/danh-muc-master';
import { GioiTinh, TrangThaiHocSinh } from '../types/hoc-sinh';
import type { HocSinh, CreateHocSinhRequest } from '../types/hoc-sinh';

import AuditFooter from './AuditFooter';

interface WardNode {
    Name: string;
}

interface DistrictNode {
    Name: string;
    Id: string;
    Wards: WardNode[];
}

interface ProvinceNode {
    Name: string;
    Id: string;
    Districts: DistrictNode[];
}

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
    const [selectedProvince, setSelectedProvince] = React.useState<string | undefined>();
    const [selectedDistrict, setSelectedDistrict] = React.useState<string | undefined>();
    const [vietnamData, setVietnamData] = React.useState<ProvinceNode[]>([]);
    const screens = Grid.useBreakpoint();

    useEffect(() => {
        if (!visible || vietnamData.length > 0) {
            return;
        }

        let cancelled = false;

        void import('../assets/vietnam-data.json').then((module) => {
            if (!cancelled) {
                setVietnamData(module.default as ProvinceNode[]);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [visible, vietnamData.length]);

    // Derived location data
    const provinceOptions = useMemo(
        () => vietnamData.map((province) => ({ label: province.Name, value: province.Name, id: province.Id })),
        [vietnamData],
    );

    const districtOptions = useMemo(() => {
        if (!selectedProvince) return [];
        const province = vietnamData.find((item) => item.Name === selectedProvince);
        return province?.Districts.map((district) => ({ label: district.Name, value: district.Name, id: district.Id })) || [];
    }, [selectedProvince, vietnamData]);

    const wardOptions = useMemo(() => {
        if (!selectedProvince || !selectedDistrict) return [];
        const province = vietnamData.find((item) => item.Name === selectedProvince);
        const district = province?.Districts.find((item) => item.Name === selectedDistrict);
        return district?.Wards.map((ward) => ({ label: ward.Name, value: ward.Name })) || [];
    }, [selectedProvince, selectedDistrict, vietnamData]);

    // Fetch Master Data
    const { data: categories } = useQuery({
        queryKey: ['danh-muc-master-all'],
        queryFn: () => layDanhSachDanhMuc({ pageSize: 1000 }),
        staleTime: 5 * 60 * 1000,
    });

    const getOptions = (type: LoaiDanhMuc, filterNote?: string) => {
        if (!categories?.data) return [];
        return categories.data
            .filter(item => item.loai_danh_muc === type && item.kich_hoat)
            .filter(item => !filterNote || item.ghi_chu?.includes(filterNote))
            .map(item => ({ label: item.ten, value: item.ten }));
    };

    const classOptions = useMemo(() => getOptions(LoaiDanhMuc.LOP), [categories]);
    const ethnicityOptions = useMemo(() => getOptions(LoaiDanhMuc.DAN_TOC), [categories]);
    const religionOptions = useMemo(() => getOptions(LoaiDanhMuc.TON_GIAO), [categories]);

    useEffect(() => {
        if (visible) {
            if (student) {
                form.setFieldsValue({
                    ...student,
                    ngay_sinh: student.ngay_sinh ? dayjs(student.ngay_sinh) : undefined
                });
                setSelectedProvince(student.tinh);
                setSelectedDistrict(student.quan_huyen);
            } else {
                form.resetFields();
                setSelectedProvince(undefined);
                setSelectedDistrict(undefined);
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
        <Drawer
            title={student ? "Chỉnh sửa học sinh" : "Thêm học sinh mới"}
            open={visible}
            onClose={onCancel}
            width={screens.xs ? '100%' : 720}
            styles={{ body: { paddingBottom: 80 } }}
            extra={
                <Space>
                    <Button onClick={onCancel}>Hủy</Button>
                    <Button type="primary" onClick={handleSubmit} loading={loading}>
                        Lưu
                    </Button>
                </Space>
            }
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ trang_thai: TrangThaiHocSinh.DANG_HOC, gioi_tinh: GioiTinh.NAM }}
            >
                <Divider titlePlacement="left">Thông tin cơ bản</Divider>
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="ma_hoc_sinh"
                            label="Mã học sinh"
                            rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                        >
                            <Input placeholder="HS001" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="ho_ten"
                            label="Họ và tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                        >
                            <Input placeholder="Nguyễn Văn A" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="lop"
                            label="Lớp"
                            rules={[{ required: true, message: 'Vui lòng chọn lớp' }]}
                        >
                            <Select
                                placeholder="Chọn lớp"
                                showSearch
                                options={classOptions}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="ngay_sinh"
                            label="Ngày sinh"
                        >
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={8}>
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
                    </Col>
                    <Col xs={12} sm={12} md={8}>
                        <Form.Item
                            name="trang_thai"
                            label="Trạng thái"
                        >
                            <Select>
                                <Select.Option value={TrangThaiHocSinh.DANG_HOC}>Đang học</Select.Option>
                                <Select.Option value={TrangThaiHocSinh.DA_NGHI}>Đã nghỉ</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="cccd"
                            label="CCCD/Định danh"
                        >
                            <Input placeholder="Số định danh" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="so_dien_thoai"
                            label="Số điện thoại"
                            rules={[{ pattern: /^[0-9]{10,11}$/, message: 'SDT không hợp lệ' }]}
                        >
                            <Input placeholder="Số điện thoại" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="ma_moet"
                            label="Mã MOET"
                        >
                            <Input placeholder="Mã BGD" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider titlePlacement="left">Địa chỉ & Cá nhân</Divider>
                <Row gutter={16}>
                    <Col xs={24} sm={24} md={8}>
                        <Form.Item name="tinh" label="Tỉnh/Thành phố">
                            <Select
                                placeholder="Chọn tỉnh/TP"
                                showSearch
                                allowClear
                                options={provinceOptions}
                                onChange={(value) => {
                                    setSelectedProvince(value);
                                    setSelectedDistrict(undefined);
                                    form.setFieldsValue({ quan_huyen: undefined, phuong_xa: undefined });
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="quan_huyen" label="Quận/Huyện">
                            <Select
                                placeholder="Chọn quận/huyện"
                                showSearch
                                allowClear
                                options={districtOptions}
                                disabled={!selectedProvince}
                                onChange={(value) => {
                                    setSelectedDistrict(value);
                                    form.setFieldsValue({ phuong_xa: undefined });
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="phuong_xa"
                            label="Phường/Xã"
                            rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
                        >
                            <Select
                                placeholder="Chọn phường/xã"
                                showSearch
                                allowClear
                                options={wardOptions}
                                disabled={!selectedDistrict}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24}>
                        <Form.Item name="dia_chi" label="Số nhà, tên đường (Thôn/Xóm)">
                            <Input placeholder="Ví dụ: Số 10, đường ABC" />
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={12}>
                        <Form.Item name="dan_toc" label="Dân tộc">
                            <Select placeholder="Chọn dân tộc" showSearch allowClear options={ethnicityOptions} />
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={12}>
                        <Form.Item name="ton_giao" label="Tôn giáo">
                            <Select placeholder="Chọn tôn giáo" showSearch allowClear options={religionOptions} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider titlePlacement="left">Thông tin ngân hàng</Divider>
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={12}>
                        <Form.Item name="ngan_hang" label="Ngân hàng">
                            <Input placeholder="Tên ngân hàng" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <Form.Item name="so_tai_khoan" label="Số tài khoản">
                            <Input placeholder="Số tài khoản" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider titlePlacement="left">Ghi chú & Lý lịch</Divider>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="ghi_chu" label="Ghi chú">
                            <Input.TextArea rows={2} placeholder="Ghi chú..." />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="ly_lich" label="Lý lịch">
                            <Input.TextArea rows={2} placeholder="Tiểu sử..." />
                        </Form.Item>
                    </Col>
                </Row>

                <AuditFooter
                    createdAt={student?.createdAt}
                    updatedAt={student?.updatedAt}
                    updatedBy={student?.nguoi_cap_nhat?.ho_ten}
                />
            </Form>
        </Drawer>
    );
};

export default StudentModal;
