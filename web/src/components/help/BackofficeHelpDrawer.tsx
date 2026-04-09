import React from 'react';
import { Alert, Drawer, Empty, Spin, Typography } from 'antd';
import type { BackofficeHelpEntry } from '../../help/backoffice-help';

const { Paragraph, Title } = Typography;

interface BackofficeHelpDrawerProps {
  open: boolean;
  onClose: () => void;
  entry: BackofficeHelpEntry | null;
}

const BackofficeHelpDrawer: React.FC<BackofficeHelpDrawerProps> = ({ open, onClose, entry }) => {
  const [html, setHtml] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    let active = true;

    if (!open || !entry) {
      setHtml('');
      setError('');
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError('');

    entry.loader()
      .then((content) => {
        if (!active) {
          return;
        }
        setHtml(content);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setError('Khong tai duoc noi dung huong dan cho trang nay.');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [entry, open]);

  return (
    <Drawer
      title={entry?.title || 'Huong dan trang'}
      placement="right"
      width={440}
      onClose={onClose}
      open={open}
      className="backoffice-help-drawer"
    >
      {!entry ? (
        <Empty description="Chua co noi dung huong dan cho trang nay." />
      ) : loading ? (
        <div className="page-loading">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : (
        <div className="backoffice-help">
          <Title level={4}>Huong dan su dung</Title>
          <Paragraph type="secondary">
            Bang nay mo ta muc dich cua man hinh hien tai, cac thao tac quan trong, va quy trinh su dung thong thuong.
          </Paragraph>
          <div className="backoffice-help__content" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}
    </Drawer>
  );
};

export default BackofficeHelpDrawer;
