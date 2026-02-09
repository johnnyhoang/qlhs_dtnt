import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Meals from './pages/Meals';
import Transport from './pages/Transport';
import Insurance from './pages/Insurance';
import Payments from './pages/Payments';
import Users from './pages/Users';
import MasterData from './pages/MasterData';
import MainLayout from './layouts/MainLayout';

const queryClient = new QueryClient();

let finalGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!finalGoogleClientId) {
  if (import.meta.env.DEV) {
    finalGoogleClientId = "311534268252-fjpb2dvc8kpne0hrca4fr9pb5k9sspeh.apps.googleusercontent.com";
  } else {
    throw new Error("VITE_GOOGLE_CLIENT_ID is not defined");
  }
}

finalGoogleClientId = finalGoogleClientId.trim();

console.log('Using Google Client ID:', finalGoogleClientId);
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Current Origin:', window.location.origin);

const ProtectedRoute = ({ children, module }: { children: React.ReactElement, module?: string }) => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(userJson);
    if (!user || typeof user !== 'object') {
      throw new Error('Dữ liệu người dùng không hợp lệ');
    }

    if (user.vai_tro === 'ADMIN') return children;

    if (module) {
      const hasAccess = user.danh_sach_quyen?.some((p: any) => p.ma_module === module && p.co_quyen_xem);
      if (!hasAccess) return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(userJson);
    if (user?.vai_tro !== 'ADMIN') return <Navigate to="/" replace />;
  } catch (error) {
    console.error('Lỗi quản trị:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  return children;
};

import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={finalGoogleClientId}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ConfigProvider
            theme={{
              token: {
                fontSize: 13,
                borderRadius: 4,
              },
              components: {
                Table: {
                  paddingContentVerticalLG: 8,
                }
              }
            }}
          >
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="hoc-sinh" element={<ProtectedRoute module="hoc-sinh"><Students /></ProtectedRoute>} />
                  <Route path="suat-an" element={<ProtectedRoute module="suat-an"><Meals /></ProtectedRoute>} />
                  <Route path="dinh-muc-xe" element={<ProtectedRoute module="dinh-muc-xe"><Transport /></ProtectedRoute>} />
                  <Route path="bao-hiem" element={<ProtectedRoute module="bao-hiem"><Insurance /></ProtectedRoute>} />
                  <Route path="thanh-toan" element={<ProtectedRoute module="thanh-toan"><Payments /></ProtectedRoute>} />
                  <Route path="danh-muc-master" element={<AdminRoute><MasterData /></AdminRoute>} />
                  <Route path="nguoi-dung" element={<AdminRoute><Users /></AdminRoute>} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ConfigProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
