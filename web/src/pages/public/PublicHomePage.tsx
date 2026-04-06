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
    return <Alert type="warning" message={"Trang ch\u1ee7 ch\u01b0a \u0111\u01b0\u1ee3c c\u1ea5u h\u00ecnh ho\u1eb7c ch\u01b0a \u0111\u01b0\u1ee3c publish."} />;
  }

  return <CmsPageContent page={data} />;
};

export default PublicHomePage;
