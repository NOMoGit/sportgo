


// import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
const AdminDashboard = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
//   const fetchBookings = async () => {
//   const today = new Date().toISOString().slice(0, 10);

//   const { data, error } = await supabase
//     .from("bookings")
//     .select(`
//       id,
//       booking_date,
//       receipt_url,
//       status,
//       hold_until,
//       users ( username, email ),
//       courts ( name, category ),
//       booking_equipments (
//         quantity,
//         equipments ( name )
//       )
//     `)
//     .gte("booking_date", `${today}T00:00:00`) // ✅ วันนี้ + อนาคต
//     .order("booking_date", { ascending: true });

//   if (!error && data) {
//     // setPendingBookings(
//     //   data.map(b => ({
//     //     id: b.id,
//     //     user: b.users?.username ?? "-",1
//     //     email: b.users?.email ?? "-",
//     //     type: b.courts?.category ?? "-",
//     //     court: b.courts?.name ?? "-",
//     //     time: b.booking_date,
//     //     receipt_url: b.receipt_url,
//     //     status: b.status
//     //   }))
//     // );
//     setPendingBookings(
//       data.map(b => {
//         const equipmentNames =
//           b.booking_equipments && b.booking_equipments.length > 0
//             ? b.booking_equipments
//                 .map(e => `${e.equipments?.name} x${e.quantity}`)
//                 .join(", ")
//             : null;

//         return {
//           id: b.id,
//           user: b.users?.username ?? "-",
//           email: b.users?.email ?? "-",

//           // ⭐ ตรงนี้
//           type: b.courts
//             ? b.courts.category
//             : equipmentNames || "Borrow equipment",

//           court: b.courts?.name ?? "-",
//           time: b.booking_date,
//           receipt_url: b.receipt_url,
//           status: b.status,
//           holdUntil: b.hold_until
//         };
//       })
//     );
//   }
// };
const fetchBookings = async () => {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      created_at,
      booking_date,
      receipt_url,
      status,
      hold_until,
      users ( username, email ),
      courts ( name, category ),
      booking_equipments (
        quantity,
        equipments ( name )
      )
    `)
    .gte("booking_date", `${today}T00:00:00`)
    .order("created_at", { ascending: false }); // 🔹 เอา descending

  if (!error && data) {
    setPendingBookings(
      data.map(b => {
        const equipmentNames =
          b.booking_equipments && b.booking_equipments.length > 0
            ? b.booking_equipments
                .map(e => `${e.equipments?.name} x${e.quantity}`)
                .join(", ")
            : null;

        return {
          id: b.id,
          createdAt: b.created_at,
          user: b.users?.username ?? "-",
          email: b.users?.email ?? "-",
          type: b.courts ? b.courts.category : equipmentNames || "Borrow equipment",
          court: b.courts?.name ?? "-",
          time: b.booking_date,
          receipt_url: b.receipt_url,
          status: b.status,
          holdUntil: b.hold_until
        };
      })
    );
  }
};
const navigate = useNavigate();
const handleLogout = async () => {
  await supabase.auth.signOut();
  navigate("/login");
};

const [stats, setStats] = useState({
  waiting: 0,
  totalBookings: 0,
  todayRevenue: 0,
  bookedCourts: 0
});
// const fetchStats = async () => {
//   const today = new Date().toISOString().slice(0, 10);

//   const { count: waiting } = await supabase
//     .from("bookings")
//     .select("*", { count: "exact", head: true })
//     .eq("status", "pending");

//   const { count: totalBookings } = await supabase
//     .from("bookings")
//     .select("*", { count: "exact", head: true });

//   // ✅ รายได้วันนี้ = paid + returned
//   const { data: revenueData, error } = await supabase
//     .from("bookings")
//     .select("total_price")
//     .in("status", ["paid", "returned"])
//     .eq("booking_date", today);

//   if (error) console.error(error);

//   const todayRevenue =
//     revenueData?.reduce((sum, b) => sum + Number(b.total_price), 0) ?? 0;

//   const { data: courtsData } = await supabase
//     .from("bookings")
//     .select("court_id")
//     .eq("booking_date", today)
//     .not("court_id", "is", null)
//     .in("status", ["paid", "returned"]);

//   setStats({
//     waiting: waiting ?? 0,
//     totalBookings: totalBookings ?? 0,
//     todayRevenue,
//     bookedCourts: new Set(courtsData?.map(c => c.court_id)).size
//   });
// };
// const fetchStats = async () => {
//   const today = new Date().toISOString().slice(0, 10);

//   // ✅ รอตรวจการชำระเงินจริง
//   const { count: waiting } = await supabase
//     .from("bookings")
//     .select("*", { count: "exact", head: true })
//     .in("status", ["pending", "waiting"])
//     .gte("booking_date", `${today}T00:00:00`); 
//   const { count: totalBookings } = await supabase
//     .from("bookings")
//     .select("*", { count: "exact", head: true });

//   const { data: revenueData } = await supabase
//     .from("bookings")
//     .select("total_price")
//     .in("status", ["paid", "returned"])
//     .eq("booking_date", today);

//   const todayRevenue =
//     revenueData?.reduce((sum, b) => sum + Number(b.total_price), 0) ?? 0;

//   const { data: courtsData } = await supabase
//     .from("bookings")
//     .select("court_id")
//     .eq("booking_date", today)
//     .not("court_id", "is", null)
//     .in("status", ["paid", "returned"]);

//   setStats({
//     waiting: waiting ?? 0,
//     totalBookings: totalBookings ?? 0,
//     todayRevenue,
//     bookedCourts: new Set(courtsData?.map(c => c.court_id)).size
//   });
// };

const fetchStats = async () => {
  const today = new Date().toISOString().slice(0, 10);

  const startOfDay = `${today}T00:00:00`;
  const endOfDay = `${today}T23:59:59`;

  // ✅ รอตรวจ (วันนี้เท่านั้น)
  const { count: waiting } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "waiting"])
    .gte("booking_date", startOfDay)
    .lte("booking_date", endOfDay);

  // ✅ จำนวนคนจอง "วันนี้"
  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .gte("booking_date", startOfDay)
    .lte("booking_date", endOfDay);

  // ✅ รายได้วันนี้
  const { data: revenueData } = await supabase
    .from("bookings")
    .select("total_price")
    .in("status", ["paid", "returned"])
    .gte("booking_date", startOfDay)
    .lte("booking_date", endOfDay);

  const todayRevenue =
    revenueData?.reduce((sum, b) => sum + Number(b.total_price), 0) ?? 0;

  // ✅ สนามที่ถูกจองวันนี้
  const { data: courtsData } = await supabase
    .from("bookings")
    .select("court_id")
    .gte("booking_date", startOfDay)
    .lte("booking_date", endOfDay)
    .not("court_id", "is", null)
    .in("status", ["paid", "returned"]);

  setStats({
    waiting: waiting ?? 0,
    totalBookings: totalBookings ?? 0,
    todayRevenue,
    bookedCourts: new Set(courtsData?.map(c => c.court_id)).size
  });
};

useEffect(() => {
  fetchBookings();
  fetchStats(); // ⭐ โหลดครั้งแรก

  // const channel = supabase
  //   .channel("admin-bookings-realtime")
  //   .on(
  //     "postgres_changes",
  //     {
  //       event: "*",
  //       schema: "public",
  //       table: "bookings"
  //     },
  //     () => {
  //       fetchBookings();
  //       fetchStats(); // ⭐ สำคัญมาก
  //     }
  //   )
  //   .subscribe();
  // const channel = supabase
  //   .channel("admin-bookings-realtime")
  //   .on(
  //     "postgres_changes",
  //     {
  //       event: "*",
  //       schema: "public",
  //       table: "bookings"
  //     },
  //     (payload) => {
  //       // console.log("NEW BOOKING:", payload);
  //       // toast.success("📌 มีรายการจองใหม่เข้ามา");
  //       // if (payload.new?.status === "pending") {
  //       //   toast.success("📌 มีรายการจองใหม่เข้ามา");
  //       // }
  //       if (
  //         payload.eventType === "INSERT" &&
  //         payload.new?.status === "pending"
  //       ) {
  //         toast.success("📌 มีรายการจองใหม่เข้ามา");
  //       }
  //       fetchBookings();
  //       fetchStats();
  //     }
  //   )
  //   // .subscribe((status) => {
  //   //   console.log("SUBSCRIBE STATUS:", status);
  //   // });
  //   .subscribe();
  const channel = supabase
  .channel("admin-bookings-realtime")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "bookings"
    },
    // (payload) => {
    //   if (payload.eventType === "INSERT") {
    //     // เอางานใหม่ขึ้นบนสุด
    //     setPendingBookings(prev => [
    //       {
    //         id: payload.new.id,
    //         user: payload.new.users?.username ?? "-",
    //         email: payload.new.users?.email ?? "-",
    //         type: payload.new.courts ? payload.new.courts.category : "Borrow equipment",
    //         court: payload.new.courts?.name ?? "-",
    //         time: payload.new.booking_date,
    //         receipt_url: payload.new.receipt_url,
    //         status: payload.new.status,
    //         holdUntil: payload.new.hold_until
    //       },
    //       ...prev
    //     ]);
    //     toast.success("📌 มีรายการจองใหม่เข้ามา");
    //   } else {
    //     fetchBookings();
    //   }
    //   fetchStats();
    // }
    (payload) => {
      if (payload.eventType === "INSERT") {
        toast.success("📌 มีรายการจองใหม่เข้ามา");
      }
      // ✅ เพิ่ม: แจ้งเตือนเมื่อ user อัปโหลดสลิป (pending → waiting)
      if (
        payload.eventType === "UPDATE" &&
        payload.new?.status === "waiting" &&
        payload.old?.status !== "waiting"
      ) {
        toast.success("💳 มีการแนบสลิปใหม่ รอตรวจสอบ!");
      }
      // ✅ fetch ใหม่ทุกครั้ง เพื่อได้ข้อมูล join ครบ + เรียงถูกต้อง
      fetchBookings();
      fetchStats();
    }
  )
  .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
// const updateBookingStatus = async (bookingId, newStatus) => {
//   const { error } = await supabase
//     .from("bookings")
//     .update({ status: newStatus })
//     .eq("id", bookingId);

//   if (error) {
//     console.error(error);
//     alert("อัปเดตสถานะไม่สำเร็จ");
//     return;
//   }

//   setPendingBookings(prev =>
//     prev.map(b =>
//       b.id === bookingId ? { ...b, status: newStatus } : b
//     )
//   );
// };
// const updateBookingStatus = async (bookingId, newStatus) => {
//   if (newStatus === "rejected") {
//     // เรียก endpoint ลบ slot + เปลี่ยน status
//     const res = await fetch("/api/reject-booking", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ booking_id: bookingId })
//     });
//     const data = await res.json();
//     if (!data.success) {
//       alert("Reject ไม่สำเร็จ: " + data.error);
//       return;
//     }
//   } else {
//     // status อื่น ๆ
//     const { error } = await supabase
//       .from("bookings")
//       .update({ status: newStatus })
//       .eq("id", bookingId);
//     if (error) {
//       alert("Update status ไม่สำเร็จ");
//       return;
//     }
//   }

//   // update state
//   setPendingBookings(prev =>
//     prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
//   );
// };
// const updateBookingStatus = async (bookingId, newStatus) => { 
//   try { 
//     if (newStatus === "rejected") { // ลบ slot หรือ update status โดยตรง 
//       const { error } = await supabase 
//       .from("bookings") 
//       .update({ status: "rejected" }) 
//       .eq("id", bookingId); 
//       if (error) throw error; 
//       // TODO: ถ้ามี slot table ให้ลบ slot ที่เกี่ยวข้อง // 
//     await supabase.from("slots").delete().eq("booking_id", bookingId); 
//     } else { 
//     const { error } = await supabase 
//       .from("bookings") 
//       .update({ status: newStatus }) 
//       .eq("id", bookingId); 
//       if (error) throw error; 
//     } 
//       setPendingBookings(prev => 
//       prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b)) ); 
//     } catch (err) { console.error(err); alert("Update status ไม่สำเร็จ: " + err.message); } };
const updateBookingStatus = async (bookingId, newStatus) => { 
  try { 
    if (newStatus === "rejected") {
       // ✅ ดึงอุปกรณ์ที่ผูกกับ booking นี้ก่อน
      const { data: equipData } = await supabase
        .from("booking_equipments")
        .select("equipment_id, quantity")
        .eq("booking_id", bookingId);

      // ✅ คืน stock ทีละชิ้น
      if (equipData && equipData.length > 0) {
        for (const item of equipData) {
          await supabase.rpc("increment_stock", {
            equip_id: item.equipment_id,
            amount: item.quantity
          });
        }
      }


      const { error } = await supabase
        .from("bookings")
        .update({ status: "rejected" })
        .eq("id", bookingId);
      if (error) throw error;

      // ลบ slot
      // await supabase.from("slots").delete().eq("booking_id", bookingId);
      await supabase.from("booking_time_slots").delete().eq("booking_id", bookingId);
    } else {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);
      if (error) throw error;
    }

    setPendingBookings(prev => {
      // อัปเดต status
      const updated = prev.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      );
      // const statusOrder = { pending: 0, waiting: 1, paid: 2, rejected: 3, cancelled: 4 };
      // return updated.sort((a, b) => (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5));
      // ⭐ pending + waiting อยู่บนสุด, ตามเวลาล่าสุด
      // return updated.sort((a, b) => {
      //   const topStatuses = ["pending", "waiting"];
      //   const aTop = topStatuses.includes(a.status) ? 0 : 1;
      //   const bTop = topStatuses.includes(b.status) ? 0 : 1;

      //   // ถ้าอยู่ topStatuses เหมือนกัน เรียงตามเวลา booking ใหม่สุดบนสุด
      //   if (aTop === 0 && bTop === 0) {
      //     return new Date(b.time) - new Date(a.time); // ล่าสุดบน
      //   }

      //   return aTop - bTop;
      // });
      return updated.sort((a, b) => {
        const topStatuses = ["pending", "waiting"];
        const aTop = topStatuses.includes(a.status) ? 0 : 1;
        const bTop = topStatuses.includes(b.status) ? 0 : 1;
        if (aTop !== bTop) return aTop - bTop;
        // ✅ ใหม่สุดบน (id มากกว่า = สร้างทีหลัง)
        // return b.id.localeCompare(a.id);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      // 🔹 reorder: pending/ waiting ขึ้นบน, others ล่าง
      // return updated.sort((a, b) => {
      //   const statusOrder = { pending: 0, waiting: 1, paid: 2, rejected: 3, cancelled: 4 };
      //   return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
      // });
    });
  } catch (err) {
    console.error(err);
    alert("Update status ไม่สำเร็จ: " + err.message);
  }
};  
  return (
    <div className="flex min-h-screen bg-white">
      
      {/* 2. Main Content */}
      <main className="flex-1 p-10 bg-[#FAFAFA]">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        {/* Status Cards - ตามแบบในภาพ */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "รอตรวจการชำระเงิน",
              val: stats.waiting
            },
            {
              label: "จำนวนคนจองวันนี้",
              val: stats.totalBookings
            },
            {
              label: "รายได้วันนี้",
              val: `฿${stats.todayRevenue.toLocaleString()}`
            },
            {
              label: "สนามที่ถูกจองวันนี้",
              val: stats.bookedCourts
            }
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm"
            >
              <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {card.val}
              </p>
            </div>
          ))}
        </div>

        {/* Table - ตามแบบในภาพ */}
        <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold">
              <tr>
                {/* <th className="p-4"><input type="checkbox" /></th> */}
                <th className="p-4 uppercase">Author ↓</th>
                <th className="p-4 uppercase">Type</th>
                <th className="p-4 uppercase">Court</th>
                <th className="p-4 uppercase">Time</th>
                <th className="p-4 uppercase">Receipt</th>
                <th className="p-4 uppercase">Payment status</th>
                <th className="p-4 uppercase text-center">Action</th>
                
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pendingBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  {/* <td className="p-4"><input type="checkbox" /></td> */}
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">👤</div>
                    <div>
                      <p className="font-bold text-gray-700">{b.user}</p>
                      <p className="text-[10px] text-gray-400">{b.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{b.type}</td>
                  <td className="p-4 text-gray-500">{b.court}</td>
                  <td className="p-4 text-gray-500">{b.time}</td>
                  <td className="p-4">
                    {b.receipt_url ? (
                      <button
                        onClick={() => window.open(b.receipt_url, "_blank")}
                        className="text-teal-500 font-bold hover:underline"
                      >
                        View
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs">No receipt</span>
                    )}
                  </td>
                  <td className="p-4">
                    {/* <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      b.status === 'Paid' ? 'bg-gray-100 text-gray-600' : 
                      b.status === 'Unpaid' ? 'bg-red-50 text-red-400' : 'bg-yellow-50 text-yellow-500'
                    }`}>
                      {b.status}
                    </span> */}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        // b.status === 'paid'
                        //   ? 'bg-green-50 text-green-600'
                        //   : b.status === 'waiting'
                        //   ? 'bg-yellow-50 text-yellow-600'
                        //   : 'bg-red-50 text-red-600'
                          b.status === 'paid'
                          ? 'bg-green-50 text-green-600'
                          : b.status === 'waiting'
                          ? 'bg-yellow-50 text-yellow-600'
                          : b.status === 'returned'
                          ? 'bg-blue-50 text-blue-600'
                          : b.status === 'rejected'
                          ? 'bg-red-50 text-red-600'
                          : b.status === 'cancelled'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {b.status}
                    </span>
                  </td>
                  {/* <td className="p-4">
                    {b.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateBookingStatus(b.id, "paid")}
                          className="px-3 py-1 text-[10px] font-bold bg-green-100 text-green-600 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateBookingStatus(b.id, "rejected")}
                          className="px-3 py-1 text-[10px] font-bold bg-red-100 text-red-600 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {b.status === "paid" && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600">
                        Approved
                      </span>
                    )}

                    {b.status === "rejected" && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600">
                        Rejected
                      </span>
                    )}

                    {b.status === "cancelled" && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                        Cancelled
                      </span>
                    )}
                  </td> */}
                  <td className="p-4 text-center">
                    {b.status === "waiting" && (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => updateBookingStatus(b.id, "paid")}
                          className="px-3 py-1 text-[10px] font-bold bg-green-100 text-green-600 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateBookingStatus(b.id, "rejected")}
                          className="px-3 py-1 text-[10px] font-bold bg-red-100 text-red-600 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {b.status === "paid" && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600">
                        Approved
                      </span>
                    )}

                    {b.status === "rejected" && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600">
                        Rejected
                      </span>
                    )}

                    {b.status === "returned" && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                        returned
                      </span>
                    )}
                    {/* {b.status === "cancelled"  && (
                      <div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                          Cancelled
                        </span>
                        {b.holdUntil && (
                          <span className="text-xs text-gray-500">
                            Payment deadline was: {new Date(b.holdUntil).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )} */}
                    {["pending", "cancelled"].includes(b.status) && (
                      <div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          b.status === "pending" ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-600"
                        }`}>
                          {b.status}
                        </span>
                        {b.holdUntil && (
                          <span className="text-xs text-gray-500 ">
                            Payment deadline: {new Date(b.holdUntil).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                    
                  </td>
                  {/* <td className="p-4 text-gray-300 font-bold">•••</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;