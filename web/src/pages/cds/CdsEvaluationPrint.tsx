import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getCdsCriteria, getCdsEvaluationById } from '../../api/cds-evaluation';
import { Spin, Typography, Button } from 'antd';

const { Text } = Typography;

const CdsEvaluationPrint: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const { data: criteria, isLoading: loadingC } = useQuery({
        queryKey: ['cds-criteria'],
        queryFn: () => getCdsCriteria()
    });

    const { data: evaluation, isLoading: loadingE } = useQuery({
        queryKey: ['cds-eval', id],
        queryFn: () => getCdsEvaluationById(Number(id)),
        enabled: !!id
    });

    useEffect(() => {
        if (criteria && evaluation) {
            // Document loaded
        }
    }, [criteria, evaluation]);

    if (loadingC || loadingE || !evaluation || !criteria) {
        return <div style={{ padding: 50, textAlign: 'center' }}><Spin size="large" /> Đang tải dữ liệu báo cáo in...</div>;
    }

    const detailsMap = new Map<number, any>(evaluation.details.map((d: any) => [d.criterion.id, d]));

    const group1 = criteria.filter((c: any) => c.group_code === 'DAY_HOC');
    const group2 = criteria.filter((c: any) => c.group_code === 'QUAN_TRI');

    const renderRows = (list: any[]) => {
        return list.map(c => {
            const d = detailsMap.get(c.id);
            return (
                <tr key={c.id}>
                    <td style={{ padding: '8px', border: '1px solid #000' }}>{c.name}</td>
                    <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center' }}>{c.is_mandatory ? '-' : c.max_score}</td>
                    <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>
                        {c.is_mandatory ? (d?.evidence_link ? 'Đạt' : 'Chưa đạt') : (d?.score || 0)}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #000', wordBreak: 'break-all', fontSize: '12px' }}>
                        {d?.evidence_link ? <a href={d.evidence_link} target="_blank" rel="noreferrer" style={{ color: '#0056b3' }}>Xem minh chứng</a> : ''}
                    </td>
                </tr>
            );
        });
    };

    const today = dayjs();
    const finalName = evaluation.submitter_name || evaluation.user?.ho_ten;

    return (
        <div style={{ backgroundColor: '#fff', padding: '20px', maxWidth: '900px', margin: '0 auto', color: '#000', fontFamily: '"Times New Roman", Times, serif' }} className="print-container">
            <style>
                {`
                    @media print {
                        body * { visibility: hidden; }
                        .print-container, .print-container * { visibility: visible; }
                        .print-container { position: absolute; left: 0; top: 0; width: 100%; border: none; padding: 0; margin: 0; }
                        @page { margin: 15mm; }
                        .no-print { display: none !important; }
                    }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid black; padding: 6px 8px; text-align: left; }
                `}
            </style>
            
            <table style={{ width: '100%', border: 'none', marginBottom: '20px' }}>
                <tbody>
                    <tr>
                        <td style={{ border: 'none', textAlign: 'center', width: '40%', verticalAlign: 'top' }}>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>BỘ GIÁO DỤC VÀ ĐÀO TẠO</p>
                            <p style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline' }}>SỞ GIÁO DỤC & ĐT</p>
                        </td>
                        <td style={{ border: 'none', textAlign: 'center', width: '60%', verticalAlign: 'top' }}>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                            <p style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</p>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '30px' }}>
                <h2 style={{ margin: 0 }}>PHIẾU ĐÁNH GIÁ MỨC ĐỘ CHUYỂN ĐỔI SỐ</h2>
                <h4 style={{ margin: '5px 0' }}>CƠ SỞ GIÁO DỤC PHỔ THÔNG VÀ GDTX</h4>
                <p style={{ fontStyle: 'italic', margin: 0 }}>Năm học: {evaluation.period?.year}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <p><strong>Người nộp / Chịu trách nhiệm:</strong> {finalName}</p>
                <p><strong>Ngày nộp hồ sơ:</strong> {dayjs(evaluation.updatedAt).format('DD/MM/YYYY HH:mm')} 
                    <span style={{ marginLeft: 30, fontStyle: 'italic' }}>({evaluation.status === 'SUBMITTED' ? 'Bản chính thức' : 'Bản nháp'})</span>
                </p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <th style={{ width: '45%' }}>Tiêu chí</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Điểm<br/>Tối đa</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Trường<br/>Đánh giá</th>
                        <th style={{ width: '30%' }}>Hồ sơ / Minh chứng</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={4} style={{ fontWeight: 'bold', backgroundColor: '#e6e6e6' }}>I. CHUYỂN ĐỔI SỐ TRONG DẠY, HỌC VÀ KIỂM TRA ĐÁNH GIÁ</td>
                    </tr>
                    {renderRows(group1)}
                    <tr>
                        <td colSpan={2} style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '20px' }}>Cộng điểm Nhóm I:</td>
                        <td colSpan={2} style={{ fontWeight: 'bold', color: '#b90000' }}>{evaluation.total_score_group1} / 100 điểm</td>
                    </tr>

                    <tr>
                        <td colSpan={4} style={{ fontWeight: 'bold', backgroundColor: '#e6e6e6', paddingTop: '15px' }}>II. CHUYỂN ĐỔI SỐ TRONG QUẢN TRỊ CƠ SỞ GIÁO DỤC</td>
                    </tr>
                    {renderRows(group2)}
                    <tr>
                        <td colSpan={2} style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '20px' }}>Cộng điểm Nhóm II:</td>
                        <td colSpan={2} style={{ fontWeight: 'bold', color: '#b90000' }}>{evaluation.total_score_group2} / 100 điểm</td>
                    </tr>
                </tbody>
            </table>

            <div style={{ padding: '15px', border: '2px solid #000', marginBottom: '30px' }}>
                <Text strong style={{ fontSize: '16px' }}>KẾT LUẬN MỨC ĐỘ ĐÁP ỨNG: </Text>
                <Text strong style={{ fontSize: '18px', color: '#b90000', marginLeft: '10px' }}>
                    MỨC {evaluation.level}
                    {evaluation.level === 3 && ' (Tốt)'}
                    {evaluation.level === 2 && ' (Cơ bản)'}
                    {evaluation.level === 1 && ' (Chưa đáp ứng)'}
                </Text>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <div style={{ width: '40%' }}>
                    {/* Chữ ký Hiệu trưởng (Có thể code thêm block cho Hiệu trưởng) */}
                </div>
                <div style={{ width: '40%', textAlign: 'center' }}>
                    <p style={{ fontStyle: 'italic', margin: 0 }}>........, ngày {today.format('DD')} tháng {today.format('MM')} năm {today.format('YYYY')}</p>
                    <p style={{ fontWeight: 'bold', margin: '5px 0 80px 0' }}>Người tạo phiếu</p>
                    <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{finalName}</p>
                </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '40px' }} className="no-print">
                <Button type="primary" size="large" onClick={() => window.print()} style={{ minWidth: 200, height: 50, fontSize: 18 }}>In File PDF / In Giấy</Button>
            </div>
        </div>
    );
};

export default CdsEvaluationPrint;
