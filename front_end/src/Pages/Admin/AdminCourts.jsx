// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// const AdminCourts = () => {
//   const [courts, setCourts] = useState([
//     { id: 1, name: "สนามฟุตบอล 1", category: "ฟุตบอล", price: 500, status: "available" },
//     { id: 2, name: "โต๊ะปิงปอง 1", category: "ปิงปอง", price: 100, status: "maintenance" },
//   ]);

//   const toggleStatus = (id) => {
//     setCourts(courts.map(c => 
//       c.id === id ? { ...c, status: c.status === 'available' ? 'maintenance' : 'available' } : c
//     ));
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <div className="w-64 bg-gray-900 text-white p-6 hidden md:block">
//         <h2 className="text-2xl font-bold mb-8 text-teal-400">Admin Panel</h2>
//         {/* <nav className="space-y-4">
//           <div className="text-gray-400 text-xs uppercase font-bold">Main</div>
//           <a href="/admin" className="block py-2 px-4 bg-teal-600 rounded-lg">Dashboard</a>
//           <a href="/admin/courts" className="block py-2 px-4 hover:bg-gray-800 transition">จัดการสนาม</a>
//           <a href="#" className="block py-2 px-4 hover:bg-gray-800 transition">สต็อกอุปกรณ์</a>
//           <div className="pt-4 text-gray-400 text-xs uppercase font-bold">Account</div>
//           <a href="#" className="block py-2 px-4 hover:bg-red-900 text-red-400 transition">Logout</a>
//         </nav> */}
//         <nav className="space-y-4">
//             <div className="text-gray-400 text-xs uppercase font-bold">Main</div>
//             <Link to="/admin" className="block py-2 px-4 hover:bg-gray-800 rounded-lg transition">
//                 Dashboard
//             </Link>
//             <Link to="/admin/courts" className="block py-2 px-4 hover:bg-gray-800 rounded-lg transition">
//                 จัดการสนาม
//             </Link>
//             <a href="#" className="block py-2 px-4 hover:bg-gray-800 transition">สต็อกอุปกรณ์</a>
//         </nav>
//       </div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">จัดการสนามกีฬา</h1>
//         <button className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold">+ เพิ่มสนามใหม่</button>
//       </div>

//       <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//         <table className="w-full text-left">
//           <thead className="bg-gray-50 border-b">
//             <tr>
//               <th className="p-4">ชื่อสนาม</th>
//               <th className="p-4">ประเภท</th>
//               <th className="p-4">ราคา/ชม.</th>
//               <th className="p-4">สถานะ</th>
//               <th className="p-4">จัดการ</th>
//             </tr>
//           </thead>
//           <tbody>
//             {courts.map(court => (
//               <tr key={court.id} className="border-b last:border-0">
//                 <td className="p-4 font-bold">{court.name}</td>
//                 <td className="p-4">{court.category}</td>
//                 <td className="p-4">฿{court.price}</td>
//                 <td className="p-4">
//                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${court.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
//                     {court.status === 'available' ? 'เปิดใช้งาน' : 'ปิดปรับปรุง'}
//                   </span>
//                 </td>
//                 <td className="p-4 flex gap-2">
//                   <button onClick={() => toggleStatus(court.id)} className="text-sm text-blue-600 font-bold">เปลี่ยนสถานะ</button>
//                   <button className="text-sm text-red-500 font-bold">ลบ</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AdminCourts;






