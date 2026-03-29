// import React, { useState, useEffect, useRef  } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { supabase } from "../../supabaseClient";

// const getLocalDateString = () => {
//   const date = new Date();
//   const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
//   return localDate.toISOString().split('T')[0];
// };

// export default function BorrowPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   const { 
//     bookingId,
//     courtData = null, 
//     bookingTimes = [], 
//     courtAmount = 0,
//     bookingDate = null
//   } = location.state || {};
  
//   const [equipments, setEquipments] = useState([]);
//   const [selectedEquips, setSelectedEquips] = useState({});
//   const [filter, setFilter] = useState(courtData?.category || "ทั้งหมด");
  
//   const categories = ["ทั้งหมด", "ฟุตบอล", "แบดมินตัน", "บาสเกตบอล", "ปิงปอง", "วอลเลย์บอล"];

//   const holdUntil = location.state?.holdUntil; 
//   const [timeLeft, setTimeLeft] = useState("");
//   const courtDataRef = useRef(courtData);
//   useEffect(() => {
//     if (!holdUntil) return;

//     const interval = setInterval(() => {
//       const now = new Date().getTime();
//       const expireTime = new Date(holdUntil).getTime();
//       const distance = expireTime - now;

//       if (distance <= 0) {
//         clearInterval(interval);
//         setTimeLeft("00:00");
//         alert("เวลาในการทำรายการหมดแล้ว ระบบได้ยกเลิกคิวของคุณ กรุณาทำรายการใหม่ครับ");
//         navigate('/booking');
//       } else {
//         const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//         const seconds = Math.floor((distance % (1000 * 60)) / 1000);
//         setTimeLeft(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [holdUntil, navigate]);

//   const formatTimeRange = (times) => {
//     if (!times || times.length === 0) return "";

//     const sortedTimes = [...times].sort((a, b) => {
//       return parseInt(a.split(":")[0]) - parseInt(b.split(":")[0]);
//     });

//     let ranges = [];
//     let currentRange = null;

//     sortedTimes.forEach((timeStr) => {
//       const [start, end] = timeStr.split(" - ");
      
//       if (!currentRange) {
//         currentRange = { start, end };
//       } else {
//         if (start === currentRange.end) {
//           currentRange.end = end;
//         } else {
//           ranges.push(`${currentRange.start} - ${currentRange.end}`);
//           currentRange = { start, end };
//         }
//       }
//     });
    
//     if (currentRange) {
//       ranges.push(`${currentRange.start} - ${currentRange.end}`);
//     }

//     return ranges.join(", ");
//   };
  
  

//   useEffect(() => {
//     const fetchEquip = async () => {
//       let query = supabase.from('equipments').select('*');
//       if (filter !== "ทั้งหมด") {
//         query = query.eq('sport_type', filter.trim());
//       }
//       const { data, error } = await query;
//       if (!error) setEquipments(data || []);
//     };

//     fetchEquip();

//     const channel = supabase
//       .channel('realtime-equipments')
//       .on(
//         'postgres_changes',
//         { event: '*', schema: 'public', table: 'equipments' },
//         () => fetchEquip()
//       )
//       .subscribe();

//     return () => supabase.removeChannel(channel);
//   }, [filter]);

//   useEffect(() => {
//     setSelectedEquips(prev => {
//       const updated = { ...prev };

//       equipments.forEach(item => {
//         if (updated[item.id] && updated[item.id].qty > item.stock) {
//           if (item.stock === 0) {
//             delete updated[item.id];
//           } else {
//             updated[item.id] = { ...updated[item.id], qty: item.stock };
//           }
//         }
//       });

//       return updated;
//     });
//   }, [equipments]);

//   const updateQuantity = (item, delta) => {
//     setSelectedEquips(prev => {
//       const current = prev[item.id] || {
//         id: item.id,
//         qty: 0,
//         price: Number(item.price_per_unit),
//         name: item.name
//       };

//       const newQty = current.qty + delta;
//       if (newQty < 0) return prev;
//       if (newQty > item.stock) {
//         alert("อุปกรณ์ไม่เพียงพอ");
//         return prev;
//       }

