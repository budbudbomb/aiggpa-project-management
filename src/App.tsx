import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Anonymous from 'anonymous';
import AuthorizedApp from 'auth';
import { useThemeStore, applyThemeClass } from 'auth/store/themeStore';
import { useAuthStore } from 'auth/store/authStore';
import { ToastContainer } from 'shared/components/feedback';
import { ToastHost } from './components/Toast';

export default function App(): React.ReactElement {
  const { mode, primaryColor, borderRadius } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    applyThemeClass(mode, primaryColor, borderRadius);
  }, [mode, primaryColor, borderRadius]);

  return (
    <>
      <ToastContainer />
      <ToastHost />
      <Routes>
        <Route path="/login/*" element={<Anonymous />} />
        <Route path="/anonymous/*" element={<Anonymous />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <AuthorizedApp />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
}
