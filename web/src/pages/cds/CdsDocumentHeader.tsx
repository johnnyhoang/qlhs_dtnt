import React from 'react';

interface CdsDocumentHeaderProps {
  title: string;
  subtitle?: string;
  schoolYear?: string;
  regulationLines?: string[];
}

const tableCellStyle: React.CSSProperties = {
  border: '1px dotted #8c8c8c',
  padding: '10px 16px',
  verticalAlign: 'top',
};

const CdsDocumentHeader: React.FC<CdsDocumentHeaderProps> = ({
  title,
  subtitle,
  schoolYear,
  regulationLines,
}) => {
  return (
    <div style={{ marginBottom: 28 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 36 }}>
        <tbody>
          <tr>
            <td style={{ ...tableCellStyle, width: '47%' }}>
              <div style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.25 }}>
                <div>SỞ GIÁO DỤC ĐÀO TẠO LÂM ĐỒNG</div>
                <div>TRƯỜNG PTDTNT THCS-THPT TỈNH</div>
              </div>
            </td>
            <td style={{ ...tableCellStyle, width: '53%', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.25 }}>
                <div>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div style={{ textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.25 }}>{title}</h1>
        {subtitle ? (
          <div style={{ marginTop: 12, fontSize: 18, fontWeight: 700 }}>
            {subtitle}
          </div>
        ) : null}
        {schoolYear ? (
          <div style={{ marginTop: 10, fontSize: 16, fontStyle: 'italic' }}>
            Năm học: {schoolYear}
          </div>
        ) : null}
        {regulationLines?.length ? (
          <div style={{ marginTop: 14, fontSize: 17, fontStyle: 'italic', lineHeight: 1.45 }}>
            {regulationLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const cdsWordDocumentHeader = (title: string) =>
  `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${title}</title></head><body>`;

export default CdsDocumentHeader;
