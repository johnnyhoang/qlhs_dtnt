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
        setError('Unable to load the help content for this page.');
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
      title={entry?.title || 'Page Help'}
      placement="right"
      width={440}
      onClose={onClose}
      open={open}
      className="backoffice-help-drawer"
    >
      {!entry ? (
        <Empty description="No help file is configured for this page." />
      ) : loading ? (
        <div className="page-loading">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : (
        <div className="backoffice-help">
          <Title level={4}>Page guide</Title>
          <Paragraph type="secondary">
            This panel explains the purpose of the current screen, the important controls, and the normal workflow.
          </Paragraph>
          <div className="backoffice-help__content" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}
    </Drawer>
  );
};

export default BackofficeHelpDrawer;
