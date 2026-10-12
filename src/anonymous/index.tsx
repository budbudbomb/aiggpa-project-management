import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import Login from './pages/Login';

export default function Anonymous() {
  return (
    <Routes>
      <Route index element={<Login />} />
      <Route path="auth/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export { Login };
