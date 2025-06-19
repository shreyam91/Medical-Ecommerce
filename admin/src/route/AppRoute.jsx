import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from '../app/dashboard/Dashboard'


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/" />} />
      <Route path='/' element={<Dashboard />} />
    </Routes>
  );
};

export default AppRoutes;
