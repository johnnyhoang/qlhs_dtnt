import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Spin } from 'antd';
import { getHomepage } from '../../api/cms';
import CmsPageContent from '../../components/cms/CmsPageContent';

const PublicHomePage: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cms', 'home'],
    queryFn: getHomepage,
    retry: false,
  });

  if (isLoading) {
    return <Spin />;
  }

  if (isError) {
    return <Alert type="warning" message="Trang chu chua duoc cau hinh hoac chua duoc publish." />;
  }

  return <CmsPageContent page={data} />;
};

export default PublicHomePage;
