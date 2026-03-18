import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getCdsCriteria, getCdsEvaluationById } from '../../api/cds-evaluation';
import { Spin, Typography, Button } from 'antd';

const { Text } = Typography;

const CdsEvaluationPrint: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const reportRef = useRef<HTMLDivElement>(null);

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

    const handleExportWord = () => {
        if (!reportRef.current) return;
        
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Bao Cao CDS</title></head><body>";
        const footer = "</body></html>";
        const content = reportRef.current.innerHTML;
        const sourceHTML = header + content + footer;
        
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `Bao_Cao_CDS_${evaluation.period?.year}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    };

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
            
            <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '30px' }} ref={reportRef}>
                
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

                <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <p><strong>Người nộp / Chịu trách nhiệm:</strong> {finalName}</p>
                    <p><strong>Ngày nộp hồ sơ:</strong> {dayjs(evaluation.updatedAt).format('DD/MM/YYYY HH:mm')} 
                        <span style={{ marginLeft: 30, fontStyle: 'italic' }}>({evaluation.status === 'SUBMITTED' ? 'Bản chính thức' : 'Bản nháp'})</span>
                    </p>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ width: '45%', border: '1px solid #000', padding: '6px 8px' }}>Tiêu chí</th>
                            <th style={{ width: '10%', textAlign: 'center', border: '1px solid #000', padding: '6px 8px' }}>Điểm<br/>Tối đa</th>
                            <th style={{ width: '15%', textAlign: 'center', border: '1px solid #000', padding: '6px 8px' }}>Trường<br/>Đánh giá</th>
                            <th style={{ width: '30%', border: '1px solid #000', padding: '6px 8px' }}>Hồ sơ / Minh chứng</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={4} style={{ fontWeight: 'bold', backgroundColor: '#e6e6e6', padding: '6px 8px', border: '1px solid #000' }}>I. CHUYỂN ĐỔI SỐ TRONG DẠY, HỌC VÀ KIỂM TRA ĐÁNH GIÁ</td>
                        </tr>
                        {renderRows(group1)}
                        <tr>
                            <td colSpan={2} style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '20px', padding: '6px 8px', border: '1px solid #000' }}>Cộng điểm Nhóm I:</td>
                            <td colSpan={2} style={{ fontWeight: 'bold', color: '#b90000', padding: '6px 8px', border: '1px solid #000' }}>{evaluation.total_score_group1} / 100 điểm</td>
                        </tr>

                        <tr>
                            <td colSpan={4} style={{ fontWeight: 'bold', backgroundColor: '#e6e6e6', paddingTop: '15px', padding: '6px 8px', border: '1px solid #000' }}>II. CHUYỂN ĐỔI SỐ TRONG QUẢN TRỊ CƠ SỞ GIÁO DỤC</td>
                        </tr>
                        {renderRows(group2)}
                        <tr>
                            <td colSpan={2} style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '20px', padding: '6px 8px', border: '1px solid #000' }}>Cộng điểm Nhóm II:</td>
                            <td colSpan={2} style={{ fontWeight: 'bold', color: '#b90000', padding: '6px 8px', border: '1px solid #000' }}>{evaluation.total_score_group2} / 100 điểm</td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ padding: '15px', border: '2px solid #000', marginBottom: '30px', textAlign: 'left' }}>
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

            </div>
            
            <div style={{ textAlign: 'center', marginTop: '20px', paddingBottom: '40px', display: 'flex', gap: '16px', justifyContent: 'center' }} className="no-print">
                <Button size="large" onClick={handleExportWord} style={{ minWidth: 150, height: 45, fontWeight: 'bold', color: '#1890ff', borderColor: '#1890ff' }}>Tải file Word (.doc)</Button>
                <Button type="primary" size="large" onClick={() => window.print()} style={{ minWidth: 150, height: 45, fontWeight: 'bold' }}>In File PDF / Gọi Máy in</Button>
            </div>
        </div>
    );
};

export default CdsEvaluationPrint;
