import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Button, Spin, Typography } from 'antd';
import { getCdsCriteria, getCdsEvaluationById } from '../../api/cds-evaluation';
import CdsDocumentHeader, { cdsWordDocumentHeader } from './CdsDocumentHeader';

const { Text } = Typography;

const printContainerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '20px',
  maxWidth: '900px',
  margin: '0 auto',
  color: '#000',
  fontFamily: '"Times New Roman", Times, serif',
};

const baseCellStyle: React.CSSProperties = {
  padding: '8px',
  border: '1px solid #000',
};

const CdsEvaluationPrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const reportRef = useRef<HTMLDivElement>(null);

  const { data: criteria, isLoading: loadingCriteria } = useQuery({
    queryKey: ['cds-criteria'],
    queryFn: () => getCdsCriteria(),
  });

  const { data: evaluation, isLoading: loadingEvaluation } = useQuery({
    queryKey: ['cds-eval', id],
    queryFn: () => getCdsEvaluationById(Number(id)),
    enabled: !!id,
  });

  if (loadingCriteria || loadingEvaluation || !evaluation || !criteria) {
    return (
      <div style={{ padding: 50, textAlign: 'center' }}>
        <Spin size="large" /> Đang tải dữ liệu báo cáo in...
      </div>
    );
  }

  const detailsMap = new Map<number, any>(evaluation.details.map((detail: any) => [detail.criterion.id, detail]));
  const group1 = criteria.filter((criterion: any) => criterion.group_code === 'DAY_HOC');
  const group2 = criteria.filter((criterion: any) => criterion.group_code === 'QUAN_TRI');
  const finalName = evaluation.submitter_name || evaluation.user?.ho_ten;
  const today = dayjs();

  const renderRows = (list: any[]) =>
    list.map((criterion) => {
      const detail = detailsMap.get(criterion.id);
      return (
        <tr key={criterion.id}>
          <td style={baseCellStyle}>{criterion.name}</td>
          <td style={{ ...baseCellStyle, textAlign: 'center' }}>
            {criterion.is_mandatory ? '-' : criterion.max_score}
          </td>
          <td style={{ ...baseCellStyle, textAlign: 'center', fontWeight: 'bold' }}>
            {criterion.is_mandatory ? (detail?.evidence_link ? 'Đạt' : 'Chưa đạt') : detail?.score || 0}
          </td>
          <td style={{ ...baseCellStyle, wordBreak: 'break-all', fontSize: '12px' }}>
            {detail?.evidence_link ? (
              <a href={detail.evidence_link} target="_blank" rel="noreferrer" style={{ color: '#0056b3' }}>
                Xem minh chứng
              </a>
            ) : (
              ''
            )}
          </td>
        </tr>
      );
    });

  const handleExportWord = () => {
    if (!reportRef.current) return;

    const header = cdsWordDocumentHeader('Phiếu đánh giá chuyển đổi số');
    const footer = '</body></html>';
    const sourceHTML = header + reportRef.current.innerHTML + footer;
    const source = `data:application/vnd.ms-word;charset=utf-8,${encodeURIComponent(sourceHTML)}`;
    const fileDownload = document.createElement('a');
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Phieu_Danh_Gia_CDS_${evaluation.period?.year}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
    <div style={printContainerStyle} className="print-container">
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

      <div ref={reportRef}>
        <CdsDocumentHeader
          title="PHIẾU ĐÁNH GIÁ MỨC ĐỘ CHUYỂN ĐỔI SỐ"
          regulationLines={[
            'Theo quyết định số 4725/QĐ-BGDĐT ngày 30 tháng 12 năm 2022',
            'của Bộ giáo dục đào tạo',
          ]}
        />

        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <p><strong>Người nộp / Chịu trách nhiệm:</strong> {finalName}</p>
          <p>
            <strong>Ngày nộp hồ sơ:</strong> {dayjs(evaluation.updatedAt).format('DD/MM/YYYY HH:mm')}
            <span style={{ marginLeft: 30, fontStyle: 'italic' }}>
              ({evaluation.status === 'SUBMITTED' ? 'Bản chính thức' : 'Bản nháp'})
            </span>
          </p>
        </div>

        <table style={{ width: '100%', marginBottom: '20px', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ ...baseCellStyle, width: '45%' }}>Tiêu chí</th>
              <th style={{ ...baseCellStyle, width: '10%', textAlign: 'center' }}>Điểm<br />Tối đa</th>
              <th style={{ ...baseCellStyle, width: '15%', textAlign: 'center' }}>Tự<br />Đánh giá</th>
              <th style={{ ...baseCellStyle, width: '30%' }}>Hồ sơ / Minh chứng</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} style={{ ...baseCellStyle, fontWeight: 'bold', backgroundColor: '#e6e6e6' }}>
                I. CHUYỂN ĐỔI SỐ TRONG DẠY, HỌC VÀ KIỂM TRA ĐÁNH GIÁ
              </td>
            </tr>
            {renderRows(group1)}
            <tr>
              <td colSpan={2} style={{ ...baseCellStyle, fontWeight: 'bold', textAlign: 'right', paddingRight: '20px' }}>
                Cộng điểm Nhóm I:
              </td>
              <td colSpan={2} style={{ ...baseCellStyle, fontWeight: 'bold', color: '#b90000' }}>
                {evaluation.total_score_group1} / 100 điểm
              </td>
            </tr>

            <tr>
              <td colSpan={4} style={{ ...baseCellStyle, fontWeight: 'bold', backgroundColor: '#e6e6e6' }}>
                II. CHUYỂN ĐỔI SỐ TRONG QUẢN TRỊ CƠ SỞ GIÁO DỤC
              </td>
            </tr>
            {renderRows(group2)}
            <tr>
              <td colSpan={2} style={{ ...baseCellStyle, fontWeight: 'bold', textAlign: 'right', paddingRight: '20px' }}>
                Cộng điểm Nhóm II:
              </td>
              <td colSpan={2} style={{ ...baseCellStyle, fontWeight: 'bold', color: '#b90000' }}>
                {evaluation.total_score_group2} / 100 điểm
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ padding: '15px', border: '2px solid #000', marginBottom: '30px', textAlign: 'left' }}>
          <Text strong style={{ fontSize: '16px' }}>KẾT LUẬN MỨC ĐỘ ĐÁP ỨNG:</Text>
          <Text strong style={{ fontSize: '18px', color: '#b90000', marginLeft: '10px' }}>
            MỨC {evaluation.level}
            {evaluation.level === 3 && ' (Tốt)'}
            {evaluation.level === 2 && ' (Cơ bản)'}
            {evaluation.level === 1 && ' (Chưa đáp ứng)'}
          </Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <div style={{ width: '40%' }} />
          <div style={{ width: '40%', textAlign: 'center' }}>
            <p style={{ fontStyle: 'italic', margin: 0 }}>
              ........, ngày {today.format('DD')} tháng {today.format('MM')} năm {today.format('YYYY')}
            </p>
            <p style={{ fontWeight: 'bold', margin: '5px 0 80px 0' }}>Người tạo phiếu</p>
            <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{finalName}</p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', paddingBottom: '40px', display: 'flex', gap: '16px', justifyContent: 'center' }} className="no-print">
        <Button size="large" onClick={handleExportWord} style={{ minWidth: 150, height: 45, fontWeight: 'bold', color: '#1890ff', borderColor: '#1890ff' }}>
          Tải file Word (.doc)
        </Button>
        <Button type="primary" size="large" onClick={() => window.print()} style={{ minWidth: 150, height: 45, fontWeight: 'bold' }}>
          In file PDF / Gọi máy in
        </Button>
      </div>
    </div>
  );
};

export default CdsEvaluationPrint;