//       return {
//         ...prev,
//         [item.id]: { ...current, qty: newQty }
//       };
//     });
//   };

//   const cartItems = Object.values(selectedEquips).filter(i => i.qty > 0);
//   const equipTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
//   const grandTotal = (courtAmount || 0) + equipTotal;

//   const today = getLocalDateString();
//   const safeBookingDate = bookingDate && bookingDate !== "" ? bookingDate : today;

//   const handleCheckout = async () => {
//     if (!safeBookingDate) {
//       alert("ไม่พบวันที่จอง กรุณาเลือกวันที่ใหม่");
//       return;
//     }

//     let finalBookingId = bookingId;
//     let finalHoldUntil = holdUntil; // ✅ ค่าเดิมจากจองสนาม

//     if (!finalBookingId) {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session) {
//         alert("กรุณาเข้าสู่ระบบก่อนทำรายการ");
//         navigate('/login');
//         return;
//       }

//       const { data: newBooking, error } = await supabase
//         .from("bookings")
//         .insert([{
//           user_id: session.user.id,
//           court_id: null,
//           booking_date: safeBookingDate,
//           total_price: grandTotal,
//           status: "pending",
//           hold_until: new Date(Date.now() + 5 * 60 * 1000).toISOString()
//         }])
//         .select()
//         .single();

//       if (error) {
//         alert("เกิดข้อผิดพลาด: " + error.message);
//         return;
//       }

//       finalBookingId = newBooking.id;
//       finalHoldUntil = newBooking.hold_until; // ✅ เก็บไว้ใน scope นี้
//     }

//     navigate('/pay', {
//       state: {
//         bookingId: finalBookingId,
//         courtData,
//         bookingTimes,
//         bookingDate: safeBookingDate,
//         selectedEquipments: cartItems,
//         holdUntil: finalHoldUntil, 
//         totalAmount: grandTotal
//       }
//     });
//   };

//   useEffect(() => {
//     courtDataRef.current = courtData;
//   }, [courtData]);

//   useEffect(() => {
//     const channel = supabase
//       .channel("realtime-borrow-courts")
//       .on(
//         "postgres_changes",
//         { event: "UPDATE", schema: "public", table: "courts" },
//         (payload) => {
//           console.log("🏟️ Court update payload:", payload);
//           console.log("🏟️ courtDataRef.current:", courtDataRef.current);
//           console.log("🏟️ payload.new.id:", payload.new.id);
//           console.log("🏟️ payload.new.is_available:", payload.new.is_available);

//           if (
//             payload.new.is_available === false &&
//             courtDataRef.current?.id === payload.new.id
//           ) {
//             console.log("❌ navigate จาก: court ถูกปิด");
//             alert("⚠️ สนามที่คุณจองถูกปิดปรับปรุง กรุณาติดต่อแอดมิน");
//             navigate('/booking');
//           }
//         }
//       )
//       .subscribe();

//     return () => supabase.removeChannel(channel);
//   }, []);
//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-40">
//       <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         <div className="lg:col-span-2">
//           <header className="mb-8">
//             <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">เลือกยืมอุปกรณ์</h1>
//             <div className="flex overflow-x-auto gap-2 mt-4 no-scrollbar">
//               {categories.map(cat => (
//                 <button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${filter === cat ? "bg-[#003E77] text-white shadow-md" : "bg-white text-gray-600 shadow-sm"}`}>{cat}</button>
//               ))}
//             </div>
//           </header>

//           <div className="grid gap-4">
//             {equipments.map(item => {
//               const qty = selectedEquips[item.id]?.qty || 0;
//               const isOutOfStock = item.stock === 0;
//               const isMaxQty = qty >= item.stock;

//               return (
//                 <div key={item.id} className={`bg-white p-4 rounded-3xl shadow-sm border transition-all flex items-center gap-4 ${isOutOfStock ? "border-red-100 opacity-60" : "border-gray-100"}`}>
//                   <img src={item.image_url || 'https://via.placeholder.com/100'} className="w-20 h-20 object-cover rounded-2xl bg-gray-50 flex-shrink-0" alt="" />
                  