import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from "../../supabaseClient";
const AdminCourts = () => {
  const [courts, setCourts] = useState([]);
  // useEffect(() => {
  //   const fetchCourts = async () => {
  //     const { data, error } = await supabase
  //       .from("courts")
  //       .select(`
  //         id,
  //         name,
  //         category,
  //         price_per_hour,
  //         is_available
  //       `)
  //       .order("id");

  //     if (!error) {
  //       setCourts(data);
  //     } else {
  //       console.error(error);
  //     }
  //   };

  //   fetchCourts();
  // }, []);

  const fetchCourts = async () => {
    const { data, error } = await supabase
      .from("courts")
      .select(`
        id,
        name,
        category,
        price_per_hour,
        is_available
      `)
      .order("id");

    if (!error) {
      setCourts(data || []);
    } else {
      console.error(error);
    }
  };

  // ✅ 2. useEffect เดียว: fetch + realtime
  useEffect(() => {
    fetchCourts(); // โหลดครั้งแรก

    const channel = supabase
      .channel("realtime-courts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "courts",
        },
        (payload) => {
          setCourts(prev => {
            if (payload.eventType === "UPDATE") {
              return prev.map(c =>
                c.id === payload.new.id ? payload.new : c
              );
            }
            if (payload.eventType === "INSERT") {
              return [...prev, payload.new];
            }
            if (payload.eventType === "DELETE") {
              return prev.filter(c => c.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
 const toggleStatus = async (court) => {
    const newStatus = !court.is_available;

    const { error } = await supabase
      .from("courts")
      .update({ is_available: newStatus })
      .eq("id", court.id);

    if (!error) {
      setCourts(prev =>
        prev.map(c =>
          c.id === court.id
            ? { ...c, is_available: newStatus }
            : c
        )
      );
    }
  };

  const deleteCourt = async (courtId) => {
    const confirm = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสนามนี้?");
    if (!confirm) return;

    const { error } = await supabase
      .from("courts")
      .delete()
      .eq("id", courtId);

    if (!error) {
      setCourts(prev => prev.filter(c => c.id !== courtId));
    } else {
      console.error(error);
      alert("ลบไม่สำเร็จ");
    }
  };
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. Sidebar - คงที่ไว้ด้านซ้าย */}
      {/* <aside className="w-64 bg-gray-900 text-white p-6 hidden md:flex flex-col sticky top-0 h-screen">
        <h2 className="text-2xl font-bold mb-8 text-teal-400">Admin Panel</h2>
        <nav className="space-y-2 flex-grow">
          <p className="text-gray-500 text-xs uppercase font-bold mb-2 px-4">Main Menu</p>
          <Link to="/admin" className="block py-2.5 px-4 hover:bg-gray-800 rounded-xl transition-all">
            📊 Dashboard
          </Link>
          <Link to="/admin/courts" className="block py-2.5 px-4 bg-teal-600 text-white rounded-xl shadow-lg transition-all">
            🏟️ จัดการสนาม
          </Link>
          <Link to="#" className="block py-2.5 px-4 hover:bg-gray-800 rounded-xl transition-all text-gray-400">
            📦 สต็อกอุปกรณ์
          </Link>
        </nav>
        <div className="border-t border-gray-800 pt-4">
          <Link to="/" className="block py-2.5 px-4 text-red-400 hover:bg-red-900/20 rounded-xl transition-all font-bold">
            🚪 Logout
          </Link>
        </div>
      </aside> */}

      {/* 2. Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">จัดการสนามกีฬา</h1>
            <p className="text-gray-500 text-sm mt-1">เพิ่ม แก้ไข หรือเปลี่ยนสถานะสนามเปิดให้บริการ</p>
          </div>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-teal-200 transition-all active:scale-95 flex items-center gap-2">
            <span>+</span> เพิ่มสนามใหม่
          </button>
        </header>

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="p-5 text-sm font-bold text-gray-400 uppercase tracking-wider">ชื่อสนาม</th>
                  <th className="p-5 text-sm font-bold text-gray-400 uppercase tracking-wider">ประเภท</th>
                  <th className="p-5 text-sm font-bold text-gray-400 uppercase tracking-wider">ราคา/ชม.</th>
                  <th className="p-5 text-sm font-bold text-gray-400 uppercase tracking-wider text-center">สถานะ</th>
                  <th className="p-5 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courts.map(court => (
                  <tr key={court.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-5">
                      <div className="font-bold text-gray-800 group-hover:text-teal-600 transition-colors">
                        {court.name}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">
                        {court.category}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="font-mono font-bold text-gray-700">
                        ฿{court.price_per_hour}
                      </span>
                    </td>

                    <td className="p-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                        court.is_available
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {court.is_available ? 'Available' : 'Maintenance'}
                      </span>
                    </td>
                    <td className="p-5 text-right flex justify-end gap-3">
                      <button 
                        onClick={() => toggleStatus(court)} 
                        className="text-xs font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        เปลี่ยนสถานะ
                      </button>
                      <button
                      onClick={() => deleteCourt(court.id)}
                      className="text-xs font-bold bg-red-50 text-red-500 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {courts.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="text-5xl mb-4">🏟️</div>
              <p className="text-gray-400 font-medium">ยังไม่มีข้อมูลสนามในระบบ</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCourts;