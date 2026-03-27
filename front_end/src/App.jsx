
import React, { useEffect,useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { supabase } from './supabaseClient';
import { Toaster } from "react-hot-toast";

// User & Auth Pages
import HomePage from './Pages/User/HomePage';
import BookingPage from './Pages/User/BookingPage';
import HistoryPage from './Pages/User/HistoryPage';
import PayPage from './Pages/User/PayPage';
import BorrowPage from './Pages/User/BorrowPage';

import LoginPage from './Pages/Auth/LoginPage';
import RegisterPage from './Pages/Auth/RegisterPage';

// Admin Pages
import AdminDashboard from './Pages/Admin/AdminDashboard';
import AdminCourts from './Pages/Admin/AdminCourts';
import ManageBorrowPage from "./Pages/Admin/ManageBorrowPage";
import AdminBookingHistory from './Pages/Admin/AdminBookingHistory';
import ManageEquipmentsPage from './Pages/Admin/ManageEquipmentsPage';
import ProfilePage from './Pages/User/ProfilePage';
// import { Toaster } from "react-hot-toast";

// function App() {
//   // ในอนาคตค่านี้จะมาจากระบบ Login จริง
//   const [user, setUser] = useState({ loggedIn: true, role: 'admin' }); 
//   // const [user, setUser] = useState({ loggedIn: true, role: 'user' }); 

//   return (
//     <Router>
//       {/* <Navbar user={user} /> */}
//       <Navbar user={user} setUser={setUser} />
//       <main className="min-h-screen bg-gray-50">
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/login" element={<LoginPage setUser={setUser} />} />
//           <Route path="/register" element={<RegisterPage />} />
          
//           {/* User Only Routes */}
//           <Route path="/booking" element={<BookingPage />} />
//           <Route path="/pay" element={<PayPage />} />
//           <Route path="/borrow" element={<BorrowPage />} />
//           <Route path="/history" element={<HistoryPage />} />

//           {/* Admin Protected Routes */}
//           <Route 
//             path="/admin" 
//             element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
//           />
//           <Route 
//             path="/admin/courts" 
//             element={user.role === 'admin' ? <AdminCourts /> : <Navigate to="/" />} 
//           />
//         </Routes>
//       </main>
//     </Router>
//   );
// }
function App() {
  // const [user, setUser] = useState(null);
  const [user, setUser] = useState({
    loggedIn: false,
    role: null,
    email: null,
    username: null,
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
      });          // ✅ เคลียร์ user
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
    });

    setLoading(false);
  };

  // โหลดตอนเปิดเว็บ
  supabase.auth.getSession().then(({ data: { session } }) => {
    getProfile(session);
  });

  // ฟังทุก auth event (LOGIN / LOGOUT)
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      getProfile(session);   // ✅ session = null ตอน logout
    }
  );

  return () => listener.subscription.unsubscribe();
}, []);

  if (loading) return null;

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Navbar user={user} setUser={setUser} />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* User Only Routes */}
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/pay" element={<PayPage />} />
            <Route path="/borrow" element={<BorrowPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
          <Route
            path="/admin"
            element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
          />
          <Route 
            path="/admin/courts" 
            element={user?.role === 'admin' ? <AdminCourts /> : <Navigate to="/" />} 
          />
            <Route
              path="/admin/borrow"
              element={user?.role === "admin"
                ? <ManageBorrowPage />
                : <Navigate to="/" />}
            />
            {/* <Route path="/admin/history" element={<AdminBookingHistory />} /> */}
            <Route
              path="/admin/history"
              element={user?.role === "admin"
                ? <AdminBookingHistory />
                : <Navigate to="/" />}
            />
            <Route
              path="/admin/equipments"
              element={user?.role === "admin"
                ? <ManageEquipmentsPage />
                : <Navigate to="/" />}
            />
        </Routes>
      </Router>
    </>
    
  );
}

export default App;