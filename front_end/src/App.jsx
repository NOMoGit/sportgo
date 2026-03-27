import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar';

// Public & Auth Pages
import HomePage from './Pages/User/HomePage';
import LoginPage from './Pages/Auth/LoginPage';
import RegisterPage from './Pages/Auth/RegisterPage';

// User Only Pages
import BookingPage from './Pages/User/BookingPage';
import HistoryPage from './Pages/User/HistoryPage';
import PayPage from './Pages/User/PayPage';
import BorrowPage from './Pages/User/BorrowPage';
import ProfilePage from './Pages/User/ProfilePage';

// Admin Pages
import AdminDashboard from './Pages/Admin/AdminDashboard';
import AdminCourts from './Pages/Admin/AdminCourts';
import ManageBorrowPage from "./Pages/Admin/ManageBorrowPage";
import AdminBookingHistory from './Pages/Admin/AdminBookingHistory';
import ManageEquipmentsPage from './Pages/Admin/ManageEquipmentsPage';

/* ==========================================
   🛡️ Route Protectors (ตัวป้องกันหน้าเว็บ)
========================================== */

// 1. หน้าที่ต้อง Login ก่อนถึงจะเข้าได้ (User ทั่วไป)
const RequireAuth = ({ user, children }) => {
  if (!user || !user.id) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// 2. หน้าที่ต้องเป็น Admin เท่านั้นถึงจะเข้าได้
const RequireAdmin = ({ user, children }) => {
  if (!user || !user.id) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />; // ถ้าล็อกอินแล้วแต่ไม่ใช่แอดมิน ให้เตะกลับหน้า Home
  }
  return children;
};

/* ==========================================
   🚀 Main Application
========================================== */

function App() {
  const [user, setUser] = useState({
    loggedIn: false,
    role: null,
    email: null,
    username: null,
    id: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async (session) => {
      if (!session) {
        setUser({
          id: null,
          email: null,
          username: null,
          role: null,
          loggedIn: false,
        });
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("id, username, role")
        .eq("id", session.user.id)
        .single();

      setUser({
        id: session.user.id,
        email: session.user.email,
        username: profile?.username,
        role: profile?.role,
        loggedIn: true,
      });

      setLoading(false);
    };

    // โหลดตอนเปิดเว็บครั้งแรก
    supabase.auth.getSession().then(({ data: { session } }) => {
      getProfile(session);
    });

    // ฟังทุก auth event (LOGIN / LOGOUT) แบบ Real-time
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        getProfile(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // รอให้เช็คสถานะ Login เสร็จก่อน ค่อยวาดหน้าเว็บ (ป้องกันการโดนเตะมั่วตอนรีเฟรช)
  if (loading) return <div className="min-h-screen flex items-center justify-center">กำลังโหลดระบบ...</div>;

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Navbar user={user} setUser={setUser} />

        <Routes>
          {/* ==========================================
              🌍 Public Routes (ใครเข้าก็ได้)
          ========================================== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/borrow" element={<BorrowPage />} />

          {/* ==========================================
              👤 User Protected Routes (ต้อง Login)
          ========================================== */}
          {/* <Route path="/booking" element={
            <RequireAuth user={user}><BookingPage /></RequireAuth>
          } /> */}
          <Route path="/pay" element={
            <RequireAuth user={user}><PayPage /></RequireAuth>
          } />
          {/* <Route path="/borrow" element={
            <RequireAuth user={user}><BorrowPage /></RequireAuth>
          } /> */}
          <Route path="/history" element={
            <RequireAuth user={user}><HistoryPage /></RequireAuth>
          } />
          <Route path="/profile" element={
            <RequireAuth user={user}><ProfilePage user={user} setUser={setUser} /></RequireAuth>
          } />

          {/* ==========================================
              👑 Admin Protected Routes (ต้องเป็น Admin)
          ========================================== */}
          <Route path="/admin" element={
            <RequireAdmin user={user}><AdminDashboard /></RequireAdmin>
          } />
          <Route path="/admin/courts" element={
            <RequireAdmin user={user}><AdminCourts /></RequireAdmin>
          } />
          <Route path="/admin/borrow" element={
            <RequireAdmin user={user}><ManageBorrowPage /></RequireAdmin>
          } />
          <Route path="/admin/history" element={
            <RequireAdmin user={user}><AdminBookingHistory /></RequireAdmin>
          } />
          <Route path="/admin/equipments" element={
            <RequireAdmin user={user}><ManageEquipmentsPage /></RequireAdmin>
          } />
          
        </Routes>
      </Router>
    </>
  );
}

export default App;