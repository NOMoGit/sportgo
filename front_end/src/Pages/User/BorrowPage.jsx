// import React, { useState } from 'react';

// const BorrowPage = () => {
//   // ข้อมูลอุปกรณ์ตัวอย่าง
//   const [equipments] = useState([
//     { id: 1, name: "ลูกฟุตบอล (Nike)", category: "ฟุตบอล", price: 20, stock: 10, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200" },
//     { id: 2, name: "ไม้แบตมินตัน (Yonex)", category: "แบตมินตัน", price: 50, stock: 8, image: "https://images.unsplash.com/photo-1613912305664-672462319200?w=200" },
//     { id: 3, name: "ลูกบาสเกตบอล", category: "บาสเกตบอล", price: 30, stock: 0, image: "https://images.unsplash.com/photo-1519861531153-f351f0a482aa?w=200" },
//   ]);

//   const [cart, setCart] = useState([]);

//   // ฟังก์ชันเพิ่มเข้าตะกร้า
//   const addToCart = (item) => {
//     if (item.stock === 0) return;
//     // เพิ่ม timestamp เล็กน้อยเพื่อให้ id ในตะกร้าไม่ซ้ำกันกรณีเพิ่มชิ้นเดิมซ้ำๆ
//     const itemWithUniqueId = { ...item, cartId: Date.now() + Math.random() };
//     setCart([...cart, itemWithUniqueId]);
//   };

//   // ฟังก์ชันลบออกจากตะกร้า (ใช้ cartId ในการระบุตัวที่จะลบ)
//   const removeFromCart = (cartId) => {
//     setCart(cart.filter(item => item.cartId !== cartId));
//   };

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       <h1 className="text-3xl font-bold mb-8 text-gray-800">ยืมอุปกรณ์กีฬา</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* รายการอุปกรณ์ */}
//         <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
//           {equipments.map(item => (
//             <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 transition-transform hover:scale-[1.02]">
//               <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
//               <div className="flex-1">
//                 <h3 className="font-bold text-gray-800">{item.name}</h3>
//                 <p className="text-sm text-gray-400">{item.category}</p>
//                 <div className="mt-2 flex justify-between items-center">
//                   <span className="text-teal-600 font-bold">฿{item.price} / ชิ้น</span>
//                   <span className={`text-xs font-medium ${item.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
//                     {item.stock > 0 ? `คงเหลือ ${item.stock}` : 'หมด'}
//                   </span>
//                 </div>
//                 <button 
//                   onClick={() => addToCart(item)}
//                   disabled={item.stock === 0}
//                   className="w-full mt-3 bg-teal-500 hover:bg-teal-600 text-white py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:bg-gray-300"
//                 >
//                   + เพิ่มรายการ
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* สรุปรายการยืม (Cart) */}
//         <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit sticky top-20">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-bold text-gray-800">รายการที่เลือก</h2>
//             <span className="bg-teal-100 text-teal-600 text-xs font-bold px-2.5 py-1 rounded-full">
//               {cart.length} ชิ้น
//             </span>
//           </div>

//           {cart.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="text-4xl mb-2">🛒</div>
//               <p className="text-gray-400 text-sm">ยังไม่มีรายการที่เลือก</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <div className="max-h-[400px] overflow-y-auto pr-2">
//                 {cart.map((item) => (
//                   <div key={item.cartId} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 group">
//                     <div className="flex flex-col">
//                       <span className="text-sm font-medium text-gray-700">{item.name}</span>
//                       <span className="text-xs text-teal-600 font-bold">฿{item.price}</span>
//                     </div>
//                     <button 
//                       onClick={() => removeFromCart(item.cartId)}
//                       className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
//                       title="ลบรายการนี้"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                       </svg>
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               <div className="pt-4 border-t-2 border-dashed border-gray-100">
//                 <div className="flex justify-between font-bold text-lg text-gray-800">
//                   <span>ยอดรวมมัดจำ</span>
//                   <span className="text-teal-600 underline decoration-teal-200 decoration-4">
//                     ฿{cart.reduce((sum, item) => sum + item.price, 0)}
//                   </span>
//                 </div>
//                 <button className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl mt-6 font-bold shadow-lg shadow-gray-200 transition-all active:scale-[0.98]">
//                   ยืนยันการยืม
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BorrowPage;







// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { supabase } from "../../supabaseClient";

// export default function BorrowPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { courtData, bookingTimes, courtAmount } = location.state || {};
  
//   const [equipments, setEquipments] = useState([]);
//   const [selectedEquips, setSelectedEquips] = useState({}); // { id: quantity }

//   useEffect(() => {
//     // ดึงอุปกรณ์ที่ตรงกับประเภทกีฬาของสนามที่จอง
//     const fetchEquip = async () => {
//       const { data } = await supabase
//         .from('equipments')
//         .eq('sport_type', courtData?.category);
//       setEquipments(data || []);
//     };
//     fetchEquip();
//   }, [courtData]);

//   const equipAmount = equipments.reduce((sum, item) => {
//     return sum + (item.price_per_unit * (selectedEquips[item.id] || 0));
//   }, 0);

//   const handleNext = () => {
//     navigate('/pay', { 
//       state: { 
//         ...location.state, 
//         equipItems: selectedEquips,
//         totalAmount: courtAmount + equipAmount // ราคาสุทธิสุดท้าย
//       } 
//     });
//   };

//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       <h1 className="text-3xl font-black mb-4">ยืมอุปกรณ์ (Option)</h1>
//       <p className="mb-6 text-gray-500">สำหรับกีฬา: {courtData?.category}</p>
      
//       <div className="grid gap-4 mb-8">
//         {equipments.map(item => (
//           <div key={item.id} className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border">
//             <div>
//               <p className="font-bold text-lg">{item.name}</p>
//               <p className="text-teal-600">฿{item.price_per_unit} / ชิ้น</p>
//             </div>
//             <input 
//               type="number" min="0" 
//               onChange={(e) => setSelectedEquips({...selectedEquips, [item.id]: parseInt(e.target.value) || 0})}
//               className="w-20 p-2 border rounded-xl text-center"
//               placeholder="0"
//             />
//           </div>
//         ))}
//       </div>

//       <div className="bg-gray-900 text-white p-6 rounded-2xl flex justify-between items-center">
//         <div>
//           <p className="text-sm opacity-70">ยอดรวมอุปกรณ์</p>
//           <p className="text-2xl font-bold">฿{equipAmount}</p>
//         </div>
//         <button onClick={handleNext} className="bg-teal-500 px-8 py-3 rounded-xl font-bold">ไปที่หน้าชำระเงิน</button>
//       </div>
//     </div>
//   );
// }











import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from "../../supabaseClient";

