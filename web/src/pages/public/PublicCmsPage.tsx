import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Spin } from 'antd';
import { useLocation } from 'react-router-dom';
import { getPageByPath } from '../../api/cms';
import CmsPageContent from '../../components/cms/CmsPageContent';

const PublicCmsPage: React.FC = () => {
  const location = useLocation();
  const pagePath = location.pathname.replace(/^\/+/, '');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cms', 'page', pagePath],
    queryFn: () => getPageByPath(pagePath),
    enabled: Boolean(pagePath),
    retry: false,
  });

  if (isLoading) {
    return <Spin />;
  }

  if (isError || !data) {
    return <Alert type="error" message={"Kh\u00f4ng t\u00ecm th\u1ea5y trang n\u1ed9i dung."} />;
  }

  return <CmsPageContent page={data} />;
};

export default PublicCmsPage;
