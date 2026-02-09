import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { layDanhSachLop } from '../api/hoc-sinh';

interface ClassSelectProps {
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
    style?: React.CSSProperties;
    placeholder?: string;
    mode?: 'multiple' | 'tags';
    allowClear?: boolean;
}

const ClassSelect: React.FC<ClassSelectProps> = ({
    value,
    onChange,
    style,
    placeholder = "Chọn lớp",
    mode,
    allowClear = true
}) => {
    const { user } = useAuth();
    const [classes, setClasses] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            if (user?.vai_tro === 'TEACHER') {
                setClasses(user.lop_phu_trach || []);
            } else {
                setLoading(true);
                try {
                    const res = await layDanhSachLop();
                    setClasses(res);
                } catch (error) {
                    console.error("Lỗi lấy danh sách lớp", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchClasses();
    }, [user]);

    return (
        <Select
            value={value}
            onChange={onChange}
            style={style}
            placeholder={placeholder}
            mode={mode}
            allowClear={allowClear}
            loading={loading}
            options={classes.map(c => ({ label: c, value: c }))}
            showSearch
            filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
        />
    );
};

export default ClassSelect;