export default function BorrowPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // รับข้อมูลจากหน้า Booking (ถ้ามี)
  const { 
    courtData = null, 
    bookingTimes = [], 
    courtAmount = 0,
    bookingDate = null
} = location.state || {};
  
  const [equipments, setEquipments] = useState([]);
  const [selectedEquips, setSelectedEquips] = useState({});
  const [filter, setFilter] = useState(courtData?.category || "ทั้งหมด");
  
  const categories = ["ทั้งหมด", "ฟุตบอล", "แบดมินตัน", "บาสเกตบอล", "ปิงปอง", "วอลเลย์บอล"];

  const formatTimeRange = (times) => {
    if (!times || times.length === 0) return "";

    // 1. เรียงลำดับเวลาจากน้อยไปมาก
    const sortedTimes = [...times].sort((a, b) => {
      return parseInt(a.split(":")[0]) - parseInt(b.split(":")[0]);
    });

    let ranges = [];
    let currentRange = null;

    sortedTimes.forEach((timeStr) => {
      const [start, end] = timeStr.split(" - ");
      
      if (!currentRange) {
        currentRange = { start, end };
      } else {
        // 2. เช็คว่าเวลาเริ่มต้นของอันนี้ ตรงกับเวลาสิ้นสุดของอันก่อนหน้าหรือไม่ (ต่อเนื่องกัน)
        if (start === currentRange.end) {
          currentRange.end = end; // ขยายช่วงเวลาออกไป
        } else {
          // 3. ถ้าไม่ต่อเนื่อง ให้เก็บช่วงเก่าแล้วเริ่มช่วงใหม่
          ranges.push(`${currentRange.start} - ${currentRange.end}`);
          currentRange = { start, end };
        }
      }
    });
    
    if (currentRange) {
      ranges.push(`${currentRange.start} - ${currentRange.end}`);
    }

    return ranges.join(", "); // จะได้ผลลัพธ์เช่น "09:00 - 11:00, 14:00 - 15:00"
  };
  
  // useEffect(() => {
  //   const fetchEquip = async () => {
  //     let query = supabase.from('equipments').select('*');
  //     if (filter !== "ทั้งหมด") {
  //       query = query.eq('sport_type', filter.trim());
  //     }
  //     const { data, error } = await query;
  //     if (error) return console.error(error);
  //     setEquipments(data || []);
  //   };
  //   fetchEquip();
  // }, [filter]);
  // useEffect(() => {
  //   const channel = supabase
  //     .channel('realtime-equipments')
  //     .on(
  //       'postgres_changes',
  //       { event: '*', schema: 'public', table: 'equipments' },
  //       (payload) => {
  //         setEquipments(prev =>
  //           prev.map(e =>
  //             e.id === payload.new.id ? payload.new : e
  //           )
  //         );
  //       }
  //     )
  //     .subscribe();

  //   return () => supabase.removeChannel(channel);
  // }, []);
  useEffect(() => {
  const fetchEquip = async () => {
    let query = supabase.from('equipments').select('*');
    if (filter !== "ทั้งหมด") {
      query = query.eq('sport_type', filter.trim());
    }
    const { data, error } = await query;
    if (!error) setEquipments(data || []);
  };

  fetchEquip();

  const channel = supabase
    .channel('realtime-equipments')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'equipments' },
      () => fetchEquip()
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [filter]);
  // const updateQuantity = (id, delta) => {
  //   setSelectedEquips(prev => ({
  //     ...prev,
  //     [id]: Math.max(0, (prev[id] || 0) + delta)
  //   }));
  // };
  useEffect(() => {
    setSelectedEquips(prev => {
      const updated = { ...prev };

      equipments.forEach(item => {
        if (updated[item.id] > item.stock) {
          if (item.stock === 0) {
            delete updated[item.id];
          } else {
            updated[item.id] = item.stock;
          }
        }
      });

      return updated;
    });
  }, [equipments]);
  // const updateQuantity = (item, delta) => {
  //   setSelectedEquips(prev => {
  //     const currentQty = prev[item.id] || 0;
  //     const newQty = currentQty + delta;

  //     if (newQty < 0) return prev;

  //     // ❗ เช็ก stock
  //     if (newQty > item.stock) {
  //       alert("อุปกรณ์ไม่เพียงพอ");
  //       return prev;
  //     }

  //     return {
  //       ...prev,
  //       [item.id]: newQty
  //     };
  //   });
  // };
  const updateQuantity = (item, delta) => {
  setSelectedEquips(prev => {
    const current = prev[item.id] || {
      id: item.id,
      qty: 0,
      price: Number(item.price_per_unit),
      name: item.name
    };

    const newQty = current.qty + delta;
    if (newQty < 0) return prev;
    if (newQty > item.stock) {
      alert("อุปกรณ์ไม่เพียงพอ");
      return prev;
    }

    return {
      ...prev,
      [item.id]: { ...current, qty: newQty }
    };
  });
};

  // กรองรายการที่เลือกจริงเพื่อนำมาแสดงในแถบสรุป
  // const cartItems = equipments
  //   .filter(e => selectedEquips[e.id] > 0)
  //   .map(e => ({ ...e, qty: selectedEquips[e.id] }));
  const cartItems = Object.values(selectedEquips).filter(i => i.qty > 0);
  // const equipTotal = cartItems.reduce((sum, item) => sum + (item.price_per_unit * item.qty), 0);
  const equipTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const grandTotal = (courtAmount || 0) + equipTotal;

  const today = new Date().toISOString().slice(0, 10);
  const safeBookingDate =
  bookingDate && bookingDate !== ""
    ? bookingDate
    : today;
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-40">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ส่วนเลือกอุปกรณ์ (Left Side) */}
        <div className="lg:col-span-2">
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">เลือกยืมอุปกรณ์</h1>
            <div className="flex overflow-x-auto gap-2 mt-4 no-scrollbar">
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-2 rounded-full font-bold whitespace-nowrap transition-all ${filter === cat ? "bg-teal-600 text-white shadow-md" : "bg-white text-gray-600 border"}`}>{cat}</button>
              ))}
            </div>
          </header>

          <div className="grid gap-4">
            {equipments.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                <img src={item.image_url || 'https://via.placeholder.com/100'} className="w-20 h-20 object-cover rounded-2xl bg-gray-50" alt="" />
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <p className="text-teal-600 font-bold text-sm">฿{item.price_per_unit}</p>
                </div>
                <div className="flex items-center bg-gray-50 rounded-xl p-1 gap-3">
                  {/* <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold">－</button> */}
                  <button onClick={() => updateQuantity(item, -1)} className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold">－</button>

                  {/* <span className="w-4 text-center font-bold">{selectedEquips[item.id] || 0}</span> */}
                  <span className="w-4 text-center font-bold">
                    {selectedEquips[item.id]?.qty || 0}
                  </span>
                  {/* <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold">＋</button> */}
                  <button onClick={() => updateQuantity(item, 1)} className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold">＋</button>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ส่วนสรุปรายการ (Right Side - Summary) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 sticky top-8">
            <h2 className="text-xl font-black mb-4 flex justify-between">
              รายการที่เลือก <span>{cartItems.length + (courtData ? 1 : 0)}</span>
            </h2>
            
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
              {/* ถ้ามีการจองสนามมา ให้โชว์ค่าสนาม */}
              {courtData && (
                <div className="flex justify-between items-start text-sm bg-teal-50 p-3 rounded-xl border border-teal-100">
                  <div>
                    <p className="font-bold text-teal-800">สนาม: {courtData.name}</p>
                    {/* <p className="text-xs text-teal-600">{bookingTimes.length} ชม. ({bookingTimes.join(' , ')})</p> */}
                    <div className="text-xs text-teal-600 flex flex-wrap gap-1 items-center">
                      <span className="font-bold">เวลา:</span>
                      {formatTimeRange(bookingTimes).split(', ').map((range, index) => (
                        <span key={index} className="bg-teal-200/50 px-2 py-0.5 rounded-md">
                          {range}
                        </span>
                      ))}
                      <span className="ml-1 text-[10px] opacity-70">({bookingTimes.length} ชม.)</span>
                    </div>
                  </div>
                  <p className="font-bold text-teal-800">฿{courtAmount.toLocaleString()}</p>

                </div>
              )}

              {/* รายการอุปกรณ์ที่เลือก */}
              {/* {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm p-2 border-b border-gray-50">
                  <p className="text-gray-600">{item.name} <span className="font-bold text-gray-900">x{item.qty}</span></p>
                  <p className="font-bold text-gray-800">฿{(item.price_per_unit * item.qty).toLocaleString()}</p>
                </div>
              ))} */}
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm p-2 border-b border-gray-50">
                  <p className="font-bold text-gray-900">
                    {item.name} <span className="font-bold">x{item.qty}</span>
                  </p>
                  <p className="font-bold">
                    ฿{(item.price * item.qty).toLocaleString()}
                  </p>
                </div>
              ))}
              {cartItems.length === 0 && !courtData && (
                <p className="text-center text-gray-400 py-10 italic">ยังไม่มีรายการที่เลือก</p>
              )}
            </div>

            <div className="border-t-2 border-dashed pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>ยอดรวมอุปกรณ์</span>
                <span>฿{equipTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-2xl font-black text-gray-900 pt-2">
                <span>ยอดสุทธิ</span>
                <span className="text-teal-600">฿{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              disabled={grandTotal === 0}
              onClick={() => {
                if (!safeBookingDate) {
                  alert("ไม่พบวันที่จอง กรุณาเลือกวันที่ใหม่");
                  return;
                }

                navigate('/pay', {
                  state: {
                    ...location.state,
                    bookingDate: safeBookingDate,
                    selectedEquipments: cartItems,
                    totalAmount: grandTotal
                  }
                });
              }}
              className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-bold mt-6 transition-all disabled:bg-gray-200"
            >
              ไปหน้าชำระเงิน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}