//                   <div className="flex-grow">
//                     <h3 className="font-bold text-gray-800">{item.name}</h3>
//                     <p className="text-teal-600 font-bold text-sm">฿{item.price_per_unit}</p>
//                     {isOutOfStock ? (
//                       <span className="inline-block mt-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
//                         หมดแล้ว
//                       </span>
//                     ) : (
//                       <span className="inline-block mt-1 text-xs text-gray-400">
//                         เหลือ {item.stock - qty} ชิ้น
//                       </span>
//                     )}
//                   </div>

//                   {isOutOfStock ? (
//                     <div className="px-4 py-2 rounded-xl bg-red-50 text-red-400 text-xs font-bold whitespace-nowrap">
//                       Out of stock
//                     </div>
//                   ) : (
//                     <div className="flex items-center bg-gray-50 rounded-xl p-1 gap-3">
//                       <button
//                         onClick={() => updateQuantity(item, -1)}
//                         disabled={qty === 0}
//                         className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition"
//                       >
//                         －
//                       </button>
//                       <span className="w-4 text-center font-bold">{qty}</span>
//                       <button
//                         onClick={() => updateQuantity(item, 1)}
//                         disabled={isMaxQty}
//                         className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition"
//                       >
//                         ＋
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* ส่วนสรุปรายการ (Right Side) */}
//         <div className="lg:col-span-1">
//           <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 sticky top-8">
//             <h2 className="text-xl font-black mb-4 flex justify-between">
//               รายการที่เลือก <span>{cartItems.length + (courtData ? 1 : 0)}</span>
//             </h2>
            
//             <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
//               {courtData && (
//                 <div className="flex justify-between items-start text-sm bg-[#003E77]/20 p-3 rounded-xl border border-teal-100">
//                   <div>
//                     <p className="font-bold text-gray-700">สนาม: {courtData.name}</p>
//                     <div className="text-xs text-gray-700 flex flex-wrap gap-1 items-center">
//                       <span className="font-bold">เวลา:</span>
//                       {formatTimeRange(bookingTimes).split(', ').map((range, index) => (
//                         <span key={index} className="bg-[#003E77]/50 px-2 py-0.5 rounded-md text-white">
//                           {range}
//                         </span>
//                       ))}
//                       <span className="ml-1 text-[10px] opacity-70">({bookingTimes.length} ชม.)</span>
//                     </div>
//                   </div>
//                   <p className="font-bold text-gray-700">฿{courtAmount.toLocaleString()}</p>
//                 </div>
//               )}

//               {cartItems.map(item => (
//                 <div key={item.id} className="flex justify-between text-sm p-2 border-b border-gray-50">
//                   <p className="font-bold text-gray-900">
//                     {item.name} <span className="font-bold">x{item.qty}</span>
//                   </p>
//                   <p className="font-bold">
//                     ฿{(item.price * item.qty).toLocaleString()}
//                   </p>
//                 </div>
//               ))}

//               {cartItems.length === 0 && !courtData && (
//                 <p className="text-center text-gray-400 py-10 italic">ยังไม่มีรายการที่เลือก</p>
//               )}
//             </div>

//             <div className="border-t-2 border-dashed pt-4 space-y-2">
//               <div className="flex justify-between text-sm text-gray-500">
//                 <span>ยอดรวมอุปกรณ์</span>
//                 <span>฿{equipTotal.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between text-2xl font-black text-gray-900 pt-2">
//                 <span>ยอดสุทธิ</span>
//                 <span className="text-teal-600">฿{grandTotal.toLocaleString()}</span>
//               </div>
//             </div>

//             {holdUntil && (
//               <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mt-3 flex justify-between items-center">
//                 <span className="font-bold">กรุณาทำรายการภายในเวลา</span>
//                 <span className="text-xl font-black">{timeLeft}</span>
//               </div>
//             )}

//             <button 
//               disabled={grandTotal === 0}
//               onClick={handleCheckout}
//               className="w-full bg-[#003E77] hover:bg-blue-700 text-white py-4 rounded-2xl font-bold mt-6 transition-all disabled:bg-gray-200"
//             >
//               ไปหน้าชำระเงิน
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }







