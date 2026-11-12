import { useEffect, useState } from 'react';
import './App.css'
import { Route, Routes } from 'react-router/internal/react-server-client';
import { AdminPage } from './pages/AdminPage';
import MenuPage from './pages/MenuPage';

function App() {





  return (
    <Routes>
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}

export default App
