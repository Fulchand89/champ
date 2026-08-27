import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const token = Cookies.get('token') || localStorage.getItem('token') || Cookies.get('adminToken') || localStorage.getItem('adminToken');

  if (!isAuthenticated || !token) {
    return <Navigate to={ROUTES.ADMIN.LOGIN} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;