import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from "../../supabaseClient";

const getLocalDateString = () => {
  const date = new Date();
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return localDate.toISOString().split('T')[0];
};

export default function BorrowPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    bookingId,
    courtData = null,
    bookingTimes = [],
    courtAmount = 0,
    bookingDate = null
  } = location.state || {};

  const [equipments, setEquipments] = useState([]);
  const [selectedEquips, setSelectedEquips] = useState({});
  const [filter, setFilter] = useState(courtData?.category || "ทั้งหมด");
  const [usedStockMap, setUsedStockMap] = useState({});

  const categories = ["ทั้งหมด", "ฟุตบอล", "แบดมินตัน", "บาสเกตบอล", "ปิงปอง", "วอลเลย์บอล"];

  const holdUntil = location.state?.holdUntil;
  const [timeLeft, setTimeLeft] = useState("");
  const courtDataRef = useRef(courtData);

  const today = getLocalDateString();
  const safeBookingDate = bookingDate && bookingDate !== "" ? bookingDate : today;

  // --- Countdown ---
  useEffect(() => {
    if (!holdUntil) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expireTime = new Date(holdUntil).getTime();
      const distance = expireTime - now;
      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft("00:00");
        alert("เวลาในการทำรายการหมดแล้ว ระบบได้ยกเลิกคิวของคุณ กรุณาทำรายการใหม่ครับ");
        navigate('/booking');
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [holdUntil, navigate]);

  // --- Format time ---
  const formatTimeRange = (times) => {
    if (!times || times.length === 0) return "";
    const sortedTimes = [...times].sort((a, b) => parseInt(a.split(":")[0]) - parseInt(b.split(":")[0]));
    let ranges = [];
    let currentRange = null;
    sortedTimes.forEach((timeStr) => {
      const [start, end] = timeStr.split(" - ");
      if (!currentRange) { currentRange = { start, end }; }
      else if (start === currentRange.end) { currentRange.end = end; }
      else { ranges.push(`${currentRange.start} - ${currentRange.end}`); currentRange = { start, end }; }
    });
    if (currentRange) ranges.push(`${currentRange.start} - ${currentRange.end}`);
    return ranges.join(", ");
  };

  // --- Fetch used stock ตาม time slot และวันที่ ---
  const fetchUsedStock = async () => {
    if (!bookingTimes || bookingTimes.length === 0 || !safeBookingDate) return;

    // 1. หา booking_ids ที่ time_slot และ booking_date ตรงกัน
    const { data: slots } = await supabase
      .from('booking_time_slots')
      .select('booking_id')
      .in('time_slot', bookingTimes)
      .eq('booking_date', safeBookingDate);

    if (!slots || slots.length === 0) {
      setUsedStockMap({});
      return;
    }

    const bookingIds = [...new Set(slots.map(s => s.booking_id))];

    // 2. กรองเฉพาะ booking ที่ active
    const { data: activeBookings } = await supabase
      .from('bookings')
      .select('id')
      .in('id', bookingIds)
      .in('status', ['paid', 'pending']);

    if (!activeBookings || activeBookings.length === 0) {
      setUsedStockMap({});
      return;
    }

    const activeIds = activeBookings.map(b => b.id);

    // 3. ดึง equipment ที่ถูกใช้ไปแล้ว
    const { data: usedEquips } = await supabase
      .from('booking_equipments')
      .select('equipment_id, quantity')
      .in('booking_id', activeIds);

    // 4. รวม qty ต่อ equipment_id
    const map = {};
    usedEquips?.forEach(e => {
      map[e.equipment_id] = (map[e.equipment_id] || 0) + e.quantity;
    });

    setUsedStockMap(map);
  };

  // --- Fetch equipments + realtime ---
  useEffect(() => {
    const fetchEquip = async () => {
      let query = supabase.from('equipments').select('*');
      if (filter !== "ทั้งหมด") query = query.eq('sport_type', filter.trim());
      const { data, error } = await query;
      if (!error) setEquipments(data || []);
    };

    fetchEquip();

    const channel = supabase
      .channel('realtime-equipments')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'equipments' },
        () => fetchEquip()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [filter]);

  // --- Fetch used stock + realtime ---
  useEffect(() => {
    fetchUsedStock();

    const channel = supabase
      .channel('realtime-used-stock')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'booking_equipments' },
        () => fetchUsedStock()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [bookingTimes, safeBookingDate]);

  // --- ป้องกัน qty เกิน realStock เมื่อ stock เปลี่ยน ---
  useEffect(() => {
    setSelectedEquips(prev => {
      const updated = { ...prev };
      equipments.forEach(item => {
        const usedQty = usedStockMap[item.id] || 0;
        const realStock = item.stock - usedQty;
        if (updated[item.id] && updated[item.id].qty > realStock) {
          if (realStock <= 0) delete updated[item.id];
          else updated[item.id] = { ...updated[item.id], qty: realStock };
        }
      });
      return updated;
    });
  }, [equipments, usedStockMap]);

  // --- Update quantity ---
  const updateQuantity = (item, delta) => {
    setSelectedEquips(prev => {
      const current = prev[item.id] || {
        id: item.id, qty: 0,
        price: Number(item.price_per_unit),
        name: item.name
      };
      const newQty = current.qty + delta;
      if (newQty < 0) return prev;

      const usedQty = usedStockMap[item.id] || 0;
      const realStock = item.stock - usedQty;
      if (newQty > realStock) {
        alert("อุปกรณ์ไม่เพียงพอในช่วงเวลานี้");
        return prev;
      }
      return { ...prev, [item.id]: { ...current, qty: newQty } };
    });
  };

  const cartItems = Object.values(selectedEquips).filter(i => i.qty > 0);
  const equipTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const grandTotal = (courtAmount || 0) + equipTotal;

  // --- Checkout ---
  const handleCheckout = async () => {
    if (!safeBookingDate) {
      alert("ไม่พบวันที่จอง กรุณาเลือกวันที่ใหม่");
      return;
    }

    let finalBookingId = bookingId;
    let finalHoldUntil = holdUntil;

    if (!finalBookingId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("กรุณาเข้าสู่ระบบก่อนทำรายการ");
        navigate('/login');
        return;
      }

      const { data: newBooking, error } = await supabase
        .from("bookings")
        .insert([{
          user_id: session.user.id,
          court_id: null,
          booking_date: safeBookingDate,
          total_price: grandTotal,
          status: "pending",
          hold_until: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        }])
        .select()
        .single();

      if (error) {
        alert("เกิดข้อผิดพลาด: " + error.message);
        return;
      }

      finalBookingId = newBooking.id;
      finalHoldUntil = newBooking.hold_until;
    }

    navigate('/pay', {
      state: {
        bookingId: finalBookingId,
        courtData,
        bookingTimes,
        bookingDate: safeBookingDate,
        selectedEquipments: cartItems,
        holdUntil: finalHoldUntil,
        totalAmount: grandTotal
      }
    });
  };

  // --- Realtime court closed ---
  useEffect(() => {
    courtDataRef.current = courtData;
  }, [courtData]);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-borrow-courts")
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "courts" },
        (payload) => {
          if (payload.new.is_available === false && courtDataRef.current?.id === payload.new.id) {
            alert("⚠️ สนามที่คุณจองถูกปิดปรับปรุง กรุณาติดต่อแอดมิน");
            navigate('/booking');
          }
        })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-40">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ---- LEFT: Equipment list ---- */}
        <div className="lg:col-span-2">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">เลือกยืมอุปกรณ์</h1>
            <div className="flex overflow-x-auto gap-2 mt-4 no-scrollbar pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                    filter === cat
                      ? "bg-[#003E77] text-white"
                      : "bg-white text-gray-500 border border-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </header>

          <div className="grid gap-3">
            {equipments.map(item => {
              const usedQty = usedStockMap[item.id] || 0;
              const realStock = item.stock - usedQty;
              const qty = selectedEquips[item.id]?.qty || 0;
              const isOutOfStock = realStock <= 0;
              const isMaxQty = qty >= realStock;

              return (
                <div
                  key={item.id}
                  className={`bg-white p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                    isOutOfStock ? "border-red-100 opacity-55" : "border-gray-100"
                  }`}
                >
                  <img
                    src={item.image_url || 'https://via.placeholder.com/100'}
                    className="w-16 h-16 object-cover rounded-xl bg-gray-50 flex-shrink-0"
                    alt=""
                  />

                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                    <p className="text-teal-600 font-bold text-sm mt-0.5">฿{item.price_per_unit}</p>
                    {isOutOfStock ? (
                      <span className="inline-block mt-1 text-xs font-semibold text-red-400 bg-red-50 px-2 py-0.5 rounded-md">
                        หมดในช่วงเวลานี้
                      </span>
                    ) : (
                      <span className="inline-block mt-1 text-xs text-gray-400">
                        เหลือ {realStock - qty} ชิ้น
                      </span>
                    )}
                  </div>

                  {isOutOfStock ? (
                    <div className="px-3 py-1.5 rounded-lg bg-red-50 text-red-300 text-xs font-semibold whitespace-nowrap">
                      หมดสต็อก
                    </div>
                  ) : (
                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-1 gap-2">
                      <button
                        onClick={() => updateQuantity(item, -1)}
                        disabled={qty === 0}
                        className="w-8 h-8 bg-white rounded-lg border border-gray-100 font-bold text-gray-500 disabled:opacity-25 disabled:cursor-not-allowed transition text-sm"
                      >
                        −
                      </button>
                      <span className="w-5 text-center font-bold text-gray-800 text-sm">{qty}</span>
                      <button
                        onClick={() => updateQuantity(item, 1)}
                        disabled={isMaxQty}
                        className="w-8 h-8 bg-white rounded-lg border border-gray-100 font-bold text-gray-500 disabled:opacity-25 disabled:cursor-not-allowed transition text-sm"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---- RIGHT: Summary ---- */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 sticky top-8">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-gray-900">รายการที่เลือก</h2>
              <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg">
                {cartItems.length + (courtData ? 1 : 0)} รายการ
              </span>
            </div>

            <div className="space-y-2 mb-5 max-h-60 overflow-y-auto pr-1">
              {courtData && (
                <div className="bg-[#003E77]/8 border border-[#003E77]/10 p-3 rounded-xl">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-800 text-sm">สนาม: {courtData.name}</p>
                    <p className="font-bold text-gray-800 text-sm ml-3 whitespace-nowrap">
                      {courtAmount > 0 ? `฿${courtAmount.toLocaleString()}` : 'จองแล้ว'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                    {formatTimeRange(bookingTimes).split(', ').map((range, index) => (
                      <span key={index} className="bg-[#003E77] text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                        {range}
                      </span>
                    ))}
                    <span className="text-xs text-gray-400 ml-0.5">{bookingTimes.length} ชม.</span>
                  </div>
                </div>
              )}

              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                  <p className="text-gray-700 font-medium">
                    {item.name}
                    <span className="text-gray-400 font-normal ml-1">×{item.qty}</span>
                  </p>
                  <p className="font-semibold text-gray-800">฿{(item.price * item.qty).toLocaleString()}</p>
                </div>
              ))}

              {cartItems.length === 0 && !courtData && (
                <p className="text-center text-gray-300 py-8 text-sm">ยังไม่มีรายการที่เลือก</p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>ยอดรวมอุปกรณ์</span>
                <span>฿{equipTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-semibold text-gray-800">ยอดสุทธิ</span>
                <span className="text-2xl font-black text-teal-600">฿{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Countdown */}
            {holdUntil && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl mt-4 flex justify-between items-center">
                <span className="font-semibold text-sm">ทำรายการภายใน</span>
                <span className="text-xl font-black tabular-nums">{timeLeft}</span>
              </div>
            )}

            {/* CTA */}
            <button
              disabled={grandTotal === 0}
              onClick={handleCheckout}
              className="w-full bg-[#003E77] hover:bg-blue-800 active:scale-[0.98] text-white py-3.5 rounded-xl font-bold text-sm mt-4 transition-all disabled:bg-gray-100 disabled:text-gray-300"
            >
              ไปหน้าชำระเงิน
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}