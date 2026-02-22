

// import React from 'react';

// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import HomePage from './Pages/HomePage';
// import LoginPage from './Pages/LoginPage';
// import RegisterPage from './Pages/RegisterPage';
// import PayPage from './Pages/PayPage';
// import BookingPage from './Pages/BookingPage';
// import BorrowPage from './Pages/BorrowPage';
// import HistoryPage from './Pages/HistoryPage';
// // import AdminDashboard from './Pages/Admin/AdminDashboard';

// function App() {
//   return (
//     <Router>
//       <Navbar />
//       <main className="min-h-screen bg-gray-50">
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/booking" element={<BookingPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/pay" element={<PayPage />} />
//           <Route path="/borrow" element={<BorrowPage />} />
//           <Route path="/history" element={<HistoryPage />} />
//           {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          
//         </Routes>
//       </main>
//     </Router>
//   );
// }

// export default App;





// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Navbar from './components/Navbar';

// // User Pages
// import HomePage from './Pages/User/HomePage';
// import BookingPage from './Pages/User/BookingPage';
// import HistoryPage from './Pages/User/HistoryPage';
// import PayPage from './Pages/User/PayPage';
// import BorrowPage from './Pages/User/BorrowPage';

// // Auth Pages
// import LoginPage from './Pages/Auth/LoginPage';
// import RegisterPage from './Pages/Auth/RegisterPage';

// // Admin Pages
// import AdminDashboard from './Pages/Admin/AdminDashboard';
// import AdminCourts from './Pages/Admin/AdminCourts'; 

// function App() {
//   // สมมติว่าดึงข้อมูล User หลัง Login (ใช้เช็คสิทธิ์ Admin)
//   const user = { role: 'admin' }; 

//   return (
//     <Router>
//       <Navbar />
//       <main className="min-h-screen bg-gray-50">
//         <Routes>
//           {/* Public & User Routes */}
//           <Route path="/" element={<HomePage />} />
//           <Route path="/booking" element={<BookingPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/pay" element={<PayPage />} />
//           <Route path="/borrow" element={<BorrowPage />} />
//           <Route path="/history" element={<HistoryPage />} />

//           {/* Admin Routes - มีการเช็คสิทธิ์ Role-Based Access Control */}
//           <Route 
//             path="/admin" 
//             element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
//           />
//           <Route 
//             path="/admin/courts" 
//             element={user?.role === 'admin' ? <AdminCourts /> : <Navigate to="/login" />} 
//           />
//         </Routes>
//       </main>
//     </Router>
//   );
// }

// export default App;




import React, { useEffect,useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { supabase } from './supabaseClient';

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
          <Route path="/admin/history" element={<AdminBookingHistory />} />
      </Routes>
    </Router>
  );
}

export default App;